<script setup lang="ts">
import { withBase } from 'vitepress'

const repo = 'https://github.com/halitsever/suparedirect'
const hub = 'https://hub.docker.com/r/halitsever/suparedirect'

const guides = [
  { href: '/guide/getting-started', title: 'Getting started', text: 'Run the Docker image or build from source, then make your first anonymous link.' },
  { href: '/guide/how-it-works', title: 'How it works', text: 'The redirect page line by line, and what it hides and does not hide.' },
  { href: '/guide/referer-header', title: 'The Referer header explained', text: 'What browsers send, when they trim it, and whether it can be spoofed.' },
  { href: '/guide/noreferrer-referrer-policy', title: 'Do you need a dereferer?', text: 'When an attribute or a response header does the job without a redirect.' },
  { href: '/link-generator/', title: 'Link generator', text: 'Turn a URL into an anonymous link for your instance and test the referrer it sends.' },
  { href: '/blog/', title: 'Blog', text: 'Referrer-Policy, noopener noreferrer, HTTP_REFERER and how redirects pass the referrer.' },
  { href: '/guide/dashboard', title: 'Stats dashboard', text: 'What the dashboard on port 5173 shows and where the numbers come from.' },
  { href: '/guide/self-hosting', title: 'Self-hosting notes', text: 'The fixed port, in-memory stats, the open stats endpoint and reverse proxies.' },
  { href: '/guide/dereferer-alternatives', title: 'Dereferer services compared', text: 'Hosted dereferers against one you run yourself, and what to check in either.' },
]
</script>

<template>
  <div class="sr">
    <section class="hero">
      <div class="wrap">
        <h1>Self-hosted dereferer: anonymous redirect links</h1>
        <p class="lede">
          Suparedirect is a small Express server you run yourself. Link through it and the site on
          the other end gets the visitor without the <code>Referer</code> header, so it cannot tell
          which page sent them.
        </p>

        <div class="wire" role="group" aria-label="The same click as two HTTP requests">
          <figure class="req">
            <figcaption>
              <span class="req-name">A direct link</span>
              <code>&lt;a href="https://shop.example/pricing"&gt;</code>
            </figcaption>
            <pre class="http" aria-label="Request received by shop.example"><span class="ln">GET /pricing HTTP/1.1</span>
<span class="ln">Host: shop.example</span>
<span class="ln ln-ref">Referer: https://forum.example/</span>
<span class="ln">Accept: text/html</span></pre>
            <p class="req-note">shop.example learns that the visitor came from forum.example.</p>
          </figure>

          <figure class="req req-clean">
            <figcaption>
              <span class="req-name">The same link through Suparedirect</span>
              <code>&lt;a href="https://go.example/?to=https://shop.example/pricing"&gt;</code>
            </figcaption>
            <pre class="http" aria-label="Request received by shop.example, with no Referer line"><span class="ln">GET /pricing HTTP/1.1</span>
