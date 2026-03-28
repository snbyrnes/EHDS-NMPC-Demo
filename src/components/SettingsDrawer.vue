<script setup lang="ts">
import { useAppStore } from '../stores/appStore';
import { ref } from 'vue';

const store = useAppStore();
const localUrl = ref(store.nmpcBaseUrl);
const localTokenEndpoint = ref(store.nmpcTokenEndpoint);
const localClientId = ref(store.nmpcClientId);
const localClientSecret = ref(store.nmpcClientSecret);

async function handleConnect() {
  store.nmpcBaseUrl = localUrl.value;
  store.nmpcTokenEndpoint = localTokenEndpoint.value;
  store.nmpcClientId = localClientId.value;
  store.nmpcClientSecret = localClientSecret.value;
  await store.connect();
}

function handleDisconnect() {
  store.disconnect();
}
</script>

<template>
  <!-- Backdrop -->
  <Transition name="fade">
    <div
      v-if="store.showSettings"
      class="fixed inset-0 bg-black/30 z-40"
      @click="store.showSettings = false"
    ></div>
  </Transition>

  <!-- Drawer -->
  <Transition name="slide">
    <div
      v-if="store.showSettings"
      class="fixed top-0 right-0 h-full w-96 bg-white shadow-xl z-50 flex flex-col"
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200">
        <h2 class="text-lg font-semibold text-slate-800">NMPC Connection</h2>
        <button
          class="text-slate-400 hover:text-slate-600 transition-colors"
          @click="store.showSettings = false"
        >
          <svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto px-6 py-4 space-y-5">
        <!-- Connection status -->
        <div class="flex items-center gap-2">
          <span
            class="w-2.5 h-2.5 rounded-full shrink-0"
            :class="store.isConnected ? 'bg-emerald-500' : 'bg-slate-300'"
          ></span>
          <span class="text-sm" :class="store.isConnected ? 'text-emerald-700' : 'text-slate-500'">
            {{ store.isConnected ? 'Connected' : 'Not connected' }}
          </span>
          <span v-if="store.serverInfo" class="text-xs text-slate-400 ml-auto">
            {{ store.serverInfo.serverName }}
          </span>
        </div>

        <!-- Server URL -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Server URL</label>
          <input
            v-model="localUrl"
            type="url"
            placeholder="https://nmpc.hse.ie/production1/fhir"
            class="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            :disabled="store.isConnected"
          />
        </div>

        <!-- Token Endpoint URL -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">
            Token Endpoint URL
            <span class="text-xs font-normal text-slate-400">(optional)</span>
          </label>
          <input
            v-model="localTokenEndpoint"
            type="url"
            placeholder="Auto-discovered from FHIR server"
            class="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            :disabled="store.isConnected"
          />
          <p class="mt-1 text-xs text-slate-400">Leave blank to auto-discover from the server's SMART configuration.</p>
        </div>

        <!-- Client ID -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Client ID</label>
          <input
            v-model="localClientId"
            type="text"
            placeholder="Enter your client ID"
            class="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            :disabled="store.isConnected"
          />
        </div>

        <!-- Client Secret -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Client Secret</label>
          <input
            v-model="localClientSecret"
            type="password"
            placeholder="Enter your client secret"
            class="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            :disabled="store.isConnected"
          />
          <p class="mt-1 text-xs text-slate-400">Credentials are stored locally in your browser only.</p>
        </div>

        <!-- Error -->
        <div v-if="store.connectionError" class="p-3 bg-red-50 border border-red-200 rounded-md">
          <p class="text-sm text-red-700">{{ store.connectionError }}</p>
        </div>

        <!-- Server info when connected -->
        <div v-if="store.isConnected && store.serverInfo" class="p-3 bg-emerald-50 border border-emerald-200 rounded-md space-y-1">
          <p class="text-sm font-medium text-emerald-800">Connected to NMPC</p>
          <p class="text-xs text-emerald-600">Server: {{ store.serverInfo.serverName }}</p>
          <p class="text-xs text-emerald-600">FHIR Version: {{ store.serverInfo.fhirVersion }}</p>
          <p v-if="store.nmpcTokenEndpoint" class="text-xs text-emerald-600 truncate" :title="store.nmpcTokenEndpoint">
            Token Endpoint: {{ store.nmpcTokenEndpoint }}
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-slate-200">
        <button
          v-if="!store.isConnected"
          class="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          :disabled="store.isConnecting || !localUrl || !localClientId || !localClientSecret"
          @click="handleConnect"
        >
          {{ store.isConnecting ? 'Connecting...' : 'Connect' }}
        </button>
        <button
          v-else
          class="w-full px-4 py-2 bg-slate-600 text-white text-sm font-medium rounded-md hover:bg-slate-700 transition-colors"
          @click="handleDisconnect"
        >
          Disconnect
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.25s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>
