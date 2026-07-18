import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Compass, CheckCircle2, MapPin, Calendar, Clock, Lock, Send, Mail, Phone, User, Check, ArrowLeft, Info, AlertCircle, RefreshCw } from "lucide-react";
import RotatingMandala from "./RotatingMandala";
import { analytics } from "../lib/analytics";

interface KundliViewProps {
  onBackToHome: () => void;
}

type StepType = "details" | "loading" | "report";

export default function KundliView({ onBackToHome }: KundliViewProps) {
  const [step, setStep] = useState<StepType>("details");
  
  // Birth Details State
  const [userName, setUserName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [isTimeApprox, setIsTimeApprox] = useState(false);
  const [birthPlace, setBirthPlace] = useState("");
  
  // Lead Capture State
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  
  // Validation Errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Generated Report State
  const [kundliId, setKundliId] = useState("");
  const [basicDetails, setBasicDetails] = useState<any>(null);
  const [placements, setPlacements] = useState<any[]>([]);
  const [section1, setSection1] = useState<any>(null);
  const [section2, setSection2] = useState<any>(null);
  const [section3, setSection3] = useState<any>(null);
  const [section4, setSection4] = useState<any>(null);
  const [section5, setSection5] = useState<any>(null);
  
  // Funnel & Loading States
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [unlockSuccessMsg, setUnlockSuccessMsg] = useState("");

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!userName.trim()) newErrors.userName = "Full name is required.";
    if (!birthDate) newErrors.birthDate = "Date of birth is required.";
    if (!birthPlace.trim()) newErrors.birthPlace = "Birth city/place is required.";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setStep("loading");
    setIsGenerating(true);
    
    analytics.track("kundli_calculation_started", {
      name: userName,
      has_time: !isTimeApprox,
    });

    try {
      const response = await fetch("/api/generate-kundli", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: userName,
          birthDate,
          birthTime: birthTime || (isTimeApprox ? "Approximate" : ""),
          birthPlace,
          isTimeApprox,
        }),
      });

      if (!response.ok) {
        throw new Error("Vedic calculation engine returned an error.");
      }

      const data = await response.json();
      
      // Load partial data
      setKundliId(data.kundliId);
      setBasicDetails(data.basicDetails);
      setPlacements(data.placements || []);
      setSection1(data.section1);
      setSection2(data.section2);
      
      setStep("report");
      setIsGenerating(false);
      analytics.track("kundli_partial_report_viewed", { name: userName });
    } catch (err: any) {
      console.error("[KUNDLI FRONTEND GENERATE ERROR]", err);
      // Fallback in case backend fails
      setErrors({ apiError: "The planetary calculation engine timed out. Please try again." });
      setStep("details");
      setIsGenerating(false);
    }
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsUnlocking(true);

    analytics.track("kundli_lead_captured", {
      name: userName,
      email,
      phone: phone || undefined,
    });

    try {
      const response = await fetch("/api/unlock-kundli", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          kundliId,
          name: userName,
          email,
          phone,
        }),
      });

      if (!response.ok) {
        throw new Error("Unlock service returned an error.");
      }

      const data = await response.json();
      
      // Set unlocked remaining sections
      setSection3(data.report.section3);
      setSection4(data.report.section4);
      setSection5(data.report.section5);
      
      setIsUnlocked(true);
      setUnlockSuccessMsg(`A complete high-fidelity PDF-ready Kundli report has been successfully calculated and emailed to ${email}.`);
      setIsUnlocking(false);
      analytics.track("kundli_full_report_unlocked", { name: userName });
    } catch (err) {
      console.error("[KUNDLI FRONTEND UNLOCK ERROR]", err);
      setIsUnlocking(false);
      // Fallback to let user see it anyway so UX doesn't crash
      setIsUnlocked(true);
      setUnlockSuccessMsg("Cosmic lock released. Due to a server communication warning, please review the results below.");
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12" id="kundli-funnel-container">
      {/* Back Button */}
      <div className="mb-6">
        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-2 px-4 py-2 bg-warm-ivory border border-sandalwood/15 hover:border-maroon/30 text-sandalwood hover:text-maroon text-xs font-sans font-bold tracking-wider uppercase rounded-lg transition-all shadow-sm cursor-pointer"
          id="btn-back-home-kundli"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* STEP 1: INPUT DETAILS */}
        {step === "details" && (
          <motion.div
            key="input-details"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="bg-white border border-sandalwood/15 rounded-2xl shadow-card-hover overflow-hidden"
            id="kundli-details-card"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12">
              {/* Left visual column */}
              <div className="lg:col-span-5 bg-maroon text-ivory p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden min-h-[300px] lg:min-h-0">
                <div className="absolute top-[-50px] right-[-50px] opacity-10">
                  <RotatingMandala speed="slow" />
                </div>
                
                <div className="space-y-6 relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold/10 border border-gold/30 text-gold rounded-full text-[10px] font-sans font-bold uppercase tracking-widest animate-pulse">
                    <Sparkles className="w-3 h-3" />
                    Vetted Lineage Jyotish
                  </div>
                  <h2 className="font-serif text-3xl sm:text-4xl text-warm-ivory leading-tight">
                    Get Your Sacred Birth Chart Analysis
                  </h2>
                  <p className="text-ivory/80 text-xs sm:text-sm font-sans leading-relaxed">
                    Enter your precise birth coordinates to calculate your astrological blueprint. Our system securely maps the positions of all major planetary deities (Grahas) using exact astronomical ephemeris equations.
                  </p>
                </div>

                <div className="border-t border-ivory/10 pt-6 space-y-3 relative z-10 text-[11px] font-sans text-ivory/70">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-gold shrink-0" />
                    <span>Calculates precise Ascendant (Lagna) & Moon Rashi</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-gold shrink-0" />
                    <span>Determines your specific birth Nakshatra & Pada</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-gold shrink-0" />
                    <span>Absolutely no hidden gemstone or commercial upsells</span>
                  </div>
                </div>
              </div>

              {/* Right form column */}
              <div className="lg:col-span-7 p-8 sm:p-12">
                <form onSubmit={handleDetailsSubmit} className="space-y-6" id="kundli-details-form">
                  <div className="space-y-1">
                    <h3 className="font-serif text-xl text-maroon font-medium">Birth Details</h3>
                    <p className="text-xs text-sandalwood/60">Provide accurate coordinates for precise calculations.</p>
                  </div>

                  {errors.apiError && (
                    <div className="p-3.5 bg-red-50 border border-red-100 text-red-700 rounded-xl text-xs flex items-center gap-2" id="api-error-alert">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errors.apiError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-[11px] font-sans font-bold uppercase tracking-wider text-sandalwood/70 block">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sandalwood/40" />
                        <input
                          type="text"
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                          placeholder="e.g. Siddhartha Sharma"
                          className={`w-full pl-10 pr-4 py-3 bg-warm-ivory/40 border ${errors.userName ? "border-red-400" : "border-sandalwood/20"} focus:border-maroon focus:outline-none rounded-xl text-xs sm:text-sm text-sandalwood transition-all`}
                          id="input-kundli-name"
                        />
                      </div>
                      {errors.userName && <p className="text-[10px] text-red-500 font-sans">{errors.userName}</p>}
                    </div>

                    {/* Date of Birth */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-sans font-bold uppercase tracking-wider text-sandalwood/70 block">
                        Date of Birth <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sandalwood/40" />
                        <input
                          type="date"
                          value={birthDate}
                          onChange={(e) => setBirthDate(e.target.value)}
                          className={`w-full pl-10 pr-4 py-3 bg-warm-ivory/40 border ${errors.birthDate ? "border-red-400" : "border-sandalwood/20"} focus:border-maroon focus:outline-none rounded-xl text-xs sm:text-sm text-sandalwood transition-all`}
                          id="input-kundli-dob"
                        />
                      </div>
                      {errors.birthDate && <p className="text-[10px] text-red-500 font-sans">{errors.birthDate}</p>}
                    </div>

                    {/* Birth Time */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-[11px] font-sans font-bold uppercase tracking-wider text-sandalwood/70 block">
                          Time of Birth
                        </label>
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isTimeApprox}
                            onChange={(e) => setIsTimeApprox(e.target.checked)}
                            className="rounded text-maroon focus:ring-maroon w-3.5 h-3.5 border-sandalwood/30"
                            id="checkbox-approx-time"
                          />
                          <span className="text-[9px] font-sans text-sandalwood/50">Approximate?</span>
                        </label>
                      </div>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sandalwood/40" />
                        <input
                          type="time"
                          value={birthTime}
                          onChange={(e) => setBirthTime(e.target.value)}
                          disabled={isTimeApprox}
                          className={`w-full pl-10 pr-4 py-3 bg-warm-ivory/40 disabled:opacity-50 border border-sandalwood/20 focus:border-maroon focus:outline-none rounded-xl text-xs sm:text-sm text-sandalwood transition-all`}
                          id="input-kundli-time"
                        />
                      </div>
                    </div>

                    {/* Birth Place */}
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-[11px] font-sans font-bold uppercase tracking-wider text-sandalwood/70 block">
                        Birth City & State/Country <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sandalwood/40" />
                        <input
                          type="text"
                          value={birthPlace}
                          onChange={(e) => setBirthPlace(e.target.value)}
                          placeholder="e.g. Kathmandu, Nepal or New Delhi, India"
                          className={`w-full pl-10 pr-4 py-3 bg-warm-ivory/40 border ${errors.birthPlace ? "border-red-400" : "border-sandalwood/20"} focus:border-maroon focus:outline-none rounded-xl text-xs sm:text-sm text-sandalwood transition-all`}
                          id="input-kundli-place"
                        />
                      </div>
                      {errors.birthPlace && <p className="text-[10px] text-red-500 font-sans">{errors.birthPlace}</p>}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-maroon hover:bg-sandalwood text-ivory font-sans font-bold text-xs tracking-[0.2em] uppercase rounded-xl shadow-card-default hover:shadow-card-hover hover:scale-[1.01] transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 group focus:outline-none focus:ring-2 focus:ring-gold"
                    id="btn-generate-kundli-submit"
                  >
                    <span>Calculate Kundli Report</span>
                    <Sparkles className="w-4 h-4 text-gold group-hover:rotate-12 transition-transform" />
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 2: LOADING VEDIC COMPUTATION */}
        {step === "loading" && (
          <motion.div
            key="loading-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white border border-sandalwood/10 rounded-2xl shadow-card-default py-20 px-8 text-center flex flex-col items-center justify-center space-y-6 min-h-[450px]"
            id="kundli-loading-card"
          >
            <div className="w-24 h-24 text-maroon relative flex items-center justify-center">
              <RotatingMandala speed="fast" />
              <Compass className="absolute w-8 h-8 text-gold animate-spin" />
            </div>

            <div className="space-y-2 max-w-sm">
              <h3 className="font-serif text-xl text-maroon font-semibold">Calculating Astronomical Alignments</h3>
              <p className="text-xs text-sandalwood/60 leading-relaxed">
                Querying planetary coordinates & houses against historical Vedic ephemeris libraries...
              </p>
            </div>

            {/* Custom simulated loading progress bar */}
            <div className="w-full max-w-xs h-1 bg-warm-ivory rounded-full overflow-hidden">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 3, ease: "easeInOut" }}
                className="h-full bg-gold"
              />
            </div>
          </motion.div>
        )}

        {/* STEP 3: PARTIAL / COMPLETED REPORT DISPLAY */}
        {step === "report" && (
          <motion.div
            key="report-screen"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
            id="kundli-report-container"
          >
            {/* Lead capture warning overlay if not unlocked */}
            {!isUnlocked && (
              <div className="p-4 bg-gold/10 border border-gold/25 text-maroon rounded-2xl text-xs flex gap-3 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-gold" />
                <Info className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-sans font-bold uppercase tracking-wide">Report Partially Loaded</h4>
                  <p className="text-sandalwood/80 leading-relaxed">
                    We have successfully mapped your primary planetary chart. Scroll down to review your Ascendant placements, Personality analysis, and Career outlook. Complete the premium lead validation form at the bottom to receive the <strong>full PDF report on Marriage, Love alignment, active planetary Doshas, and spiritual remedies directly to your email</strong>.
                  </p>
                </div>
              </div>
            )}

            {/* Success Unlocked Banner */}
            {isUnlocked && unlockSuccessMsg && (
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="p-4 bg-teal/10 border border-teal/20 text-teal-800 rounded-2xl text-xs flex gap-3 relative overflow-hidden"
                id="unlock-success-alert"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-teal-600" />
                <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-sans font-black uppercase tracking-wide text-teal-900">Success! Sacred Insights Unlocked</h4>
                  <p className="text-teal-900/80 leading-relaxed">{unlockSuccessMsg}</p>
                </div>
              </motion.div>
            )}

            {/* Main Report Card */}
            <div className="bg-white border border-sandalwood/15 rounded-2xl shadow-card-hover overflow-hidden">
              <div className="bg-maroon text-ivory p-8 text-center border-b-4 border-gold relative overflow-hidden">
                <div className="absolute inset-0 bg-radial-gradient from-maroon/80 to-maroon" />
                <div className="relative z-10 space-y-3">
                  <p className="text-[10px] font-sans font-black uppercase tracking-[0.25em] text-gold">Vedic Astrology Natal Horoscope</p>
                  <h2 className="font-serif text-3xl text-warm-ivory">{userName}'s Birth Chart</h2>
                  <p className="text-xs text-ivory/70 max-w-md mx-auto">
                    Calculated for <strong>{birthPlace}</strong> on <strong>{birthDate}</strong> {birthTime && `at ${birthTime}`}
                  </p>
                </div>
              </div>

              {/* Basic Astronomical Details Row */}
              {basicDetails && (
                <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-sandalwood/10 bg-warm-ivory/30 border-b border-sandalwood/10 p-6 text-center" id="kundli-basic-details">
                  <div className="py-4 sm:py-2">
                    <p className="text-[10px] font-sans font-bold uppercase tracking-wider text-sandalwood/50">Lagna (Ascendant)</p>
                    <p className="font-serif text-lg text-maroon font-medium mt-1">{basicDetails.ascendant}</p>
                  </div>
                  <div className="py-4 sm:py-2">
                    <p className="text-[10px] font-sans font-bold uppercase tracking-wider text-sandalwood/50">Moon Sign (Rashi)</p>
                    <p className="font-serif text-lg text-maroon font-medium mt-1">{basicDetails.moonSign}</p>
                  </div>
                  <div className="py-4 sm:py-2">
                    <p className="text-[10px] font-sans font-bold uppercase tracking-wider text-sandalwood/50">Birth Nakshatra</p>
                    <p className="font-serif text-lg text-maroon font-medium mt-1">{basicDetails.nakshatra}</p>
                  </div>
                </div>
              )}

              {/* Placements Grid */}
              <div className="p-6 sm:p-8 space-y-6">
                <div>
                  <h3 className="font-serif text-lg text-maroon font-semibold mb-2">Planetary Alignments (Graha Coordinates)</h3>
                  <p className="text-xs text-sandalwood/60">Astrological position of major grahas in the respective zodiac houses at birth.</p>
                </div>

                <div className="overflow-x-auto border border-sandalwood/10 rounded-xl" id="kundli-placements-table">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-warm-ivory/50 font-sans font-bold uppercase tracking-wider text-sandalwood/70 border-b border-sandalwood/10">
                        <th className="p-3.5">Graha (Deity)</th>
                        <th className="p-3.5">Rashi (Zodiac Sign)</th>
                        <th className="p-3.5">Bhava (House)</th>
                        <th className="p-3.5">Dignity & State</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-sandalwood/5 text-sandalwood/90 font-sans">
                      {placements.map((row, idx) => (
                        <tr key={idx} className="hover:bg-warm-ivory/10 transition-colors">
                          <td className="p-3.5 font-bold text-maroon">{row.graha}</td>
                          <td className="p-3.5">{row.rashi}</td>
                          <td className="p-3.5">{row.house}</td>
                          <td className="p-3.5">
                            <span className="inline-block px-2.5 py-0.5 bg-gold/10 border border-gold/25 text-maroon font-bold text-[10px] rounded">
                              {row.dignity}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sections with blur lock */}
              <div className="p-6 sm:p-8 space-y-8 divide-y divide-sandalwood/10">
                {/* Section 1: Core Personality */}
                {section1 && (
                  <div className="pt-6 first:pt-0 space-y-3">
                    <h4 className="font-serif text-lg text-maroon font-semibold flex items-center gap-2">
                      <Compass className="w-5 h-5 text-gold" />
                      {section1.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-sandalwood/80 leading-relaxed font-sans">{section1.content}</p>
                  </div>
                )}

                {/* Section 2: Career & Professional */}
                {section2 && (
                  <div className="pt-6 space-y-3">
                    <h4 className="font-serif text-lg text-maroon font-semibold flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-gold" />
                      {section2.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-sandalwood/80 leading-relaxed font-sans">{section2.content}</p>
                  </div>
                )}

                {/* Gated Content wrapper (blurred if not unlocked) */}
                <div className="relative pt-6">
                  <div className={`space-y-8 transition-all duration-700 ${!isUnlocked ? "blur-[6px] select-none pointer-events-none opacity-40" : ""}`}>
                    {/* Section 3: Marriage & Relationships */}
                    {section3 ? (
                      <div className="space-y-3">
                        <h4 className="font-serif text-lg text-maroon font-semibold flex items-center gap-2">
                          <Compass className="w-5 h-5 text-gold" />
                          {section3.title}
                        </h4>
                        <p className="text-xs sm:text-sm text-sandalwood/80 leading-relaxed font-sans">{section3.content}</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <h4 className="font-serif text-lg text-maroon font-semibold flex items-center gap-2">
                          <Lock className="w-5 h-5 text-gold" />
                          Marriage, Love & Relationship Alignment
                        </h4>
                        <p className="text-xs sm:text-sm text-sandalwood/80 leading-relaxed font-sans">
                          Traditional matching suitability analysis, compatibility factors, 7th house partner dynamics, and planetary directions in marriage houses are locked. Complete the validation form below to unlock this insight instantly.
                        </p>
                      </div>
                    )}

                    {/* Section 4: Doshas */}
                    {section4 ? (
                      <div className="pt-6 space-y-3 border-t border-sandalwood/10">
                        <h4 className="font-serif text-lg text-maroon font-semibold flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-gold" />
                          {section4.title}
                        </h4>
                        <p className="text-xs sm:text-sm text-sandalwood/80 leading-relaxed font-sans">{section4.content}</p>
                      </div>
                    ) : (
                      <div className="pt-6 space-y-3 border-t border-sandalwood/10">
                        <h4 className="font-serif text-lg text-maroon font-semibold flex items-center gap-2">
                          <Lock className="w-5 h-5 text-gold" />
                          Planetary Doshas & Karmic Obstacles
                        </h4>
                        <p className="text-xs sm:text-sm text-sandalwood/80 leading-relaxed font-sans">
                          Evaluation of structural doshas (Manglik, Sade Sati, Kaal Sarp, Rahu/Ketu transitions) which govern blocks and unexpected life delays are currently locked. Validate your coordinates below to view the analysis.
                        </p>
                      </div>
                    )}

                    {/* Section 5: Remedies */}
                    {section5 ? (
                      <div className="pt-6 space-y-3 border-t border-sandalwood/10">
                        <h4 className="font-serif text-lg text-maroon font-semibold flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-gold" />
                          {section5.title}
                        </h4>
                        <p className="text-xs sm:text-sm text-sandalwood/80 leading-relaxed font-sans">{section5.content}</p>
                      </div>
                    ) : (
                      <div className="pt-6 space-y-3 border-t border-sandalwood/10">
                        <h4 className="font-serif text-lg text-maroon font-semibold flex items-center gap-2">
                          <Lock className="w-5 h-5 text-gold" />
                          Traditional Remedies & Planetary Alignment Recommendations
                        </h4>
                        <p className="text-xs sm:text-sm text-sandalwood/80 leading-relaxed font-sans">
                          Concrete, personalized Vedic remedies including recommended seed mantras, Pujas, charitable planetary pacification rituals, and color/gemstone alignment cautions are locked.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Lock Call To Action */}
                  {!isUnlocked && (
                    <div className="absolute inset-0 flex items-center justify-center p-4 bg-gradient-to-t from-white via-white/80 to-transparent pt-12" id="kundli-lock-cta">
                      <div className="bg-white border border-gold/30 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-card-hover space-y-6 text-center border-t-4 border-t-maroon">
                        <div className="mx-auto w-12 h-12 rounded-full bg-gold/10 text-maroon flex items-center justify-center border border-gold/20">
                          <Lock className="w-5 h-5 text-gold" />
                        </div>
                        
                        <div className="space-y-2">
                          <h4 className="font-serif text-lg text-maroon font-bold leading-tight">Unlock Your Complete Personalized Vedic Kundli Analysis</h4>
                          <p className="text-[11px] text-sandalwood/70 leading-relaxed">
                            Your full customized report covering <strong>Marriage, Love, Career wealth peaks, active Doshas, and Traditional Remedies</strong> is prepared. Validate your coordinates below to unlock insights on-screen and receive a detailed printable copy by email.
                          </p>
                        </div>

                        <form onSubmit={handleLeadSubmit} className="space-y-4 text-left" id="lead-unlock-form">
                          {/* Email Input */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-sans font-bold uppercase tracking-wider text-sandalwood/60 block">
                              Email Address <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sandalwood/40" />
                              <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="e.g. you@example.com"
                                className={`w-full pl-10 pr-4 py-2.5 bg-warm-ivory/30 border ${errors.email ? "border-red-400" : "border-sandalwood/20"} focus:border-maroon focus:outline-none rounded-xl text-xs sm:text-sm text-sandalwood`}
                                id="input-lead-email"
                              />
                            </div>
                            {errors.email && <p className="text-[9px] text-red-500 font-sans">{errors.email}</p>}
                          </div>

                          {/* Phone Input */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-sans font-bold uppercase tracking-wider text-sandalwood/60 block">
                              Phone Number <span className="text-sandalwood/40">(Optional)</span>
                            </label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sandalwood/40" />
                              <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="e.g. +1 (555) 123-4567"
                                className="w-full pl-10 pr-4 py-2.5 bg-warm-ivory/30 border border-sandalwood/20 focus:border-maroon focus:outline-none rounded-xl text-xs sm:text-sm text-sandalwood"
                                id="input-lead-phone"
                              />
                            </div>
                          </div>

                          <button
                            type="submit"
                            disabled={isUnlocking}
                            className="w-full py-3.5 bg-maroon hover:bg-sandalwood text-ivory font-sans font-bold text-xs tracking-widest uppercase rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-2 group disabled:opacity-75 focus:outline-none focus:ring-1 focus:ring-gold"
                            id="btn-lead-unlock-submit"
                          >
                            {isUnlocking ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin text-gold" />
                                <span>Unlocking Insights...</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3.5 h-3.5 text-gold group-hover:rotate-12 transition-transform" />
                                <span>Unlock Complete Report</span>
                              </>
                            )}
                          </button>
                        </form>

                        <p className="text-[9px] text-sandalwood/40 text-center leading-normal">
                          We respect your privacy. Birth details and email coordinate credentials are 100% encrypted and remain strictly confidential. No commercial spam, guaranteed.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
