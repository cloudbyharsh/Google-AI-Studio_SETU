import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Sparkles, Compass, CheckCircle2, MapPin, Calendar, Clock, ExternalLink } from "lucide-react";
import RotatingMandala from "./RotatingMandala";

interface KundliModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KundliModal({ isOpen, onClose }: KundliModalProps) {
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

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 15 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="bg-warm-ivory border border-sandalwood/10 rounded-2xl w-full max-w-md p-6 shadow-card-hover relative z-10 overflow-hidden"
          >
            {/* Elegant rotating sacred geometry background mandala accent */}
            <div className="absolute -top-12 -left-12 opacity-[0.05] pointer-events-none">
              <RotatingMandala size={160} color="#610000" secondaryColor="#C4922A" speed="slow" />
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-sandalwood/60 hover:text-maroon p-1.5 rounded-full hover:bg-ivory transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-maroon"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="text-center pb-4 border-b border-sandalwood/10 space-y-2 mt-4 relative z-10">
              <div className="w-12 h-12 bg-gold/15 rounded-full flex items-center justify-center mx-auto text-gold">
                <Sparkles className="w-6 h-6 animate-pulse text-maroon" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-sandalwood">
                Free AI Kundli Report
              </h3>
              <p className="text-xs text-sandalwood/70 font-sans max-w-xs mx-auto leading-relaxed">
                Explore your planetary charts and cosmic blueprint instantly via our live standalone tool.
              </p>
            </div>

            {/* Modal Body: Conceptual Highlights */}
            <div className="py-5 space-y-4 relative z-10">
              <div className="space-y-3">
                <div className="flex gap-3 items-start text-sm">
                  <CheckCircle2 className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-sandalwood font-bold block">Vedic Accuracy:</strong>
                    <span className="text-sandalwood/70 text-xs">Uses traditional astrological mathematics to generate detailed Lagna, Rasi, and Navamsha charts.</span>
                  </div>
                </div>

                <div className="flex gap-3 items-start text-sm">
                  <CheckCircle2 className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-sandalwood font-bold block">Empathetic AI Summary:</strong>
                    <span className="text-sandalwood/70 text-xs">Provides clear, jargon-free explanations of your primary planetary aspects, planetary Dashas, and career pathways.</span>
                  </div>
                </div>

                <div className="flex gap-3 items-start text-sm">
                  <CheckCircle2 className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-sandalwood font-bold block">No-Fear Guidance:</strong>
                    <span className="text-sandalwood/70 text-xs">Guarantees a constructive outlook focused on practical self-awareness remedies without fear-mongering.</span>
                  </div>
                </div>
              </div>

              {/* Informative Note */}
              <div className="p-4 bg-maroon/5 rounded-2xl border border-maroon/5">
                <p className="text-xs text-sandalwood/80 font-sans leading-relaxed text-center">
                  Once generated, you can share your chart directly with our verified astrologers (like Smt. Meenakshi Iyer) for a deep-dive marriage, health, or career alignment consultation.
                </p>
              </div>
            </div>

            {/* External Action Button */}
            <a
              href="https://setu-kundli-demo.web.app" // Simulated live URL
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="w-full py-3.5 bg-sandalwood hover:bg-maroon text-ivory font-sans font-bold text-xs tracking-[0.25em] uppercase rounded-lg shadow-card-default hover:shadow-card-hover transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-gold"
            >
              <span>Get My Free Kundli Report</span>
              <ExternalLink className="w-4 h-4 text-gold" />
            </a>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