<span class="ln">Host: shop.example</span>
<span class="ln ln-gone" aria-hidden="true"><span>Referer: https://forum.example/</span></span>
<span class="ln">Accept: text/html</span></pre>
            <p class="req-note">The line is not sent. <code>document.referrer</code> is an empty string.</p>
          </figure>
        </div>

        <p class="wire-foot">
          Both requests are what shop.example receives, with other headers left out. The first one
          shows the browser default, which sends the origin of the linking page to another site.
        </p>

        <div class="actions">
          <a class="btn" :href="withBase('/guide/getting-started')">Run it with Docker</a>
          <a class="textlink" :href="withBase('/guide/how-it-works')">Read how the redirect works</a>
        </div>
      </div>
    </section>

    <section class="band">
      <div class="wrap split">
        <div>
          <h2>One parameter makes an anonymous link</h2>
          <p>
            Put the target in <code>to</code>. The server answers <code>GET /?to=&lt;url&gt;</code>
            and nothing else needs configuring. A bare domain such as <code>example.com</code> gets
            <code>https://</code> added in front.
          </p>
          <p>
            A target that carries its own query string has to be percent-encoded, or everything
            after the first <code>&amp;</code> is read as a separate parameter and dropped.
          </p>
        </div>
        <div class="urls">
          <p class="url"><span class="dim">https://go.example/</span>?to=<span class="hi">https://shop.example/pricing</span></p>
          <p class="url-note">Your host, then the page to open.</p>
          <p class="url"><span class="dim">https://go.example/</span>?to=<span class="hi">shop.example</span></p>
          <p class="url-note">Opens <code>https://shop.example</code>.</p>
          <p class="url"><span class="dim">https://go.example/</span>?to=<span class="hi">https%3A%2F%2Fshop.example%2F%3Fa%3D1%26b%3D2</span></p>
          <p class="url-note">Opens <code>https://shop.example/?a=1&amp;b=2</code> with both parameters intact.</p>
        </div>
      </div>
    </section>

    <section class="band">
      <div class="wrap split">
        <div>
          <h2>How the redirect drops the header</h2>
          <ol class="steps">
            <li>
              The visitor clicks your link. Their browser loads a page from your Suparedirect
              host, not from the target.
            </li>
            <li>
              That page arrives with <code>Referrer-Policy: no-referrer</code> as a response header
              and the same policy as a <code>&lt;meta&gt;</code> tag.
            </li>
            <li>
              A one-line script sets <code>window.location</code> to the target. The browser
              applies the page's policy to that navigation and sends no <code>Referer</code>.
            </li>
          </ol>
          <p>
            The redirect is a script, so it needs JavaScript. With JavaScript turned off the
            visitor stays on a blank page.
          </p>
          <a class="textlink" :href="withBase('/guide/how-it-works')">The full mechanism and its limits</a>
        </div>
        <figure class="code">
          <figcaption>The response from <code>src/index.ts</code>, other headers trimmed</figcaption>
          <pre><span class="dim">$ curl -i 'http://localhost:3000/?to=https://example.com'</span>
HTTP/1.1 200 OK
<span class="hi">Referrer-Policy: no-referrer</span>
Content-Type: text/html; charset=utf-8

&lt;!DOCTYPE html&gt;
&lt;html&gt;
  &lt;head&gt;
    <span class="hi">&lt;meta name="referrer" content="no-referrer"&gt;</span>
  &lt;/head&gt;
  &lt;body&gt;
    &lt;script&gt;
      window.location = "https://example.com";
    &lt;/script&gt;
  &lt;/body&gt;
&lt;/html&gt;</pre>
        </figure>
      </div>
    </section>

    <section class="band">
      <div class="wrap">
        <h2>What it hides, and what it does not</h2>
        <p class="narrow">
          A dereferer removes one piece of information. It is not a proxy or a VPN. The visitor's
          browser still connects to the target directly.
        </p>
        <div class="ledger">
          <div>
            <h3>The target no longer gets</h3>
            <ul>
              <li>The <code>Referer</code> request header, including the origin</li>
              <li>A value in <code>document.referrer</code></li>
            </ul>
          </div>
          <div>
            <h3>The target still gets</h3>
            <ul>
              <li>The visitor's IP address and user agent</li>
              <li>Everything in the target URL, such as query strings and tracking parameters</li>
              <li>Its own cookies for that visitor</li>
            </ul>
          </div>
          <div>
            <h3>Your server gets</h3>
            <ul>
              <li>The <code>Referer</code> of the page that held the link, which it does not store</li>
              <li>The target URL, the time and the user agent, kept in memory for the last 500 redirects</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <section class="band">
      <div class="wrap">
        <h2>A dashboard for the redirects it served</h2>
        <p class="narrow">
          The image also serves a React dashboard on port 5173. It reads
          <code>GET /api/stats</code> every 5 seconds and lists the redirects held in memory. The
          counts reset when the process restarts.
        </p>
        <figure class="shot">
          <img
            :src="withBase('/dashboard.png')"
            width="2560"
            height="1600"
            loading="lazy"
            alt="Suparedirect stats dashboard with total redirects, records in memory, last redirect and an empty redirect history"
          />
        </figure>
        <a class="textlink" :href="withBase('/guide/dashboard')">What each number means</a>
      </div>
    </section>

    <section class="band">
      <div class="wrap split">
        <div>
          <h2>Run it</h2>
          <p>
            The image is <code>halitsever/suparedirect:latest</code> on Docker Hub. The redirect
            server listens on port 3000 and the dashboard on 5173. Publish only 3000 if you do not
            want the dashboard.
          </p>
          <p>
            From source you need Node.js and two installs, one for the server and one for the
            dashboard.
          </p>
          <a class="textlink" :href="withBase('/guide/getting-started')">Step by step in the getting started guide</a>
        </div>
        <div class="stack">
          <figure class="code">
            <figcaption>Docker</figcaption>
            <pre><span class="dim"># redirect server and dashboard</span>
