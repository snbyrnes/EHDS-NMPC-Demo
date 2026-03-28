<script setup lang="ts">
defineProps<{ visible: boolean }>();
const emit = defineEmits<{ close: [] }>();

interface Feature {
  icon: string;
  title: string;
  description: string;
  tips?: string[];
}

interface FeatureGroup {
  heading: string;
  color: { badge: string; accent: string };
  features: Feature[];
}

const groups: FeatureGroup[] = [
  {
    heading: 'Getting Started',
    color: { badge: 'bg-blue-100 text-blue-700', accent: 'border-blue-200' },
    features: [
      {
        icon: '🔑',
        title: 'Connect to the NMPC',
        description: 'Click the gear icon in the header to open Settings. Enter your OAuth2 Client ID and Client Secret for the NMPC Ontoserver. The token endpoint is auto-discovered via SMART well-known configuration.',
        tips: ['The connection indicator turns green when authenticated', 'Credentials are stored in your browser\'s local storage'],
      },
      {
        icon: '🔍',
        title: 'Search for a Medication',
        description: 'Once connected, type a medication name (e.g. "Lipitor", "Paracetamol") in the search box. Results come from the NMPC via a FHIR ValueSet/$expand operation over the Irish medicinal product catalogue.',
        tips: ['Results show NMPC product codes alongside display names', 'Click a result to load and validate the product against the EHDS model'],
      },
    ],
  },
  {
    heading: 'Core Features',
    color: { badge: 'bg-emerald-100 text-emerald-700', accent: 'border-emerald-200' },
    features: [
      {
        icon: '🌳',
        title: 'EHDS Medication Tree',
        description: 'The left panel displays the EHDS Medication Logical Model (v0.3.0) as an interactive tree. Each node represents a field in the European standard. When a medication is loaded, populated fields are highlighted in green with their mapped values.',
        tips: ['Click any row to expand/collapse child nodes', 'Use the Expand All / Collapse All buttons at the top', 'Green background = populated, dimmed + "N/A" = not applicable'],
      },
      {
        icon: '📊',
        title: 'Coverage Summary',
        description: 'The progress bar at the top of the tree shows how many EHDS leaf fields were populated from NMPC data. This gives a quick measure of how well the Irish NMPC covers the European medication model.',
        tips: ['N/A fields (e.g. device for medication-only products) are excluded from the percentage', 'Parent "Base" type nodes auto-complete when all their children are filled'],
      },
      {
        icon: '🔬',
        title: 'Node Detail Inspector',
        description: 'Click the eye icon on any tree row to inspect its full EHDS definition: element path, cardinality, data type, terminology binding, and short description from the StructureDefinition.',
      },
      {
        icon: '✅',
        title: 'Binding Validation',
        description: 'Populated coded values are validated against the EHDS-preferred terminology binding. A green checkmark means the NMPC value matches the expected code system; an amber warning indicates a gap where the NMPC uses a different code system than EHDS recommends.',
        tips: ['Hover over the validation icon to see details', 'Mismatches highlight areas where the NMPC could better align with EHDS expectations (e.g. using EDQM or EMA SPOR instead of national extension codes)'],
      },
    ],
  },
  {
    heading: 'Advanced Features',
    color: { badge: 'bg-purple-100 text-purple-700', accent: 'border-purple-200' },
    features: [
      {
        icon: '⚖️',
        title: 'Medication Comparison',
        description: 'After loading a medication, click "Compare" on a second search result to see a side-by-side diff. The comparison table highlights which EHDS fields differ between the two products.',
      },
      {
        icon: '📋',
        title: 'Raw NMPC Viewer',
        description: 'Switch to the "Raw NMPC" tab in the right panel to view the full CodeSystem/$lookup JSON response. This shows all NMPC concept properties, designations, and the normalForm expression returned by the terminology server.',
      },
      {
        icon: '📤',
        title: 'Export Options',
        description: 'Copy the mapped EHDS resource JSON to clipboard, download it as a .json file, or generate a standalone HTML mapping report with full coverage details.',
        tips: ['The Export Report button is in the Coverage Summary section', 'The Copy/Download buttons are in the EHDS Resource tab'],
      },
      {
        icon: '🔗',
        title: 'Shareable Deep Links',
        description: 'After selecting a medication, the URL updates with its product code (e.g. #/sct/12345). Share this link so others can jump directly to the same NMPC product.',
        tips: ['The link icon next to the medication name copies the deep link to clipboard'],
      },
    ],
  },
  {
    heading: 'How It Works',
    color: { badge: 'bg-amber-100 text-amber-700', accent: 'border-amber-200' },
    features: [
      {
        icon: '🧬',
        title: 'NMPC → EHDS Mapping Pipeline',
        description: 'When you select a medication, the app queries the NMPC via three FHIR calls: CodeSystem/$lookup (retrieving all product properties), ConceptMap/$translate (obtaining ATC classification), and caches the raw response. The data is parsed and mapped onto each EHDS field to measure compliance.',
        tips: ['See the Resource Mapping modal for full field-by-field documentation', 'The app uses normalForm parsing and multiple code systems (SNOMED CT, ATC, UCUM) to populate EHDS fields'],
      },
      {
        icon: '🏷️',
        title: 'Preferred Binding Indicators',
        description: 'Each coded EHDS field specifies a preferred code system (ATC, EDQM, SNOMED, EMA SPOR, UCUM). The validator checks whether the NMPC can supply data in the correct code system, highlighting where the Irish catalogue aligns with — or diverges from — EHDS requirements.',
      },
      {
        icon: '🚫',
        title: 'Not Applicable (N/A) Logic',
        description: 'The NMPC classifies products by type. When a product is a medication (not a device), the device section of the EHDS model is not applicable — these fields are dimmed in the tree and excluded from coverage calculations.',
      },
    ],
  },
];
</script>

<template>
  <Transition name="fade">
    <div
      v-if="visible"
      class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      @click.self="emit('close')"
    >
      <Transition name="scale">
        <div
          v-if="visible"
          class="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden"
        >
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-cyan-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                </svg>
              </div>
              <div>
                <h2 class="text-lg font-bold text-slate-800">Features &amp; Guide</h2>
                <p class="text-xs text-slate-400">How to use the EHDS FHIR Medication Validator</p>
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
            <div v-for="group in groups" :key="group.heading">
              <span :class="[group.color.badge, 'inline-block text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider mb-4']">
                {{ group.heading }}
              </span>

              <div class="space-y-4">
                <div
                  v-for="feature in group.features"
                  :key="feature.title"
                  :class="[group.color.accent, 'border rounded-lg px-4 py-3']"
                >
                  <div class="flex items-start gap-3">
                    <span class="text-xl mt-0.5 shrink-0">{{ feature.icon }}</span>
                    <div class="flex-1 min-w-0">
                      <h4 class="text-sm font-bold text-slate-800 mb-1">{{ feature.title }}</h4>
                      <p class="text-sm text-slate-600 leading-relaxed">{{ feature.description }}</p>
                      <ul v-if="feature.tips?.length" class="mt-2 space-y-1">
                        <li
                          v-for="(tip, i) in feature.tips"
                          :key="i"
                          class="text-xs text-slate-500 flex gap-2"
                        >
                          <span class="text-slate-300 mt-0.5 shrink-0">💡</span>
                          <span>{{ tip }}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-6 py-3 border-t border-slate-100 bg-slate-50/50 shrink-0 flex justify-end">
            <button
              class="text-sm px-4 py-1.5 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition-colors font-medium"
              @click="emit('close')"
            >
              Got it
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
