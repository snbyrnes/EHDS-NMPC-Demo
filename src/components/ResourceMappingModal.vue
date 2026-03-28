<script setup lang="ts">
const props = defineProps<{ visible: boolean }>();
const emit = defineEmits<{ close: [] }>();

interface TableRow { cells: string[] }
interface MappingSection {
  title: string;
  anchor?: string;
  description?: string;
  tables: { headers: string[]; rows: TableRow[] }[];
  subsections?: MappingSection[];
}

const dataSources: { headers: string[]; rows: TableRow[] } = {
  headers: ['Source', 'FHIR Operation', 'Description'],
  rows: [
    { cells: ['ValueSet/$expand', 'isa/763158003', 'Searches NMPC medications, returns code + display'] },
    { cells: ['CodeSystem/$lookup', 'property=*', 'Returns all properties, designations, and normalForm'] },
    { cells: ['ConceptMap/$translate', 'target=http://www.whocc.no/atc', 'Translates NMPC codes → ATC classification for EHDS compliance'] },
  ],
};

const sections: MappingSection[] = [
  {
    title: 'identifyingCode[x] (0..*)',
    tables: [{
      headers: ['Source', 'NMPC Property', 'Type'],
      rows: [
        { cells: ['Selected SNOMED CT concept', '— (user-selected code)', 'CodeableConcept'] },
        { cells: ['Product authorisation number', '680041000220101 — Has product authorisation number', 'Identifier (system: https://www.hpra.ie)'] },
      ],
    }],
  },
  {
    title: 'productName (0..1)',
    tables: [{
      headers: ['Source', 'Details'],
      rows: [{ cells: ['lookup.display', 'Display term from CodeSystem/$lookup (Preferred Term)'] }],
    }],
  },
  {
    title: 'classification (0..*)',
    description: 'ATC code obtained via ConceptMap/$translate from the NMPC product code, enabling EHDS-compliant classification.',
    tables: [{
      headers: ['Source', 'NMPC Property', 'Target System'],
      rows: [{ cells: ['ATC code', 'ConceptMap/$translate', 'http://www.whocc.no/atc'] }],
    }],
  },
  {
    title: 'doseForm (0..1)',
    description: 'Package-level dose form (e.g. "Conventional release oral tablet"). NMPC uses SNOMED CT; EHDS prefers EDQM Standard Terms.',
    tables: [{
      headers: ['Source', 'NMPC Property', 'SNOMED Code'],
      rows: [{ cells: ['Has manufactured dose form', '411116001', 'Resolved from normalForm or flat property'] }],
    }],
  },
  {
    title: 'description (0..1)',
    description: 'Uses Preferred Term (PT) for a cleaner, more readable description instead of FSN.',
    tables: [{
      headers: ['Source', 'Details'],
      rows: [{ cells: ['PT designation', 'Preferred Term from designations'] }],
    }],
  },
  {
    title: 'marketingAuthorisationHolder (0..1)',
    tables: [{
      headers: ['EHDS Sub-field', 'NMPC Property', 'SNOMED Code', 'Details'],
      rows: [
        { cells: ['organisationName', 'Has MAH', '680061000220102', 'Display name from normalForm'] },
        { cells: ['organisationIdentifier', 'Has MAH', '680061000220102', 'SNOMED CT code of MAH organisation'] },
      ],
    }],
  },
  {
    title: 'item (0..*)',
    tables: [],
    subsections: [
      {
        title: 'item.doseForm (0..1)',
        description: 'Manufactured item dose form (e.g. "Film-coated tablet"), distinct from the package-level doseForm.',
        tables: [{
          headers: ['Source', 'NMPC Property', 'SNOMED Code'],
          rows: [{ cells: ['Has basic dose form', '736476002', 'Extracted from normalForm'] }],
        }],
      },
      {
        title: 'item.ingredient (1..*)',
        tables: [{
          headers: ['EHDS Sub-field', 'NMPC Property', 'SNOMED Code', 'Details'],
          rows: [
            { cells: ['isActive', '—', '—', 'Always true for precise active ingredients'] },
            { cells: ['substance', 'Has precise active ingredient', '762949000', 'From normalForm (e.g. "Atorvastatin calcium")'] },
          ],
        }],
      },
      {
        title: 'item.ingredient.strengthInfo',
        tables: [{
          headers: ['EHDS Sub-field', 'NMPC Property', 'SNOMED Code', 'Details'],
          rows: [
            { cells: ['strength.numerator', 'Numerator value + unit', '1142135004 + 732945000', 'e.g. 80 milligram'] },
            { cells: ['strength.denominator', 'Denominator value + unit', '1142136003 + 732947008', 'e.g. 1 Tablet'] },
            { cells: ['basisOfStrengthSubstance', 'Has BoSS', '732943007', 'e.g. "Atorvastatin" (base substance)'] },
          ],
        }],
      },
      {
        title: 'item.unitOfPresentation (0..1)',
        tables: [{
          headers: ['Source', 'NMPC Property', 'SNOMED Code'],
          rows: [{ cells: ['Has unit of presentation', '763032000', 'e.g. "Tablet"'] }],
        }],
      },
    ],
  },
  {
    title: 'characteristic (0..*)',
    description: 'Regulatory and legal properties mapped as EHDS characteristics.',
    tables: [{
      headers: ['Characteristic Type', 'SNOMED Code', 'Example Value'],
      rows: [
        { cells: ['Has licensed route of administration', '680321000220105', '"Oral route"'] },
        { cells: ['Has marketing status', '680051000220104', '"Marketed"'] },
        { cells: ['Has licensing status', '680341000220104', '"Licensing Status - Authorised"'] },
        { cells: ['Has dispensing legal status', '680081000220106', '"Subject to prescription - S1B"'] },
        { cells: ['Has supply legal status', '680771000220105', '"Pharmacy Only"'] },
      ],
    }],
  },
  {
    title: 'device (0..*)',
    description: 'Marked as not applicable when the NMPC product type is "NMPC Medication" (not a device). Device nodes are excluded from coverage and shown dimmed with "N/A" badge.',
    tables: [],
  },
  {
    title: 'batch (0..1)',
    description: 'Not populated from NMPC data. Batch information is typically available during dispense/administration, not from the terminology server.',
    tables: [],
  },
];

