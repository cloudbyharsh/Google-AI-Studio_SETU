import React, { useState, useEffect } from "react";
import { Table, ExternalLink, RefreshCw, CheckCircle2, AlertCircle, FileSpreadsheet, Key } from "lucide-react";

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GoogleSheetsModal({ isOpen, onClose }: GoogleSheetsModalProps) {
  const [sheetUrl, setSheetUrl] = useState<string | null>(null);
  const [spreadsheetId, setSpreadsheetId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [customIdInput, setCustomIdInput] = useState<string>("");
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const fetchSheetInfo = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/sheets/info");
      const data = await res.json();
      if (data.success && data.sheetUrl) {
        setSheetUrl(data.sheetUrl);
        setSpreadsheetId(data.spreadsheetId || "");
      } else {
        setError(data.error || "Google Sheets API is connecting. If this is the first time, you may need to enable Google Sheets API in Google Cloud Console.");
      }
    } catch (err: any) {
      setError("Failed to connect to backend server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSheetInfo();
    }
  }, [isOpen]);

  const handleSetCustomSheet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customIdInput.trim()) return;

    // Extract ID if full URL pasted
    let idToSet = customIdInput.trim();
    if (idToSet.includes("spreadsheets/d/")) {
      const match = idToSet.match(/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (match && match[1]) {
        idToSet = match[1];
      }
    }

    setLoading(true);
    try {
      const res = await fetch("/api/sheets/set-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spreadsheetId: idToSet })
      });
      const data = await res.json();
      if (data.success) {
        setSpreadsheetId(idToSet);
        setSheetUrl(`https://docs.google.com/spreadsheets/d/${idToSet}`);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      } else {
        setError(data.error || "Failed to set custom spreadsheet ID");
      }
    } catch (err) {
      setError("Network error updating sheet ID");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-maroon/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-ivory border border-sandalwood/20 rounded-2xl shadow-2xl max-w-lg w-full p-6 relative text-sandalwood">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-sandalwood/50 hover:text-maroon transition-colors p-1"
          aria-label="Close"
        >
          ✕
        </button>

        <div className="flex items-center gap-3 mb-4 border-b border-sandalwood/10 pb-4">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-brand text-xl font-bold text-maroon">Google Sheets Integration</h3>
            <p className="text-xs text-sandalwood/70">Form submissions, bookings & Kundli leads live sync</p>
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-maroon animate-spin mx-auto" />
            <p className="text-xs font-sans text-sandalwood/70">Connecting to Google Sheets API...</p>
          </div>
        ) : sheetUrl ? (
          <div className="space-y-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Connected Google Sheet</span>
              </div>
              <p className="text-xs text-emerald-900 leading-relaxed">
                All customer booking forms and free Kundli lead entries are saved directly into your connected Google Sheet in real time with two tabs: <strong>Bookings</strong> and <strong>Kundli Leads</strong>.
              </p>
              <a
                href={sheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
              >
                <span>Open Google Sheet</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="text-[11px] text-sandalwood/60 break-all bg-warm-ivory p-3 rounded-lg border border-sandalwood/10 font-mono">
              Spreadsheet ID: {spreadsheetId}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {error && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2 text-xs text-amber-900">
                <div className="flex items-center gap-2 font-bold text-amber-800">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Google Sheets API Authorization</span>
                </div>
                <p className="leading-relaxed">{error}</p>
              </div>
            )}

            <div className="bg-warm-ivory border border-sandalwood/15 rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-maroon uppercase tracking-wider flex items-center gap-1.5">
                <Key className="w-4 h-4 text-gold" />
                Link an Existing Google Sheet
              </h4>
              <p className="text-xs text-sandalwood/70">
                You can paste the URL or ID of any Google Sheet you own below to store all form responses there:
              </p>
              <form onSubmit={handleSetCustomSheet} className="space-y-2">
                <input
                  type="text"
                  placeholder="Paste Google Sheet URL or ID..."
                  value={customIdInput}
                  onChange={(e) => setCustomIdInput(e.target.value)}
                  className="w-full px-3 py-2 bg-ivory border border-sandalwood/20 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-maroon"
                />
                <button
                  type="submit"
                  disabled={!customIdInput.trim()}
                  className="w-full py-2 bg-maroon text-gold font-bold rounded-lg text-xs hover:bg-maroon/90 transition-all disabled:opacity-50 cursor-pointer"
                >
                  Save Sheet ID
                </button>
              </form>
              {savedSuccess && (
                <div className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Successfully connected custom sheet!
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-6 border-t border-sandalwood/10 pt-4 flex justify-between items-center text-xs text-sandalwood/60">
          <button
            onClick={fetchSheetInfo}
            className="flex items-center gap-1 hover:text-maroon transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh status
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-sandalwood/10 hover:bg-sandalwood/20 rounded-lg text-sandalwood font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