docker run -p 3000:3000 -p 5173:5173 halitsever/suparedirect:latest

<span class="dim"># redirect server only</span>
docker run -p 3000:3000 halitsever/suparedirect:latest</pre>
          </figure>
          <figure class="code">
            <figcaption>From source</figcaption>
            <pre>git clone https://github.com/halitsever/suparedirect.git
cd suparedirect
npm i &amp;&amp; npm run dashboard:install
npm run build &amp;&amp; npm run start</pre>
          </figure>
        </div>
      </div>
    </section>

    <section class="band">
      <div class="wrap split">
        <div>
          <h2>You may not need a redirect at all</h2>
          <p>
            If you control the page that holds the link, <code>rel="noreferrer"</code> on the link
            or a <code>Referrer-Policy</code> header on the page gives the same result with no
            extra hop.
          </p>
          <p>
            Suparedirect is for links on pages you cannot edit: a forum post, a wiki page, a chat
            message, a CMS you do not run. There you can only choose the URL, so the URL has to do
            the work.
          </p>
          <a class="textlink" :href="withBase('/guide/noreferrer-referrer-policy')">Compare the three options</a>
        </div>
        <figure class="code">
          <figcaption>Enough on a page you control</figcaption>
          <pre>&lt;a href="https://shop.example/pricing" <span class="hi">rel="noreferrer"</span>&gt;Pricing&lt;/a&gt;

<span class="dim">&lt;!-- or for every link on the page --&gt;</span>
&lt;meta name="referrer" <span class="hi">content="no-referrer"</span>&gt;</pre>
        </figure>
      </div>
    </section>

    <section class="band">
      <div class="wrap">
        <h2>Guides</h2>
        <ul class="guides">
          <li v-for="g in guides" :key="g.href">
            <a :href="withBase(g.href)">{{ g.title }}</a>
            <span>{{ g.text }}</span>
          </li>
        </ul>
      </div>
    </section>

    <footer class="foot">
      <div class="wrap foot-in">
        <p>Suparedirect is open source under the MIT License. Made by Halit Sever.</p>
        <p class="foot-links">
          <a :href="repo">
            GitHub
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7" /><path d="M8 7h9v9" /></svg>
          </a>
          <a :href="hub">
            Docker Hub
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7" /><path d="M8 7h9v9" /></svg>
          </a>
          <a :href="`${repo}/issues`">
            Report an issue
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7" /><path d="M8 7h9v9" /></svg>
          </a>
        </p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.sr {
  --mono: var(--vp-font-family-mono);
  --black: #07070b;
  color: var(--sr-ink);
  font-size: 16px;
  line-height: 1.65;
  font-variant-ligatures: none;
}
.wrap {
  max-width: 1160px;
  margin: 0 auto;
  padding: 0 20px;
}
@media (min-width: 768px) {
  .wrap {
    padding: 0 40px;
  }
}

/* Hero: the social card's violet field with black ink. */
.hero {
  background: var(--sr-violet);
  color: var(--black);
  padding: 56px 0 64px;
}
.hero h1 {
  font-family: var(--mono);
  font-weight: 700;
  font-size: clamp(1.75rem, 1rem + 3vw, 3.1rem);
  line-height: 1.08;
  letter-spacing: -0.045em;
  word-spacing: -0.12em;
  max-width: 24ch;
}
.lede {
  margin-top: 22px;
  max-width: 58ch;
  font-size: clamp(1.02rem, 0.95rem + 0.4vw, 1.2rem);
  line-height: 1.55;
  color: rgba(7, 7, 11, 0.86);
}
.hero code {
  font-family: var(--mono);
  font-size: 0.92em;
  font-weight: 500;
  color: inherit;
  background: none;
  padding: 0;
}

