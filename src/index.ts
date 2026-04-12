import express from "express";

const app = express();

interface RedirectLog {
  id: number;
  url: string;
  timestamp: string;
  userAgent: string;
}

let counter = 0;
const redirectHistory: RedirectLog[] = [];
const MAX_HISTORY = 500;

app.use((_req: express.Request, res: express.Response, next: express.NextFunction) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  next();
});

app.get("/", (req: express.Request, res: express.Response) => {
  const { to } = req.query;

  if (!to || typeof to !== "string") {
    return res.status(400).send("Missing params");
  }

  const normalizedUrl =
    to.startsWith("http://") || to.startsWith("https://") ? to : `https://${to}`;

  const log: RedirectLog = {
    id: ++counter,
    url: normalizedUrl,
    timestamp: new Date().toISOString(),
    userAgent: (req.headers["user-agent"] as string) || "Unknown",
  };

  redirectHistory.unshift(log);
  if (redirectHistory.length > MAX_HISTORY) {
    redirectHistory.pop();
  }

  res.setHeader("Referrer-Policy", "no-referrer");

  const safeUrl = encodeURI(normalizedUrl);

  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="referrer" content="no-referrer">
      </head>
      <body>
        <script>
          window.location = ${JSON.stringify(safeUrl)};
        </script>
      </body>
    </html>
  `);
});

app.get("/api/stats", (_req: express.Request, res: express.Response) => {
  res.json({
    total: counter,
    history: redirectHistory,
  });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});