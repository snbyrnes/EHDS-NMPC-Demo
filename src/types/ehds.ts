export interface EHDSElementType {
  code: string;
}

export interface EHDSBinding {
  strength: string;
  description: string;
}

export interface EHDSElement {
  id: string;
  path: string;
  short: string;
  definition: string;
  min: number;
  max: string;
  type?: EHDSElementType[];
  binding?: EHDSBinding;
}

export interface EHDSTreeNode {
  id: string;
  name: string;
  path: string;
  short: string;
  definition: string;
  cardinality: string;
  types: string[];
  binding?: EHDSBinding;
  children: EHDSTreeNode[];
  depth: number;
  isExpanded: boolean;
  populatedValue?: PopulatedValue;
  notApplicable?: boolean;
}

export type ValidationStatus = 'valid' | 'mismatch' | 'unknown';

export interface PopulatedValue {
  type: 'code' | 'string' | 'boolean' | 'quantity' | 'ratio' | 'identifier' | 'datetime' | 'integer' | 'decimal';
  display: string;
  code?: string;
  system?: string;
  raw?: unknown;
  validation?: ValidationStatus;
  validationMessage?: string;
}

export interface FHIRCoding {
  system?: string;
  code?: string;
  display?: string;
}

export interface FHIRCodeableConcept {
  coding?: FHIRCoding[];
  text?: string;
}

export interface FHIRQuantity {
  value?: number;
  unit?: string;
  system?: string;
  code?: string;
}

export interface FHIRRatio {
  numerator?: FHIRQuantity;
  denominator?: FHIRQuantity;
}

export interface FHIRIdentifier {
  system?: string;
  value?: string;
}

export interface EHDSIngredient {
  isActive?: boolean;
  substance: FHIRCodeableConcept;
  strengthInfo?: {
    strength: FHIRRatio;
    basisOfStrengthSubstance?: FHIRCodeableConcept;
  };
}

export interface EHDSMedicationResource {
  resourceType: 'Medication';
  meta?: {
    profile: string[];
  };
  identifyingCode?: (FHIRCodeableConcept | FHIRIdentifier)[];
  classification?: FHIRCodeableConcept[];
  productName?: string;
  marketingAuthorisationHolder?: {
    organisationName?: string;
    organisationIdentifier?: FHIRIdentifier[];
  };
  doseForm?: FHIRCodeableConcept;
  description?: string;
  item?: {
    doseForm?: FHIRCodeableConcept;
    ingredient: EHDSIngredient[];
    unitOfPresentation?: FHIRCodeableConcept;
    containedQuantity?: FHIRRatio;
    amount?: FHIRQuantity;
    packageType?: FHIRCodeableConcept;
  }[];
  device?: {
    deviceQuantity: FHIRQuantity;
    device: FHIRCodeableConcept;
  }[];
  characteristic?: {
    type: FHIRCodeableConcept;
    value?: unknown;
  }[];
  batch?: {
    lotNumber?: string;
    expirationDate?: string;
  };
}

export interface NMPCSearchResult {
  code: string;
  display: string;
  system: string;
}

export interface NMPCConceptProperty {
  code: string;
  value?: string;
  valueCode?: string;
  valueCoding?: FHIRCoding;
  valueString?: string;
  valueBoolean?: boolean;
  valueDecimal?: number;
  valueInteger?: number;
}

export interface NMPCLookupResult {
  name: string;
  display: string;
  properties: NMPCConceptProperty[];
  designations: { language?: string; use?: FHIRCoding; value: string }[];
}

export type BindingCategory = 'ATC' | 'EDQM' | 'EMA_SPOR' | 'UCUM' | 'SNOMED' | 'OTHER';

export const BINDING_COLORS: Record<BindingCategory, { bg: string; text: string; border: string; label: string }> = {
  ATC: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300', label: 'WHO ATC' },
  EDQM: { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300', label: 'EDQM' },
  EMA_SPOR: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300', label: 'EMA SPOR SMS' },
  UCUM: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300', label: 'UCUM' },
  SNOMED: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300', label: 'SNOMED CT' },
  OTHER: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300', label: 'Other' },
};

export function classifyBinding(description?: string): BindingCategory | undefined {
  if (!description) return undefined;
  const d = description.toLowerCase();
  if (d.includes('atc')) return 'ATC';
  if (d.includes('edqm')) return 'EDQM';
  if (d.includes('spor') || d.includes('ema')) return 'EMA_SPOR';
  if (d.includes('ucum')) return 'UCUM';
  if (d.includes('snomed')) return 'SNOMED';
  return 'OTHER';
}
