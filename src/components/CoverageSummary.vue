<script setup lang="ts">
import { useAppStore } from '../stores/appStore';
import { generateMappingReport, downloadReport } from '../services/reportGenerator';

const store = useAppStore();

function exportReport() {
  if (!store.selectedMedication || !store.medicationResource) return;
  const html = generateMappingReport({
    medication: store.selectedMedication,
    resource: store.medicationResource,
    treeRoots: store.treeRoots,
    populationStats: store.populationStats,
    generatedAt: new Date().toLocaleString(),
  });
  const safeName = store.selectedMedication.display.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
  downloadReport(html, `ehds-mapping-report-${safeName}.html`);
}
</script>

<template>
  <div
    v-if="store.selectedMedication"
    class="flex items-center gap-3 px-4 py-2 bg-white border border-slate-200 rounded-lg"
  >
    <span class="text-xs font-medium text-slate-500">Coverage:</span>

    <!-- Progress bar -->
    <div class="flex-1 max-w-xs h-2 bg-slate-100 rounded-full overflow-hidden">
      <div
        class="h-full rounded-full transition-all duration-500 ease-out"
        :class="store.populationStats.percentage > 50 ? 'bg-emerald-500' : store.populationStats.percentage > 20 ? 'bg-amber-500' : 'bg-red-400'"
        :style="{ width: `${store.populationStats.percentage}%` }"
      ></div>
    </div>

    <!-- Stats text -->
    <span class="text-xs text-slate-600 font-medium whitespace-nowrap">
      {{ store.populationStats.populated }} of {{ store.populationStats.total }} fields
    </span>
    <span
      v-if="store.populationStats.notApplicable > 0"
      class="text-xs text-slate-400 font-medium whitespace-nowrap italic"
      title="Fields excluded as not applicable for this product type"
    >
      ({{ store.populationStats.notApplicable }} N/A)
    </span>
    <span
      class="text-xs font-bold px-1.5 py-0.5 rounded"
      :class="store.populationStats.percentage > 50 ? 'text-emerald-700 bg-emerald-50' : store.populationStats.percentage > 20 ? 'text-amber-700 bg-amber-50' : 'text-red-700 bg-red-50'"
    >
      {{ store.populationStats.percentage }}%
    </span>

    <!-- Export Report button -->
    <button
      v-if="store.medicationResource"
      class="text-xs px-2.5 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded transition-colors font-medium whitespace-nowrap ml-auto"
      title="Export full mapping report as HTML"
      @click="exportReport"
    >
      Export Report
    </button>
  </div>
</template>
