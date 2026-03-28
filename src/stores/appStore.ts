import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { EHDSTreeNode, NMPCSearchResult, EHDSMedicationResource, NMPCLookupResult, ValidationStatus } from '../types/ehds';
import { classifyBinding } from '../types/ehds';
import { NMPCClient } from '../services/nmpcClient';
import { parseStructureDefinition, getAllNodes } from '../services/ehdsParser';
import { mapConceptToEHDS, isNmpcMedication } from '../services/resourceMapper';

export const useAppStore = defineStore('app', () => {
  // NMPC connection
  const nmpcBaseUrl = ref(localStorage.getItem('nmpc_base_url') || 'https://nmpc.hse.ie/production1/fhir');
  const nmpcTokenEndpoint = ref(localStorage.getItem('nmpc_token_endpoint') || '');
  const nmpcClientId = ref(localStorage.getItem('nmpc_client_id') || '');
  const nmpcClientSecret = ref(localStorage.getItem('nmpc_client_secret') || '');
  const isConnected = ref(false);
  const isConnecting = ref(false);
  const connectionError = ref('');
  const serverInfo = ref<{ serverName: string; fhirVersion: string } | null>(null);

  // EHDS tree
  const treeRoots = ref<EHDSTreeNode[]>(parseStructureDefinition());

  // Search
  const searchQuery = ref('');
  const searchResults = ref<NMPCSearchResult[]>([]);
  const isSearching = ref(false);
  const searchError = ref('');

  // Selected medication
  const selectedMedication = ref<NMPCSearchResult | null>(null);
  const medicationResource = ref<EHDSMedicationResource | null>(null);
  const isLoadingDetails = ref(false);

  // Raw NMPC lookup response
  const rawLookupResponse = ref<NMPCLookupResult | null>(null);

  // Comparison mode
  const comparedMedication = ref<NMPCSearchResult | null>(null);
  const comparedResource = ref<EHDSMedicationResource | null>(null);
  const comparedTreeRoots = ref<EHDSTreeNode[]>(parseStructureDefinition());
  const comparedRawLookup = ref<NMPCLookupResult | null>(null);
  const isLoadingComparison = ref(false);

  // Settings drawer
  const showSettings = ref(false);

  // Inspected node (for detail panel)
  const inspectedNode = ref<EHDSTreeNode | null>(null);

  // Client instance
  let client: NMPCClient | null = null;

  // Binding system expectations for validation
  const BINDING_SYSTEM_MAP: Record<string, string[]> = {
    ATC: ['http://www.whocc.no/atc', 'http://www.who.int/classifications/atc'],
    EDQM: ['http://standardterms.edqm.eu', 'https://standardterms.edqm.eu'],
    EMA_SPOR: ['https://spor.ema.europa.eu', 'http://spor.ema.europa.eu'],
    UCUM: ['http://unitsofmeasure.org'],
    SNOMED: ['http://snomed.info/sct'],
  };

  async function connect() {
    isConnecting.value = true;
    connectionError.value = '';
    try {
      // Auto-discover token endpoint if not manually provided
      let tokenUrl = nmpcTokenEndpoint.value;
      if (!tokenUrl) {
        const discovered = await NMPCClient.discoverTokenEndpoint(nmpcBaseUrl.value);
        if (discovered) {
          tokenUrl = discovered;
          nmpcTokenEndpoint.value = discovered;
        }
      }

      client = new NMPCClient(nmpcBaseUrl.value, tokenUrl, nmpcClientId.value, nmpcClientSecret.value);
      const info = await client.getMetadata();
      serverInfo.value = { serverName: info.serverName, fhirVersion: info.fhirVersion };
      isConnected.value = true;

      // Persist settings (including discovered token endpoint)
      localStorage.setItem('nmpc_base_url', nmpcBaseUrl.value);
      localStorage.setItem('nmpc_token_endpoint', nmpcTokenEndpoint.value);
      localStorage.setItem('nmpc_client_id', nmpcClientId.value);
      localStorage.setItem('nmpc_client_secret', nmpcClientSecret.value);
    } catch (e) {
      connectionError.value = e instanceof Error ? e.message : 'Connection failed';
      isConnected.value = false;
      serverInfo.value = null;
    } finally {
      isConnecting.value = false;
    }
  }

  function disconnect() {
    isConnected.value = false;
    serverInfo.value = null;
    client = null;
    searchResults.value = [];
    selectedMedication.value = null;
    medicationResource.value = null;
    rawLookupResponse.value = null;
    clearPopulatedValues(treeRoots.value);
    clearComparison();
  }

  async function searchMedications(filter: string) {
    if (!client || !filter.trim()) {
      searchResults.value = [];
      return;
    }
    isSearching.value = true;
    searchError.value = '';
    try {
      searchResults.value = await client.searchMedications(filter);
    } catch (e) {
      searchError.value = e instanceof Error ? e.message : 'Search failed';
      searchResults.value = [];
    } finally {
      isSearching.value = false;
    }
  }

  async function searchMedicationsRaw(filter: string): Promise<import('../types/ehds').NMPCSearchResult[]> {
    if (!client || !filter.trim()) return [];
    return client.searchMedications(filter);
  }

  async function selectMedication(medication: NMPCSearchResult) {
    if (!client) return;
    selectedMedication.value = medication;
    isLoadingDetails.value = true;

    try {
      const [lookup, atc] = await Promise.all([
        client.lookupConcept(medication.system, medication.code),
        client.translateToATC(medication.code).catch(() => null),
      ]);
      rawLookupResponse.value = lookup;
      const resource = mapConceptToEHDS(medication, lookup, atc);
      medicationResource.value = resource;
      populateTree(treeRoots.value, resource, isNmpcMedication(lookup));
      // Update URL hash for deep linking
      updateHash(medication.code);
    } catch (e) {
      console.error('Failed to load medication details:', e);
      medicationResource.value = null;
      rawLookupResponse.value = null;
    } finally {
      isLoadingDetails.value = false;
    }
  }

  async function selectForComparison(medication: NMPCSearchResult) {
    if (!client) return;
    comparedMedication.value = medication;
    isLoadingComparison.value = true;

    try {
      const [lookup, atc] = await Promise.all([
        client.lookupConcept(medication.system, medication.code),
        client.translateToATC(medication.code).catch(() => null),
      ]);
      comparedRawLookup.value = lookup;
      const resource = mapConceptToEHDS(medication, lookup, atc);
      comparedResource.value = resource;
      comparedTreeRoots.value = parseStructureDefinition();
      populateTree(comparedTreeRoots.value, resource, isNmpcMedication(lookup));
    } catch (e) {
      console.error('Failed to load comparison details:', e);
      comparedResource.value = null;
    } finally {
      isLoadingComparison.value = false;
    }
  }

  function clearComparison() {
    comparedMedication.value = null;
    comparedResource.value = null;
    comparedRawLookup.value = null;
    clearPopulatedValues(comparedTreeRoots.value);
  }

  function updateHash(code: string) {
    window.history.replaceState(null, '', `#/sct/${encodeURIComponent(code)}`);
  }

  async function loadFromDeepLink(code: string) {
    if (!isConnected.value) {
      // Try to auto-connect with stored credentials
      if (nmpcClientId.value && nmpcClientSecret.value) {
        await connect();
      }
    }
    if (isConnected.value && client) {
      const results = await client.searchMedications(code, 5);
      const match = results.find(r => r.code === code);
      if (match) {
        await selectMedication(match);
      }
    }
  }

  function clearPopulatedValues(nodes: EHDSTreeNode[]) {
    for (const node of nodes) {
      node.populatedValue = undefined;
      node.notApplicable = undefined;
      clearPopulatedValues(node.children);
    }
  }

  function setPopulated(nodes: EHDSTreeNode[], path: string, value: import('../types/ehds').PopulatedValue) {
    for (const node of nodes) {
      if (node.path === path) {
        // Add binding validation if the node has a binding and value has a system
        if (node.binding && value.system && value.type === 'code') {
          value.validation = validateBinding(node, value.system);
          if (value.validation === 'valid') {
            value.validationMessage = 'Code system matches the expected binding';
          } else if (value.validation === 'mismatch') {
            value.validationMessage = `Expected system from ${node.binding.description ?? 'binding'}, got ${value.system}`;
          }
        }
        node.populatedValue = value;
        return;
      }
      setPopulated(node.children, path, value);
    }
  }

  function validateBinding(node: EHDSTreeNode, system: string): ValidationStatus {
    if (!node.binding?.description) return 'unknown';
    const cat = classifyBinding(node.binding.description);
    if (!cat || cat === 'OTHER') return 'unknown';
    const expectedSystems = BINDING_SYSTEM_MAP[cat];
    if (!expectedSystems) return 'unknown';
    const matches = expectedSystems.some(s => system.toLowerCase().includes(s.replace('http://', '').replace('https://', '')));
    return matches ? 'valid' : 'mismatch';
  }

  function markNotApplicable(nodes: EHDSTreeNode[], pathPrefix: string) {
    for (const node of nodes) {
      if (node.path === pathPrefix || node.path.startsWith(pathPrefix + '.')) {
        node.notApplicable = true;
      }
      markNotApplicable(node.children, pathPrefix);
    }
  }

  function getLeafDescendants(node: EHDSTreeNode): EHDSTreeNode[] {
    if (node.children.length === 0) return [node];
    return node.children.flatMap(c => getLeafDescendants(c));
  }

  function propagateParentCompletion(nodes: EHDSTreeNode[]) {
    for (const node of nodes) {
      propagateParentCompletion(node.children);
      if (
        node.children.length > 0 &&
        !node.populatedValue &&
        !node.notApplicable &&
        node.depth > 0 &&
        node.types.includes('Base')
      ) {
        const leaves = getLeafDescendants(node).filter(l => !l.notApplicable);
        if (leaves.length > 0 && leaves.every(l => l.populatedValue)) {
          node.populatedValue = {
            type: 'string',
            display: `All ${leaves.length} fields populated`,
          };
        }
      }
    }
  }

  function populateTree(nodes: EHDSTreeNode[], resource: EHDSMedicationResource, deviceNotApplicable = false) {
    clearPopulatedValues(nodes);

    // Mark device and sub-properties as N/A for NMPC Medication products
    if (deviceNotApplicable) {
      markNotApplicable(nodes, 'EHDSMedication.device');
    }

    if (resource.identifyingCode?.length) {
      const ic = resource.identifyingCode[0] as import('../types/ehds').FHIRCodeableConcept;
      if (ic.coding?.length) {
        setPopulated(nodes, 'EHDSMedication.identifyingCode[x]', {
          type: 'code',
          display: ic.coding[0].display ?? '',
          code: ic.coding[0].code,
          system: ic.coding[0].system,
        });
      }
    }

    if (resource.classification?.length) {
      const cls = resource.classification[0];
      if (cls.coding?.length) {
        setPopulated(nodes, 'EHDSMedication.classification', {
          type: 'code',
          display: cls.coding[0].display ?? '',
          code: cls.coding[0].code,
          system: cls.coding[0].system,
        });
      }
    }

    if (resource.productName) {
      setPopulated(nodes, 'EHDSMedication.productName', {
        type: 'string',
        display: resource.productName,
      });
    }

    if (resource.doseForm) {
      const df = resource.doseForm;
      setPopulated(nodes, 'EHDSMedication.doseForm', {
        type: 'code',
        display: df.text ?? df.coding?.[0]?.display ?? '',
        code: df.coding?.[0]?.code,
        system: df.coding?.[0]?.system,
      });
    }

    if (resource.description) {
      setPopulated(nodes, 'EHDSMedication.description', {
        type: 'string',
        display: resource.description,
      });
    }

    if (resource.marketingAuthorisationHolder?.organisationName) {
      setPopulated(nodes, 'EHDSMedication.marketingAuthorisationHolder.organisationName', {
        type: 'string',
        display: resource.marketingAuthorisationHolder.organisationName,
      });
    }

    if (resource.marketingAuthorisationHolder?.organisationIdentifier?.length) {
      const oid = resource.marketingAuthorisationHolder.organisationIdentifier[0];
      setPopulated(nodes, 'EHDSMedication.marketingAuthorisationHolder.organisationIdentifier', {
        type: 'code',
        display: oid.value ?? '',
        code: oid.value,
        system: oid.system,
      });
    }

    if (resource.item?.length) {
      const item = resource.item[0];
      setPopulated(nodes, 'EHDSMedication.item', {
        type: 'string',
        display: `${resource.item.length} item(s)`,
      });

      if (item.doseForm) {
        setPopulated(nodes, 'EHDSMedication.item.doseForm', {
          type: 'code',
          display: item.doseForm.text ?? item.doseForm.coding?.[0]?.display ?? '',
          code: item.doseForm.coding?.[0]?.code,
          system: item.doseForm.coding?.[0]?.system,
        });
      }

      if (item.ingredient?.length) {
        const ing = item.ingredient[0];
        setPopulated(nodes, 'EHDSMedication.item.ingredient', {
          type: 'string',
          display: `${item.ingredient.length} ingredient(s)`,
        });

        if (ing.isActive !== undefined) {
          setPopulated(nodes, 'EHDSMedication.item.ingredient.isActive', {
            type: 'boolean',
            display: String(ing.isActive),
          });
        }

        if (ing.substance?.coding?.length) {
          setPopulated(nodes, 'EHDSMedication.item.ingredient.substance', {
            type: 'code',
            display: ing.substance.coding[0].display ?? '',
            code: ing.substance.coding[0].code,
            system: ing.substance.coding[0].system,
          });
        }

        if (ing.strengthInfo) {
          const s = ing.strengthInfo.strength;
          setPopulated(nodes, 'EHDSMedication.item.ingredient.strengthInfo.strength', {
            type: 'ratio',
            display: `${s.numerator?.value ?? ''} ${s.numerator?.unit ?? ''} / ${s.denominator?.value ?? ''} ${s.denominator?.unit ?? ''}`,
          });

          if (ing.strengthInfo.basisOfStrengthSubstance?.coding?.length) {
            const boss = ing.strengthInfo.basisOfStrengthSubstance.coding[0];
            setPopulated(nodes, 'EHDSMedication.item.ingredient.strengthInfo.basisOfStrengthSubstance', {
              type: 'code',
              display: boss.display ?? '',
              code: boss.code,
              system: boss.system,
            });
          }
        }
      }

      if (item.unitOfPresentation) {
        setPopulated(nodes, 'EHDSMedication.item.unitOfPresentation', {
          type: 'code',
          display: item.unitOfPresentation.text ?? item.unitOfPresentation.coding?.[0]?.display ?? '',
          code: item.unitOfPresentation.coding?.[0]?.code,
          system: item.unitOfPresentation.coding?.[0]?.system,
        });
      }
    }

    if (resource.characteristic?.length) {
      setPopulated(nodes, 'EHDSMedication.characteristic', {
        type: 'string',
        display: `${resource.characteristic.length} characteristic(s)`,
      });
      // Show first characteristic's type and value
      const firstChar = resource.characteristic[0];
      if (firstChar.type) {
        setPopulated(nodes, 'EHDSMedication.characteristic.type', {
          type: 'code',
          display: firstChar.type.text ?? firstChar.type.coding?.[0]?.display ?? '',
          code: firstChar.type.coding?.[0]?.code,
          system: firstChar.type.coding?.[0]?.system,
        });
      }
    }

    // Mark parent Base nodes as complete when all children are populated
    propagateParentCompletion(nodes);
  }

  const hasCredentials = computed(() => nmpcClientId.value.length > 0 && nmpcClientSecret.value.length > 0);

  // Population coverage stats
  const populationStats = computed(() => {
    const allNodes = getAllNodes(treeRoots.value);
    // Only count leaf nodes (no children) at depth > 0, excluding N/A nodes
    const leafNodes = allNodes.filter(n => n.children.length === 0 && n.depth > 0 && !n.notApplicable);
    const populated = leafNodes.filter(n => n.populatedValue);
    const naCount = allNodes.filter(n => n.children.length === 0 && n.depth > 0 && n.notApplicable).length;
    return {
      total: leafNodes.length,
      populated: populated.length,
      percentage: leafNodes.length > 0 ? Math.round((populated.length / leafNodes.length) * 100) : 0,
      notApplicable: naCount,
    };
  });

  function clearSelection() {
    selectedMedication.value = null;
    medicationResource.value = null;
    rawLookupResponse.value = null;
    inspectedNode.value = null;
    clearPopulatedValues(treeRoots.value);
    clearComparison();
    window.history.replaceState(null, '', window.location.pathname);
  }

  return {
    // State
    nmpcBaseUrl,
    nmpcTokenEndpoint,
    nmpcClientId,
    nmpcClientSecret,
    isConnected,
    isConnecting,
    connectionError,
    serverInfo,
    treeRoots,
    searchQuery,
    searchResults,
    isSearching,
    searchError,
    selectedMedication,
    medicationResource,
    isLoadingDetails,
    showSettings,
    hasCredentials,
    inspectedNode,
    populationStats,
    rawLookupResponse,
    comparedMedication,
    comparedResource,
    comparedTreeRoots,
    comparedRawLookup,
    isLoadingComparison,
    // Actions
    connect,
    disconnect,
    searchMedications,
    searchMedicationsRaw,
    selectMedication,
    selectForComparison,
    clearComparison,
    clearSelection,
    loadFromDeepLink,
  };
});
