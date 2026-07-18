import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  BarChart2, 
  Terminal, 
  RefreshCw, 
  Eye, 
  Settings, 
  Trash2, 
  Layers, 
  CheckCircle2, 
  HelpCircle, 
  Activity, 
  UserCheck, 
  Play, 
  Lock, 
  ChevronRight, 
  X,
  Plus,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertTriangle
} from "lucide-react";
import { analytics, AnalyticsEvent, EVENT_SPECIFICATIONS } from "../lib/analytics";

export default function AnalyticsDebugger() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"stream" | "metrics" | "funnel" | "catalog">("stream");
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [userState, setUserState] = useState(analytics.getUserState());
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [simulatorType, setSimulatorType] = useState<"abandon_birth" | "abandon_insight" | "completed">("abandon_birth");
  const [simulationCount, setSimulationCount] = useState(5);
  const [isObserverEnabled, setIsObserverEnabled] = useState(() => localStorage.getItem("setu_observer_enabled") === "true");

  const handleToggleObserver = () => {
    const nextVal = !isObserverEnabled;
    setIsObserverEnabled(nextVal);
    localStorage.setItem("setu_observer_enabled", String(nextVal));
    window.dispatchEvent(new Event("setu_observer_toggle"));
  };

  // Re-sync UI state when analytics events trigger
  useEffect(() => {
    const unsubscribe = analytics.subscribe(() => {
      setEvents(analytics.getCurrentSessionEvents());
      setUserState(analytics.getUserState());
    });

    // Populate initial state
    setEvents(analytics.getCurrentSessionEvents());
    setUserState(analytics.getUserState());

    return () => unsubscribe();
  }, []);

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all analytics tracking, including historical session metrics?")) {
      analytics.reset();
      setSelectedEventId(null);
    }
  };

  const handleSimulate = () => {
    analytics.addSimulatedSessions(simulationCount, simulatorType);
    alert(`Successfully added ${simulationCount} mock ${simulatorType.replace("_", " ")} sessions to history database!`);
  };

  const handleManualTrack = (eventName: string) => {
    analytics.track(eventName, { simulated: true, clicked_manually: true });
  };

  const currentMetrics = analytics.getMetrics();
  const funnelCounts = analytics.getFunnelCounts();

  // Sort events by newest first
  const reversedEvents = [...events].reverse();

  // Get selected event details
  const selectedEvent = events.find(e => e.id === selectedEventId);

  // Funnel names list in order of standard flow
  const funnelOrderedKeys = Object.keys(EVENT_SPECIFICATIONS);

  return (
    <>
      {/* Floating Toggle Bubble (Development Only badge) */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        <div className="bg-emerald-950/90 text-emerald-300 px-3 py-1 text-[10px] font-mono tracking-wider uppercase rounded-full border border-emerald-500/30 shadow-lg flex items-center gap-1.5 backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Dev Sandbox
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-maroon hover:bg-maroon/90 text-ivory p-3.5 rounded-full shadow-2xl flex items-center justify-center border border-gold/30 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          title="Open Analytics Debugger"
          id="analytics-debugger-toggle-btn"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Activity className="w-6 h-6 animate-pulse text-gold" />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 180 }}
            className="fixed inset-y-4 right-4 left-4 md:left-auto md:w-[620px] bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden text-stone-200"
          >
            {/* Debugger Header */}
            <div className="bg-stone-950 px-5 py-4 border-b border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Terminal className="w-5 h-5 text-gold" />
                <div>
                  <h3 className="font-sans font-bold text-sm tracking-wide text-ivory">SETU Analytics Monitor</h3>
                  <p className="text-[10px] font-mono text-stone-500">Session ID: {analytics.getSessionId()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleReset}
                  className="p-1.5 text-stone-400 hover:text-rose-400 hover:bg-stone-800 rounded transition-colors duration-150"
                  title="Reset session & history"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-stone-400 hover:text-ivory hover:bg-stone-800 rounded transition-colors duration-150"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* User Primary Activation Health Bar */}
            <div className="bg-stone-900/50 px-5 py-3.5 border-b border-stone-800/80">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-stone-300">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  Primary Activation Status:
                </div>
                {userState.activated ? (
                  <span className="bg-emerald-950 border border-emerald-500/30 text-emerald-300 text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-widest">
                    ACTIVATED USER
                  </span>
                ) : (
                  <span className="bg-amber-950/50 border border-amber-600/20 text-amber-300/80 text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-widest">
                    NOT YET ACTIVATED
                  </span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className={`p-2 rounded border text-center transition-colors duration-200 ${
                  userState.has_generated_insight 
                    ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300" 
                    : "bg-stone-950/50 border-stone-800 text-stone-500"
                }`}>
                  <p className="text-[10px] font-black uppercase tracking-wider">1. Insight</p>
                  <p className="text-[9px] mt-0.5">{userState.has_generated_insight ? "✓ Generated" : "⏳ Pending"}</p>
                </div>
                <div className={`p-2 rounded border text-center transition-colors duration-200 ${
                  userState.has_viewed_practitioners 
                    ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300" 
                    : "bg-stone-950/50 border-stone-800 text-stone-500"
                }`}>
                  <p className="text-[10px] font-black uppercase tracking-wider">2. Match Viewed</p>
                  <p className="text-[9px] mt-0.5">{userState.has_viewed_practitioners ? "✓ Viewed" : "⏳ Pending"}</p>
                </div>
                <div className={`p-2 rounded border text-center transition-colors duration-200 ${
                  userState.has_consultation_intent 
                    ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300" 
                    : "bg-stone-950/50 border-stone-800 text-stone-500"
                }`}>
                  <p className="text-[10px] font-black uppercase tracking-wider">3. Intent CTA</p>
                  <p className="text-[9px] mt-0.5">{userState.has_consultation_intent ? "✓ Intent Triggered" : "⏳ Pending"}</p>
                </div>
              </div>

              {/* Prototype testing panel trigger switch */}
              <div className="flex items-center justify-between mt-3.5 pt-3.5 border-t border-stone-800/80">
                <div className="flex items-center gap-1.5 text-xs text-stone-300 font-sans">
                  <Eye className="w-4 h-4 text-gold" />
                  <span>Moderated User Testing Console:</span>
                </div>
                <button
                  onClick={handleToggleObserver}
                  className={`px-3 py-1.5 text-[10px] font-mono rounded border transition-all duration-200 cursor-pointer ${
                    isObserverEnabled
                      ? "bg-emerald-950 border-emerald-500 text-emerald-300 font-bold"
                      : "bg-stone-950/60 border-stone-800 text-stone-400 hover:text-stone-300"
                  }`}
                  id="dev-sandbox-observer-toggle"
                >
                  {isObserverEnabled ? "ENABLED (Click to Hide)" : "DISABLED (Click to Enable)"}
                </button>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-stone-800 bg-stone-950/30 text-xs font-mono">
              <button
                onClick={() => setActiveTab("stream")}
                className={`flex-1 py-3 text-center border-b-2 transition-all duration-150 ${
                  activeTab === "stream" ? "border-gold text-gold font-bold bg-stone-900/30" : "border-transparent text-stone-400 hover:text-stone-200"
                }`}
              >
                Event Stream ({events.length})
              </button>
              <button
                onClick={() => setActiveTab("metrics")}
                className={`flex-1 py-3 text-center border-b-2 transition-all duration-150 ${
                  activeTab === "metrics" ? "border-gold text-gold font-bold bg-stone-900/30" : "border-transparent text-stone-400 hover:text-stone-200"
                }`}
              >
                Computed Metrics
              </button>
              <button
                onClick={() => setActiveTab("funnel")}
                className={`flex-1 py-3 text-center border-b-2 transition-all duration-150 ${
                  activeTab === "funnel" ? "border-gold text-gold font-bold bg-stone-900/30" : "border-transparent text-stone-400 hover:text-stone-200"
                }`}
              >
                Funnel Drop-offs
              </button>
              <button
                onClick={() => setActiveTab("catalog")}
                className={`flex-1 py-3 text-center border-b-2 transition-all duration-150 ${
                  activeTab === "catalog" ? "border-gold text-gold font-bold bg-stone-900/30" : "border-transparent text-stone-400 hover:text-stone-200"
                }`}
              >
                Specifications
              </button>
            </div>

            {/* Main Content Pane */}
            <div className="flex-grow overflow-y-auto p-5">
              
              {/* TAB 1: EVENT STREAM */}
              {activeTab === "stream" && (
                <div className="space-y-4">
                  {/* Event list */}
                  {reversedEvents.length === 0 ? (
                    <div className="text-center py-10 border border-dashed border-stone-800 rounded-xl bg-stone-900/20">
                      <Terminal className="w-10 h-10 text-stone-600 mx-auto mb-3" />
                      <p className="text-sm font-sans font-bold text-stone-400">No events captured yet</p>
                      <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">Click through the onboarding wizard, choose a Priest, or schedule a booking to view events stream in real time.</p>
                      
                      <div className="mt-6 flex flex-wrap justify-center gap-2 px-4">
                        <button 
                          onClick={() => handleManualTrack("landing_viewed")} 
                          className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-[10px] font-mono rounded text-gold transition-colors duration-100"
                        >
                          + Trigger landing_viewed
                        </button>
                        <button 
                          onClick={() => handleManualTrack("concern_selected")} 
                          className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-[10px] font-mono rounded text-gold transition-colors duration-100"
                        >
                          + Trigger concern_selected
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[350px]">
                      {/* Left Side: Scrolling Event list */}
                      <div className="border border-stone-800 rounded-xl bg-stone-950/40 p-2 overflow-y-auto h-full space-y-1">
                        <p className="text-[10px] font-mono text-stone-500 px-2 py-1 uppercase tracking-wider border-b border-stone-800/60 mb-1.5">Stream (Newest First)</p>
                        {reversedEvents.map((evt) => {
                          const isSelected = evt.id === selectedEventId;
                          return (
                            <button
                              key={evt.id}
                              onClick={() => setSelectedEventId(evt.id)}
                              className={`w-full text-left px-2.5 py-2 rounded-lg transition-all duration-150 font-mono text-xs flex items-center justify-between border ${
                                isSelected 
                                  ? "bg-gold/10 border-gold/40 text-gold" 
                                  : "bg-transparent border-transparent hover:bg-stone-800/50 text-stone-300"
                              }`}
                            >
                              <div className="flex items-center gap-1.5 truncate">
                                <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-gold animate-ping" : "bg-stone-600"}`} />
                                <span className="font-bold truncate">{evt.name}</span>
                              </div>
                              <span className="text-[9px] text-stone-500 shrink-0">{evt.timeString}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Right Side: Event Details */}
                      <div className="border border-stone-800 rounded-xl bg-stone-950/80 p-4 overflow-y-auto h-full text-xs">
                        {selectedEvent ? (
                          <div className="space-y-3">
                            <div className="border-b border-stone-800 pb-2">
                              <p className="text-[10px] font-mono text-gold uppercase tracking-wider">Event Details</p>
                              <h4 className="font-sans font-black text-sm text-ivory mt-0.5">{selectedEvent.name}</h4>
                              <p className="text-[10px] font-sans text-stone-400 mt-1 italic">
                                <strong className="font-bold">Trigger:</strong> {selectedEvent.trigger}
                              </p>
                            </div>

                            {/* Privacy constraints section */}
                            <div className="bg-stone-900 border border-stone-800/80 rounded p-2 flex gap-2">
                              <Lock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                              <div>
                                <p className="text-[9px] font-mono text-amber-500 font-bold uppercase">Privacy Safeguard</p>
                                <p className="text-[9px] font-sans text-stone-400 leading-tight mt-0.5">{selectedEvent.privacy_restrictions}</p>
                              </div>
                            </div>

                            {/* Captured properties */}
                            <div>
                              <p className="text-[10px] font-mono text-stone-500 font-bold mb-1 uppercase">Properties Payload</p>
                              <pre className="p-2.5 bg-stone-950 border border-stone-800 rounded text-[10px] font-mono text-stone-300 overflow-x-auto whitespace-pre-wrap max-h-36">
                                {JSON.stringify(selectedEvent.properties, null, 2)}
                              </pre>
                            </div>

                            {/* Snapshot user state */}
                            <div>
                              <p className="text-[10px] font-mono text-stone-500 font-bold mb-1 uppercase">User State Snapshot</p>
                              <div className="grid grid-cols-2 gap-1.5 font-mono text-[9px] text-stone-400">
                                <div className="bg-stone-900/50 p-1.5 rounded flex justify-between">
                                  <span>Activated:</span>
                                  <span className={selectedEvent.user_state.activated ? "text-emerald-400 font-bold" : "text-stone-500"}>
                                    {String(selectedEvent.user_state.activated)}
                                  </span>
                                </div>
                                <div className="bg-stone-900/50 p-1.5 rounded flex justify-between">
                                  <span>Has Insight:</span>
                                  <span className={selectedEvent.user_state.has_generated_insight ? "text-emerald-400 font-bold" : "text-stone-500"}>
                                    {String(selectedEvent.user_state.has_generated_insight)}
                                  </span>
                                </div>
                                <div className="bg-stone-900/50 p-1.5 rounded flex justify-between">
                                  <span>Matched Priest:</span>
                                  <span className={selectedEvent.user_state.has_viewed_practitioners ? "text-emerald-400 font-bold" : "text-stone-500"}>
                                    {String(selectedEvent.user_state.has_viewed_practitioners)}
                                  </span>
                                </div>
                                <div className="bg-stone-900/50 p-1.5 rounded flex justify-between">
                                  <span>Intent Action:</span>
                                  <span className={selectedEvent.user_state.has_consultation_intent ? "text-emerald-400 font-bold" : "text-stone-500"}>
                                    {String(selectedEvent.user_state.has_consultation_intent)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center text-center text-stone-500 py-6">
                            <Eye className="w-8 h-8 text-stone-700 mb-2" />
                            <p className="text-xs font-sans">Select an event from the left pane to view its sanitized payloads and privacy rules.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Manual trigger toolbelt */}
                  <div className="border border-stone-800 rounded-xl p-4 bg-stone-950/20">
                    <p className="text-xs font-bold text-stone-300 mb-2.5 flex items-center gap-1.5">
                      <Settings className="w-4 h-4 text-gold" />
                      Testing Panel & Event Injector
                    </p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {funnelOrderedKeys.map(key => (
                        <button
                          key={key}
                          onClick={() => handleManualTrack(key)}
                          className="px-2 py-1 bg-stone-900 hover:bg-stone-800 border border-stone-800 hover:border-stone-700 rounded text-[9px] font-mono text-stone-300 flex items-center gap-1 transition-colors duration-150"
                        >
                          <Plus className="w-3 h-3 text-gold" />
                          {key}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: COMPUTED METRICS */}
              {activeTab === "metrics" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Time to First Insight */}
                    <div className="p-4 bg-stone-950/60 border border-stone-800 rounded-xl space-y-1">
                      <div className="flex items-center gap-1.5 text-stone-400 text-[10px] font-mono uppercase">
                        <Clock className="w-3.5 h-3.5 text-gold" />
                        Time to First Insight
                      </div>
                      <p className="text-2xl font-sans font-black text-ivory">
                        {currentMetrics.timeToFirstInsight !== null 
                          ? `${currentMetrics.timeToFirstInsight}s` 
                          : "⏳ Awaiting flow..."}
                      </p>
                      <p className="text-[10px] text-stone-500 leading-tight">
                        Duration from landing view to first successful display of personalized insight coordinates.
                      </p>
                    </div>

                    {/* Time to Trusted Next Step */}
                    <div className="p-4 bg-stone-950/60 border border-stone-800 rounded-xl space-y-1">
                      <div className="flex items-center gap-1.5 text-stone-400 text-[10px] font-mono uppercase">
                        <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                        Time to Trusted Next Step
                      </div>
                      <p className="text-2xl font-sans font-black text-ivory">
                        {currentMetrics.timeToTrustedNextStep !== null 
                          ? `${currentMetrics.timeToTrustedNextStep}s` 
                          : "⏳ Awaiting match..."}
                      </p>
                      <p className="text-[10px] text-stone-500 leading-tight">
                        Duration from viewing the celestial insight to exploring practitioner recommendation lists or profile bios.
                      </p>
                    </div>

                    {/* Birth Details Abandonment */}
                    <div className="p-4 bg-stone-950/60 border border-stone-800 rounded-xl space-y-1">
                      <div className="flex items-center gap-1.5 text-stone-400 text-[10px] font-mono uppercase">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                        Birth Details Abandonment
                      </div>
                      <p className={`text-2xl font-sans font-black ${currentMetrics.birthAbandonmentRate > 40 ? "text-rose-400" : "text-emerald-400"}`}>
                        {currentMetrics.birthAbandonmentRate}%
                      </p>
                      <p className="text-[10px] text-stone-500 leading-tight">
                        Percentage of session cohorts that opened the birth coordinates form but did NOT submit/complete it.
                      </p>
                    </div>

                    {/* Insight-to-practitioner conversion */}
                    <div className="p-4 bg-stone-950/60 border border-stone-800 rounded-xl space-y-1">
                      <div className="flex items-center gap-1.5 text-stone-400 text-[10px] font-mono uppercase">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                        Insight to Match Rate
                      </div>
                      <p className="text-2xl font-sans font-black text-emerald-400">
                        {currentMetrics.insightToPractitionerRate}%
                      </p>
                      <p className="text-[10px] text-stone-500 leading-tight">
                        Cohort conversion from reading personalized cosmic insight to viewing matched priest recommendations.
                      </p>
                    </div>

                    {/* Practitioner-to-booking conversion */}
                    <div className="p-4 bg-stone-950/60 border border-stone-800 rounded-xl space-y-1">
                      <div className="flex items-center gap-1.5 text-stone-400 text-[10px] font-mono uppercase">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                        Profile to Booking Rate
                      </div>
                      <p className="text-2xl font-sans font-black text-emerald-400">
                        {currentMetrics.practitionerToBookingRate}%
                      </p>
                      <p className="text-[10px] text-stone-500 leading-tight">
                        Cohort conversion from browsing a specific priest profile details to clicking the book service CTA.
                      </p>
                    </div>

                    {/* Booking-to-deposit conversion */}
                    <div className="p-4 bg-stone-950/60 border border-stone-800 rounded-xl space-y-1">
                      <div className="flex items-center gap-1.5 text-stone-400 text-[10px] font-mono uppercase">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                        Booking to Escrow Rate
                      </div>
                      <p className="text-2xl font-sans font-black text-emerald-400">
                        {currentMetrics.bookingToDepositRate}%
                      </p>
                      <p className="text-[10px] text-stone-500 leading-tight">
                        Cohort conversion from opening the booking form to successfully completing holding deposit escrow lock.
                      </p>
                    </div>
                  </div>

                  {/* History Simulator */}
                  <div className="border border-stone-800 rounded-xl p-4 bg-stone-950/20 mt-4">
                    <p className="text-xs font-bold text-stone-300 mb-2.5 flex items-center gap-1.5">
                      <RefreshCw className="w-4 h-4 text-gold" />
                      Session Cohort Generator (Simulation)
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1 flex flex-col gap-1.5">
                        <label className="text-[9px] uppercase font-mono text-stone-500">Cohort Flow Type</label>
                        <select
                          value={simulatorType}
                          onChange={(e) => setSimulatorType(e.target.value as any)}
                          className="bg-stone-900 border border-stone-800 rounded p-1.5 text-xs text-stone-300 focus:outline-none focus:border-gold"
                        >
                          <option value="abandon_birth">Abandon at Birth Form (increases abandonment %)</option>
                          <option value="abandon_insight">Abandon at Insight View</option>
                          <option value="completed">Complete Funnel (increases conversion %)</option>
                        </select>
                      </div>
                      <div className="w-20 flex flex-col gap-1.5">
                        <label className="text-[9px] uppercase font-mono text-stone-500">Sessions</label>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={simulationCount}
                          onChange={(e) => setSimulationCount(parseInt(e.target.value) || 5)}
                          className="bg-stone-900 border border-stone-800 rounded p-1.5 text-xs text-stone-300 text-center focus:outline-none focus:border-gold"
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          onClick={handleSimulate}
                          className="w-full sm:w-auto px-4 py-2 bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 text-stone-100 font-sans font-bold text-xs rounded shadow transition-all duration-150 flex items-center gap-1.5 justify-center cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5" />
                          Generate Cohort
                        </button>
                      </div>
                    </div>
                    <p className="text-[9px] text-stone-500 mt-2.5">
                      Note: These generated sessions are committed to local session history to test calculated drop-off curves. Resetting will clear them.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 3: FUNNEL DROP-OFFS */}
              {activeTab === "funnel" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-gold" />
                      14-Stage Measurable Funnel (Cohort Reach)
                    </p>
                    <span className="text-[9px] font-mono text-stone-500">Active sessions tracked: {analytics.getAllSessions().length}</span>
                  </div>

                  <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
                    {funnelOrderedKeys.map((key, idx) => {
                      const count = funnelCounts[key] || 0;
                      // Calculate percentage compared to landing_viewed (top of funnel)
                      const topCount = funnelCounts["landing_viewed"] || 1;
                      const pctOfTop = topCount > 0 ? Math.round((count / topCount) * 100) : 0;
                      
                      // Calculate step-to-step conversion
                      const prevKey = idx > 0 ? funnelOrderedKeys[idx - 1] : null;
                      const prevCount = prevKey ? (funnelCounts[prevKey] || 0) : count;
                      const stepConv = prevCount > 0 ? Math.round((count / prevCount) * 100) : 0;

                      return (
                        <div key={key} className="bg-stone-950/40 border border-stone-800/60 p-2 rounded-lg flex items-center justify-between gap-4 font-mono text-xs">
                          <div className="flex items-center gap-2 min-w-0 flex-grow">
                            <span className="text-[10px] text-stone-500 w-5 text-right font-bold">{idx + 1}.</span>
                            <div className="min-w-0">
                              <p className="font-bold text-stone-300 truncate">{key}</p>
                              <div className="w-32 bg-stone-900 h-1.5 rounded-full mt-1 overflow-hidden">
                                <div 
                                  className="bg-gold h-full rounded-full transition-all duration-500" 
                                  style={{ width: `${pctOfTop}%` }}
                                />
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 shrink-0 text-right">
                            <div>
                              <p className="text-stone-300 font-bold">{count} <span className="text-[9px] text-stone-500 font-normal">sess</span></p>
                              <p className="text-[9px] text-stone-500 mt-0.5">{pctOfTop}% of top</p>
                            </div>
                            {idx > 0 && (
                              <div className="bg-stone-900 border border-stone-800 rounded px-1.5 py-0.5 text-center min-w-[55px]">
                                <p className="text-[8px] text-stone-500">Step Conv</p>
                                <p className={`text-[10px] font-bold ${stepConv >= 80 ? "text-emerald-400" : stepConv >= 50 ? "text-amber-400" : "text-rose-400"}`}>
                                  {stepConv}%
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 4: SPECIFICATIONS */}
              {activeTab === "catalog" && (
                <div className="space-y-4">
                  <p className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Measurement and Privacy Rules Dictionary
                  </p>
                  
                  <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
                    {funnelOrderedKeys.map((key, idx) => {
                      const spec = EVENT_SPECIFICATIONS[key];
                      return (
                        <div key={key} className="bg-stone-950/60 border border-stone-800 p-3.5 rounded-xl space-y-2">
                          <div className="flex items-center justify-between pb-1 border-b border-stone-800">
                            <span className="text-[10px] font-mono text-gold font-bold">{idx + 1}. {key}</span>
                            <span className="bg-stone-900 text-stone-400 text-[8px] px-1.5 py-0.5 rounded uppercase font-mono">Stage</span>
                          </div>
                          <div className="space-y-1.5 text-[11px] leading-relaxed">
                            <p className="text-stone-300">
                              <strong className="text-stone-400 font-bold">Trigger:</strong> {spec.trigger}
                            </p>
                            <p className="text-stone-400">
                              <strong className="text-stone-500 font-bold">Req Props:</strong> <code className="text-stone-300 bg-stone-900 px-1 py-0.5 rounded text-[9px]">{spec.required_properties.join(", ")}</code>
                            </p>
                            {spec.optional_properties.length > 0 && (
                              <p className="text-stone-400">
                                <strong className="text-stone-500 font-bold">Opt Props:</strong> <code className="text-stone-300 bg-stone-900 px-1 py-0.5 rounded text-[9px]">{spec.optional_properties.join(", ")}</code>
                              </p>
                            )}
                            <div className="bg-stone-900/40 p-2 border border-stone-800 rounded flex gap-1.5 mt-2 text-[10px] text-amber-500/80">
                              <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                              <p>
                                <strong className="font-bold">Privacy Restrictions:</strong> {spec.privacy_restrictions}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>

            {/* Footer status indicator */}
            <div className="bg-stone-950 px-5 py-3 border-t border-stone-800 flex items-center justify-between text-[10px] font-mono text-stone-500">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                Live Core Connected
              </span>
              <span>SETU v1.0 • Dev Mode</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
