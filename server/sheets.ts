import { google } from "googleapis";

let activeSpreadsheetId: string | null = process.env.GOOGLE_SPREADSHEET_ID || "1AtLHxh7BtJJ5pR_mWRguRUxikDlK7gpwmbRA_zWZx1g";

async function getSheetsService() {
  const auth = new google.auth.GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const client = await auth.getClient();
  return google.sheets({ version: "v4", auth: client as any });
}

export async function getOrCreateSpreadsheet(): Promise<{ spreadsheetId: string; sheetUrl: string }> {
  const sheets = await getSheetsService();

  if (activeSpreadsheetId) {
    return {
      spreadsheetId: activeSpreadsheetId,
      sheetUrl: `https://docs.google.com/spreadsheets/d/${activeSpreadsheetId}`,
    };
  }

  // Create new Google Spreadsheet
  const res = await sheets.spreadsheets.create({
    requestBody: {
      properties: {
        title: "SETU Platform - Bookings & Kundli Leads",
      },
      sheets: [
        {
          properties: {
            title: "Bookings",
          },
        },
        {
          properties: {
            title: "Kundli Leads",
          },
        },
      ],
    },
  });

  const spreadsheetId = res.data.spreadsheetId;
  if (!spreadsheetId) {
    throw new Error("Failed to obtain spreadsheet ID from Google Sheets API");
  }

  activeSpreadsheetId = spreadsheetId;

  // Initialize Header row for Bookings
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: "Bookings!A1",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [
        [
          "Timestamp",
          "Booking ID",
          "Customer Name",
          "Email",
          "Phone",
          "Service",
          "Practitioner",
          "Date & Time",
          "Location / Address",
          "Total Price",
          "Status",
          "Notes / Family Details"
        ],
      ],
    },
  });

  // Initialize Header row for Kundli Leads
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: "Kundli Leads!A1",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [
        [
          "Timestamp",
          "Kundli ID",
          "Customer Name",
          "Email",
          "Phone",
          "Birth Date",
          "Birth Time",
          "Birth Place"
        ],
      ],
    },
  });

  return {
    spreadsheetId,
    sheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
  };
}

async function ensureSheetTabExists(sheets: any, spreadsheetId: string, tabName: string, headers: string[]) {
  try {
    const meta = await sheets.spreadsheets.get({ spreadsheetId });
    const sheetTabs = meta.data.sheets || [];
    const exists = sheetTabs.some((s: any) => s.properties?.title === tabName);

    if (!exists) {
      // Add tab
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: tabName,
                },
              },
            },
          ],
        },
      });

      // Add headers
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${tabName}!A1`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [headers],
        },
      });
    }
  } catch (err) {
    console.warn(`[SHEETS TAB NOTICE] Could not verify/create tab '${tabName}':`, err);
  }
}

export async function appendBookingToSheet(bookingData: any) {
  try {
    const sheets = await getSheetsService();
    const { spreadsheetId, sheetUrl } = await getOrCreateSpreadsheet();

    const headers = [
      "Timestamp",
      "Booking ID",
      "Customer Name",
      "Email",
      "Phone",
      "Service",
      "Practitioner",
      "Date & Time",
      "Location / Address",
      "Total Price",
      "Status",
      "Notes / Family Details"
    ];

    await ensureSheetTabExists(sheets, spreadsheetId, "Bookings", headers);

    const row = [
      new Date().toLocaleString("en-US", { timeZone: "America/New_York" }),
      bookingData.id || `BK-${Date.now()}`,
      bookingData.fullName || bookingData.name || "",
      bookingData.email || "",
      bookingData.phone || "",
      bookingData.serviceName || bookingData.service || "",
      bookingData.practitionerName || bookingData.practitioner || "",
      bookingData.dateTime || `${bookingData.date || ""} ${bookingData.time || ""}`.trim(),
      bookingData.address ? `${bookingData.address}, ${bookingData.city || ""} ${bookingData.zipCode || ""}` : (bookingData.location || "Online Virtual Consultation"),
      bookingData.totalPrice ? `$${bookingData.totalPrice}` : "",
      bookingData.status || "Confirmed",
      bookingData.specialInstructions || bookingData.notes || ""
    ];

    try {
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: "Bookings!A1",
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [row],
        },
      });
    } catch (primaryErr) {
      // Fallback to range A1 if specific tab range fails
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: "A1",
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [row],
        },
      });
    }

    return { success: true, spreadsheetId, sheetUrl };
  } catch (err: any) {
    console.error("[GOOGLE SHEETS BOOKING ERROR]", err);
    return { success: false, error: err.message || "Failed to save to Google Sheets" };
  }
}

export async function appendKundliLeadToSheet(leadData: any) {
  try {
    const sheets = await getSheetsService();
    const { spreadsheetId, sheetUrl } = await getOrCreateSpreadsheet();

    const headers = [
      "Timestamp",
      "Kundli ID",
      "Customer Name",
      "Email",
      "Phone",
      "Birth Date",
      "Birth Time",
      "Birth Place"
    ];

    await ensureSheetTabExists(sheets, spreadsheetId, "Kundli Leads", headers);

    const row = [
      new Date().toLocaleString("en-US", { timeZone: "America/New_York" }),
      leadData.id || leadData.kundliId || `KL-${Date.now()}`,
      leadData.name || "",
      leadData.email || "",
      leadData.phone || "",
      leadData.birthDate || leadData.birthDetails?.birthDate || "",
      leadData.birthTime || leadData.birthDetails?.birthTime || "",
      leadData.birthPlace || leadData.birthDetails?.birthPlace || ""
    ];

    try {
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: "Kundli Leads!A1",
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [row],
        },
      });
    } catch (primaryErr) {
      // Fallback to range A1 if specific tab range fails
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: "A1",
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [row],
        },
      });
    }

    return { success: true, spreadsheetId, sheetUrl };
  } catch (err: any) {
    console.error("[GOOGLE SHEETS KUNDLI LEAD ERROR]", err);
    return { success: false, error: err.message || "Failed to save Kundli lead to Google Sheets" };
  }
}

export async function appendContactInquiryToSheet(contactData: any) {
  try {
    const sheets = await getSheetsService();
    const { spreadsheetId, sheetUrl } = await getOrCreateSpreadsheet();

    const headers = [
      "Timestamp",
      "Inquiry ID",
      "Customer Name",
      "Email",
      "Phone",
      "Subject",
      "Message"
    ];

    await ensureSheetTabExists(sheets, spreadsheetId, "Contact Inquiries", headers);

    const row = [
      new Date().toLocaleString("en-US", { timeZone: "America/New_York" }),
      contactData.id || `INQ-${Date.now()}`,
      contactData.name || "",
      contactData.email || "",
      contactData.phone || "",
      contactData.subject || "",
      contactData.message || ""
    ];

    try {
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: "Contact Inquiries!A1",
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [row],
        },
      });
    } catch (primaryErr) {
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: "A1",
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [row],
        },
      });
    }

    return { success: true, spreadsheetId, sheetUrl };
  } catch (err: any) {
    console.error("[GOOGLE SHEETS CONTACT INQUIRY ERROR]", err);
    return { success: false, error: err.message || "Failed to save contact inquiry to Google Sheets" };
  }
}

export function setCustomSpreadsheetId(id: string) {
  activeSpreadsheetId = id;
}
