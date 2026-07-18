import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Activity,
  Play,
  CheckCircle2,
  AlertTriangle,
  Download,
  Trash2,
  FileSpreadsheet,
  Plus,
  BookOpen,
  Clock,
  MessageSquare,
  HelpCircle,
  X,
  FileText,
  UserCheck,
  ShieldCheck,
  AlertCircle,
  RotateCcw,
  MousePointer,
  Sparkles,
  Award
} from "lucide-react";

// Types matching requested prototype validation metrics
export interface SessionFinding {
  id: string;
  timestamp: string;
  screen: string;
  severity: 1 | 2 | 3;
  quote: string;
  expectedBehavior: string;
  actualBehavior: string;
  frictionHypothesis: string;
  recommendedChange: string;
}

export interface ObserverSession {
  id: string;
  startTime: number;
  consentGiven: boolean;
  screensVisited: Record<string, number>; // screenKey -> total seconds
  pauses: { id: string; startTime: string; screen: string; durationMs: number }[];
  deadClicks: { timestamp: string; screen: string; targetTag: string; targetClasses: string; x: number; y: number }[];
  backtracks: { timestamp: string; from: string; to: string }[];
  validationErrors: { timestamp: string; screen: string; message: string }[];
  taskCompletion: "in-progress" | "completed" | "abandoned";
  abandonmentPoint?: string;
  notes: string;
  findings: SessionFinding[];
}

interface PrototypeValidationObserverProps {
  currentScreen: string;
}

const SCREEN_SEQUENCE = [
  "onboarding-welcome",
  "onboarding-concern",
  "onboarding-birth-details",
  "onboarding-loading",
  "onboarding-insight-results",
  "directory",
  "profile",
  "booking-request",
  "request-received",
  "booking-secured"
];

const SCREEN_HUMAN_NAMES: Record<string, string> = {
  "onboarding-welcome": "Onboarding: Welcome",
  "onboarding-concern": "Onboarding: Concern Selection",
  "onboarding-birth-details": "Onboarding: Birth Details Form",
  "onboarding-loading": "Onboarding: Loading Mandala",
  "onboarding-insight-results": "Onboarding: Insights Results",
  "directory": "Main: Priest Directory",
  "profile": "Main: Priest Profile Customizer",
  "booking-request": "Main: Sankalpa Checkout Form",
  "request-received": "Main: Booking Request Pending",
  "booking-secured": "Main: Booking Confirmed & Secured"
};

