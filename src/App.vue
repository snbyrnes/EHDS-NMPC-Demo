<script setup lang="ts">
import { ref } from 'vue';
import { useAppStore } from './stores/appStore';
import SettingsDrawer from './components/SettingsDrawer.vue';
import ChangelogModal from './components/ChangelogModal.vue';
import ResourceMappingModal from './components/ResourceMappingModal.vue';
import LinksModal from './components/LinksModal.vue';
import FeaturesModal from './components/FeaturesModal.vue';
import ExplorerView from './views/ExplorerView.vue';

const store = useAppStore();
const showChangelog = ref(false);
const showMapping = ref(false);
const showLinks = ref(false);
const showFeatures = ref(false);
</script>

<template>
  <div class="h-screen flex flex-col">
    <!-- Header -->
    <header class="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shrink-0">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
          </svg>
        </div>
        <div>
          <h1 class="text-lg font-bold text-slate-800">EHDS FHIR Medication Validator</h1>
          <p class="text-xs text-slate-400">European Health Data Space &middot; NMPC Compliance Demo</p>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <!-- Connection indicator -->
        <div class="flex items-center gap-2 mr-2">
          <span
            class="w-2 h-2 rounded-full"
            :class="store.isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'"
          ></span>
          <span class="text-xs" :class="store.isConnected ? 'text-emerald-600' : 'text-slate-400'">
            {{ store.isConnected ? 'NMPC Connected' : 'Not Connected' }}
          </span>
        </div>

        <!-- Features & Guide button -->
        <button
          class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
          @click="showFeatures = true"
          title="Features & Guide"
        >
          <svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
          </svg>
        </button>

        <!-- Links & Resources button -->
        <button
          class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
          @click="showLinks = true"
          title="Links & Resources"
        >
          <svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" />
          </svg>
        </button>

        <!-- Resource Mapping button -->
        <button
          class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
          @click="showMapping = true"
          title="Resource Mapping"
        >
          <svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
          </svg>
        </button>

        <!-- Changelog button -->
        <button
          class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
          @click="showChangelog = true"
          title="Changelog"
        >
          <svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
          </svg>
        </button>

        <!-- Settings button -->
        <button
          class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
          @click="store.showSettings = true"
          title="NMPC Settings"
        >
          <svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    </header>

    <!-- Main content -->
    <main class="flex-1 overflow-hidden bg-slate-50">
      <ExplorerView />
    </main>

    <!-- Settings drawer -->
    <SettingsDrawer />

    <!-- Changelog modal -->
    <ChangelogModal :visible="showChangelog" @close="showChangelog = false" />

    <!-- Resource Mapping modal -->
    <ResourceMappingModal :visible="showMapping" @close="showMapping = false" />

    <!-- Links & Resources modal -->
    <LinksModal :visible="showLinks" @close="showLinks = false" />

    <!-- Features & Guide modal -->
    <FeaturesModal :visible="showFeatures" @close="showFeatures = false" />
  </div>
</template>
