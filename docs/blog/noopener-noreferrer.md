---
title: "rel=\"noopener noreferrer\": What It Does"
titleTemplate: false
description: "What rel=noopener and rel=noreferrer each do on a link, why target=_blank already implies noopener, and when noreferrer is worth adding to your links."
headline: "rel=\"noopener noreferrer\": what each part does"
date: "2026-11-28"
keyword: "noopener noreferrer"
faq: [{"q": "Is rel=\"noopener noreferrer\" still needed?", "a": "noopener is implied by target=\"_blank\" in current browsers, so it is only extra safety for old ones. noreferrer is still needed if you want to hide the referrer, and it implies noopener."}, {"q": "Does noreferrer affect SEO?", "a": "No. It only removes the Referer header from the request. Crawl hints are nofollow, sponsored and ugc."}]
---

# rel="noopener noreferrer": what each part does

<p class="post-meta">By <a href="https://halit.org">Halit Sever</a> · <time datetime="2026-11-28">28 November 2026</time></p>

<p class="lead">rel="noopener noreferrer" is two separate instructions on one link. noopener stops the new tab from reaching back to your page through window.opener. noreferrer also stops the browser from telling the destination where the visitor came from. In current browsers you rarely need the first; the second is a choice.</p>

## noopener

When a link opens a new tab, the new page used to get a reference to your page in `window.opener`. A hostile page could use it to send your tab to another address, for example a lookalike login page, while the visitor was looking at the new tab. `rel="noopener"` removes that reference: in the new page, `window.opener` is `null`. [MDN's noopener page](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/rel/noopener) describes it.

`noopener` alone does **not** remove the referrer. The destination still gets the `Referer` header under the page's referrer policy.

## target="_blank" already implies noopener

The HTML standard changed so that `target="_blank"` on `<a>`, `<area>` and `<form>` behaves as if `rel="noopener"` were set. MDN notes it, and current versions of Chrome, Firefox and Safari follow it. Writing `rel="noopener"` is still harmless and protects visitors on old browsers, so many linters and CMS templates keep adding it.

If you do want the new tab to have `window.opener`, for example for a popup-based login flow, you now have to ask for it with `rel="opener"`.

## noreferrer

`rel="noreferrer"` tells the browser to follow the link without a `Referer` header. On the destination, `document.referrer` is an empty string. It also implies `noopener`, so `rel="noreferrer"` alone gives you both effects and `rel="noopener noreferrer"` is a belt-and-braces spelling of the same thing.

Note the spelling: the link type is `noreferrer`, one word, while the policy value is `no-referrer` with a dash.

## Which one to use

| You want | Use |
| --- | --- |
| Open in a new tab, keep the referrer | `target="_blank"` (add `rel="noopener"` if you support old browsers) |
| Open in a new tab, no referrer | `target="_blank" rel="noreferrer"` |
| Same tab, no referrer | `rel="noreferrer"` |
| No referrer on every link of the page | A `Referrer-Policy: no-referrer` header instead of editing each link |

## Is noreferrer bad for anyone?

It is bad for the site you link to if it wants to know where its visitors come from. With `noreferrer`, your visits show up in its analytics as direct traffic. Affiliate and partner programs that check the referrer can stop crediting you. That is why many sites leave the referrer on for partners and use the default `strict-origin-when-cross-origin`, which only shares your origin anyway.

It does not affect search engines. `rel="nofollow"`, `rel="sponsored"` and `rel="ugc"` are hints for crawlers; `noreferrer` changes only the request the browser sends.

## In JavaScript

`window.open` takes the same two features as a comma-separated string:

```js
window.open('https://example.org/', '_blank', 'noopener,noreferrer')
```

With `noopener`, `window.open` returns `null` because your script gets no handle to the new window.

## Test it

Open this site's [referrer test page](https://projects.halit.org/suparedirect/referrer-test.html) from a normal link and from a `rel="noreferrer"` link and compare what it prints. The [link generator](/link-generator/) has both links ready.

## When you cannot add rel at all

Forum posts, chat messages and hosted CMS pages often write the `<a>` tag for you. There, a dereferer link such as one from [Suparedirect](/) gives the same result from inside the URL. [Do you need a dereferer?](/guide/noreferrer-referrer-policy) helps you decide.

## FAQ

### Is rel="noopener noreferrer" still needed?

noopener is implied by target="_blank" in current browsers, so it is only extra safety for old ones. noreferrer is still needed if you want to hide the referrer, and it implies noopener.

### Does noreferrer affect SEO?

No. It only removes the Referer header from the request. Crawl hints are nofollow, sponsored and ugc.

## Related posts

- [strict-origin-when-cross-origin, explained](/blog/strict-origin-when-cross-origin)
- [Referrer-Policy header: best practices and every value](/blog/referrer-policy-best-practices)
- [How to hide the referrer URL when linking out](/blog/hide-referrer-url)
- [All posts](/blog/)
