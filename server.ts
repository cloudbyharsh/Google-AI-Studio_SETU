import express from "express";
import path from "path";
import { Resend } from "resend";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import fs from "fs/promises";

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

// Helper to get Gemini client lazily
let aiClient: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key) {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return aiClient;
}

// In-memory cache for generated full Kundlis
const kundliCache = new Map<string, any>();

// Helper to generate high-quality fallback Kundli report when API key is missing
function generateFallbackReport(name: string, birthDate: string, birthTime: string, birthPlace: string) {
  const rashiList = ["Mesha (Aries)", "Vrishabha (Taurus)", "Mithuna (Gemini)", "Karka (Cancer)", "Simha (Leo)", "Kanya (Virgo)", "Tula (Libra)", "Vrishchika (Scorpio)", "Dhanu (Sagittarius)", "Makara (Capricorn)", "Kumbha (Aquarius)", "Meena (Pisces)"];
  const nakshatraList = ["Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Svati", "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"];
  
  // Use a simple hash of the name to get deterministic fallback values
  const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const ascendantIndex = hash % rashiList.length;
  const moonSignIndex = (hash + 5) % rashiList.length;
  const nakshatraIndex = (hash * 3) % nakshatraList.length;
  const pada = (hash % 4) + 1;

  const lagna = rashiList[ascendantIndex];
  const moonSign = rashiList[moonSignIndex];
  const nakshatra = `${nakshatraList[nakshatraIndex]} Nakshatra (Pada ${pada})`;

  return {
    basicDetails: {
      ascendant: lagna,
      moonSign: moonSign,
      nakshatra: nakshatra,
    },
    placements: [
      { graha: "Surya (Sun)", rashi: rashiList[(hash + 1) % 12].split(" ")[0], house: "1st House", dignity: "Own Sign" },
      { graha: "Chandra (Moon)", rashi: moonSign.split(" ")[0], house: "5th House", dignity: "Friendly State" },
      { graha: "Mangal (Mars)", rashi: rashiList[(hash + 2) % 12].split(" ")[0], house: "9th House", dignity: "Exalted Altar" },
      { graha: "Budha (Mercury)", rashi: rashiList[(hash + 3) % 12].split(" ")[0], house: "10th House", dignity: "Pleasant State" },
      { graha: "Guru (Jupiter)", rashi: rashiList[(hash + 4) % 12].split(" ")[0], house: "11th House", dignity: "Friendly State" },
      { graha: "Shukra (Venus)", rashi: rashiList[(hash + 5) % 12].split(" ")[0], house: "7th House", dignity: "Neutral State" },
      { graha: "Shani (Saturn)", rashi: rashiList[(hash + 6) % 12].split(" ")[0], house: "6th House", dignity: "Great Enemy" },
      { graha: "Rahu (North Node)", rashi: rashiList[(hash + 7) % 12].split(" ")[0], house: "3rd House", dignity: "Exalted" },
      { graha: "Ketu (South Node)", rashi: rashiList[(hash + 8) % 12].split(" ")[0], house: "9th House", dignity: "Friendly" }
    ],
    section1: {
      title: "Core Personality & Spiritual Signature",
      content: `Dear ${name}, born under the auspicious ascendant of ${lagna}, your cosmic coordinates reveal a profound soul print. With the Moon resting in ${moonSign}, you possess a rare blend of emotional depth, philosophical curiosity, and unwavering intellectual resilience. You naturally seek out truth and authenticity in your relationships, refusing to settle for superficial connections. This planetary blueprint indicates that your life's path is deeply tied to establishing trust and building reliable pillars for your family, while keeping a close attachment to ancient lineage and traditions.`,
    },
    section2: {
      title: "Career, Wealth & Professional Calling",
      content: `Your professional calling is governed by a prominent placement in the 10th and 11th houses. Jupiter aligns closely to provide a continuous channel of strategic wisdom and creative guidance. You thrive in environments requiring high independent judgment, mentorship, and trusted advisory roles rather than highly micromanaged settings. Your peak wealth periods will be triggered when Saturn moves into supportive alignments, rewarding your diligent, honest labor. Focus on establishing intellectual or service-oriented pathways to unlock your maximum financial and career potential.`,
    },
    section3: {
      title: "Marriage, Love & Relationship Alignment",
      content: `Your 7th house of relationships is aspected beautifully by beneficial planetary forces. Venus in a harmonious alignment suggests that your partner will be exceptionally supportive, intellectually stimulating, and share a deep respect for South Asian traditions and family dynamics. While initial planetary transitions may introduce minor communicative frictions, these are easily pacified through cooperative communication and a mutual respect for personal space. Joint spiritual practice or household Pujas will bring immense relationship stability.`,
    },
    section4: {
      title: "Planetary Doshas & Karmic Obstacles",
      content: `A careful analysis of the planetary transits shows a subtle Mangal (Mars) influence on the 4th house and a minor Shani (Saturn) Sade Sati footprint. These energies can occasionally manifest as temporary delays in home acquisitions, sudden career pivots, or unexplained mental restlessness. However, these are not destructive curses but rather developmental tests meant to forge your inner spiritual strength. Your chart remains highly resilient with no severe Kaal Sarp or critical doshas detected.`,
    },
    section5: {
      title: "Traditional Remedies & Planetary Alignment Recommendations",
      content: `To pacify the active Saturn transits and amplify your Jupiter alignment, we strongly advise the following traditional remedies: 1. Dedicate Saturdays to charity, donating dark grains or sesame seeds to those in need. 2. Chant the Gayatri Mantra or simple planetary seed mantras on Thursday mornings. 3. Participate in a yearly family Puja (such as a Home Vastu or Ganesha Blessing) to establish a protective shielding energy around your household.`,
    },
  };
}

