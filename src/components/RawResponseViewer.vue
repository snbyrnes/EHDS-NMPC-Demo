<script setup lang="ts">
import { computed, ref } from 'vue';
import { useAppStore } from '../stores/appStore';

const store = useAppStore();

const jsonString = computed(() => {
  if (!store.rawLookupResponse) return '';
  return JSON.stringify(store.rawLookupResponse, null, 2);
});

const propertyCount = computed(() => store.rawLookupResponse?.properties.length ?? 0);
const designationCount = computed(() => store.rawLookupResponse?.designations.length ?? 0);

const copied = ref(false);

async function copyToClipboard() {
  if (!jsonString.value) return;
  await navigator.clipboard.writeText(jsonString.value);
  copied.value = true;
  setTimeout(() => { copied.value = false; }, 2000);
}
</script>

<template>
  <div class="bg-white rounded-lg border border-slate-200 overflow-hidden h-full flex flex-col">
    <!-- Header -->
    <div class="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-200">
      <h2 class="text-sm font-semibold text-slate-700">
        Raw NMPC Response
      </h2>
      <div class="flex items-center gap-2">
        <span v-if="store.rawLookupResponse" class="text-xs text-slate-400">
          {{ propertyCount }} props &middot; {{ designationCount }} desig.
        </span>
        <button
          v-if="store.rawLookupResponse"
          class="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded transition-colors"
          :title="copied ? 'Copied!' : 'Copy to clipboard'"
          @click="copyToClipboard"
        >
          <svg v-if="!copied" class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
            <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z" />
          </svg>
          <svg v-else class="w-4 h-4 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Content -->
    <div v-if="store.rawLookupResponse" class="flex-1 overflow-auto p-4 bg-slate-900 font-mono text-xs leading-relaxed">
      <pre class="text-blue-300 whitespace-pre-wrap break-words">{{ jsonString }}</pre>
    </div>

    <!-- Empty state -->
    <div v-else class="flex-1 flex items-center justify-center p-8">
      <div class="text-center">
        <svg class="w-12 h-12 text-slate-200 mx-auto mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
        </svg>
        <p class="text-sm text-slate-400">Select a medication to view the raw NMPC response</p>
      </div>
    </div>
  </div>
</template>
