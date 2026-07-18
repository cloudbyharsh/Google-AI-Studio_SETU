import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ShieldCheck,
  MailCheck,
  Calendar,
  Clock,
  Sparkles,
  Home,
  FileCheck,
  ArrowRight,
  RefreshCw,
  XCircle,
  Ban,
  AlertCircle,
  RotateCcw,
  CheckCircle2,
  HelpCircle,
  DollarSign
} from "lucide-react";
import { Practitioner, Service, BookingRequest } from "../types";
import RotatingMandala from "./RotatingMandala";

interface BookingSecuredViewProps {
  practitioner: Practitioner;
  service: Service;
  bookingRequest: BookingRequest;
  onHome: () => void;
}

export default function BookingSecuredView({
  practitioner,
  service,
  bookingRequest,
  onHome,
}: BookingSecuredViewProps) {
  // Local state machine for simulation
  const [currentStatus, setCurrentStatus] = useState<BookingRequest["status"]>("Practitioner confirmation pending");
  const [refundStatusStep, setRefundStatusStep] = useState<string>("");
  const [isSimulating, setIsSimulating] = useState(false);

  // Time zone conversion helper
  const convertETToLocal = (dateStr: string, etTime: string) => {
    if (!dateStr || !etTime) return "Preferred Time Window";
    const match = etTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return etTime;

    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const ampm = match[3].toUpperCase();

    if (ampm === "PM" && hours < 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;

    try {
      const pad = (num: number) => String(num).padStart(2, "0");
      const parsedDate = new Date(dateStr);
      const isJuly = parsedDate.getMonth() >= 2 && parsedDate.getMonth() <= 10;
      const offset = isJuly ? "-04:00" : "-05:00";
      
      const absoluteDate = new Date(`${dateStr}T${pad(hours)}:${pad(minutes)}:00${offset}`);
      
      const localFormatted = absoluteDate.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
      });

      const tzName = absoluteDate.toLocaleDateString([], {
        timeZoneName: "short"
      }).split(", ").pop() || "";

      return `${localFormatted} ${tzName}`;
    } catch {
      return etTime;
    }
  };

  // Nice date formatter
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

  // State colors and info helper
  const getStatusMeta = (status: BookingRequest["status"]) => {
    switch (status) {
      case "Practitioner confirmation pending":
        return {
          title: "Confirmation Pending",
          color: "text-amber-600 bg-amber-500/10 border-amber-500/20",
          desc: "Your hold deposit is secured. The practitioner is reviewing your ancestral and birth coordinates to verify readiness.",
          badge: "bg-amber-100 text-amber-800"
        };
      case "Confirmed":
        return {
          title: "Booking Confirmed",
          color: "text-teal bg-teal/10 border-teal/20",
          desc: "The priest has formally accepted your request. Your private digital link or travel itinerary is finalized.",
          badge: "bg-emerald-100 text-emerald-800"
        };
      case "Practitioner declined":
        return {
          title: "Practitioner Declined",
          color: "text-red-600 bg-red-500/10 border-red-500/20",
          desc: "The practitioner declined due to scheduling constraints. Auto-reimbursement protocol activated.",
          badge: "bg-rose-100 text-rose-800"
        };
      case "User cancelled":
        return {
          title: "Cancelled by User",
          color: "text-neutral-600 bg-neutral-100 border-neutral-200",
          desc: "You cancelled this booking. Rest assured, your holding deposit is being securely refunded.",
          badge: "bg-gray-100 text-gray-800"
        };
      case "Practitioner cancelled":
        return {
          title: "Cancelled by Priest",
          color: "text-red-700 bg-red-100 border-red-200",
          desc: "The priest had an emergency overlap and cancelled. Refund initiated instantly.",
          badge: "bg-red-100 text-red-800"
        };
      case "Refund initiated":
        return {
          title: "Refund In Progress",
          color: "text-blue-600 bg-blue-500/10 border-blue-500/20",
          desc: "Escrow funds released. SETU server is securely verifying the deposit return with your credit card bank.",
          badge: "bg-blue-100 text-blue-800"
        };
      case "Refund completed":
        return {
          title: "Refund Fully Settled",
          color: "text-indigo-600 bg-indigo-500/10 border-indigo-500/20",
          desc: "100% of your hold deposit has been refunded back to your card. Verification receipt sent to your email.",
          badge: "bg-indigo-100 text-indigo-800"
        };
      default:
        return {
          title: "Secured Escrow",
          color: "text-gold bg-gold/15 border-gold/30",
          desc: "Deposit secured under SETU's flat-rate escrow guarantee.",
          badge: "bg-amber-100 text-amber-800"
        };
    }
  };

  const currentMeta = getStatusMeta(currentStatus);

  // Triggering simulated transitions
  const runStateTransition = async (targetState: "Confirmed" | "Practitioner declined" | "User cancelled" | "Practitioner cancelled") => {
    if (isSimulating) return;
    setIsSimulating(true);

    if (targetState === "Confirmed") {
      setCurrentStatus("Confirmed");
      setIsSimulating(false);
    } else {
      // All failure states trigger the refund lifecycle: TargetState -> Refund initiated -> Refund completed
      setCurrentStatus(targetState);
      
      // Step 1: Wait 1.5 seconds, then go to Refund Initiated
      setTimeout(() => {
        setCurrentStatus("Refund initiated");
        setRefundStatusStep("Clearing escrow hold with banking gateway...");
        
        // Step 2: Wait 2 seconds, then complete refund
        setTimeout(() => {
          setCurrentStatus("Refund completed");
          setRefundStatusStep("Success! Funds deposited back to the user's card.");
          setIsSimulating(false);
        }, 2000);
      }, 1500);
    }
  };

  const handleResetSimulation = () => {
    setCurrentStatus("Practitioner confirmation pending");
    setRefundStatusStep("");
    setIsSimulating(false);
  };

  return (
    <div className="px-4 sm:px-6 py-10 max-w-xl mx-auto min-h-screen bg-ivory flex flex-col justify-start space-y-8 pb-20">
      
      {/* Simulation Banner Accent */}
      <div className="p-4 bg-gold/10 rounded-2xl border border-gold/20 shadow-card-default text-left">
        <span className="text-[9px] font-sans font-bold text-sandalwood/70 uppercase tracking-widest block">
          Simulated Post-Payment Lifecycle
        </span>
        <p className="text-[11px] text-sandalwood font-sans mt-1 leading-relaxed">
          SETU coordinates sacred tradition with modern booking compliance. Follow the active state changes as escrow releases automatically if scheduling conditions shift.
        </p>
      </div>

      {/* Main Status Showcase */}
      <div className="bg-warm-ivory border border-sandalwood/10 rounded-2xl p-6 sm:p-8 shadow-card-default text-center space-y-6 relative overflow-hidden">
        
        {/* State Animation */}
        <div className="flex justify-center relative">
          <motion.div
            key={currentStatus}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 bg-gold/15 border border-gold/30 rounded-full flex items-center justify-center text-gold relative"
          >
            <RotatingMandala size={64} color="#C4922A" secondaryColor="#610000" speed={isSimulating ? "fast" : "medium"} className="absolute opacity-40" />
            <MailCheck className="w-10 h-10 stroke-[2] relative z-10 text-maroon" />
          </motion.div>
        </div>

        {/* Live Status Badge */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-sans font-bold tracking-wide border uppercase bg-ivory shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-maroon animate-pulse" />
            <span>Live Status:</span>
            <span className={`px-2 py-0.5 rounded-md text-[10px] ${currentMeta.badge}`}>
              {currentStatus}
            </span>
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-sandalwood">
            {currentMeta.title}
          </h1>
          <p className="text-xs sm:text-sm text-sandalwood/80 font-sans max-w-md mx-auto leading-relaxed">
            {currentMeta.desc}
          </p>
        </div>

        {/* Progress Tracker Horizontal Stepper */}
        <div className="pt-2 border-t border-b border-sandalwood/5 py-4">
          <h4 className="text-[9px] font-sans font-bold uppercase tracking-wider text-sandalwood/50 text-left mb-3">
            Secure Escrow Timeline
          </h4>
          <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-sans">
            
            {/* Step 1: Deposit Secured */}
            <div className="space-y-1">
              <div className="h-2 rounded bg-teal" />
              <span className="font-bold text-teal block">1. Hold Deposit Paid</span>
              <span className="text-[9px] text-sandalwood/50">Simulated secure escrow</span>
            </div>

            {/* Step 2: Priest Review */}
            <div className="space-y-1">
              <div className={`h-2 rounded transition-colors duration-300 ${
                currentStatus === "Confirmed"
                  ? "bg-teal"
                  : currentStatus.includes("cancelled") || currentStatus.includes("declined") || currentStatus.includes("Refund")
                  ? "bg-red-500"
                  : "bg-amber-400 animate-pulse"
              }`} />
              <span className={`font-bold block ${
                currentStatus === "Confirmed"
                  ? "text-teal"
                  : currentStatus.includes("cancelled") || currentStatus.includes("declined") || currentStatus.includes("Refund")
                  ? "text-red-500"
                  : "text-amber-500"
              }`}>
                {currentStatus === "Confirmed" ? "2. Approved" : currentStatus.includes("cancelled") || currentStatus.includes("declined") || currentStatus.includes("Refund") ? "2. Cancelled/Declined" : "2. Priest Review"}
              </span>
              <span className="text-[9px] text-sandalwood/50">Ancestral verification</span>
            </div>

            {/* Step 3: Ceremony / Refund */}
            <div className="space-y-1">
              <div className={`h-2 rounded transition-colors duration-300 ${
                currentStatus === "Confirmed"
                  ? "bg-teal/30"
                  : currentStatus === "Refund completed"
                  ? "bg-indigo-600"
                  : currentStatus === "Refund initiated"
                  ? "bg-blue-400 animate-pulse"
                  : "bg-sandalwood/10"
              }`} />
              <span className={`font-bold block ${
                currentStatus === "Confirmed"
                  ? "text-teal/70"
                  : currentStatus === "Refund completed"
                  ? "text-indigo-600"
                  : currentStatus === "Refund initiated"
                  ? "text-blue-500"
                  : "text-sandalwood/30"
              }`}>
                {currentStatus === "Confirmed" ? "3. Ritual Fulfilling" : currentStatus.includes("Refund") ? "3. Refund Settled" : "3. Complete"}
              </span>
              <span className="text-[9px] text-sandalwood/50">Escrow released</span>
            </div>

          </div>

          {/* Refund process sub-text helper */}
          {refundStatusStep && (
            <div className="mt-3.5 p-2 bg-blue-50 border border-blue-100 rounded-lg text-left text-[10px] text-blue-700 font-mono flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>{refundStatusStep}</span>
            </div>
          )}
        </div>

        {/* Live Ticket details summary */}
        <div className="border border-sandalwood/10 rounded-2xl overflow-hidden bg-ivory/50 shadow-card-default text-left">
          {/* Ticket Header */}
          <div className="bg-maroon px-5 py-4 text-ivory flex justify-between items-center">
            <div>
              <span className="text-[9px] font-sans font-bold uppercase tracking-widest text-gold block">
                Official Booking Slip
              </span>
              <h3 className="font-serif font-bold text-base mt-0.5">
                {service.name}
              </h3>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-sans font-medium text-ivory/80 block">
                Booking ID
              </span>
              <span className="text-xs font-mono font-bold text-gold block mt-0.5">
                {bookingRequest.id.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Ticket Body */}
          <div className="p-5 space-y-4">
            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 rounded-full border border-gold/20 overflow-hidden bg-warm-ivory shrink-0">
                <img
                  src={practitioner.photo}
                  alt={practitioner.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <span className="text-[9px] font-sans font-bold uppercase tracking-widest text-sandalwood/60">
                  Assigned Traditional priest
                </span>
                <h4 className="font-serif font-bold text-base text-sandalwood flex items-center gap-2">
                  <span>{practitioner.name}</span>
                </h4>
                <p className="text-xs text-sandalwood/70 font-sans">
                  {practitioner.tradition}
                </p>
              </div>
            </div>

            <div className="border-t border-b border-sandalwood/10 py-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans">
              <div>
                <span className="text-sandalwood/60 block font-bold uppercase tracking-wider text-[9px]">Requested Date:</span>
                <span className="text-sandalwood font-bold text-sm block mt-0.5">{formatDate(bookingRequest.preferredDate)}</span>
              </div>
              <div>
                <span className="text-sandalwood/60 block font-bold uppercase tracking-wider text-[9px]">Local Device Time:</span>
                <span className="text-teal font-black text-xs block mt-0.5">
                  {convertETToLocal(bookingRequest.preferredDate, bookingRequest.selectedTimeSlot || "12:00 PM")}
                </span>
                <span className="text-[9px] text-sandalwood/50 block italic">({bookingRequest.selectedTimeSlot || "12:00 PM"} priest's time)</span>
              </div>
            </div>

            {bookingRequest.birthDate && (
              <div className="border-b border-sandalwood/10 pb-3">
                <span className="text-teal block font-bold uppercase tracking-wide text-[9px] mb-1">Astrological Birth Details:</span>
                <span className="text-sandalwood font-medium block text-xs bg-gold/5 border border-gold/10 p-2.5 rounded-lg leading-relaxed">
                  Born {formatDate(bookingRequest.birthDate)} at <strong>{bookingRequest.birthTime}</strong> in <strong>{bookingRequest.birthPlace}</strong>
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 text-xs text-sandalwood/70 font-sans justify-between pt-1">
              <div className="flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-teal" />
                <span>Escrow Hold Amount</span>
              </div>
              <span className="font-bold text-teal">${bookingRequest.depositPaid || (service.price * 0.1).toFixed(2)} Secured</span>
            </div>
          </div>
        </div>

      </div>

      {/* DEVELOPER & TESTING SIMULATION CONSOLE */}
      <section className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 text-left space-y-4 shadow-2xl">
        <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 text-emerald-400 ${isSimulating ? "animate-spin" : ""}`} />
            <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-neutral-300">
              Interactive State Lifecycle Sandbox
            </h3>
          </div>
          <button
            onClick={handleResetSimulation}
            disabled={isSimulating}
            className="flex items-center gap-1 text-[9px] uppercase tracking-wider font-bold bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 text-neutral-300 px-2 py-1 rounded cursor-pointer transition-all"
          >
            <RotateCcw className="w-3 h-3" />
            Reset State
          </button>
        </div>

        <p className="text-[10px] text-neutral-400 leading-normal font-sans">
          Use the dashboard actions below to verify the complete 12 required booking states. Triggering cancels or declines initiates a live escrow refund protocol:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1 text-xs">
          
          {/* Action 1: Practitioner Approves */}
          <button
            onClick={() => runStateTransition("Confirmed")}
            disabled={isSimulating || currentStatus === "Confirmed" || currentStatus.includes("Refund")}
            className="p-3 rounded-xl border border-teal/20 bg-teal/5 hover:bg-teal/10 text-teal font-sans font-bold flex flex-col justify-between items-start transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="text-[10px] uppercase font-sans tracking-wide block">Simulate Priest Action</span>
            <span className="text-sm font-serif mt-1 block">✓ Accept Ceremony</span>
            <span className="text-[9px] font-sans font-normal text-teal/70 mt-1 leading-normal">
              Confirms the booking slot. Moves status from 'Pending' to 'Confirmed'.
            </span>
          </button>

          {/* Action 2: Practitioner Declines */}
          <button
            onClick={() => runStateTransition("Practitioner declined")}
            disabled={isSimulating || currentStatus === "Confirmed" || currentStatus.includes("Refund")}
            className="p-3 rounded-xl border border-rose-950 bg-rose-950/10 hover:bg-rose-950/20 text-rose-400 font-sans font-bold flex flex-col justify-between items-start transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="text-[10px] uppercase font-sans tracking-wide block">Simulate Priest Action</span>
            <span className="text-sm font-serif mt-1 block">✗ Decline Ceremony</span>
            <span className="text-[9px] font-sans font-normal text-rose-400/70 mt-1 leading-normal">
              Simulates rejection. Moves to 'Practitioner declined' and runs secure refund steps.
            </span>
          </button>

          {/* Action 3: User Cancels */}
          <button
            onClick={() => runStateTransition("User cancelled")}
            disabled={isSimulating || currentStatus.includes("Refund") || currentStatus === "Refund completed"}
            className="p-3 rounded-xl border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-sans font-bold flex flex-col justify-between items-start transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="text-[10px] uppercase font-sans tracking-wide block">Simulate Customer Action</span>
            <span className="text-sm font-serif mt-1 block">⊘ Cancel Booking</span>
            <span className="text-[9px] font-sans font-normal text-neutral-400/70 mt-1 leading-normal">
              Triggers customer-side refund request under transparency conditions.
            </span>
          </button>

          {/* Action 4: Practitioner Cancels */}
          <button
            onClick={() => runStateTransition("Practitioner cancelled")}
            disabled={isSimulating || currentStatus !== "Confirmed" || currentStatus.includes("Refund")}
            className="p-3 rounded-xl border border-red-950 bg-red-950/10 hover:bg-red-950/25 text-red-400 font-sans font-bold flex flex-col justify-between items-start transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="text-[10px] uppercase font-sans tracking-wide block">Simulate Emergency Action</span>
            <span className="text-sm font-serif mt-1 block">⚠ Priest Cancels</span>
            <span className="text-[9px] font-sans font-normal text-red-400/70 mt-1 leading-normal">
              Active only after Confirmation. Priest triggers emergency cancellation.
            </span>
          </button>

        </div>
      </section>

      {/* Return Home Button */}
      <button
        onClick={onHome}
        disabled={isSimulating}
        className="w-full py-4 bg-sandalwood hover:bg-maroon disabled:opacity-50 text-ivory font-sans font-bold text-xs tracking-[0.25em] uppercase rounded-lg shadow-card-default hover:shadow-card-hover transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-gold"
      >
        <Home className="w-4 h-4" />
        Return to Home
      </button>

    </div>
  );
}
