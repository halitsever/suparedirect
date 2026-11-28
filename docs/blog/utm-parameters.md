---
title: "What Are UTM Parameters? Tracking Without a Referer"
titleTemplate: false
description: "What UTM parameters are, the five Google Analytics reads, how they keep attribution when the Referer is hidden, and how to pass them through a redirect intact."
headline: "UTM parameters explained, and how they survive a hidden referrer"
date: "2026-11-28"
keyword: "what are utm parameters"
faq: [{"q": "What are UTM parameters?", "a": "Query string tags such as utm_source, utm_medium and utm_campaign that you add to a link so analytics tools can tell where a visit came from. Google Analytics says to always use those three."}, {"q": "Do UTM parameters work without a referrer?", "a": "Yes. They travel in the URL, not in the Referer header, so they still reach the destination when the referrer is hidden by noreferrer, a Referrer-Policy or a dereferer."}, {"q": "Why are my UTM parameters cut off after a redirect?", "a": "Usually the target URL was put into another URL's query string without encoding, so everything after the first & belongs to the outer URL. Encode the target with encodeURIComponent."}]
---

# UTM parameters explained, and how they survive a hidden referrer

<p class="post-meta">By <a href="https://halit.org">Halit Sever</a> · <time datetime="2026-11-28">28 November 2026</time></p>

<p class="lead">UTM parameters are tags in a link that tell an analytics tool where a visitor came from. They matter most exactly where the Referer header is missing: links in email, apps and chat, and links that pass through a referrer-hiding redirect. We checked how they behave through Suparedirect in headless Chrome.</p>

## The parameters

From [Google Analytics help on URL builders](https://support.google.com/analytics/answer/10917952):

| Parameter | Meaning | Example |
| --- | --- | --- |
| `utm_source` | where the traffic comes from | `newsletter`, `google` |
| `utm_medium` | the marketing medium | `email`, `cpc`, `banner` |
| `utm_campaign` | the campaign | `spring_sale` |
| `utm_term` | paid keyword | `screenshot+api` |
| `utm_content` | which link or creative | `header_button` |

Google says to always use `utm_source`, `utm_medium` and `utm_campaign`. A tagged link looks like this:

```txt
https://example.com/pricing?utm_source=newsletter&utm_medium=email&utm_campaign=november
```

## Why they matter when the referrer is gone

Analytics tools have two ways to know where a visit came from: the `Referer` header the browser sends, and tags in the URL. When the Referer is missing (links in email apps, a `rel="noreferrer"` link, a `Referrer-Policy: no-referrer` page, a dereferer), only the tags are left.

Google Analytics' [default channel group](https://support.google.com/analytics/answer/9756891) shows the effect. A visit counts as **Direct** when its source is `(direct)` and its medium is `(not set)` or `(none)`, which is what an untagged visit without a referrer looks like. The same visit with `utm_medium=email` falls into the **Email** channel instead, whatever the Referer said.

## Passing them through a redirect

Here is where links break. We sent the same tagged link through a local [Suparedirect](/) instance two ways and logged the URL that arrived:

| Link | URL at the destination | Referer |
| --- | --- | --- |
| `/?to=` + `encodeURIComponent(target)` | `/dest?utm_source=newsletter&utm_medium=email` | none |
| `/?to=` + the raw target | `/dest?utm_source=newsletter` | none |

The second link lost `utm_medium`. In the raw version the browser and server see `?to=https://b.test/dest?utm_source=newsletter&utm_medium=email`, and the `&` starts a new parameter of the outer URL. Suparedirect's `to` value ends at `newsletter`, and `utm_medium` is a separate parameter it ignores. Encoding turns `&` into `%26`, so the whole target stays inside `to`:

```js
const target = 'https://example.com/pricing?utm_source=newsletter&utm_medium=email&utm_campaign=november'
const link = `https://go.example.net/?to=${encodeURIComponent(target)}`
```

Suparedirect's [link generator](/link-generator/) encodes the target for you.

## Practical rules

- **Lowercase and consistent.** `Email` and `email` are different values in reports, so pick one spelling and keep it.
- **Tag only links that leave your control,** such as newsletters, ads, social posts and partner sites. On internal links, UTM tags can make your own pages show up as the campaign source.
- **No personal data in tags.** The URL ends up in logs, browser history and analytics. An email address in `utm_content` goes everywhere the URL goes.
- **Expect them in shared links.** People copy tagged URLs and share them, so some visits arrive with tags from someone else's campaign.

## UTM tags and privacy

Hiding the referrer and adding UTM tags look like opposites, but they answer different questions. The Referer tells the destination which page linked to it, without asking you. UTM tags tell it what you chose to say: `utm_source=newsletter` reveals the newsletter, not the subscriber's inbox or the exact page they read. With a dereferer and your own tags, you decide what the destination learns.

## FAQ

### What are UTM parameters?

Query string tags such as utm_source, utm_medium and utm_campaign that you add to a link so analytics tools can tell where a visit came from. Google Analytics says to always use those three.

### Do UTM parameters work without a referrer?

Yes. They travel in the URL, not in the Referer header, so they still reach the destination when the referrer is hidden by noreferrer, a Referrer-Policy or a dereferer.

### Why are my UTM parameters cut off after a redirect?

Usually the target URL was put into another URL's query string without encoding, so everything after the first & belongs to the outer URL. Encode the target with encodeURIComponent.

## Related posts

- [Hiding the referrer URL on outgoing links](/blog/hide-referrer-url)
- [Putting the target URL in a redirect service's path](/blog/redirect-service-url-in-path)
- [Anonymous link generator](/link-generator/)
- [All posts](/blog/)
