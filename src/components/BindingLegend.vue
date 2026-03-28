<script setup lang="ts">
import { BINDING_COLORS, type BindingCategory } from '../types/ehds';

const categories = Object.entries(BINDING_COLORS) as [BindingCategory, typeof BINDING_COLORS[BindingCategory]][];
</script>

<template>
  <div class="flex flex-wrap gap-2 px-4 py-2 bg-white border-b border-slate-200">
    <span class="text-xs font-medium text-slate-500 self-center mr-1">Preferred Binding Indicators:</span>
    <span
      v-for="[key, color] in categories"
      :key="key"
      :class="[color.bg, color.text, color.border, 'text-xs px-2 py-0.5 rounded-full border font-medium']"
    >
      {{ color.label }}
    </span>
  </div>
</template>
