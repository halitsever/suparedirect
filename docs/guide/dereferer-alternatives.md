---
title: Dereferer services vs self-hosting
description: How hosted dereferer and link anonymizer services differ from a self-hosted dereferer such as Suparedirect, and what to check before you rely on either.
---

# Dereferer services compared with self-hosting

A dereferer, also written dereferrer, is a redirect service that hides the referrer. You link to the service with the real destination as a parameter, and the destination receives the visitor without a `Referer` header. The same idea goes by other names: link anonymizer, anonymous redirect, anonymous link service.

There are two ways to get one. You can use a hosted service that someone else runs, or you can run the software yourself. Suparedirect is the second kind.

## Hosted dereferer services

Names that people search for in this category include anonym.to, href.li and nullrefer. A hosted dereferer is used by putting the service's address in front of your link and posting the result.

This page does not rate individual services. Their operators, policies and availability change, and none of it can be verified from outside. What can be said about any hosted dereferer follows from how the technique works:

- Every click passes through the operator's server. The operator can see the destination, the visitor's IP address and, if the browser sends it, the page the click came from.
- You depend on the operator's uptime. If the service goes offline or its domain changes hands, every link you posted through it stops working or goes somewhere else.
- The operator decides what the intermediate page shows, and that can change at any time.
- A domain shared by many users can end up on spam or security blocklists because of what other people link through it.

None of this means a hosted service is a bad choice. For a handful of casual links it is the least work.

## Running your own

With a self-hosted dereferer the trade is the opposite. You do the hosting, and in return the click data stays with you.

| | Hosted service | Self-hosted (Suparedirect) |
| --- | --- | --- |
| Who sees the clicks | The service operator | You |
| Setup | None | A container and a domain |
| Link lifetime | As long as the operator keeps the service | As long as you keep the server |
| Intermediate page | Decided by the operator | A blank page with one script |
| Domain reputation | Shared with all users | Your own |
| Cost | Set by the operator | Your hosting |

## What Suparedirect does and does not do

So you can compare it fairly, here is the full list of what the code does:

- One route, `GET /?to=<url>`, that returns a page with `Referrer-Policy: no-referrer` and a script that navigates to the target.
- `https://` added to targets given without a scheme.
- An in-memory count and a history of the latest 500 redirects, served at `GET /api/stats`.
- A React dashboard that displays those stats.
- A Docker image, `halitsever/suparedirect:latest`.

And what it leaves out:

- No accounts, API keys or access control.
- No allowlist or blocklist of destinations, and no rate limiting.
- No persistent storage. Stats reset on restart.
- No fallback for visitors without JavaScript.
- No interstitial, notice or advertising.
- No link shortening. The destination stays visible in the URL.

[Self-hosting notes](./self-hosting) explains how to cover the first two with a reverse proxy.

## Questions to ask of any dereferer

Whether you pick a hosted service or run one, the same checks apply.

1. Does it really remove the header? Test it. Link through the service to a page you control and look at the request, or use a page that prints `document.referrer`.
2. Who can see the click log, and how long is it kept? With Suparedirect the answer is in the code: 500 entries in memory, readable at `/api/stats` by anyone who can reach the port unless you block it.
3. What happens to old links if the service ends? With your own domain you can point the address at something else later.
4. What does the visitor see on the way? With Suparedirect, a blank page for a moment.

## Do you need one at all?

Often not. If the links are on pages you control, `rel="noreferrer"` or a `Referrer-Policy` header removes the referrer with no redirect and no third server. A dereferer is for the places where you can only post a URL. The guide to [noreferrer and Referrer-Policy](./noreferrer-referrer-policy) goes through the cases.

If you decide to run your own, [Getting started](./getting-started) has the commands.
