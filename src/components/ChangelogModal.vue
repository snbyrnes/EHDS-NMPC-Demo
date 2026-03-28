<script setup lang="ts">
import { ref, computed } from 'vue';

const props = defineProps<{ visible: boolean }>();
const emit = defineEmits<{ close: [] }>();

interface ChangelogEntry {
  version: string;
  date: string;
  sections: { heading: string; items: string[] }[];
}

const changelog = ref<ChangelogEntry[]>([
  {
    version: '0.7.0',
    date: '2026-03-28',
    sections: [
      { heading: 'Added', items: [
        'Features & Guide modal — in-app walkthrough of all key features and usage',
        'Links & Resources modal — curated external links to NMPC, EHDS, terminology standards, FHIR, and classification resources',
        'Resource Mapping modal — in-app documentation of all NMPC → EHDS field mappings',
        'Parent completion logic — Base-type parent nodes auto-marked as complete when all children are populated',
      ]},
      { heading: 'Changed', items: [
        'Renamed "Terminology Bindings" to "Preferred Binding Indicators" across the app',
        'Irish NMPC section moved to first position in Links & Resources',
        'Updated NMPC info URL and replaced SNOMED CT Browser with ECL Specification link',
        'Removed AEHRC link from resources',
      ]},
    ],
  },
  {
    version: '0.6.0',
    date: '2026-03-28',
    sections: [
      { heading: 'Added', items: [
        'In-app changelog modal accessible from the header',
        'README with project overview, features, tech stack, and setup instructions',
      ]},
    ],
  },
  {
    version: '0.5.0',
    date: '2026-03-28',
    sections: [
      { heading: 'Added', items: [
        'Resource mapping documentation (RESOURCE_MAPPING.md) covering all NMPC → EHDS field mappings',
      ]},
      { heading: 'Changed', items: [
        'Device field and sub-properties marked as Not Applicable (N/A) when NMPC product type is "NMPC Medication"',
        'N/A fields excluded from coverage percentage calculation',
        'N/A fields shown dimmed with italic "N/A" badge in the tree',
      ]},
    ],
  },
  {
    version: '0.4.0',
    date: '2026-03-28',
    sections: [
      { heading: 'Changed', items: [
        'Classification now uses ConceptMap/$translate (NMPC → ATC) instead of flat property lookup',
        'Dose form mapped from "Has manufactured dose form" via normalForm parsing',
        'Description uses Preferred Term (PT) instead of Fully Specified Name (FSN)',
        'Marketing Authorisation Holder mapped from "Has MAH" with org name and SNOMED identifier',
        'Ingredients extracted from normalForm: precise active ingredient, basis of strength, structured strength',
        'Item dose form mapped from "Has basic dose form"',
        'Product authorisation number added as Identifier on identifyingCode',
      ]},
      { heading: 'Added', items: [
        'NormalForm expression parsing engine for rich code+display extraction',
        'Two-tier property resolution: normalForm first, flat property fallback',
        'Five regulatory characteristics: route, marketing status, licensing status, dispensing/supply legal status',
        'ConceptMap/$translate for ATC classification lookup from NMPC codes',
        'Basis of strength substance field populated in tree and resource',
      ]},
    ],
  },
  {
    version: '0.3.0',
    date: '2026-03-28',
    sections: [
      { heading: 'Added', items: [
        'Medication Comparison Mode — side-by-side diff of two medications',
        'Binding Validation Indicators — checkmark, warning, or question mark on populated values',
        'Raw NMPC Response Viewer — tabbed panel with full $lookup JSON',
        'Shareable Deep Links — URL hash #/sct/{code} for direct medication linking',
        'Export Mapping Report — standalone HTML report with coverage and JSON',
      ]},
    ],
  },
  {
    version: '0.2.0',
    date: '2026-03-28',
    sections: [
      { heading: 'Added', items: [
        'Welcome Panel — centred onboarding when not connected',
        'Node Detail Inspector — click-to-inspect definition, cardinality, type, binding',
        'Copy/Download JSON — clipboard copy or .json download of EHDS resource',
        'Result Count & Clear Selection — search count badge and clear button',
        'Coverage Summary — progress bar with field count and percentage',
      ]},
      { heading: 'Changed', items: [
        'Layout split adjusted from 60/40 to 75/25',
        'Removed inline node.short text from tree rows',
      ]},
    ],
  },
  {
    version: '0.1.0',
    date: '2026-03-28',
    sections: [
      { heading: 'Added', items: [
        'Initial scaffold: Vue 3 + TypeScript + Vite + Tailwind CSS v4 + Pinia',
        'EHDS Medication StructureDefinition (v0.3.0) loaded and parsed into interactive tree',
        'NMPC Ontoserver connection via OAuth2 client credentials flow',
        'Token endpoint auto-discovery via SMART well-known and CapabilityStatement',
        'Medication search via ValueSet/$expand (SNOMED CT isa/763158003)',
        'CodeSystem/$lookup with property=* for full concept details',
        'Basic field mapping: identifyingCode, productName, classification, doseForm, description, ingredients',
        'Settings drawer, binding legend, expand/collapse all, app rename to EHDS FHIR Medication Validator',
      ]},
    ],
  },
]);

const sectionColors: Record<string, { bg: string; text: string }> = {
  Added: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  Changed: { bg: 'bg-blue-100', text: 'text-blue-700' },
  Fixed: { bg: 'bg-amber-100', text: 'text-amber-700' },
  Removed: { bg: 'bg-red-100', text: 'text-red-700' },
};

function getSectionStyle(heading: string) {
  return sectionColors[heading] ?? { bg: 'bg-slate-100', text: 'text-slate-700' };
}
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
          class="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden"
        >
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
                </svg>
              </div>
              <div>
                <h2 class="text-lg font-bold text-slate-800">Changelog</h2>
                <p class="text-xs text-slate-400">What's new in EHDS FHIR Medication Validator</p>
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
          <div class="flex-1 overflow-y-auto px-6 py-4 space-y-6">
            <div
              v-for="entry in changelog"
              :key="entry.version"
              class="relative"
            >
              <!-- Version header -->
              <div class="flex items-center gap-3 mb-3">
                <span class="text-sm font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md font-mono">
                  v{{ entry.version }}
                </span>
                <span class="text-xs text-slate-400">{{ entry.date }}</span>
                <span
                  v-if="entry === changelog[0]"
                  class="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full"
                >
                  Latest
                </span>
              </div>

              <!-- Sections -->
              <div class="space-y-3 pl-2 border-l-2 border-slate-100 ml-1">
                <div v-for="section in entry.sections" :key="section.heading">
                  <span
                    :class="[getSectionStyle(section.heading).bg, getSectionStyle(section.heading).text]"
                    class="inline-block text-xs font-semibold px-2 py-0.5 rounded mb-1.5"
                  >
                    {{ section.heading }}
                  </span>
                  <ul class="space-y-1 ml-1">
                    <li
                      v-for="(item, idx) in section.items"
                      :key="idx"
                      class="text-sm text-slate-600 flex gap-2"
                    >
                      <span class="text-slate-300 mt-1 shrink-0">&bull;</span>
                      <span>{{ item }}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-6 py-3 border-t border-slate-100 bg-slate-50/50 shrink-0 flex justify-end">
            <button
              class="text-sm px-4 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
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