const bindings = {
  headers: ['EHDS Field', 'Expected Binding', 'Actual System Used'],
  rows: [
    { cells: ['classification', 'WHO ATC', 'WHO ATC (via $translate)'] },
    { cells: ['doseForm', 'EDQM Standard Terms', 'SNOMED CT (national extension)'] },
    { cells: ['item.doseForm', 'EDQM Standard Terms', 'SNOMED CT (national extension)'] },
    { cells: ['item.ingredient.substance', 'EMA SPOR SMS', 'SNOMED CT (national extension)'] },
    { cells: ['item.ingredient.strengthInfo.basisOfStrengthSubstance', 'EMA SPOR SMS', 'SNOMED CT (national extension)'] },
    { cells: ['item.unitOfPresentation', 'EDQM Standard Terms', 'SNOMED CT (national extension)'] },
  ],
};

const resolutionSteps = [
  { label: 'normalForm parsing', detail: 'Rich code|display| pairs for all relationships (preferred)' },
  { label: 'Flat property fallback', detail: 'Individual property parameters from the $lookup response' },
];
</script>

<template>
  <!-- Backdrop -->
  <Transition name="fade">
    <div
      v-if="visible"
      class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      @click.self="emit('close')"
    >
      <!-- Modal -->
      <Transition name="scale">
        <div
          v-if="visible"
          class="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden"
        >
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
                </svg>
              </div>
              <div>
                <h2 class="text-lg font-bold text-slate-800">Resource Mapping</h2>
                <p class="text-xs text-slate-400">NMPC → EHDS Medication field mappings</p>
              </div>
            </div>
            <button
              class="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
              @click="emit('close')"
              title="Close"
            >
              <svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>

          <!-- Content -->
          <div class="flex-1 overflow-y-auto px-6 py-5 space-y-8">

            <!-- Data Sources -->
            <section>
              <h3 class="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Data Sources</h3>
              <div class="overflow-x-auto rounded-lg border border-slate-200">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="bg-slate-50">
                      <th v-for="h in dataSources.headers" :key="h" class="px-3 py-2 text-left font-semibold text-slate-600 border-b border-slate-200">{{ h }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, i) in dataSources.rows" :key="i" class="border-b border-slate-100 last:border-0">
                      <td v-for="(cell, j) in row.cells" :key="j" class="px-3 py-2 text-slate-600" :class="j === 0 ? 'font-medium font-mono text-xs' : ''">{{ cell }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <!-- Resolution Strategy -->
            <section>
              <h3 class="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Property Resolution Strategy</h3>
              <ol class="space-y-2 ml-1">
                <li v-for="(step, i) in resolutionSteps" :key="i" class="flex gap-3 items-start text-sm">
                  <span class="w-5 h-5 shrink-0 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">{{ i + 1 }}</span>
                  <div>
                    <span class="font-semibold text-slate-700">{{ step.label }}</span>
                    <span class="text-slate-500"> — {{ step.detail }}</span>
                  </div>
                </li>
              </ol>
            </section>

            <!-- EHDS Field Mappings -->
            <section>
              <h3 class="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">EHDS Field Mappings</h3>
              <div class="space-y-6">
                <div v-for="section in sections" :key="section.title">
                  <!-- Section title -->
                  <div class="flex items-center gap-2 mb-2">
                    <span class="text-sm font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md font-mono">{{ section.title }}</span>
                  </div>
                  <!-- Description -->
                  <p v-if="section.description" class="text-sm text-slate-500 mb-2 pl-1">{{ section.description }}</p>
                  <!-- Tables -->
                  <div v-for="(table, ti) in section.tables" :key="ti" class="overflow-x-auto rounded-lg border border-slate-200 mb-3">
                    <table class="w-full text-sm">
                      <thead>
                        <tr class="bg-slate-50">
                          <th v-for="h in table.headers" :key="h" class="px-3 py-2 text-left font-semibold text-slate-600 border-b border-slate-200 text-xs">{{ h }}</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(row, ri) in table.rows" :key="ri" class="border-b border-slate-100 last:border-0">
                          <td v-for="(cell, ci) in row.cells" :key="ci" class="px-3 py-2 text-slate-600 text-xs" :class="ci === 0 ? 'font-medium' : ''">{{ cell }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <!-- Subsections -->
                  <div v-if="section.subsections" class="pl-4 border-l-2 border-slate-100 ml-2 space-y-4 mt-3">
                    <div v-for="sub in section.subsections" :key="sub.title">
                      <div class="flex items-center gap-2 mb-2">
                        <span class="text-xs font-bold text-slate-700 bg-blue-50 px-2 py-0.5 rounded font-mono">{{ sub.title }}</span>
                      </div>
                      <p v-if="sub.description" class="text-xs text-slate-500 mb-2 pl-1">{{ sub.description }}</p>
                      <div v-for="(table, ti) in sub.tables" :key="ti" class="overflow-x-auto rounded-lg border border-slate-200 mb-2">
                        <table class="w-full text-xs">
                          <thead>
                            <tr class="bg-slate-50">
                              <th v-for="h in table.headers" :key="h" class="px-3 py-1.5 text-left font-semibold text-slate-600 border-b border-slate-200">{{ h }}</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="(row, ri) in table.rows" :key="ri" class="border-b border-slate-100 last:border-0">
                              <td v-for="(cell, ci) in row.cells" :key="ci" class="px-3 py-1.5 text-slate-600" :class="ci === 0 ? 'font-medium' : ''">{{ cell }}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <!-- Preferred Binding Indicators -->
            <section>
              <h3 class="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Preferred Binding Indicators</h3>
              <div class="overflow-x-auto rounded-lg border border-slate-200">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="bg-slate-50">
                      <th v-for="h in bindings.headers" :key="h" class="px-3 py-2 text-left font-semibold text-slate-600 border-b border-slate-200 text-xs">{{ h }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, i) in bindings.rows" :key="i" class="border-b border-slate-100 last:border-0">
                      <td v-for="(cell, j) in row.cells" :key="j" class="px-3 py-2 text-slate-600 text-xs" :class="j === 0 ? 'font-mono font-medium' : ''">{{ cell }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p class="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 mt-3">
                <strong>Note:</strong> The NMPC uses SNOMED CT codes from the Irish national extension for dose forms, substances, and units of presentation rather than EDQM or EMA SPOR codes. The binding validation in the UI flags these as mismatches against the EHDS-preferred terminologies.
              </p>
            </section>

          </div>

          <!-- Footer -->
          <div class="px-6 py-3 border-t border-slate-100 bg-slate-50/50 shrink-0 flex justify-end">
            <button
              class="text-sm px-4 py-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors font-medium"
              @click="emit('close')"
            >
              Close
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.scale-enter-active {
  transition: all 0.2s ease-out;
}
.scale-leave-active {
  transition: all 0.15s ease-in;
}
.scale-enter-from {
  opacity: 0;
  transform: scale(0.95);
}
.scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
