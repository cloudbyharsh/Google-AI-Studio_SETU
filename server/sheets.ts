import { google } from "googleapis";

let activeSpreadsheetId: string | null = process.env.GOOGLE_SPREADSHEET_ID || null;

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

export async function appendBookingToSheet(bookingData: any) {
  try {
    const sheets = await getSheetsService();
    const { spreadsheetId, sheetUrl } = await getOrCreateSpreadsheet();

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

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Bookings!A1",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [row],
      },
    });

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

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Kundli Leads!A1",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [row],
      },
    });

    return { success: true, spreadsheetId, sheetUrl };
  } catch (err: any) {
    console.error("[GOOGLE SHEETS KUNDLI LEAD ERROR]", err);
    return { success: false, error: err.message || "Failed to save Kundli lead to Google Sheets" };
  }
}

export function setCustomSpreadsheetId(id: string) {
  activeSpreadsheetId = id;
}
