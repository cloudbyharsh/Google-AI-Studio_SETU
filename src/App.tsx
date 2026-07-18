import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import Header from "./components/Header";
import OnboardingFlow from "./components/OnboardingFlow";
import DirectoryView from "./components/DirectoryView";
import ProfileView from "./components/ProfileView";
import BookingRequestView from "./components/BookingRequestView";
import RequestReceivedView from "./components/RequestReceivedView";
import BookingSecuredView from "./components/BookingSecuredView";
import KundliView from "./components/KundliView";
import ContactView from "./components/ContactView";
import { VerificationModal, HelpModal } from "./components/TrustModals";
import { Practitioner, Service, BookingRequest } from "./types";
import PrototypeValidationObserver from "./components/PrototypeValidationObserver";
import AnalyticsDebugger from "./components/AnalyticsDebugger";
import { sendBookingEmail } from "./lib/email";

type ScreenType =
  | "onboarding"
  | "directory"
  | "profile"
  | "booking-request"
  | "request-received"
  | "booking-secured"
  | "contact"
  | "kundli";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>("onboarding");
  const [selectedPractitioner, setSelectedPractitioner] = useState<Practitioner | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [latestBooking, setLatestBooking] = useState<BookingRequest | null>(null);
  const [isKundliOpen, setIsKundliOpen] = useState(false);
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [selectedIntentForDirectory, setSelectedIntentForDirectory] = useState<string | null>(null);

  // Smoothly scroll back to top of the viewport on screen transitions
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentScreen]);

  const handleHomeClick = () => {
    setCurrentScreen("onboarding");
    setSelectedPractitioner(null);
    setSelectedService(null);
  };

  const handleSelectPractitioner = (practitioner: Practitioner, service?: Service | null) => {
    setSelectedPractitioner(practitioner);
    setSelectedService(service || null);
    setCurrentScreen("profile");
  };

  const handleRequestBooking = (practitioner: Practitioner, service: Service) => {
    setSelectedPractitioner(practitioner);
    setSelectedService(service);
    setCurrentScreen("booking-request");
  };

  const handleFormSubmit = (bookingRequest: BookingRequest) => {
    setLatestBooking(bookingRequest);
    
    // Trigger real or simulated email sending (non-blocking)
    if (selectedPractitioner && selectedService) {
      sendBookingEmail(bookingRequest, selectedPractitioner, selectedService)
        .then((res) => {
          if (res.success) {
            console.log(`%c[EMAIL SERVICE] Email processed successfully. Is Real: ${res.isReal}`, "color: #FFF; background: #059669; font-weight: bold; padding: 2px 6px;");
          } else {
            console.warn(`[EMAIL SERVICE] Email sending status/warning: ${res.error}`);
          }
        })
        .catch((err) => {
          console.error(`[EMAIL SERVICE] Failed to send booking email:`, err);
        });
    }

    if (
      bookingRequest.status === "secured" ||
      bookingRequest.status === "Practitioner confirmation pending" ||
      bookingRequest.status === "Confirmed"
    ) {
      setCurrentScreen("booking-secured");
    } else {
      setCurrentScreen("request-received");
    }
  };

  const handleSimulateSecured = () => {
    if (latestBooking) {
      // Transition from received status to simulated secured status
      const updatedBooking: BookingRequest = {
        ...latestBooking,
        status: "secured",
      };
      setLatestBooking(updatedBooking);
      setCurrentScreen("booking-secured");
    }
  };

  return (
    <div className="min-h-screen bg-ivory text-sandalwood font-sans flex flex-col relative">
      {/* Global Brand Header */}
      <Header
        onHomeClick={handleHomeClick}
        onFindPractitionerClick={() => {
          setSelectedIntentForDirectory(null);
          setCurrentScreen("directory");
          setSelectedPractitioner(null);
          setSelectedService(null);
        }}
        onOpenKundli={() => {
          setCurrentScreen("kundli");
          setSelectedPractitioner(null);
          setSelectedService(null);
        }}
        onOpenVerification={() => setIsVerificationOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        onContactClick={() => setCurrentScreen("contact")}
      />

      {/* Interactive Step Stepper */}
      {["directory", "profile", "booking-request"].includes(currentScreen) && (
        <div className="bg-warm-ivory border-b border-sandalwood/5 py-4.5 px-4 sm:px-6 transition-all duration-300 relative z-20">
          <div className="max-w-xl mx-auto">
            <div className="flex items-center justify-between relative">
              {/* Stepper background line */}
              <div className="absolute left-1 right-1 top-1/2 -translate-y-1/2 h-0.5 bg-sandalwood/10 -z-0" />
              
              {/* Stepper dynamic progress line */}
              <div 
                className="absolute left-1 top-1/2 -translate-y-1/2 h-0.5 bg-gold transition-all duration-500 -z-0" 
                style={{
                  width: 
                    currentScreen === "directory" && !selectedService
                      ? "0%"
                      : currentScreen === "directory" && selectedService
                      ? "33%"
                      : currentScreen === "profile"
                      ? "66%"
                      : "100%"
                }}
              />

              {[
                { id: "ceremony", label: "Ceremony", active: currentScreen === "directory" && !selectedService, completed: currentScreen !== "directory" || !!selectedService },
                { id: "priest", label: "Priest Match", active: currentScreen === "directory" && !!selectedService, completed: ["profile", "booking-request"].includes(currentScreen) },
                { id: "customizer", label: "Customizer", active: currentScreen === "profile", completed: currentScreen === "booking-request" },
                { id: "sankalpa", label: "Sankalpa", active: currentScreen === "booking-request", completed: false }
              ].map((step, idx) => {
                const isActive = step.active;
                const isCompleted = step.completed;

                return (
                  <div key={step.id} className="flex flex-col items-center relative z-10">
                    <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-sans text-xs font-black transition-all duration-300 ${
                      isCompleted 
                        ? "bg-gold border-gold text-ivory" 
                        : isActive 
                        ? "bg-maroon border-maroon text-ivory ring-4 ring-maroon/10 scale-105" 
                        : "bg-ivory border-sandalwood/20 text-sandalwood/40"
                    }`}>
                      {isCompleted ? "✓" : idx + 1}
                    </div>
                    <span className={`text-[9px] font-sans font-black uppercase tracking-wider mt-1.5 transition-colors duration-200 ${
                      isActive ? "text-maroon font-bold" : isCompleted ? "text-gold" : "text-sandalwood/40"
                    }`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Screen Stage */}
      <main className="flex-grow pb-12">
        <AnimatePresence mode="wait">
          {currentScreen === "onboarding" && (
            <motion.div
              key="onboarding"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
            >
              <OnboardingFlow
                onSelectPractitioner={(practitioner) => {
                  setSelectedPractitioner(practitioner);
                  setSelectedService(practitioner.services[0] || null);
                  setCurrentScreen("profile");
                }}
                onSkipToDirectory={(intent) => {
                  setSelectedIntentForDirectory(intent || null);
                  setCurrentScreen("directory");
                }}
                onOpenKundli={() => {
                  setCurrentScreen("kundli");
                  setSelectedPractitioner(null);
                  setSelectedService(null);
                }}
              />
            </motion.div>
          )}

          {currentScreen === "directory" && (
            <motion.div
              key="directory"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
            >
              <DirectoryView
                onSelectPractitioner={handleSelectPractitioner}
                onOpenKundliModal={() => {
                  setCurrentScreen("kundli");
                  setSelectedPractitioner(null);
                  setSelectedService(null);
                }}
                initialIntent={selectedIntentForDirectory}
              />
            </motion.div>
          )}

          {currentScreen === "profile" && selectedPractitioner && (
            <motion.div
              key={`profile-${selectedPractitioner.id}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.35 }}
            >
              <ProfileView
                practitioner={selectedPractitioner}
                onBack={() => setCurrentScreen("directory")}
                onRequestBooking={handleRequestBooking}
                initialSelectedService={selectedService}
              />
            </motion.div>
          )}

          {currentScreen === "booking-request" && selectedPractitioner && selectedService && (
            <motion.div
              key={`request-${selectedPractitioner.id}-${selectedService.id}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.35 }}
            >
              <BookingRequestView
                practitioner={selectedPractitioner}
                service={selectedService}
                onBack={() => setCurrentScreen("profile")}
                onSubmit={handleFormSubmit}
              />
            </motion.div>
          )}

          {currentScreen === "request-received" && selectedPractitioner && selectedService && latestBooking && (
            <motion.div
              key="received"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
            >
              <RequestReceivedView
                practitioner={selectedPractitioner}
                service={selectedService}
                bookingRequest={latestBooking}
                onHome={handleHomeClick}
                onSimulateSecured={handleSimulateSecured}
              />
            </motion.div>
          )}

          {currentScreen === "booking-secured" && selectedPractitioner && selectedService && latestBooking && (
            <motion.div
              key="secured"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
            >
              <BookingSecuredView
                practitioner={selectedPractitioner}
                service={selectedService}
                bookingRequest={latestBooking}
                onHome={handleHomeClick}
              />
            </motion.div>
          )}

          {currentScreen === "contact" && (
            <motion.div
              key="contact"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
            >
              <ContactView onBackToHome={handleHomeClick} />
            </motion.div>
          )}

          {currentScreen === "kundli" && (
            <motion.div
              key="kundli"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
            >
              <KundliView onBackToHome={handleHomeClick} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Trust & Policy Modals */}
      <VerificationModal isOpen={isVerificationOpen} onClose={() => setIsVerificationOpen(false)} />
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      {/* Development-only User Testing Observer Panel */}
      <PrototypeValidationObserver currentScreen={currentScreen} />
      
      {/* Centralized Developer Analytics Monitor */}
      <AnalyticsDebugger />
    </div>
  );
}

