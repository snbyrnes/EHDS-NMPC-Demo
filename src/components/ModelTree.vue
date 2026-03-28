<script setup lang="ts">
import type { EHDSTreeNode } from '../types/ehds';
import { flattenTree } from '../services/ehdsParser';
import ModelTreeNode from './ModelTreeNode.vue';
import { useAppStore } from '../stores/appStore';
import { computed } from 'vue';

const store = useAppStore();

const props = defineProps<{
  roots: EHDSTreeNode[];
}>();

const visibleNodes = computed(() => flattenTree(props.roots));

function toggleNode(node: EHDSTreeNode) {
  node.isExpanded = !node.isExpanded;
}

function expandAll(nodes: EHDSTreeNode[]) {
  for (const node of nodes) {
    if (node.children.length > 0) {
      node.isExpanded = true;
      expandAll(node.children);
    }
  }
}

function collapseAll(nodes: EHDSTreeNode[]) {
  for (const node of nodes) {
    if (node.children.length > 0) {
      node.isExpanded = false;
      collapseAll(node.children);
    }
  }
}

function inspectNode(node: EHDSTreeNode) {
  store.inspectedNode = store.inspectedNode?.id === node.id ? null : node;
}
</script>

<template>
  <div class="bg-white rounded-lg border border-slate-200 overflow-hidden">
    <!-- Header -->
    <div class="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-200">
      <h2 class="text-sm font-semibold text-slate-700">
        EHDS Medication Model
        <span class="text-xs text-slate-400 font-normal ml-2">v0.3.0</span>
      </h2>
      <div class="flex gap-2">
        <button
          class="text-xs text-slate-500 hover:text-slate-700 transition-colors"
          @click="expandAll(props.roots)"
        >
          Expand All
        </button>
        <span class="text-slate-300">|</span>
        <button
          class="text-xs text-slate-500 hover:text-slate-700 transition-colors"
          @click="collapseAll(props.roots)"
        >
          Collapse All
        </button>
      </div>
    </div>

    <!-- Tree nodes -->
    <div class="divide-y divide-slate-100 max-h-[calc(100vh-260px)] overflow-y-auto">
      <ModelTreeNode
        v-for="node in visibleNodes"
        :key="node.id"
        :node="node"
        @toggle="toggleNode"
        @inspect="inspectNode"
      />
    </div>
  </div>
</template>
