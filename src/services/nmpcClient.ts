import type { NMPCSearchResult, NMPCLookupResult, NMPCConceptProperty } from '../types/ehds';

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export class NMPCClient {
  private baseUrl: string;
  private tokenEndpoint: string;
  private clientId: string;
  private clientSecret: string;
  private accessToken: string | null = null;
  private tokenExpiresAt = 0;

  constructor(baseUrl: string, tokenEndpoint: string, clientId: string, clientSecret: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.tokenEndpoint = tokenEndpoint;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  /**
   * Discover the OAuth2 token endpoint from the FHIR server.
   * Tries .well-known/smart-configuration first, then falls back to
   * the CapabilityStatement security extensions.
   */
  static async discoverTokenEndpoint(baseUrl: string): Promise<string | null> {
    const base = baseUrl.replace(/\/+$/, '');

    // 1. Try SMART well-known configuration
    try {
      const resp = await fetch(`${base}/.well-known/smart-configuration`, {
        headers: { 'Accept': 'application/json' },
      });
      if (resp.ok) {
        const smart = await resp.json() as { token_endpoint?: string };
        if (smart.token_endpoint) return smart.token_endpoint;
      }
    } catch { /* ignore */ }

    // 2. Try CapabilityStatement security extensions
    try {
      const resp = await fetch(`${base}/metadata`, {
        headers: { 'Accept': 'application/fhir+json' },
      });
      if (resp.ok) {
        const cap = await resp.json() as {
          rest?: {
            security?: {
              extension?: {
                url?: string;
                extension?: { url?: string; valueUri?: string }[];
              }[];
            };
          }[];
        };
        for (const rest of cap.rest ?? []) {
          for (const ext of rest.security?.extension ?? []) {
            if (ext.url === 'http://fhir-registry.smarthealthit.org/StructureDefinition/oauth-uris') {
              for (const inner of ext.extension ?? []) {
                if (inner.url === 'token' && inner.valueUri) return inner.valueUri;
              }
            }
          }
        }
      }
    } catch { /* ignore */ }

    return null;
  }

  /** Resolved token endpoint (available after construction or discovery) */
  getTokenEndpoint(): string {
    return this.tokenEndpoint;
  }

  private async getAccessToken(): Promise<string> {
    // Reuse cached token if still valid (with 30s buffer)
    if (this.accessToken && Date.now() < this.tokenExpiresAt - 30_000) {
      return this.accessToken;
    }

    if (!this.tokenEndpoint) {
      throw new Error('No token endpoint configured. Enter it manually or check that the FHIR server advertises one.');
    }

    const body = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: this.clientId,
      client_secret: this.clientSecret,
    });

    const response = await fetch(this.tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`Token request failed: ${response.status} - ${text}`);
    }

    const data = (await response.json()) as TokenResponse;
    this.accessToken = data.access_token;
    this.tokenExpiresAt = Date.now() + data.expires_in * 1000;
    return this.accessToken;
  }

  private async request(path: string, params?: Record<string, string>): Promise<unknown> {
    const url = new URL(`${this.baseUrl}${path}`);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, value);
      }
    }

    const token = await this.getAccessToken();
    const headers: Record<string, string> = {
      'Accept': 'application/fhir+json',
      'Authorization': `Bearer ${token}`,
    };

    const response = await fetch(url.toString(), { headers });
    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`FHIR request failed: ${response.status} ${response.statusText} - ${text}`);
    }
    return response.json();
  }

  async getMetadata(): Promise<{ serverName: string; fhirVersion: string; codeSystems: string[] }> {
    const data = await this.request('/metadata') as {
      software?: { name?: string };
      fhirVersion?: string;
      rest?: { resource?: { type: string; searchParam?: unknown[] }[] }[];
    };

    const codeSystems: string[] = [];
    if (data.rest) {
      for (const rest of data.rest) {
        if (rest.resource) {
          for (const r of rest.resource) {
            if (r.type === 'CodeSystem' || r.type === 'ValueSet') {
              codeSystems.push(r.type);
            }
          }
        }
      }
    }

    return {
      serverName: data.software?.name ?? 'Unknown',
      fhirVersion: data.fhirVersion ?? 'Unknown',
      codeSystems,
    };
  }

  async searchMedications(filter: string, count = 20): Promise<NMPCSearchResult[]> {
    const data = await this.request('/ValueSet/$expand', {
      url: 'http://snomed.info/sct?fhir_vs=isa/763158003',
      filter,
      count: String(count),
      includeDesignations: 'true',
    }) as {
      expansion?: {
        contains?: {
          system?: string;
          code?: string;
          display?: string;
        }[];
      };
    };

    if (!data.expansion?.contains) return [];

    return data.expansion.contains.map(c => ({
      code: c.code ?? '',
      display: c.display ?? '',
      system: c.system ?? '',
    }));
  }

  async lookupConcept(system: string, code: string): Promise<NMPCLookupResult> {
    const data = await this.request('/CodeSystem/$lookup', {
      system,
      code,
      property: '*',
    }) as {
      parameter?: {
        name: string;
        valueString?: string;
        valueCode?: string;
        valueCoding?: { system?: string; code?: string; display?: string };
        valueBoolean?: boolean;
        valueDecimal?: number;
        valueInteger?: number;
        part?: {
          name: string;
          valueString?: string;
          valueCode?: string;
          valueCoding?: { system?: string; code?: string; display?: string };
          valueBoolean?: boolean;
        }[];
      }[];
    };

    const params = data.parameter ?? [];
    let display = '';
    const properties: NMPCConceptProperty[] = [];
    const designations: { language?: string; use?: { system?: string; code?: string; display?: string }; value: string }[] = [];

    for (const p of params) {
      if (p.name === 'display') {
        display = p.valueString ?? '';
      } else if (p.name === 'name') {
        // server name
      } else if (p.name === 'designation' && p.part) {
        const des: { language?: string; use?: { system?: string; code?: string; display?: string }; value: string } = { value: '' };
        for (const part of p.part) {
          if (part.name === 'language') des.language = part.valueCode ?? part.valueString;
          if (part.name === 'value') des.value = part.valueString ?? '';
          if (part.name === 'use') des.use = part.valueCoding;
        }
        if (des.value) designations.push(des);
      } else if (p.name === 'property' && p.part) {
        const prop: NMPCConceptProperty = { code: '' };
        for (const part of p.part) {
          if (part.name === 'code') prop.code = part.valueCode ?? part.valueString ?? '';
          if (part.name === 'value') {
            if (part.valueString !== undefined) prop.valueString = part.valueString;
            if (part.valueCode !== undefined) prop.valueCode = part.valueCode;
            if (part.valueCoding !== undefined) prop.valueCoding = part.valueCoding;
            if (part.valueBoolean !== undefined) prop.valueBoolean = part.valueBoolean;
          }
        }
        if (prop.code) properties.push(prop);
      }
    }

    return { name: '', display, properties, designations };
  }

  /**
   * Translate a SNOMED CT code to ATC using ConceptMap/$translate.
   * Returns null if no mapping is available or the operation fails.
   */
  async translateToATC(code: string): Promise<{ code: string; display: string } | null> {
    try {
      const data = await this.request('/ConceptMap/$translate', {
        system: 'http://snomed.info/sct',
        code,
        target: 'http://www.whocc.no/atc',
      }) as {
        parameter?: {
          name: string;
          valueBoolean?: boolean;
          part?: {
            name: string;
            valueCoding?: { system?: string; code?: string; display?: string };
            valueCode?: string;
          }[];
        }[];
      };

      const matchParam = data.parameter?.find(p => p.name === 'match');
      if (matchParam?.part) {
        const conceptPart = matchParam.part.find(p => p.name === 'concept');
        if (conceptPart?.valueCoding?.code) {
          return {
            code: conceptPart.valueCoding.code,
            display: conceptPart.valueCoding.display ?? conceptPart.valueCoding.code,
          };
        }
      }
      return null;
    } catch {
      return null;
    }
  }
}
