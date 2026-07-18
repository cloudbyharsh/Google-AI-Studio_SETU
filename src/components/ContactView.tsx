import React, { useState } from "react";
import { motion } from "motion/react";
import { Send, CheckCircle2, Phone, Mail, MapPin, Sparkles } from "lucide-react";
import RotatingMandala from "./RotatingMandala";
import { analytics } from "../lib/analytics";

interface ContactViewProps {
  onBackToHome: () => void;
}

export default function ContactView({ onBackToHome }: ContactViewProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const tempErrors: Record<string, string> = {};
    if (!name.trim()) tempErrors.name = "Name is required.";
    if (!email.trim()) {
      tempErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = "Please enter a valid email address.";
    }
    if (!subject.trim()) tempErrors.subject = "Subject is required.";
    if (!message.trim()) tempErrors.message = "Message is required.";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    
    // Log contact submission to centralized analytics
    analytics.track("contact_form_submitted", {
      name,
      email,
      phone: phone || undefined,
      subject,
      character_count: message.length,
    });

    // Simulate server request
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      
      // Store in simple localStorage "CRM" log
      try {
        const existingLeads = JSON.parse(localStorage.getItem("setu_contact_leads") || "[]");
        existingLeads.push({
          id: `contact-${Date.now()}`,
          name,
          email,
          phone,
          subject,
          message,
          submittedAt: new Date().toISOString(),
        });
        localStorage.setItem("setu_contact_leads", JSON.stringify(existingLeads));
      } catch (err) {
        console.error("Failed to save contact lead:", err);
      }
    }, 1200);
  };

  return (
    <div className="px-4 sm:px-6 py-12 max-w-2xl mx-auto relative min-h-[75vh] flex flex-col justify-center">
      {/* Sacred geometry background accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none z-0">
        <RotatingMandala size={500} color="#610000" secondaryColor="#C4922A" speed="slow" />
      </div>

      <div className="relative z-10 space-y-8">
        {/* Navigation & Header */}
        <div className="text-center space-y-3">
          <span className="text-[10px] uppercase tracking-[0.3em] font-sans font-black text-gold bg-maroon/5 border border-maroon/10 px-3 py-1.5 rounded-full inline-block">
            Support & Inquiry
          </span>
          <h1 className="font-serif text-3xl sm:text-4.5xl font-bold text-sandalwood leading-tight">
            Connect With <span className="italic font-brand font-light text-maroon">SETU</span> Support
          </h1>
          <p className="text-sm text-sandalwood/75 max-w-lg mx-auto leading-relaxed">
            Have questions about our verification standards, priest lineages, or custom ritual schedules? Contact us directly and our team will assist you within 24 hours.
          </p>
        </div>

        {isSubmitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 sm:p-10 bg-warm-ivory border border-teal/20 rounded-2xl shadow-card-default text-center space-y-6"
          >
            <div className="w-16 h-16 bg-teal/10 rounded-full flex items-center justify-center mx-auto text-teal">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h3 className="font-serif text-2xl font-bold text-sandalwood">
                Inquiry Received Successfully
              </h3>
              <p className="text-sm text-sandalwood/75 max-w-md mx-auto leading-relaxed">
                Thank you, <strong className="text-maroon font-bold">{name}</strong>. Your message regarding <span className="italic font-semibold text-sandalwood">"{subject}"</span> has been logged securely in our support queue. A verified representative will reach out to you at <span className="font-semibold">{email}</span> shortly.
              </p>
            </div>
            <div className="pt-4 border-t border-sandalwood/10 max-w-sm mx-auto flex flex-col gap-2">
              <button
                onClick={onBackToHome}
                className="w-full py-3.5 bg-maroon hover:bg-sandalwood text-ivory font-sans font-bold text-xs tracking-[0.2em] uppercase rounded-xl shadow-card-default transition-all duration-300 cursor-pointer"
              >
                Back to Homepage
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left sidebar: Direct Contacts */}
            <div className="md:col-span-1 space-y-4">
              <div className="p-5 bg-warm-ivory border border-sandalwood/10 rounded-2xl space-y-4 shadow-sm text-left">
                <h4 className="font-sans font-black text-xs uppercase tracking-widest text-maroon flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-gold" /> Direct lines
                </h4>
                
                <div className="space-y-3">
                  <div className="flex gap-2.5 items-start text-xs">
                    <Mail className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-sandalwood block font-bold">Email</strong>
                      <span className="text-sandalwood/70">support@setutrust.org</span>
                    </div>
                  </div>

                  <div className="flex gap-2.5 items-start text-xs">
                    <Phone className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-sandalwood block font-bold">Phone Support</strong>
                      <span className="text-sandalwood/70">+1 (800) 555-SETU</span>
                    </div>
                  </div>

                  <div className="flex gap-2.5 items-start text-xs">
                    <MapPin className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-sandalwood block font-bold">Headquarters</strong>
                      <span className="text-sandalwood/70">Toronto, ON, Canada</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-maroon/5 border border-maroon/10 rounded-2xl text-left">
                <p className="text-[11px] text-sandalwood/75 leading-relaxed">
                  <strong>Founder Promise:</strong> No marketing newsletters or spam. We respect the sacred privacy of your coordinates and contact details completely.
                </p>
              </div>
            </div>

            {/* Right Form */}
            <form
              onSubmit={handleSubmit}
              className="md:col-span-2 p-6 sm:p-8 bg-warm-ivory border border-sandalwood/10 rounded-2xl shadow-card-default text-left space-y-5"
            >
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-sans font-bold uppercase tracking-wider text-sandalwood/80 block">
                  Full Name <span className="text-maroon font-black">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors(prev => ({ ...prev, name: "" }));
                  }}
                  className={`w-full bg-ivory border ${
                    errors.name ? "border-maroon/60 ring-1 ring-maroon/20" : "border-sandalwood/20 focus:border-maroon"
                  } rounded-xl px-4 py-3 text-xs text-sandalwood font-sans focus:outline-none transition-all`}
                  placeholder="e.g. Haarsh Shah"
                />
                {errors.name && <span className="text-[10px] text-maroon font-bold block">{errors.name}</span>}
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-sans font-bold uppercase tracking-wider text-sandalwood/80 block">
                    Email Address <span className="text-maroon font-black">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors(prev => ({ ...prev, email: "" }));
                    }}
                    className={`w-full bg-ivory border ${
                      errors.email ? "border-maroon/60 ring-1 ring-maroon/20" : "border-sandalwood/20 focus:border-maroon"
                    } rounded-xl px-4 py-3 text-xs text-sandalwood font-sans focus:outline-none transition-all`}
                    placeholder="e.g. name@example.com"
                  />
                  {errors.email && <span className="text-[10px] text-maroon font-bold block">{errors.email}</span>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-sans font-bold uppercase tracking-wider text-sandalwood/80 block">
                    Phone Number <span className="text-sandalwood/40 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-ivory border border-sandalwood/20 focus:border-maroon rounded-xl px-4 py-3 text-xs text-sandalwood font-sans focus:outline-none transition-all"
                    placeholder="e.g. +1 (123) 456-7890"
                  />
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-sans font-bold uppercase tracking-wider text-sandalwood/80 block">
                  Subject <span className="text-maroon font-black">*</span>
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => {
                    setSubject(e.target.value);
                    if (errors.subject) setErrors(prev => ({ ...prev, subject: "" }));
                  }}
                  className={`w-full bg-ivory border ${
                    errors.subject ? "border-maroon/60 ring-1 ring-maroon/20" : "border-sandalwood/20 focus:border-maroon"
                  } rounded-xl px-4 py-3 text-xs text-sandalwood font-sans focus:outline-none transition-all`}
                  placeholder="e.g. Verification Inquiry, Custom Puja, Astrological Remedies"
                />
                {errors.subject && <span className="text-[10px] text-maroon font-bold block">{errors.subject}</span>}
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-sans font-bold uppercase tracking-wider text-sandalwood/80 block">
                  Your Message <span className="text-maroon font-black">*</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    if (errors.message) setErrors(prev => ({ ...prev, message: "" }));
                  }}
                  rows={4}
                  className={`w-full bg-ivory border ${
                    errors.message ? "border-maroon/60 ring-1 ring-maroon/20" : "border-sandalwood/20 focus:border-maroon"
                  } rounded-xl px-4 py-3 text-xs text-sandalwood font-sans focus:outline-none transition-all resize-none`}
                  placeholder="Write your inquiry here..."
                />
                {errors.message && <span className="text-[10px] text-maroon font-bold block">{errors.message}</span>}
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-maroon hover:bg-sandalwood text-ivory font-sans font-bold text-xs tracking-[0.2em] uppercase rounded-xl shadow-card-default hover:shadow-card-hover hover:scale-[1.01] transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Submitting Inquiry...</span>
                ) : (
                  <>
                    <span>Send Message</span>
                    <Send className="w-3.5 h-3.5 text-gold" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
