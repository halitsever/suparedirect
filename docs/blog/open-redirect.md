---
title: "Open Redirect Vulnerability: Risks and How to Fix It"
titleTemplate: false
description: "What an open redirect vulnerability is, how phishing uses it, OWASP's fixes with a tested Node.js allowlist, and why a dereferer is an open redirect by design."
headline: "Open redirects: why they are risky and how to lock one down"
date: "2026-11-28"
keyword: "open redirect"
faq: [{"q": "What is an open redirect?", "a": "A URL on a trusted site that sends visitors to any address given in a parameter, such as a /redirect?to= link that accepts an attacker's address. OWASP calls it an unvalidated redirect; CWE-601 covers it."}, {"q": "Why is an open redirect dangerous?", "a": "Attackers put the trusted domain in phishing links. The link looks safe because it starts with a known site, then the redirect delivers the victim to the attacker's page."}, {"q": "How do I fix an open redirect?", "a": "Do not take full URLs as input when you can avoid it. Otherwise parse the URL and compare scheme and host against an allowlist, or show an interstitial page that names the destination."}]
---

# Open redirects: why they are risky and how to lock one down

<p class="post-meta">By <a href="https://halit.org">Halit Sever</a> · <time datetime="2026-11-28">28 November 2026</time></p>

<p class="lead">An open redirect is a page that forwards visitors to whatever URL a parameter names. Login pages with a return URL, link trackers and dereferers all have that shape. It is listed as CWE-601, and OWASP keeps a cheat sheet on it. Suparedirect is one too, on purpose, so this post covers both the risk and what to do when you run one.</p>

## What it looks like

```txt
https://trusted.example/redirect?to=https://evil.example/login
```

The server reads `to` and sends the browser there without checking it. [OWASP's Unvalidated Redirects and Forwards Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html) describes the danger: the link starts with a domain people trust, so phishing pages reached through it look more believable. [CWE-601](https://cwe.mitre.org/data/definitions/601.html) is the catalogue entry for the same weakness.

## Why it matters more than it seems

- **Phishing:** a mail filter or a careful reader sees `trusted.example` and lets it through.
- **OAuth and login flows:** a `redirect_uri` or `return_to` that is not checked can send tokens or codes to an attacker. This is why identity providers make you register exact redirect URLs.
- **Chained bugs:** OWASP notes that redirects and forwards can also be used to get past access control checks inside an application.

## The fixes, in OWASP's order

1. **Avoid redirects that take a URL** where you can.
2. **Map an ID to a URL on the server.** `?to=docs` looks up `https://docs.example.com/` in your own table, so nobody can supply a new destination.
3. **Validate the URL** when user input cannot be avoided: parse it, then compare the scheme, host and port against an explicit allowlist. Do not use prefix or suffix matching on the raw string.
4. **Show an interstitial** that names the destination and asks the visitor to click through.

## An allowlist that holds up

```js
const ALLOWED_HOSTS = new Set(['example.com', 'www.example.com', 'github.com'])

/** Returns the URL to redirect to, or null when it is not on the allowlist. */
function allowedTarget(to) {
  let url
  try { url = new URL(/^https?:\/\//i.test(to) ? to : `https://${to}`) } catch { return null }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null
  if (url.username || url.password) return null
  return ALLOWED_HOSTS.has(url.hostname) ? url.href : null
}
```

We ran it against inputs that trip up string checks:

| Input | Result |
| --- | --- |
| `https://example.com/a?b=1` | allowed |
| `github.com/halitsever` | allowed, as `https://github.com/halitsever` |
| `HTTPS://EXAMPLE.COM/x` | allowed, normalised to `https://example.com/x` |
| `https://example.com.evil.test/` | refused |
| `https://example.com@evil.test/` | refused: the real host is `evil.test` |
| `https://evil.test/?u=example.com` | refused |
| `javascript:alert(1)` | refused |

`new URL()` parses the way browsers do, so the host it returns is the host the browser will visit. `startsWith('https://example.com')` would have accepted the second and third tricky inputs.

## Suparedirect is an open redirect by design

A dereferer has to send people to any site, so [Suparedirect](/) takes any `to` value. From `src/index.ts`:

- `GET /?to=<url>` with no other check; a missing `to` gets a `400 Missing params`.
- A target without `http://` or `https://` gets `https://` in front, so `javascript:` URLs cannot run.
- The target is escaped with `encodeURI` and `JSON.stringify` before it goes into the redirect script.
- Every response allows any origin (`Access-Control-Allow-Origin: *`).

That makes a public instance a ready-made redirector on your domain for anyone. If you self-host it for yourself or a team, these options keep it from being used against others:

- **Add an allowlist** with the function above in the `/` handler and return `400` for anything else. That suits a dereferer for a known set of partner sites.
- **Keep it off a domain you care about.** Run it on its own hostname so phishing links through it do not borrow your main brand.
- **Put it behind access control** such as a VPN or an auth proxy when only your team uses it.
- **Watch `/api/stats`.** It lists the last 500 targets with timestamps, so unexpected destinations show up there. It has no authentication, so do not expose it publicly; see [the self-hosting notes](/guide/self-hosting).

## Testing your own site

Look for parameters such as `url`, `next`, `return`, `redirect`, `to` and `dest`, put an outside URL in them, and see whether the browser follows. Check login, logout and language-switch pages first, since they often take a return URL.

## FAQ

### What is an open redirect?

A URL on a trusted site that sends visitors to any address given in a parameter, such as a /redirect?to= link that accepts an attacker's address. OWASP calls it an unvalidated redirect; CWE-601 covers it.

### Why is an open redirect dangerous?

Attackers put the trusted domain in phishing links. The link looks safe because it starts with a known site, then the redirect delivers the victim to the attacker's page.

### How do I fix an open redirect?

Do not take full URLs as input when you can avoid it. Otherwise parse the URL and compare scheme and host against an allowlist, or show an interstitial page that names the destination.

## Related posts

- [Redirecting with JavaScript](/blog/javascript-redirect)
- [Before you self-host Suparedirect](/guide/self-hosting)
- [Putting the target URL in a redirect service's path](/blog/redirect-service-url-in-path)
- [How URL redirects work](/blog/how-url-redirects-work)
- [All posts](/blog/)
