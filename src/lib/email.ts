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
