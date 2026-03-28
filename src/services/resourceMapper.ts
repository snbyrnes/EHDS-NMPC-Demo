import type {
  NMPCLookupResult,
  NMPCConceptProperty,
  EHDSMedicationResource,
  EHDSIngredient,
  FHIRCodeableConcept,
  FHIRCoding,
  FHIRRatio,
  FHIRIdentifier,
  NMPCSearchResult,
} from '../types/ehds';

// ── SNOMED CT NMPC property codes ──
const PROP = {
  MANUFACTURED_DOSE_FORM: '411116001',
  MAH: '680061000220102',
  PRODUCT_AUTH_NUMBER: '680041000220101',
  UNIT_OF_PRESENTATION: '763032000',
  PRODUCT_NAME: '774158006',
  ROUTE_OF_ADMIN: '680321000220105',
  DISPENSING_LEGAL_STATUS: '680081000220106',
  MARKETING_STATUS: '680051000220104',
  LICENSING_STATUS: '680341000220104',
  SUPPLY_LEGAL_STATUS: '680771000220105',
  PRECISE_ACTIVE_INGREDIENT: '762949000',
  BASIS_OF_STRENGTH: '732943007',
  BASIC_DOSE_FORM: '736476002',
  PIL_URL: '680181000220107',
  SPC_URL: '680171000220109',
  NMPC_PRODUCT_TYPE: '680011000220100',
} as const;

const NMPC_MEDICATION_CODE = '680591000220104';

/** Check if the lookup result indicates an NMPC Medication product type */
export function isNmpcMedication(lookup: NMPCLookupResult): boolean {
  const prop = lookup.properties.find(p => p.code === PROP.NMPC_PRODUCT_TYPE);
  return prop?.valueCode === NMPC_MEDICATION_CODE;
}

const SCT = 'http://snomed.info/sct';

function makeCoding(system: string, code: string, display: string): FHIRCoding {
  return { system, code, display };
}

function makeCC(system: string, code: string, display: string): FHIRCodeableConcept {
  return { coding: [makeCoding(system, code, display)], text: display };
}

function findProp(properties: NMPCConceptProperty[], code: string): NMPCConceptProperty | undefined {
  return properties.find(p => p.code === code);
}

/** Parse normalForm string to build a SNOMED code → display lookup map */
function buildDisplayMap(normalForm: string): Map<string, string> {
  const map = new Map<string, string>();
  const regex = /(\d{6,})\|([^|]+)\|/g;
  let match;
  while ((match = regex.exec(normalForm)) !== null) {
    map.set(match[1], match[2].trim());
  }
  return map;
}

/** Extract a relationship target from normalForm: propertyCode|...|=targetCode|targetDisplay| */
function extractRelationship(normalForm: string, propertyCode: string): { code: string; display: string } | null {
  const escaped = propertyCode.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`${escaped}\\|[^|]*\\|=\\(?([\\d]+)\\|([^|]+)\\|`);
  const match = normalForm.match(regex);
  return match ? { code: match[1], display: match[2].trim() } : null;
}

