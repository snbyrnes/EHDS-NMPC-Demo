<script setup lang="ts">
const props = defineProps<{ visible: boolean }>();
const emit = defineEmits<{ close: [] }>();

interface LinkItem {
  title: string;
  url: string;
  description: string;
}

interface LinkGroup {
  heading: string;
  icon: string;
  color: { bg: string; text: string; iconBg: string };
  links: LinkItem[];
}

const groups: LinkGroup[] = [
  {
    heading: 'Irish NMPC',
    icon: '☘️',
    color: { bg: 'bg-green-50', text: 'text-green-700', iconBg: 'bg-green-100' },
    links: [
      {
        title: 'NMPC Ontoserver (Production)',
        url: 'https://nmpc.hse.ie/production1/fhir',
        description: 'FHIR R5 terminology server hosting the Irish National Medication Product Catalogue',
      },
      {
        title: 'HSE National Medication Product Catalogue',
        url: 'https://about.hse.ie/our-work/technology/national-medicinal-product-catalogue-nmpc/',
        description: 'HSE information on the NMPC in Ireland',
      },
      {
        title: 'HPRA (Health Products Regulatory Authority)',
        url: 'https://www.hpra.ie/',
        description: 'Irish authority responsible for medicinal product authorisation',
      },
    ],
  },
  {
    heading: 'EHDS & European Standards',
    icon: '🇪🇺',
    color: { bg: 'bg-blue-50', text: 'text-blue-700', iconBg: 'bg-blue-100' },
    links: [
      {
        title: 'EHDS Medication Logical Model (v0.3.0)',
        url: 'https://www.xt-ehr.eu/fhir/models/StructureDefinition-EHDSMedication.html',
        description: 'StructureDefinition used by this tool to build the EHDS tree',
      },
      {
        title: 'X-eHealth / XT-EHR Project',
        url: 'https://www.xt-ehr.eu/',
        description: 'Cross-border eHealth standards for the European Health Data Space',
      },
      {
        title: 'European Health Data Space (EHDS) Regulation',
        url: 'https://health.ec.europa.eu/ehealth-digital-health-and-care/european-health-data-space_en',
        description: 'EU regulation establishing the European Health Data Space',
      },
    ],
  },
  {
    heading: 'Terminology Standards',
    icon: '🏥',
    color: { bg: 'bg-emerald-50', text: 'text-emerald-700', iconBg: 'bg-emerald-100' },
    links: [
      {
        title: 'SNOMED International',
        url: 'https://www.snomed.org/',
        description: 'SNOMED CT — the code system underpinning the NMPC product catalogue',
      },
      {
        title: 'SNOMED CT ECL Specification',
        url: 'https://docs.snomed.org/snomed-ct-specifications/snomed-ct-expression-constraint-language',
        description: 'Expression Constraint Language used for querying NMPC content',
      },
      {
        title: 'IHTSDO / SNOMED on GitHub',
        url: 'https://github.com/IHTSDO',
        description: 'Open-source tools and specifications for SNOMED CT terminology',
      },
    ],
  },
  {
    heading: 'FHIR & Interoperability',
    icon: '🔥',
    color: { bg: 'bg-orange-50', text: 'text-orange-700', iconBg: 'bg-orange-100' },
    links: [
      {
        title: 'HL7 FHIR R5 Specification',
        url: 'https://hl7.org/fhir/R5/',
        description: 'The FHIR R5 standard used by the NMPC Ontoserver',
      },
      {
        title: 'FHIR Terminology Services',
        url: 'https://hl7.org/fhir/R5/terminology-service.html',
        description: 'Specification for ValueSet/$expand, CodeSystem/$lookup, ConceptMap/$translate',
      },
      {
        title: 'FHIR Medication Resource',
        url: 'https://hl7.org/fhir/R5/medication.html',
        description: 'The base FHIR Medication resource definition',
      },
      {
        title: 'SMART App Launch (OAuth2)',
        url: 'https://hl7.org/fhir/smart-app-launch/',
        description: 'SMART on FHIR authorization — used for token endpoint discovery',
      },
    ],
  },
  {
    heading: 'Classification & Reference Data',
    icon: '📋',
    color: { bg: 'bg-purple-50', text: 'text-purple-700', iconBg: 'bg-purple-100' },
    links: [
      {
        title: 'WHO ATC Classification',
        url: 'https://www.whocc.no/atc_ddd_index/',
        description: 'Anatomical Therapeutic Chemical classification system used for medication classification',
      },
      {
        title: 'EDQM Standard Terms',
        url: 'https://standardterms.edqm.eu/',
        description: 'European pharmacopoeia standard terms for dose forms, routes, and units',
      },
      {
        title: 'EMA SPOR Substance Management Services',
        url: 'https://spor.ema.europa.eu/smswi/',
        description: 'EMA reference data for substances — the EHDS-preferred binding for ingredients',
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
              <div class="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" />
                </svg>
              </div>
              <div>
                <h2 class="text-lg font-bold text-slate-800">Links &amp; Resources</h2>
                <p class="text-xs text-slate-400">Standards, specifications, and reference material</p>
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
          <div class="flex-1 overflow-y-auto px-6 py-5 space-y-6">
            <div
              v-for="group in groups"
              :key="group.heading"
            >
              <div class="flex items-center gap-2 mb-3">
                <span class="text-base">{{ group.icon }}</span>
                <h3 class="text-sm font-bold text-slate-700 uppercase tracking-wider">{{ group.heading }}</h3>
              </div>
              <div class="grid gap-2">
                <a
                  v-for="link in group.links"
                  :key="link.url"
                  :href="link.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  :class="[group.color.bg, 'rounded-lg px-4 py-3 block hover:ring-2 hover:ring-offset-1 transition-all group/link']"
                  :style="{ '--tw-ring-color': group.color.text === 'text-blue-700' ? '#3b82f6' : group.color.text === 'text-emerald-700' ? '#10b981' : group.color.text === 'text-green-700' ? '#22c55e' : group.color.text === 'text-orange-700' ? '#f97316' : '#8b5cf6' }"
                >
                  <div class="flex items-start gap-3">
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2">
                        <span :class="[group.color.text, 'text-sm font-semibold group-hover/link:underline']">
                          {{ link.title }}
                        </span>
                        <svg class="w-3.5 h-3.5 text-slate-400 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                          <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                        </svg>
                      </div>
                      <p class="text-xs text-slate-500 mt-0.5">{{ link.description }}</p>
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-6 py-3 border-t border-slate-100 bg-slate-50/50 shrink-0 flex justify-end">
            <button
              class="text-sm px-4 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors font-medium"
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
