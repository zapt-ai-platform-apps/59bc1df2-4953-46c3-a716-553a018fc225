import * as Sentry from "@sentry/node";
import fetch from "node-fetch";

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
    if (req.method !== "POST") {
      res.setHeader("Allow", ["POST"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const { currency, address } = req.body;

    if (!currency || !address) {
      return res.status(400).json({ error: "Currency and address are required" });
    }

    // Prepare the data for the FaucetPay API call
    const params = new URLSearchParams();
    params.append("api_key", process.env.FAUCETPAY_API_KEY);
    params.append("currency", currency);
    params.append("to", address);
    params.append("amount", process.env.PAYOUT_AMOUNT);
    params.append("referral", "");
    params.append("ip_address", req.headers["x-forwarded-for"] || req.connection.remoteAddress);

    const response = await fetch("https://faucetpay.io/api/send", {
      method: "POST",
      body: params,
    });

    const data = await response.json();

    if (data.status === 200) {
      res.status(200).json({ amount: data.payout_amount });
    } else {
      res.status(400).json({ error: data.message });
    }
  } catch (error) {
    Sentry.captureException(error);
    console.error("Error sending payment:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}