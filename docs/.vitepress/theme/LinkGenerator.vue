<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { withBase } from 'vitepress'

const HOST_KEY = 'suparedirect-host'

const target = ref('')
const host = ref('')
const copied = ref('')
const testUrl = ref('')

onMounted(() => {
  testUrl.value = new URL(withBase('/referrer-test.html'), window.location.origin).href
  try {
    host.value = localStorage.getItem(HOST_KEY) ?? ''
  } catch {}
})

watch(host, (v) => {
  try {
    localStorage.setItem(HOST_KEY, v.trim())
  } catch {}
})

/** The server adds https:// to targets without a scheme, so the preview does the same. */
function normalizeTarget(raw: string): string {
  const t = raw.trim()
  if (!t) return ''
  return /^https?:\/\//i.test(t) ? t : `https://${t}`
}

/** Accepts "go.example.com" or a full base URL; a path prefix is kept for instances behind a sub-path. */
const base = computed(() => {
  const h = host.value.trim()
  if (!h) return ''
  try {
    const u = new URL(/^https?:\/\//i.test(h) ? h : `https://${h}`)
    return `${u.origin}${u.pathname.replace(/\/+$/, '')}`
  } catch {
    return ''
  }
})

const hostError = computed(() => (host.value.trim() && !base.value ? 'That does not look like a web address.' : ''))

const link = computed(() => {
  const t = normalizeTarget(target.value)
  if (!t) return ''
  return `${base.value || 'https://your-suparedirect.example'}/?to=${encodeURIComponent(t)}`
})

const html = computed(() => (link.value ? `<a href="${link.value}">${normalizeTarget(target.value)}</a>` : ''))

const viaInstance = computed(() => (base.value && testUrl.value ? `${base.value}/?to=${encodeURIComponent(testUrl.value)}` : ''))

async function copy(text: string, what: string) {
  try {
    await navigator.clipboard.writeText(text)
    copied.value = what
  } catch {
    copied.value = 'select'
  }
  setTimeout(() => (copied.value = ''), 2000)
}
</script>

<template>
  <div class="lg">
    <div class="lg-field">
      <label for="lg-target">URL to link to</label>
      <input id="lg-target" v-model="target" type="text" inputmode="url" autocomplete="off" spellcheck="false" placeholder="https://shop.example/search?q=tea&page=2" />
    </div>
    <div class="lg-field">
      <label for="lg-host">Your Suparedirect address</label>
      <input id="lg-host" v-model="host" type="text" inputmode="url" autocomplete="off" spellcheck="false" placeholder="https://go.example.com" />
      <p v-if="hostError" class="lg-err">{{ hostError }}</p>
      <p v-else class="lg-hint">Where your instance answers. Saved in this browser only.</p>
    </div>

    <div class="lg-out" aria-live="polite">
      <template v-if="link">
        <p class="lg-label">Anonymous link</p>
        <div class="lg-row">
          <code class="lg-code">{{ link }}</code>
          <button type="button" class="lg-btn" @click="copy(link, 'link')">{{ copied === 'link' ? 'Copied' : 'Copy' }}</button>
        </div>
        <p class="lg-label">HTML</p>
        <div class="lg-row">
          <code class="lg-code">{{ html }}</code>
          <button type="button" class="lg-btn" @click="copy(html, 'html')">{{ copied === 'html' ? 'Copied' : 'Copy' }}</button>
        </div>
        <p v-if="copied === 'select'" class="lg-err">The clipboard is blocked here. Select the text and copy it by hand.</p>
        <p v-if="!base" class="lg-hint">Add your Suparedirect address above to get a link you can share.</p>
      </template>
      <p v-else class="lg-hint">Type a URL to see its anonymous link.</p>
    </div>

    <div class="lg-test">
      <p class="lg-label">Test what each kind of link sends</p>
      <p class="lg-hint">Each opens a page in a new tab that prints the referrer it received.</p>
      <ul>
        <li>
          <a :href="withBase('/referrer-test.html')" target="_blank">Normal link</a>
          <span>shows this page's address</span>
        </li>
        <li>
          <a :href="withBase('/referrer-test.html')" target="_blank" rel="noreferrer">Link with rel="noreferrer"</a>
          <span>shows an empty referrer</span>
        </li>
        <li>
          <a v-if="viaInstance" :href="viaInstance" target="_blank">Through your Suparedirect</a>
          <span v-if="viaInstance">shows an empty referrer</span>
          <span v-else>Add your Suparedirect address to test it.</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.lg {
  margin: 24px 0 8px;
  padding: 20px;
  border: 1px solid var(--sr-line-2);
  border-radius: 12px;
  background: var(--sr-bg-2);
}
.lg-field {
  margin-bottom: 16px;
}
.lg-field label,
.lg-label {
  display: block;
  margin: 0 0 6px !important;
  font-size: 13px;
  font-weight: 600;
  color: var(--sr-ink-2);
}
.lg-field input {
  width: 100%;
  height: 44px;
  padding: 0 14px;
  border: 1px solid var(--sr-line-2);
  border-radius: 8px;
  background: var(--sr-bg);
  color: var(--sr-ink);
  font-family: var(--vp-font-family-mono);
  font-size: 15px;
}
.lg-field input:focus {
  outline: none;
  border-color: var(--sr-violet);
  box-shadow: 0 0 0 3px rgba(124, 122, 249, 0.2);
}
.lg-hint,
.lg-err {
  margin: 6px 0 0 !important;
  font-size: 13px;
  color: var(--sr-ink-3);
}
.lg-err {
  color: #f5a97f;
}
.lg-out {
  padding-top: 4px;
}
.lg-row {
  display: flex;
  gap: 8px;
  align-items: stretch;
  margin-bottom: 12px;
}
.lg-code {
  flex: 1;
  min-width: 0;
  padding: 10px 12px !important;
  border-radius: 8px !important;
  overflow-wrap: anywhere;
  word-break: break-all;
  font-size: 13.5px !important;
  line-height: 1.5;
}
.lg-btn {
  padding: 0 16px;
  border-radius: 8px;
  background: var(--sr-violet);
  color: #0b0b12;
  font-weight: 600;
  font-size: 14px;
}
.lg-btn:hover {
  background: var(--sr-violet-hi);
}
.lg-test {
  margin-top: 8px;
  padding-top: 16px;
  border-top: 1px solid var(--sr-line-2);
}
.lg-test ul {
  margin: 10px 0 0 !important;
  padding: 0 !important;
  list-style: none;
}
.lg-test li {
  display: flex;
  flex-wrap: wrap;
  gap: 2px 12px;
  margin: 0 0 8px !important;
}
.lg-test li span {
  color: var(--sr-ink-3);
  font-size: 14px;
}
@media (max-width: 480px) {
  .lg {
    padding: 14px;
  }
  .lg-row {
    flex-direction: column;
  }
  .lg-btn {
    height: 40px;
  }
}
</style>