export default function PrototypeValidationObserver({ currentScreen }: PrototypeValidationObserverProps) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"telemetry" | "finding" | "findings_log" | "checklist">("telemetry");

  // Onboarding internal step broadcast state
  const [onboardingStep, setOnboardingStep] = useState("welcome");

  // Observer Session State
  const [session, setSession] = useState<ObserverSession>(() => {
    const saved = localStorage.getItem("setu_prototype_testing_session");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback to fresh setup
      }
    }
    return {
      id: "sess-test-" + Math.random().toString(36).substring(2, 9),
      startTime: Date.now(),
      consentGiven: false,
      screensVisited: {},
      pauses: [],
      deadClicks: [],
      backtracks: [],
      validationErrors: [],
      taskCompletion: "in-progress",
      notes: "",
      findings: []
    };
  });

  // Diagnostic questions list
  const DIAGNOSTIC_QUESTIONS = [
    "What did you expect to happen when you clicked that?",
    "Where did you experience the most hesitation or friction?",
    "How clear was the connection between your birth data and the recommendation?",
    "What felt like the most 'trustworthy' element on that screen? What felt questionable?",
    "Could you explain what the refund/deposit policy means in your own words?"
  ];

  // Protocol Checklist State
  const [checklist, setChecklist] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem("setu_prototype_checklist");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      outcomeGiven: false,
      noRescuing: false,
      noteConfusion: false,
      postTaskDiagnostics: false
    };
  });

  // Active inputs for Logging a Finding
  const [quote, setQuote] = useState("");
  const [expectedBehavior, setExpectedBehavior] = useState("");
  const [actualBehavior, setActualBehavior] = useState("");
  const [frictionHypothesis, setFrictionHypothesis] = useState("");
  const [recommendedChange, setRecommendedChange] = useState("");
  const [severity, setSeverity] = useState<1 | 2 | 3>(1);
  const [isEditingFindingId, setIsEditingFindingId] = useState<string | null>(null);

  // Inactive pause detection states
  const [activePauseId, setActivePauseId] = useState<string | null>(null);
  const [activePauseStart, setActivePauseStart] = useState<number | null>(null);

  // Refs for tracking active screen
  const activeScreenRef = useRef<string>("");
  const enteredAtRef = useRef<number>(Date.now());
  const prevScreenIndexRef = useRef<number>(-1);

  // Resolve fully qualified active screen name
  const getActiveScreenKey = (): string => {
    if (currentScreen === "onboarding") {
      return `onboarding-${onboardingStep}`;
    }
    return currentScreen;
  };

  const activeScreenKey = getActiveScreenKey();

  // Save checklist state to localStorage
  useEffect(() => {
    localStorage.setItem("setu_prototype_checklist", JSON.stringify(checklist));
  }, [checklist]);

  // Save session state to localStorage
  useEffect(() => {
    localStorage.setItem("setu_prototype_testing_session", JSON.stringify(session));
  }, [session]);

  // Read URL query parameter on load & support checking local storage
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hasObserverParam = params.get("observer") === "true";
    const savedEnabled = localStorage.getItem("setu_observer_enabled") === "true";
    
    if (hasObserverParam || savedEnabled) {
      setIsEnabled(true);
      // Automatically keep it in local storage to persist across reloads
      localStorage.setItem("setu_observer_enabled", "true");
    }

    // Listen to custom listener to toggle observer panel via local storage / dev debugger
    const handleObserverToggle = () => {
      const isNowEnabled = localStorage.getItem("setu_observer_enabled") === "true";
      setIsEnabled(isNowEnabled);
    };

    window.addEventListener("setu_observer_toggle", handleObserverToggle);
    return () => window.removeEventListener("setu_observer_toggle", handleObserverToggle);
  }, []);

  // Listen for onboarding step changes
  useEffect(() => {
    const handleStepChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.step) {
        setOnboardingStep(customEvent.detail.step);
      }
    };

    window.addEventListener("onboarding_step_changed", handleStepChange);
    return () => window.removeEventListener("onboarding_step_changed", handleStepChange);
  }, []);

  // Listen for validation errors
  useEffect(() => {
    const handleValidationError = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && session.consentGiven) {
        const { screen, message } = customEvent.detail;
        setSession(prev => ({
          ...prev,
          validationErrors: [
            ...prev.validationErrors,
            {
              timestamp: new Date().toLocaleTimeString(),
              screen: SCREEN_HUMAN_NAMES[screen] || screen,
              message
            }
          ]
        }));
      }
    };

    window.addEventListener("prototype_validation_error", handleValidationError);
    return () => window.removeEventListener("prototype_validation_error", handleValidationError);
  }, [session.consentGiven]);

  // Auto detect screen changes, durations, and backtracking
  useEffect(() => {
    if (!session.consentGiven) return;

    const currentKey = activeScreenKey;
    const now = Date.now();
    const currentIndex = SCREEN_SEQUENCE.indexOf(currentKey);

    // Save previous screen duration
    if (activeScreenRef.current && activeScreenRef.current !== currentKey) {
      const elapsedSeconds = Math.round((now - enteredAtRef.current) / 1000);
      setSession(prev => {
        const updatedScreens = { ...prev.screensVisited };
        updatedScreens[activeScreenRef.current] = (updatedScreens[activeScreenRef.current] || 0) + elapsedSeconds;
        return {
          ...prev,
          screensVisited: updatedScreens
        };
      });
    }

    // Auto detect backtracking
    if (prevScreenIndexRef.current !== -1 && currentIndex !== -1) {
      if (currentIndex < prevScreenIndexRef.current) {
        const fromScreen = SCREEN_SEQUENCE[prevScreenIndexRef.current];
        setSession(prev => ({
          ...prev,
          backtracks: [
            ...prev.backtracks,
            {
              timestamp: new Date().toLocaleTimeString(),
              from: SCREEN_HUMAN_NAMES[fromScreen] || fromScreen,
              to: SCREEN_HUMAN_NAMES[currentKey] || currentKey
            }
          ]
        }));
      }
    }

    // Track Task Completion
    if (currentKey === "booking-secured") {
      setSession(prev => ({
        ...prev,
        taskCompletion: "completed"
      }));
    }

    // Update refs
    activeScreenRef.current = currentKey;
    enteredAtRef.current = now;
    if (currentIndex !== -1) {
      prevScreenIndexRef.current = currentIndex;
    }
  }, [activeScreenKey, session.consentGiven]);

  // 1-second interval to increment live duration for active screen
  useEffect(() => {
    if (!session.consentGiven || !isOpen) return;

    const interval = setInterval(() => {
      setSession(prev => {
        const currentKey = activeScreenRef.current || getActiveScreenKey();
        const updatedScreens = { ...prev.screensVisited };
        updatedScreens[currentKey] = (updatedScreens[currentKey] || 0) + 1;
        return {
          ...prev,
          screensVisited: updatedScreens
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [session.consentGiven, isOpen, onboardingStep, currentScreen]);

  // Global Click listener for dead clicks
  useEffect(() => {
    if (!session.consentGiven) return;

    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      // Check if click was on or inside an interactive element
      const isInteractive = target.closest(
        'button, a, input, select, textarea, [role="button"], [onclick], .cursor-pointer, svg, h1, h2, h3, h4, iframe'
      );

      if (!isInteractive) {
        // Also ensure they aren't highlighting text
        const selection = window.getSelection()?.toString();
        if (selection && selection.trim() !== "") return;

        setSession(prev => ({
          ...prev,
          deadClicks: [
            ...prev.deadClicks,
            {
              timestamp: new Date().toLocaleTimeString(),
              screen: SCREEN_HUMAN_NAMES[activeScreenKey] || activeScreenKey,
              targetTag: target.tagName.toLowerCase(),
              targetClasses: target.className ? String(target.className).slice(0, 50) : "no-classes",
              x: e.clientX,
              y: e.clientY
            }
          ]
        }));
      }
    };

    window.addEventListener("click", handleGlobalClick);
    return () => window.removeEventListener("click", handleGlobalClick);
  }, [activeScreenKey, session.consentGiven]);

  // Inactivity pause detector (pauses longer than 3 seconds)
  useEffect(() => {
    if (!session.consentGiven) return;

    let inactivityTimer: NodeJS.Timeout;
    let lastActivity = Date.now();

    const resetInactivity = () => {
      const now = Date.now();

      // Complete active pause if we were inside one
      if (activePauseId && activePauseStart) {
        const duration = now - activePauseStart;
        if (duration >= 3000) {
          setSession(prev => {
            // Avoid duplicate additions
            if (prev.pauses.some(p => p.id === activePauseId)) {
              return {
                ...prev,
                pauses: prev.pauses.map(p =>
                  p.id === activePauseId ? { ...p, durationMs: duration } : p
                )
              };
            }
            return {
              ...prev,
              pauses: [
                ...prev.pauses,
                {
                  id: activePauseId,
                  startTime: new Date(activePauseStart).toLocaleTimeString(),
                  screen: SCREEN_HUMAN_NAMES[activeScreenKey] || activeScreenKey,
                  durationMs: duration
                }
              ]
            };
          });
        }
        setActivePauseId(null);
        setActivePauseStart(null);
      }

      lastActivity = now;
      clearTimeout(inactivityTimer);

      inactivityTimer = setTimeout(() => {
        // 3 seconds of perfect stillness reached, mark start of pause event
        const pauseId = "pause-" + Math.random().toString(36).substring(2, 7);
        setActivePauseId(pauseId);
        setActivePauseStart(lastActivity);
      }, 3000);
    };

    const activityEvents = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    activityEvents.forEach(e => window.addEventListener(e, resetInactivity));

    // Run initial timer
    inactivityTimer = setTimeout(() => {
      const pauseId = "pause-" + Math.random().toString(36).substring(2, 7);
      setActivePauseId(pauseId);
      setActivePauseStart(lastActivity);
    }, 3000);

    return () => {
      clearTimeout(inactivityTimer);
      activityEvents.forEach(e => window.removeEventListener(e, resetInactivity));
    };
  }, [activeScreenKey, activePauseId, activePauseStart, session.consentGiven]);

  // Reset Session
  const handleResetSession = () => {
    if (window.confirm("Are you sure you want to completely clear and reset the current user testing observer session?")) {
      const freshSession: ObserverSession = {
        id: "sess-test-" + Math.random().toString(36).substring(2, 9),
        startTime: Date.now(),
        consentGiven: false,
        screensVisited: {},
        pauses: [],
        deadClicks: [],
        backtracks: [],
        validationErrors: [],
        taskCompletion: "in-progress",
        notes: "",
        findings: []
      };
      setSession(freshSession);
      setChecklist({
        outcomeGiven: false,
        noRescuing: false,
        noteConfusion: false,
        postTaskDiagnostics: false
      });
      // Clear inputs
      setQuote("");
      setExpectedBehavior("");
      setActualBehavior("");
      setFrictionHypothesis("");
      setRecommendedChange("");
      setSeverity(1);
      setIsEditingFindingId(null);
    }
  };

  // Log Finding
  const handleSaveFinding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expectedBehavior.trim() || !actualBehavior.trim()) {
      alert("Expected and Actual behavior fields are required to log an observation finding.");
      return;
    }

    if (isEditingFindingId) {
      // Edit mode
      setSession(prev => ({
        ...prev,
        findings: prev.findings.map(f =>
          f.id === isEditingFindingId
            ? {
                ...f,
                severity,
                quote: quote.trim(),
                expectedBehavior: expectedBehavior.trim(),
                actualBehavior: actualBehavior.trim(),
                frictionHypothesis: frictionHypothesis.trim(),
                recommendedChange: recommendedChange.trim()
              }
            : f
        )
      }));
      setIsEditingFindingId(null);
      alert("Observation finding updated successfully!");
    } else {
      // Create mode
      const newFinding: SessionFinding = {
        id: "find-" + Math.random().toString(36).substring(2, 7),
        timestamp: new Date().toLocaleTimeString(),
        screen: SCREEN_HUMAN_NAMES[activeScreenKey] || activeScreenKey,
        severity,
        quote: quote.trim(),
        expectedBehavior: expectedBehavior.trim(),
        actualBehavior: actualBehavior.trim(),
        frictionHypothesis: frictionHypothesis.trim(),
        recommendedChange: recommendedChange.trim()
      };
      setSession(prev => ({
        ...prev,
        findings: [...prev.findings, newFinding]
      }));
      alert("New observation finding logged successfully!");
    }

    // Clear inputs and transition tab
    setQuote("");
    setExpectedBehavior("");
    setActualBehavior("");
    setFrictionHypothesis("");
    setRecommendedChange("");
    setSeverity(1);
    setActiveTab("findings_log");
  };

  // Edit finding
  const handleEditFinding = (finding: SessionFinding) => {
    setIsEditingFindingId(finding.id);
    setSeverity(finding.severity);
    setQuote(finding.quote);
    setExpectedBehavior(finding.expectedBehavior);
    setActualBehavior(finding.actualBehavior);
    setFrictionHypothesis(finding.frictionHypothesis);
    setRecommendedChange(finding.recommendedChange);
    setActiveTab("finding");
  };

  // Delete finding
  const handleDeleteFinding = (id: string) => {
    if (window.confirm("Remove this logged finding?")) {
      setSession(prev => ({
        ...prev,
        findings: prev.findings.filter(f => f.id !== id)
      }));
    }
  };

  // Save general observer notes
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setSession(prev => ({ ...prev, notes: value }));
  };

  // Mark abandonment point
  const handleMarkAbandoned = () => {
    if (window.confirm("Mark the current session as abandoned? This records the current screen as the friction exit point.")) {
      setSession(prev => ({
        ...prev,
        taskCompletion: "abandoned",
        abandonmentPoint: SCREEN_HUMAN_NAMES[activeScreenKey] || activeScreenKey
      }));
    }
  };

  // Export as JSON
  const handleExportJSON = () => {
    const dataStr = JSON.stringify(session, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `SETU_Prototype_Session_${session.id}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Export as CSV
  const handleExportCSV = () => {
    const headers = [
      "Session ID",
      "Consent Given",
      "Task Status",
      "Abandonment Point",
      "Finding ID",
      "Timestamp",
      "Screen",
      "Severity",
      "User Quote",
      "Expected Behavior",
      "Actual Behavior",
      "Friction Hypothesis",
      "Recommended Change",
      "General Session Notes",
      "Dead Clicks Count",
      "Pauses Count",
      "Backtracks Count"
    ];

    const escape = (str: string) => `"${String(str).replace(/"/g, '""')}"`;

    let rows: string[][] = [];

    if (session.findings.length === 0) {
      // Export at least the general session stats and notes if no findings are logged yet
      rows.push([
        session.id,
        String(session.consentGiven),
        session.taskCompletion,
        session.abandonmentPoint || "N/A",
        "N/A",
        "N/A",
        "N/A",
        "N/A",
        "N/A",
        "N/A",
        "N/A",
        "N/A",
        "N/A",
        session.notes,
        String(session.deadClicks.length),
        String(session.pauses.length),
        String(session.backtracks.length)
      ]);
    } else {
      session.findings.forEach(f => {
        rows.push([
          session.id,
          String(session.consentGiven),
          session.taskCompletion,
          session.abandonmentPoint || "N/A",
          f.id,
          f.timestamp,
          f.screen,
          `Severity ${f.severity}`,
          f.quote,
          f.expectedBehavior,
          f.actualBehavior,
          f.frictionHypothesis,
          f.recommendedChange,
          session.notes,
          String(session.deadClicks.length),
          String(session.pauses.length),
          String(session.backtracks.length)
        ]);
      });
    }

    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.map(cell => escape(cell)).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `SETU_Prototype_Session_${session.id}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Toggle toggleChecklist
  const toggleChecklist = (key: string) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (!isEnabled) return null;

  return (
    <>
      {/* Floating Activation Handle for Observers */}
      <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-2">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-stone-900 hover:bg-stone-800 text-gold hover:text-white border border-gold/30 hover:border-gold px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 font-mono text-xs uppercase tracking-wider hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          id="prototype-observer-panel-trigger"
        >
          <Award className="w-4 h-4 text-gold animate-pulse" />
          Observer Console
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end">
            {/* Click backdrop to close */}
            <div className="absolute inset-0" onClick={() => setIsOpen(false)} />

            {/* Main Observer Drawer Container */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="relative w-full max-w-lg md:max-w-xl h-full bg-stone-950 border-l border-stone-800 shadow-2xl flex flex-col overflow-hidden text-stone-200"
              id="observer-drawer-panel"
            >
              {/* Header */}
              <div className="bg-stone-900 px-5 py-4 border-b border-stone-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Activity className="w-5 h-5 text-gold" />
                  <div>
                    <h3 className="font-sans font-bold text-sm tracking-wide text-white uppercase">
                      SETU Moderated User Testing Console
                    </h3>
                    <p className="text-[10px] font-mono text-stone-400">
                      ID: {session.id} | Realtime Diagnostics Mode
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-stone-400 hover:text-white hover:bg-stone-800 rounded transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Consent Guard & Start Panel */}
              {!session.consentGiven ? (
                <div className="flex-grow p-6 flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-6">
                  <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-gold">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-sans font-bold text-base text-white">Observer Consent Protocol Required</h4>
                    <p className="text-xs text-stone-400 mt-2 leading-relaxed">
                      To adhere strictly to privacy guidelines, this prototype user-testing module **does not** capture video feeds, microphone audio, or keystrokes. 
                    </p>
                    <p className="text-xs text-stone-400 mt-2 leading-relaxed">
                      Activating session recording requires confirming explicit verbal or written tester consent to trace standard navigation flow metrics.
                    </p>
                  </div>

                  <button
                    onClick={() => setSession(prev => ({ ...prev, consentGiven: true, startTime: Date.now() }))}
                    className="w-full bg-gold hover:bg-gold/90 text-stone-950 font-sans font-black uppercase text-xs tracking-wider py-3.5 px-6 rounded-lg transition shadow-lg active:scale-95 cursor-pointer"
                  >
                    Confirm Consent & Start Session
                  </button>
                </div>
              ) : (
                <>
                  {/* Tab Navigation */}
                  <div className="flex border-b border-stone-800 bg-stone-900 text-[10px] font-mono tracking-wider uppercase font-bold text-stone-400 select-none">
                    <button
                      onClick={() => setActiveTab("telemetry")}
                      className={`flex-1 py-3 border-b-2 transition ${
                        activeTab === "telemetry"
                          ? "border-gold text-gold bg-stone-950/40"
                          : "border-transparent hover:text-stone-200"
                      }`}
                    >
                      Live Stats
                    </button>
                    <button
                      onClick={() => setActiveTab("finding")}
                      className={`flex-1 py-3 border-b-2 transition ${
                        activeTab === "finding"
                          ? "border-gold text-gold bg-stone-950/40"
                          : "border-transparent hover:text-stone-200"
                      }`}
                    >
                      {isEditingFindingId ? "Edit Finding" : "Log Finding"}
                    </button>
                    <button
                      onClick={() => setActiveTab("findings_log")}
                      className={`flex-1 py-3 border-b-2 transition ${
                        activeTab === "findings_log"
                          ? "border-gold text-gold bg-stone-950/40"
                          : "border-transparent hover:text-stone-200"
                      }`}
                    >
                      Findings ({session.findings.length})
                    </button>
                    <button
                      onClick={() => setActiveTab("checklist")}
                      className={`flex-1 py-3 border-b-2 transition ${
                        activeTab === "checklist"
                          ? "border-gold text-gold bg-stone-950/40"
                          : "border-transparent hover:text-stone-200"
                      }`}
                    >
                      Checklist
                    </button>
                  </div>

                  {/* Drawer Content Body */}
                  <div className="flex-grow overflow-y-auto p-5 space-y-5">
                    {/* Live Stats / Telemetry Tab */}
                    {activeTab === "telemetry" && (
                      <div className="space-y-5">
                        {/* Live Header Status */}
                        <div className="bg-stone-900/60 p-4 border border-stone-800/80 rounded-xl flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 block">
                              Active Screen Location
                            </span>
                            <span className="text-sm font-sans font-bold text-gold block mt-0.5">
                              {SCREEN_HUMAN_NAMES[activeScreenKey] || activeScreenKey}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 block animate-pulse">
                              ● Live Recording
                            </span>
                            <span className="text-xs font-mono text-stone-300 block mt-0.5 font-bold">
                              {Math.round((Date.now() - session.startTime) / 1000)}s elapsed
                            </span>
                          </div>
                        </div>

                        {/* Numeric Stats Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="bg-stone-900/40 border border-stone-800/40 rounded-xl p-3 text-center">
                            <span className="text-[9px] font-mono uppercase tracking-wider text-stone-400 block">
                              Dead Clicks
                            </span>
                            <span className="text-xl font-mono font-black text-rose-400 block mt-1">
                              {session.deadClicks.length}
                            </span>
                          </div>
                          <div className="bg-stone-900/40 border border-stone-800/40 rounded-xl p-3 text-center">
                            <span className="text-[9px] font-mono uppercase tracking-wider text-stone-400 block">
                              Pauses &gt; 3s
                            </span>
                            <span className="text-xl font-mono font-black text-amber-400 block mt-1">
                              {session.pauses.length}
                            </span>
                          </div>
                          <div className="bg-stone-900/40 border border-stone-800/40 rounded-xl p-3 text-center">
                            <span className="text-[9px] font-mono uppercase tracking-wider text-stone-400 block">
                              Backtracks
                            </span>
                            <span className="text-xl font-mono font-black text-sky-400 block mt-1">
                              {session.backtracks.length}
                            </span>
                          </div>
                          <div className="bg-stone-900/40 border border-stone-800/40 rounded-xl p-3 text-center">
                            <span className="text-[9px] font-mono uppercase tracking-wider text-stone-400 block">
                              Val Errors
                            </span>
                            <span className="text-xl font-mono font-black text-emerald-400 block mt-1">
                              {session.validationErrors.length}
                            </span>
                          </div>
                        </div>

                        {/* Task Completion Status Card */}
                        <div className="bg-stone-900/30 border border-stone-800/50 rounded-xl p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400">
                              Task Status
                            </span>
                            {session.taskCompletion === "completed" ? (
                              <span className="bg-emerald-950 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                                Task Completed ✓
                              </span>
                            ) : session.taskCompletion === "abandoned" ? (
                              <span className="bg-rose-950 border border-rose-500/30 text-rose-300 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                                Abandoned at {session.abandonmentPoint}
                              </span>
                            ) : (
                              <span className="bg-stone-800 border border-stone-700 text-stone-300 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                                In Progress...
                              </span>
                            )}
                          </div>
                          {session.taskCompletion === "in-progress" && (
                            <button
                              onClick={handleMarkAbandoned}
                              className="w-full py-1.5 border border-rose-500/20 text-rose-300 hover:bg-rose-950/20 rounded text-[10px] font-mono uppercase tracking-wider transition cursor-pointer"
                            >
                              Mark Abandoned at Current Screen
                            </button>
                          )}
                        </div>

                        {/* Screen Durations List */}
                        <div className="space-y-2">
                          <h4 className="text-[11px] font-mono uppercase tracking-widest text-stone-300 flex items-center gap-1.5 font-bold">
                            <Clock className="w-3.5 h-3.5 text-gold" />
                            Time Spent on Screen
                          </h4>
                          <div className="bg-stone-900/30 border border-stone-800/50 rounded-xl divide-y divide-stone-800/60 overflow-hidden">
                            {SCREEN_SEQUENCE.map(screen => {
                              const time = session.screensVisited[screen] || 0;
                              const isActive = activeScreenKey === screen;
                              return (
                                <div key={screen} className="px-4 py-2 flex items-center justify-between text-xs">
                                  <span className={`font-sans ${isActive ? "text-gold font-bold" : "text-stone-400"}`}>
                                    {SCREEN_HUMAN_NAMES[screen]} {isActive && " (Active)"}
                                  </span>
                                  <span className="font-mono text-stone-300 font-bold">{time}s</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* General Notes Area */}
                        <div className="space-y-2">
                          <h4 className="text-[11px] font-mono uppercase tracking-widest text-stone-300 flex items-center gap-1.5 font-bold">
                            <FileText className="w-3.5 h-3.5 text-gold" />
                            Observer Session Notes
                          </h4>
                          <textarea
                            value={session.notes}
                            onChange={handleNotesChange}
                            placeholder="Type overall observations, behavioral bottlenecks, physical tension signals, or technical comments here..."
                            className="w-full h-24 bg-stone-900 border border-stone-800 rounded-xl p-3 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-gold"
                          />
                        </div>

                        {/* Action Buttons: Export / Reset */}
                        <div className="space-y-2 pt-2 border-t border-stone-800">
                          <div className="flex gap-2">
                            <button
                              onClick={handleExportJSON}
                              className="flex-1 bg-stone-800 hover:bg-stone-700 text-stone-200 py-3 rounded-lg text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer"
                            >
                              <Download className="w-4 h-4 text-gold" />
                              Export JSON
                            </button>
                            <button
                              onClick={handleExportCSV}
                              className="flex-1 bg-stone-800 hover:bg-stone-700 text-stone-200 py-3 rounded-lg text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer"
                            >
                              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                              Export CSV
                            </button>
                          </div>
                          <button
                            onClick={handleResetSession}
                            className="w-full border border-stone-800 hover:border-rose-900/30 hover:bg-rose-950/10 text-stone-500 hover:text-rose-400 py-2.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Reset Observer Session
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Log Observation Finding Tab */}
                    {activeTab === "finding" && (
                      <form onSubmit={handleSaveFinding} className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-[11px] font-mono uppercase tracking-widest text-stone-300 flex items-center gap-1.5 font-bold">
                            <Plus className="w-4 h-4 text-gold" />
                            {isEditingFindingId ? "Modify Finding Entry" : "Record Obstacle Finding"}
                          </h4>
                          {isEditingFindingId && (
                            <button
                              type="button"
                              onClick={() => {
                                setIsEditingFindingId(null);
                                setQuote("");
                                setExpectedBehavior("");
                                setActualBehavior("");
                                setFrictionHypothesis("");
                                setRecommendedChange("");
                                setSeverity(1);
                                setActiveTab("findings_log");
                              }}
                              className="text-xs text-rose-400 hover:underline"
                            >
                              Cancel Edit
                            </button>
                          )}
                        </div>

                        {/* Severity Selector */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono uppercase text-stone-400">Severity Rating *</label>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { val: 1, label: "Severity 1: Minor", desc: "Slight hesitation" },
                              { val: 2, label: "Severity 2: Delay", desc: "User recovers" },
                              { val: 3, label: "Severity 3: Blocker", desc: "Halts flow / breaks trust" }
                            ].map(option => (
                              <button
                                key={option.val}
                                type="button"
                                onClick={() => setSeverity(option.val as 1 | 2 | 3)}
                                className={`p-2.5 border rounded-lg text-left transition flex flex-col justify-between cursor-pointer ${
                                  severity === option.val
                                    ? option.val === 1
                                      ? "bg-amber-950/40 border-amber-500 text-amber-200"
                                      : option.val === 2
                                      ? "bg-orange-950/40 border-orange-500 text-orange-200"
                                      : "bg-rose-950/40 border-rose-500 text-rose-200"
                                    : "bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200"
                                }`}
                              >
                                <span className="text-xs font-bold font-sans block">{option.label}</span>
                                <span className="text-[9px] font-mono mt-1 opacity-70 block leading-tight">{option.desc}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* User Quote */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono uppercase text-stone-400 block">Exact User Quote (Optional)</label>
                          <input
                            type="text"
                            value={quote}
                            onChange={e => setQuote(e.target.value)}
                            placeholder="e.g., 'I don't understand why I need to pay a deposit so early...'"
                            className="w-full bg-stone-900 border border-stone-800 rounded-lg py-2 px-3 text-xs text-stone-200 focus:outline-none focus:ring-1 focus:ring-gold"
                          />
                        </div>

                        {/* Expected Behavior */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono uppercase text-stone-400 block">Expected Behavior *</label>
                          <textarea
                            value={expectedBehavior}
                            onChange={e => setExpectedBehavior(e.target.value)}
                            placeholder="Describe what the user expected to happen..."
                            className="w-full h-16 bg-stone-900 border border-stone-800 rounded-lg p-2.5 text-xs text-stone-200 focus:outline-none focus:ring-1 focus:ring-gold"
                            required
                          />
                        </div>

                        {/* Actual Behavior */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono uppercase text-stone-400 block">Actual Behavior *</label>
                          <textarea
                            value={actualBehavior}
                            onChange={e => setActualBehavior(e.target.value)}
                            placeholder="Describe what the user actually did (e.g., clicked blank space, backtracked)..."
                            className="w-full h-16 bg-stone-900 border border-stone-800 rounded-lg p-2.5 text-xs text-stone-200 focus:outline-none focus:ring-1 focus:ring-gold"
                            required
                          />
                        </div>

                        {/* Friction Hypothesis */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono uppercase text-stone-400 block">Friction Hypothesis (Optional)</label>
                          <textarea
                            value={frictionHypothesis}
                            onChange={e => setFrictionHypothesis(e.target.value)}
                            placeholder="Why did this friction occur? (e.g., lack of visual cues, ambiguous copy)..."
                            className="w-full h-16 bg-stone-900 border border-stone-800 rounded-lg p-2.5 text-xs text-stone-200 focus:outline-none focus:ring-1 focus:ring-gold"
                          />
                        </div>

                        {/* Recommended Change */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono uppercase text-stone-400 block">Recommended Change (Optional)</label>
                          <textarea
                            value={recommendedChange}
                            onChange={e => setRecommendedChange(e.target.value)}
                            placeholder="Actionable redesign proposal to eliminate this friction point..."
                            className="w-full h-16 bg-stone-900 border border-stone-800 rounded-lg p-2.5 text-xs text-stone-200 focus:outline-none focus:ring-1 focus:ring-gold"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-gold hover:bg-gold/90 text-stone-950 font-sans font-black uppercase text-xs tracking-wider py-3 px-4 rounded-lg transition mt-2 cursor-pointer"
                        >
                          {isEditingFindingId ? "Update Logged Finding ✓" : "Save Finding to Session ✓"}
                        </button>
                      </form>
                    )}

                    {/* Session Findings Log Tab */}
                    {activeTab === "findings_log" && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-[11px] font-mono uppercase tracking-widest text-stone-300 flex items-center gap-1.5 font-bold">
                            <MessageSquare className="w-4 h-4 text-gold" />
                            Logged Findings ({session.findings.length})
                          </h4>
                        </div>

                        {session.findings.length === 0 ? (
                          <div className="bg-stone-900/30 border border-stone-800/50 p-8 rounded-xl text-center text-stone-500">
                            <p className="text-xs">No specific user friction findings logged yet in this session.</p>
                            <button
                              onClick={() => setActiveTab("finding")}
                              className="mt-3 text-gold text-xs font-mono uppercase tracking-wider hover:underline flex items-center justify-center gap-1 mx-auto"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              Log your first finding
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {session.findings.map(finding => (
                              <div
                                key={finding.id}
                                className={`border rounded-xl p-4 space-y-2.5 bg-stone-900/30 ${
                                  finding.severity === 3
                                    ? "border-rose-500/20"
                                    : finding.severity === 2
                                    ? "border-orange-500/20"
                                    : "border-amber-500/10"
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                                        finding.severity === 3
                                          ? "bg-rose-950 text-rose-300 border border-rose-500/20"
                                          : finding.severity === 2
                                          ? "bg-orange-950 text-orange-300 border border-orange-500/20"
                                          : "bg-amber-950 text-amber-300 border border-amber-500/20"
                                      }`}
                                    >
                                      Severity {finding.severity}
                                    </span>
                                    <span className="text-[10px] font-mono text-stone-400">
                                      {finding.timestamp} | {finding.screen}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      onClick={() => handleEditFinding(finding)}
                                      className="text-[9px] font-mono text-stone-400 hover:text-gold uppercase tracking-wider"
                                    >
                                      Edit
                                    </button>
                                    <span className="text-stone-700 text-xs">|</span>
                                    <button
                                      onClick={() => handleDeleteFinding(finding.id)}
                                      className="text-[9px] font-mono text-rose-400 hover:text-rose-300 uppercase tracking-wider"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>

                                <div className="space-y-1.5 text-xs">
                                  {finding.quote && (
                                    <p className="italic text-stone-300 pl-2 border-l-2 border-gold/40">
                                      &ldquo;{finding.quote}&rdquo;
                                    </p>
                                  )}
                                  <p className="text-stone-400">
                                    <strong className="text-stone-300">Expected:</strong> {finding.expectedBehavior}
                                  </p>
                                  <p className="text-stone-400">
                                    <strong className="text-stone-300">Actual:</strong> {finding.actualBehavior}
                                  </p>
                                  {finding.frictionHypothesis && (
                                    <p className="text-stone-400">
                                      <strong className="text-stone-300">Hypothesis:</strong> {finding.frictionHypothesis}
                                    </p>
                                  )}
                                  {finding.recommendedChange && (
                                    <p className="text-stone-400">
                                      <strong className="text-stone-300">Recommendation:</strong> {finding.recommendedChange}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Silent Protocol Checklist Tab */}
                    {activeTab === "checklist" && (
                      <div className="space-y-5">
                        <div className="bg-amber-950/20 border border-amber-500/20 rounded-xl p-4 space-y-2">
                          <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5 uppercase font-sans">
                            <AlertTriangle className="w-4 h-4" />
                            Silent Prototype Protocol Mandates
                          </h4>
                          <p className="text-xs text-stone-400 leading-relaxed">
                            Observers must strictly follow the silent testing methodology to prevent bias and gain true validation data. Let the user struggle naturally.
                          </p>
                        </div>

                        {/* Checklist items */}
                        <div className="space-y-3">
                          {[
                            {
                              key: "outcomeGiven",
                              title: "1. Give Outcome, Not Instructions",
                              desc: "Instruct the user: 'Secure a priest and book a ceremony to resolve a career obstacle, then pay the holding deposit.' NEVER say 'Click on this button, fill in that field'."
                            },
                            {
                              key: "noRescuing",
                              title: "2. Do Not Rescue the User",
                              desc: "If the user is stuck, silent, or frustrated, do not say anything. Do not intervene even if they pause for a long time. Silence is golden diagnostic gold."
                            },
                            {
                              key: "noteConfusion",
                              title: "3. Note Confusion, Don't Explain",
                              desc: "Write down what they are hovering over, what they click, or where they look confused. Never explain how the UI works until the session has concluded."
                            },
                            {
                              key: "postTaskDiagnostics",
                              title: "4. Conduct Diagnostic Questions After Task",
                              desc: "Ask follow-up questions only AFTER they reach the booking secured screen or actively announce abandonment."
                            }
                          ].map(item => (
                            <div
                              key={item.key}
                              onClick={() => toggleChecklist(item.key)}
                              className={`p-3.5 border rounded-xl flex items-start gap-3 transition-colors cursor-pointer select-none ${
                                checklist[item.key]
                                  ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-200"
                                  : "bg-stone-900/60 border-stone-800/80 hover:border-stone-700 text-stone-400 hover:text-stone-200"
                              }`}
                            >
                              <div className="mt-0.5">
                                <div className={`w-4.5 h-4.5 border rounded flex items-center justify-center transition-all ${
                                  checklist[item.key]
                                    ? "bg-emerald-500 border-emerald-500 text-stone-950 font-sans text-[10px] font-black"
                                    : "border-stone-700"
                                }`}>
                                  {checklist[item.key] && "✓"}
                                </div>
                              </div>
                              <div className="space-y-1">
                                <span className={`text-xs font-bold block ${checklist[item.key] ? "text-emerald-200" : "text-stone-300"}`}>
                                  {item.title}
                                </span>
                                <span className="text-[10px] text-stone-400 block leading-relaxed">
                                  {item.desc}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Post Task Questions */}
                        <div className="space-y-2">
                          <h4 className="text-[11px] font-mono uppercase tracking-widest text-stone-300 flex items-center gap-1.5 font-bold">
                            <BookOpen className="w-3.5 h-3.5 text-gold" />
                            Post-Task Diagnostic Prompts
                          </h4>
                          <div className="bg-stone-900/30 border border-stone-800/50 rounded-xl p-3.5 space-y-2.5">
                            {DIAGNOSTIC_QUESTIONS.map((q, idx) => (
                              <div key={idx} className="flex gap-2 text-xs">
                                <span className="text-gold font-mono font-bold shrink-0">{idx + 1}.</span>
                                <span className="text-stone-300 leading-relaxed">{q}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
