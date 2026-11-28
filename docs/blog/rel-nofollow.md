---
title: "rel nofollow: What It Does and How It Differs"
titleTemplate: false
description: "What rel=nofollow does for Google, when to use sponsored or ugc instead, and how it differs from noreferrer and noopener, which change the browser instead."
headline: "What rel nofollow tells search engines, and what it does not change"
date: "2026-11-28"
keyword: "rel nofollow"
faq: [{"q": "What does rel nofollow do?", "a": "It tells search engines you do not want to vouch for the linked page. Google's documentation says to use it when sponsored or ugc do not apply and you would rather Google not associate your site with the page or crawl it from your site."}, {"q": "Does nofollow hide the referrer?", "a": "No. nofollow is read by search engines and changes nothing in the browser. The destination still gets the Referer header. Use noreferrer or a Referrer-Policy for that."}, {"q": "Can I combine nofollow with other rel values?", "a": "Yes. rel takes a space-separated list, such as rel=\"nofollow noreferrer\" or rel=\"ugc nofollow\". Google's documentation also accepts comma-separated values."}]
---

# What rel nofollow tells search engines, and what it does not change

<p class="post-meta">By <a href="https://halit.org">Halit Sever</a> · <time datetime="2026-11-28">28 November 2026</time></p>

<p class="lead">`rel` values on a link fall into two groups: ones search engines read, and ones the browser acts on. `nofollow` is in the first group. It changes how Google treats the link, and nothing about what the visitor's browser sends.</p>

## What Google says

[Google Search Central's page on qualifying outbound links](https://developers.google.com/search/docs/crawling-indexing/qualify-outbound-links) defines three values:

| Value | Use it for |
| --- | --- |
| `rel="sponsored"` | ads and paid placements |
| `rel="ugc"` | links in user-generated content, such as comments and forum posts |
| `rel="nofollow"` | other links you would rather Google not associate your site with, or crawl from your site |

For paid links, Google notes that `nofollow` was the earlier recommendation and is still acceptable, though `sponsored` is preferred. For links inside your own site, the same page points to a robots.txt `disallow` rule rather than `nofollow`.

```html
<a href="https://shop.example/" rel="sponsored">Partner shop</a>
<a href="https://forum-user.example/" rel="ugc nofollow">their site</a>
<a href="https://unknown.example/" rel="nofollow">a site I do not vouch for</a>
```

Normal links that you are happy to stand behind need no `rel` at all.

## Browser values are a different job

| Value | Read by | Effect |
| --- | --- | --- |
| `nofollow`, `sponsored`, `ugc` | search engines | how the link is treated for crawling and ranking |
| `noreferrer` | the browser | no `Referer` header is sent, and it implies `noopener` |
| `noopener` | the browser | the new tab gets no `window.opener` reference |

So `rel="nofollow"` on a link to a partner does not hide your page from that partner: the browser still sends `Referer` according to your page's referrer policy, by default your origin for cross-origin links. And `rel="noreferrer"` does nothing for search engines. When you want both, list both:

```html
<a href="https://example.org/" rel="nofollow noreferrer">Example</a>
```

[rel="noopener noreferrer"](/blog/noopener-noreferrer) covers the browser values in detail.

## Where people put nofollow

- **Comments and forums:** `ugc`, or `ugc nofollow`, on links that visitors post.
- **Ads, affiliate and paid links:** `sponsored`.
- **Links you cannot vouch for** in other contexts: `nofollow`.
- **Sitewide on every outbound link:** possible, but it also stops search engines from following links you would gladly endorse.

## Links that go through a redirect

A link to a redirect service such as [Suparedirect](/) points at the redirect host, not the final site, so search engines see a link to your redirect URL. Suparedirect's redirect page is a small HTML page with a script, it sets no robots meta tag, and it is meant for people rather than crawlers. If you route outbound links through one, put the `rel` value you want on the link itself, and keep in mind that a self-hosted instance shows up in your logs and stats for every crawler that follows it.

When the goal is privacy rather than search signals, `rel="noreferrer"` on the link or a `Referrer-Policy` header is enough wherever you control the HTML. A dereferer link helps where you can only paste a URL. [noreferrer, Referrer-Policy or a dereferer?](/guide/noreferrer-referrer-policy) walks through that choice.

## FAQ

### What does rel nofollow do?

It tells search engines you do not want to vouch for the linked page. Google's documentation says to use it when sponsored or ugc do not apply and you would rather Google not associate your site with the page or crawl it from your site.

### Does nofollow hide the referrer?

No. nofollow is read by search engines and changes nothing in the browser. The destination still gets the Referer header. Use noreferrer or a Referrer-Policy for that.

### Can I combine nofollow with other rel values?

Yes. rel takes a space-separated list, such as rel="nofollow noreferrer" or rel="ugc nofollow". Google's documentation also accepts comma-separated values.

## Related posts

- [rel=noopener noreferrer: what each part does](/blog/noopener-noreferrer)
- [Hiding the referrer URL on outgoing links](/blog/hide-referrer-url)
- [noreferrer, Referrer-Policy or a dereferer?](/guide/noreferrer-referrer-policy)
- [All posts](/blog/)
