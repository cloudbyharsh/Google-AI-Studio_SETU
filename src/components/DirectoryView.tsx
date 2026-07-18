import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Compass, Star, ArrowRight, ShieldCheck, Sparkles, X, Info, Search, HelpCircle, MapPin, Languages, CheckCircle2 } from "lucide-react";
import { Practitioner, Service } from "../types";
import { PRACTITIONERS } from "../data";
import RotatingMandala from "./RotatingMandala";
import { analytics } from "../lib/analytics";

interface DirectoryViewProps {
  onSelectPractitioner: (practitioner: Practitioner, service?: Service | null) => void;
  onOpenKundliModal: () => void;
}

// Simple elegant console event tracker for the prototype, updated to call centralized analytics
const logEvent = (eventName: string, payload?: any) => {
  console.log(
    `%c[SETU Analytics Event] %c${eventName}`,
    "color: #1B6B5A; font-weight: bold;",
    "color: #C4922A; font-weight: bold; font-style: italic;",
    payload || ""
  );
  analytics.track(eventName, payload || {});
};

export interface MuhuratDate {
  dateStr: string;
  label: string;
  type: string;
  description: string;
  recommendedPractitionerIds: string[];
  yogas: string[];
}

export const MUHURATS: MuhuratDate[] = [
  {
    dateStr: "2026-07-20",
    label: "Devashayani Ekadashi",
    type: "Griha Pravesh & Puja",
    description: "Highly auspicious for Griha Pravesh (House Warming) and Satyanarayan Puja. Commences the holy period of Chaturmas.",
    recommendedPractitionerIds: ["rajesh-shastri", "venkatesh-raghavan", "meenakshi-iyer"],
    yogas: ["Siddha Yoga", "Ravi Yoga"]
  },
  {
    dateStr: "2026-07-24",
    label: "Shravan Somvar & Pradosh",
    type: "Shiva Puja",
    description: "Extremely powerful day for Lord Shiva Pujas, Rudrabhishek, and purification fire ceremonies (Havans).",
    recommendedPractitionerIds: ["anand-pathak", "meenakshi-iyer"],
    yogas: ["Shiva Yoga", "Pradosh Vrat"]
  },
  {
    dateStr: "2026-07-28",
    label: "Amrit Siddhi Yoga Day",
    type: "Wedding & Upanayanam",
    description: "A rare nectar-alignment day, ideal for long-term unions, Vedic Vivaha (Weddings), and Upanayanam rites of passage.",
    recommendedPractitionerIds: ["venkatesh-raghavan", "rajesh-shastri"],
    yogas: ["Amrit Siddhi", "Sarvartha Siddhi"]
  },
  {
    dateStr: "2026-08-03",
    label: "Shravan Somvar & Havan",
    type: "Shiva Puja",
    description: "Auspicious Monday for performing purifying fire rituals (Havans) and seeking health and protection blessings.",
    recommendedPractitionerIds: ["anand-pathak", "rajesh-shastri"],
    yogas: ["Preeti Yoga", "Shravan Nakshatra"]
  },
  {
    dateStr: "2026-08-08",
    label: "Ganesh Chaturthi",
    type: "Ganesh Chaturthi",
    description: "Highly auspicious for beginning any new venture, buying property, starting consultations, or house warmings.",
    recommendedPractitionerIds: ["rajesh-shastri", "venkatesh-raghavan", "meenakshi-iyer", "anand-pathak"],
    yogas: ["Siddha Yoga", "Amrit Yoga"]
  },
  {
    dateStr: "2026-08-15",
    label: "Astrological & Vastu Muhurat",
    type: "Astrology & Vastu",
    description: "Aligned for astrological consultations, birth chart reading, and Vastu direction alignments.",
    recommendedPractitionerIds: ["meenakshi-iyer", "rajesh-shastri"],
    yogas: ["Ravi Yoga", "Gaja Kesari Yoga"]
  },
  {
    dateStr: "2026-08-22",
    label: "Bhadra & Vastu Siddhi",
    type: "Astrology & Vastu",
    description: "Favorable for home direction corrections, establishing house mandalas, and initiating astrological remedies.",
    recommendedPractitionerIds: ["rajesh-shastri", "anand-pathak"],
    yogas: ["Bhadra Yoga", "Vastu Shanti"]
  }
];