.wire {
  display: grid;
  gap: 40px;
  margin-top: 44px;
}
@media (min-width: 900px) {
  .wire {
    grid-template-columns: 1fr 1fr;
    gap: 48px;
  }
}
.req {
  margin: 0;
  border-top: 2px solid var(--black);
  padding-top: 14px;
  min-width: 0;
}
.req figcaption {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
@media (min-width: 900px) {
  .req figcaption {
    min-height: 3.4em;
  }
}
.req-name {
  font-weight: 600;
  font-size: 0.95rem;
}
.req figcaption code {
  font-size: 0.8rem;
  line-height: 1.45;
  overflow-wrap: anywhere;
  color: rgba(7, 7, 11, 0.8);
}
.http {
  margin: 18px 0 0;
  font-family: var(--mono);
  font-weight: 500;
  font-size: clamp(0.95rem, 0.55rem + 1.55vw, 1.6rem);
  line-height: 1.5;
  letter-spacing: -0.02em;
  white-space: pre;
  font-feature-settings: 'zero';
}
.ln {
  display: inline-block;
}
.ln-ref {
  background: var(--black);
  color: var(--sr-violet);
  padding: 0 0.35em;
  margin-left: -0.35em;
}

/* Base styles are the end state, so reduced motion and no-CSS-animation both land on it. */
.ln-gone {
  position: relative;
  padding: 0 0.35em;
  margin-left: -0.35em;
  background: transparent;
  color: rgba(7, 7, 11, 0.42);
  animation: expose 2.2s 0.5s both;
}
.ln-gone::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  height: 0.13em;
  margin-top: -0.065em;
  background: var(--black);
  transform-origin: left center;
  animation: strike 0.7s 1.5s cubic-bezier(0.7, 0, 0.2, 1) both;
}
@keyframes expose {
  0%,
  62% {
    background: var(--black);
    color: var(--sr-violet);
  }
  100% {
    background: transparent;
    color: rgba(7, 7, 11, 0.42);
  }
}
@keyframes strike {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
}
@media (prefers-reduced-motion: reduce) {
  .ln-gone,
  .ln-gone::after {
    animation: none;
  }
}

.req-note {
  margin-top: 16px;
  font-size: 0.95rem;
  color: rgba(7, 7, 11, 0.86);
}
.wire-foot {
  margin-top: 36px;
  max-width: 70ch;
  font-size: 0.86rem;
  line-height: 1.55;
  color: rgba(7, 7, 11, 0.78);
}
.actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14px 28px;
  margin-top: 32px;
}
.btn {
  display: inline-block;
  padding: 12px 20px;
  border-radius: 8px;
  background: var(--black);
  color: #fff;
  font-weight: 600;
  font-size: 0.95rem;
  text-decoration: none;
  transition: background 0.15s;
}
.btn:hover {
  background: #1b1b29;
}
.textlink {
  font-weight: 600;
  font-size: 0.95rem;
  text-decoration: underline;
  text-decoration-thickness: 1.5px;
  text-underline-offset: 4px;
}
.hero .textlink {
  color: var(--black);
}
.hero :focus-visible {
  outline-color: var(--black);
}

/* Body sections on the dashboard's black. */
.band {
  padding: 72px 0;
  border-top: 1px solid var(--sr-line);
}
.hero + .band {
  border-top: 0;
}
.band h2 {
  font-family: var(--mono);
  font-weight: 600;
  font-size: clamp(1.35rem, 1rem + 1.4vw, 1.9rem);
  line-height: 1.18;
  letter-spacing: -0.035em;
  word-spacing: -0.12em;
  max-width: 26ch;
}
.band p {
  margin-top: 16px;
  color: var(--sr-ink-2);
  max-width: 60ch;
}
.band .narrow {
  max-width: 64ch;
}
.band code {
  font-family: var(--mono);
  font-size: 0.88em;
  color: #c9c8ff;
  background: rgba(124, 122, 249, 0.12);
  padding: 0.12em 0.36em;
  border-radius: 5px;
  overflow-wrap: anywhere;
}
.band .textlink {
  display: inline-block;
  margin-top: 22px;
  color: var(--sr-violet-hi);
}
.band .textlink:hover {
  color: #fff;
}
.split {
  display: grid;
  gap: 36px;
}
.split > * {
  min-width: 0;
}
@media (min-width: 900px) {
  .split {
    grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
    gap: 64px;
    align-items: start;
  }
}

