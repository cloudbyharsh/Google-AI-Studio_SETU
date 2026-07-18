import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Mail,
  MessageSquare,
  AlertCircle,
  MapPin,
  Globe,
  CreditCard,
  ShieldCheck,
  Check,
  AlertTriangle,
  Info,
  Phone,
  Lock,
  Terminal,
  ChevronRight,
  Eye
} from "lucide-react";
import { Practitioner, Service, BookingRequest } from "../types";
import RotatingMandala from "./RotatingMandala";
import { analytics } from "../lib/analytics";

interface BookingRequestViewProps {
  practitioner: Practitioner;
  service: Service;
  onBack: () => void;
  onSubmit: (bookingRequest: BookingRequest) => void;
}

// Analytics Logger Interface
interface AnalyticsEvent {
  id: string;
  name: string;
  timestamp: string;
  payload?: any;
}

export default function BookingRequestView({
  practitioner,
  service,
  onBack,
  onSubmit,
}: BookingRequestViewProps) {
  const errorSummaryRef = useRef<HTMLDivElement | null>(null);

  // Active form steps
  // 0: Schedule, 1: Contact Info, 2: Review & Consent, 3: Prototype Payment
  const [activeStep, setActiveStep] = useState<number>(0);

  // Selected date & hour slot
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedHour, setSelectedHour] = useState("");
  const [alternativeDate, setAlternativeDate] = useState("");
  
  // Slot hold timer states
  const [holdTimeLeft, setHoldTimeLeft] = useState<number>(300); // 5 minutes countdown
  const [holdTimerActive, setHoldTimerActive] = useState(false);

  // Form contact inputs
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [consultationFormat, setConsultationFormat] = useState<"online" | "inperson">("online");

  // Conditional Astrology Fields
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [birthPlace, setBirthPlace] = useState("");

  // Consent state
  const [consentGiven, setConsentGiven] = useState(false);

  // Prototype card payment states
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardName, setCardName] = useState("");

  // Validation & Loading states
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "pending" | "failed" | "completed">("idle");
  const [showErrorSummary, setShowErrorSummary] = useState(false);

  // Tomorrow's date for minimum input constraint
  const [minDate, setMinDate] = useState("");

  // Live Analytics Debug Log (visible on screen!)
  const [analyticsEvents, setAnalyticsEvents] = useState<AnalyticsEvent[]>([]);

  const isAstrology = service.category === "Astrology";
  const cheapestService = practitioner.services.reduce((prev, curr) => prev.price < curr.price ? prev : curr, practitioner.services[0]);

  // Detected User Time Zone
  const [userTimeZone, setUserTimeZone] = useState("America/New_York");

  // Format local timezone display
  useEffect(() => {
    try {
      setUserTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone || "America/New_York");
    } catch {
      setUserTimeZone("America/New_York");
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setMinDate(tomorrow.toISOString().split("T")[0]);

    // Prefill details from localStorage
    const storedName = localStorage.getItem("setu_user_name");
    const storedEmail = localStorage.getItem("setu_user_email");
    const storedPhone = localStorage.getItem("setu_user_phone");
    if (storedName) setName(storedName);
    if (storedEmail) setEmail(storedEmail);
    if (storedPhone) setPhone(storedPhone);

    // Instrument booking_started
    triggerAnalyticsEvent("booking_started", {
      practitioner_id: practitioner.id,
      service_id: service.id,
      service_price: service.price,
      consultation_format: consultationFormat === "online" ? "virtual" : "in-person"
    });
  }, []);

  // Timer tick for Slot Hold
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (holdTimerActive && holdTimeLeft > 0) {
      timer = setTimeout(() => {
        setHoldTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (holdTimeLeft === 0) {
      setHoldTimerActive(false);
      // Reset selected hour if hold expires
      setSelectedHour("");
      
      // Force back to step 0 if they progressed further, to prevent invalid empty hours slot submission
      if (activeStep > 0) {
        setActiveStep(0);
        setErrors((prev) => ({
          ...prev,
          date: "Your 5-minute temporary slot hold has expired. Please select a new slot."
        }));
        setShowErrorSummary(true);
        window.dispatchEvent(new CustomEvent("prototype_validation_error", {
          detail: { screen: "booking-request", message: "Your slot hold expired. Returned to Step 1." }
        }));
      }

      triggerAnalyticsEvent("booking_abandoned", {
        reason: "slot_hold_expired",
        date: selectedDate
      });
    }
    return () => clearTimeout(timer);
  }, [holdTimerActive, holdTimeLeft, activeStep]);

  // Format timer as MM:SS
  const formatHoldTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Log and display analytics event
  const triggerAnalyticsEvent = (eventName: string, payload?: any) => {
    const newEvent: AnalyticsEvent = {
      id: "evt-" + Math.random().toString(36).substring(2, 9),
      name: eventName,
      timestamp: new Date().toLocaleTimeString(),
      payload
    };
    setAnalyticsEvents((prev) => [newEvent, ...prev]);

    // Elegant Console Logger
    console.log(
      `%c[SETU Analytics Event] %c${eventName}`,
      "color: #1B6B5A; font-weight: bold; background: #E6F4F1; padding: 2px 6px; border-radius: 4px;",
      "color: #C4922A; font-weight: bold; font-style: italic;",
      payload || ""
    );

    // Call centralized analytics engine
    analytics.track(eventName, payload || {});
  };

  // Convert priest's Eastern Time (ET) to local timezone
  const convertETToLocal = (dateStr: string, etTime: string) => {
    if (!dateStr) return etTime;
    const match = etTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return etTime;

    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const ampm = match[3].toUpperCase();

    if (ampm === "PM" && hours < 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;

    try {
      const pad = (num: number) => String(num).padStart(2, "0");
      // Use standard DST estimate for America/New_York (March to November is EDT/UTC-4, else EST/UTC-5)
      const parsedDate = new Date(dateStr);
      const isJuly = parsedDate.getMonth() >= 2 && parsedDate.getMonth() <= 10;
      const offset = isJuly ? "-04:00" : "-05:00";
      
      const absoluteDate = new Date(`${dateStr}T${pad(hours)}:${pad(minutes)}:00${offset}`);
      
      const localFormatted = absoluteDate.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
      });

      // Fetch timezone short name
      const tzName = absoluteDate.toLocaleDateString([], {
        timeZoneName: "short"
      }).split(", ").pop() || "";

      return `${localFormatted} ${tzName}`;
    } catch {
      return etTime;
    }
  };

  // Static mock hours and status for selected date
  const getMockHoursForDate = (dateStr: string) => {
    if (!dateStr) return [];
    // Deterministic state based on date string length or character to simulate real slot availability
    const charCodeSum = dateStr.split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
    return [
      { id: "slot-1", time: "08:30 AM", status: charCodeSum % 3 === 0 ? "Slot unavailable" : "Available" },
      { id: "slot-2", time: "11:00 AM", status: "Available" },
      { id: "slot-3", time: "01:30 PM", status: charCodeSum % 5 === 0 ? "Slot unavailable" : "Available" },
      { id: "slot-4", time: "04:00 PM", status: "Available" },
      { id: "slot-5", time: "06:30 PM", status: "Slot unavailable" },
    ];
  };

  // Form Validation helper
  const validateField = (fieldName: string, value: string): string => {
    if (!value.trim()) {
      if (
        fieldName === "alternativeDate" ||
        fieldName === "note" ||
        fieldName === "phone"
      ) return "";
      return "This field is required.";
    }

    if (fieldName === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return "Please enter a valid email address.";
      }
    }

    if (fieldName === "date") {
      const selectedD = new Date(value);
      const tomorrow = new Date();
      tomorrow.setHours(0, 0, 0, 0);
      tomorrow.setDate(tomorrow.getDate() + 1);
      if (selectedD < tomorrow) {
        return "Preferred date must be in the future.";
      }
    }

    return "";
  };

  const handleBlur = (fieldName: string, value: string) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
    const errorMsg = validateField(fieldName, value);
    setErrors((prev) => {
      const updated = { ...prev, [fieldName]: errorMsg };
      if (!errorMsg) delete updated[fieldName];
      return updated;
    });
  };

  const handleInputChange = (fieldName: string, value: string) => {
    if (fieldName === "name") setName(value);
    if (fieldName === "email") setEmail(value);
    if (fieldName === "phone") setPhone(value);
    if (fieldName === "note") setNote(value);
    if (fieldName === "birthDate") setBirthDate(value);
    if (fieldName === "birthTime") setBirthTime(value);
    if (fieldName === "birthPlace") setBirthPlace(value);

    if (touched[fieldName]) {
      const errorMsg = validateField(fieldName, value);
      setErrors((prev) => {
        const updated = { ...prev, [fieldName]: errorMsg };
        if (!errorMsg) delete updated[fieldName];
        return updated;
      });
    }
  };

  // Navigating between steps
  const goToNextStep = () => {
    if (activeStep === 0) {
      if (!selectedDate || !selectedHour) {
        setErrors((prev) => ({ ...prev, date: "Please select a date and an available hour slot." }));
        setShowErrorSummary(true);
        return;
      }
      const dateErr = validateField("date", selectedDate);
      if (dateErr) {
        setErrors((prev) => ({ ...prev, date: dateErr }));
        setShowErrorSummary(true);
        return;
      }
      if (alternativeDate) {
        const altDateErr = validateField("date", alternativeDate);
        if (altDateErr) {
          setErrors((prev) => ({ ...prev, alternativeDate: "Alternative date must be in the future." }));
          setShowErrorSummary(true);
          return;
        }
      }
      setErrors({});
      setShowErrorSummary(false);
      setActiveStep(1);
    } else if (activeStep === 1) {
      // Validate contact info
      const contactErrors: { [key: string]: string } = {};
      if (!name.trim()) contactErrors.name = "Full name is required.";
      if (!email.trim()) contactErrors.email = "Email address is required.";
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (email.trim() && !emailRegex.test(email)) contactErrors.email = "Please enter a valid email address.";
      
      if (isAstrology) {
        if (!birthDate) contactErrors.birthDate = "Birth date is required.";
        if (!birthTime) contactErrors.birthTime = "Birth time is required.";
        if (!birthPlace) contactErrors.birthPlace = "Birth place is required.";
      }

      if (Object.keys(contactErrors).length > 0) {
        setErrors(contactErrors);
        setTouched({ name: true, email: true, birthDate: true, birthTime: true, birthPlace: true });
        setShowErrorSummary(true);
        window.dispatchEvent(new CustomEvent("prototype_validation_error", {
          detail: { screen: "booking-request", message: "Form validation failed: " + Object.values(contactErrors).join(", ") }
        }));
        return;
      }

      // Save credentials to localStorage
      localStorage.setItem("setu_user_name", name.trim());
      localStorage.setItem("setu_user_email", email.trim());
      if (phone.trim()) localStorage.setItem("setu_user_phone", phone.trim());

      setErrors({});
      setShowErrorSummary(false);
      setActiveStep(2);
      
      // Instrument booking_reviewed
      triggerAnalyticsEvent("booking_reviewed", {
        practitionerId: practitioner.id,
        serviceId: service.id,
        selectedDate,
        selectedHour,
        price: service.price,
        refundableDeposit: (service.price * 0.1).toFixed(2),
        localTime: convertETToLocal(selectedDate, selectedHour)
      });
    } else if (activeStep === 2) {
      if (!consentGiven) {
        setErrors((prev) => ({ ...prev, consent: "You must consent to secure data sharing to proceed." }));
        window.dispatchEvent(new CustomEvent("prototype_validation_error", {
          detail: { screen: "booking-request", message: "You must consent to secure data sharing to proceed." }
        }));
        return;
      }
      setErrors({});
      setActiveStep(3);
    }
  };

  const handleBackStep = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    } else {
      triggerAnalyticsEvent("booking_abandoned", {
        step: "schedule_screen",
        timestamp: new Date().toISOString()
      });
      onBack();
    }
  };

  const handleSelectSlot = (time: string) => {
    setSelectedHour(time);
    setHoldTimeLeft(300); // Reset countdown to 5 minutes
    setHoldTimerActive(true);

    triggerAnalyticsEvent("slot_selected", {
      date: selectedDate,
      hour: time,
      localTimeConverted: convertETToLocal(selectedDate, time),
      userTimeZone
    });

    triggerAnalyticsEvent("availability_checked", {
      practitioner_id: practitioner.id,
      date_selected: selectedDate,
      user_local_timezone: userTimeZone
    });
  };

  // Handle Simulated checkout
  const handleCheckoutPayment = (simulateDecline: boolean) => {
    // Basic verification of checkout card details
    if (!cardName.trim() || !cardNumber.trim() || !cardExpiry.trim() || !cardCvc.trim()) {
      setErrors({ checkout: "Please fill in all credit card details for this prototype checkout." });
      return;
    }

    setErrors({});
    setPaymentStatus("pending");
    
    const depositAmount = parseFloat((service.price * 0.1).toFixed(2));
    const draftBookingId = "bk-draft-" + Math.random().toString(36).substring(2, 7);

    // Instrument deposit_started
    triggerAnalyticsEvent("deposit_started", {
      booking_id: draftBookingId,
      deposit_amount: depositAmount,
      practitioner_id: practitioner.id,
      simulateDecline
    });

    setTimeout(() => {
      if (simulateDecline) {
        setPaymentStatus("failed");
        triggerAnalyticsEvent("deposit_failed", {
          booking_id: draftBookingId,
          deposit_amount: depositAmount,
          failure_reason: "simulated_card_decline"
        });
      } else {
        setPaymentStatus("completed");
        
        const confirmedBookingId = "secured-bk-" + Math.random().toString(36).substring(2, 9);

        triggerAnalyticsEvent("deposit_completed", {
          booking_id: confirmedBookingId,
          deposit_amount: depositAmount,
          practitioner_id: practitioner.id,
          payment_method: "prototype_card"
        });

        triggerAnalyticsEvent("booking_confirmed", {
          booking_id: confirmedBookingId,
          practitioner_id: practitioner.id,
          service_id: service.id,
          final_price: service.price,
          consultation_date: selectedDate,
          consultation_time: selectedHour
        });

        // Trigger parent submission
        setTimeout(() => {
          const finalBooking: BookingRequest = {
            id: "setu-" + Math.random().toString(36).substring(2, 10).toUpperCase(),
            practitionerId: practitioner.id,
            serviceId: service.id,
            preferredDate: selectedDate,
            alternativeDate: alternativeDate || undefined,
            preferredTime: selectedHour.includes("AM") ? "morning" : selectedHour.match(/01|02|03|04/) ? "afternoon" : "evening",
            selectedTimeSlot: selectedHour,
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim() || undefined,
            note: note.trim() || undefined,
            status: "Practitioner confirmation pending", // Start in pending review state post deposit!
            createdAt: new Date().toISOString(),
            birthDate: isAstrology ? birthDate : undefined,
            birthTime: isAstrology ? birthTime : undefined,
            birthPlace: isAstrology ? birthPlace : undefined,
            format: consultationFormat,
            priceAtBooking: service.price,
            depositPaid: depositAmount,
            consentGiven: true
          };
          onSubmit(finalBooking);
        }, 1200);
      }
    }, 2000);
  };

  return (
    <div className="px-4 sm:px-6 py-6 max-w-xl mx-auto space-y-8 min-h-screen bg-ivory pb-28 relative">
      
      {/* Step Stepper Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleBackStep}
          disabled={isSubmitting || paymentStatus === "pending"}
          className="group flex items-center gap-2 text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-sandalwood/70 hover:text-maroon rounded py-2 pr-4 cursor-pointer transition-colors disabled:opacity-50 min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          {activeStep === 0 ? "Back to Profile" : "Previous Step"}
        </button>

        {/* Mini Stepper Dots */}
        <div className="flex gap-1.5">
          {[0, 1, 2, 3].map((stepIdx) => (
            <div
              key={stepIdx}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                activeStep === stepIdx
                  ? "bg-maroon w-6"
                  : activeStep > stepIdx
                  ? "bg-gold"
                  : "bg-sandalwood/10"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Hero service summary banner */}
      <section className="bg-warm-ivory border border-sandalwood/10 rounded-2xl p-5 shadow-card-default flex items-center justify-between gap-4 relative overflow-hidden">
        <div className="min-w-0 z-10">
          <span className="text-[9px] font-sans font-bold uppercase tracking-widest text-gold block">
            SECURE DEPOSIT BOOKING
          </span>
          <h2 className="font-serif font-bold text-base sm:text-lg text-sandalwood truncate mt-0.5 leading-snug">
            {service.name}
          </h2>
          <p className="text-xs text-sandalwood/75 font-sans mt-0.5">
            Directed by <strong className="text-maroon">{practitioner.name}</strong>
          </p>
        </div>
        <div className="text-right shrink-0 pl-4 border-l border-sandalwood/10 z-10">
          <span className="text-[9px] font-sans font-bold uppercase tracking-widest text-sandalwood/50 block">
            CEREMONY PRICE
          </span>
          <span className="font-serif font-bold text-xl text-maroon block mt-0.5">
            ${service.price}
          </span>
          <span className="text-[9px] font-sans font-black text-teal block mt-0.5 tracking-wide bg-teal/10 px-1.5 py-0.5 rounded-md">
            10% Deposit Hold
          </span>
        </div>
      </section>

      {/* Form Error Summaries */}
      <AnimatePresence>
        {showErrorSummary && Object.keys(errors).length > 0 && (
          <motion.div
            ref={errorSummaryRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-maroon/5 border border-maroon rounded-2xl space-y-2 text-left"
          >
            <div className="flex items-center gap-2 text-maroon">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <h4 className="font-sans font-bold text-xs uppercase tracking-wider">
                Please resolve the following scheduling issues:
              </h4>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-xs text-sandalwood/90 font-sans">
              {Object.entries(errors).map(([field, msg]) => (
                <li key={field}>
                  <strong>{field.toUpperCase()}:</strong> {msg}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Step Panels */}
      <AnimatePresence mode="wait">
        
        {/* STEP 0: SCHEDULER */}
        {activeStep === 0 && (
          <motion.div
            key="step-0-scheduler"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6 text-left"
          >
            <div className="bg-warm-ivory border border-sandalwood/10 rounded-2xl p-5 sm:p-6 shadow-card-default space-y-5">
              <div className="flex items-center gap-2 border-b border-sandalwood/5 pb-3">
                <Calendar className="w-5 h-5 text-gold" />
                <h3 className="font-serif font-bold text-base text-sandalwood">
                  Step 1: Consultation Scheduling
                </h3>
              </div>

              {/* Format selection */}
              <div className="space-y-2">
                <label className="block text-xs font-sans font-bold text-sandalwood uppercase tracking-wider">
                  Consultation Format
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setConsultationFormat("online")}
                    className={`p-3.5 rounded-xl border text-xs font-sans font-semibold text-center cursor-pointer transition-all ${
                      consultationFormat === "online"
                        ? "bg-maroon text-ivory border-maroon shadow-sm"
                        : "bg-ivory text-sandalwood border-sandalwood/10 hover:border-gold/30"
                    }`}
                  >
                    Online Video (Zoom)
                    <span className="block text-[9px] opacity-70 mt-0.5">Secure, 100% private call</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (practitioner.location?.toLowerCase().includes("online only")) {
                        alert("This practitioner operates primarily online.");
                        return;
                      }
                      setConsultationFormat("inperson");
                    }}
                    className={`p-3.5 rounded-xl border text-xs font-sans font-semibold text-center cursor-pointer transition-all ${
                      consultationFormat === "inperson"
                        ? "bg-maroon text-ivory border-maroon shadow-sm"
                        : "bg-ivory text-sandalwood border-sandalwood/10 hover:border-gold/30"
                    }`}
                  >
                    In-Person (Home)
                    <span className="block text-[9px] opacity-70 mt-0.5">Local service radius</span>
                  </button>
                </div>
              </div>

              {/* Preferred Date Calendar */}
              <div className="space-y-2">
                <label htmlFor="pref-date" className="block text-xs font-sans font-bold text-sandalwood uppercase tracking-wider">
                  Select Consultation Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sandalwood/40" />
                  <input
                    type="date"
                    id="pref-date"
                    min={minDate}
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setSelectedHour(""); // Reset hour when date changes
                    }}
                    className="w-full pl-10 pr-4 py-3 bg-ivory rounded-lg text-sandalwood font-sans text-xs border border-sandalwood/15 hover:border-gold/30 focus:outline-none focus:ring-2 focus:ring-maroon min-h-[44px]"
                  />
                </div>
              </div>

              {/* Hour Selection Grid with dynamic statuses */}
              {selectedDate && (
                <div className="space-y-3.5 pt-2 border-t border-sandalwood/5 animate-fade-in">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-sans font-bold text-sandalwood uppercase tracking-wider">
                      Select Available Hour Slot
                    </label>
                    <span className="text-[10px] text-sandalwood/60 font-sans font-medium">
                      All slots listed in Eastern Time (ET)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {getMockHoursForDate(selectedDate).map((slot) => {
                      const isUnavailable = slot.status === "Slot unavailable";
                      const isSelected = selectedHour === slot.time;
                      const isHeld = isSelected && holdTimerActive;

                      return (
                        <button
                          key={slot.id}
                          type="button"
                          disabled={isUnavailable}
                          onClick={() => handleSelectSlot(slot.time)}
                          className={`p-3 rounded-xl border text-left flex justify-between items-center transition-all ${
                            isUnavailable
                              ? "bg-sandalwood/5 border-sandalwood/5 text-sandalwood/30 cursor-not-allowed"
                              : isHeld
                              ? "bg-teal/10 border-teal text-teal ring-2 ring-teal/20"
                              : isSelected
                              ? "bg-maroon text-ivory border-maroon"
                              : "bg-ivory text-sandalwood border-sandalwood/10 hover:border-gold/40"
                          }`}
                        >
                          <div className="space-y-0.5">
                            <span className="font-serif font-black text-sm block">
                              {slot.time}
                            </span>
                            <span className="text-[10px] uppercase font-sans font-bold tracking-wide">
                              {isHeld ? "Slot temporarily held" : slot.status}
                            </span>
                          </div>
                          {isHeld ? (
                            <div className="text-right">
                              <span className="text-[9px] block uppercase text-teal/60 font-bold font-sans">Expires in</span>
                              <span className="font-mono text-xs font-black bg-teal/20 px-1.5 py-0.5 rounded text-teal">
                                {formatHoldTimer(holdTimeLeft)}
                              </span>
                            </div>
                          ) : isUnavailable ? (
                            <span className="text-[10px] text-maroon/60 font-black uppercase tracking-wider">Booked</span>
                          ) : (
                            <span className="text-xs text-gold font-bold">Select ✓</span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Timezone Translation Feedback */}
                  {selectedHour && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-teal/5 border border-teal/15 rounded-xl flex items-start gap-2.5"
                    >
                      <Globe className="w-4.5 h-4.5 text-teal shrink-0 mt-0.5" />
                      <div className="text-xs font-sans text-sandalwood/90 leading-relaxed">
                        <strong className="text-teal">Time Zone Conversion Check:</strong>
                        <p className="mt-0.5">
                          The priest conducts rituals in {practitioner.location?.includes("Toronto") ? "Eastern Time (ET)" : "their local time zone"}. Translated to your local device timezone (<span className="font-bold">{userTimeZone}</span>):
                        </p>
                        <p className="font-serif font-black text-sm text-teal mt-1">
                          {convertETToLocal(selectedDate, selectedHour)}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {/* Optional Recommended alternative date */}
              <div className="space-y-2 pt-4 border-t border-sandalwood/5">
                <label htmlFor="alt-date" className="block text-xs font-sans font-bold text-sandalwood uppercase tracking-wider text-sandalwood/70">
                  Alternative Date <span className="text-[9px] text-teal font-black">(Highly Recommended)</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sandalwood/40" />
                  <input
                    type="date"
                    id="alt-date"
                    min={minDate}
                    value={alternativeDate}
                    onChange={(e) => setAlternativeDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-ivory rounded-lg text-sandalwood font-sans text-xs border border-sandalwood/15 hover:border-gold/30 focus:outline-none focus:ring-2 focus:ring-maroon min-h-[44px]"
                  />
                </div>
                <p className="text-[10px] text-sandalwood/60 font-sans italic">
                  Provides a secondary backup if the priest has unexpected ritual overlaps.
                </p>
              </div>

              {/* Stepper continue */}
              <button
                type="button"
                onClick={goToNextStep}
                disabled={!selectedDate || !selectedHour}
                className="w-full py-3.5 bg-sandalwood hover:bg-maroon disabled:opacity-50 disabled:bg-sandalwood/40 text-ivory font-sans font-bold text-xs tracking-wider uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
              >
                Continue to Personal Information
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 1: CONTACT DETAILS & ASTROLOGY */}
        {activeStep === 1 && (
          <motion.div
            key="step-1-contact"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6 text-left"
          >
            <div className="bg-warm-ivory border border-sandalwood/10 rounded-2xl p-5 sm:p-6 shadow-card-default space-y-5">
              <div className="flex items-center gap-2 border-b border-sandalwood/5 pb-3">
                <User className="w-5 h-5 text-gold" />
                <h3 className="font-serif font-bold text-base text-sandalwood">
                  Step 2: Customer Contact & Ancestral Info
                </h3>
              </div>

              {/* Contact Information Fields */}
              <div className="space-y-4">
                {/* Full name */}
                <div className="space-y-1">
                  <label htmlFor="fullname" className="block text-xs font-sans font-bold text-sandalwood/80 uppercase">
                    Your Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sandalwood/40" />
                    <input
                      type="text"
                      id="fullname"
                      placeholder="e.g. Ramesh Patel"
                      value={name}
                      onBlur={(e) => handleBlur("name", e.target.value)}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-ivory rounded-lg text-sandalwood font-sans text-xs border border-sandalwood/15 focus:outline-none focus:ring-2 focus:ring-maroon min-h-[44px]"
                    />
                  </div>
                  {errors.name && <span className="text-[10px] text-maroon font-bold font-sans">{errors.name}</span>}
                </div>

                {/* Email address */}
                <div className="space-y-1">
                  <label htmlFor="emailaddress" className="block text-xs font-sans font-bold text-sandalwood/80 uppercase">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sandalwood/40" />
                    <input
                      type="email"
                      id="emailaddress"
                      placeholder="e.g. ramesh.patel@gmail.com"
                      value={email}
                      onBlur={(e) => handleBlur("email", e.target.value)}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-ivory rounded-lg text-sandalwood font-sans text-xs border border-sandalwood/15 focus:outline-none focus:ring-2 focus:ring-maroon min-h-[44px]"
                    />
                  </div>
                  {errors.email && <span className="text-[10px] text-maroon font-bold font-sans">{errors.email}</span>}
                </div>

                {/* Phone number */}
                <div className="space-y-1">
                  <label htmlFor="phonenumber" className="block text-xs font-sans font-bold text-sandalwood/80 uppercase">
                    Phone Number (Mobile for SMS notifications)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sandalwood/40" />
                    <input
                      type="tel"
                      id="phonenumber"
                      placeholder="e.g. +1 (416) 555-0199"
                      value={phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-ivory rounded-lg text-sandalwood font-sans text-xs border border-sandalwood/15 focus:outline-none focus:ring-2 focus:ring-maroon min-h-[44px]"
                    />
                  </div>
                </div>

                {/* Optional gotra / ancestral note */}
                <div className="space-y-1">
                  <label htmlFor="ancestral-note" className="block text-xs font-sans font-bold text-sandalwood/80 uppercase">
                    Ancestral Gotra / Special Ritual Notes (Optional)
                  </label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3.5 top-3.5 w-4 h-4 text-sandalwood/40" />
                    <textarea
                      id="ancestral-note"
                      rows={2}
                      placeholder="e.g., Kashyapa Gotra, specific family traditions, dietary adjustments..."
                      value={note}
                      onChange={(e) => handleInputChange("note", e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-ivory rounded-lg text-sandalwood font-sans text-xs border border-sandalwood/15 focus:outline-none focus:ring-2 focus:ring-maroon"
                    />
                  </div>
                </div>
              </div>

              {/* Conditionally rendered Astrology fields */}
              {isAstrology && (
                <div className="p-4 bg-teal/5 border border-teal/15 rounded-xl space-y-4">
                  <div className="flex gap-2">
                    <Globe className="w-5 h-5 text-teal shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-sans font-bold text-xs uppercase tracking-wide text-sandalwood">
                        Astrological Birth Chart Inputs
                      </h4>
                      <p className="text-[10px] text-sandalwood/70 font-sans leading-normal mt-0.5">
                        These credentials are required to calculate planetary alignment (Kundli charts) systematically.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label htmlFor="birth-d" className="block text-[10px] font-sans font-bold text-sandalwood/60 uppercase">Birth Date *</label>
                      <input
                        type="date"
                        id="birth-d"
                        value={birthDate}
                        onChange={(e) => handleInputChange("birthDate", e.target.value)}
                        className="w-full p-2 bg-ivory text-xs text-sandalwood border border-sandalwood/10 rounded"
                      />
                      {errors.birthDate && <span className="text-[9px] text-maroon font-bold block">{errors.birthDate}</span>}
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="birth-t" className="block text-[10px] font-sans font-bold text-sandalwood/60 uppercase">Birth Time *</label>
                      <input
                        type="text"
                        id="birth-t"
                        placeholder="e.g. 14:45"
                        value={birthTime}
                        onChange={(e) => handleInputChange("birthTime", e.target.value)}
                        className="w-full p-2 bg-ivory text-xs text-sandalwood border border-sandalwood/10 rounded"
                      />
                      {errors.birthTime && <span className="text-[9px] text-maroon font-bold block">{errors.birthTime}</span>}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="birth-p" className="block text-[10px] font-sans font-bold text-sandalwood/60 uppercase">Place of Birth *</label>
                    <input
                      type="text"
                      id="birth-p"
                      placeholder="e.g. New Delhi, India"
                      value={birthPlace}
                      onChange={(e) => handleInputChange("birthPlace", e.target.value)}
                      className="w-full p-2 bg-ivory text-xs text-sandalwood border border-sandalwood/10 rounded"
                    />
                    {errors.birthPlace && <span className="text-[9px] text-maroon font-bold block">{errors.birthPlace}</span>}
                  </div>
                </div>
              )}

              {/* Form submit control */}
              <button
                type="button"
                onClick={goToNextStep}
                className="w-full py-3.5 bg-sandalwood hover:bg-maroon text-ivory font-sans font-bold text-xs tracking-wider uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
              >
                Proceed to Review & Consent
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 2: REVIEW & CONSENT */}
        {activeStep === 2 && (
          <motion.div
            key="step-2-review"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6 text-left"
          >
            <div className="bg-warm-ivory border border-sandalwood/10 rounded-2xl p-5 sm:p-6 shadow-card-default space-y-6">
              <div className="flex items-center gap-2 border-b border-sandalwood/5 pb-3">
                <ShieldCheck className="w-5 h-5 text-gold" />
                <h3 className="font-serif font-bold text-base text-sandalwood">
                  Step 3: Review Details & Setu Consent
                </h3>
              </div>

              {/* Details table */}
              <div className="space-y-4 text-xs font-sans bg-ivory p-4 rounded-xl border border-sandalwood/5">
                <div className="border-b border-sandalwood/5 pb-3 flex justify-between items-start">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gold">Matched Guide</span>
                    <h4 className="font-serif font-bold text-sm text-sandalwood mt-0.5">{practitioner.name}</h4>
                    <p className="text-[10px] text-sandalwood/60">{practitioner.tradition}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-sandalwood/10">
                    <img src={practitioner.photo} alt={practitioner.name} className="w-full h-full object-cover" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-y-3.5 pt-1.5">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-sandalwood/40 block">Ritual / Ceremony</span>
                    <span className="font-medium text-sandalwood">{service.name}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-sandalwood/40 block">Duration</span>
                    <span className="font-medium text-sandalwood">{service.duration}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-sandalwood/40 block">Date & Time</span>
                    <span className="font-medium text-maroon font-bold">{selectedDate}</span>
                    <span className="block text-[10px] text-teal font-semibold mt-0.5">{convertETToLocal(selectedDate, selectedHour)} (Local)</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-sandalwood/40 block">Format</span>
                    <span className="font-medium text-sandalwood capitalize">{consultationFormat === "online" ? "Online Video Call" : "In-Person Consultation"}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-sandalwood/40 block">Full Fee</span>
                    <span className="font-serif font-bold text-sm text-sandalwood">${service.price}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-teal block">Refundable Security Hold</span>
                    <span className="font-serif font-black text-sm text-teal">${(service.price * 0.1).toFixed(2)}</span>
                    <span className="block text-[9px] text-sandalwood/60 italic">(10% secure booking hold)</span>
                  </div>
                </div>
              </div>

              {/* Refund Conditions Policy Box */}
              <div className="p-4 bg-maroon/5 border border-maroon/10 rounded-xl space-y-2.5">
                <div className="flex gap-2 text-maroon font-bold uppercase text-[10px] tracking-wider">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Transparent Refund Conditions Policy</span>
                </div>
                <ul className="text-[11px] text-sandalwood/80 font-sans space-y-1.5 list-disc pl-4 leading-relaxed">
                  <li><strong>100% Immediate Refund Guarantee:</strong> If the matching practitioner declines, is unavailable, or is unable to fulfill your request, the deposit hold is immediately reimbursed.</li>
                  <li><strong>Free Cancellation Window:</strong> You can cancel this booking with full refund up to <strong>24 hours</strong> before the scheduled ritual time.</li>
                  <li><strong>Integrity Standards:</strong> The deposit is safely locked under SETU escrow, which is never cleared to the priest until the ceremony is successfully conducted in accordance with Vedic tradition.</li>
                </ul>
              </div>

              {/* Secure Consent Checkbox */}
              <div className="p-3 bg-ivory rounded-xl border border-sandalwood/10 flex gap-3 text-left">
                <input
                  type="checkbox"
                  id="consent"
                  checked={consentGiven}
                  onChange={(e) => {
                    setConsentGiven(e.target.checked);
                    if (e.target.checked) setErrors({});
                  }}
                  className="w-4.5 h-4.5 accent-maroon border-sandalwood/20 rounded cursor-pointer shrink-0 mt-0.5"
                />
                <label htmlFor="consent" className="text-[11px] text-sandalwood/75 font-sans leading-relaxed cursor-pointer">
                  I consent to sharing my contact, ancestral, and birth chart details securely with <strong>{practitioner.name}</strong> to allow systematized ritual preparation. I understand SETU enforces strict privacy and will never sell or misuse my ancestral coordinates. *
                </label>
              </div>
              {errors.consent && <p className="text-[10px] text-maroon font-bold font-sans mt-1">{errors.consent}</p>}

              {/* Action */}
              <button
                type="button"
                onClick={goToNextStep}
                disabled={!consentGiven}
                className="w-full py-3.5 bg-sandalwood hover:bg-maroon disabled:opacity-50 text-ivory font-sans font-bold text-xs tracking-wider uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
              >
                Proceed to Security Hold checkout
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: PROTOTYPE CHECKOUT */}
        {activeStep === 3 && (
          <motion.div
            key="step-3-payment"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6 text-left"
          >
            <div className="bg-warm-ivory border border-sandalwood/10 rounded-2xl p-5 sm:p-6 shadow-card-default space-y-6">
              <div className="flex items-center gap-2 border-b border-sandalwood/5 pb-3">
                <CreditCard className="w-5 h-5 text-gold" />
                <h3 className="font-serif font-bold text-base text-sandalwood">
                  Step 4: Secure Hold Checkout (Refundable Deposit)
                </h3>
              </div>

              {/* Security Shield Disclaimer */}
              <div className="p-3 bg-teal/5 border border-teal/15 rounded-xl flex gap-2.5">
                <Lock className="w-5 h-5 text-teal shrink-0 mt-0.5" />
                <p className="text-[11px] text-sandalwood/80 leading-relaxed font-sans">
                  <strong>Secure Sandbox Terminal:</strong> No real money will be charged. This sandbox simulates Stripe's secure off-platform tokenized checkout flow to demonstrate 100% secure escrow validation.
                </p>
              </div>

              {/* Total Due display */}
              <div className="bg-ivory border border-sandalwood/15 p-4 rounded-xl flex justify-between items-center">
                <div>
                  <span className="text-[10px] uppercase font-bold text-sandalwood/50 block">Reservation Hold Amount</span>
                  <span className="text-xs text-sandalwood/70 italic">(10% of total ${service.price} ceremony fee)</span>
                </div>
                <span className="font-serif font-black text-2xl text-maroon">
                  ${(service.price * 0.1).toFixed(2)}
                </span>
              </div>

              {/* Checkout Form */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="card-n" className="block text-xs font-sans font-bold text-sandalwood/70 uppercase">Cardholder Name</label>
                  <input
                    type="text"
                    id="card-n"
                    placeholder="e.g. Ramesh Patel"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="w-full px-3 py-2.5 bg-ivory text-xs border border-sandalwood/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-maroon"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="card-num" className="block text-xs font-sans font-bold text-sandalwood/70 uppercase">Card Number</label>
                  <div className="relative">
                    <input
                      type="text"
                      id="card-num"
                      placeholder="4111 2222 3333 4444"
                      value={cardNumber}
                      onChange={(e) => {
                        // Apply mock format 4-4-4-4
                        const val = e.target.value.replace(/\s?/g, "").replace(/(\d{4})/g, "$1 ").trim();
                        setCardNumber(val.slice(0, 19));
                      }}
                      className="w-full pl-10 pr-4 py-2.5 bg-ivory text-xs border border-sandalwood/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-maroon font-mono"
                    />
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sandalwood/30" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="card-exp" className="block text-xs font-sans font-bold text-sandalwood/70 uppercase">Expiry (MM/YY)</label>
                    <input
                      type="text"
                      id="card-exp"
                      placeholder="12/28"
                      value={cardExpiry}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\s?/g, "").replace(/(\d{2})/g, "$1/").replace(/\/$/, "");
                        setCardExpiry(val.slice(0, 5));
                      }}
                      className="w-full px-3 py-2.5 bg-ivory text-xs border border-sandalwood/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-maroon font-mono text-center"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="card-c" className="block text-xs font-sans font-bold text-sandalwood/70 uppercase">CVC Code</label>
                    <input
                      type="password"
                      id="card-c"
                      placeholder="•••"
                      maxLength={4}
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, ""))}
                      className="w-full px-3 py-2.5 bg-ivory text-xs border border-sandalwood/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-maroon font-mono text-center"
                    />
                  </div>
                </div>

                {errors.checkout && <p className="text-[10px] text-maroon font-bold font-sans mt-1">{errors.checkout}</p>}
                
                {paymentStatus === "failed" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-3.5 bg-maroon/5 border border-maroon/20 rounded-xl flex gap-2.5 items-start text-xs text-maroon"
                  >
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold">Transaction Failed:</strong> Simulated card decline. Please click "Pay Hold Deposit (Success)" to simulate an authorized charge.
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Checkout Interactive Action Buttons */}
              <div className="pt-2 space-y-3">
                {paymentStatus === "pending" ? (
                  <div className="py-4 flex flex-col items-center justify-center gap-3 bg-ivory rounded-xl border border-sandalwood/10">
                    <RotatingMandala size={36} color="#1B6B5A" secondaryColor="#C4922A" speed="fast" />
                    <span className="text-xs font-sans font-bold text-sandalwood animate-pulse">
                      Contacting secure banking network... Please do not close.
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {/* Fulfill transaction successfully */}
                    <button
                      type="button"
                      onClick={() => handleCheckoutPayment(false)}
                      className="w-full py-4 bg-teal hover:bg-sandalwood text-ivory font-sans font-bold text-xs tracking-wider uppercase rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
                    >
                      <Lock className="w-4 h-4" />
                      Fulfill Hold Deposit (Authorize)
                    </button>

                    {/* Simulate checkout fail */}
                    <button
                      type="button"
                      onClick={() => handleCheckoutPayment(true)}
                      className="w-full py-2.5 border border-maroon/30 hover:bg-maroon/5 text-maroon font-sans font-bold text-xs tracking-wide uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      Simulate Card Decline (Test Fail Branch)
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Real-time On-Screen Analytics Logger (debug panel) */}
      <section className="bg-neutral-900 text-neutral-300 border border-neutral-800 rounded-2xl p-4 font-mono text-[11px] text-left shadow-2xl relative overflow-hidden">
        <div className="flex justify-between items-center border-b border-neutral-800 pb-2 mb-2">
          <div className="flex items-center gap-1.5">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span className="font-sans font-bold uppercase tracking-wider text-neutral-400 text-[10px]">
              SETU Analytics Debug Monitor
            </span>
          </div>
          <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-[9px] uppercase tracking-wide font-sans font-bold animate-pulse">
            Active Tracker
          </span>
        </div>
        
        <p className="text-[10px] text-neutral-500 font-sans italic leading-normal mb-3">
          This system monitors and records the user lifecycle flows for audit logs. Watch events stream in real-time as you interact with the form above:
        </p>

        <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
          {analyticsEvents.length === 0 ? (
            <p className="text-neutral-600 text-center italic py-2">No actions recorded yet.</p>
          ) : (
            analyticsEvents.map((evt) => (
              <div key={evt.id} className="border-b border-neutral-800/50 pb-1.5 last:border-0">
                <div className="flex justify-between text-neutral-400 font-bold text-[10px]">
                  <span className="text-emerald-400">&gt; Event: {evt.name}</span>
                  <span className="text-neutral-500">{evt.timestamp}</span>
                </div>
                {evt.payload && (
                  <pre className="text-neutral-500 text-[10px] pl-3 overflow-x-auto bg-black/30 p-1.5 rounded mt-1">
                    {JSON.stringify(evt.payload, null, 2)}
                  </pre>
                )}
              </div>
            ))
          )}
        </div>
      </section>

    </div>
  );
}
