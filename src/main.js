/**
 * main.js
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
import { registerPlugins } from '@/plugins'

// Components
import App from './App.vue'

// Router
import router from './router';

// Composables
import { createApp } from 'vue'

const app = createApp(App).use(router)

registerPlugins(app)

app.mount('#app')
