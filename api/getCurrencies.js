import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.VITE_PUBLIC_SENTRY_DSN,
  environment: process.env.VITE_PUBLIC_APP_ENV,
  initialScope: {
    tags: {
      type: "backend",
      projectId: process.env.PROJECT_ID,
    },
  },
});

export default async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      res.setHeader("Allow", ["GET"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    // List of supported currencies from FaucetPay
    const currencies = [
      "btc",
      "ltc",
      "doge",
      "eth",
      "dash",
      "bch",
      "dgb",
      "trx",
      "usdt",
      "zec"
    ];

    res.status(200).json(currencies);
  } catch (error) {
    Sentry.captureException(error);
    console.error("Error fetching currencies:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}