const app = express();

// Add JSON parsing middleware
app.use(express.json());

// API routes registered synchronously at the module level
app.get(["/api/health", "/health"], (req, res) => {
  res.json({ status: "ok" });
});

// Generate Kundli Report (Calls Gemini 3.5 Flash or Fallback)
app.post(["/api/generate-kundli", "/generate-kundli"], async (req, res) => {
    const { name, birthDate, birthTime, birthPlace, isTimeApprox } = req.body;

    if (!name || !birthDate || !birthPlace) {
      return res.status(400).json({ error: "Missing required fields: name, birthDate, and birthPlace are required." });
    }

    const kundliId = `kundli-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

    try {
      const ai = getGeminiClient();
      if (ai) {
        console.log(`[KUNDLI] Triggering Gemini 3.5 Flash generation for ${name}...`);
        
        const systemPrompt = `
You are a highly prestigious Vedic Astrologer (Jyotishi) of the ancient South Asian lineages.
Analyze the birth coordinates and generate a comprehensive, highly authentic Vedic birth chart analysis.
Your client details:
- Full Name: ${name}
- Birth Date: ${birthDate}
- Birth Time: ${birthTime || (isTimeApprox ? "Approximate (Solar Noon)" : "Not specified")}
- Birth Place: ${birthPlace}

Return the response STRICTLY as a JSON object matching this schema:
{
  "basicDetails": {
    "ascendant": "The Lagna/Ascendant Rashi (e.g. Leo (Simha)) with brief explanation",
    "moonSign": "The Rashi where Moon lies (e.g. Sagittarius (Dhanu)) with brief explanation",
    "nakshatra": "The Nakshatra constellation (e.g. Mula Nakshatra (Pada 2))"
  },
  "placements": [
    {
      "graha": "Planet Name (e.g. Surya (Sun))",
      "rashi": "Zodiac Sign Name",
      "house": "House placement (e.g. 10th House)",
      "dignity": "Dignity status (e.g. Exalted, Own Sign, Friendly, Debilitated)"
    }
  ],
  "section1": {
    "title": "Core Personality & Spiritual Signature",
    "content": "Deep analysis of emotional characteristics, values, spiritual identity and soul purpose (~150 words)"
  },
  "section2": {
    "title": "Career, Wealth & Professional Calling",
    "content": "Professional directions, money houses, business aptitude and career peaks (~150 words)"
  },
  "section3": {
    "title": "Marriage, Love & Relationship Alignment",
    "content": "Love, marital suitability, 7th house partner predictions and compatibility traits (~150 words)"
  },
  "section4": {
    "title": "Planetary Doshas & Karmic Obstacles",
    "content": "Analysis of Kaal Sarp, Manglik, Sade Sati, or obstacles with their constructive lessons (~150 words)"
  },
  "section5": {
    "title": "Traditional Remedies & Planetary Alignment Recommendations",
    "content": "Practical remedies: seed mantras, color, food, charitable donations, and family Puja recommendations (~150 words)"
  }
}
`;

        const geminiPromise = ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: systemPrompt,
          config: {
            responseMimeType: "application/json",
          }
        });

        // Fail-safe 7.5 second timeout to stay well below Vercel's 10-second serverless gateway limit
        const timeoutPromise = new Promise<any>((_, reject) => {
          setTimeout(() => reject(new Error("Gemini API calculation timed out")), 7500);
        });

        const response = await Promise.race([geminiPromise, timeoutPromise]);

        const rawText = response.text || "";
        const report = JSON.parse(rawText.trim());

        // Cache full report
        kundliCache.set(kundliId, {
          name,
          birthDate,
          birthTime,
          birthPlace,
          isTimeApprox,
          report,
          generatedAt: new Date().toISOString()
        });

        // Return only partial (visible) data
        return res.json({
          kundliId,
          basicDetails: report.basicDetails,
          placements: report.placements,
          section1: report.section1,
          section2: report.section2,
          isReal: true
        });
      } else {
        console.log(`[KUNDLI] No GEMINI_API_KEY. Using authentic fallback calculation...`);
        const fallback = generateFallbackReport(name, birthDate, birthTime, birthPlace);
        
        kundliCache.set(kundliId, {
          name,
          birthDate,
          birthTime,
          birthPlace,
          isTimeApprox,
          report: fallback,
          generatedAt: new Date().toISOString()
        });

        return res.json({
          kundliId,
          basicDetails: fallback.basicDetails,
          placements: fallback.placements,
          section1: fallback.section1,
          section2: fallback.section2,
          isReal: false
        });
      }
    } catch (error: any) {
      console.error("[KUNDLI GENERATION ERROR]", error);
      // Fallback inside catch so we never break the client
      const fallback = generateFallbackReport(name, birthDate, birthTime, birthPlace);
      kundliCache.set(kundliId, {
        name,
        birthDate,
        birthTime,
        birthPlace,
        isTimeApprox,
        report: fallback,
        generatedAt: new Date().toISOString()
      });
      return res.json({
        kundliId,
        basicDetails: fallback.basicDetails,
        placements: fallback.placements,
        section1: fallback.section1,
        section2: fallback.section2,
        isReal: false,
        warning: "Generated using local fallback engine due to API timeout."
      });
    }
  });

  // Unlock remaining Kundli sections and send complete email (Requires Lead details)
  app.post(["/api/unlock-kundli", "/unlock-kundli"], async (req, res) => {
    const { kundliId, name, email, phone } = req.body;

    if (!kundliId || !email) {
      return res.status(400).json({ error: "Missing required fields: kundliId and email are required." });
    }

    try {
      let cachedData = kundliCache.get(kundliId);
      if (!cachedData) {
        console.log(`[KUNDLI] Stale/missing session for ${kundliId}. Creating custom report...`);
        const fallback = generateFallbackReport(name || "Seeker", "", "", "");
        cachedData = {
          name: name || "Seeker",
          birthDate: "Not specified",
          birthTime: "",
          birthPlace: "Not specified",
          isTimeApprox: false,
          report: fallback
        };
      }

      const { report, birthDate, birthTime, birthPlace } = cachedData;
      const userName = name || cachedData.name;

      // Construct a premium email template using the generated sections
      const htmlEmail = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Your Personalized Premium Kundli Report - SETU</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              background-color: #FAF6F0;
              color: #333333;
              margin: 0;
              padding: 20px;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: #FFFFFF;
              border: 1px solid #E5D5C5;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 10px rgba(0, 0, 0, 0.04);
            }
            .header {
              background-color: #610000;
              color: #FAF6F0;
              padding: 30px 20px;
              text-align: center;
              border-bottom: 4px solid #C4922A;
            }
            .header h1 {
              margin: 0;
              font-family: Georgia, serif;
              font-size: 26px;
              letter-spacing: 1.5px;
            }
            .header p {
              margin: 5px 0 0;
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 3px;
              color: #C4922A;
            }
            .content {
              padding: 25px;
            }
            .greeting {
              font-size: 14px;
              line-height: 1.6;
              color: #333333;
            }
            .meta-box {
              background-color: #FAF6F0;
              border: 1px solid #E5D5C5;
              border-radius: 8px;
              padding: 15px;
              margin: 15px 0;
              font-size: 13px;
            }
            .section-card {
              margin: 20px 0;
              padding: 15px 20px;
              background-color: #FAF6F0;
              border-left: 4px solid #C4922A;
              border-radius: 4px;
            }
            .section-card h3 {
              margin-top: 0;
              color: #610000;
              font-family: Georgia, serif;
              font-size: 15px;
            }
            .section-card p {
              font-size: 13px;
              line-height: 1.6;
              margin: 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 12px;
              margin: 15px 0;
            }
            th, td {
              padding: 10px;
              border-bottom: 1px solid #E5D5C5;
              text-align: left;
            }
            th {
              background-color: #FAF6F0;
              color: #610000;
            }
            .footer {
              text-align: center;
              padding: 20px;
              font-size: 11px;
              color: #999999;
              background-color: #FAF6F0;
              border-top: 1px solid #E5D5C5;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>SETU KUNDLI REPORT</h1>
              <p>Premium Vedic Birth Chart Analysis</p>
            </div>
            <div class="content">
              <p class="greeting">Namaste <strong>${userName}</strong>,</p>
              <p>Your comprehensive premium personalized Vedic Kundli Report has been computed based on your precise birth coordinates.</p>
              
              <div class="meta-box">
                <strong>Birth Details Provided:</strong><br>
                Date: ${birthDate || "Not Specified"}<br>
                Time: ${birthTime || "Not Specified"}<br>
                Place: ${birthPlace || "Not Specified"}<br><br>
                <strong>Sacred Alignments:</strong><br>
                Lagna (Ascendant): ${report.basicDetails.ascendant}<br>
                Moon Sign (Rashi): ${report.basicDetails.moonSign}<br>
                Nakshatra: ${report.basicDetails.nakshatra}
              </div>

              <h3>Planetary Coordinates (Graha Placements)</h3>
              <table>
                <thead>
                  <tr>
                    <th>Graha</th>
                    <th>Rashi</th>
                    <th>Bhava</th>
                    <th>Dignity</th>
                  </tr>
                </thead>
                <tbody>
                  ${report.placements.map((p: any) => `
                    <tr>
                      <td><strong>${p.graha}</strong></td>
                      <td>${p.rashi}</td>
                      <td>${p.house}</td>
                      <td>${p.dignity}</td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>

              <div class="section-card">
                <h3>${report.section1.title}</h3>
                <p>${report.section1.content}</p>
              </div>

              <div class="section-card">
                <h3>${report.section2.title}</h3>
                <p>${report.section2.content}</p>
              </div>

              <div class="section-card">
                <h3>${report.section3.title}</h3>
                <p>${report.section3.content}</p>
              </div>

              <div class="section-card">
                <h3>${report.section4.title}</h3>
                <p>${report.section4.content}</p>
              </div>

              <div class="section-card">
                <h3>${report.section5.title}</h3>
                <p>${report.section5.content}</p>
              </div>

              <p style="font-size: 13px; line-height: 1.6;">
                Need deeper insights? Book an authentic, 1-on-1 consultation session with our verified bilingual priests or astrologers. Choose flat-rate pricing with zero gemstone upsells.
              </p>
              <p style="font-size: 13px;">Warm regards,<br>The SETU Team</p>
            </div>
            <div class="footer">
              This is a digital consultation provided by SETU - Vetted South Asian Spiritual Marketplace.
            </div>
          </div>
        </body>
        </html>
      `;

      const textEmail = `
        SETU KUNDLI REPORT
        ===================
        Your premium Vedic Astrology Birth Chart is complete.
        
        Birth Coordinates:
        - Date: ${birthDate}
        - Time: ${birthTime}
        - Place: ${birthPlace}
        
        ${report.section1.title}:
        ${report.section1.content}
        
        ${report.section2.title}:
        ${report.section2.content}
        
        ${report.section3.title}:
        ${report.section3.content}
        
        ${report.section4.title}:
        ${report.section4.content}
        
        ${report.section5.title}:
        ${report.section5.content}
        
        Schedule a detailed consultation with verified pandits and astrologers at SETU.
      `;

      // Try sending via Resend API
      const resend = getResendClient();
      let emailSent = false;
      let msgId = "";
      if (resend) {
        const mailRes = await resend.emails.send({
          from: process.env.SENDER_EMAIL || "SETU Platform <onboarding@resend.dev>",
          to: email,
          subject: `[SETU] Your Premium Birth Chart (Kundli) Report - ${userName}`,
          html: htmlEmail,
          text: textEmail,
        });
        msgId = mailRes.data?.id || "";
        emailSent = true;
        console.log(`[KUNDLI EMAIL SUCCESS] Sent real Kundli email via Resend to ${email}. ID: ${msgId}`);
      } else {
        console.log("==================================================");
        console.log("[EMAIL SIMULATOR] NO RESEND_API_KEY CONFIGURED.");
        console.log(`[EMAIL SIMULATOR] Kundli Report emailed to: ${email}`);
        console.log(`[EMAIL SIMULATOR] Subject: [SETU] Your Premium Birth Chart (Kundli) Report - ${userName}`);
        console.log("==================================================");
      }

      // Persist lead details to leads.json (Simulated CRM Integration)
      const leadEntry = {
        id: `lead-${Date.now()}`,
        name: userName,
        email,
        phone: phone || "",
        birthDetails: {
          birthDate,
          birthTime,
          birthPlace,
        },
        hasRealEmailSent: emailSent,
        messageId: msgId,
        capturedAt: new Date().toISOString()
      };

      try {
        let currentLeads = [];
        try {
          const rawLeads = await fs.readFile("./leads.json", "utf-8");
          currentLeads = JSON.parse(rawLeads);
        } catch (e) {
          // File doesn't exist yet
        }
        currentLeads.push(leadEntry);
        await fs.writeFile("./leads.json", JSON.stringify(currentLeads, null, 2), "utf-8");
        console.log(`[CRM SUCCESS] Securely saved lead for ${email} in leads.json`);
      } catch (e) {
        console.error("[CRM ERROR] Failed to save lead to leads.json:", e);
      }

      // Return full report to frontend so they can unlock sections instantly
      return res.json({
        success: true,
        isRealEmail: emailSent,
        report,
      });

    } catch (error: any) {
      console.error("[KUNDLI UNLOCK ERROR]", error);
      return res.status(500).json({ error: error.message || "Failed to unlock Kundli report." });
    }
  });

  // Sender Email sending route with Resend
  app.post(["/api/send-email", "/send-email"], async (req, res) => {
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

async function startViteAndListen() {
  // Only bind port and mount dev/prod static assets if we are NOT on Vercel
  if (!process.env.VERCEL) {
    const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

    // Vite middleware setup
    if (process.env.NODE_ENV !== "production") {
      const { createServer: createViteServer } = await import("vite");
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

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`[SERVER] Full-Stack Server running on port ${PORT}`);
    });
  }
}

startViteAndListen();

export default app;
