<script setup lang="ts">
import { useAppStore } from '../stores/appStore';
import { getAllNodes } from '../services/ehdsParser';
import { computed } from 'vue';
import type { EHDSTreeNode } from '../types/ehds';

const store = useAppStore();

interface ComparisonRow {
  path: string;
  name: string;
  depth: number;
  binding?: string;
  leftValue?: string;
  leftCode?: string;
  rightValue?: string;
  rightCode?: string;
  status: 'match' | 'differ' | 'left-only' | 'right-only' | 'empty';
}

function getNodeValue(node: EHDSTreeNode): { display: string; code?: string } | null {
  if (!node.populatedValue) return null;
  return { display: node.populatedValue.display, code: node.populatedValue.code };
}

const rows = computed<ComparisonRow[]>(() => {
  const leftNodes = getAllNodes(store.treeRoots);
  const rightNodes = getAllNodes(store.comparedTreeRoots);
  const rightMap = new Map(rightNodes.map(n => [n.path, n]));
  const result: ComparisonRow[] = [];

  for (const left of leftNodes) {
    if (left.depth === 0) continue;
    if (left.children.length > 0 && !left.populatedValue) continue;

    const right = rightMap.get(left.path);
    const lv = getNodeValue(left);
    const rv = right ? getNodeValue(right) : null;

    let status: ComparisonRow['status'] = 'empty';
    if (lv && rv) {
      status = (lv.display === rv.display && lv.code === rv.code) ? 'match' : 'differ';
    } else if (lv) {
      status = 'left-only';
    } else if (rv) {
      status = 'right-only';
    }

    result.push({
      path: left.path,
      name: left.name,
      depth: left.depth,
      binding: left.binding?.description,
      leftValue: lv?.display,
      leftCode: lv?.code,
      rightValue: rv?.display,
      rightCode: rv?.code,
      status,
    });
  }

  return result;
});

const stats = computed(() => {
  const total = rows.value.length;
  const matches = rows.value.filter(r => r.status === 'match').length;
  const differs = rows.value.filter(r => r.status === 'differ').length;
  const leftOnly = rows.value.filter(r => r.status === 'left-only').length;
  const rightOnly = rows.value.filter(r => r.status === 'right-only').length;
  return { total, matches, differs, leftOnly, rightOnly };
});

const statusColors: Record<string, string> = {
  match: 'bg-emerald-50',
  differ: 'bg-amber-50',
  'left-only': 'bg-blue-50',
  'right-only': 'bg-purple-50',
  empty: '',
};
</script>

<template>
  <div class="bg-white rounded-lg border border-slate-200 overflow-hidden flex flex-col h-full">
    <!-- Header -->
    <div class="px-4 py-3 bg-slate-50 border-b border-slate-200">
      <div class="flex items-center justify-between mb-2">
        <h2 class="text-sm font-semibold text-slate-700">Medication Comparison</h2>
        <button
          class="text-xs text-slate-500 hover:text-red-600 transition-colors"
          @click="store.clearComparison()"
        >
          Close comparison
        </button>
      </div>
      <!-- Legend -->
      <div class="flex flex-wrap gap-3 text-xs">
        <span class="flex items-center gap-1">
          <span class="w-3 h-3 rounded bg-emerald-200 border border-emerald-300"></span>
          Match ({{ stats.matches }})
        </span>
        <span class="flex items-center gap-1">
          <span class="w-3 h-3 rounded bg-amber-200 border border-amber-300"></span>
          Different ({{ stats.differs }})
        </span>
        <span class="flex items-center gap-1">
          <span class="w-3 h-3 rounded bg-blue-200 border border-blue-300"></span>
          Primary only ({{ stats.leftOnly }})
        </span>
        <span class="flex items-center gap-1">
          <span class="w-3 h-3 rounded bg-purple-200 border border-purple-300"></span>
          Compared only ({{ stats.rightOnly }})
        </span>
      </div>
    </div>

    <!-- Column headers -->
    <div class="grid grid-cols-[1fr_1fr_1fr] gap-px bg-slate-200 text-xs font-medium text-slate-600">
      <div class="bg-slate-50 px-3 py-2">Field</div>
      <div class="bg-blue-50 px-3 py-2 truncate" :title="store.selectedMedication?.display">
        {{ store.selectedMedication?.display ?? 'Primary' }}
      </div>
      <div class="bg-purple-50 px-3 py-2 truncate" :title="store.comparedMedication?.display">
        {{ store.comparedMedication?.display ?? 'Compared' }}
      </div>
    </div>

    <!-- Rows -->
    <div class="flex-1 overflow-y-auto divide-y divide-slate-100">
      <div
        v-for="row in rows"
        :key="row.path"
        class="grid grid-cols-[1fr_1fr_1fr] gap-px text-xs"
        :class="statusColors[row.status]"
      >
        <div class="px-3 py-1.5" :style="{ paddingLeft: `${(row.depth - 1) * 12 + 12}px` }">
          <span class="font-mono text-slate-700">{{ row.name }}</span>
        </div>
        <div class="px-3 py-1.5">
          <span v-if="row.leftValue" class="text-slate-800">{{ row.leftValue }}</span>
          <span v-if="row.leftCode" class="text-slate-400 ml-1 font-mono">({{ row.leftCode }})</span>
          <span v-if="!row.leftValue" class="text-slate-300">&mdash;</span>
        </div>
        <div class="px-3 py-1.5">
          <span v-if="row.rightValue" class="text-slate-800">{{ row.rightValue }}</span>
          <span v-if="row.rightCode" class="text-slate-400 ml-1 font-mono">({{ row.rightCode }})</span>
          <span v-if="!row.rightValue" class="text-slate-300">&mdash;</span>
        </div>
      </div>
    </div>
  </div>
</template>
