<script setup lang="ts">
import type { EHDSTreeNode } from '../types/ehds';
import { classifyBinding, BINDING_COLORS } from '../types/ehds';

const props = defineProps<{
  node: EHDSTreeNode;
}>();

const emit = defineEmits<{
  toggle: [node: EHDSTreeNode];
  inspect: [node: EHDSTreeNode];
}>();

function toggle() {
  emit('toggle', props.node);
}

function inspect(event: Event) {
  event.stopPropagation();
  emit('inspect', props.node);
}

function formatTypes(types: string[]): string {
  return types
    .map(t => {
      if (t.includes('/')) return t.split('/').pop() ?? t;
      return t;
    })
    .join(' | ');
}

function getBindingStyle(node: EHDSTreeNode) {
  const cat = classifyBinding(node.binding?.description);
  if (!cat) return null;
  return BINDING_COLORS[cat];
}
</script>

<template>
  <div
    class="flex items-start gap-1 py-1.5 px-2 hover:bg-slate-50 rounded-md cursor-pointer group transition-colors"
    :class="{
      'bg-emerald-50/60 hover:bg-emerald-50': node.populatedValue && !node.notApplicable,
      'opacity-45': node.notApplicable,
    }"
    :style="{ paddingLeft: `${node.depth * 20 + 8}px` }"
    @click="toggle"
  >
    <!-- Expand/collapse icon -->
    <span class="w-4 h-4 flex items-center justify-center shrink-0 mt-0.5">
      <template v-if="node.children.length > 0">
        <svg
          class="w-3 h-3 text-slate-400 transition-transform"
          :class="{ 'rotate-90': node.isExpanded }"
          viewBox="0 0 12 12"
          fill="currentColor"
        >
          <path d="M4.5 2l4 4-4 4V2z" />
        </svg>
      </template>
      <template v-else>
        <span class="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
      </template>
    </span>

    <!-- Element name -->
    <span class="font-mono text-sm font-medium text-slate-800 shrink-0" :title="node.definition">
      {{ node.name }}
    </span>

    <!-- Cardinality badge -->
    <span
      v-if="node.depth > 0"
      class="text-xs text-slate-400 font-mono shrink-0 mt-0.5"
    >
      {{ node.cardinality }}
    </span>

    <!-- Type badge -->
    <span
      v-if="node.types.length > 0 && node.depth > 0"
      class="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono shrink-0"
    >
      {{ formatTypes(node.types) }}
    </span>

    <!-- Binding badge -->
    <span
      v-if="getBindingStyle(node)"
      :class="[
        getBindingStyle(node)!.bg,
        getBindingStyle(node)!.text,
        getBindingStyle(node)!.border,
        'text-xs px-1.5 py-0.5 rounded-full border font-medium shrink-0'
      ]"
    >
      {{ getBindingStyle(node)!.label }}
    </span>

    <!-- Inspect button -->
    <button
      v-if="node.depth > 0"
      class="p-0.5 text-slate-300 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all shrink-0"
      title="Inspect element details"
      @click="inspect($event)"
    >
      <svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
        <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
      </svg>
    </button>

    <!-- Spacer to push populated value right -->
    <span class="ml-auto"></span>

    <!-- N/A badge -->
    <span
      v-if="node.notApplicable"
      class="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md ml-2 shrink-0 italic"
      title="Not applicable for this product type"
    >
      N/A
    </span>

    <!-- Populated value -->
    <div
      v-if="node.populatedValue && !node.notApplicable"
      class="flex items-center gap-1 ml-2 shrink-0"
    >
      <!-- Validation indicator -->
      <span
        v-if="node.populatedValue.validation === 'valid'"
        class="text-emerald-600 shrink-0"
        title="Code system matches expected binding"
      >
        <svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
      </span>
      <span
        v-else-if="node.populatedValue.validation === 'mismatch'"
        class="text-amber-500 shrink-0"
        :title="node.populatedValue.validationMessage || 'Code system does not match expected binding'"
      >
        <svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
      </span>
      <span
        v-else-if="node.populatedValue.validation === 'unknown'"
        class="text-slate-400 shrink-0"
        title="Unable to validate code system against binding"
      >
        <svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
        </svg>
      </span>

      <span class="text-xs font-medium text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md max-w-xs truncate">
        {{ node.populatedValue.display }}
      </span>
      <span
        v-if="node.populatedValue.code"
        class="text-xs text-emerald-600 font-mono"
      >
        ({{ node.populatedValue.code }})
      </span>
    </div>
  </div>
</template>
