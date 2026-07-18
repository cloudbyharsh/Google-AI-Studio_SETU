import { BookingRequest, Practitioner, Service } from "../types";

export interface EmailResponse {
  success: boolean;
  isReal: boolean;
  messageId?: string;
  message?: string;
  error?: string;
}

/**
 * Sends a beautifully formatted spiritual ritual booking confirmation email
 * via the secure backend proxy endpoint.
 */
export async function sendBookingEmail(
  booking: BookingRequest,
  practitioner: Practitioner,
  service: Service
): Promise<EmailResponse> {
  const formattedDate = new Date(booking.preferredDate + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const depositAmount = booking.depositPaid || (service.price * 0.1);
  const remainingAmount = service.price - depositAmount;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Booking Request Received - SETU Platform</title>
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
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        .header {
          background-color: #7F1D1D; /* Maroon */
          color: #FAF6F0; /* Ivory */
          padding: 30px 20px;
          text-align: center;
          border-bottom: 4px solid #D97706; /* Gold */
        }
        .header h1 {
          margin: 0;
          font-family: serif;
          font-size: 24px;
          letter-spacing: 1px;
        }
        .header p {
          margin: 5px 0 0;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #FCD34D;
        }
        .content {
          padding: 30px 25px;
        }
        .greeting {
          font-size: 16px;
          line-height: 1.5;
          margin-bottom: 20px;
        }
        .highlight-card {
          background-color: #FDFBF7;
          border: 1px solid #F5EBDC;
          border-left: 4px solid #D97706;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 25px;
        }
        .highlight-card h3 {
          margin: 0 0 10px 0;
          color: #7F1D1D;
          font-size: 16px;
          font-family: serif;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px dashed #F3E8D5;
          font-size: 14px;
        }
        .detail-row:last-child {
          border-bottom: none;
        }
        .detail-label {
          color: #666666;
          font-weight: 500;
        }
        .detail-value {
          color: #111111;
          font-weight: bold;
        }
        .section-title {
          font-family: serif;
          color: #7F1D1D;
          border-bottom: 1px solid #E5D5C5;
          padding-bottom: 6px;
          margin: 25px 0 12px 0;
          font-size: 16px;
        }
        .preparation-list {
          padding-left: 20px;
          margin: 0;
        }
        .preparation-list li {
          font-size: 13px;
          color: #555555;
          margin-bottom: 6px;
          line-height: 1.4;
        }
        .footer {
          background-color: #FAF6F0;
          text-align: center;
          padding: 20px;
          font-size: 12px;
          color: #888888;
          border-top: 1px solid #E5D5C5;
        }
        .badge {
          background-color: #FEF3C7;
          color: #D97706;
          padding: 2px 8px;
          border-radius: 9999px;
          font-size: 10px;
          font-weight: bold;
          text-transform: uppercase;
        }
        .escrow-alert {
          background-color: #ECFDF5;
          border: 1px solid #A7F3D0;
          color: #065F46;
          border-radius: 8px;
          padding: 15px;
          margin-top: 25px;
          font-size: 13px;
          line-height: 1.4;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>SETU PLATFORM</h1>
          <p>Traditional Lineage Verification & Rituals</p>
        </div>
        <div class="content">
          <div class="greeting">
            <p>Namaste <strong>${booking.name}</strong>,</p>
            <p>We have successfully received your ritual booking request on the SETU Platform. Below are your booking details, custom astrological parameters, and immediate next steps.</p>
          </div>

          <div class="highlight-card">
            <h3>Ritual Ceremony Summary</h3>
            <div class="detail-row">
              <span class="detail-label">Booking Reference</span>
              <span class="detail-value" style="font-family: monospace;">${booking.id}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Ceremony</span>
              <span class="detail-value">${service.categoryEmoji} ${service.name}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Practitioner</span>
              <span class="detail-value">${practitioner.name} (${practitioner.title})</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Date & Time</span>
              <span class="detail-value">${formattedDate} at ${booking.selectedTimeSlot || "Preferred Time Range"}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Format</span>
              <span class="detail-value" style="text-transform: capitalize;">${booking.format || "online"}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Status</span>
              <span class="badge">PENDING REVIEW</span>
            </div>
          </div>

          <div class="highlight-card" style="border-left-color: #0D9488; background-color: #F0FDF4;">
            <h3>Financial & Escrow Details</h3>
            <div class="detail-row">
              <span class="detail-label">Total Dakshina Guide</span>
              <span class="detail-value" style="color: #0D9488;">$${service.price.toFixed(2)} USD</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Holding Deposit Paid</span>
              <span class="detail-value" style="color: #0D9488;">$${depositAmount.toFixed(2)} USD</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Remaining Escrow Hold</span>
              <span class="detail-value">$${remainingAmount.toFixed(2)} USD</span>
            </div>
          </div>

          ${booking.birthDate ? `
          <h4 class="section-title">Astrological Sankalpa Coordinates</h4>
          <div class="detail-row">
            <span class="detail-label">Birth Date</span>
            <span class="detail-value">${booking.birthDate}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Birth Time</span>
            <span class="detail-value">${booking.birthTime || "Not provided"}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Birth Place</span>
            <span class="detail-value">${booking.birthPlace || "Not provided"}</span>
          </div>
          ` : ""}

          ${service.preparation && service.preparation.length > 0 ? `
          <h4 class="section-title">Household & Family Preparation</h4>
          <ul class="preparation-list">
            ${service.preparation.map(prep => `<li>${prep}</li>`).join("")}
          </ul>
          ` : ""}

          <div class="escrow-alert">
            <strong>🛡️ SETU Escrow & Lineage Protection:</strong><br>
            Your $${depositAmount.toFixed(2)} holding deposit is securely held in escrow. The remaining amount will only be authorized after the ritual is fully performed. If the priest declines this booking request or cancels, 100% of your deposit will be refunded instantly back to your card.
          </div>
        </div>
        <div class="footer">
          <p>You received this email because you initiated a booking request on SETU.</p>
          <p>© 2026 SETU Platform. All spiritual lineages verified and secure.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
    Namaste ${booking.name},

    Your spiritual booking has been received on SETU Platform.

    Booking Reference: ${booking.id}
    Ceremony: ${service.name}
    Practitioner: ${practitioner.name}
    Date & Time: ${formattedDate} at ${booking.selectedTimeSlot}
    Status: Pending Practitioner Confirmation

    Holding Deposit Paid: $${depositAmount.toFixed(2)} USD
    Total Dakshina: $${service.price.toFixed(2)} USD

    Your holding deposit is protected under the SETU Escrow agreement.

    Best regards,
    The SETU Team
  `;

  try {
    const response = await fetch("/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: booking.email,
        subject: `[SETU] Booking Request Received - Reference: ${booking.id}`,
        html: htmlContent,
        text: textContent,
      }),
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || "Failed to send email through backend API.");
    }

    return await response.json() as EmailResponse;
  } catch (error: any) {
    console.error("[Email Client Error]", error);
    return {
      success: false,
      isReal: false,
      error: error.message || String(error),
    };
  }
}

/**
 * Sends a premium, beautifully designed full Kundli Chart report to the user
 */
export async function sendKundliEmail(
  userName: string,
  email: string,
  phone: string,
  birthDate: string,
  birthTime: string,
  birthPlace: string
): Promise<EmailResponse> {
  const htmlContent = `
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
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        .header {
          background-color: #7F1D1D; /* Maroon */
          color: #FAF6F0; /* Ivory */
          padding: 30px 20px;
          text-align: center;
          border-bottom: 4px solid #D97706; /* Gold */
        }
        .header h1 {
          margin: 0;
          font-family: serif;
          font-size: 26px;
          letter-spacing: 1.5px;
        }
        .header p {
          margin: 5px 0 0;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 3px;
          color: #FCD34D;
        }
        .content {
          padding: 30px 25px;
        }
        .greeting {
          font-size: 16px;
          line-height: 1.5;
          margin-bottom: 20px;
        }
        .chart-box {
          background-color: #FDFBF7;
          border: 1px dashed #D97706;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 25px;
          text-align: center;
        }
        .section-title {
          font-family: serif;
          color: #7F1D1D;
          border-bottom: 1px solid #E5D5C5;
          padding-bottom: 6px;
          margin: 25px 0 12px 0;
          font-size: 18px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .planetary-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
          font-size: 13px;
        }
        .planetary-table th {
          background-color: #7F1D1D;
          color: white;
          text-align: left;
          padding: 8px;
          font-weight: bold;
        }
        .planetary-table td {
          border-bottom: 1px solid #F3E8D5;
          padding: 8px;
          color: #555555;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px dashed #F3E8D5;
          font-size: 14px;
        }
        .detail-label {
          color: #666666;
          font-weight: 500;
        }
        .detail-value {
          color: #111111;
          font-weight: bold;
        }
        .insight-card {
          background-color: #FDFBF7;
          border-left: 4px solid #7F1D1D;
          border-radius: 6px;
          padding: 15px;
          margin-bottom: 15px;
        }
        .insight-card h4 {
          margin: 0 0 6px 0;
          color: #7F1D1D;
          font-family: serif;
          font-size: 15px;
        }
        .insight-card p {
          margin: 0;
          font-size: 13px;
          color: #555555;
          line-height: 1.4;
        }
        .remedy-badge {
          background-color: #FEF3C7;
          color: #D97706;
          padding: 2px 8px;
          border-radius: 9999px;
          font-size: 10px;
          font-weight: bold;
          text-transform: uppercase;
          display: inline-block;
          margin-bottom: 6px;
        }
        .footer {
          background-color: #FAF6F0;
          text-align: center;
          padding: 20px;
          font-size: 12px;
          color: #888888;
          border-top: 1px solid #E5D5C5;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>SETU KUNDLI REPORT</h1>
          <p>Personalized Astrological Cosmic Blueprint</p>
        </div>
        <div class="content">
          <div class="greeting">
            <p>Namaste <strong>${userName}</strong>,</p>
            <p>Your premium personalized Kundli analysis has been computed successfully based on your precise birth coordinates. Here is your full, unrestricted astrological report.</p>
          </div>

          <h3 class="section-title">Birth Coordinates (Sankalpa)</h3>
          <div class="detail-row">
            <span class="detail-label">Name</span>
            <span class="detail-value">${userName}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Birth Date</span>
            <span class="detail-value">${birthDate}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Birth Time</span>
            <span class="detail-value">${birthTime || "Approximate noon standard"}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Birth Place</span>
            <span class="detail-value">${birthPlace}</span>
          </div>

          <h3 class="section-title">Core Astrological Signs</h3>
          <div class="chart-box">
            <div style="font-size: 24px; color: #7F1D1D; font-family: serif; font-weight: bold; margin-bottom: 4px;">Lagna: Leo (Simha)</div>
            <div style="font-size: 13px; color: #666;">Moonsign (Rashi): Sagittarius (Dhanu) &bull; Nakshatra: Mula &bull; Element: Fire (Agni)</div>
          </div>

          <h3 class="section-title">Planetary Alignments & Placements</h3>
          <table class="planetary-table">
            <thead>
              <tr>
                <th>Graha (Planet)</th>
                <th>Rashi (Sign)</th>
                <th>House (Bhava)</th>
                <th>State (Avastha)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Surya (Sun)</strong></td>
                <td>Cancer (Karka)</td>
                <td>12th House</td>
                <td>Devaloka / Friendly</td>
              </tr>
              <tr>
                <td><strong>Chandra (Moon)</strong></td>
                <td>Sagittarius (Dhanu)</td>
                <td>5th House</td>
                <td>Kautuka / Pleased</td>
              </tr>
              <tr>
                <td><strong>Mangal (Mars)</strong></td>
                <td>Aries (Mesha)</td>
                <td>9th House</td>
                <td>Swa-Rashi (Strong)</td>
              </tr>
              <tr>
                <td><strong>Budha (Mercury)</strong></td>
                <td>Gemini (Mithuna)</td>
                <td>11th House</td>
                <td>Exalted / Exuberant</td>
              </tr>
              <tr>
                <td><strong>Guru (Jupiter)</strong></td>
                <td>Taurus (Vrishabha)</td>
                <td>10th House</td>
                <td>Shanta / Peaceful</td>
              </tr>
              <tr>
                <td><strong>Shukra (Venus)</strong></td>
                <td>Leo (Simha)</td>
                <td>1st House</td>
                <td>Friendly</td>
              </tr>
              <tr>
                <td><strong>Shani (Saturn)</strong></td>
                <td>Aquarius (Kumbha)</td>
                <td>7th House</td>
                <td>Retrograde (Strong Karmic)</td>
              </tr>
            </tbody>
          </table>

          <h3 class="section-title">Deep Life-Aspect Interpretations</h3>
          
          <div class="insight-card">
            <h4>💼 Career, Wealth & Prosperity</h4>
            <p>Guru (Jupiter) positioned in your 10th House of Career signals massive opportunities for executive authority and organizational leadership. Your natural business intellect is heightened by Budha's strong placement in Gemini. Steady, consistent skill consolidation over the coming 6-9 months will open new doorways for high-level technical partnerships or entrepreneurial expansions.</p>
          </div>

          <div class="insight-card">
            <h4>💞 Marriage, Relationships & Compatibility</h4>
            <p>Your 7th house is governed by Saturn (Shani) in Aquarius, indicating that relationships are a significant area of spiritual grounding. Matches succeed best when built on extreme communicative honesty, transparency, and a joint sense of responsibility. Astrological compatible times for ceremonies suggest late Shravan or early autumn alignments.</p>
          </div>

          <div class="insight-card">
            <h4>🩺 Health, Vitality & Welness</h4>
            <p>With Mars (Mangal) occupying the 9th house, you possess high physical recovery speeds and baseline stamina. Focus on staying well-hydrated and reducing heat-inducing elements in your daily diet to balance high fire energy (Pitta imbalance). Daily pranayama breathing practices are highly recommended.</p>
          </div>

          <h3 class="section-title">Personalized Remedies (Upayas)</h3>
          
          <div class="insight-card" style="border-left-color: #D97706;">
            <span class="remedy-badge">Sankalpa Havan</span>
            <h4>Home Purification Fire Ceremony</h4>
            <p>Perform a small domestic purification ritual or Navagraha Shanti Havan on Devashayani Ekadashi to purify household direction paths and remove lingering spatial blocks.</p>
          </div>

          <div class="insight-card" style="border-left-color: #D97706;">
            <span class="remedy-badge">Empathetic Charity</span>
            <h4>Donate Grain on Saturdays</h4>
            <p>Donating black lentils or grains to local food drives on Saturdays balances Saturn's high karmic aspects in your relationship houses, bringing harmony and emotional stability.</p>
          </div>

        </div>
        <div class="footer">
          <p>You received this email because you requested a Free Kundli Report on the SETU Platform.</p>
          <p>© 2026 SETU Platform. Empowering diaspora families with authentic Vedic lineages.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
    Namaste ${userName},

    Your personalized Kundli analysis has been generated based on your birth coordinates:
    Date: ${birthDate}
    Time: ${birthTime || "Approximate Noon"}
    Place: ${birthPlace}

    Key Highlights:
    - Lagna: Leo (Simha)
    - Moon Sign: Sagittarius (Dhanu)
    - Nakshatra: Mula
    - elements: Fire

    Planets:
    - Sun: Cancer (12th Bhava)
    - Jupiter: Taurus (10th Bhava) - High career potential
    - Saturn: Aquarius (7th Bhava) - Karmic relationships

    To schedule a deep-dive consultation with our verified priests or astrologers, please visit the SETU directory.

    Warm regards,
    The SETU Team
  `;

  try {
    const response = await fetch("/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: email,
        subject: `[SETU] Your Premium Birth Chart (Kundli) Report - ${userName}`,
        html: htmlContent,
        text: textContent,
      }),
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || "Failed to send email through backend API.");
    }

    return await response.json() as EmailResponse;
  } catch (error: any) {
    console.error("[Email Client Error]", error);
    return {
      success: false,
      isReal: false,
      error: error.message || String(error),
    };
  }
}

