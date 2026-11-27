import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
// The dashboard's own pair: JetBrains Mono for figures, Inter for prose.
import '@fontsource-variable/jetbrains-mono/wght.css'
import '@fontsource-variable/inter/wght.css'
import './custom.css'
import Landing from './Landing.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('Landing', Landing)
  },
} satisfies Theme
