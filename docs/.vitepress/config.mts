import { defineConfig } from 'vitepress'

const site = 'https://projects.halit.org/suparedirect/'
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

const person = { '@type': 'Person', name: 'Halit Sever', url: 'https://halit.org' }

/** BlogPosting and breadcrumbs for posts, FAQPage wherever the page shows an FAQ. */
function pageJsonLd(fm: Record<string, any>, url: string, title: string, pageDescription: string) {
  const graph: object[] = []
  if (fm.date) {
    graph.push(
      {
        '@type': 'BlogPosting',
        headline: fm.headline ?? title,
        description: pageDescription,
        url,
        mainEntityOfPage: url,
        datePublished: fm.date,
        dateModified: fm.date,
        inLanguage: 'en',
        image: `${site}og.png`,
        keywords: fm.keyword,
        author: person,
        publisher: person,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Suparedirect', item: site },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: `${site}blog/` },
          { '@type': 'ListItem', position: 3, name: fm.headline ?? title, item: url },
        ],
      },
    )
  }
  if (fm.faq?.length) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: fm.faq.map((f: { q: string; a: string }) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a.replace(/<[^>]+>|`|\*\*/g, '') },
      })),
    })
  }
  return { '@context': 'https://schema.org', '@graph': graph }
}

export default defineConfig({
  /** keeps the page hash map out of every page's HTML, which Semrush reads as a low text-to-HTML ratio */
  metaChunk: true,
  base: '/suparedirect/',
  lang: 'en',
  title: 'Suparedirect',
  titleTemplate: ':title | Suparedirect',
  description,
  cleanUrls: true,
  appearance: 'force-dark',
  sitemap: { hostname: site },

  head: [
    /** Cloudflare Web Analytics, one token for every page on projects.halit.org. */
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
    const fm = pageData.frontmatter
    const pageDescription = fm.description ?? description
    // Pages with titleTemplate: false already carry their full title.
    const fullTitle = isHome ? homeTitle : fm.titleTemplate === false ? title : `${title} | Suparedirect`
    fm.head ??= []
    fm.head.push(
      ['link', { rel: 'canonical', href: url }],
      ['meta', { property: 'og:url', content: url }],
      ['meta', { property: 'og:title', content: fullTitle }],
      ['meta', { property: 'og:description', content: pageDescription }],
    )
    if (fm.date) fm.head.push(['meta', { property: 'article:published_time', content: fm.date }])
    if (fm.date || fm.faq) fm.head.push(['script', { type: 'application/ld+json' }, JSON.stringify(pageJsonLd(fm, url, title, pageDescription))])
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
      { text: 'Link generator', link: '/link-generator/' },
      { text: 'Blog', link: '/blog/', activeMatch: '/blog/' },
    ],
    sidebar: {
      '/blog/': [
        {
          text: 'Blog',
          items: [
            { text: 'All posts', link: '/blog/' },
            { text: 'strict-origin-when-cross-origin', link: '/blog/strict-origin-when-cross-origin' },
            { text: 'noopener noreferrer', link: '/blog/noopener-noreferrer' },
            { text: 'Referrer-Policy best practices', link: '/blog/referrer-policy-best-practices' },
            { text: 'HTTP_REFERER in PHP and nginx', link: '/blog/http-referer-php-nginx' },
            { text: 'How URL redirects work', link: '/blog/how-url-redirects-work' },
            { text: 'Target URL in the path', link: '/blog/redirect-service-url-in-path' },
            { text: 'Referer in an HTTP request', link: '/blog/referer-in-http-request' },
            { text: 'Hide the referrer URL', link: '/blog/hide-referrer-url' },
          ],
        },
        {
          text: 'Tools',
          items: [{ text: 'Link generator', link: '/link-generator/' }],
        },
      ],
      '/guide/': [
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
          { text: 'Do you need a dereferer?', link: '/guide/noreferrer-referrer-policy' },
          { text: 'Dereferer services compared', link: '/guide/dereferer-alternatives' },
        ],
      },
      {
        text: 'More',
        items: [
          { text: 'Link generator', link: '/link-generator/' },
          { text: 'Blog', link: '/blog/' },
        ],
      },
    ],
    },
    socialLinks: [{ icon: 'github', link: repo }],
    outline: { level: [2, 3] },
    editLink: {
      pattern: 'https://github.com/halitsever/suparedirect/edit/main/docs/:path',
      text: 'Edit this page on GitHub',
    },
    search: { provider: 'local' },
  },
})
