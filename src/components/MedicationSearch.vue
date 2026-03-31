<script setup lang="ts">
import { ref, watch } from 'vue';
import { useAppStore } from '../stores/appStore';
import type { NMPCSearchResult } from '../types/ehds';

const store = useAppStore();
const query = ref('');
const compareQuery = ref('');
const showCompareSearch = ref(false);
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let compareDebounceTimer: ReturnType<typeof setTimeout> | null = null;

// Compare search results (separate from main search)
const compareResults = ref<NMPCSearchResult[]>([]);
const isSearchingCompare = ref(false);

watch(() => store.prescribingMode, () => {
  store.searchResults = [];
  store.searchError = '';
  if (query.value.trim()) {
    store.searchMedications(query.value);
  }
});

watch(query, (val) => {
  if (debounceTimer) clearTimeout(debounceTimer);
  if (!val.trim()) {
    store.searchResults = [];
    return;
  }
  debounceTimer = setTimeout(() => {
    store.searchMedications(val);
  }, 350);
});

watch(compareQuery, (val) => {
  if (compareDebounceTimer) clearTimeout(compareDebounceTimer);
  if (!val.trim()) {
    compareResults.value = [];
    return;
  }
  compareDebounceTimer = setTimeout(async () => {
    isSearchingCompare.value = true;
    try {
      compareResults.value = await store.searchMedicationsRaw(val);
    } catch {
      compareResults.value = [];
    } finally {
      isSearchingCompare.value = false;
    }
  }, 350);
});

function selectResult(result: NMPCSearchResult) {
  store.selectMedication(result);
}

function selectForComparison(result: NMPCSearchResult) {
  store.selectForComparison(result);
  showCompareSearch.value = false;
  compareQuery.value = '';
  compareResults.value = [];
}

function clearSelection() {
  store.clearSelection();
  query.value = '';
}

function toggleCompareSearch() {
  showCompareSearch.value = !showCompareSearch.value;
  if (!showCompareSearch.value) {
    compareQuery.value = '';
    compareResults.value = [];
  }
}

const linkCopied = ref(false);

async function copyDeepLink() {
  if (!store.selectedMedication) return;
  const url = `${window.location.origin}${window.location.pathname}#/sct/${store.selectedMedication.code}`;
  await navigator.clipboard.writeText(url);
  linkCopied.value = true;
  setTimeout(() => { linkCopied.value = false; }, 2000);
}
</script>