/** Extract presentation strength from normalForm */
function extractStrength(normalForm: string): FHIRRatio | null {
  const numValMatch = normalForm.match(/1142135004\|[^|]*\|=#(\d+(?:\.\d+)?)/);
  if (!numValMatch) return null;

  const numUnitMatch = normalForm.match(/732945000\|[^|]*\|=(\d+)\|([^|]+)\|/);
  const denValMatch = normalForm.match(/1142136003\|[^|]*\|=#(\d+(?:\.\d+)?)/);
  const denUnitMatch = normalForm.match(/732947008\|[^|]*\|=(\d+)\|([^|]+)\|/);

  return {
    numerator: {
      value: parseFloat(numValMatch[1]),
      unit: numUnitMatch?.[2]?.trim() ?? '',
      system: 'http://unitsofmeasure.org',
      code: numUnitMatch?.[2]?.trim() ?? '',
    },
    denominator: {
      value: denValMatch ? parseFloat(denValMatch[1]) : 1,
      unit: denUnitMatch?.[2]?.trim() ?? '',
      system: denUnitMatch ? SCT : 'http://unitsofmeasure.org',
      code: denUnitMatch?.[1] ?? '1',
    },
  };
}

/** Resolve a property by combining flat properties with normalForm data */
function resolveProperty(
  props: NMPCConceptProperty[],
  propCode: string,
  normalForm: string,
  displayMap: Map<string, string>,
): { code: string; display: string } | null {
  // Prefer normalForm for richer code+display pairs
  const nfRelation = extractRelationship(normalForm, propCode);
  if (nfRelation) return nfRelation;

  // Fall back to flat property
  const prop = findProp(props, propCode);
  if (!prop) return null;

  const code = prop.valueCode ?? prop.valueCoding?.code ?? '';
  const display = prop.valueCoding?.display ?? prop.valueString ?? displayMap.get(code) ?? '';
  return code || display ? { code, display } : null;
}

export interface ATCClassification {
  code: string;
  display: string;
}

export function mapConceptToEHDS(
  selected: NMPCSearchResult,
  lookup: NMPCLookupResult,
  atcClassification?: ATCClassification | null,
): EHDSMedicationResource {
  const props = lookup.properties;
  const normalFormProp = findProp(props, 'normalForm');
  const normalForm = normalFormProp?.valueString ?? '';
  const displayMap = buildDisplayMap(normalForm);

  const resource: EHDSMedicationResource = {
    resourceType: 'Medication',
    meta: {
      profile: ['http://www.xt-ehr.eu/fhir/models/StructureDefinition/EHDSMedication'],
    },
  };

  // ── identifyingCode ──
  // SNOMED CT concept code + product authorisation number as Identifier
  resource.identifyingCode = [
    makeCC(selected.system || SCT, selected.code, selected.display),
  ];
  const authNumProp = findProp(props, PROP.PRODUCT_AUTH_NUMBER);
  if (authNumProp?.valueString) {
    (resource.identifyingCode as (FHIRCodeableConcept | FHIRIdentifier)[]).push({
      system: 'https://www.hpra.ie',
      value: authNumProp.valueString,
    } as FHIRIdentifier);
  }

  // ── productName ──
  resource.productName = lookup.display || selected.display;

  // ── classification (ATC via ConceptMap/$translate) ──
  if (atcClassification) {
    resource.classification = [
      makeCC('http://www.whocc.no/atc', atcClassification.code, atcClassification.display),
    ];
  }

  // ── doseForm — "Has manufactured dose form" (411116001) ──
  const doseFormResolved = resolveProperty(props, PROP.MANUFACTURED_DOSE_FORM, normalForm, displayMap);
  if (doseFormResolved) {
    resource.doseForm = makeCC(SCT, doseFormResolved.code, doseFormResolved.display);
  }

  // ── description — use PT (Preferred Term), not FSN ──
  const ptDesignation = lookup.designations.find(d =>
    d.use?.code === 'preferredForLanguage'
  ) ?? lookup.designations.find(d =>
    d.use?.code === 'display'
  );
  if (ptDesignation) {
    resource.description = ptDesignation.value;
  } else if (lookup.display) {
    resource.description = lookup.display;
  }

  // ── marketingAuthorisationHolder — "Has MAH" (680061000220102) ──
  const mahResolved = resolveProperty(props, PROP.MAH, normalForm, displayMap);
  if (mahResolved) {
    resource.marketingAuthorisationHolder = {
      organisationName: mahResolved.display,
      organisationIdentifier: [{
        system: SCT,
        value: mahResolved.code,
      }],
    };
  }

  // ── item — ingredient, strength, dose form, unit of presentation ──
  const preciseIngredient = extractRelationship(normalForm, PROP.PRECISE_ACTIVE_INGREDIENT);
  const basisOfStrength = extractRelationship(normalForm, PROP.BASIS_OF_STRENGTH);
  const strength = extractStrength(normalForm);

  const ingredients: EHDSIngredient[] = [];
  if (preciseIngredient) {
    const ingredient: EHDSIngredient = {
      isActive: true,
      substance: makeCC(SCT, preciseIngredient.code, preciseIngredient.display),
    };
    if (strength) {
      ingredient.strengthInfo = {
        strength,
        ...(basisOfStrength ? {
          basisOfStrengthSubstance: makeCC(SCT, basisOfStrength.code, basisOfStrength.display),
        } : {}),
      };
    }
    ingredients.push(ingredient);
  }

  const itemDoseForm = extractRelationship(normalForm, PROP.BASIC_DOSE_FORM);
  const unitOfPresentation = resolveProperty(props, PROP.UNIT_OF_PRESENTATION, normalForm, displayMap);

  if (ingredients.length > 0 || itemDoseForm || unitOfPresentation) {
    resource.item = [{
      ingredient: ingredients.length > 0 ? ingredients : [],
      ...(itemDoseForm ? {
        doseForm: makeCC(SCT, itemDoseForm.code, itemDoseForm.display),
      } : {}),
      ...(unitOfPresentation ? {
        unitOfPresentation: makeCC(SCT, unitOfPresentation.code, unitOfPresentation.display),
      } : {}),
    }];
  }

  // ── characteristic — route, legal status, marketing status ──
  const characteristics: { type: FHIRCodeableConcept; value?: unknown }[] = [];

  const charMappings: { propCode: string; label: string }[] = [
    { propCode: PROP.ROUTE_OF_ADMIN, label: 'Has licensed route of administration' },
    { propCode: PROP.MARKETING_STATUS, label: 'Has marketing status' },
    { propCode: PROP.LICENSING_STATUS, label: 'Has licensing status' },
    { propCode: PROP.DISPENSING_LEGAL_STATUS, label: 'Has dispensing legal status' },
    { propCode: PROP.SUPPLY_LEGAL_STATUS, label: 'Has supply legal status' },
  ];

  for (const { propCode, label } of charMappings) {
    const resolved = resolveProperty(props, propCode, normalForm, displayMap);
    if (resolved) {
      characteristics.push({
        type: makeCC(SCT, propCode, label),
        value: makeCC(SCT, resolved.code, resolved.display),
      });
    }
  }

  if (characteristics.length > 0) {
    resource.characteristic = characteristics;
  }

  return resource;
}

export function resourceToJson(resource: EHDSMedicationResource): string {
  return JSON.stringify(resource, null, 2);
}
