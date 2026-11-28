---
title: Self-hosting notes
description: What to know before you put Suparedirect on a public address. The fixed port 3000, in-memory stats capped at 500, the open stats endpoint and TLS.
---

# Before you self-host Suparedirect

Suparedirect is a small program, and a few of its choices matter once it faces the internet. Everything here follows from the code and the Dockerfile in the repository.

## Port 3000 is fixed

The server calls `app.listen(3000)`. There is no environment variable or flag for the port. With Docker, change the published port and leave the container side alone:

```bash
docker run -p 8080:3000 halitsever/suparedirect:latest
```

From source, the same number also appears in the `/api` proxy of `dashboard/vite.config.ts`. If you edit the port in `src/index.ts`, edit it there too.

## There is no TLS and no configuration

The server speaks plain HTTP and has no settings. Put a reverse proxy in front of it for HTTPS and a domain name. A minimal nginx location looks like this:

```nginx
location / {
    proxy_pass http://127.0.0.1:3000;
}
```

## Stats live in memory

The redirect history is an array in the Node.js process, capped at 500 entries. The total counter is a number next to it. Neither is written to disk.

- A restart, a redeploy or a crash resets both.
- There is no database to back up and no volume to mount.
- If you run more than one instance behind a load balancer, each one has its own history.

If you need durable click statistics, take them from your reverse proxy's access log.

## The stats endpoint is open

`GET /api/stats` returns the history to anyone who can reach port 3000. Every response also carries `Access-Control-Allow-Origin: *`, so a script on any website can read it from a visitor's browser if the endpoint is reachable.

The history holds the target URL, the time and the user agent of each recent redirect. To keep it private, block the path at the proxy:

```nginx
location = /api/stats {
    return 403;
}
```

The dashboard keeps working with this rule, because its requests go to the server inside the container and not through your proxy.

## It redirects to any URL

The handler accepts any `to` value. There is no allowlist of targets, no authentication and no rate limit. Anyone who knows the address of your instance can build links through it, and those links carry your domain name.

Decide whether that is acceptable for the domain you use. If it is not, restrict who can reach the service at the proxy, for example by network range.

## The dashboard runs on the Vite dev server

The image's start command is `npm run start`. It runs two processes with `concurrently`: the compiled server, and `vite` in development mode for the dashboard on port 5173. There is no static build of the dashboard in the image.

In practice:

- Treat port 5173 as an internal tool. Bind it to localhost with `-p 127.0.0.1:5173:5173` or do not publish it.
- Vite's dev server only answers requests for `localhost` and IP addresses by default. To open the dashboard under a domain name, add that name to `server.allowedHosts` in `dashboard/vite.config.ts` and rebuild the image.
- If either process exits, the other keeps running. A container health check on port 3000 is a good idea.

## The image

- Base image `node:24-alpine`, built for `linux/amd64`. On ARM hosts it runs under emulation if your Docker setup provides it.
- The process runs as the unprivileged `node` user.
- `halitsever/suparedirect:latest` is rebuilt on every push to the `main` branch. There are no version tags. Pin the image by digest if you want deployments to be repeatable:

```bash
docker pull halitsever/suparedirect:latest
docker inspect --format '{{index .RepoDigests 0}}' halitsever/suparedirect:latest
```

## Visitors need JavaScript

The redirect is a script. A visitor with JavaScript turned off sees a blank page and has no link to click. Keep that in mind for audiences that often browse without scripts.

## A short checklist

1. Reverse proxy with HTTPS in front of port 3000.
2. `/api/stats` blocked for public traffic.
3. Port 5173 bound to localhost or not published.
4. A decision on who may create links through your instance.
