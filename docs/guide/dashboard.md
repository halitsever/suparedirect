---
title: Stats dashboard
description: The Suparedirect stats dashboard on port 5173 shows total redirects and the latest 500 redirects from memory. What each number means and where it comes from.
---

# Stats dashboard

Suparedirect comes with a small React dashboard. It shows how many redirects the server has handled and lists the most recent ones. It is a view over one JSON endpoint, so anything it shows you can also read with curl.

![Suparedirect stats dashboard with total redirects, records in memory, last redirect and an empty redirect history](/dashboard.png)

## Open it

With the Docker image, publish port 5173 next to port 3000:

```bash
docker run -p 3000:3000 -p 5173:5173 halitsever/suparedirect:latest
```

Then open `http://localhost:5173`. From source, `npm run start` starts the dashboard together with the server once you have run `npm run dashboard:install`.

The dashboard requests `/api/stats` from its own address, and its Vite server forwards anything under `/api` to `http://localhost:3000`. Both processes run in the same container, so the dashboard works even if you publish port 5173 alone.

## What it shows

The page loads the stats once, then again every 5 seconds. The Refresh button loads them immediately. A clock in the header shows the current time.

| Element | Meaning |
| --- | --- |
| Total redirects | Number of redirects served since the process started. This counter is not capped. |
| Records in memory | Number of entries in the history, at most 500. |
| Last redirect | Time of the newest entry, with the hostname of its target underneath. |
| Redirect history | One row per stored redirect, newest first: time, target hostname, then path and query string. |

Before the first redirect the history shows "No redirects yet" with a hint to test `?to=https://example.com`. If the request for the stats fails, a banner says "Could not connect to backend. Is the server running?".

## Where the data comes from

The server keeps two things in memory: a counter and an array of the latest 500 redirects. `GET /api/stats` returns both.

```bash
curl http://localhost:3000/api/stats
```

```json
{
  "total": 2,
  "history": [
    {
      "id": 2,
      "url": "https://shop.example/pricing",
      "timestamp": "2026-11-27T00:39:25.104Z",
      "userAgent": "Mozilla/5.0 ..."
    },
    {
      "id": 1,
      "url": "https://example.com",
      "timestamp": "2026-11-27T00:39:20.011Z",
      "userAgent": "curl/8.18.0"
    }
  ]
}
```

Each entry has the target URL after `https://` was added where needed, an ISO timestamp and the `User-Agent` of the request, or `Unknown` if there was none. The API returns the user agent, but the dashboard rows do not display it.

Nothing is written to disk. Restarting the process or the container sets the counter back to zero and empties the history. When entry 501 arrives, the oldest one is dropped, while the total keeps counting.

## Who can see it

The dashboard has no login. Anyone who can reach port 5173 can read it, and anyone who can reach port 3000 can call `/api/stats` directly. The history is a list of every recent target URL, so treat both as private:

- Do not publish port 5173 on a public interface. Bind it to localhost with `-p 127.0.0.1:5173:5173` and reach it through an SSH tunnel or a VPN.
- Block `/api/stats` at your reverse proxy for public traffic. The dashboard still works, because it reaches the server inside the container.

In the Docker image the dashboard is served by the Vite development server, not from a static build. [Self-hosting notes](./self-hosting#the-dashboard-runs-on-the-vite-dev-server) explains what that means for a deployment.
