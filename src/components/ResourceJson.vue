<script setup lang="ts">
import { computed, ref } from 'vue';

const props = defineProps<{
  resource: object | null;
}>();

const jsonString = computed(() => {
  if (!props.resource) return '';
  return JSON.stringify(props.resource, null, 2);
});

const lineCount = computed(() => {
  if (!jsonString.value) return 0;
  return jsonString.value.split('\n').length;
});

const copied = ref(false);

async function copyToClipboard() {
  if (!jsonString.value) return;
  await navigator.clipboard.writeText(jsonString.value);
  copied.value = true;
  setTimeout(() => { copied.value = false; }, 2000);
}

function downloadJson() {
  if (!jsonString.value) return;
  const blob = new Blob([jsonString.value], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'ehds-medication-resource.json';
  a.click();
  URL.revokeObjectURL(url);
}
</script>

<template>
  <div class="bg-white rounded-lg border border-slate-200 overflow-hidden h-full flex flex-col">
    <!-- Header -->
    <div class="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-200">
      <h2 class="text-sm font-semibold text-slate-700">
        Generated EHDS Medication Resource
      </h2>
      <div class="flex items-center gap-2">
        <span v-if="resource" class="text-xs text-slate-400">{{ lineCount }} lines</span>
        <template v-if="resource">
          <button
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
          <button
            class="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded transition-colors"
            title="Download JSON file"
            @click="downloadJson"
          >
            <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </template>
      </div>
    </div>

    <!-- JSON content -->
    <div v-if="resource" class="flex-1 overflow-auto p-4 bg-slate-900 font-mono text-xs leading-relaxed">
      <pre class="text-emerald-400 whitespace-pre-wrap break-words">{{ jsonString }}</pre>
    </div>

    <!-- Empty state -->
    <div v-else class="flex-1 flex items-center justify-center p-8">
      <div class="text-center">
        <svg class="w-12 h-12 text-slate-200 mx-auto mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
        <p class="text-sm text-slate-400">Select a medication to generate the EHDS resource</p>
      </div>
    </div>
  </div>
</template>
