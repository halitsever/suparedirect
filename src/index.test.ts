import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app, resetState } from "./index.js";

beforeEach(() => {
  resetState();
});

describe("CORS middleware", () => {
  it("sets Access-Control-Allow-Origin: *", async () => {
    const res = await request(app).get("/api/stats");
    expect(res.headers["access-control-allow-origin"]).toBe("*");
  });

  it("sets Access-Control-Allow-Methods: GET", async () => {
    const res = await request(app).get("/api/stats");
    expect(res.headers["access-control-allow-methods"]).toBe("GET");
  });
});

describe("GET / — redirect handler", () => {
  it("returns 400 when `to` param is missing", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(400);
    expect(res.text).toBe("Missing params");
  });

  it("returns 400 when `to` param is an array", async () => {
    const res = await request(app).get("/?to=a&to=b");
    expect(res.status).toBe(400);
  });

  it("returns 200 with HTML redirect page for valid `to`", async () => {
    const res = await request(app).get("/?to=https://example.com");
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/html/);
  });

  it("prefixes https:// when no protocol supplied", async () => {
    const res = await request(app).get("/?to=example.com");
    expect(res.text).toContain("https://example.com");
  });

  it("preserves https:// when already present", async () => {
    const res = await request(app).get("/?to=https://example.com");
    expect(res.text).toContain("https://example.com");
    expect(res.text).not.toContain("https://https://");
  });

  it("preserves http:// when already present", async () => {
    const res = await request(app).get("/?to=http://example.com");
    expect(res.text).toContain("http://example.com");
    expect(res.text).not.toContain("https://http://");
  });

  it("sets Referrer-Policy: no-referrer header", async () => {
    const res = await request(app).get("/?to=https://example.com");
    expect(res.headers["referrer-policy"]).toBe("no-referrer");
  });

  it("includes <meta name=\"referrer\" content=\"no-referrer\"> in HTML", async () => {
    const res = await request(app).get("/?to=https://example.com");
    expect(res.text).toContain('<meta name="referrer" content="no-referrer">');
  });

  it("includes window.location assignment in HTML", async () => {
    const res = await request(app).get("/?to=https://example.com");
    expect(res.text).toContain("window.location");
    expect(res.text).toContain("https://example.com");
  });

  it("increments counter on each redirect", async () => {
    await request(app).get("/?to=https://a.com");
    await request(app).get("/?to=https://b.com");
    const stats = await request(app).get("/api/stats");
    expect(stats.body.total).toBe(2);
  });

  it("records redirect in history with correct url", async () => {
    await request(app).get("/?to=https://example.com");
    const stats = await request(app).get("/api/stats");
    expect(stats.body.history[0].url).toBe("https://example.com");
  });

  it("records redirect with normalized url (no protocol → https)", async () => {
    await request(app).get("/?to=example.com");
    const stats = await request(app).get("/api/stats");
    expect(stats.body.history[0].url).toBe("https://example.com");
  });

  it("records user agent in history log", async () => {
    await request(app).get("/?to=https://example.com").set("User-Agent", "TestAgent/1.0");
    const stats = await request(app).get("/api/stats");
    expect(stats.body.history[0].userAgent).toBe("TestAgent/1.0");
  });

  it("stores 'Unknown' when user agent is absent", async () => {
    await request(app).get("/?to=https://example.com").set("User-Agent", "");
    const stats = await request(app).get("/api/stats");
    expect(stats.body.history[0].userAgent).toBe("Unknown");
  });

  it("stores entries newest-first (unshift order)", async () => {
    await request(app).get("/?to=https://first.com");
    await request(app).get("/?to=https://second.com");
    const stats = await request(app).get("/api/stats");
    expect(stats.body.history[0].url).toBe("https://second.com");
    expect(stats.body.history[1].url).toBe("https://first.com");
  });

  it("caps history at MAX_HISTORY (500) entries", async () => {
    const requests = Array.from({ length: 502 }, (_, i) =>
      request(app).get(`/?to=https://example.com/page${i}`)
    );
    await Promise.all(requests);
    const stats = await request(app).get("/api/stats");
    expect(stats.body.history.length).toBe(500);
  });

  it("assigns sequential ids", async () => {
    await request(app).get("/?to=https://a.com");
    await request(app).get("/?to=https://b.com");
    const stats = await request(app).get("/api/stats");
    const ids = stats.body.history.map((e: { id: number }) => e.id).sort((a: number, b: number) => a - b);
    expect(ids).toEqual([1, 2]);
  });

  it("includes ISO timestamp in history log", async () => {
    const before = new Date().toISOString();
    await request(app).get("/?to=https://example.com");
    const after = new Date().toISOString();
    const stats = await request(app).get("/api/stats");
    const ts = stats.body.history[0].timestamp;
    expect(ts >= before && ts <= after).toBe(true);
  });
});

describe("GET /api/stats", () => {
  it("returns 200 with JSON", async () => {
    const res = await request(app).get("/api/stats");
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/json/);
  });

  it("returns total: 0 and empty history on fresh state", async () => {
    const res = await request(app).get("/api/stats");
    expect(res.body).toEqual({ total: 0, history: [] });
  });

  it("total reflects all redirects including those evicted from history", async () => {
    const requests = Array.from({ length: 502 }, (_, i) =>
      request(app).get(`/?to=https://example.com/page${i}`)
    );
    await Promise.all(requests);
    const res = await request(app).get("/api/stats");
    expect(res.body.total).toBe(502);
    expect(res.body.history.length).toBe(500);
  });
});
