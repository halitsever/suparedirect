import { defineConfig } from 'vitepress'

const site = 'https://halitsever.github.io/suparedirect/'
const homeTitle = 'Self-hosted dereferer: anonymous redirect links'
const description = 'Suparedirect is a self-hosted dereferer. It turns any URL into an anonymous redirect link that opens without the Referer header. Node.js, Express, Docker.'

const repo = 'https://github.com/halitsever/suparedirect'
const license = 'https://opensource.org/licenses/MIT'
const author = { '@type': 'Person', name: 'Halit Sever', url: 'https://github.com/halitsever' }

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareSourceCode',
      '@id': `${site}#source`,
      name: 'Suparedirect',
      description,
      url: site,
      image: `${site}og.png`,
      codeRepository: repo,
      programmingLanguage: 'TypeScript',
      runtimePlatform: 'Node.js',
      license,
      author,
    },
  ],
}

export default defineConfig({
  base: '/suparedirect/',
  lang: 'en',
  title: 'Suparedirect',
  titleTemplate: ':title | Suparedirect',
  description,
  cleanUrls: true,
  appearance: 'force-dark',
  sitemap: { hostname: site },

  head: [
    /** Cloudflare Web Analytics, one token for every page on halitsever.github.io. */
    ['script', { defer: '', src: 'https://static.cloudflareinsights.com/beacon.min.js', 'data-cf-beacon': '{"token": "dd7e54d3f48841c187d72d9dbb92a6b6"}' }],
    ['link', { rel: 'icon', href: '/suparedirect/favicon.ico', sizes: '32x32' }],
    ['link', { rel: 'icon', href: '/suparedirect/favicon.svg', type: 'image/svg+xml' }],
    ['meta', { name: 'theme-color', content: '#7c7af9' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:site_name', content: 'Suparedirect' }],
    ['meta', { property: 'og:image', content: `${site}og.png` }],
    ['meta', { property: 'og:image:width', content: '1280' }],
    ['meta', { property: 'og:image:height', content: '640' }],
    ['meta', { property: 'og:image:alt', content: 'Suparedirect: a self-hosted anonymous redirect service that strips the Referer header' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:image', content: `${site}og.png` }],
    ['script', { type: 'application/ld+json' }, JSON.stringify(jsonLd)],
  ],

  transformPageData(pageData) {
    const isHome = pageData.relativePath === 'index.md'
    const title = pageData.frontmatter.title ?? pageData.title
    const url = site + pageData.relativePath.replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, '')
    pageData.frontmatter.head ??= []
    pageData.frontmatter.head.push(
      ['link', { rel: 'canonical', href: url }],
      ['meta', { property: 'og:url', content: url }],
      ['meta', { property: 'og:title', content: isHome ? homeTitle : `${title} | Suparedirect` }],
      ['meta', { property: 'og:description', content: pageData.frontmatter.description ?? description }],
    )
  },

  markdown: {
    theme: 'github-dark-default',
  },

  themeConfig: {
    logo: { src: '/favicon.svg', alt: '' },
    nav: [
      { text: 'How it works', link: '/guide/how-it-works' },
      { text: 'Get started', link: '/guide/getting-started' },
      { text: 'Referer header', link: '/guide/referer-header' },
    ],
    sidebar: [
      {
        text: 'Run it',
        items: [
          { text: 'Getting started', link: '/guide/getting-started' },
          { text: 'How it works', link: '/guide/how-it-works' },
          { text: 'Stats dashboard', link: '/guide/dashboard' },
          { text: 'Self-hosting notes', link: '/guide/self-hosting' },
        ],
      },
      {
        text: 'Background',
        items: [
          { text: 'The Referer header', link: '/guide/referer-header' },
          { text: 'noreferrer and Referrer-Policy', link: '/guide/noreferrer-referrer-policy' },
          { text: 'Dereferer services compared', link: '/guide/dereferer-alternatives' },
        ],
      },
    ],
    socialLinks: [{ icon: 'github', link: repo }],
    outline: { level: [2, 3] },
    editLink: {
      pattern: 'https://github.com/halitsever/suparedirect/edit/main/docs/:path',
      text: 'Edit this page on GitHub',
    },
    search: { provider: 'local' },
  },
})
