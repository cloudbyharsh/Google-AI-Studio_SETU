import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ShieldCheck, Mail, HelpCircle, PhoneCall, AlertTriangle, BadgeAlert, FileCheck, CheckCircle2 } from "lucide-react";
import RotatingMandala from "./RotatingMandala";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VerificationModal({ isOpen, onClose }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-sandalwood/80 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 15 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="bg-warm-ivory border border-sandalwood/10 rounded-2xl w-full max-w-lg p-6 sm:p-8 shadow-card-hover relative z-10 overflow-y-auto max-h-[90vh]"
          >
            {/* Background Accent */}
            <div className="absolute -top-16 -right-16 opacity-[0.04] pointer-events-none">
              <RotatingMandala size={200} color="#1B6B5A" secondaryColor="#C4922A" speed="slow" />
            </div>

            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-sandalwood/60 hover:text-maroon p-1.5 rounded-full hover:bg-ivory transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-6">
              <div className="text-center space-y-2 mt-2">
                <div className="w-12 h-12 bg-teal/10 border border-teal/20 rounded-full flex items-center justify-center mx-auto text-teal">
                  <ShieldCheck className="w-6 h-6 stroke-[2]" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-sandalwood">
                  The SETU Verification System
                </h3>
                <p className="text-xs text-sandalwood/70 font-sans max-w-sm mx-auto">
                  A badge alone isn't evidence. Here is exactly how we review, vet, and verify every spiritual practitioner on our platform.
                </p>
              </div>

              {/* Four pillars of verification */}
              <div className="space-y-4">
                <div className="flex gap-3.5 items-start">
                  <span className="w-6 h-6 rounded-full bg-maroon/10 text-maroon font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">1</span>
                  <div>
                    <h4 className="text-xs font-sans font-bold text-sandalwood uppercase tracking-wider">Academic & Tradition Vetting</h4>
                    <p className="text-xs text-sandalwood/70 font-sans leading-relaxed mt-1">
                      We verify academic degrees from traditional Sanskrit universities (such as Varanasi Sanskrit Vishwavidyalaya or Madras Sanskrit College) or formal lineage-based (Sampradaya) guru-shishya initiation certificates.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3.5 items-start">
                  <span className="w-6 h-6 rounded-full bg-maroon/10 text-maroon font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">2</span>
                  <div>
                    <h4 className="text-xs font-sans font-bold text-sandalwood uppercase tracking-wider">Independent Reference Checks</h4>
                    <p className="text-xs text-sandalwood/70 font-sans leading-relaxed mt-1">
                      We conduct rigorous reference calls with at least 3 families who have previously engaged the practitioner for major milestone rituals (such as weddings, thread ceremonies, or home-blessings) to verify punctuality, attitude, and traditional standards.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3.5 items-start">
                  <span className="w-6 h-6 rounded-full bg-maroon/10 text-maroon font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">3</span>
                  <div>
                    <h4 className="text-xs font-sans font-bold text-sandalwood uppercase tracking-wider">SETU Founder Deep-Dive Interview</h4>
                    <p className="text-xs text-sandalwood/70 font-sans leading-relaxed mt-1">
                      Our founder, Haarsh Shah, conducts a personal structured interview to test linguistic clarity in English, verify cultural empathy, and ensure the practitioner is capable of explaining complex Sanskrit rituals to second-generation families.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3.5 items-start">
                  <span className="w-6 h-6 rounded-full bg-maroon/10 text-maroon font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">4</span>
                  <div>
                    <h4 className="text-xs font-sans font-bold text-sandalwood uppercase tracking-wider">Ethical Code of Conduct</h4>
                    <p className="text-xs text-sandalwood/70 font-sans leading-relaxed mt-1">
                      All practitioners sign our strict ethical charter: flat-rate pricing (strictly no surprise fees or post-ritual upselling), absolute respect for family boundaries, and completely non-judgmental, empathy-first pastoral care.
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Reassurance Banner */}
              <div className="bg-teal/5 border border-teal/10 rounded-2xl p-4 text-center">
                <span className="text-[10px] font-sans font-bold text-teal uppercase tracking-widest block mb-1">
                  Re-Verification Schedule
                </span>
                <p className="text-[11px] text-sandalwood/80 font-sans leading-relaxed">
                  Credentials, references, and codes of conduct are re-audited **every 12 months** to ensure unyielding community safety, reliability, and spiritual dignity.
                </p>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3.5 bg-sandalwood hover:bg-maroon text-ivory font-sans font-bold text-xs tracking-widest uppercase rounded-lg shadow-card-default hover:shadow-card-hover transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-gold"
              >
                Understood, Thank You
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function HelpModal({ isOpen, onClose }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-sandalwood/80 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 15 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="bg-warm-ivory border border-sandalwood/10 rounded-2xl w-full max-w-lg p-6 sm:p-8 shadow-card-hover relative z-10 overflow-y-auto max-h-[90vh]"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-sandalwood/60 hover:text-maroon p-1.5 rounded-full hover:bg-ivory transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-6">
              <div className="text-center space-y-2 mt-2">
                <div className="w-12 h-12 bg-gold/15 rounded-full flex items-center justify-center mx-auto text-maroon">
                  <HelpCircle className="w-6 h-6 stroke-[2]" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-sandalwood">
                  Help & Trust Policies
                </h3>
                <p className="text-xs text-sandalwood/70 font-sans max-w-sm mx-auto">
                  Spiritual milestones are high-stakes. We take operational reliability extremely seriously. Here is what we guarantee.
                </p>
              </div>

              {/* Policies list */}
              <div className="space-y-4 text-left">
                <div className="p-4 bg-maroon/5 border border-maroon/5 rounded-2xl space-y-2">
                  <h4 className="text-xs font-sans font-bold text-maroon uppercase tracking-wider flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-maroon" />
                    What if my practitioner is unavailable?
                  </h4>
                  <p className="text-xs text-sandalwood/80 font-sans leading-relaxed">
                    If your matched practitioner cancels or faces an emergency, SETU will immediately assign an equally qualified, vetted alternative within our network or issue a <strong>100% full refund</strong>. We never leave you stranded.
                  </p>
                </div>

                <div className="p-4 bg-teal/5 border border-teal/5 rounded-2xl space-y-2">
                  <h4 className="text-xs font-sans font-bold text-teal uppercase tracking-wider flex items-center gap-2">
                    <FileCheck className="w-4 h-4 shrink-0 text-teal" />
                    How do payments and cancellations work?
                  </h4>
                  <p className="text-xs text-sandalwood/80 font-sans leading-relaxed">
                    You only pay after the practitioner accepts your requested date. Payments are fulfilled securely off-platform via Ko-fi to support the creator directly. Cancellations requested at least <strong>72 hours in advance</strong> receive a full, hassle-free refund.
                  </p>
                </div>

                <div className="p-4 bg-gold/5 border border-gold/10 rounded-2xl space-y-2">
                  <h4 className="text-xs font-sans font-bold text-sandalwood uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-gold" />
                    Our No-Fear Guarantee
                  </h4>
                  <p className="text-xs text-sandalwood/80 font-sans leading-relaxed">
                    Our astrologers are vetted to provide optimistic, practical, and highly empathetic life counseling. We strictly prohibit fatalistic, alarmist, or fear-inducing predictions that pressure families into expensive remedies.
                  </p>
                </div>
              </div>

              {/* Directly Contact Founders */}
              <div className="border-t border-sandalwood/10 pt-4 text-center space-y-2">
                <p className="text-xs text-sandalwood/60 font-sans">
                  Have an urgent question or specific ritual request?
                </p>
                <a
                  href="mailto:founders@setu.app"
                  className="inline-flex items-center gap-2 text-xs font-bold text-maroon hover:text-gold uppercase tracking-wider underline underline-offset-4 focus:outline-none focus:ring-1 focus:ring-maroon p-1 rounded"
                >
                  <Mail className="w-4 h-4" />
                  Email Founder: founders@setu.app
                </a>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3.5 bg-sandalwood hover:bg-maroon text-ivory font-sans font-bold text-xs tracking-widest uppercase rounded-lg shadow-card-default hover:shadow-card-hover transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-gold"
              >
                Close Policies
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