.urls {
  border-top: 1px solid var(--sr-line-2);
}
.band .url {
  margin-top: 0;
  padding-top: 20px;
  max-width: none;
  font-family: var(--mono);
  font-size: clamp(0.9rem, 0.8rem + 0.5vw, 1.1rem);
  line-height: 1.5;
  color: var(--sr-ink);
  word-break: break-all;
}
.band .url-note {
  margin-top: 6px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--sr-line);
  font-size: 0.88rem;
  color: var(--sr-ink-3);
}
.dim {
  color: var(--sr-ink-3);
}
.hi {
  color: var(--sr-violet-hi);
}

.steps {
  margin-top: 20px;
  counter-reset: step;
  max-width: 60ch;
}
.steps li {
  counter-increment: step;
  position: relative;
  padding: 14px 0 14px 44px;
  border-top: 1px solid var(--sr-line);
  color: var(--sr-ink-2);
}
.steps li::before {
  content: counter(step);
  position: absolute;
  left: 0;
  top: 14px;
  font-family: var(--mono);
  font-weight: 600;
  color: var(--sr-violet);
}

.code {
  margin: 0;
  border: 1px solid var(--sr-line-2);
  border-radius: 12px;
  background: var(--sr-bg-2);
  overflow: hidden;
}
.code figcaption {
  padding: 10px 18px;
  border-bottom: 1px solid var(--sr-line);
  font-size: 0.8rem;
  color: var(--sr-ink-3);
}
.code figcaption code {
  background: none;
  padding: 0;
  color: var(--sr-ink-2);
}
.code pre {
  margin: 0;
  padding: 18px;
  overflow-x: auto;
  font-family: var(--mono);
  font-size: 0.8rem;
  line-height: 1.7;
  color: var(--sr-ink);
  font-feature-settings: 'zero';
}
.stack {
  display: grid;
  gap: 20px;
}

.ledger {
  display: grid;
  gap: 0;
  margin-top: 36px;
  border-top: 1px solid var(--sr-line-2);
}
.ledger > div {
  padding: 22px 0;
  border-bottom: 1px solid var(--sr-line);
}
@media (min-width: 900px) {
  .ledger {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  .ledger > div {
    padding: 26px 32px 8px 0;
    border-bottom: 0;
  }
  .ledger > div + div {
    padding-left: 32px;
    border-left: 1px solid var(--sr-line);
  }
}
.ledger h3 {
  font-family: var(--mono);
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--sr-ink);
}
.ledger ul {
  margin-top: 12px;
}
.ledger li {
  padding: 7px 0;
  color: var(--sr-ink-2);
  font-size: 0.95rem;
  line-height: 1.55;
}

.shot {
  margin: 36px 0 0;
  border: 1px solid var(--sr-line-2);
  border-radius: 14px;
  overflow: hidden;
  background: var(--sr-bg-2);
}
.shot img {
  display: block;
  width: 100%;
  height: auto;
}

.guides {
  margin-top: 28px;
  border-top: 1px solid var(--sr-line-2);
}
.guides li {
  display: grid;
  gap: 4px;
  padding: 16px 0;
  border-bottom: 1px solid var(--sr-line);
}
@media (min-width: 768px) {
  .guides li {
    grid-template-columns: 300px 1fr;
    gap: 32px;
    align-items: baseline;
  }
}
.guides a {
  font-family: var(--mono);
  font-weight: 500;
  font-size: 0.95rem;
  letter-spacing: -0.02em;
  color: var(--sr-violet-hi);
  text-decoration: none;
}
.guides a:hover {
  color: #fff;
  text-decoration: underline;
  text-underline-offset: 4px;
}
.guides span {
  color: var(--sr-ink-2);
  font-size: 0.95rem;
}

.foot {
  border-top: 1px solid var(--sr-line);
  padding: 32px 0 48px;
  font-size: 0.88rem;
  color: var(--sr-ink-3);
}
.foot-in {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 14px 32px;
}
.foot-links {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 24px;
}
.foot-links a {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--sr-ink-2);
  text-decoration: none;
}
.foot-links a:hover {
  color: #fff;
}
</style>
