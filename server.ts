import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { Resend } from "resend";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Helper to get Resend client lazily (so we don't crash if the key is missing)
let resendClient: Resend | null = null;
function getResendClient() {
  if (!resendClient) {
    const key = process.env.RESEND_API_KEY;
    if (key) {
      resendClient = new Resend(key);
    }
  }
  return resendClient;
}

const app = express();

async function startServer() {
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Add JSON parsing middleware
  app.use(express.json());

  // API routes first
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Sender Email sending route with Resend
  app.post("/api/send-email", async (req, res) => {
    const { to, subject, html, text } = req.body;

    if (!to || !subject || (!html && !text)) {
      return res.status(400).json({ error: "Missing required fields (to, subject, html/text)" });
    }

    try {
      const resend = getResendClient();
      if (resend) {
        const response = await resend.emails.send({
          from: process.env.SENDER_EMAIL || "SETU Platform <onboarding@resend.dev>",
          to,
          subject,
          html: html || text,
          text: text || html,
        });

        console.log(`[EMAIL SUCCESS] Sent real email via Resend to ${to}. ID: ${response.data?.id}`);
        return res.json({
          success: true,
          messageId: response.data?.id,
          isReal: true,
          message: "Email sent successfully!",
        });
      } else {
        // Fallback simulation mode
        console.log("==================================================");
        console.log("[EMAIL SIMULATOR] NO RESEND_API_KEY CONFIGURED.");
        console.log(`[EMAIL SIMULATOR] To: ${to}`);
        console.log(`[EMAIL SIMULATOR] Subject: ${subject}`);
        console.log(`[EMAIL SIMULATOR] Body:\n${text || html}`);
        console.log("==================================================");

        return res.json({
          success: true,
          isReal: false,
          message: "Email logged to server console (define RESEND_API_KEY to send real emails)",
        });
      }
    } catch (error: any) {
      console.error("[EMAIL ERROR] Failed to send email:", error);
      return res.status(500).json({ error: error.message || "Failed to send email" });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("[SERVER] Vite middleware mounted in development mode");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log(`[SERVER] Serving static assets from: ${distPath}`);
  }

  // Only bind port if we are NOT on Vercel
  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`[SERVER] Full-Stack Server running on port ${PORT}`);
    });
  }
}

startServer();

export default app;
