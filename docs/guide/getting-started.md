---
title: 'Getting started: Docker and from source'
description: Run Suparedirect from the Docker image or from source, check that it answers on port 3000, and build your first anonymous redirect link.
---

# Getting started

Suparedirect is one Express server with one route that matters: `GET /?to=<url>`. This page gets it running and walks through the first link. It takes a few minutes with Docker.

## Run the Docker image

The image is published as `halitsever/suparedirect:latest` on Docker Hub. It contains the redirect server on port 3000 and the stats dashboard on port 5173.

```bash
# redirect server and dashboard
docker run -p 3000:3000 -p 5173:5173 halitsever/suparedirect:latest

# redirect server only
docker run -p 3000:3000 halitsever/suparedirect:latest
```

The container still starts the dashboard in the second case. It is not reachable from outside because its port is not published.

The image is built for `linux/amd64`. Port 3000 is fixed in the code, so to serve on another host port change the left side of the mapping, for example `-p 8080:3000`.

## Run from source

You need Node.js and npm. The repository has two packages, the server at the root and the dashboard in `dashboard/`, and each has its own dependencies.

```bash
git clone https://github.com/halitsever/suparedirect.git
cd suparedirect

npm i                      # server dependencies
npm run dashboard:install  # dashboard dependencies
npm run build              # compiles src/ to dist/
npm run start              # server on 3000, dashboard on 5173
```

`npm run start` runs `node dist/index.js`, so the build step has to come first. For work on the code, `npm run dev` rebuilds on change and restarts the server.

If you only want the redirect server, skip the dashboard install and start it directly:

```bash
npm i && npm run build
node dist/index.js
```

## Check that it works

Ask for a redirect with curl:

```bash
curl -i 'http://localhost:3000/?to=https://example.com'
```

The answer is a `200 OK` with a small HTML page, not a `301` or `302`. You should see the `Referrer-Policy: no-referrer` header and a script that sets `window.location` to the target. curl prints the page and stops there, because the hop to the target happens in JavaScript. In a browser the same URL lands on example.com at once.

A request without `to` gets `400 Missing params`.

## Make your first anonymous link

Take the link you want to post and put your Suparedirect address in front of it:

```text
https://go.example/?to=https://shop.example/pricing
```

Here `go.example` stands for wherever you host Suparedirect. A few rules for the `to` value:

- A value that does not start with `http://` or `https://` gets `https://` added. `?to=shop.example` opens `https://shop.example`.
- If the target has its own query string with more than one parameter, percent-encode the whole target. Otherwise the second parameter is read as a parameter of Suparedirect and lost.
- Pass `to` once. A repeated `to` parameter is rejected with `400`.

In JavaScript, `encodeURIComponent` does the encoding:

```js
const target = 'https://shop.example/search?q=tea&page=2'
const link = 'https://go.example/?to=' + encodeURIComponent(target)
// https://go.example/?to=https%3A%2F%2Fshop.example%2Fsearch%3Fq%3Dtea%26page%3D2
```

## Next steps

- [How it works](./how-it-works) explains the redirect page and what it does and does not hide.
- [Self-hosting notes](./self-hosting) covers the things to settle before you put it on a public address.
- [Stats dashboard](./dashboard) describes the page on port 5173.
