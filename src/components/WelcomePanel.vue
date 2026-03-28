<script setup lang="ts">
import { useAppStore } from '../stores/appStore';

const store = useAppStore();
</script>

<template>
  <div class="bg-white rounded-lg border border-slate-200 p-8 text-center max-w-xl mx-auto">
    <div class="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
      <svg class="w-8 h-8 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
      </svg>
    </div>

    <h2 class="text-xl font-bold text-slate-800 mb-2">Welcome to EHDS FHIR Medication Validator</h2>
    <p class="text-sm text-slate-500 mb-6 leading-relaxed">
      Explore the European Health Data Space Medication logical model and see how
      Irish NMPC products map to it — measuring compliance across EHDS fields in real time.
    </p>

    <div class="grid grid-cols-3 gap-4 mb-6">
      <div class="flex flex-col items-center gap-2">
        <span class="w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center">1</span>
        <span class="text-xs text-slate-600 font-medium">Connect</span>
        <span class="text-xs text-slate-400">Enter your OAuth2 credentials</span>
      </div>
      <div class="flex flex-col items-center gap-2">
        <span class="w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center">2</span>
        <span class="text-xs text-slate-600 font-medium">Search</span>
        <span class="text-xs text-slate-400">Find medications by name</span>
      </div>
      <div class="flex flex-col items-center gap-2">
        <span class="w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center">3</span>
        <span class="text-xs text-slate-600 font-medium">Explore</span>
        <span class="text-xs text-slate-400">See bindings & resource output</span>
      </div>
    </div>

    <button
      class="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
      @click="store.showSettings = true"
    >
      Connect to NMPC Server
    </button>
  </div>
</template>
