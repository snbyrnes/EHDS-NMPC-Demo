<script setup lang="ts">
import { useAppStore } from '../stores/appStore';
import { classifyBinding, BINDING_COLORS } from '../types/ehds';
import { computed } from 'vue';

const store = useAppStore();
const node = computed(() => store.inspectedNode);

const bindingInfo = computed(() => {
  if (!node.value?.binding) return null;
  const cat = classifyBinding(node.value.binding.description);
  return {
    strength: node.value.binding.strength,
    description: node.value.binding.description,
    category: cat,
    colors: cat ? BINDING_COLORS[cat] : null,
  };
});
</script>

<template>
  <Transition name="slide-up">
    <div
      v-if="node"
      class="bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden"
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-200">
        <h3 class="text-sm font-semibold text-slate-700 truncate">
          <span class="font-mono">{{ node.name }}</span>
          <span class="text-slate-400 font-normal ml-1">{{ node.cardinality }}</span>
        </h3>
        <button
          class="text-slate-400 hover:text-slate-600 transition-colors shrink-0 ml-2"
          @click="store.inspectedNode = null"
        >
          <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>

      <div class="px-4 py-3 space-y-3 max-h-64 overflow-y-auto text-sm">
        <!-- Path -->
        <div>
          <span class="text-xs font-medium text-slate-500 uppercase tracking-wide">Path</span>
          <p class="font-mono text-xs text-slate-700 mt-0.5">{{ node.path }}</p>
        </div>

        <!-- Definition -->
        <div v-if="node.definition">
          <span class="text-xs font-medium text-slate-500 uppercase tracking-wide">Definition</span>
          <p class="text-xs text-slate-600 mt-0.5 leading-relaxed">{{ node.definition }}</p>
        </div>

        <!-- Types -->
        <div v-if="node.types.length > 0">
          <span class="text-xs font-medium text-slate-500 uppercase tracking-wide">Type(s)</span>
          <div class="flex flex-wrap gap-1 mt-0.5">
            <span
              v-for="t in node.types"
              :key="t"
              class="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono"
            >{{ t.includes('/') ? t.split('/').pop() : t }}</span>
          </div>
        </div>

        <!-- Binding info -->
        <div v-if="bindingInfo">
          <span class="text-xs font-medium text-slate-500 uppercase tracking-wide">Preferred Binding Indicator</span>
          <div class="mt-1 space-y-1">
            <div class="flex items-center gap-2">
              <span
                v-if="bindingInfo.colors"
                :class="[bindingInfo.colors.bg, bindingInfo.colors.text, bindingInfo.colors.border, 'text-xs px-1.5 py-0.5 rounded-full border font-medium']"
              >{{ bindingInfo.colors.label }}</span>
              <span class="text-xs text-slate-500 capitalize">{{ bindingInfo.strength }}</span>
            </div>
            <p class="text-xs text-slate-600 leading-relaxed">{{ bindingInfo.description }}</p>
          </div>
        </div>

        <!-- Populated value -->
        <div v-if="node.populatedValue">
          <span class="text-xs font-medium text-slate-500 uppercase tracking-wide">Populated Value</span>
          <div class="mt-1 p-2 bg-emerald-50 border border-emerald-200 rounded-md space-y-1">
            <p class="text-xs font-medium text-emerald-800">{{ node.populatedValue.display }}</p>
            <p v-if="node.populatedValue.code" class="text-xs text-emerald-600 font-mono">
              Code: {{ node.populatedValue.code }}
            </p>
            <p v-if="node.populatedValue.system" class="text-xs text-emerald-600 font-mono truncate" :title="node.populatedValue.system">
              System: {{ node.populatedValue.system }}
            </p>
            <p class="text-xs text-emerald-500 capitalize">Type: {{ node.populatedValue.type }}</p>
            <!-- Validation status -->
            <div v-if="node.populatedValue.validation" class="flex items-center gap-1.5 mt-1 pt-1 border-t border-emerald-200">
              <span
                class="text-xs font-medium px-1.5 py-0.5 rounded"
                :class="{
                  'bg-emerald-100 text-emerald-700': node.populatedValue.validation === 'valid',
                  'bg-amber-100 text-amber-700': node.populatedValue.validation === 'mismatch',
                  'bg-slate-100 text-slate-600': node.populatedValue.validation === 'unknown',
                }"
              >
                {{ node.populatedValue.validation === 'valid' ? '✓ Valid binding' : node.populatedValue.validation === 'mismatch' ? '⚠ Binding mismatch' : '? Unknown' }}
              </span>
              <span v-if="node.populatedValue.validationMessage" class="text-xs text-emerald-600">
                {{ node.populatedValue.validationMessage }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.2s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
