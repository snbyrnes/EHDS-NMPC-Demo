import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import { useAppStore } from './stores/appStore'

const app = createApp(App)
app.use(createPinia())
app.mount('#app')

// Deep link handling: parse #/sct/{code} from URL hash
const hash = window.location.hash;
const deepLinkMatch = hash.match(/^#\/sct\/(\d+)$/);
if (deepLinkMatch) {
  const store = useAppStore();
  store.loadFromDeepLink(deepLinkMatch[1]);
}
