# EHDS FHIR Medication Validator

A web application that demonstrates the mapping of Ireland's **National Medication Product Catalogue (NMPC)** terminology to the **European Health Data Space (EHDS) Medication Logical Model** (v0.3.0).

The app connects to the NMPC Ontoserver (a FHIR R5 terminology server), searches for Irish medicinal products, retrieves full product properties via `CodeSystem/$lookup`, and maps them onto the EHDS Medication resource structure — visualising coverage, binding validation, and the full FHIR resource output.

## Features

- **NMPC Medication Search** — Search Irish medications via `ValueSet/$expand` over the NMPC product catalogue
- **EHDS Model Tree** — Interactive tree view of the EHDS Medication StructureDefinition with expand/collapse
- **Automated Field Mapping** — Maps NMPC product properties and normalForm expressions to EHDS fields (see [RESOURCE_MAPPING.md](RESOURCE_MAPPING.md))
- **ATC Classification** — Translates NMPC product codes to WHO ATC via `ConceptMap/$translate`
- **Preferred Binding Indicators** — Checks populated code systems against EHDS-preferred terminology bindings (ATC, EDQM, EMA SPOR, UCUM)
- **Coverage Summary** — Progress bar showing percentage of EHDS fields populated, with N/A exclusion for non-applicable fields
- **Parent Completion** — Base-type parent nodes auto-marked as complete when all child fields are populated
- **Node Detail Inspector** — Click any tree node to inspect its definition, cardinality, type, binding, and populated value
- **Raw NMPC Response Viewer** — Browse the full `$lookup` JSON with property and designation counts
- **Medication Comparison** — Side-by-side diff of two medications against the EHDS model
- **Shareable Deep Links** — URL hash `#/sct/{code}` for direct linking to a medication
- **Export Mapping Report** — Download a standalone HTML report of the mapping results
- **Features & Guide Modal** — In-app walkthrough of all key features and how to use the demo
- **Links & Resources Modal** — Curated links to NMPC, EHDS, terminology standards, FHIR, and classification resources
- **Resource Mapping Modal** — In-app documentation of all NMPC → EHDS field mappings
- **Changelog Modal** — In-app changelog accessible from the header

## Tech Stack

- [Vue 3](https://vuejs.org/) with `<script setup>` SFCs
- [TypeScript](https://www.typescriptlang.org/) 5.9
- [Vite](https://vitejs.dev/) 8
- [Tailwind CSS](https://tailwindcss.com/) v4
- [Pinia](https://pinia.vuejs.org/) for state management

## Getting Started

### Prerequisites

- Node.js 18+
- NMPC API credentials (client ID and client secret) for OAuth2 client credentials flow

### Install & Run

```bash
npm install
npm run dev
```

Open http://localhost:5173, click the settings gear, enter your NMPC base URL and OAuth2 credentials, and connect.

### Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── assets/             # EHDS StructureDefinition JSON
├── components/
│   ├── BindingLegend.vue       # Preferred binding indicator colour legend
│   ├── ChangelogModal.vue      # In-app changelog popup
│   ├── ComparisonView.vue      # Side-by-side medication diff
│   ├── CoverageSummary.vue     # Coverage progress bar + export
│   ├── FeaturesModal.vue       # Features & guide walkthrough
│   ├── LinksModal.vue          # Links & resources popup
│   ├── MedicationSearch.vue    # Search input + results + compare
│   ├── ModelTree.vue           # Tree wrapper with expand/collapse all
│   ├── ModelTreeNode.vue       # Individual tree node row
│   ├── NodeDetail.vue          # Element detail inspector panel
│   ├── RawResponseViewer.vue   # Raw NMPC JSON viewer
│   ├── ResourceJson.vue        # EHDS resource JSON with copy/download
│   ├── ResourceMappingModal.vue # NMPC → EHDS mapping documentation
│   ├── SettingsDrawer.vue      # OAuth connection settings
│   └── WelcomePanel.vue        # Onboarding panel
├── services/
│   ├── ehdsParser.ts           # StructureDefinition → tree parser
│   ├── nmpcClient.ts           # FHIR API client with OAuth2
│   ├── reportGenerator.ts      # HTML report export
│   └── resourceMapper.ts       # NMPC → EHDS field mapping engine
├── stores/
│   └── appStore.ts             # Pinia store (connection, search, tree, comparison)
├── types/
│   └── ehds.ts                 # TypeScript interfaces and binding classification
├── views/
│   └── ExplorerView.vue        # Main layout view
├── App.vue
├── main.ts
└── style.css
```

## Documentation

- [RESOURCE_MAPPING.md](RESOURCE_MAPPING.md) — Full documentation of NMPC → EHDS field mappings
- [CHANGELOG.md](CHANGELOG.md) — Version history

## License

This project is for educational and demonstration purposes.