export default function DirectoryView({
  onSelectPractitioner,
  onOpenKundliModal,
}: DirectoryViewProps) {
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIntent, setSelectedIntent] = useState<string | null>(null);
  const [activeDirectoryTab, setActiveDirectoryTab] = useState<"rituals" | "practitioners">("rituals");
  const [selectedRitual, setSelectedRitual] = useState<any | null>(null);
  const [showTip, setShowTip] = useState(() => {
    const dismissed = localStorage.getItem("setu_tip_dismissed_v2");
    return dismissed !== "true";
  });
  const [showMuhuratCalendar, setShowMuhuratCalendar] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState<"july" | "august">("july");
  const [selectedMuhuratDate, setSelectedMuhuratDate] = useState<string | null>(null);

  // Track initial screen visit
  useEffect(() => {
    logEvent("landing_viewed", {
      referrer: document.referrer || "direct",
      page_url: window.location.href,
      user_agent: navigator.userAgent
    });
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Track provider cards and recommendations list viewed
  useEffect(() => {
    if (!loading) {
      PRACTITIONERS.forEach((p) => {
        logEvent("provider_card_viewed", { providerId: p.id, name: p.name });
      });

      const listCount = activeDirectoryTab === "rituals" ? filteredRitualsWithMuhurat.length : filteredPractitionersWithMuhurat.length;
      logEvent("practitioner_recommendations_viewed", {
        matched_count: listCount,
        list_source: activeDirectoryTab,
        filters: {
          searchQuery,
          selectedIntent,
          selectedMuhuratDate
        }
      });
    }
  }, [loading, searchQuery, selectedIntent, activeDirectoryTab, selectedMuhuratDate]);

  const handleDismissTip = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowTip(false);
    localStorage.setItem("setu_tip_dismissed_v2", "true");
  };

  const handleIntentSelect = (intent: string) => {
    setSelectedIntent(selectedIntent === intent ? null : intent);
    logEvent("intent_selected", { intent });
  };

  const handleFindPractitionerClick = () => {
    logEvent("hero_find_practitioner_clicked");
    document.getElementById("directory-section")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleKundliClick = () => {
    logEvent("hero_kundli_clicked");
    logEvent("kundli_modal_opened");
    onOpenKundliModal();
  };

  const handleProviderClick = (practitioner: Practitioner, service?: Service | null) => {
    logEvent("provider_profile_opened", { providerId: practitioner.id, name: practitioner.name, serviceId: service?.id });
    logEvent("practitioner_profile_viewed", {
      practitioner_id: practitioner.id,
      practitioner_name: practitioner.name,
      tradition: practitioner.tradition,
      service_count: practitioner.services.length
    });
    onSelectPractitioner(practitioner, service || null);
  };

  // Helper descriptions for traditions (Section 5)
  const traditionExplanations: Record<string, string> = {
    "North Indian Vedic Tradition": "Traditional Sanskrit rituals styled for Hindi, Punjabi, and North Indian family customs.",
    "South Indian Smartha/Iyer Tradition": "Strict Agama Shastra procedures with Tamil, Telugu, and Kannada Vedic chanting accents.",
    "Vedic Astrology (Jyotish)": "Practical, life-affirming cosmic charts focused on supportive lifestyle remedies over doom predictions.",
    "Shaivite Ritual Tradition": "Specialized Shiva temple-grade purification homas and powerful, precise chants."
  };

  // Extract all rituals from practitioners
  interface RitualItem {
    id: string;
    name: string;
    devanagariName?: string;
    price: number;
    duration: string;
    category: "Puja" | "Astrology" | "Vastu" | "Meditation" | "Havan";
    categoryEmoji: string;
    description: string;
    whatsIncluded: string[];
    preparation?: string[];
    practitioner: Practitioner;
  }

  const allRituals: RitualItem[] = [];
  PRACTITIONERS.forEach((practitioner) => {
    practitioner.services.forEach((service) => {
      allRituals.push({
        ...service,
        practitioner,
      });
    });
  });

  // Filter rituals based on search query and selected intent
  const filteredRituals = allRituals.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.practitioner.name.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (!selectedIntent) return true;
    if (selectedIntent === "puja") {
      return r.category === "Puja" || r.category === "Havan";
    }
    if (selectedIntent === "astrology") {
      return r.category === "Astrology";
    }
    if (selectedIntent === "vastu") {
      return r.category === "Vastu" || r.name.toLowerCase().includes("vastu");
    }
    return true; // "not-sure"
  });

  // Apply Muhurat date filter if selected
  const filteredRitualsWithMuhurat = selectedMuhuratDate
    ? filteredRituals.filter((r) => {
        const activeMuhurat = MUHURATS.find((m) => m.dateStr === selectedMuhuratDate);
        return activeMuhurat ? activeMuhurat.recommendedPractitionerIds.includes(r.practitioner.id) : true;
      })
    : filteredRituals;

  // Filter practitioners based on selected intent and search query
  const filteredPractitioners = PRACTITIONERS.filter((p) => {
    // Search query matching
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tradition.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.specializations.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    // Intent filtering
    if (!selectedIntent) return true;
    if (selectedIntent === "puja") {
      return p.services.some((s) => s.category === "Puja" || s.category === "Havan");
    }
    if (selectedIntent === "astrology") {
      return p.services.some((s) => s.category === "Astrology");
    }
    if (selectedIntent === "vastu") {
      return p.specializations.some((s) => s.toLowerCase().includes("vastu"));
    }
    return true; // "not-sure" shows all, with guidance
  });

  // Apply Muhurat date filter to practitioners if selected
  const filteredPractitionersWithMuhurat = selectedMuhuratDate
    ? filteredPractitioners.filter((p) => {
        const activeMuhurat = MUHURATS.find((m) => m.dateStr === selectedMuhuratDate);
        return activeMuhurat ? activeMuhurat.recommendedPractitionerIds.includes(p.id) : true;
      })
    : filteredPractitioners;

  const uniqueFilteredTraditions = Array.from(
    new Set(filteredPractitionersWithMuhurat.map((p) => p.tradition))
  );

  return (
    <div className="px-4 sm:px-6 py-8 max-w-2xl mx-auto space-y-12 relative">
      {/* Subtle branding watermarked background mandala */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] pointer-events-none z-0">
        <RotatingMandala size={650} color="#610000" secondaryColor="#C4922A" speed="slow" />
      </div>

      {/* Hero Section */}
      <section className="text-center relative z-10 space-y-6 pt-4">
        <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-gold block">
          Bringing Dignity and Clarity to Sacred Milestones
        </span>

        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="font-serif text-3xl sm:text-4.5xl font-bold text-sandalwood leading-tight tracking-tight"
        >
          Find a Trusted Spiritual Practitioner <br />
          <span className="italic font-brand font-light text-maroon">Who Understands Your Tradition</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.95 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="font-sans text-xs sm:text-sm text-sandalwood/80 max-w-lg mx-auto leading-relaxed"
        >
          SETU connects families with verified, high-caliber priests and astrologers. Every listed practitioner is personally reviewed by SETU to guarantee procedural integrity, bilinguality, and upfront, flat-rate pricing.
        </motion.p>

        {/* Hero Actions (Primary & Secondary swapped correctly) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-2"
        >
          <button
            onClick={handleFindPractitionerClick}
            className="w-full sm:w-auto px-8 py-4 bg-maroon hover:bg-sandalwood text-ivory font-sans font-bold text-xs tracking-widest uppercase rounded-lg shadow-card-default hover:shadow-card-hover hover:scale-[1.01] transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-gold"
          >
            Find a Practitioner
          </button>
          
          <button
            onClick={handleKundliClick}
            className="w-full sm:w-auto px-8 py-4 bg-warm-ivory border border-sandalwood/20 hover:border-gold hover:text-maroon text-sandalwood font-sans font-bold text-xs tracking-widest uppercase rounded-lg shadow-card-default hover:shadow-card-hover transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-maroon flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-gold" />
            Explore Your Kundli
          </button>
        </motion.div>
      </section>

      {/* Dismissible Member Notice (Section 1) */}
      {showTip && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          className="p-5 bg-warm-ivory border border-sandalwood/10 rounded-2xl shadow-card-default flex gap-4 relative overflow-hidden z-10"
        >
          <div className="absolute top-0 left-0 w-[4px] h-full bg-gold" />
          <Info className="w-5 h-5 text-maroon shrink-0 mt-0.5" />
          <div className="pr-6">
            <p className="text-xs text-sandalwood font-medium leading-relaxed">
              <span className="font-bold text-gold uppercase tracking-wider text-[10px] block mb-1">MEMBER NOTICE</span>
              All bookings are initial requests. No payment is processed inside this app or before the practitioner explicitly reviews and confirms your date.
            </p>
          </div>
          <button
            onClick={handleDismissTip}
            className="absolute top-3 right-3 text-sandalwood/50 hover:text-sandalwood p-1 transition-colors cursor-pointer min-w-[24px] min-h-[24px] flex items-center justify-center"
            aria-label="Dismiss notice"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* The Journey of Sacred Introductions - 3-step vertical/horizontal timeline replacing transactional e-commerce feel */}
      <section className="bg-warm-ivory border border-sandalwood/10 rounded-2xl p-6 space-y-6 relative z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-maroon" />
        <div className="space-y-1 text-center sm:text-left pl-3">
          <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-gold block">Auspicious Coordination Process</span>
          <h3 className="font-serif text-lg font-bold text-sandalwood">
            The Journey of Sacred Introduction
          </h3>
          <p className="text-[11px] text-sandalwood/60 leading-relaxed font-sans max-w-md">
            To preserve procedural sanctity and lineage compatibility, SETU never processes automatic transactions. Every request is managed as a respectful family introduction.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 pl-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-maroon/10 border border-maroon/20 text-maroon font-serif text-xs font-bold flex items-center justify-center shrink-0">1</span>
              <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-sandalwood">Express Family Intent</h4>
            </div>
            <p className="text-[11px] text-sandalwood/70 leading-relaxed font-sans">
              Choose your practitioner and ceremony. Share your family lineage (Gotra, ancestral roots, preferred dialects) and preferred dates. No payment card or deposit is required today.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gold/10 border border-gold/20 text-gold font-serif text-xs font-bold flex items-center justify-center shrink-0">2</span>
              <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-sandalwood">Lineage Review</h4>
            </div>
            <p className="text-[11px] text-sandalwood/70 leading-relaxed font-sans">
              Your requested Shastri Ji or Astrologer personally reviews your family coordinates within 24 hours to confirm strict tradition compatibility and auspicious calendar timings.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-teal/10 border border-teal/20 text-teal font-serif text-xs font-bold flex items-center justify-center shrink-0">3</span>
              <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-sandalwood">Direct Coordination</h4>
            </div>
            <p className="text-[11px] text-sandalwood/70 leading-relaxed font-sans">
              Connect directly via phone or Zoom to coordinate holy materials (Samagri) and custom family requirements. Voluntary Dakshina is settled only after Shastri Ji confirms alignment.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Intent Guidance Section (Section 5) */}
      <section className="bg-warm-ivory border border-sandalwood/10 rounded-2xl p-6 space-y-4 relative z-10">
        <h3 className="font-serif text-lg font-bold text-sandalwood text-center sm:text-left">
          What milestone are you preparing for?
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => handleIntentSelect("puja")}
            className={`p-4 text-left border rounded-xl transition-all duration-300 flex items-start gap-3 min-h-[64px] cursor-pointer focus:outline-none focus:ring-2 focus:ring-maroon ${
              selectedIntent === "puja"
                ? "bg-maroon/5 border-maroon text-maroon"
                : "border-sandalwood/10 hover:border-gold/50 text-sandalwood"
            }`}
          >
            <span className="text-xl">🪔</span>
            <div>
              <span className="font-sans font-bold text-xs uppercase tracking-wider block">Ceremony or Sacred Havan</span>
              <span className="text-[10px] text-sandalwood/70 block mt-0.5">Housewarmings, weddings, purification ceremonies</span>
            </div>
          </button>

          <button
            onClick={() => handleIntentSelect("astrology")}
            className={`p-4 text-left border rounded-xl transition-all duration-300 flex items-start gap-3 min-h-[64px] cursor-pointer focus:outline-none focus:ring-2 focus:ring-maroon ${
              selectedIntent === "astrology"
                ? "bg-maroon/5 border-maroon text-maroon"
                : "border-sandalwood/10 hover:border-gold/50 text-sandalwood"
            }`}
          >
            <span className="text-xl">🌙</span>
            <div>
              <span className="font-sans font-bold text-xs uppercase tracking-wider block">Astrological Guidance</span>
              <span className="text-[10px] text-sandalwood/70 block mt-0.5">Birth chart (Kundli) readings, relationship matching</span>
            </div>
          </button>

          <button
            onClick={() => handleIntentSelect("vastu")}
            className={`p-4 text-left border rounded-xl transition-all duration-300 flex items-start gap-3 min-h-[64px] cursor-pointer focus:outline-none focus:ring-2 focus:ring-maroon ${
              selectedIntent === "vastu"
                ? "bg-maroon/5 border-maroon text-maroon"
                : "border-sandalwood/10 hover:border-gold/50 text-sandalwood"
            }`}
          >
            <span className="text-xl">🧭</span>
            <div>
              <span className="font-sans font-bold text-xs uppercase tracking-wider block">Vastu Direction Consult</span>
              <span className="text-[10px] text-sandalwood/70 block mt-0.5">Harmonizing high-vibe coordinates in home or office</span>
            </div>
          </button>

          <button
            onClick={() => handleIntentSelect("not-sure")}
            className={`p-4 text-left border rounded-xl transition-all duration-300 flex items-start gap-3 min-h-[64px] cursor-pointer focus:outline-none focus:ring-2 focus:ring-maroon ${
              selectedIntent === "not-sure"
                ? "bg-maroon/5 border-maroon text-maroon"
                : "border-sandalwood/10 hover:border-gold/50 text-sandalwood"
            }`}
          >
            <span className="text-xl">🌸</span>
            <div>
              <span className="font-sans font-bold text-xs uppercase tracking-wider block">I am not sure of the ritual</span>
              <span className="text-[10px] text-sandalwood/70 block mt-0.5">Explore lineages and find verified alignment</span>
            </div>
          </button>
        </div>

        {/* "I'm not sure" Supportive Info Card */}
        <AnimatePresence>
          {selectedIntent === "not-sure" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 bg-gold/5 border border-gold/20 rounded-xl text-left"
            >
              <h4 className="text-xs font-sans font-bold text-sandalwood uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-gold" />
                Unsure of the specific ceremony or family lineage requirements?
              </h4>
              <p className="text-xs text-sandalwood/80 font-sans leading-relaxed mt-1">
                You are not alone. Second-generation diaspora families often consult <strong>Smt. Meenakshi Iyer</strong> for overall lifecycle guidance first. You can also contact us directly at <strong className="text-maroon">founders@setu.app</strong> with your cultural background (e.g. Gujarati, South Indian Smartha) and our founders will guide your path.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Tab Selector & Header */}
      <section id="directory-section" className="space-y-6 relative z-10 scroll-mt-24">
        {!selectedRitual && (
          <div className="flex flex-col gap-4 border-b border-sandalwood/10 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
              <div>
                <h2 className="font-sans font-black text-xs uppercase tracking-[0.25em] text-sandalwood">
                  Establish Sacred Connection
                </h2>
                <p className="text-[11px] text-sandalwood/60 font-sans mt-0.5">
                  Select your desired ceremony first to find certified priests and astrologers of that specific custom.
                </p>
              </div>
            </div>

            {/* Premium segmented tab controls */}
            <div className="grid grid-cols-2 p-1 bg-sandalwood/5 border border-sandalwood/10 rounded-xl max-w-md mx-auto sm:mx-0">
              <button
                onClick={() => {
                  setActiveDirectoryTab("rituals");
                  logEvent("tab_switched", { tab: "rituals" });
                }}
                className={`py-2 px-3 text-center rounded-lg font-sans font-bold text-xs tracking-wider transition-all cursor-pointer focus:outline-none ${
                  activeDirectoryTab === "rituals"
                    ? "bg-maroon text-ivory shadow-sm"
                    : "text-sandalwood/70 hover:text-sandalwood hover:bg-sandalwood/5"
                }`}
              >
                🌸 Select by Ritual
              </button>
              <button
                onClick={() => {
                  setActiveDirectoryTab("practitioners");
                  logEvent("tab_switched", { tab: "practitioners" });
                }}
                className={`py-2 px-3 text-center rounded-lg font-sans font-bold text-xs tracking-wider transition-all cursor-pointer focus:outline-none ${
                  activeDirectoryTab === "practitioners"
                    ? "bg-maroon text-ivory shadow-sm"
                    : "text-sandalwood/70 hover:text-sandalwood hover:bg-sandalwood/5"
                }`}
              >
                🧭 Select by Practitioner
              </button>
            </div>

            {/* Search Box */}
            <div className="relative mt-2">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-sandalwood/40" />
              <input
                type="text"
                placeholder={
                  activeDirectoryTab === "rituals"
                    ? "Search ceremonies (e.g. House Warming, Wedding, Kundli)..."
                    : "Search practitioner name, tradition, or custom..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-warm-ivory border border-sandalwood/10 focus:border-maroon rounded-xl font-sans text-xs focus:outline-none focus:ring-1 focus:ring-maroon text-sandalwood transition-all placeholder:text-sandalwood/40 min-h-[44px]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sandalwood/40 hover:text-sandalwood p-1"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Muhurat Calendar Toggle Button */}
            <div className="mt-2">
              <button
                onClick={() => {
                  setShowMuhuratCalendar(!showMuhuratCalendar);
                  logEvent("muhurat_calendar_toggled", { visible: !showMuhuratCalendar });
                }}
                className={`w-full py-3 px-4 rounded-xl border font-sans font-bold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-maroon ${
                  showMuhuratCalendar
                    ? "bg-maroon text-ivory border-maroon"
                    : "bg-gold/10 text-maroon border-gold/30 hover:bg-gold/20"
                }`}
              >
                <Sparkles className="w-4 h-4 text-gold shrink-0 animate-pulse" />
                <span>{showMuhuratCalendar ? "Hide Auspicious Muhurats" : "Filter by Auspicious Muhurats (Panchang)"}</span>
                {selectedMuhuratDate && (
                  <span className="ml-1 bg-gold text-maroon text-[9px] px-2 py-0.5 rounded-full font-sans font-black uppercase">
                    Active
                  </span>
                )}
              </button>
            </div>

            {/* Expandable Muhurat Calendar */}
            <AnimatePresence>
              {showMuhuratCalendar && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden bg-warm-ivory border border-sandalwood/15 rounded-2xl p-4 sm:p-5 mt-2 space-y-4 shadow-card-default"
                >
                  {/* Calendar Month Header */}
                  <div className="flex items-center justify-between border-b border-sandalwood/10 pb-3">
                    <button
                      onClick={() => {
                        setCalendarMonth("july");
                        logEvent("muhurat_month_changed", { month: "july" });
                      }}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-sans font-bold transition-all ${
                        calendarMonth === "july"
                          ? "bg-maroon/10 text-maroon font-black border border-maroon/20"
                          : "text-sandalwood/60 hover:text-sandalwood"
                      }`}
                    >
                      July 2026
                    </button>
                    <span className="text-[11px] font-serif font-black text-sandalwood uppercase tracking-wider text-center">
                      {calendarMonth === "july" ? "☀️ Ashadha - Shravan" : "🌙 Shravan - Bhadrapada"}
                    </span>
                    <button
                      onClick={() => {
                        setCalendarMonth("august");
                        logEvent("muhurat_month_changed", { month: "august" });
                      }}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-sans font-bold transition-all ${
                        calendarMonth === "august"
                          ? "bg-maroon/10 text-maroon font-black border border-maroon/20"
                          : "text-sandalwood/60 hover:text-sandalwood"
                      }`}
                    >
                      August 2026
                    </button>
                  </div>

                  {/* Calendar Days Grid */}
                  <div>
                    <div className="grid grid-cols-7 gap-1 text-center py-2">
                      {/* Weekday headers */}
                      {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                        <div key={day} className="text-[10px] font-sans font-black uppercase text-sandalwood/40 py-1">
                          {day}
                        </div>
                      ))}
                      
                      {/* Pre-offsets */}
                      {Array.from({ length: calendarMonth === "july" ? 3 : 6 }).map((_, idx) => (
                        <div key={`empty-${idx}`} className="p-2" />
                      ))}
                      
                      {/* Days */}
                      {(calendarMonth === "july" 
                        ? Array.from({ length: 31 }, (_, i) => {
                            const dayNum = i + 1;
                            const dateStr = `2026-07-${dayNum < 10 ? "0" + dayNum : dayNum}`;
                            const muhurat = MUHURATS.find(m => m.dateStr === dateStr);
                            return { dayNum, dateStr, muhurat };
                          })
                        : Array.from({ length: 31 }, (_, i) => {
                            const dayNum = i + 1;
                            const dateStr = `2026-08-${dayNum < 10 ? "0" + dayNum : dayNum}`;
                            const muhurat = MUHURATS.find(m => m.dateStr === dateStr);
                            return { dayNum, dateStr, muhurat };
                          })
                      ).map(({ dayNum, dateStr, muhurat }) => {
                        const isSelected = selectedMuhuratDate === dateStr;
                        const isMuhurat = !!muhurat;
                        
                        return (
                          <button
                            key={dateStr}
                            onClick={() => {
                              if (isMuhurat) {
                                if (isSelected) {
                                  setSelectedMuhuratDate(null);
                                  logEvent("muhurat_filter_cleared");
                                } else {
                                  setSelectedMuhuratDate(dateStr);
                                  logEvent("muhurat_filter_applied", { dateStr, label: muhurat.label });
                                }
                              }
                            }}
                            className={`relative py-2 text-xs rounded-lg transition-all flex flex-col items-center justify-center min-h-[38px] focus:outline-none focus:ring-1 focus:ring-gold ${
                              isMuhurat 
                                ? isSelected
                                  ? "bg-maroon text-ivory font-extrabold shadow-md scale-105 border border-gold ring-1 ring-gold/40 z-10 cursor-pointer"
                                  : "bg-gold/15 hover:bg-gold/25 text-maroon font-bold border border-gold/30 cursor-pointer shadow-sm"
                                : "text-sandalwood/40 hover:bg-sandalwood/5 cursor-default"
                            }`}
                            disabled={!isMuhurat}
                          >
                            <span className={isMuhurat ? "text-maroon font-black" : "text-sandalwood/70"}>{dayNum}</span>
                            {isMuhurat && (
                              <span className={`absolute bottom-1 w-1 h-1 rounded-full ${isSelected ? "bg-gold" : "bg-gold/60 animate-pulse"}`} />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Month's Muhurats List */}
                  <div className="space-y-2 pt-3 border-t border-sandalwood/10">
                    <span className="text-[9px] font-sans font-black uppercase tracking-wider text-sandalwood/50 block">
                      Auspicious Panchang Dates in {calendarMonth === "july" ? "July" : "August"}
                    </span>
                    <div className="grid grid-cols-1 gap-2">
                      {MUHURATS.filter(m => 
                        calendarMonth === "july" ? m.dateStr.startsWith("2026-07") : m.dateStr.startsWith("2026-08")
                      ).map((m) => {
                        const isSelected = selectedMuhuratDate === m.dateStr;
                        const formattedDate = new Date(m.dateStr + "T00:00:00").toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        });
                        return (
                          <button
                            key={m.dateStr}
                            onClick={() => {
                              if (isSelected) {
                                setSelectedMuhuratDate(null);
                                logEvent("muhurat_filter_cleared");
                              } else {
                                setSelectedMuhuratDate(m.dateStr);
                                logEvent("muhurat_filter_applied", { dateStr: m.dateStr, label: m.label });
                              }
                            }}
                            className={`p-3 text-left border rounded-xl transition-all flex items-start justify-between gap-3 min-h-[56px] cursor-pointer focus:outline-none focus:ring-1 focus:ring-maroon ${
                              isSelected
                                ? "bg-maroon/10 border-maroon text-maroon shadow-sm"
                                : "bg-ivory/50 border-sandalwood/10 hover:border-gold/50 text-sandalwood"
                            }`}
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-sans font-bold text-xs uppercase tracking-wider text-sandalwood">
                                  {m.label}
                                </span>
                                <span className="text-[9px] font-sans font-bold bg-gold/10 text-gold border border-gold/20 px-2 py-0.5 rounded-full">
                                  {m.yogas[0]}
                                </span>
                              </div>
                              <p className="text-[10px] text-sandalwood/70 leading-relaxed font-sans line-clamp-1">
                                {m.description}
                              </p>
                            </div>
                            <div className="shrink-0 text-right">
                              <span className="text-xs font-serif font-bold text-maroon bg-warm-ivory px-2.5 py-1 rounded-md border border-sandalwood/15 block shadow-sm">
                                {formattedDate}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4">
            <RotatingMandala size={80} color="#C4922A" secondaryColor="#610000" speed="medium" />
            <p className="text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-gold animate-pulse">
              Aligning with traditional lineages...
            </p>
          </div>
        ) : selectedRitual ? (
          /* STEP 2: Selected Ritual & Practitioner Matching Screen */
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Back button to return to ritual list */}
            <button
              onClick={() => setSelectedRitual(null)}
              className="group flex items-center gap-2 text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-sandalwood/80 hover:text-maroon focus:outline-none focus:ring-2 focus:ring-maroon cursor-pointer transition-colors min-h-[44px]"
            >
              <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Sacred Rituals</span>
            </button>

            {/* Detailed Ritual Description Card without pricing */}
            <div className="p-6 bg-warm-ivory border border-sandalwood/10 rounded-2xl shadow-card-default space-y-4">
              <div className="flex justify-between items-start flex-wrap gap-2">
                <div>
                  <span className="text-[9px] font-sans font-black uppercase tracking-wider text-gold bg-maroon/5 border border-maroon/10 px-2.5 py-1 rounded-full">
                    {selectedRitual.categoryEmoji} {selectedRitual.category}
                  </span>
                  <h3 className="font-serif font-bold text-xl sm:text-2xl text-sandalwood mt-2">
                    {selectedRitual.name}
                  </h3>
                  {selectedRitual.devanagariName && (
                    <span className="font-devanagari text-[11px] text-maroon bg-maroon/5 px-2 py-0.5 rounded-full inline-block mt-1">
                      {selectedRitual.devanagariName}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-xs text-sandalwood/60 font-sans uppercase bg-sandalwood/5 px-3 py-1.5 rounded-md border border-sandalwood/10">
                  <Compass className="w-4 h-4 text-gold shrink-0" />
                  <span>{selectedRitual.duration}</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-sandalwood/80 font-sans leading-relaxed">
                {selectedRitual.description}
              </p>
            </div>

            {/* Qualified Priest Selection Area */}
            <div className="space-y-4">
              <div className="border-b border-sandalwood/10 pb-2">
                <h4 className="font-sans font-black text-[11px] uppercase tracking-[0.25em] text-maroon">
                  Verified Lineage Practitioner
                </h4>
                <p className="text-[10px] text-sandalwood/60 font-sans mt-0.5">
                  The following verified practitioner is qualified and ordained to perform this ceremony.
                </p>
              </div>

              {/* Priest detail block with NO prices shown */}
              {(() => {
                const isMuhuratAuspicious = selectedMuhuratDate && MUHURATS.find(m => m.dateStr === selectedMuhuratDate)?.recommendedPractitionerIds.includes(selectedRitual.practitioner.id);
                return (
                  <div
                    onClick={() => handleProviderClick(selectedRitual.practitioner, selectedRitual)}
                    className={`w-full text-left rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row gap-5 hover:shadow-card-hover shadow-card-default transition-all duration-300 cursor-pointer group focus-within:ring-2 focus-within:ring-maroon relative ${
                      isMuhuratAuspicious
                        ? "bg-gold/5 border-2 border-gold/70 ring-1 ring-gold/30"
                        : "bg-warm-ivory border border-sandalwood/10 hover:border-gold/50"
                    }`}
                  >
                    {/* Photo & tradition */}
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 border border-gold/20 rounded-full overflow-hidden bg-ivory shrink-0 self-center sm:self-start">
                      <img
                        src={selectedRitual.practitioner.photo}
                        alt={selectedRitual.practitioner.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    <div className="flex-grow min-w-0 space-y-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h5 className="font-serif text-lg font-bold text-sandalwood group-hover:text-maroon transition-colors">
                            {selectedRitual.practitioner.name}
                          </h5>
                          {isMuhuratAuspicious && (
                            <span className="text-[9px] font-sans font-black tracking-wider text-ivory bg-maroon px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-gold shrink-0 animate-pulse" />
                              <span>AUSPICIOUS EXPEDIENT</span>
                            </span>
                          )}
                          <span className="text-[9px] font-sans font-bold tracking-wider text-gold border border-gold/30 px-2 py-0.5 bg-maroon/5 rounded-full">
                            {selectedRitual.practitioner.experienceYears} Yrs Exp
                          </span>
                        </div>

                        <span className="text-[10px] text-maroon uppercase tracking-wider font-bold block mb-1">
                          {selectedRitual.practitioner.tradition}
                        </span>

                        <p className="text-xs text-sandalwood/70 font-sans leading-relaxed line-clamp-2">
                          {selectedRitual.practitioner.bio}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-sandalwood/60 font-sans">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-gold" />
                          {selectedRitual.practitioner.location?.split(" (In-Person")[0]}
                        </span>
                        <span className="flex items-center gap-1">
                          <Languages className="w-3.5 h-3.5 text-teal" />
                          {selectedRitual.practitioner.languages?.join(", ")}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center justify-end sm:pl-4 border-t sm:border-t-0 sm:border-l border-sandalwood/10 pt-3 sm:pt-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProviderClick(selectedRitual.practitioner, selectedRitual);
                        }}
                        className="px-5 py-3 bg-maroon text-ivory hover:bg-sandalwood rounded-md font-sans font-bold text-[10px] tracking-widest uppercase transition-all flex items-center justify-center gap-1.5 min-h-[44px]"
                      >
                        <span>View Profile & Dakshina Guide</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </motion.div>
        ) : activeDirectoryTab === "rituals" ? (
          /* TAB 1: RITUAL-FIRST VIEW (DEFAULT) */
          <div className="space-y-8 animate-fadeIn">
            {filteredRitualsWithMuhurat.length === 0 ? (
              <div className="p-8 border border-dashed border-sandalwood/20 rounded-2xl text-center space-y-4 bg-warm-ivory">
                <Compass className="w-8 h-8 text-sandalwood/40 mx-auto" />
                <p className="font-serif text-sm text-sandalwood/70">
                  No ritual matching your search. Try another search query.
                </p>
              </div>
            ) : (
              // Group and render rituals by category
              <div className="space-y-10">
                {["Puja", "Havan", "Astrology"].map((cat) => {
                  const ritualsInCat = filteredRitualsWithMuhurat.filter((r) => r.category === cat);
                  if (ritualsInCat.length === 0) return null;

                  const catTitle =
                    cat === "Puja"
                      ? "Puja & Ceremonies"
                      : cat === "Havan"
                      ? "Purification Havans & Homas"
                      : "Astrological Guidance";

                  return (
                    <div key={cat} className="space-y-4">
                      <div className="border-b border-sandalwood/5 pb-1">
                        <h3 className="font-sans font-black text-[11px] uppercase tracking-[0.25em] text-maroon">
                          {catTitle}
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        {ritualsInCat.map((ritual) => {
                          const isMuhuratAuspicious = selectedMuhuratDate && MUHURATS.find(m => m.dateStr === selectedMuhuratDate)?.recommendedPractitionerIds.includes(ritual.practitioner.id);
                          return (
                            <div
                              key={ritual.id}
                              onClick={() => {
                                setSelectedRitual(ritual);
                                logEvent("ritual_card_selected", { ritualId: ritual.id, name: ritual.name });
                              }}
                              className={`w-full text-left rounded-2xl p-5 hover:shadow-card-hover shadow-card-default transition-all duration-300 cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative ${
                                isMuhuratAuspicious
                                  ? "bg-gold/5 border-2 border-gold/70 ring-1 ring-gold/30"
                                  : "bg-warm-ivory border border-sandalwood/10 hover:border-gold/50"
                              }`}
                            >
                              <div className="space-y-2 max-w-xl">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xl shrink-0">{ritual.categoryEmoji}</span>
                                  <h4 className="font-serif text-base sm:text-lg font-bold text-sandalwood group-hover:text-maroon transition-colors">
                                    {ritual.name}
                                  </h4>
                                  {ritual.devanagariName && (
                                    <span className="font-devanagari text-[9px] text-maroon bg-maroon/5 px-2 py-0.5 rounded-full">
                                      {ritual.devanagariName}
                                    </span>
                                  )}
                                  {isMuhuratAuspicious && (
                                    <span className="text-[9px] font-sans font-black tracking-wider text-ivory bg-maroon px-2 py-0.5 rounded-full flex items-center gap-1">
                                      <Sparkles className="w-3 h-3 text-gold shrink-0 animate-pulse" />
                                      <span>AUSPICIOUS EXPEDIENT</span>
                                    </span>
                                  )}
                                </div>

                                <p className="text-xs text-sandalwood/70 font-sans leading-relaxed line-clamp-2">
                                  {ritual.description}
                                </p>

                                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-sandalwood/50 font-sans uppercase">
                                  <span className="flex items-center gap-1">
                                    <Compass className="w-3.5 h-3.5 text-gold shrink-0" />
                                    {ritual.duration}
                                  </span>
                                  <span>•</span>
                                  <span className="text-teal font-semibold">
                                    Lineage Expert: {ritual.practitioner.name}
                                  </span>
                                </div>
                              </div>

                              <div className="shrink-0 flex sm:flex-col sm:items-end justify-end pt-3 sm:pt-0 border-t sm:border-t-0 sm:border-l border-sandalwood/10 sm:pl-4">
                                <button className="px-4 py-2 sm:px-3 sm:py-2.5 bg-sandalwood/5 hover:bg-maroon hover:text-ivory text-sandalwood rounded-md font-sans font-bold text-[9px] tracking-widest uppercase transition-all flex items-center justify-center gap-1 min-h-[40px] w-full sm:w-auto">
                                  <span>Select Ritual</span>
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* TAB 2: PRACTITIONER-FIRST VIEW */
          <div className="space-y-12 animate-fadeIn">
            {filteredPractitionersWithMuhurat.length === 0 ? (
              <div className="p-8 border border-dashed border-sandalwood/20 rounded-2xl text-center space-y-4 bg-warm-ivory">
                <Compass className="w-12 h-12 bg-maroon/5 border border-maroon/10 rounded-full flex items-center justify-center mx-auto text-maroon" />
                <h4 className="font-serif font-bold text-sandalwood text-base">
                  No Verified Practitioners Match Your Filters
                </h4>
              </div>
            ) : (
              uniqueFilteredTraditions.map((tradition) => {
                const groupPractitioners = filteredPractitionersWithMuhurat.filter((p) => p.tradition === tradition);

                return (
                  <div key={tradition} className="space-y-5">
                    {/* Tradition Header & Subtext */}
                    <div className="border-b border-sandalwood/5 pb-2">
                      <h3 className="font-sans font-black text-[11px] uppercase tracking-[0.2em] text-maroon flex items-center gap-2">
                        <Compass className="w-4 h-4 text-gold shrink-0" />
                        <span>{tradition}</span>
                      </h3>
                      {traditionExplanations[tradition] && (
                        <p className="text-[10px] text-sandalwood/70 font-sans mt-0.5 italic">
                          {traditionExplanations[tradition]}
                        </p>
                      )}
                    </div>

                    {/* Vertical stack of provider cards - NO PRICING */}
                    <div className="space-y-4">
                      {groupPractitioners.map((practitioner) => {
                        const credentialPill = practitioner.verificationReasons[0].split(":")[0];
                        const isMuhuratAuspicious = selectedMuhuratDate && MUHURATS.find(m => m.dateStr === selectedMuhuratDate)?.recommendedPractitionerIds.includes(practitioner.id);

                        return (
                          <div
                            key={practitioner.id}
                            onClick={() => handleProviderClick(practitioner)}
                            className={`w-full text-left rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row gap-5 hover:shadow-card-hover shadow-card-default transition-all duration-300 cursor-pointer group focus-within:ring-2 focus-within:ring-maroon relative ${
                              isMuhuratAuspicious
                                ? "bg-gold/5 border-2 border-gold/70 ring-1 ring-gold/30"
                                : "bg-warm-ivory border border-sandalwood/10 hover:border-gold/50"
                            }`}
                          >
                            {/* Practitioner Avatar */}
                            <div className="flex sm:flex-col items-center gap-4 sm:gap-2 shrink-0">
                              <div className="relative w-16 h-16 sm:w-20 sm:h-20 border border-gold/20 rounded-full overflow-hidden bg-ivory">
                                <img
                                  src={practitioner.photo}
                                  alt={practitioner.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                              {practitioner.devanagariName && (
                                <span className="font-devanagari text-[9px] text-maroon bg-gold/10 px-1.5 py-0.5 rounded-full block sm:hidden">
                                  {practitioner.devanagariName}
                                </span>
                              )}
                            </div>

                            {/* Practitioner details */}
                            <div className="flex-grow min-w-0 space-y-3 flex flex-col justify-between">
                              <div>
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <h4 className="font-serif text-lg sm:text-xl font-bold text-sandalwood group-hover:text-maroon transition-colors flex items-center gap-1.5">
                                    <span>{practitioner.name}</span>
                                  </h4>
                                  {isMuhuratAuspicious && (
                                    <span className="text-[9px] font-sans font-black tracking-wider text-ivory bg-maroon px-2 py-0.5 rounded-full flex items-center gap-1">
                                      <Sparkles className="w-3 h-3 text-gold shrink-0 animate-pulse" />
                                      <span>AUSPICIOUS EXPEDIENT</span>
                                    </span>
                                  )}
                                  {practitioner.devanagariName && (
                                    <span className="hidden sm:inline-block font-devanagari text-[10px] text-maroon bg-gold/10 px-2 py-0.5 rounded-full">
                                      {practitioner.devanagariName}
                                    </span>
                                  )}
                                  <span className="text-[9px] font-sans font-bold tracking-wider text-gold border border-gold/30 px-2 py-0.5 bg-maroon/5 rounded-full">
                                    {practitioner.experienceYears} Yrs Exp
                                  </span>
                                </div>

                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-sandalwood/60 font-sans mb-2">
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5 text-gold shrink-0" />
                                    {practitioner.location?.split(" (In-Person")[0]}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Languages className="w-3.5 h-3.5 text-teal shrink-0" />
                                    {practitioner.languages?.join(", ")}
                                  </span>
                                </div>

                                <p className="text-xs text-sandalwood/70 line-clamp-2 font-sans leading-relaxed">
                                  {practitioner.bio}
                                </p>
                              </div>

                              <div className="space-y-2 pt-1 border-t border-sandalwood/5">
                                <div className="flex items-center gap-1.5 text-[10px] font-sans text-teal">
                                  <ShieldCheck className="w-4 h-4 text-teal shrink-0" />
                                  <span className="font-bold uppercase tracking-wider">Verified:</span>
                                  <span className="text-sandalwood/80 line-clamp-1">{credentialPill}</span>
                                </div>

                                <div className="flex gap-1.5 flex-wrap">
                                  {practitioner.specializations.slice(0, 3).map((spec) => (
                                    <span
                                      key={spec}
                                      className="text-[9px] font-sans font-bold tracking-wider text-sandalwood/70 uppercase border border-sandalwood/10 px-2 py-0.5 bg-ivory rounded-md"
                                    >
                                      {spec}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* View Profile CTA - NO PRICE info */}
                            <div className="shrink-0 text-left sm:text-right flex flex-row sm:flex-col justify-end sm:items-end self-stretch pt-3 sm:pt-0 sm:pl-4 border-t sm:border-t-0 sm:border-l border-sandalwood/10">
                              <button
                                onClick={() => handleProviderClick(practitioner)}
                                className="px-4 py-2 sm:px-3 sm:py-2.5 bg-sandalwood/5 hover:bg-maroon hover:text-ivory text-sandalwood border border-sandalwood/20 hover:border-maroon rounded-md font-sans font-bold text-[10px] tracking-widest uppercase transition-all flex items-center justify-center gap-1.5 min-h-[40px] w-full"
                              >
                                <span>View Lineage & Profile</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </section>

      {/* Honest Empty State Footer Reassurance */}
      <div className="p-8 border border-sandalwood/10 rounded-2xl text-center relative overflow-hidden bg-warm-ivory shadow-card-default">
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gold" />
        <h4 className="font-serif font-bold text-sandalwood text-lg mb-2 uppercase tracking-wide">
          Your Peace of Mind is Our Sacred Duty
        </h4>
        <p className="font-sans text-xs text-sandalwood/80 max-w-md mx-auto leading-relaxed tracking-wide">
          SETU is founded to solve a high-stakes family coordination problem. We never treat spiritual rituals as transaction objects. Our 100% full replacement guarantee ensures your auspicious calendar milestones are respected with extreme reliability.
        </p>
      </div>
    </div>
  );
}
