import React from "react";
import { motion } from "motion/react";
import { CheckCircle2, Calendar, Mail, ArrowRight, ShieldCheck, Home, ArrowUpRight } from "lucide-react";
import { Practitioner, Service, BookingRequest } from "../types";
import RotatingMandala from "./RotatingMandala";

interface RequestReceivedViewProps {
  practitioner: Practitioner;
  service: Service;
  bookingRequest: BookingRequest;
  onHome: () => void;
  onSimulateSecured: () => void;
}

export default function RequestReceivedView({
  practitioner,
  service,
  bookingRequest,
  onHome,
  onSimulateSecured,
}: RequestReceivedViewProps) {
  // Format selected date nicely
  const formatDate = (dateStr: string) => {
    try {
      const options: Intl.DateTimeFormatOptions = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      };
      return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", options);
    } catch {
      return dateStr;
    }
  };

  const timeLabel = {
    morning: "Morning (7:00 AM - 12:00 PM)",
    afternoon: "Afternoon (12:00 PM - 5:00 PM)",
    evening: "Evening (5:00 PM - 9:00 PM)",
  }[bookingRequest.preferredTime];

  return (
    <div className="px-6 py-12 max-w-xl mx-auto min-h-screen bg-ivory flex flex-col justify-center">
      <div className="bg-warm-ivory border border-sandalwood/10 rounded-2xl p-8 shadow-card-default text-center space-y-8 relative overflow-hidden">
        {/* Subtle decorative gold corner circle */}
        <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-gold/5" />

        {/* Beautiful high-fidelity rotating celebration mandala */}
        <div className="flex justify-center relative">
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 120,
              damping: 10,
              delay: 0.15,
            }}
            className="w-20 h-20 bg-teal/10 border border-teal/20 rounded-full flex items-center justify-center text-teal relative"
          >
            <RotatingMandala size={64} color="#1B6B5A" secondaryColor="#C4922A" speed="medium" className="absolute opacity-40" />
            <CheckCircle2 className="w-10 h-10 stroke-[2] relative z-10" />
          </motion.div>
        </div>

        {/* Text Block */}
        <div className="space-y-3">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="font-serif text-2xl sm:text-3xl font-bold text-sandalwood"
          >
            Your Request Is In
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45, duration: 0.4 }}
            className="text-sm text-sandalwood/80 font-sans max-w-sm mx-auto leading-relaxed"
          >
            Thank you, <strong className="text-sandalwood font-bold">{bookingRequest.name}</strong>. {practitioner.name}'s team will review your request and confirm exact details within 24 hours.
          </motion.p>
        </div>

        {/* Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="bg-ivory border border-sandalwood/10 rounded-2xl p-5 text-left space-y-3 shadow-card-default"
        >
          <div className="border-b border-sandalwood/10 pb-2">
            <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-gold block">
              Requested Ritual & Practitioner
            </span>
            <h4 className="font-serif font-bold text-base text-sandalwood mt-0.5">
              {service.name}
            </h4>
            <p className="text-xs text-sandalwood/70 font-sans">
              With {practitioner.name}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans">
            <div>
              <span className="text-sandalwood/60 block font-bold uppercase tracking-wide text-[9px] mb-0.5">Preferred Date:</span>
              <span className="text-sandalwood font-semibold">{formatDate(bookingRequest.preferredDate)}</span>
            </div>
            {bookingRequest.alternativeDate && (
              <div>
                <span className="text-sandalwood/60 block font-bold uppercase tracking-wide text-[9px] mb-0.5">Alternative Date:</span>
                <span className="text-teal font-semibold">{formatDate(bookingRequest.alternativeDate)}</span>
              </div>
            )}
            <div>
              <span className="text-sandalwood/60 block font-bold uppercase tracking-wide text-[9px] mb-0.5">Preferred Time Window:</span>
              <span className="text-sandalwood font-semibold">{timeLabel}</span>
            </div>
            
            {bookingRequest.birthDate && (
              <div className="sm:col-span-2 pt-2 border-t border-sandalwood/5">
                <span className="text-teal block font-bold uppercase tracking-wide text-[9px] mb-1">Astrological Birth Details:</span>
                <span className="text-sandalwood font-medium block text-xs bg-gold/5 border border-gold/10 p-2.5 rounded-lg leading-relaxed">
                  Born {formatDate(bookingRequest.birthDate)} at <strong>{bookingRequest.birthTime}</strong> in <strong>{bookingRequest.birthPlace}</strong>
                </span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Next Steps Explanation List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.75, duration: 0.4 }}
          className="text-left bg-maroon/5 p-5 rounded-2xl border border-maroon/5 space-y-3"
        >
          <h4 className="text-[11px] font-sans font-bold uppercase tracking-widest text-maroon">
            What Happens Next?
          </h4>
          <ul className="space-y-3 text-xs text-sandalwood font-sans">
            <li className="flex gap-2 items-start">
              <span className="w-5 h-5 rounded-full bg-maroon/5 border border-maroon/10 flex items-center justify-center shrink-0 font-bold text-maroon text-[10px]">
                1
              </span>
              <p className="leading-relaxed">
                <strong>Email Confirmation:</strong> We'll email your reservation confirmation to <strong className="text-maroon">{bookingRequest.email}</strong> within 24 hours.
              </p>
            </li>
            <li className="flex gap-2 items-start">
              <span className="w-5 h-5 rounded-full bg-maroon/5 border border-maroon/10 flex items-center justify-center shrink-0 font-bold text-maroon text-[10px]">
                2
              </span>
              <p className="leading-relaxed">
                <strong>Secure Payment:</strong> The email will contain a custom secure payment link. You will fulfill the payment off-platform via Ko-fi to lock in the reservation. <strong>No payment is taken today.</strong>
              </p>
            </li>
          </ul>
        </motion.div>

        {/* Bottom Actions */}
        <div className="space-y-4 pt-2">
          {/* Real return home button */}
          <button
            onClick={onHome}
            className="w-full py-4 bg-warm-ivory border border-sandalwood/10 hover:border-gold text-sandalwood font-sans font-bold text-xs tracking-[0.25em] uppercase rounded-lg shadow-card-default hover:shadow-card-hover transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-maroon"
          >
            <Home className="w-4 h-4" />
            Return to Home
          </button>

          {/* Demonstration Only: Transition trigger to simulated outcome */}
          <div className="border-t border-sandalwood/10 pt-4 text-center">
            <p className="text-[9px] font-sans font-bold text-sandalwood/50 uppercase tracking-widest mb-1.5">
              For Prototype Presentation Only
            </p>
            <button
              onClick={onSimulateSecured}
              className="inline-flex items-center gap-1.5 text-xs text-gold hover:text-maroon font-sans font-bold uppercase tracking-wider underline underline-offset-4 cursor-pointer focus:outline-none"
            >
              Simulate Email Payment & Secure Booking
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
