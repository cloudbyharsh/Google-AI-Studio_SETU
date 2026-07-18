import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Check, ShieldCheck, Clock, FileText, Sparkles, Star, ShieldAlert, MapPin, Languages, HeartHandshake, AlertCircle, Calendar, Globe, BookOpen, Package, Info } from "lucide-react";
import { Practitioner, Service } from "../types";
import RotatingMandala from "./RotatingMandala";
import { analytics } from "../lib/analytics";

interface ProfileViewProps {
  practitioner: Practitioner;
  onBack: () => void;
  onRequestBooking: (practitioner: Practitioner, service: Service) => void;
  initialSelectedService?: Service | null;
}

// Simple elegant console event tracker for tracking verification viewed, updated for centralized analytics
const logEvent = (eventName: string, payload?: any) => {
  console.log(
    `%c[SETU Analytics Event] %c${eventName}`,
    "color: #1B6B5A; font-weight: bold;",
    "color: #C4922A; font-weight: bold; font-style: italic;",
    payload || ""
  );
  analytics.track(eventName, payload || {});
};

export default function ProfileView({
  practitioner,
  onBack,
  onRequestBooking,
  initialSelectedService,
}: ProfileViewProps) {
  // Enforce Section 6: Selected service starts as initialSelectedService if provided, else null
  const [selectedService, setSelectedService] = useState<Service | null>(initialSelectedService || null);
  const [scrolledPastHeader, setScrolledPastHeader] = useState(false);

  // Customizer preferences for bespoke spiritual product
  const [culture, setCulture] = useState<"vedic" | "agama" | "gujarati" | "universal">("vedic");
  const [mode, setMode] = useState<"in-person" | "virtual">("in-person");
  const [gotra, setGotra] = useState("");
  const [familyNames, setFamilyNames] = useState("");
  const [wantsPrasad, setWantsPrasad] = useState(false);

  // Track verification section viewed on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            logEvent("verification_section_viewed", { providerId: practitioner.id });
          }
        });
      },
      { threshold: 0.5 }
    );
    const element = document.getElementById("verification-evidence-section");
    if (element) observer.observe(element);
    return () => observer.disconnect();
  }, [practitioner.id]);

  // Track profile view and availability checked on mount
  useEffect(() => {
    logEvent("practitioner_profile_viewed", {
      practitioner_id: practitioner.id,
      practitioner_name: practitioner.name,
      tradition: practitioner.tradition,
      service_count: practitioner.services.length
    });
    if (initialSelectedService) {
      logEvent("availability_checked", {
        practitioner_id: practitioner.id,
        date_selected: "Custom Date Configured",
        user_local_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      });
    }
  }, [practitioner.id, initialSelectedService]);

  // Monitor scroll to activate sticky button shadow
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 150) {
        setScrolledPastHeader(true);
      } else {
        setScrolledPastHeader(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getCalculatedPrice = (service: Service) => {
    const isAstrology = service.category === "Astrology";
    let price = service.price;
    if (mode === "virtual" && !isAstrology) {
      price = Math.max(80, price - 50);
    }
    if (wantsPrasad) {
      price += 25;
    }
    return price;
  };

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    logEvent("service_selected", { serviceId: service.id, name: service.name, price: service.price });
    logEvent("availability_checked", {
      practitioner_id: practitioner.id,
      date_selected: "Custom Date Configured",
      user_local_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });
  };

  const handleRequestClick = () => {
    if (selectedService) {
      const finalPrice = getCalculatedPrice(selectedService);
      const isAstrology = selectedService.category === "Astrology";
      const customNotes = [
        `Ancestral Gotra: ${gotra.trim() || "Not specified"}`,
        `Blessing Chant Names: ${familyNames.trim() || "Not specified"}`,
        `Lineage Tradition: ${
          culture === "vedic"
            ? "North Indian Vedic"
            : culture === "agama"
            ? "South Indian Agama Dravidian"
            : culture === "gujarati"
            ? "Western/Gujarati"
            : "Universal Explanatory"
        }`,
        `Ceremony Mode: ${isAstrology ? "Virtual Online Video" : mode === "virtual" ? "Virtual Online Video" : "In-Person (Home/Venue)"}`,
        `Sacred Prasad Package Delivery: ${wantsPrasad ? "Requested Yes" : "No"}`,
      ].join("\n");

      logEvent("booking_request_started", {
        providerId: practitioner.id,
        serviceId: selectedService.id,
        price: finalPrice,
        notes: customNotes,
      });

      logEvent("booking_started", {
        practitioner_id: practitioner.id,
        service_id: selectedService.id,
        service_price: finalPrice,
        consultation_format: isAstrology ? "virtual" : mode === "virtual" ? "virtual" : "in-person"
      });

      const customizedService: Service = {
        ...selectedService,
        price: finalPrice,
        description: `${selectedService.description}\n\n[Custom Preferences Selected]:\n${customNotes}`,
      };

      onRequestBooking(practitioner, customizedService);
    }
  };

  const getCategoryStyles = (category: Service["category"]) => {
    switch (category) {
      case "Puja":
        return "bg-gold/10 text-sandalwood border-gold/30";
      case "Astrology":
        return "bg-teal/10 text-teal border-teal/30";
      case "Vastu":
        return "bg-maroon/10 text-maroon border-maroon/30";
      case "Havan":
        return "bg-maroon/10 text-maroon border-maroon/30";
      default:
        return "bg-gold/10 text-sandalwood border-gold/30";
    }
  };

  // Section 2: Custom best-suited bullets
  const getBestSuitedFor = (id: string) => {
    switch (id) {
      case "rajesh-shastri":
        return [
          "North Indian Vedic ceremonies performed with immaculate Sanskrit pronunciation.",
          "Bilingual Hindi and English speaking families wanting interactive explanations.",
          "First-time homeowners planning a traditional Griha Pravesh.",
          "Families seeking structured, flat-rate, and non-rushed religious Havans."
        ];
      case "venkatesh-raghavan":
        return [
          "South Indian Smartha, Iyer, and Iyengar traditional family customs.",
          "Tamil, Telugu, and Kannada speaking families seeking strict Agama Shastra practices.",
          "Large-scale traditional weddings (Vedic Vivaha) needing patient bilingual coordination.",
          "Parents looking for a meaningful and comforting Upanayanam thread rite of passage."
        ];
      case "meenakshi-iyer":
        return [
          "100% online, video-enabled Vedic astrology (Jyotish) consultations.",
          "English and Tamil speaking clients globally wanting highly practical life timelines.",
          "Ethical relationship alignment & matchmaking compatibility advice.",
          "Actionable, optimistic, and empowerment-based career and wealth guidance."
        ];
      case "anand-pathak":
        return [
          "Precise Shaivite temple-grade chanting and ritual focus.",
          "Hindi and Maithili speaking families across Ontario seeking spiritual resilience.",
          "Intensive purification fire rituals (Rudrabhishek & Shiva Homa).",
          "Families requesting health-focused, healing, and comforting prayers during crises."
        ];
      default:
        return [
          "Vetted traditional South Asian ceremonies.",
          "Empathetic, clear, and bilingual guidance.",
          "Families desiring absolute transparency and reliability."
        ];
    }
  };

  return (
    <div className="min-h-screen bg-ivory pb-36 relative">
      {/* Back Navigation Bar */}
      <div className="sticky top-14 sm:top-16 z-30 bg-ivory/95 backdrop-blur-sm border-b border-sandalwood/10 px-4 sm:px-6 py-4">
        <div className="max-w-xl mx-auto flex items-center">
          <button
            onClick={onBack}
            className="group flex items-center gap-2 text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-sandalwood/80 hover:text-maroon focus:outline-none focus:ring-2 focus:ring-maroon cursor-pointer transition-colors min-w-[44px] min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Directory</span>
          </button>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-6 max-w-xl mx-auto space-y-10 relative z-10">
        {/* Profile Header Block (Section 1) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col sm:flex-row gap-5 items-center sm:items-start text-center sm:text-left border-b border-sandalwood/10 pb-6"
        >
          {/* Avatar with Verified Indicator */}
          <div className="relative w-28 h-28 border border-gold/30 p-1 bg-warm-ivory rounded-full shrink-0">
            <img
              src={practitioner.photo}
              alt={practitioner.name}
              className="w-full h-full object-cover rounded-full"
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-1 right-1 w-6.5 h-6.5 bg-maroon border border-gold/40 rounded-full flex items-center justify-center shadow-md">
              <Check className="w-4 h-4 text-ivory stroke-[3]" />
            </div>
          </div>

          <div className="space-y-3 flex-1">
            <div className="space-y-1">
              <div className="flex gap-2 flex-wrap justify-center sm:justify-start items-center">
                <span className="inline-block text-[9px] font-sans font-bold tracking-widest text-gold uppercase bg-maroon/5 border border-gold/20 px-2.5 py-0.5 rounded-md">
                  {practitioner.tradition}
                </span>
                {practitioner.devanagariName && (
                  <span className="font-devanagari text-[11px] text-maroon bg-gold/10 px-2 py-0.5 rounded-full font-semibold">
                    {practitioner.devanagariName}
                  </span>
                )}
              </div>
              <h1 className="font-serif text-2.5xl sm:text-3xl font-bold text-sandalwood leading-none">
                {practitioner.name}
              </h1>
            </div>

            {/* Language & Location Details */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1.5 text-xs text-sandalwood/70 font-sans">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-gold shrink-0" />
                {practitioner.location}
              </span>
              <span className="flex items-center gap-1">
                <Languages className="w-4 h-4 text-teal shrink-0" />
                {practitioner.languages?.join(", ")}
              </span>
              <span className="flex items-center gap-1 font-bold text-gold">
                <Star className="w-4 h-4 fill-gold text-gold shrink-0" />
                {practitioner.experienceYears} Years Experience
              </span>
            </div>

            <p className="text-xs text-sandalwood/80 leading-relaxed font-sans">
              {practitioner.bio}
            </p>
          </div>
        </motion.div>

        {/* Best Suited For Block (Section 2) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="bg-warm-ivory border border-sandalwood/10 rounded-2xl p-5 space-y-3.5 shadow-card-default"
        >
          <h3 className="font-sans font-bold text-[10px] uppercase tracking-widest text-maroon border-b border-sandalwood/5 pb-1.5 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-gold" />
            Best Suited For
          </h3>
          <ul className="space-y-2.5">
            {getBestSuitedFor(practitioner.id).map((bullet, idx) => (
              <li key={idx} className="flex gap-2.5 items-start text-xs text-sandalwood font-sans">
                <span className="w-1.5 h-1.5 rounded-full bg-gold shrink-0 mt-1.5" />
                <span className="leading-relaxed">{bullet}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Why SETU Verified Section (Section 3) */}
        <motion.div
          id="verification-evidence-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="bg-warm-ivory border border-sandalwood/10 rounded-2xl p-6 space-y-5 shadow-card-default relative overflow-hidden"
        >
          {/* Subtle watermarked mandala background */}
          <div className="absolute -bottom-10 -left-10 opacity-[0.03] pointer-events-none">
            <RotatingMandala size={150} color="#1B6B5A" secondaryColor="#C4922A" speed="slow" />
          </div>

          <div className="flex items-center justify-between border-b border-sandalwood/5 pb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-teal" />
              <h2 className="font-sans font-bold text-xs uppercase tracking-[0.2em] text-sandalwood">
                Vetting Evidence & Audits
              </h2>
            </div>
            
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-teal bg-teal/5 border border-teal/20 px-2 py-0.5 rounded-full">
              Last Audited: {practitioner.lastVerifiedDate}
            </span>
          </div>

          <ul className="space-y-4 relative z-10" role="list">
            {practitioner.verificationReasons.map((reason, idx) => {
              const parts = reason.split(":");
              return (
                <li key={idx} className="flex gap-3 items-start">
                  <div className="w-5 h-5 bg-teal/5 rounded-full shrink-0 flex items-center justify-center mt-0.5 border border-teal/10">
                    <Check className="w-3 h-3 text-teal stroke-[3]" />
                  </div>
                  <span className="text-xs text-sandalwood font-sans leading-relaxed">
                    {parts[0] && <strong>{parts[0]}:</strong>} {parts[1] || parts[0]}
                  </span>
                </li>
              );
            })}
          </ul>

          {/* Personal signature note (Section 4) */}
          <div className="mt-4 pt-4 border-t border-sandalwood/5 bg-maroon/5 rounded-2xl p-4 border border-maroon/5 relative z-10">
            <p className="text-xs italic text-sandalwood/90 font-serif leading-relaxed mb-3">
              "{practitioner.founderNote}"
            </p>
            <div className="flex items-center gap-2.5">
              <div className="w-6.5 h-6.5 bg-maroon rounded-full flex items-center justify-center text-ivory font-serif text-[10px] font-bold uppercase italic shrink-0">
                H
              </div>
              <span className="text-[9px] font-sans font-black tracking-wider text-sandalwood uppercase">
                Personally Verified by Haarsh Shah, SETU Founder
              </span>
            </div>
          </div>
        </motion.div>

        {/* Services & Price Selection Block (Section 5) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="space-y-4"
        >
          <div className="flex items-end justify-between border-b border-sandalwood/5 pb-2">
            <h2 className="font-sans font-black text-xs uppercase tracking-[0.15em] text-sandalwood/60">
              Select Ceremony or Consult
            </h2>
            <span className="text-[10px] uppercase tracking-wider text-maroon font-bold animate-pulse">
              REQUIRED
            </span>
          </div>

          <div className="space-y-4">
            {practitioner.services.map((service) => {
              const isSelected = selectedService?.id === service.id;

              if (!isSelected) {
                return (
                  <button
                    key={service.id}
                    onClick={() => handleServiceSelect(service)}
                    className="w-full text-left p-5 sm:p-6 bg-warm-ivory/70 border border-sandalwood/10 hover:border-gold/40 rounded-2xl transition-all duration-300 cursor-pointer shadow-card-default focus:outline-none focus:ring-2 focus:ring-maroon group"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex gap-3.5 items-start">
                        {/* Custom selection radio */}
                        <div className="w-5 h-5 rounded-full border border-sandalwood/20 bg-ivory group-hover:border-maroon/50 flex items-center justify-center shrink-0 mt-0.5 transition-all duration-150">
                          <div className="w-1.5 h-1.5 bg-transparent rounded-full" />
                        </div>
                        <div>
                          {/* Service Name and Category */}
                          <h3 className="font-serif font-bold text-base sm:text-lg text-sandalwood group-hover:text-maroon transition-colors leading-snug">
                            {service.name}
                          </h3>
                          
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <span className={`text-[9px] font-sans font-bold uppercase tracking-wider px-2 py-0.5 border rounded-md ${getCategoryStyles(service.category)}`}>
                              {service.categoryEmoji} {service.category}
                            </span>
                            
                            {service.devanagariName && (
                              <span className="font-devanagari text-[10px] text-maroon bg-maroon/5 px-1.5 py-0.5 rounded-full">
                                {service.devanagariName}
                              </span>
                            )}

                            <div className="flex items-center gap-1 text-[10px] text-sandalwood/60 font-sans uppercase">
                              <Clock className="w-3.5 h-3.5 text-gold shrink-0" />
                              <span>{service.duration}</span>
                            </div>
                            
                            <span className="text-[9px] font-sans text-teal border border-teal/10 bg-teal/5 px-1.5 py-0.5 rounded">
                              {service.category === "Astrology" ? "100% Online Zoom" : "In-Person or Zoom"}
                            </span>
                          </div>

                          <p className="text-xs text-sandalwood/70 font-sans mt-3 leading-relaxed">
                            {service.description}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <span className="px-3 py-1.5 bg-sandalwood/5 border border-sandalwood/10 rounded-lg text-[9px] font-sans font-bold uppercase tracking-wider text-sandalwood hover:bg-maroon hover:text-ivory transition-colors">
                          Configure Ceremony
                        </span>
                      </div>
                    </div>
                  </button>
                );
              }

              // Selected Service: Detailed Customize Mode
              return (
                <div
                  key={service.id}
                  className="w-full text-left p-5 sm:p-6 bg-warm-ivory border-2 border-gold rounded-2xl shadow-card-hover space-y-6 animate-fadeIn"
                >
                  {/* Selected Header */}
                  <div className="flex justify-between items-start gap-4 pb-4 border-b border-sandalwood/10">
                    <div className="flex gap-3.5 items-start">
                      <div className="w-5 h-5 rounded-full border border-maroon bg-maroon text-ivory flex items-center justify-center shrink-0 mt-1 scale-105">
                        <div className="w-1.5 h-1.5 bg-ivory rounded-full" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-xs font-sans font-black uppercase tracking-wider text-gold bg-maroon/5 border border-maroon/10 px-2 py-0.5 rounded-full">
                            ✨ Active Configuration
                          </span>
                        </div>
                        <h3 className="font-serif font-bold text-lg sm:text-xl text-sandalwood leading-snug">
                          {service.name}
                        </h3>
                        
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className={`text-[9px] font-sans font-bold uppercase tracking-wider px-2 py-0.5 border rounded-md ${getCategoryStyles(service.category)}`}>
                            {service.categoryEmoji} {service.category}
                          </span>
                          {service.devanagariName && (
                            <span className="font-devanagari text-[10px] text-maroon bg-maroon/5 px-1.5 py-0.5 rounded-full">
                              {service.devanagariName}
                            </span>
                          )}
                          <div className="flex items-center gap-1 text-[10px] text-sandalwood/60 font-sans uppercase">
                            <Clock className="w-3.5 h-3.5 text-gold shrink-0" />
                            <span>{service.duration}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedService(null)}
                      className="px-2.5 py-1.5 border border-sandalwood/20 hover:border-maroon/50 rounded-lg text-[9px] font-sans font-bold uppercase tracking-wider text-sandalwood/70 hover:text-maroon transition-colors cursor-pointer"
                    >
                      Change Ceremony
                    </button>
                  </div>

                  {/* CUSTOM PREFERENCE CONTROLS */}
                  <div className="space-y-4 pt-1">
                    <h4 className="font-sans font-black text-[10px] uppercase tracking-[0.25em] text-maroon flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-gold" /> Align Custom Ceremony Preferences
                    </h4>

                    {/* Gotra & Blessing Names Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-sans font-bold uppercase tracking-wider text-sandalwood/80 block">
                          Ancestral Gotra (Gharana / Clan)
                        </label>
                        <input
                          type="text"
                          value={gotra}
                          onChange={(e) => setGotra(e.target.value)}
                          placeholder="e.g. Kashyap, Bhardwaj (Optional)"
                          className="w-full p-3 bg-ivory border border-sandalwood/15 focus:border-maroon rounded-xl font-sans text-xs focus:outline-none focus:ring-1 focus:ring-maroon text-sandalwood transition-all placeholder:text-sandalwood/30 min-h-[44px]"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-sans font-bold uppercase tracking-wider text-sandalwood/80 block">
                          Family Names for Sankalpa chants
                        </label>
                        <input
                          type="text"
                          value={familyNames}
                          onChange={(e) => setFamilyNames(e.target.value)}
                          placeholder="e.g. Ramesh, Sunita, Amit (for holy chants)"
                          className="w-full p-3 bg-ivory border border-sandalwood/15 focus:border-maroon rounded-xl font-sans text-xs focus:outline-none focus:ring-1 focus:ring-maroon text-sandalwood transition-all placeholder:text-sandalwood/30 min-h-[44px]"
                        />
                      </div>
                    </div>

                    {/* Traditional Lineage Recitation Selector */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-sandalwood/80 block flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-maroon" /> Select Traditional Lineage Recitation
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {[
                          { id: "vedic", label: "🌸 North Indian Vedic", desc: "Sanskrit chants with translation explanation." },
                          { id: "agama", label: "🔱 South Indian Agama", desc: "Vedic Dravidian Agama temple manual customs." },
                          { id: "gujarati", label: "🕊️ Western / Gujarati", desc: "Regional family vidhis and traditional lore." },
                          { id: "universal", label: "✨ Universal / Explanatory", desc: "Simplified mantras with 90% explanatory meaning." }
                        ].map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setCulture(opt.id as any)}
                            className={`p-3 text-left border rounded-xl transition-all cursor-pointer focus:outline-none ${
                              culture === opt.id
                                ? "bg-maroon/5 border-maroon text-maroon font-bold ring-1 ring-maroon/20"
                                : "bg-ivory border-sandalwood/10 text-sandalwood/80 hover:border-gold/30"
                            }`}
                          >
                            <span className="block font-sans text-xs font-bold">{opt.label}</span>
                            <span className="block text-[9px] text-sandalwood/55 mt-0.5 font-normal leading-tight">{opt.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Ceremony Attendance Mode */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-sandalwood/80 block flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-teal" /> Ceremony Attendance Venue Mode
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {[
                          { id: "in-person", label: "📍 In-Person (Home or Venue)", desc: "Shastri Ji travels to your location in full traditional attire." },
                          { id: "virtual", label: "💻 High-Definition Virtual", desc: "Interactive dual-camera stream with custom virtual altar (-$50)" }
                        ].map((opt) => {
                          const isDisabled = service.category === "Astrology" && opt.id === "in-person";
                          const isOptSelected = mode === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              disabled={isDisabled}
                              onClick={() => setMode(opt.id as any)}
                              className={`p-3 text-left border rounded-xl transition-all cursor-pointer focus:outline-none ${
                                isDisabled
                                  ? "opacity-40 cursor-not-allowed bg-sandalwood/5 border-dashed border-sandalwood/10 text-sandalwood/30"
                                  : isOptSelected
                                  ? "bg-teal/5 border-teal text-teal font-bold ring-1 ring-teal/20"
                                  : "bg-ivory border-sandalwood/10 text-sandalwood/80 hover:border-gold/30"
                              }`}
                            >
                              <span className="block font-sans text-xs font-bold">{opt.label}</span>
                              <span className="block text-[9px] text-sandalwood/55 mt-0.5 font-normal leading-tight">{opt.desc}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* e-Prasad Logistics Opt-in */}
                    <div className="p-4 bg-gold/5 border border-gold/20 rounded-xl flex items-start gap-3">
                      <input
                        id="prasad-checkbox-opt"
                        type="checkbox"
                        checked={wantsPrasad}
                        onChange={(e) => setWantsPrasad(e.target.checked)}
                        className="mt-0.5 w-4 h-4 text-maroon border-sandalwood/20 focus:ring-maroon rounded shrink-0 cursor-pointer"
                      />
                      <label htmlFor="prasad-checkbox-opt" className="select-none cursor-pointer">
                        <div className="flex items-center gap-1.5 font-sans font-bold text-xs text-sandalwood">
                          <Package className="w-4 h-4 text-gold shrink-0" />
                          <span>Opt-in for Premium Sacred e-Prasad Courier Delivery (+$25)</span>
                        </div>
                        <p className="text-[10px] text-sandalwood/70 font-sans mt-0.5 leading-relaxed">
                          We ship an energized protective sacred box containing Shastri Ji's blessed dry-fruit offering, sanctified Raksha threads, pure kumkum, and a copper Yantra directly to your doorstep.
                        </p>
                      </label>
                    </div>

                    {/* Dynamic Dakshina Guide Calculator */}
                    <div className="p-4 bg-maroon/5 border border-maroon/10 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Info className="w-4 h-4 text-maroon" />
                          <span className="text-[10px] font-sans font-black uppercase tracking-wider text-maroon">
                            Custom Dakshina Honorarium Guide
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-sandalwood/50 uppercase font-black block leading-none">RECOMMENDED GUIDE</span>
                          <span className="font-sans font-bold text-lg sm:text-xl text-sandalwood block mt-1">
                            ${getCalculatedPrice(service)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-[10px] text-sandalwood/65 leading-relaxed font-sans border-t border-sandalwood/5 pt-2">
                        <span className="font-bold">Calculated as:</span> Base offering ${service.price} 
                        {mode === "virtual" && service.category !== "Astrology" ? " - $50 (Virtual Attendance)" : ""}
                        {wantsPrasad ? " + $25 (Prasad Box Packing & Courier)" : ""}. 
                        <span className="italic"> Traditionally, spiritual honors are voluntary and support standard priest livelihoods. SETU guides a respectful baseline, with no payment taken today.</span>
                      </div>
                    </div>
                  </div>

                  {/* What is included / Family preparation cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-sandalwood/10">
                    {/* What is included */}
                    <div className="space-y-2 bg-ivory/50 p-4 border border-sandalwood/5 rounded-xl">
                      <h4 className="text-[9px] font-sans font-black uppercase tracking-wider text-maroon flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5" />
                        Provided by SETU & Priest:
                      </h4>
                      <ul className="space-y-1 text-[11px] text-sandalwood/80 font-sans">
                        {service.whatsIncluded.map((item, idx) => (
                          <li key={idx} className="flex gap-1.5 items-start">
                            <span className="w-1 h-1 bg-gold rounded-full shrink-0 mt-1.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* What family must prepare */}
                    {service.preparation && (
                      <div className="space-y-2 bg-ivory/50 p-4 border border-sandalwood/5 rounded-xl">
                        <h4 className="text-[9px] font-sans font-black uppercase tracking-wider text-teal flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-teal" />
                          Family Preparation Checklist:
                        </h4>
                        <ul className="space-y-1 text-[11px] text-sandalwood/80 font-sans">
                          {service.preparation.map((item, idx) => (
                            <li key={idx} className="flex gap-1.5 items-start">
                              <span className="w-1 h-1 bg-teal rounded-full shrink-0 mt-1.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Reliability & Protection (Section 6) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="bg-warm-ivory border border-sandalwood/10 rounded-2xl p-5 space-y-4.5 shadow-card-default"
        >
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-teal" />
            <h3 className="font-sans font-bold text-xs uppercase tracking-widest text-sandalwood">
              Reliability Guarantee & Policies
            </h3>
          </div>

          <div className="space-y-3.5 text-xs text-sandalwood/80 font-sans leading-relaxed">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="font-bold text-maroon uppercase tracking-wider text-[9px] block">No Upfront Payment</span>
                <p className="text-sandalwood/70 text-[11px]">
                  No deposit or card is taken today. You only pay off-platform via Ko-fi once your matched practitioner reviews and locks in the date.
                </p>
              </div>
              <div className="space-y-1">
                <span className="font-bold text-maroon uppercase tracking-wider text-[9px] block">72h Refund Guarantee</span>
                <p className="text-sandalwood/70 text-[11px]">
                  Cancellations made 72 hours before the ceremony receive a 100% immediate full refund. We protect your family budgets.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-sandalwood/5 flex gap-2.5 items-start">
              <AlertCircle className="w-4.5 h-4.5 text-gold shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-sandalwood uppercase tracking-wider text-[9px] block mb-0.5">Emergency Replacement Coverage</span>
                <p className="text-sandalwood/70 text-[11px]">
                  If your priest is delayed or canceled due to extreme logistics or health, SETU will immediately assign an alternative verified priest from our network or issue a <strong>full 100% reimbursement</strong>. Reach our support desk at <strong className="text-maroon">founders@setu.app</strong> at any hour.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Sticky Bottom Action Bar with Lazy Button Enablement (Section 6) */}
      <div className={`fixed bottom-0 left-0 right-0 z-40 bg-warm-ivory border-t border-sandalwood/10 py-5 px-6 transition-shadow duration-300 ${
        scrolledPastHeader ? "shadow-[0_-4px_16px_rgba(44,22,8,0.06)]" : "shadow-none"
      }`}>
        <div className="max-w-xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left w-full sm:w-auto">
            <span className="text-[9px] text-sandalwood/50 font-sans block uppercase tracking-widest font-black">
              {selectedService ? "SELECTED SERVICE" : "REQUIRED ACTION"}
            </span>
            <span className="font-serif font-bold text-sandalwood block truncate max-w-[280px] text-base">
              {selectedService ? selectedService.name : "Choose a Ceremony Above"}
            </span>
          </div>

          <button
            onClick={handleRequestClick}
            disabled={!selectedService}
            className={`w-full sm:w-auto sm:px-8 py-4 font-sans font-bold text-xs tracking-widest uppercase rounded-lg shadow-card-default transition-all duration-300 flex items-center justify-center gap-3 focus:outline-none focus:ring-2 focus:ring-gold ${
              selectedService
                ? "bg-maroon hover:bg-sandalwood text-ivory cursor-pointer hover:shadow-gold/20 hover:scale-[1.01]"
                : "bg-sandalwood/15 text-sandalwood/40 cursor-not-allowed"
            }`}
          >
            <span>{selectedService ? "Begin Sacred Introduction" : "Select Milestone Above"}</span>
            {selectedService && (
              <span className="text-gold font-bold">(${getCalculatedPrice(selectedService)} Guide)</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
