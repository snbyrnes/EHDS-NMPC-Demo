# Changelog

All notable changes to the EHDS FHIR Medication Validator are documented here.

## [0.7.0] - 2026-03-28

### Added
- **Features & Guide modal** — in-app walkthrough explaining all key features and how to use the demo
- **Links & Resources modal** — curated external links to NMPC, EHDS, SNOMED CT, FHIR, and classification resources
- **Resource Mapping modal** — in-app documentation of all NMPC → EHDS field mappings with structured tables
- **Parent completion logic** — Base-type parent nodes auto-marked as complete when all child leaf fields are populated

### Changed
- Renamed "Terminology Bindings" to **Preferred Binding Indicators** across the app (legend, node inspector, resource mapping modal, features guide)
- Irish NMPC section moved to first position in Links & Resources
- Updated NMPC info URL and replaced SNOMED CT Browser with ECL Specification link
- Removed AEHRC link from resources

## [0.6.0] - 2026-03-28

### Added
- In-app changelog modal accessible from the header
- README with project overview, features, tech stack, and setup instructions

## [0.5.0] - 2026-03-28

### Added
- Resource mapping documentation (`RESOURCE_MAPPING.md`) covering all NMPC → EHDS field mappings

### Changed
- Device field and sub-properties marked as **Not Applicable** (N/A) when NMPC product type is "NMPC Medication" (`680591000220104`)
- N/A fields excluded from coverage percentage calculation
- N/A fields shown dimmed with italic "N/A" badge in the tree

## [0.4.0] - 2026-03-28

### Changed
- **Classification** now uses `ConceptMap/$translate` (SNOMED → ATC) instead of looking for an `atc` flat property
- **Dose form** mapped from "Has manufactured dose form" (`411116001`) via normalForm parsing
- **Description** now uses Preferred Term (PT) designation instead of Fully Specified Name (FSN)
- **Marketing Authorisation Holder** mapped from "Has MAH" (`680061000220102`) with organisation name and SNOMED identifier
- **Ingredients** extracted from normalForm: precise active ingredient (`762949000`), basis of strength substance (`732943007`), and structured presentation strength (numerator/denominator values and units)
- **Item dose form** mapped from "Has basic dose form" (`736476002`)
- **Product authorisation number** (`680041000220101`) added as an Identifier on `identifyingCode`

### Added
- NormalForm expression parsing engine for extracting rich code+display pairs from SNOMED CT relationship expressions
- `resolveProperty()` two-tier resolution: normalForm first, flat property fallback
- Five regulatory characteristics mapped: route of administration, marketing status, licensing status, dispensing legal status, supply legal status
- `ConceptMap/$translate` method on `NMPCClient` for ATC code lookup
- `basisOfStrengthSubstance` populated in the tree and resource

## [0.3.0] - 2026-03-28

### Added
- **Medication Comparison Mode** — search and compare two medications side-by-side with diff highlighting
- **Binding Validation Indicators** — checkmark, warning, or question mark icons on populated values based on code system vs expected binding
- **Raw NMPC Response Viewer** — tabbed panel showing full `$lookup` JSON with property/designation counts
- **Shareable Deep Links** — URL hash `#/sct/{code}` parsed on load to auto-select a medication
- **Export Mapping Report** — standalone HTML report with coverage bar, field table, and full JSON

## [0.2.0] - 2026-03-28

### Added
- **Welcome Panel** — centred onboarding when not connected
- **Node Detail Inspector** — click-to-inspect element definition, cardinality, type, and binding
- **Copy/Download JSON** — copy EHDS resource JSON to clipboard or download as `.json`
- **Result Count & Clear Selection** — search result count badge and clear button on selected medication
- **Coverage Summary** — progress bar with populated/total field count and percentage

### Changed
- Layout split adjusted from 60/40 to 75/25
- Removed inline `node.short` text display from tree rows

## [0.1.0] - 2026-03-28

### Added
- Initial scaffold: Vue 3 + TypeScript + Vite + Tailwind CSS v4 + Pinia
- EHDS Medication StructureDefinition (v0.3.0) loaded and parsed into interactive tree
- NMPC Ontoserver connection via OAuth2 client credentials flow
- Auto-discovery of token endpoint via SMART well-known config and CapabilityStatement
- Medication search via `ValueSet/$expand` (SNOMED CT `isa/763158003`)
- `CodeSystem/$lookup` with `property=*` for full concept details
- Basic field mapping: identifyingCode, productName, classification, doseForm, description, ingredients, unitOfPresentation
- Settings drawer for base URL, token endpoint, client ID, client secret
- Binding legend with colour-coded terminology categories
- Expand/collapse all tree controls
- Renamed from "EHDS Medication Explorer" to "EHDS FHIR Medication Validator"
