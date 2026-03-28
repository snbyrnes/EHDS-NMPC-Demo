<script setup lang="ts">
import { useAppStore } from '../stores/appStore';
import BindingLegend from '../components/BindingLegend.vue';
import ModelTree from '../components/ModelTree.vue';
import MedicationSearch from '../components/MedicationSearch.vue';
import ResourceJson from '../components/ResourceJson.vue';
import WelcomePanel from '../components/WelcomePanel.vue';
import NodeDetail from '../components/NodeDetail.vue';
import CoverageSummary from '../components/CoverageSummary.vue';
import RawResponseViewer from '../components/RawResponseViewer.vue';
import ComparisonView from '../components/ComparisonView.vue';
import { ref } from 'vue';

const store = useAppStore();
const activeTab = ref<'tree' | 'json'>('tree');
const rightTab = ref<'json' | 'raw'>('json');
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- Binding legend -->
    <BindingLegend />

    <!-- Welcome panel when not connected -->
    <div v-if="!store.isConnected" class="flex-1 flex items-center justify-center p-8">
      <WelcomePanel />
    </div>

    <!-- Main content (only when connected) -->
    <div v-else class="flex-1 overflow-hidden p-4 flex flex-col lg:flex-row gap-4">
      <!-- Left panel: Search + Coverage + Tree + Comparison + NodeDetail -->
      <div class="flex flex-col gap-3 lg:w-3/4 min-h-0">
        <!-- Search -->
        <MedicationSearch />

        <!-- Coverage summary -->
        <CoverageSummary />

        <!-- Comparison view (when comparing) -->
        <ComparisonView v-if="store.comparedMedication" />

        <!-- Mobile tabs -->
        <div class="flex gap-1 lg:hidden bg-slate-100 p-1 rounded-lg">
          <button
            class="flex-1 text-sm py-1.5 rounded-md transition-colors"
            :class="activeTab === 'tree' ? 'bg-white text-slate-800 shadow-sm font-medium' : 'text-slate-500'"
            @click="activeTab = 'tree'"
          >
            Model Tree
          </button>
          <button
            class="flex-1 text-sm py-1.5 rounded-md transition-colors"
            :class="activeTab === 'json' ? 'bg-white text-slate-800 shadow-sm font-medium' : 'text-slate-500'"
            @click="activeTab = 'json'"
          >
            JSON Output
          </button>
        </div>

        <!-- Tree (visible on large screens always, on mobile only when tab active) -->
        <div class="flex-1 min-h-0 overflow-hidden" :class="{ 'hidden lg:block': activeTab !== 'tree' }">
          <ModelTree :roots="store.treeRoots" />
        </div>

        <!-- Node detail panel (below tree) -->
        <NodeDetail />
      </div>

      <!-- Right panel: JSON output / Raw response tabbed -->
      <div class="lg:w-1/4 min-h-0 flex flex-col" :class="{ 'hidden lg:flex': activeTab !== 'json', 'flex flex-1': activeTab === 'json' }">
        <!-- Right panel tab bar -->
        <div class="flex bg-slate-100 p-0.5 rounded-t-lg border border-b-0 border-slate-200">
          <button
            class="flex-1 text-xs py-1.5 rounded-md transition-colors"
            :class="rightTab === 'json' ? 'bg-white text-slate-800 shadow-sm font-medium' : 'text-slate-500'"
            @click="rightTab = 'json'"
          >
            EHDS Resource
          </button>
          <button
            class="flex-1 text-xs py-1.5 rounded-md transition-colors"
            :class="rightTab === 'raw' ? 'bg-white text-slate-800 shadow-sm font-medium' : 'text-slate-500'"
            @click="rightTab = 'raw'"
          >
            Raw NMPC
          </button>
        </div>

        <!-- Tab content -->
        <div class="flex-1 min-h-0">
          <ResourceJson v-if="rightTab === 'json'" :resource="store.medicationResource" />
          <RawResponseViewer v-else />
        </div>
      </div>
    </div>
  </div>
</template>
