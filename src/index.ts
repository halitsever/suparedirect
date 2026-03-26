import express from "express";
const app = express();

app.get("/", (req: express.Request, res: express.Response) => {
  const { to } = req.query;

  if (!to) {
    return res.status(400).send("Missing params");
  }

  res.setHeader("Referrer-Policy", "no-referrer");

  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="referrer" content="no-referrer">
      </head>
      <body>
        <script>
          window.location = "${to}";
        </script>
      </body>
    </html>
  `);
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});