<template>
  <div class="bg-white rounded-lg border border-slate-200 overflow-hidden">
    <!-- Search input -->
    <div class="px-4 py-3 border-b border-slate-200">
      <!-- Prescribing mode toggle -->
      <div class="flex items-center gap-1 mb-2 bg-slate-100 rounded-md p-0.5 w-fit">
        <button
          class="px-3 py-1 text-xs font-medium rounded transition-colors"
          :class="store.prescribingMode === 'virtual' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
          @click="store.prescribingMode = 'virtual'"
        >
          Virtual Prescribing
        </button>
        <button
          class="px-3 py-1 text-xs font-medium rounded transition-colors"
          :class="store.prescribingMode === 'actual' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
          @click="store.prescribingMode = 'actual'"
        >
          Actual Prescribing
        </button>
      </div>
      <div class="relative">
        <svg
          class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
        </svg>
        <input
          v-model="query"
          type="text"
          placeholder="Search medications (e.g. paracetamol, amoxicillin)..."
          class="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          :disabled="!store.isConnected"
        />
        <span v-if="store.isSearching" class="absolute right-3 top-1/2 -translate-y-1/2">
          <svg class="w-4 h-4 text-blue-500 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </span>
      </div>
      <p v-if="!store.isConnected" class="mt-1 text-xs text-amber-600">
        Connect to the NMPC server first using the settings panel.
      </p>
    </div>

    <!-- Selected medication -->
    <div v-if="store.selectedMedication" class="px-4 py-2 bg-blue-50 border-b border-blue-200">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-blue-900">{{ store.selectedMedication.display }}</p>
          <p class="text-xs text-blue-600 font-mono">{{ store.selectedMedication.code }}</p>
        </div>
        <div class="flex items-center gap-2">
          <span v-if="store.isLoadingDetails" class="text-xs text-blue-500">Loading...</span>
          <button
            class="text-xs px-2 py-1 rounded transition-colors font-medium"
            :class="linkCopied ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
            title="Copy shareable deep link"
            @click="copyDeepLink"
          >
            {{ linkCopied ? 'Copied!' : 'Link' }}
          </button>
          <button
            class="text-xs px-2 py-1 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded transition-colors font-medium"
            :title="store.comparedMedication ? 'Change comparison medication' : 'Compare with another medication'"
            @click="toggleCompareSearch"
          >
            {{ store.comparedMedication ? 'Change Compare' : 'Compare' }}
          </button>
          <button
            class="p-1 text-blue-400 hover:text-blue-700 hover:bg-blue-100 rounded transition-colors"
            title="Clear selection and search again"
            @click="clearSelection"
          >
            <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Compared medication info -->
      <div v-if="store.comparedMedication" class="mt-2 flex items-center justify-between bg-purple-50 -mx-4 px-4 py-1.5 border-t border-purple-200">
        <div>
          <p class="text-xs text-purple-500 font-medium">Comparing with:</p>
          <p class="text-sm font-medium text-purple-900">{{ store.comparedMedication.display }}</p>
          <p class="text-xs text-purple-600 font-mono">{{ store.comparedMedication.code }}</p>
        </div>
        <button
          class="p-1 text-purple-400 hover:text-purple-700 rounded transition-colors"
          title="Remove comparison"
          @click="store.clearComparison()"
        >
          <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Compare search (inline) -->
    <div v-if="showCompareSearch" class="border-b border-purple-200 bg-purple-50/50">
      <div class="px-4 py-2">
        <input
          v-model="compareQuery"
          type="text"
          placeholder="Search for a medication to compare..."
          class="w-full px-3 py-1.5 border border-purple-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>
      <div v-if="isSearchingCompare" class="px-4 py-2 text-xs text-purple-500">Searching...</div>
      <div v-if="compareResults.length > 0" class="max-h-48 overflow-y-auto divide-y divide-purple-100">
        <button
          v-for="result in compareResults"
          :key="result.code"
          class="w-full text-left px-4 py-2 hover:bg-purple-100 transition-colors"
          @click="selectForComparison(result)"
        >
          <p class="text-sm text-slate-800">{{ result.display }}</p>
          <p class="text-xs text-slate-400 font-mono mt-0.5">{{ result.code }}</p>
        </button>
      </div>
    </div>

    <!-- Search results -->
    <div v-if="store.searchResults.length > 0 && !store.selectedMedication">
      <div class="px-4 py-1.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
        <span class="text-xs text-slate-500 font-medium">{{ store.searchResults.length }} result{{ store.searchResults.length !== 1 ? 's' : '' }}</span>
      </div>
      <div class="max-h-64 overflow-y-auto divide-y divide-slate-100">
      <button
        v-for="result in store.searchResults"
        :key="result.code"
        class="w-full text-left px-4 py-2.5 hover:bg-slate-50 transition-colors"
        @click="selectResult(result)"
      >
        <p class="text-sm text-slate-800">{{ result.display }}</p>
        <p class="text-xs text-slate-400 font-mono mt-0.5">{{ result.system }} | {{ result.code }}</p>
      </button>
      </div>
    </div>

    <!-- Search error -->
    <div v-if="store.searchError" class="px-4 py-3 bg-red-50">
      <p class="text-sm text-red-700">{{ store.searchError }}</p>
    </div>

    <!-- Empty state -->
    <div
      v-if="store.isConnected && !store.isSearching && query.length > 2 && store.searchResults.length === 0 && !store.selectedMedication && !store.searchError"
      class="px-4 py-6 text-center"
    >
      <p class="text-sm text-slate-400">No results found for "{{ query }}"</p>
    </div>
  </div>
</template>
