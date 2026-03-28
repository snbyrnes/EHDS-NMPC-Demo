# NMPC → EHDS Medication Resource Mapping

This document describes how SNOMED CT properties from the Irish National Medication Product Catalogue (NMPC) are mapped to the [EHDS Medication Logical Model v0.3.0](http://www.xt-ehr.eu/fhir/models/StructureDefinition/EHDSMedication).

## Data Sources

| Source | FHIR Operation | Description |
|--------|----------------|-------------|
| **ValueSet/$expand** | `isa/763158003` (Medicinal product) | Searches NMPC medications, returns code + display |
| **CodeSystem/$lookup** | `property=*` | Returns all properties, designations, and normalForm for a concept |
| **ConceptMap/$translate** | `target=http://www.whocc.no/atc` | Translates SNOMED CT code to ATC classification |

## Property Resolution Strategy

Properties are resolved using a two-tier approach:

1. **normalForm parsing** (preferred) — the SNOMED CT normal form expression contains rich `code|display|` pairs for all relationships, providing human-readable display names alongside codes.
2. **Flat property fallback** — individual property parameters from the `$lookup` response are used when the normalForm doesn't contain the relationship.

## EHDS Field Mappings

### identifyingCode[x] (0..*)

| Source | NMPC Property | Type |
|--------|--------------|------|
| Selected SNOMED CT concept | — (the user-selected code from ValueSet/$expand) | CodeableConcept |
| Product authorisation number | `680041000220101` — Has product authorisation number | Identifier (system: `https://www.hpra.ie`) |

### productName (0..1)

| Source | Details |
|--------|---------|
| `lookup.display` | The display term returned by CodeSystem/$lookup (Preferred Term) |

### classification (0..*)

| Source | NMPC Property | Target System |
|--------|--------------|---------------|
| ATC code | `ConceptMap/$translate` (SNOMED → ATC) | `http://www.whocc.no/atc` |

The ATC classification is obtained via a parallel `ConceptMap/$translate` call, not from a direct property on the concept.

### doseForm (0..1)

| Source | NMPC Property | SNOMED Code |
|--------|--------------|-------------|
| Has manufactured dose form | `411116001` | Resolved from normalForm or flat property |

Maps to the package-level dose form (e.g. "Conventional release oral tablet"). System: `http://snomed.info/sct`.

### description (0..1)

| Source | Details |
|--------|---------|
| PT designation | Preferred Term from designations (use code `preferredForLanguage` or `display`) |

Previously used the Fully Specified Name (FSN, code `900000000000003001`); now uses the PT for a cleaner, more readable description.

### marketingAuthorisationHolder (0..1)

| EHDS Sub-field | NMPC Property | SNOMED Code | Details |
|----------------|--------------|-------------|---------|
| organisationName | Has marketing authorisation holder | `680061000220102` | Display name from normalForm (e.g. "Upjohn EESV") |
| organisationIdentifier | Has marketing authorisation holder | `680061000220102` | SNOMED CT code of the MAH organisation |

### item (0..*)

#### item.doseForm (0..1)

| Source | NMPC Property | SNOMED Code |
|--------|--------------|-------------|
| Has basic dose form | `736476002` | Extracted from normalForm |

Maps to the manufactured item dose form (e.g. "Film-coated tablet"). This is distinct from the package-level `doseForm` above.

#### item.ingredient (1..*)

| EHDS Sub-field | NMPC Property | SNOMED Code | Details |
|----------------|--------------|-------------|---------|
| isActive | — | — | Always set to `true` for precise active ingredients |
| substance | Has precise active ingredient | `762949000` | Extracted from normalForm (e.g. "Atorvastatin calcium") |

#### item.ingredient.strengthInfo

| EHDS Sub-field | NMPC Property | SNOMED Code | Details |
|----------------|--------------|-------------|---------|
| strength.numerator | Has presentation strength numerator value + unit | `1142135004` + `732945000` | e.g. 80 milligram |
| strength.denominator | Has presentation strength denominator value + unit | `1142136003` + `732947008` | e.g. 1 Tablet |
| basisOfStrengthSubstance | Has basis of strength substance | `732943007` | e.g. "Atorvastatin" (the base substance, vs the salt form in `substance`) |

All strength components are parsed from the normalForm expression using regex patterns.

#### item.unitOfPresentation (0..1)

| Source | NMPC Property | SNOMED Code |
|--------|--------------|-------------|
| Has unit of presentation | `763032000` | Resolved from flat property or normalForm (e.g. "Tablet") |

### characteristic (0..*)

Multiple NMPC regulatory/legal properties are mapped as EHDS characteristics:

| Characteristic Type | NMPC Property | SNOMED Code | Example Value |
|-------------------|--------------|-------------|---------------|
| Has licensed route of administration | `680321000220105` | Route code | "Oral route" |
| Has marketing status | `680051000220104` | Status code | "Marketed" |
| Has licensing status | `680341000220104` | Status code | "Licensing Status - Authorised" |
| Has dispensing legal status | `680081000220106` | Status code | "Subject to prescription - S1B" |
| Has supply legal status | `680771000220105` | Status code | "Pharmacy Only" |

Each characteristic is structured as `{ type: CodeableConcept, value: CodeableConcept }` with system `http://snomed.info/sct`.

### device (0..*)

Marked as **not applicable** when the NMPC product type (`680011000220100`) is "NMPC Medication" (`680591000220104`). Device nodes and all sub-properties are excluded from coverage calculations and shown as dimmed with an "N/A" badge in the UI.

### batch (0..1)

Not populated from NMPC data. Batch information (lot number, expiration date) is typically recorded during dispense or administration, not available from the terminology server.

## NMPC Properties Not Mapped

These NMPC properties are available in the `$lookup` response but not currently mapped to EHDS fields:

| NMPC Property | SNOMED Code | Reason |
|---------------|-------------|--------|
| Has product name | `774158006` | Redundant with `productName` from display |
| Has patient information leaflet | `680181000220107` | URL string — no direct EHDS field |
| Has summary of product characteristics document | `680171000220109` | URL string — no direct EHDS field |
| Has NMPC dose form type | `680311000220103` | Internal NMPC classification |
| Has NMPC product type | `680011000220100` | Used for N/A logic, not mapped to a field |
| Count of base of active ingredient | `1142139005` | Implicit from ingredient count |
| parent | — | Hierarchy navigation, not a resource field |
| inactive | — | Status flag, not an EHDS field |
| sufficientlyDefined | — | Ontology metadata |
| effectiveTime | — | Authoring metadata |
| moduleId | — | SNOMED module metadata |
| normalFormTerse / normalForm | — | Used as extraction source, not mapped directly |

## Terminology Bindings

The EHDS model specifies preferred terminology bindings for coded fields:

| EHDS Field | Expected Binding | Actual System Used |
|------------|-----------------|-------------------|
| classification | WHO ATC (`http://www.whocc.no/atc`) | WHO ATC (via ConceptMap/$translate) |
| doseForm | EDQM Standard Terms | SNOMED CT (national extension) |
| item.doseForm | EDQM Standard Terms | SNOMED CT (national extension) |
| item.ingredient.substance | EMA SPOR SMS | SNOMED CT (national extension) |
| item.ingredient.strengthInfo.basisOfStrengthSubstance | EMA SPOR SMS | SNOMED CT (national extension) |
| item.unitOfPresentation | EDQM Standard Terms | SNOMED CT (national extension) |

> **Note:** The NMPC uses SNOMED CT codes from the Irish national extension for dose forms, substances, and units of presentation rather than EDQM or EMA SPOR codes. The binding validation in the UI flags these as mismatches against the EHDS-preferred terminologies.
