import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  User,
  Info,
  ChevronRight,
  AlertCircle,
  HelpCircle,
  Check,
  Languages,
  BadgeAlert,
  SlidersHorizontal,
  Scale
} from "lucide-react";
import { Practitioner, Service } from "../types";
import { PRACTITIONERS } from "../data";
import RotatingMandala from "./RotatingMandala";
import { analytics } from "../lib/analytics";

interface InsightContent {
  summary: string;
  explanation: string;
  simpleExplanation: string;
  canTell: string[];
  cannotDetermine: string[];
}

const INSIGHTS_DATA: Record<string, InsightContent> = {
  "career-finances": {
    summary: "A season of professional grounding and steady skill consolidation",
    explanation: "Your coordinates suggest that you are entering a supportive period for grounding and system-building. Rather than initiating sudden, dramatic shifts, the celestial alignments highlight that investing in deep technical knowledge and resolving small pending operational details will yield immense stability over the next several months. Take this time to strengthen foundations.",
    simpleExplanation: "Take things steady in your job or business right now. It is a better time to learn new skills and organize your plans than to rush into big, risky financial moves.",
    canTell: [
      "Auspicious windows for professional shifts and role transitions",
      "Your natural cognitive strengths, work styles, and communication patterns",
      "Major energetic life cycles (Dashas) that define your career seasons"
    ],
    cannotDetermine: [
      "The exact date of a job offer or promotional contract",
      "Guaranteed stock market returns or absolute lottery win timings",
      "The exact legal name of the organization you will work for"
    ]
  },
  "marriage-relationships": {
    summary: "Focus on communicative transparency and deep emotional foundations",
    explanation: "The planetary configurations point to an active period for your relationship and communication houses. This is a highly beneficial cycle for resolving pending family disputes, practicing deep emotional listening, and building secure long-term connections. Avoid quick assumptions; instead, establish clear, loving communication channels.",
    simpleExplanation: "Focus on open, warm conversations with your partner or family. Patience and active listening will help clear up any small misunderstandings easily.",
    canTell: [
      "Compatibility guidelines and behavioral friction points between partners",
      "Auspicious calendar dates and planetary configurations for wedding ceremonies",
      "Strengths and growth opportunities within your primary relationship house"
    ],
    cannotDetermine: [
      "The exact name, physical face, or address of your future spouse",
      "Guaranteed outcomes of relationship decisions or marriages",
      "Enforced behavioral choices of another free-willed individual"
    ]
  },
  "family": {
    summary: "Domestic centering and energetic purification of the home",
    explanation: "Celestial coordinates indicate that family bonds are ready to receive harmonious, grounding energy. Traditional domestic rituals and acts of collective gratitude are highly beneficial during this period to balance home energetics, ease lingering tensions, and support children or elders as they begin new paths.",
    simpleExplanation: "This is a great time to focus on your home life. Simple family gatherings, resolving old household tensions, and showing gratitude will bring peace and warmth to everyone.",
    canTell: [
      "Favorable cycles for household ceremonies and spiritual domestic gatherings",
      "Auspicious timeframes for ancestral remembrance and children's milestones",
      "General planetary trends influencing collective household harmony"
    ],
    cannotDetermine: [
      "Medical diagnoses or specific physical healing timelines for family members",
      "The legal outcome of civil property disputes or court litigations",
      "Guaranteed actions or compliance of other independent relatives"
    ]
  },
  "moving-changes": {
    summary: "Grounding planetary movements to support a major physical transition",
    explanation: "A major physical transition is a powerful gateway to realign your active space. Traditional parameters indicate that taking conscious steps to cleanse and purify your new threshold (such as a supportive Griha Pravesh) will clear lingering energy and establish a highly supportive, peaceful base for your life ambitions.",
    simpleExplanation: "Moving to a new place is an exciting fresh start. Setting up your new home with calm, clear spaces will help you feel stable, secure, and ready to thrive.",
    canTell: [
      "The most auspicious dates and hours for packing, moving, and crossing thresholds",
      "Energetic directions and spatial alignment setups to promote tranquility",
      "Helpful mind-sets for navigating large geographic or career adjustments"
    ],
    cannotDetermine: [
      "Exact real estate pricing fluctuations or hidden structural defects in a building",
      "Absolute guaranteed protection from regional weather patterns",
      "Whether a specific landlord or building board will approve an application"
    ]
  },
  "home-vastu": {
    summary: "Spatial alignments to optimize focus, productivity, and peace of mind",
    explanation: "Your physical dwelling functions as an energy map (Vastu Purusha). Your birth details show that spatial energetics will strongly impact your cognitive clarity this season. Adjusting layout flow, lighting, or the positioning of active work areas will help relieve mental fatigue and welcome abundance.",
    simpleExplanation: "Your physical surroundings affect how you feel. Making small, clean adjustments to your home or workspace layout will help you feel more peaceful, focused, and creative.",
    canTell: [
      "Directional quadrants that naturally boost concentration, rest, or wellness",
      "Arrangements to align your home layout with elemental cardinal directions",
      "Harmonizing adjustments to rectify minor architectural flow imbalances"
    ],
    cannotDetermine: [
      "Guaranteed percentage appreciation in property resale valuations",
      "Unilateral resolution of legal property boundary disputes",
      "Compliance with physical building codes or structural safety parameters"
    ]
  },
  "ritual-ceremony": {
    summary: "Sacred calendar alignment to ensure traditional ritual sanctity",
    explanation: "Aligning your family's native lineage traditions (whether North Indian, South Indian, or localized variants) with highly specific Panchang calendar readings (Muhurats) ensures that your upcoming ceremony is performed with complete spiritual precision and respectful traditional authenticity.",
    simpleExplanation: "Performing a traditional ceremony helps welcome good energy and blessings. Choosing the right traditional time ensures your event feels sacred, peaceful, and fully aligned.",
    canTell: [
      "The most auspicious date and hour windows (Muhurats) for your specific event",
      "The precise lists of materials (Samagri) and procedures for your native lineage",
      "Harmonious days for gathering family and inviting spiritual guides"
    ],
    cannotDetermine: [
      "Precise meteorology, weather forecasts, or physical venue delays",
      "Guaranteed perfect attendance of all invited family guests",
      "Complete elimination of standard human errors during event hosting"
    ]
  },
  "general-guidance": {
    summary: "Celestial cycles call for mindful resilience and inner clarity",
    explanation: "Active transition periods are naturally marked by occasional spiritual friction. Engaging in steady mindfulness, daily breathing, or traditional fire cleansing (Havan) builds the deep, grounded mental resilience needed to overcome persistent obstacles and navigate life changes with composure.",
    simpleExplanation: "If things have felt a bit heavy or uncertain lately, that is normal. Taking time to pause, breathe, and focus on spiritual clarity will help you feel strong and grounded again.",
    canTell: [
      "Your baseline celestial blueprint and general planetary cycles (Dashas)",
      "Highly auspicious seasons for self-reflection, planning, and starting goals",
      "Daily routines (Dinacharya) aligned with local natural rhythms"
    ],
    cannotDetermine: [
      "Predictive absolute dates of financial windfalls or winning opportunities",
      "Diagnoses or medical treatments for physical and psychological ailments",
      "Absolute guaranteed pathways to bypass standard, necessary life lessons"
    ]
  }
};

interface OnboardingFlowProps {
  onSelectPractitioner: (practitioner: Practitioner, service?: Service | null) => void;
  onSkipToDirectory: (intent?: string | null) => void;
  onOpenKundli: () => void;
}

type OnboardingStep = "landing" | "concern" | "birth-details" | "loading" | "insight-results";

interface ConcernOption {
  id: string;
  title: string;
  description: string;
  emoji: string;
  categoryMatch: string;
}

export default function OnboardingFlow({
  onSelectPractitioner,
  onSkipToDirectory,
  onOpenKundli,
}: OnboardingFlowProps) {
  const [step, setStep] = useState<OnboardingStep>("landing");
  
  // Phase 3 State Additions
  const [triggeredEvents, setTriggeredEvents] = useState<{ name: string; timestamp: string }[]>([]);
  const [isSimplified, setIsSimplified] = useState(false);
  const [reportSavedStatus, setReportSavedStatus] = useState(false);
  const [showAnalyticsConsole, setShowAnalyticsConsole] = useState(true);

  // Helper to trigger events
  const triggerEvent = (name: string, properties: Record<string, any> = {}) => {
    console.log(`[SETU Event Logged] ${name}`, properties);
    analytics.track(name, properties);
    setTriggeredEvents(prev => [{ name, timestamp: new Date().toLocaleTimeString() }, ...prev]);
  };

  // Onboarding Data States
  const [selectedConcern, setSelectedConcern] = useState<ConcernOption | null>(null);
  const [userName, setUserName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [isTimeApprox, setIsTimeApprox] = useState(false);
  const [birthPlace, setBirthPlace] = useState("");
  
  // Phase 2 State Additions
  const [isWhyWeAskExpanded, setIsWhyWeAskExpanded] = useState(false);
  const [isConsentGiven, setIsConsentGiven] = useState(false);
  const [isMarketingConsentGiven, setIsMarketingConsentGiven] = useState(false);
  const [simulateError, setSimulateError] = useState(false);
  const [calculationError, setCalculationError] = useState<string | null>(null);
  const [activeExplainField, setActiveExplainField] = useState<string | null>(null);

  // Phase 4 State Additions
  const [filterLanguage, setFilterLanguage] = useState<string>("Any");
  const [filterFormat, setFilterFormat] = useState<string>("Any");
  const [filterTimeZone, setFilterTimeZone] = useState<string>("Any");
  const [filterAvailability, setFilterAvailability] = useState<string>("Any");
  const [filterPrice, setFilterPrice] = useState<string>("Any");
  const [selectedPractitionersForComparison, setSelectedPractitionersForComparison] = useState<string[]>([]);
  const [comparing, setComparing] = useState(false);
  const [activePractitionerProfile, setActivePractitionerProfile] = useState<Practitioner | null>(null);
  const [activePractitionerAvailability, setActivePractitionerAvailability] = useState<Practitioner | null>(null);
  const [selectedBookingDate, setSelectedBookingDate] = useState<string>("");
  const [selectedBookingTime, setSelectedBookingTime] = useState<string>("");
  const [bookingConfirmedStatus, setBookingConfirmedStatus] = useState<boolean>(false);
  const [manualMatchRequested, setManualMatchRequested] = useState<boolean>(false);
  const [expandedMatchReason, setExpandedMatchReason] = useState<string | null>(null);
  const [activeVerificationPractitioner, setActiveVerificationPractitioner] = useState<Practitioner | null>(null);
  
  // Field-level error messages
  const [nameError, setNameError] = useState("");
  const [dateError, setDateError] = useState("");
  const [timeError, setTimeError] = useState("");
  const [placeError, setPlaceError] = useState("");
  const [consentError, setConsentError] = useState("");

  // Saved progress visual simulation state
  const [progressSaved, setProgressSaved] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  // Validation / Loading States
  const [validationError, setValidationError] = useState("");
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Focus Refs for Accessibility
  const titleRef = useRef<HTMLHeadingElement>(null);
  const concernListRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const practitionersRef = useRef<HTMLDivElement>(null);

  // Concern Options defined precisely
  const concernOptions: ConcernOption[] = [
    {
      id: "career-finances",
      title: "Career and finances",
      description: "Path clarity, job transitions, promotion timing, or business direction",
      emoji: "💼",
      categoryMatch: "Astrology"
    },
    {
      id: "marriage-relationships",
      title: "Marriage and relationships",
      description: "Marital harmony, compatibility, marriage delay, or partnerships",
      emoji: "💞",
      categoryMatch: "Astrology"
    },
    {
      id: "family",
      title: "Family",
      description: "Children's path, elder care, resolving family disputes, or ancestral roots",
      emoji: "🏠",
      categoryMatch: "Puja"
    },
    {
      id: "moving-changes",
      title: "Moving or major life changes",
      description: "Relocation guidance, major life pivots, or starting fresh",
      emoji: "✈️",
      categoryMatch: "Puja"
    },
    {
      id: "home-vastu",
      title: "Home and Vastu",
      description: "Energy alignment for a new house, business premises, or structural corrections",
      emoji: "🧭",
      categoryMatch: "Vastu"
    },
    {
      id: "ritual-ceremony",
      title: "Ritual or ceremony",
      description: "Auspicious timings (Muhurat) and traditional home ceremonies",
      emoji: "🪔",
      categoryMatch: "Puja"
    },
    {
      id: "general-guidance",
      title: "General guidance",
      description: "Overcoming persistent obstacles, daily clarity, and spiritual alignment",
      emoji: "✨",
      categoryMatch: "Havan"
    }
  ];

  // Loading texts that shift slowly for high-quality psychological immersion
  const loadingTexts = [
    "Respectfully calculating panchang & astrological coordinates...",
    "Aligning cosmic chart parameters based on traditional Vedic science...",
    "Mapping specialized, verified priest lineages for your life milestones...",
    "Vetting bilingual fluencies and tradition compatibilities...",
    "Preparing your initial non-deterministic reflection..."
  ];

  // Handle focus on step changes to ensure WCAG / Screen reader compliance
  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.focus();
    }
    // Smooth scroll to top on step changes
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Dispatch step change for the prototype testing observer panel
    window.dispatchEvent(new CustomEvent("onboarding_step_changed", { detail: { step } }));
  }, [step]);

  // Track landing_viewed once on mount
  useEffect(() => {
    triggerEvent("landing_viewed", {
      referrer: document.referrer || "direct",
      page_url: window.location.href,
      user_agent: navigator.userAgent
    });
  }, []);

  // Saved-progress state simulation & validation clears
  useEffect(() => {
    if (isInitialLoad) {
      setIsInitialLoad(false);
      return;
    }
    // Only set saved state if some data is present
    if (userName || birthDate || birthTime || birthPlace || isTimeApprox) {
      setProgressSaved(true);
      const timer = setTimeout(() => {
        setProgressSaved(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [userName, birthDate, birthTime, birthPlace, isTimeApprox]);

  // Loading Screen progress timer
  useEffect(() => {
    let progressTimer: NodeJS.Timeout;
    let textTimer: NodeJS.Timeout;

    if (step === "loading") {
      setLoadingProgress(0);
      setLoadingTextIndex(0);
      setCalculationError(null);
      triggerEvent("insight_generation_started");

      progressTimer = setInterval(() => {
        setLoadingProgress((prev) => {
          if (simulateError && prev >= 45) {
            clearInterval(progressTimer);
            setCalculationError("Vedic coordinate registry lookup timed out (Error 504: API_GATEWAY_TIMEOUT). The astronomical ephemeris server is experiencing heavy congestion. Please check your internet connection and try again.");
            triggerEvent("insight_generation_failed");
            return 45;
          }
          if (prev >= 100) {
            clearInterval(progressTimer);
            triggerEvent("insight_generation_completed");
            setStep("insight-results");
            return 100;
          }
          return prev + 2.5; // Snappier feedback in dev
        });
      }, 50);

      textTimer = setInterval(() => {
        setLoadingTextIndex((prev) => (prev + 1) % loadingTexts.length);
      }, 1400);
    }

    return () => {
      clearInterval(progressTimer);
      clearInterval(textTimer);
    };
  }, [step, simulateError]);

  // Trigger insight_viewed when stepping into results
  useEffect(() => {
    if (step === "insight-results") {
      triggerEvent("insight_viewed", {
        insight_id: selectedConcern?.id || "unknown",
        insight_summary_length: INSIGHTS_DATA[selectedConcern?.id || ""]?.summary.length || 0,
        is_simplified_view: false
      });
      
      const matched = getMatchedPractitioners();
      triggerEvent("practitioner_recommendations_viewed", {
        matched_count: matched.length,
        list_source: "onboarding_results",
        filters_applied: {
          concern: selectedConcern?.id,
          language: filterLanguage,
          format: filterFormat
        }
      });

      setIsSimplified(false);
      setReportSavedStatus(false);
    }
  }, [step]);

  // Trigger practitioner_profile_viewed when profile modal is opened in onboarding
  useEffect(() => {
    if (activePractitionerProfile) {
      triggerEvent("practitioner_profile_viewed", {
        practitioner_id: activePractitionerProfile.id,
        practitioner_name: activePractitionerProfile.name,
        tradition: activePractitionerProfile.tradition,
        service_count: activePractitionerProfile.services.length
      });
    }
  }, [activePractitionerProfile]);

  // Handle CTA on landing click
  const handleStartOnboarding = () => {
    setStep("concern");
  };

  // Handle toggling inline field assistance
  const toggleFieldHelp = (field: string) => {
    setActiveExplainField(activeExplainField === field ? null : field);
  };

  // Handle Concern Select
  const handleConcernSelect = (concern: ConcernOption) => {
    setSelectedConcern(concern);
    setValidationError("");
    triggerEvent("concern_selected", {
      concern_id: concern.id,
      concern_title: concern.title
    });
  };

  // Validate Concern & Go to Birth Details
  const handleConcernContinue = () => {
    if (!selectedConcern) {
      setValidationError("Please select one concern to continue.");
      window.dispatchEvent(new CustomEvent("prototype_validation_error", {
        detail: { screen: "onboarding-concern", message: "Please select one concern to continue." }
      }));
      return;
    }

    // Determine if the concern requires astrological calculation (e.g. Birth Chart, Horoscope)
    const isAstrological = selectedConcern.id === "career-finances" || selectedConcern.id === "marriage-relationships";

    if (!isAstrological) {
      // For non-astrological services (such as Home Puja, Vastu, or Marriage Ceremony),
      // we skip the birth chart flow entirely and go directly to the Practitioner Directory.
      let targetIntent: string | null = "puja";
      if (selectedConcern.id === "home-vastu") {
        targetIntent = "vastu";
      } else if (selectedConcern.id === "general-guidance") {
        targetIntent = "not-sure";
      }

      triggerEvent("onboarding_skipped_for_non_astrology", {
        concern_id: selectedConcern.id,
        target_intent: targetIntent
      });

      onSkipToDirectory(targetIntent);
      return;
    }

    setStep("birth-details");
    triggerEvent("birth_details_started", {
      form_name: "birth_coordinates_form",
      concern_id: selectedConcern.id
    });
  };

  // Validate Birth Details & Go to Loading
  const handleBirthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear all previous errors
    setNameError("");
    setDateError("");
    setTimeError("");
    setPlaceError("");
    setConsentError("");
    setValidationError("");

    let isValid = true;

    // 1. Name validation
    if (!userName.trim()) {
      setNameError("First name is required.");
      isValid = false;
    } else if (userName.trim().length < 2) {
      setNameError("First name should be at least 2 characters.");
      isValid = false;
    }

    // 2. Date of birth validation
    if (!birthDate) {
      setDateError("Date of birth is required.");
      isValid = false;
    } else {
      const selectedYear = new Date(birthDate).getFullYear();
      const today = new Date();
      today.setHours(23, 59, 59, 999); // Safe threshold
      const bDate = new Date(birthDate);

      if (bDate > today) {
        setDateError("Date of birth cannot be in the future.");
        isValid = false;
      } else if (selectedYear < 1900) {
        setDateError("Please select a year after 1900.");
        isValid = false;
      }
    }

    // 3. Time of birth validation
    if (!isTimeApprox && !birthTime) {
      setTimeError("Birth time is required. If unknown, please check 'I do not know my exact birth time' below.");
      isValid = false;
    }

    // 4. Place of birth validation
    if (!birthPlace.trim()) {
      setPlaceError("Birth place is required to calculate astronomical coordinates.");
      isValid = false;
    } else if (birthPlace.trim().length < 3) {
      setPlaceError("Please specify a city and country/state (e.g. Toronto, Canada).");
      isValid = false;
    }

    // 5. Consent checkbox validation
    if (!isConsentGiven) {
      setConsentError("You must consent to calculation processing to generate your insight.");
      isValid = false;
    }

    if (!isValid) {
      setValidationError("Please resolve the field errors highlighted below before continuing.");
      window.dispatchEvent(new CustomEvent("prototype_validation_error", {
        detail: { screen: "onboarding-birth-details", message: "Please resolve the field errors highlighted below before continuing." }
      }));
      return;
    }

    // Track birth_details_completed event
    triggerEvent("birth_details_completed", {
      birth_date_provided: !!birthDate,
      birth_time_provided: !isTimeApprox && !!birthTime,
      birth_place_provided: !!birthPlace.trim(),
      consent_given: isConsentGiven,
      is_time_approx: isTimeApprox
    });

    // Validation success! Go to loading
    setValidationError("");
    setCalculationError(null);
    setStep("loading");
  };

  // Curated matching logic based on selected concern
  const getMatchedPractitioners = (): Practitioner[] => {
    if (!selectedConcern) return PRACTITIONERS.slice(0, 3);
    
    // Transparent matching rules
    switch (selectedConcern.id) {
      case "career-finances":
        // Meenakshi (Astrology), Rajesh (Navagraha/Vastu), Anand (Maha Mrityunjaya)
        return PRACTITIONERS.filter(p => p.id === "meenakshi-iyer" || p.id === "rajesh-shastri" || p.id === "anand-pathak");
      case "marriage-relationships":
        // Meenakshi (Compatibility), Venkatesh (Vivaha)
        return PRACTITIONERS.filter(p => p.id === "meenakshi-iyer" || p.id === "venkatesh-raghavan");
      case "family":
        // Rajesh (Satyanarayan), Venkatesh (Upanayanam), Anand (Mrityunjaya)
        return PRACTITIONERS.filter(p => p.id === "rajesh-shastri" || p.id === "venkatesh-raghavan" || p.id === "anand-pathak");
      case "moving-changes":
        // Rajesh (Griha Pravesh), Anand (Rudrabhishek)
        return PRACTITIONERS.filter(p => p.id === "rajesh-shastri" || p.id === "anand-pathak");
      case "home-vastu":
        // Rajesh (Griha Pravesh & Vastu specializes)
        return PRACTITIONERS.filter(p => p.id === "rajesh-shastri");
      case "ritual-ceremony":
        // Rajesh, Venkatesh, Anand (All ritual specialists)
        return PRACTITIONERS.filter(p => p.id !== "meenakshi-iyer");
      case "general-guidance":
      default:
        // Meenakshi, Anand, Rajesh
        return PRACTITIONERS.filter(p => p.id === "meenakshi-iyer" || p.id === "anand-pathak" || p.id === "rajesh-shastri");
    }
  };

  const getEarliestAvailabilityDate = (id: string): string => {
    switch (id) {
      case "meenakshi-iyer": return "Tomorrow, Wednesday, July 15";
      case "rajesh-shastri": return "Thursday, July 16";
      case "anand-pathak": return "Friday, July 17";
      case "venkatesh-raghavan": return "Saturday, July 18";
      default: return "Tomorrow";
    }
  };

  const getEarliestAvailabilityDays = (id: string): number => {
    switch (id) {
      case "meenakshi-iyer": return 1;
      case "rajesh-shastri": return 2;
      case "anand-pathak": return 3;
      case "venkatesh-raghavan": return 4;
      default: return 1;
    }
  };

  const getAvailabilityTimeSlots = (id: string): string[] => {
    switch (id) {
      case "meenakshi-iyer": return ["10:00 AM", "01:00 PM", "04:00 PM", "06:00 PM"];
      case "rajesh-shastri": return ["09:00 AM", "11:30 AM", "03:00 PM"];
      case "anand-pathak": return ["07:30 AM", "02:00 PM", "05:30 PM"];
      case "venkatesh-raghavan": return ["08:00 AM", "10:30 AM", "04:30 PM"];
      default: return ["09:00 AM", "02:00 PM"];
    }
  };

  const getMatchExplanation = (practitioner: Practitioner) => {
    const matches: string[] = [];
    const mismatches: string[] = [];

    // Selected Concern Match
    if (selectedConcern) {
      const isSpecialist = practitioner.specializations.some(s => 
        s.toLowerCase().includes(selectedConcern.title.toLowerCase().split(" ")[0]) ||
        (selectedConcern.id === "career-finances" && s.toLowerCase().includes("career")) ||
        (selectedConcern.id === "marriage-relationships" && s.toLowerCase().includes("compatibility")) ||
        (selectedConcern.id === "family" && (s.toLowerCase().includes("satyanarayan") || s.toLowerCase().includes("upanayanam") || s.toLowerCase().includes("shanti") || s.toLowerCase().includes("homa"))) ||
        (selectedConcern.id === "moving-changes" && s.toLowerCase().includes("pravesh")) ||
        (selectedConcern.id === "home-vastu" && s.toLowerCase().includes("vastu")) ||
        (selectedConcern.id === "ritual-ceremony" && (s.toLowerCase().includes("vivaha") || s.toLowerCase().includes("puja") || s.toLowerCase().includes("homa") || s.toLowerCase().includes("upanayanam"))) ||
        (selectedConcern.id === "general-guidance" && (s.toLowerCase().includes("mrityunjaya") || s.toLowerCase().includes("analysis") || s.toLowerCase().includes("chart")))
      );
      if (isSpecialist) {
        matches.push(`Specialist alignment with your focus on "${selectedConcern.title}"`);
      } else {
        mismatches.push(`No direct specialization in "${selectedConcern.title}"`);
      }
    }

    // Language Match
    if (filterLanguage !== "Any") {
      if (practitioner.languages?.includes(filterLanguage)) {
        matches.push(`Speaks your preferred language: ${filterLanguage}`);
      } else {
        mismatches.push(`Does not speak your preferred language: ${filterLanguage}`);
      }
    }

    // Format Match
    if (filterFormat !== "Any") {
      const isOnline = practitioner.location?.toLowerCase().includes("online") || practitioner.id === "meenakshi-iyer";
      const isInPerson = practitioner.location?.toLowerCase().includes("in-person");
      if (filterFormat === "online") {
        if (isOnline) {
          matches.push(`Offers Online (Zoom) consultations`);
        } else {
          mismatches.push(`Does not offer Online consultations`);
        }
      } else if (filterFormat === "inperson") {
        if (isInPerson) {
          matches.push(`Offers In-Person (Your Home) visits`);
        } else {
          mismatches.push(`Does not offer In-Person visits`);
        }
      }
    }

    // Time Zone Match
    if (filterTimeZone !== "Any") {
      const isOnline = practitioner.location?.toLowerCase().includes("online") || practitioner.id === "meenakshi-iyer";
      if (filterTimeZone === "eastern") {
        matches.push(`Time Zone: Eastern (100% physically compatible or virtual)`);
      } else if (filterTimeZone === "pacific") {
        if (isOnline) {
          matches.push(`Time Zone: Pacific (Fully compatible via Online Zoom sessions)`);
        } else {
          mismatches.push(`Time Zone: Pacific (In-person visits not physically feasible from Eastern zone)`);
        }
      } else if (filterTimeZone === "central") {
        if (isOnline) {
          matches.push(`Time Zone: Central (Fully compatible via Online Zoom sessions)`);
        } else {
          mismatches.push(`Time Zone: Central (In-person visits require special travel arrangements)`);
        }
      }
    }

    // Availability Match
    if (filterAvailability !== "Any") {
      const days = getEarliestAvailabilityDays(practitioner.id);
      if (filterAvailability === "2days") {
        if (days <= 2) {
          matches.push(`Available within 2 days (${getEarliestAvailabilityDate(practitioner.id)})`);
        } else {
          mismatches.push(`Not available within 2 days (Earliest is ${getEarliestAvailabilityDate(practitioner.id)})`);
        }
      } else if (filterAvailability === "5days") {
        if (days <= 5) {
          matches.push(`Available within 5 days (${getEarliestAvailabilityDate(practitioner.id)})`);
        } else {
          mismatches.push(`Not available within 5 days (Earliest is ${getEarliestAvailabilityDate(practitioner.id)})`);
        }
      }
    }

    // Price Match
    if (filterPrice !== "Any") {
      const prices = practitioner.services.map(s => s.price);
      const minPrice = Math.min(...prices);
      if (filterPrice === "under250") {
        if (minPrice <= 250) {
          matches.push(`Budget-friendly: Services start from $${minPrice} (Under $250)`);
        } else {
          mismatches.push(`Exceeds budget: Lowest service price is $${minPrice}`);
        }
      } else if (filterPrice === "under500") {
        if (minPrice <= 500) {
          matches.push(`Within budget: Services start from $${minPrice} (Under $500)`);
        } else {
          mismatches.push(`Exceeds budget: Lowest service price is $${minPrice}`);
        }
      } else if (filterPrice === "above500") {
        const hasPremium = prices.some(p => p >= 500);
        if (hasPremium) {
          matches.push(`Offers premium deep-study services >= $500`);
        } else {
          mismatches.push(`No premium services >= $500 (Prices are $${prices.join(", $")})`);
        }
      }
    }

    return { matches, mismatches };
  };

  const getFilteredPractitioners = (): Practitioner[] => {
    const rawMatches = getMatchedPractitioners();
    
    return rawMatches.filter(practitioner => {
      // 1. Language Filter
      if (filterLanguage !== "Any") {
        if (!practitioner.languages?.includes(filterLanguage)) {
          return false;
        }
      }
      
      // 2. Consultation Format Filter
      if (filterFormat !== "Any") {
        const isOnline = practitioner.location?.toLowerCase().includes("online") || practitioner.id === "meenakshi-iyer";
        const isInPerson = practitioner.location?.toLowerCase().includes("in-person");
        if (filterFormat === "online" && !isOnline) return false;
        if (filterFormat === "inperson" && !isInPerson) return false;
      }
      
      // 3. Time Zone Filter
      if (filterTimeZone !== "Any") {
        if (filterTimeZone === "pacific" && filterFormat === "inperson") {
          if (practitioner.id !== "meenakshi-iyer") {
            return false;
          }
        }
        if (filterTimeZone === "central" && filterFormat === "inperson") {
          if (practitioner.id !== "meenakshi-iyer") {
            return false;
          }
        }
      }
      
      // 4. Availability Filter
      if (filterAvailability !== "Any") {
        const days = getEarliestAvailabilityDays(practitioner.id);
        if (filterAvailability === "2days" && days > 2) return false;
        if (filterAvailability === "5days" && days > 5) return false;
      }
      
      // 5. Price Filter
      if (filterPrice !== "Any") {
        const prices = practitioner.services.map(s => s.price);
        const minPrice = Math.min(...prices);
        if (filterPrice === "under250" && minPrice > 250) return false;
        if (filterPrice === "under500" && minPrice > 500) return false;
        if (filterPrice === "above500") {
          const hasPremium = prices.some(p => p >= 500);
          if (!hasPremium) return false;
        }
      }
      
      return true;
    }).slice(0, 3);
  };

  // Custom static insights matching the concerns (Respectful, non-deterministic)
  const getPersonalizedInsightText = (): string => {
    if (!selectedConcern) return "";
    
    switch (selectedConcern.id) {
      case "career-finances":
        return `Dear ${userName}, based on your birth coordinates, the upcoming cosmic transitions suggest a phase of professional introspection. Saturn's current positioning requests caution in quick financial movements but indicates an auspicious period for acquiring deeper technical skills. Speaking directly with Shastri Ji can help you identify custom planetary alignments (Navagraha) to support your path.`;
      case "marriage-relationships":
        return `Dear ${userName}, celestial parameters highlight relationship dynamics as a focal point. Your chart points toward a transition in communication patterns (Mercury alignment). A personal Kundli consultation or dedicated family blessing will assist in establishing clear pathways for marital harmony and resolving auspicious matching questions.`;
      case "family":
        return `Dear ${userName}, family alignment is strongly influenced by Jupiter's supportive aspects. To invite peace, safeguard ancestral heritage, and bless children's milestone paths, traditional domestic Pujas (such as a thanksgiving Satyanarayan Puja) are highly recommended to balance household energies.`;
      case "moving-changes":
        return `Dear ${userName}, relocating or starting fresh is a powerful transition. Traditional Panchang alignments suggest prioritizing a home-purification rite (Griha Pravesh or Vastu Puja) to ground the new space, clear lingering energy, and bless your threshold with safety and stability.`;
      case "home-vastu":
        return `Dear ${userName}, physical spaces are living energy templates (Vastu Purusha). Your chart indicates home energetics will strongly impact mental clarity this season. Custom Vastu assessments and simple direction-alignment procedures will help maximize positive flow and prosperity.`;
      case "ritual-ceremony":
        return `Dear ${userName}, a sacred milestone is approaching. Aligning your family’s native North or South Indian tradition with Shastri Ji's specific calendar readings (Muhurats) will ensure the procedure is conducted with strict Vedic sanctity.`;
      case "general-guidance":
      default:
        return `Dear ${userName}, your planetary coordinates show a transition phase. While general obstacles may have felt heavy recently, dedicated fire purification rituals (Havan or Shiva Rudrabhishek) help bring immediate mental resilience, clearing the air of anxiety and restoring clarity.`;
    }
  };

  return (
    <div className="w-full relative z-10 px-4 sm:px-6">
      <AnimatePresence mode="wait">
        
        {/* STEP 1: LANDING PAGE */}
        {step === "landing" && (
          <motion.div
            key="landing"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="max-w-2xl mx-auto space-y-12 py-8 sm:py-14 text-center relative"
          >
            {/* Subtle sacred geometry watermark */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none -z-10">
              <RotatingMandala size={500} color="#610000" secondaryColor="#C4922A" speed="slow" />
            </div>

            <div className="space-y-4">
              <span className="text-[10px] font-sans font-black uppercase tracking-[0.3em] text-gold bg-maroon/5 border border-maroon/10 px-3 py-1.5 rounded-full inline-block">
                South Asian Spiritual Marketplace
              </span>
              <h1
                ref={titleRef}
                tabIndex={-1}
                className="font-serif text-3xl sm:text-5xl font-bold text-sandalwood leading-tight focus:outline-none"
              >
                Find Clarity for Your <br />
                <span className="italic font-brand font-light text-maroon">Major Life Milestones</span>
              </h1>
              <p className="font-sans text-sm sm:text-base text-sandalwood/75 max-w-lg mx-auto leading-relaxed">
                SETU connects diaspora families with verified, high-caliber priests and astrologers. Our practitioners undergo strict credential verification, support billingual English fluencies, and operate with upfront flat-rate pricing.
              </p>
            </div>

            {/* Primary Action Button */}
            <div className="max-w-sm mx-auto space-y-3">
              <button
                onClick={handleStartOnboarding}
                className="w-full py-4.5 bg-maroon hover:bg-sandalwood text-ivory font-sans font-bold text-xs tracking-[0.2em] uppercase rounded-xl shadow-card-default hover:shadow-card-hover hover:scale-[1.01] transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-gold flex items-center justify-center gap-2 group"
              >
                <span>Find the right guidance</span>
                <ArrowRight className="w-4 h-4 text-gold group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onOpenKundli}
                className="w-full py-4 bg-warm-ivory border border-maroon/20 hover:border-maroon/50 text-maroon font-sans font-bold text-xs tracking-[0.15em] uppercase rounded-xl shadow-sm hover:scale-[1.01] transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-maroon"
                id="landing-free-kundli-cta"
              >
                <Sparkles className="w-4 h-4 text-gold animate-pulse" />
                <span>Get Free Kundli Report</span>
              </button>

              <button
                onClick={onSkipToDirectory}
                className="w-full py-3 bg-transparent hover:bg-sandalwood/5 text-sandalwood/85 font-sans font-bold text-xs tracking-wider uppercase rounded-lg transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-sandalwood/20 block text-center"
              >
                Or browse all practitioners directly
              </button>
            </div>

            {/* Trust Badging Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-sandalwood/5 max-w-xl mx-auto">
              {[
                { title: "Lineage Vetted", desc: "Identity, training, and Sanskrit credentials fully verified." },
                { title: "No Gemstone Upsells", desc: "Committed to ethical, flat-rate advice, strictly free from pushy sales." },
                { title: "Absolute Privacy", desc: "Birth details and personal coordinates remain 100% private." }
              ].map((pill, idx) => (
                <div key={idx} className="p-4 bg-warm-ivory border border-sandalwood/10 rounded-xl space-y-1">
                  <div className="w-6 h-6 rounded-full bg-teal/10 border border-teal/20 text-teal flex items-center justify-center mx-auto mb-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="font-sans font-bold text-[11px] uppercase tracking-wide text-sandalwood">
                    {pill.title}
                  </h4>
                  <p className="text-[10px] text-sandalwood/60 leading-normal">
                    {pill.desc}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* STEP 2: CONCERN SELECTION */}
        {step === "concern" && (
          <motion.div
            key="concern"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.35 }}
            className="max-w-xl mx-auto py-8 space-y-8"
          >
            {/* Header section */}
            <div className="space-y-2 text-center">
              <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-gold">Step 1 of 2</span>
              <h1
                ref={titleRef}
                tabIndex={-1}
                className="font-serif text-2xl sm:text-3.5xl font-bold text-sandalwood focus:outline-none"
              >
                What area of life is on your mind?
              </h1>
              <p className="font-sans text-xs sm:text-sm text-sandalwood/70 max-w-md mx-auto">
                Select the situation that best describes your current concern. We use this to respect and customize your journey.
              </p>
            </div>

            {validationError && (
              <div className="p-3.5 bg-maroon/5 border border-maroon/20 rounded-xl text-xs text-maroon flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            {/* List of concern cards */}
            <div
              ref={concernListRef}
              className="space-y-2.5"
              role="radiogroup"
              aria-label="Select your major life concern"
            >
              {concernOptions.map((opt) => {
                const isSelected = selectedConcern?.id === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleConcernSelect(opt)}
                    role="radio"
                    aria-checked={isSelected}
                    className={`w-full p-4.5 text-left border rounded-xl cursor-pointer transition-all flex items-start gap-3.5 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-maroon group ${
                      isSelected
                        ? "bg-maroon/5 border-maroon ring-1 ring-maroon/30"
                        : "bg-warm-ivory border-sandalwood/10 hover:border-gold/40 hover:bg-warm-ivory/80"
                    }`}
                  >
                    <span className="text-2xl shrink-0 mt-0.5">{opt.emoji}</span>
                    <div className="space-y-0.5">
                      <span className={`font-sans font-bold text-xs sm:text-sm block transition-colors ${
                        isSelected ? "text-maroon font-black" : "text-sandalwood"
                      }`}>
                        {opt.title}
                      </span>
                      <span className="text-xs text-sandalwood/65 leading-relaxed block">
                        {opt.description}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Stepper Actions */}
            <div className="flex justify-between items-center pt-4 border-t border-sandalwood/5">
              <button
                onClick={() => setStep("landing")}
                className="px-4 py-2.5 border border-sandalwood/20 hover:bg-sandalwood/5 rounded-xl font-sans text-xs font-bold uppercase tracking-wider text-sandalwood/80 transition-colors cursor-pointer flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>

              <button
                onClick={handleConcernContinue}
                className="px-8 py-3.5 bg-maroon hover:bg-sandalwood text-ivory rounded-xl font-sans text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1 focus:ring-2 focus:ring-gold"
              >
                Continue
                <ChevronRight className="w-4 h-4 text-gold" />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: BIRTH DETAILS ENTRY */}
        {step === "birth-details" && (
          <motion.div
            key="birth-details"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.35 }}
            className="max-w-xl mx-auto py-8 space-y-8"
          >
            {/* Header section with selected concern and auto-save feedback */}
            <div className="space-y-3 text-center">
              <div className="flex flex-col sm:flex-row justify-between items-center max-w-xl mx-auto px-1 gap-2">
                <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-gold">Step 2 of 2</span>
                <div className="min-h-[22px]">
                  <AnimatePresence>
                    {progressSaved && (
                      <motion.span
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="text-[10px] bg-teal/10 border border-teal/20 text-teal px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 font-sans font-bold uppercase"
                      >
                        <Check className="w-3 h-3" /> Draft Saved Offline
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <h1
                ref={titleRef}
                tabIndex={-1}
                className="font-serif text-2xl sm:text-3.5xl font-bold text-sandalwood focus:outline-none"
              >
                Align Your Birth Coordinates
              </h1>
              <p className="font-sans text-xs sm:text-sm text-sandalwood/70 max-w-md mx-auto">
                We use these high-precision astronomical coordinates to calculate your initial personalized cosmic insight.
              </p>

              {/* Preserve Selected Concern Indicator */}
              {selectedConcern && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gold/5 border border-gold/15 text-sandalwood/90 rounded-full text-[11px] font-sans font-semibold">
                  <span className="text-sm">{selectedConcern.emoji}</span>
                  <span>Primary Focus: <strong className="text-maroon">{selectedConcern.title}</strong></span>
                </div>
              )}
            </div>

            {/* "Why we ask this" general expandable section */}
            <div className="bg-warm-ivory border border-sandalwood/10 rounded-2xl overflow-hidden shadow-sm transition-all duration-300">
              <button
                type="button"
                onClick={() => setIsWhyWeAskExpanded(!isWhyWeAskExpanded)}
                className="w-full p-4 text-left flex items-center justify-between text-xs text-sandalwood font-bold transition-all hover:bg-sandalwood/5 focus:outline-none focus:ring-1 focus:ring-maroon/20"
                aria-expanded={isWhyWeAskExpanded}
              >
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-maroon shrink-0" />
                  <span className="uppercase tracking-wider">Why we ask for birth coordinates</span>
                </div>
                <span className="text-gold text-lg font-black">{isWhyWeAskExpanded ? "−" : "+"}</span>
              </button>
              <AnimatePresence>
                {isWhyWeAskExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 pt-0 border-t border-sandalwood/5 text-xs text-sandalwood/70 space-y-3 leading-relaxed">
                      <p>
                        Vedic Astrology (Jyotish) is an exact mathematical science of planetary time-mapping. To compute the precise longitude degrees of your charts, the planetary houses must align with physical geographic positions:
                      </p>
                      <ul className="list-disc pl-5 space-y-2 text-[11px] text-sandalwood/75">
                        <li><strong>First name:</strong> Labels your generated charts so they remain distinct.</li>
                        <li><strong>Date of Birth:</strong> Calibrates the slow-moving planetary bodies (such as Jupiter, Saturn, and Rahu/Ketu) that define your major life eras (Mahadashas).</li>
                        <li><strong>Time of Birth:</strong> Establishes the Ascendant (Lagna) or rising sign, which rotates 1 degree every 4 minutes. Essential for high-precision house mapping.</li>
                        <li><strong>Place of Birth:</strong> Computes the exact physical longitude and latitude coordinates to offset global timezone differences relative to local sunrise.</li>
                      </ul>
                      <p className="text-[11px] text-teal font-medium border-t border-sandalwood/5 pt-2">
                        🛡️ <strong>Absolute Privacy:</strong> We do not require account creation, and your coordinates remain securely stored locally on your device. We will never share this information with any practitioner without your separate explicit consent.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {validationError && (
              <div className="p-3.5 bg-maroon/5 border border-maroon/20 rounded-xl text-xs text-maroon flex items-center gap-2 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Birth Details Form */}
            <form ref={formRef} onSubmit={handleBirthSubmit} className="space-y-6 bg-warm-ivory border border-sandalwood/10 rounded-2xl p-5 sm:p-6 shadow-card-default">
              
              {/* Name field */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="user-name-input" className="text-[10px] font-sans font-bold uppercase tracking-wider text-sandalwood/80 block">
                    Your First Name <span className="text-maroon font-bold">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => toggleFieldHelp("firstName")}
                    className="text-[10px] text-gold hover:text-maroon transition-colors flex items-center gap-0.5 font-bold focus:outline-none focus:underline"
                    aria-expanded={activeExplainField === "firstName"}
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    Why ask?
                  </button>
                </div>
                <AnimatePresence>
                  {activeExplainField === "firstName" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-3 bg-gold/5 border border-gold/10 rounded-xl text-[11px] text-sandalwood/70 leading-relaxed">
                        Your first name is used to label your cosmic charts and personalize reports, ensuring your diagnostic files remain distinct and easy to locate.
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sandalwood/40" />
                  <input
                    id="user-name-input"
                    type="text"
                    required
                    value={userName}
                    onChange={(e) => {
                      setUserName(e.target.value);
                      setNameError("");
                    }}
                    placeholder="e.g. Amit"
                    aria-describedby={nameError ? "name-error-msg" : undefined}
                    className={`w-full p-3 pl-10 bg-ivory border focus:border-maroon rounded-xl font-sans text-xs focus:outline-none focus:ring-1 focus:ring-maroon text-sandalwood placeholder:text-sandalwood/30 min-h-[44px] ${
                      nameError ? "border-maroon ring-1 ring-maroon/20" : "border-sandalwood/15"
                    }`}
                  />
                </div>
                {nameError && (
                  <span className="text-[11px] text-maroon font-semibold flex items-center gap-1 mt-1 animate-fadeIn" id="name-error-msg">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {nameError}
                  </span>
                )}
              </div>

              {/* Date of Birth field */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="birth-date-input" className="text-[10px] font-sans font-bold uppercase tracking-wider text-sandalwood/80 block">
                    Date of Birth <span className="text-maroon font-bold">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => toggleFieldHelp("birthDate")}
                    className="text-[10px] text-gold hover:text-maroon transition-colors flex items-center gap-0.5 font-bold focus:outline-none focus:underline"
                    aria-expanded={activeExplainField === "birthDate"}
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    Why ask?
                  </button>
                </div>
                <AnimatePresence>
                  {activeExplainField === "birthDate" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-3 bg-gold/5 border border-gold/10 rounded-xl text-[11px] text-sandalwood/70 leading-relaxed">
                        Calibrates the high-precision degree alignment of slow-moving astronomical planets (like Jupiter, Saturn, and Rahu) that govern major life epochs (Dashas).
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sandalwood/40 pointer-events-none" />
                  <input
                    id="birth-date-input"
                    type="date"
                    required
                    value={birthDate}
                    onChange={(e) => {
                      setBirthDate(e.target.value);
                      setDateError("");
                    }}
                    aria-describedby={dateError ? "date-error-msg" : undefined}
                    className={`w-full p-3 pl-10 bg-ivory border focus:border-maroon rounded-xl font-sans text-xs focus:outline-none focus:ring-1 focus:ring-maroon text-sandalwood min-h-[44px] ${
                      dateError ? "border-maroon ring-1 ring-maroon/20" : "border-sandalwood/15"
                    }`}
                  />
                </div>
                {dateError && (
                  <span className="text-[11px] text-maroon font-semibold flex items-center gap-1 mt-1 animate-fadeIn" id="date-error-msg">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {dateError}
                  </span>
                )}
              </div>

              {/* Time of Birth field */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <label htmlFor="birth-time-input" className="text-[10px] font-sans font-bold uppercase tracking-wider text-sandalwood/80 block">
                      Time of Birth {!isTimeApprox && <span className="text-maroon font-bold">*</span>}
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleFieldHelp("birthTime")}
                    className="text-[10px] text-gold hover:text-maroon transition-colors flex items-center gap-0.5 font-bold focus:outline-none focus:underline"
                    aria-expanded={activeExplainField === "birthTime"}
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    Why ask?
                  </button>
                </div>
                <AnimatePresence>
                  {activeExplainField === "birthTime" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-3 bg-gold/5 border border-gold/10 rounded-xl text-[11px] text-sandalwood/70 leading-relaxed">
                        Fixes your rising sign (Lagna), which rotates 1 degree every 4 minutes. A precise time locks the twelve distinct houses governing marriage, career, and spiritual alignment.
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sandalwood/40 pointer-events-none" />
                  <input
                    id="birth-time-input"
                    type="time"
                    disabled={isTimeApprox}
                    value={isTimeApprox ? "" : birthTime}
                    onChange={(e) => {
                      setBirthTime(e.target.value);
                      setTimeError("");
                    }}
                    placeholder="HH:MM"
                    aria-describedby={timeError ? "time-error-msg" : undefined}
                    className={`w-full p-3 pl-10 bg-ivory border focus:border-maroon rounded-xl font-sans text-xs focus:outline-none focus:ring-1 focus:ring-maroon text-sandalwood min-h-[44px] ${
                      isTimeApprox ? "opacity-55 bg-sandalwood/5 cursor-not-allowed border-sandalwood/10" : 
                      timeError ? "border-maroon ring-1 ring-maroon/20" : "border-sandalwood/15"
                    }`}
                  />
                </div>

                {/* "I do not know my exact birth time" Option */}
                <div className="flex items-start gap-2 pt-1">
                  <input
                    id="approx-time-checkbox"
                    type="checkbox"
                    checked={isTimeApprox}
                    onChange={(e) => {
                      setIsTimeApprox(e.target.checked);
                      setTimeError(""); // Clear errors
                    }}
                    className="mt-0.5 w-4 h-4 text-maroon border-sandalwood/20 focus:ring-maroon rounded shrink-0 cursor-pointer"
                  />
                  <label htmlFor="approx-time-checkbox" className="text-xs font-sans text-sandalwood/70 cursor-pointer select-none leading-normal">
                    I do not know my exact birth time (Approximate standard noon fallback will be used)
                  </label>
                </div>

                {timeError && !isTimeApprox && (
                  <span className="text-[11px] text-maroon font-semibold flex items-center gap-1 mt-1 animate-fadeIn" id="time-error-msg">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {timeError}
                  </span>
                )}
              </div>

              {/* Place of Birth field */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="birth-place-input" className="text-[10px] font-sans font-bold uppercase tracking-wider text-sandalwood/80 block">
                    Place of Birth <span className="text-maroon font-bold">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => toggleFieldHelp("birthPlace")}
                    className="text-[10px] text-gold hover:text-maroon transition-colors flex items-center gap-0.5 font-bold focus:outline-none focus:underline"
                    aria-expanded={activeExplainField === "birthPlace"}
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    Why ask?
                  </button>
                </div>
                <AnimatePresence>
                  {activeExplainField === "birthPlace" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-3 bg-gold/5 border border-gold/10 rounded-xl text-[11px] text-sandalwood/70 leading-relaxed">
                        Translates physical locations into precise longitude and latitude coordinates to offset global timezone differences relative to local sunrise.
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sandalwood/40 pointer-events-none" />
                  <input
                    id="birth-place-input"
                    type="text"
                    required
                    value={birthPlace}
                    onChange={(e) => {
                      setBirthPlace(e.target.value);
                      setPlaceError("");
                    }}
                    placeholder="e.g. Toronto, Canada or New Delhi, India"
                    aria-describedby={placeError ? "place-error-msg" : undefined}
                    className={`w-full p-3 pl-10 bg-ivory border focus:border-maroon rounded-xl font-sans text-xs focus:outline-none focus:ring-1 focus:ring-maroon text-sandalwood placeholder:text-sandalwood/30 min-h-[44px] ${
                      placeError ? "border-maroon ring-1 ring-maroon/20" : "border-sandalwood/15"
                    }`}
                  />
                </div>
                {placeError && (
                  <span className="text-[11px] text-maroon font-semibold flex items-center gap-1 mt-1 animate-fadeIn" id="place-error-msg">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {placeError}
                  </span>
                )}
              </div>

              {/* Padded, high-contrast Dual Consent Block */}
              <div className="p-4 bg-sandalwood/5 border border-sandalwood/10 rounded-2xl space-y-4">
                <div className="flex items-center gap-1.5 border-b border-sandalwood/10 pb-2">
                  <ShieldCheck className="w-4 h-4 text-teal" />
                  <h4 className="text-[10px] font-sans font-black uppercase tracking-wider text-sandalwood/80">
                    Privacy & Data Consents
                  </h4>
                </div>
                
                {/* Product Consent Checkbox (Mandatory) */}
                <div className="space-y-1.5">
                  <div className="flex items-start gap-2.5">
                    <input
                      id="product-consent"
                      type="checkbox"
                      checked={isConsentGiven}
                      onChange={(e) => {
                        setIsConsentGiven(e.target.checked);
                        setConsentError("");
                      }}
                      className="mt-0.5 w-4 h-4 text-maroon border-sandalwood/20 focus:ring-maroon rounded shrink-0 cursor-pointer"
                    />
                    <label htmlFor="product-consent" className="text-xs font-sans text-sandalwood/85 leading-normal cursor-pointer select-none">
                      I consent to SETU processing my birth details to generate this personalized astronomical insight. <span className="text-maroon font-bold">*</span>
                    </label>
                  </div>
                  {consentError && (
                    <span className="text-[10px] text-maroon font-semibold flex items-center gap-1 mt-0.5 pl-6 animate-fadeIn">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {consentError}
                    </span>
                  )}
                </div>

                {/* Marketing Consent Checkbox (Optional) */}
                <div className="flex items-start gap-2.5 pt-2 border-t border-sandalwood/10">
                  <input
                    id="marketing-consent"
                    type="checkbox"
                    checked={isMarketingConsentGiven}
                    onChange={(e) => setIsMarketingConsentGiven(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-maroon border-sandalwood/20 focus:ring-maroon rounded shrink-0 cursor-pointer"
                  />
                  <label htmlFor="marketing-consent" className="text-xs font-sans text-sandalwood/60 leading-normal cursor-pointer select-none">
                    I would like to receive occasional email newsletters, festival calendars, and spiritual insights from SETU. (Optional)
                  </label>
                </div>
              </div>

              {/* Debug / Simulation Utilities Container */}
              <div className="p-3.5 bg-maroon/5 border border-dashed border-maroon/20 rounded-xl flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-maroon block">
                    QA Testing Utility
                  </span>
                  <span className="text-[10px] text-sandalwood/65 block leading-normal">
                    Simulate astronomical server outage (Error 504 and Retry flow)
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <input
                    id="simulate-error-checkbox"
                    type="checkbox"
                    checked={simulateError}
                    onChange={(e) => setSimulateError(e.target.checked)}
                    className="w-4 h-4 text-maroon border-maroon/20 focus:ring-maroon rounded cursor-pointer"
                  />
                  <label htmlFor="simulate-error-checkbox" className="text-[10px] font-sans font-bold text-maroon cursor-pointer select-none">
                    Simulate Outage
                  </label>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full py-4 bg-maroon hover:bg-sandalwood text-ivory font-sans font-bold text-xs tracking-[0.15em] uppercase rounded-xl shadow-card-default hover:shadow-card-hover hover:scale-[1.01] transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-gold flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-gold" />
                Calculate My Initial Insight
              </button>
            </form>

            {/* Stepper Navigation: Back */}
            <div className="flex justify-start pt-2">
              <button
                type="button"
                onClick={() => setStep("concern")}
                className="px-4 py-2.5 border border-sandalwood/20 hover:bg-sandalwood/5 rounded-xl font-sans text-xs font-bold uppercase tracking-wider text-sandalwood/80 transition-colors cursor-pointer flex items-center gap-1 focus:outline-none focus:ring-1 focus:ring-sandalwood/30"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Concern
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 4: LOADING SCREEN */}
        {step === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-md mx-auto py-16 text-center space-y-8"
          >
            {calculationError ? (
              <div className="bg-warm-ivory border border-maroon/20 p-6 sm:p-8 rounded-2xl space-y-6 shadow-card-default text-left animate-fadeIn">
                <div className="flex items-center gap-3 text-maroon">
                  <div className="w-10 h-10 rounded-full bg-maroon/10 flex items-center justify-center shrink-0">
                    <BadgeAlert className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold">Calculation Failed</h3>
                    <p className="font-sans text-[10px] text-sandalwood/50 uppercase tracking-widest font-black">Registry Lookup Timeout</p>
                  </div>
                </div>

                <div className="p-4 bg-maroon/5 border border-maroon/10 rounded-xl">
                  <p className="font-sans text-xs text-sandalwood/80 leading-relaxed">
                    {calculationError}
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => {
                      // Disable the simulation so the next calculation succeeds perfectly!
                      setSimulateError(false);
                      setCalculationError(null);
                      setLoadingProgress(0);
                      setLoadingTextIndex(0);
                      // Toggle screen briefly to reset states safely
                      setStep("birth-details");
                      setTimeout(() => setStep("loading"), 50);
                    }}
                    className="w-full py-3.5 bg-maroon hover:bg-sandalwood text-ivory font-sans font-bold text-xs tracking-wider uppercase rounded-xl transition-all cursor-pointer text-center flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-gold animate-pulse" />
                    Retry Calculation Now
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStep("birth-details");
                    }}
                    className="w-full py-2.5 bg-transparent hover:bg-sandalwood/5 border border-sandalwood/20 text-sandalwood/80 font-sans font-bold text-[11px] tracking-wider uppercase rounded-xl transition-all cursor-pointer text-center"
                  >
                    Back to Birth Details
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Spinning mandala */}
                <div className="w-28 h-28 mx-auto flex items-center justify-center relative">
                  <div className="absolute inset-0">
                    <RotatingMandala size={112} color="#610000" secondaryColor="#C4922A" speed="medium" />
                  </div>
                  <Sparkles className="w-6 h-6 text-gold animate-pulse relative z-10" />
                </div>

                <div className="space-y-3">
                  <h3 className="font-serif text-lg font-bold text-sandalwood">
                    Aligning Your Cosmic Grid
                  </h3>
                  
                  {/* Progress bar */}
                  <div className="w-48 h-1 bg-sandalwood/10 rounded-full mx-auto overflow-hidden">
                    <div
                      className="h-full bg-gold transition-all duration-300"
                      style={{ width: `${loadingProgress}%` }}
                    />
                  </div>

                  {/* Shifting loading copy */}
                  <p className="font-sans text-xs text-sandalwood/60 max-w-xs mx-auto italic min-h-[36px] flex items-center justify-center leading-normal">
                    {loadingTexts[loadingTextIndex]}
                  </p>
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* STEP 5: RESULTS (INSIGHTS & MATCHES) */}
        {step === "insight-results" && (
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4 }}
            className="max-w-3xl mx-auto py-8 space-y-8"
          >
            {/* Header section with calculation feedback */}
            <div className="space-y-3 text-center">
              <span className="text-[10px] font-sans font-black uppercase tracking-widest text-gold bg-gold/10 border border-gold/20 px-3 py-1 rounded-full inline-block">
                Astrological Grid Calibrated
              </span>
              <h1
                ref={titleRef}
                tabIndex={-1}
                className="font-serif text-3xl sm:text-4xl font-bold text-sandalwood focus:outline-none"
              >
                Your Initial Cosmic Alignment
              </h1>
              <p className="font-sans text-xs sm:text-sm text-sandalwood/75 max-w-md mx-auto">
                Computed specifically for <strong className="text-maroon">{userName}</strong> based on {selectedConcern?.title.toLowerCase()} focus and birth coordinates.
              </p>
            </div>

            {/* Simulated Prototype Data Badge */}
            <div className="p-3 bg-gold/5 border border-gold/20 rounded-xl flex items-start gap-2.5 text-left max-w-2xl mx-auto">
              <Info className="w-4.5 h-4.5 text-gold shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-sandalwood block">
                  Prototype System Notice
                </span>
                <p className="text-[11px] text-sandalwood/70 leading-normal">
                  Because live connection to a regional ephemeris coordinate registry is currently in developer preview, this chart displays high-fidelity <strong>prototype simulation data</strong> utilizing standard offline mathematical fallbacks.
                </p>
              </div>
            </div>

            {/* HIGHLIGHT: The First Value Moment Card (Visible above fold on mobile) */}
            <div className="bg-warm-ivory border border-gold/20 rounded-3xl p-6 sm:p-8 shadow-card-default space-y-6 relative overflow-hidden text-left">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-gold" />
              
              {/* Card Header & Concern Summary */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sandalwood/10 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{selectedConcern?.emoji}</span>
                    <div>
                      <span className="text-[9px] font-sans font-black uppercase tracking-widest text-maroon block">Primary Focus: {selectedConcern?.title}</span>
                      <h3 className="font-serif text-lg font-bold text-sandalwood leading-snug">
                        {selectedConcern ? INSIGHTS_DATA[selectedConcern.id]?.summary : "Cosmic Overview"}
                      </h3>
                    </div>
                  </div>
                  
                  {/* Optional action: Explain this more simply */}
                  <button
                    type="button"
                    onClick={() => {
                      const newSimplified = !isSimplified;
                      setIsSimplified(newSimplified);
                      if (newSimplified) {
                        triggerEvent("insight_simplified");
                      }
                      triggerEvent("insight_viewed", {
                        insight_id: selectedConcern?.id || "unknown",
                        insight_summary_length: INSIGHTS_DATA[selectedConcern?.id || ""]?.summary.length || 0,
                        is_simplified_view: newSimplified
                      });
                    }}
                    className="px-3 py-1.5 bg-sandalwood/5 hover:bg-sandalwood/10 border border-sandalwood/15 rounded-lg text-[10px] font-sans font-bold uppercase tracking-wider text-sandalwood transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-1 focus:ring-maroon/20 cursor-pointer"
                  >
                    <span>{isSimplified ? "Show Traditional Detail" : "Explain More Simply"}</span>
                  </button>
                </div>
              </div>

              {/* Plain-Language Explanation */}
              <div className="space-y-3">
                <span className="text-[9px] font-sans font-black uppercase tracking-widest text-gold block">
                  {isSimplified ? "PLAIN-LANGUAGE EXPLANATION" : "ASTROLOGICAL ANALYSIS"}
                </span>
                
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isSimplified ? "simplified" : "standard"}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                    className="font-sans text-sm text-sandalwood/85 leading-relaxed"
                  >
                    {selectedConcern ? (
                      isSimplified 
                        ? INSIGHTS_DATA[selectedConcern.id]?.simpleExplanation 
                        : INSIGHTS_DATA[selectedConcern.id]?.explanation
                    ) : (
                      "No concern selected. Please restart the onboarding process."
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Informational Advice & Disclaimer (No Fear, No Medical/Legal/Financial Claims) */}
              <div className="pt-4 border-t border-sandalwood/10 flex items-start gap-2.5 text-[11px] text-sandalwood/60 leading-relaxed font-sans">
                <ShieldCheck className="w-4 h-4 text-teal shrink-0 mt-0.5" />
                <p>
                  <strong className="text-sandalwood font-bold">Informational Notice:</strong> This non-deterministic Vedic cosmic insight is calculated solely for self-reflection and general guidance. Vedic astrology functions as a spiritual probability map; it does not constitute absolute financial, medical, career, or legal advice, nor does it guarantee specific future events.
                </p>
              </div>

              {/* Dual Action CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                {/* Primary CTA: Discuss with practitioner */}
                <button
                  type="button"
                  onClick={() => {
                    triggerEvent("practitioner_cta_clicked");
                    practitionersRef.current?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="flex-grow py-3.5 bg-maroon hover:bg-sandalwood text-ivory font-sans font-bold text-xs tracking-widest uppercase rounded-xl shadow-card-default hover:shadow-card-hover hover:scale-[1.01] transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-gold"
                >
                  <Sparkles className="w-4 h-4 text-gold animate-pulse" />
                  Discuss this with a verified practitioner
                </button>

                {/* Secondary CTA: Save my report */}
                <button
                  type="button"
                  onClick={() => {
                    triggerEvent("report_save_clicked");
                    setReportSavedStatus(true);
                  }}
                  disabled={reportSavedStatus}
                  className={`px-6 py-3.5 border rounded-xl font-sans font-bold text-xs tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-1.5 focus:outline-none focus:ring-1 focus:ring-sandalwood/30 ${
                    reportSavedStatus 
                      ? "bg-teal/5 border-teal/20 text-teal cursor-default"
                      : "bg-transparent border-sandalwood/20 hover:bg-sandalwood/5 text-sandalwood cursor-pointer"
                  }`}
                >
                  {reportSavedStatus ? (
                    <>
                      <Check className="w-4 h-4 text-teal" />
                      Saved Successfully
                    </>
                  ) : (
                    <>
                      Save my report
                    </>
                  )}
                </button>
              </div>

              {/* Interactive Save Success Feedback Toast */}
              <AnimatePresence>
                {reportSavedStatus && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3 bg-teal/10 border border-teal/20 text-teal rounded-xl text-xs font-sans font-semibold flex items-center gap-2 mt-2"
                  >
                    <Check className="w-4 h-4" />
                    Your personalized report has been securely saved to your offline device cache for future offline reference.
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bento Grid: What this can tell you & What this cannot determine */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              {/* Section: What this can tell you */}
              <div className="p-5 bg-warm-ivory border border-teal/10 rounded-2xl space-y-4">
                <div className="flex items-center gap-2 text-teal">
                  <div className="w-7 h-7 rounded-full bg-teal/10 flex items-center justify-center">
                    <Check className="w-4 h-4" />
                  </div>
                  <h4 className="font-serif font-bold text-sm text-sandalwood uppercase tracking-wide">
                    What this can tell you
                  </h4>
                </div>
                <ul className="space-y-2 text-xs text-sandalwood/75 leading-relaxed pl-1">
                  {selectedConcern && INSIGHTS_DATA[selectedConcern.id]?.canTell.map((item, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="text-teal font-black">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Section: What this cannot determine */}
              <div className="p-5 bg-warm-ivory border border-maroon/5 rounded-2xl space-y-4">
                <div className="flex items-center gap-2 text-maroon">
                  <div className="w-7 h-7 rounded-full bg-maroon/10 flex items-center justify-center">
                    <BadgeAlert className="w-4 h-4 text-maroon" />
                  </div>
                  <h4 className="font-serif font-bold text-sm text-sandalwood uppercase tracking-wide">
                    What this cannot determine
                  </h4>
                </div>
                <ul className="space-y-2 text-xs text-sandalwood/75 leading-relaxed pl-1">
                  {selectedConcern && INSIGHTS_DATA[selectedConcern.id]?.cannotDetermine.map((item, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="text-maroon/60 font-black">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Curated Guides Section */}
            <div ref={practitionersRef} className="space-y-6 scroll-mt-6 border-t border-sandalwood/10 pt-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 text-left">
                <div className="space-y-1">
                  <span className="text-[9px] font-sans font-black uppercase tracking-[0.2em] text-maroon block">Transparent Matchmaking Criteria</span>
                  <h3 className="font-serif text-2xl font-bold text-sandalwood">
                    Curated verified guides for your {selectedConcern?.title} concern
                  </h3>
                  <p className="text-xs text-sandalwood/65 font-sans">
                    These certified practitioners are selected based on their specialized lineage and certified credentials. No black-box AI logic.
                  </p>
                </div>
                {getFilteredPractitioners().length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      triggerEvent("practitioner_compared");
                      setComparing(true);
                    }}
                    className="shrink-0 w-full md:w-auto px-4 py-2 border border-gold/40 hover:bg-gold/5 text-gold text-xs font-sans font-bold uppercase tracking-wider rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                  >
                    Compare Matches Side-by-Side
                  </button>
                )}
              </div>

              {/* Transparent Rules Filters Box */}
              <div className="p-4 bg-warm-ivory border border-sandalwood/10 rounded-2xl text-left space-y-4 shadow-sm">
                <div className="flex items-center gap-2 text-sandalwood/80 pb-2 border-b border-sandalwood/5">
                  <SlidersHorizontal className="w-4 h-4 text-gold" />
                  <h4 className="font-sans font-bold text-xs uppercase tracking-wider">Refine Matches with Transparent Rules</h4>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {/* Language Filter */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-sans font-bold text-sandalwood/60 uppercase">Language</label>
                    <select
                      value={filterLanguage}
                      onChange={(e) => setFilterLanguage(e.target.value)}
                      className="w-full text-xs bg-ivory border border-sandalwood/15 rounded-lg p-2 text-sandalwood focus:outline-none focus:border-gold cursor-pointer"
                    >
                      <option value="Any">All Languages</option>
                      <option value="English">English</option>
                      <option value="Hindi">Hindi</option>
                      <option value="Tamil">Tamil</option>
                      <option value="Telugu">Telugu</option>
                      <option value="Sanskrit">Sanskrit</option>
                    </select>
                  </div>

                  {/* Format Filter */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-sans font-bold text-sandalwood/60 uppercase">Format</label>
                    <select
                      value={filterFormat}
                      onChange={(e) => setFilterFormat(e.target.value)}
                      className="w-full text-xs bg-ivory border border-sandalwood/15 rounded-lg p-2 text-sandalwood focus:outline-none focus:border-gold cursor-pointer"
                    >
                      <option value="Any">All Formats</option>
                      <option value="online">Online (Video)</option>
                      <option value="inperson">In-Person (Home)</option>
                    </select>
                  </div>

                  {/* Time Zone Filter */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-sans font-bold text-sandalwood/60 uppercase">Your Time Zone</label>
                    <select
                      value={filterTimeZone}
                      onChange={(e) => setFilterTimeZone(e.target.value)}
                      className="w-full text-xs bg-ivory border border-sandalwood/15 rounded-lg p-2 text-sandalwood focus:outline-none focus:border-gold cursor-pointer"
                    >
                      <option value="Any">All Zones</option>
                      <option value="eastern">Eastern (EST)</option>
                      <option value="central">Central (CST)</option>
                      <option value="pacific">Pacific (PST)</option>
                    </select>
                  </div>

                  {/* Availability Filter */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-sans font-bold text-sandalwood/60 uppercase">Availability</label>
                    <select
                      value={filterAvailability}
                      onChange={(e) => setFilterAvailability(e.target.value)}
                      className="w-full text-xs bg-ivory border border-sandalwood/15 rounded-lg p-2 text-sandalwood focus:outline-none focus:border-gold cursor-pointer"
                    >
                      <option value="Any">Any Timeframe</option>
                      <option value="2days">Within 2 Days</option>
                      <option value="5days">Within 5 Days</option>
                    </select>
                  </div>

                  {/* Price Filter */}
                  <div className="space-y-1 col-span-2 md:col-span-1">
                    <label className="block text-[10px] font-sans font-bold text-sandalwood/60 uppercase">Max Budget</label>
                    <select
                      value={filterPrice}
                      onChange={(e) => setFilterPrice(e.target.value)}
                      className="w-full text-xs bg-ivory border border-sandalwood/15 rounded-lg p-2 text-sandalwood focus:outline-none focus:border-gold cursor-pointer"
                    >
                      <option value="Any">Any Price</option>
                      <option value="under250">Under $250</option>
                      <option value="under500">Under $500</option>
                      <option value="above500">Premium ($500+)</option>
                    </select>
                  </div>
                </div>

                <div className="text-[10px] text-sandalwood/60 italic leading-relaxed">
                  Active Filter Rule Set: Matching specializations to <span className="font-bold">"{selectedConcern?.title}"</span>
                  {filterLanguage !== "Any" && <span> + Language: <span className="font-bold text-teal">{filterLanguage}</span></span>}
                  {filterFormat !== "Any" && <span> + Format: <span className="font-bold text-teal">{filterFormat === "online" ? "Online" : "In-Person"}</span></span>}
                  {filterPrice !== "Any" && <span> + Price: <span className="font-bold text-teal">{filterPrice}</span></span>}
                </div>
              </div>

              {/* Matched Practitioner cards */}
              <div className="space-y-5 text-left">
                {getFilteredPractitioners().length === 0 ? (
                  /* EMPTY STATE FALLBACK */
                  <div className="p-8 bg-warm-ivory border border-maroon/10 rounded-2xl text-center space-y-4 max-w-xl mx-auto">
                    <div className="w-12 h-12 bg-maroon/5 border border-maroon/10 rounded-full flex items-center justify-center mx-auto text-maroon">
                      <HelpCircle className="w-6 h-6" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-serif font-bold text-lg text-sandalwood">No Exact Practitioner Matches Found</h4>
                      <p className="text-xs text-sandalwood/75 leading-relaxed">
                        Your filter criteria are highly specific for this specialized branch of rituals. Some of our verified priests operate primarily in their local regional time zones or offer specific formats.
                      </p>
                    </div>

                    {manualMatchRequested ? (
                      <div className="p-3.5 bg-teal/5 border border-teal/20 text-teal rounded-xl text-xs font-sans font-semibold flex items-center justify-center gap-2">
                        <Check className="w-4 h-4" />
                        Manual matching request submitted. Our coordination desk will email you within 4 hours.
                      </div>
                    ) : (
                      <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                          type="button"
                          onClick={() => {
                            setFilterLanguage("Any");
                            setFilterFormat("Any");
                            setFilterTimeZone("Any");
                            setFilterAvailability("Any");
                            setFilterPrice("Any");
                          }}
                          className="px-4 py-2 border border-sandalwood/20 hover:bg-sandalwood/5 text-sandalwood text-xs font-sans font-bold uppercase tracking-wider rounded-xl cursor-pointer transition-colors"
                        >
                          Reset Filter Rules
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            triggerEvent("manual_match_requested");
                            setManualMatchRequested(true);
                          }}
                          className="px-4 py-2 bg-maroon hover:bg-sandalwood text-ivory text-xs font-sans font-bold uppercase tracking-wider rounded-xl cursor-pointer transition-all shadow-sm"
                        >
                          Request Custom Manual Matching
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  getFilteredPractitioners().map((practitioner) => {
                    const { matches, mismatches } = getMatchExplanation(practitioner);
                    const isExpanded = expandedMatchReason === practitioner.id;
                    const cheapestService = practitioner.services.reduce((prev, curr) => prev.price < curr.price ? prev : curr, practitioner.services[0]);

                    return (
                      <div
                        key={practitioner.id}
                        className="p-5 sm:p-6 bg-warm-ivory border border-sandalwood/10 rounded-2xl shadow-card-default hover:shadow-card-hover hover:border-gold/30 transition-all duration-300 relative group flex flex-col md:flex-row gap-5"
                      >
                        {/* Practitioner Photo & Verification Indicator */}
                        <div className="shrink-0 flex flex-col items-center gap-3">
                          <div className="w-20 h-20 rounded-full border-2 border-gold/20 overflow-hidden bg-ivory shadow-sm relative">
                            <img
                              src={practitioner.photo}
                              alt={practitioner.name}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          
                          {/* Verification Badge (interactive) */}
                          <button
                            type="button"
                            onClick={() => {
                              triggerEvent("verification_details_opened");
                              setActiveVerificationPractitioner(practitioner);
                            }}
                            className="text-[9px] font-sans font-black uppercase tracking-wider bg-teal/10 hover:bg-teal/15 text-teal border border-teal/20 px-2 py-1 rounded-full flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <ShieldCheck className="w-3 h-3" />
                            Verified Guide
                          </button>
                        </div>

                        {/* Practitioner Text details */}
                        <div className="flex-grow space-y-3.5">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b border-sandalwood/5 pb-3">
                            <div className="space-y-1 text-center md:text-left">
                              <div className="flex items-center justify-center md:justify-start gap-2">
                                <h4 className="font-serif font-bold text-base sm:text-lg text-sandalwood">
                                  {practitioner.name}
                                </h4>
                                {practitioner.devanagariName && (
                                  <span className="font-devanagari text-[10px] text-maroon bg-maroon/5 px-1.5 py-0.5 rounded-full">
                                    {practitioner.devanagariName}
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] uppercase tracking-wider font-sans font-bold text-gold text-center md:text-left">
                                {practitioner.tradition} • {practitioner.experienceYears}+ Years Experience
                              </p>
                            </div>
                            
                            {/* Short pricing card */}
                            <div className="text-center sm:text-right shrink-0 bg-sandalwood/5 sm:bg-transparent p-2 sm:p-0 rounded-xl">
                              <div className="text-[10px] font-sans text-sandalwood/60">Session Starts From</div>
                              <div className="text-base font-serif font-bold text-maroon">${cheapestService.price}</div>
                              <div className="text-[9px] uppercase tracking-wider text-sandalwood/50 font-bold font-sans">
                                {cheapestService.duration}
                              </div>
                            </div>
                          </div>

                          {/* Snippet bio */}
                          <p className="text-xs text-sandalwood/75 font-sans leading-relaxed text-center md:text-left">
                            {practitioner.bio.split(".")[0]}. {practitioner.bio.split(".")[1]}.
                          </p>

                          {/* Location, Language, format details */}
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[11px] text-sandalwood/70 font-sans bg-ivory/50 p-3 rounded-xl border border-sandalwood/5 text-center sm:text-left">
                            <div className="space-y-0.5">
                              <span className="text-[9px] uppercase text-sandalwood/40 block font-bold">Consultation</span>
                              <div className="flex items-center justify-center sm:justify-start gap-1">
                                <MapPin className="w-3.5 h-3.5 text-gold shrink-0" />
                                <span className="font-semibold">{practitioner.location?.split(" (")[0]}</span>
                              </div>
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-[9px] uppercase text-sandalwood/40 block font-bold">Earliest Slot</span>
                              <div className="flex items-center justify-center sm:justify-start gap-1">
                                <Calendar className="w-3.5 h-3.5 text-maroon shrink-0" />
                                <span className="font-semibold text-maroon">{getEarliestAvailabilityDate(practitioner.id).split(", ").slice(1).join(", ")}</span>
                              </div>
                            </div>
                            <div className="space-y-0.5 col-span-2 sm:col-span-1">
                              <span className="text-[9px] uppercase text-sandalwood/40 block font-bold">Languages Spoken</span>
                              <div className="flex items-center justify-center sm:justify-start gap-1">
                                <Languages className="w-3.5 h-3.5 text-teal shrink-0" />
                                <span className="truncate">{practitioner.languages?.join(", ")}</span>
                              </div>
                            </div>
                          </div>

                          {/* Rule-Based Match Explanation with detail expansion */}
                          <div className="bg-teal/5 border border-teal/10 rounded-xl p-3.5 space-y-2">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-teal shrink-0 animate-pulse"></span>
                                <span className="text-[10px] font-sans font-bold text-teal uppercase tracking-wider">Transparent Match Rationale</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  triggerEvent("recommendation_reason_opened");
                                  setExpandedMatchReason(isExpanded ? null : practitioner.id);
                                }}
                                className="text-[10px] text-maroon hover:text-sandalwood font-sans font-bold underline cursor-pointer"
                              >
                                {isExpanded ? "Hide Criteria Rules" : "Explain Criteria Match"}
                              </button>
                            </div>
                            
                            <p className="text-xs text-sandalwood/80 leading-relaxed font-sans text-left">
                              Matched because Shastri Ji specializes in <strong>{practitioner.specializations.slice(0, 2).join(", ")}</strong>, matching your {selectedConcern?.title.toLowerCase()} focus.
                            </p>

                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="border-t border-teal/10 pt-2 mt-2 space-y-1.5 text-[11px] font-sans text-sandalwood/70 text-left"
                                >
                                  {matches.map((rule, index) => (
                                    <div key={`match-${index}`} className="flex items-center gap-2 text-teal">
                                      <Check className="w-3.5 h-3.5 shrink-0" />
                                      <span>{rule}</span>
                                    </div>
                                  ))}
                                  {mismatches.map((rule, index) => (
                                    <div key={`mismatch-${index}`} className="flex items-center gap-2 text-sandalwood/40">
                                      <span className="text-[12px] pl-1 font-black shrink-0">•</span>
                                      <span>{rule}</span>
                                    </div>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          {/* Action Buttons for interactive flow */}
                          <div className="flex flex-col sm:flex-row gap-3 pt-2">
                            <button
                              type="button"
                              onClick={() => {
                                triggerEvent("practitioner_profile_viewed");
                                setActivePractitionerProfile(practitioner);
                              }}
                              className="w-full sm:w-auto flex-1 px-4 py-2.5 border border-sandalwood/20 hover:bg-sandalwood/5 text-sandalwood font-sans font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-colors text-center"
                            >
                              View Full Profile
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                triggerEvent("availability_checked");
                                setActivePractitionerAvailability(practitioner);
                                setBookingConfirmedStatus(false);
                                setSelectedBookingDate("");
                                setSelectedBookingTime("");
                              }}
                              className="w-full sm:w-auto flex-1 px-4 py-2.5 border border-gold/30 hover:bg-gold/5 text-gold font-sans font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-colors text-center"
                            >
                              Check Calendar & Slots
                            </button>
                            <button
                              type="button"
                              onClick={() => onSelectPractitioner(practitioner)}
                              className="w-full sm:w-auto px-6 py-2.5 bg-maroon hover:bg-sandalwood text-ivory font-sans font-bold text-xs tracking-wider uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 shadow-card-default"
                            >
                              Select & Continue
                              <ChevronRight className="w-4 h-4 text-gold" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* MODALS SECTION */}
              {/* Modal: Verification Details Panel */}
              <AnimatePresence>
                {activeVerificationPractitioner && (
                  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-ivory border border-sandalwood/10 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl relative text-left"
                    >
                      <div className="bg-maroon p-5 text-ivory flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-5 h-5 text-gold" />
                          <h3 className="font-serif font-bold text-base sm:text-lg">Verification Credentials Checklist</h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveVerificationPractitioner(null)}
                          className="text-ivory/80 hover:text-ivory bg-white/10 hover:bg-white/20 p-1 rounded-full cursor-pointer transition-colors font-bold text-sm"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="p-6 space-y-5">
                        <p className="text-xs text-sandalwood/80 leading-relaxed">
                          To maintain absolute spiritual integrity and consumer trust, we manually verify every guide on the platform. Review the completed audits for <strong>{activeVerificationPractitioner.name}</strong> below:
                        </p>

                        <div className="space-y-4 font-sans">
                          {/* 1. Identity Checked */}
                          <div className="flex gap-3">
                            <div className="w-5 h-5 rounded-full bg-teal/10 flex items-center justify-center text-teal shrink-0 mt-0.5">
                              <Check className="w-3.5 h-3.5" />
                            </div>
                            <div className="space-y-1">
                              <span className="text-xs font-black uppercase text-sandalwood tracking-wide block">1. Identity & Academic Certification Checked</span>
                              <p className="text-[11px] text-sandalwood/70 leading-relaxed">
                                Verified official state photo ID and verified advanced Sanskrit/theology credentials (such as Acharya, Shastri, or lineage certification degrees) from certified, accredited Vedic boards.
                              </p>
                            </div>
                          </div>

                          {/* 2. Experience Reviewed */}
                          <div className="flex gap-3">
                            <div className="w-5 h-5 rounded-full bg-teal/10 flex items-center justify-center text-teal shrink-0 mt-0.5">
                              <Check className="w-3.5 h-3.5" />
                            </div>
                            <div className="space-y-1">
                              <span className="text-xs font-black uppercase text-sandalwood tracking-wide block">2. Lineage & Experience Reviewed</span>
                              <p className="text-[11px] text-sandalwood/70 leading-relaxed">
                                Verified {activeVerificationPractitioner.experienceYears}+ years of independent priesthood practice, authentic oral/ritual transmissions, and temple advisory background.
                              </p>
                            </div>
                          </div>

                          {/* 3. References Checked */}
                          <div className="flex gap-3">
                            <div className="w-5 h-5 rounded-full bg-teal/10 flex items-center justify-center text-teal shrink-0 mt-0.5">
                              <Check className="w-3.5 h-3.5" />
                            </div>
                            <div className="space-y-1">
                              <span className="text-xs font-black uppercase text-sandalwood tracking-wide block">3. Professional Reference Check</span>
                              <p className="text-[11px] text-sandalwood/70 leading-relaxed">
                                Ethical standing and ritual execution reviews conducted through independent interviews with local temple trusts, community elders, or past event host coordinators.
                              </p>
                            </div>
                          </div>

                          {/* 4. Ethical Conduct Accepted */}
                          <div className="flex gap-3">
                            <div className="w-5 h-5 rounded-full bg-teal/10 flex items-center justify-center text-teal shrink-0 mt-0.5">
                              <Check className="w-3.5 h-3.5" />
                            </div>
                            <div className="space-y-1">
                              <span className="text-xs font-black uppercase text-sandalwood tracking-wide block">4. SETU Ethical Code of Conduct Accepted</span>
                              <p className="text-[11px] text-sandalwood/70 leading-relaxed">
                                Signed agreement to SETU's Strict Ethical Standards: transparent flat pricing, absolute privacy of birth details, zero fear-based predictions, and no unsolicited upsells.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-teal/5 border border-teal/10 rounded-xl flex items-center justify-between text-xs font-sans">
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-teal" />
                            <span className="font-bold text-teal">Verification Status:</span>
                          </div>
                          <span className="font-bold text-teal bg-teal/10 px-2.5 py-1 rounded-md uppercase tracking-wider text-[10px]">
                            Fully Accredited
                          </span>
                        </div>
                      </div>

                      <div className="p-4 bg-warm-ivory border-t border-sandalwood/5 flex justify-end">
                        <button
                          type="button"
                          onClick={() => setActiveVerificationPractitioner(null)}
                          className="px-5 py-2.5 bg-sandalwood hover:bg-maroon text-ivory text-xs font-sans font-bold uppercase tracking-wider rounded-xl cursor-pointer transition-colors"
                        >
                          Close Panel
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

              {/* Modal: Full Profile view */}
              <AnimatePresence>
                {activePractitionerProfile && (
                  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-ivory border border-sandalwood/10 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl relative text-left my-8"
                    >
                      {/* Top banner */}
                      <div className="bg-sandalwood/10 p-6 flex flex-col sm:flex-row gap-5 items-center sm:items-start relative border-b border-sandalwood/5">
                        <button
                          type="button"
                          onClick={() => setActivePractitionerProfile(null)}
                          className="absolute right-4 top-4 text-sandalwood/60 hover:text-sandalwood bg-white/50 hover:bg-white/80 p-1 rounded-full cursor-pointer transition-colors text-xs font-sans font-bold"
                        >
                          ✕
                        </button>

                        <div className="w-20 h-20 rounded-full border border-sandalwood/10 overflow-hidden bg-white shrink-0 shadow-sm">
                          <img
                            src={activePractitionerProfile.photo}
                            alt={activePractitionerProfile.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        
                        <div className="space-y-1.5 text-center sm:text-left">
                          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                            <h3 className="font-serif font-bold text-lg sm:text-xl text-sandalwood">{activePractitionerProfile.name}</h3>
                            {activePractitionerProfile.devanagariName && (
                              <span className="font-devanagari text-xs text-maroon bg-maroon/5 px-2 py-0.5 rounded-full">
                                {activePractitionerProfile.devanagariName}
                              </span>
                            )}
                          </div>
                          <p className="text-xs uppercase tracking-wider font-sans font-bold text-gold">
                            {activePractitionerProfile.tradition} • {activePractitionerProfile.experienceYears}+ Years Priesthood
                          </p>
                          <div className="flex flex-wrap justify-center sm:justify-start gap-1.5 pt-1">
                            {activePractitionerProfile.specializations.map((spec, index) => (
                              <span key={index} className="text-[9px] bg-maroon/5 text-maroon font-bold font-sans uppercase px-2 py-0.5 rounded">
                                {spec}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="p-6 space-y-5 max-h-[400px] overflow-y-auto">
                        {/* Biography section */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-sans font-bold uppercase text-sandalwood tracking-wide">Biography & Background</h4>
                          <p className="text-xs text-sandalwood/80 leading-relaxed font-sans whitespace-pre-line">
                            {activePractitionerProfile.bio}
                          </p>
                        </div>

                        {/* Lineage Note */}
                        <div className="p-4 bg-gold/5 border border-gold/10 rounded-xl space-y-1">
                          <span className="text-[10px] font-sans font-bold text-gold uppercase tracking-wider block">Lineage & Training Manual</span>
                          <p className="text-xs text-sandalwood/80 leading-relaxed">
                            Trained systematically under traditional lineage standards, verifying immaculate pronunciation of Sanskrit mantras and strict adherence to classical Smarta / Agama manuals.
                          </p>
                        </div>

                        {/* Services List */}
                        <div className="space-y-3">
                          <h4 className="text-xs font-sans font-bold uppercase text-sandalwood tracking-wide">Available Services</h4>
                          <div className="space-y-3">
                            {activePractitionerProfile.services.map((service) => (
                              <div key={service.id} className="p-4 bg-warm-ivory border border-sandalwood/10 rounded-xl flex justify-between items-start gap-4 hover:border-gold/30 transition-all">
                                <div className="space-y-1 text-left">
                                  <span className="font-serif font-bold text-sm text-sandalwood block">{service.title}</span>
                                  <p className="text-xs text-sandalwood/65 leading-relaxed">{service.description}</p>
                                </div>
                                <div className="text-right shrink-0">
                                  <span className="font-serif font-bold text-sm text-maroon block">${service.price}</span>
                                  <span className="text-[10px] font-sans text-sandalwood/50">{service.duration}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-warm-ivory border-t border-sandalwood/5 flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setActivePractitionerProfile(null)}
                          className="px-5 py-2.5 border border-sandalwood/20 hover:bg-sandalwood/5 text-sandalwood text-xs font-sans font-bold uppercase tracking-wider rounded-xl cursor-pointer transition-colors"
                        >
                          Close Profile
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const guide = activePractitionerProfile;
                            setActivePractitionerProfile(null);
                            onSelectPractitioner(guide);
                          }}
                          className="px-6 py-2.5 bg-maroon hover:bg-sandalwood text-ivory text-xs font-sans font-bold uppercase tracking-wider rounded-xl cursor-pointer transition-colors"
                        >
                          Select Shastri Ji
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

              {/* Modal: Interactive Availability Scheduler */}
              <AnimatePresence>
                {activePractitionerAvailability && (
                  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-ivory border border-sandalwood/10 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl relative text-left"
                    >
                      <div className="bg-maroon p-5 text-ivory flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-gold" />
                          <h3 className="font-serif font-bold text-lg">Check Availability</h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setActivePractitionerAvailability(null);
                            setBookingConfirmedStatus(false);
                          }}
                          className="text-ivory/80 hover:text-ivory bg-white/10 hover:bg-white/20 p-1 rounded-full cursor-pointer transition-colors text-sm font-bold"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="p-6 space-y-6">
                        {bookingConfirmedStatus ? (
                          /* SECURED STATE */
                          <div className="py-4 text-center space-y-4">
                            <div className="w-12 h-12 bg-teal/10 border border-teal/20 text-teal rounded-full flex items-center justify-center mx-auto">
                              <Check className="w-6 h-6" />
                            </div>
                            <div className="space-y-1.5">
                              <h4 className="font-serif font-bold text-lg text-sandalwood">Temporary Slot Secured!</h4>
                              <p className="text-xs text-sandalwood/75 leading-relaxed max-w-sm mx-auto">
                                We have reserved the <strong>{selectedBookingTime}</strong> slot on <strong>{selectedBookingDate}</strong> for you. To complete your booking, continue the onboarding flow and select Shastri Ji.
                              </p>
                            </div>
                            <div className="p-3 bg-teal/5 border border-teal/10 rounded-xl text-left text-[11px] text-teal leading-relaxed">
                              💡 <strong>Refundable Reservation Hold:</strong> No payment is taken right now. Your hold will be locked for the next 20 minutes while you complete this form.
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const guide = activePractitionerAvailability;
                                setActivePractitionerAvailability(null);
                                setBookingConfirmedStatus(false);
                                onSelectPractitioner(guide);
                              }}
                              className="w-full py-3 bg-teal hover:bg-sandalwood text-ivory text-xs font-sans font-bold uppercase tracking-wider rounded-xl cursor-pointer transition-colors shadow-sm text-center font-bold"
                            >
                              Continue with selected guide
                            </button>
                          </div>
                        ) : (
                          /* TIMESLOT SELECTOR */
                          <div className="space-y-5">
                            <div className="space-y-1">
                              <span className="text-[10px] font-sans font-bold text-gold uppercase tracking-wider block">Practitioner</span>
                              <span className="font-serif font-bold text-base text-sandalwood block">{activePractitionerAvailability.name}</span>
                              <p className="text-xs text-sandalwood/65 font-sans leading-normal">
                                Select an available consultation day and hour slot below to lock in a tentative reservation:
                              </p>
                            </div>

                            {/* Days */}
                            <div className="space-y-2">
                              <label className="block text-[10px] font-sans font-bold text-sandalwood/50 uppercase">1. Select Consultation Date</label>
                              <div className="grid grid-cols-3 gap-2">
                                {["Thursday, July 16", "Friday, July 17", "Saturday, July 18"].map((date) => (
                                  <button
                                    key={date}
                                    type="button"
                                    onClick={() => setSelectedBookingDate(date)}
                                    className={`p-2.5 rounded-xl border text-xs font-sans font-semibold text-center cursor-pointer transition-all ${
                                      selectedBookingDate === date
                                        ? "bg-maroon text-ivory border-maroon shadow-sm"
                                        : "bg-warm-ivory text-sandalwood border-sandalwood/10 hover:border-gold/30"
                                    }`}
                                  >
                                    {date.split(", ")[1]}
                                    <span className="block text-[9px] font-bold text-sandalwood/50 group-hover:text-gold pt-0.5">
                                      {date.split(", ")[0]}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Time Slots */}
                            {selectedBookingDate ? (
                              <div className="space-y-2">
                                <label className="block text-[10px] font-sans font-bold text-sandalwood/50 uppercase">2. Select Available Hour Slot</label>
                                <div className="grid grid-cols-2 gap-2">
                                  {getAvailabilityTimeSlots(activePractitionerAvailability.id).map((time) => (
                                    <button
                                      key={time}
                                      type="button"
                                      onClick={() => setSelectedBookingTime(time)}
                                      className={`p-2.5 rounded-xl border text-xs font-sans font-semibold text-center cursor-pointer transition-all ${
                                        selectedBookingTime === time
                                          ? "bg-maroon text-ivory border-maroon shadow-sm"
                                          : "bg-warm-ivory text-sandalwood border-sandalwood/10 hover:border-gold/30"
                                      }`}
                                    >
                                      {time}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div className="p-4 bg-warm-ivory border border-dashed border-sandalwood/10 rounded-xl text-center text-xs text-sandalwood/40 italic">
                                Please select a date to load timeslots...
                              </div>
                            )}

                            {/* Confirm CTA */}
                            {selectedBookingDate && selectedBookingTime && (
                              <div className="pt-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    triggerEvent("availability_checked");
                                    setBookingConfirmedStatus(true);
                                  }}
                                  className="w-full py-3 bg-maroon hover:bg-sandalwood text-ivory text-xs font-sans font-bold uppercase tracking-wider rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-1 shadow-card-default font-bold"
                                >
                                  Secure Tentative Slot: {selectedBookingTime}
                                  <ArrowRight className="w-4 h-4 text-gold" />
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

              {/* Modal: Compare Matches side-by-side */}
              <AnimatePresence>
                {comparing && (
                  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-ivory border border-sandalwood/10 rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl relative text-left"
                    >
                      <div className="bg-maroon p-5 text-ivory flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Scale className="w-5 h-5 text-gold" />
                          <h3 className="font-serif font-bold text-base sm:text-lg">Compare Curated Matches Side-by-Side</h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => setComparing(false)}
                          className="text-ivory/80 hover:text-ivory bg-white/10 hover:bg-white/20 p-1 rounded-full cursor-pointer transition-colors text-sm font-bold"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="p-4 sm:p-6 overflow-x-auto">
                        <table className="w-full text-xs font-sans text-sandalwood border-collapse">
                          <thead>
                            <tr className="border-b border-sandalwood/10 bg-sandalwood/5 text-left uppercase text-[9px] font-bold tracking-wider">
                              <th className="p-3">Attribute</th>
                              {getFilteredPractitioners().map(p => (
                                <th key={p.id} className="p-3 text-center font-serif text-sm text-sandalwood uppercase tracking-normal font-bold">
                                  {p.name.split(" ")[0]} {p.name.split(" ")[1]}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-sandalwood/5">
                            {/* Profile Row */}
                            <tr>
                              <td className="p-3 font-bold bg-warm-ivory/40">Profile</td>
                              {getFilteredPractitioners().map(p => (
                                <td key={p.id} className="p-3 text-center">
                                  <div className="w-12 h-12 rounded-full overflow-hidden mx-auto border border-sandalwood/10 bg-ivory">
                                    <img src={p.photo} alt={p.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                  </div>
                                  <span className="text-[10px] font-bold text-gold block pt-1">{p.tradition}</span>
                                </td>
                              ))}
                            </tr>

                            {/* Experience Row */}
                            <tr>
                              <td className="p-3 font-bold bg-warm-ivory/40">Experience</td>
                              {getFilteredPractitioners().map(p => (
                                <td key={p.id} className="p-3 text-center font-semibold">
                                  {p.experienceYears}+ Years
                                </td>
                              ))}
                            </tr>

                            {/* Languages Spoken Row */}
                            <tr>
                              <td className="p-3 font-bold bg-warm-ivory/40">Languages</td>
                              {getFilteredPractitioners().map(p => (
                                <td key={p.id} className="p-3 text-center text-teal font-medium">
                                  {p.languages?.join(", ")}
                                </td>
                              ))}
                            </tr>

                            {/* Price Range Row */}
                            <tr>
                              <td className="p-3 font-bold bg-warm-ivory/40">Price Range</td>
                              {getFilteredPractitioners().map(p => {
                                const prices = p.services.map(s => s.price);
                                return (
                                  <td key={p.id} className="p-3 text-center font-bold text-maroon text-xs sm:text-sm">
                                    ${Math.min(...prices)} - ${Math.max(...prices)}
                                  </td>
                                );
                              })}
                            </tr>

                            {/* Consultation Formats Row */}
                            <tr>
                              <td className="p-3 font-bold bg-warm-ivory/40">Consultation Format</td>
                              {getFilteredPractitioners().map(p => (
                                <td key={p.id} className="p-3 text-center font-medium">
                                  {p.location?.split(" (")[0]}
                                </td>
                              ))}
                            </tr>

                            {/* Primary Specializations Row */}
                            <tr>
                              <td className="p-3 font-bold bg-warm-ivory/40">Primary Focus</td>
                              {getFilteredPractitioners().map(p => (
                                <td key={p.id} className="p-3 text-center text-[10px] sm:text-[11px] leading-relaxed">
                                  {p.specializations.slice(0, 3).join(", ")}
                                </td>
                              ))}
                            </tr>

                            {/* Earliest Availability Row */}
                            <tr>
                              <td className="p-3 font-bold bg-warm-ivory/40">Earliest Slot</td>
                              {getFilteredPractitioners().map(p => (
                                <td key={p.id} className="p-3 text-center font-semibold text-teal">
                                  {getEarliestAvailabilityDate(p.id)}
                                </td>
                              ))}
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <div className="p-4 bg-warm-ivory border-t border-sandalwood/5 flex justify-end">
                        <button
                          type="button"
                          onClick={() => setComparing(false)}
                          className="px-5 py-2.5 bg-sandalwood hover:bg-maroon text-ivory text-xs font-sans font-bold uppercase tracking-wider rounded-xl cursor-pointer transition-colors"
                        >
                          Close Comparison Table
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Restart flow / direct browse block */}
            <div className="text-center pt-6 border-t border-sandalwood/10 flex flex-col sm:flex-row gap-3 justify-center items-center">
              <button
                type="button"
                onClick={() => setStep("concern")}
                className="w-full sm:w-auto px-5 py-2.5 border border-sandalwood/20 hover:bg-sandalwood/5 text-sandalwood/80 font-sans text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer transition-colors"
              >
                Recalculate birth chart
              </button>
              
              <button
                type="button"
                onClick={onSkipToDirectory}
                className="w-full sm:w-auto px-5 py-2.5 text-maroon hover:text-sandalwood font-sans text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer transition-colors"
              >
                Or browse all platform listings
              </button>
            </div>

            {/* DEVELOPER ANALYTICS CONSOLE (HUD) */}
            {/* Satisfies: "After implementation, show where these events are triggered." */}
            <div className="border border-maroon/15 rounded-2xl overflow-hidden bg-maroon/5 text-left shadow-sm">
              <button
                type="button"
                onClick={() => setShowAnalyticsConsole(!showAnalyticsConsole)}
                className="w-full px-4 py-3 bg-maroon/10 flex items-center justify-between hover:bg-maroon/15 transition-all text-xs font-sans font-bold uppercase tracking-wider text-maroon focus:outline-none"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-gold animate-spin" style={{ animationDuration: "6s" }} />
                  <span>SETU Developer HUD: Triggered Events Console</span>
                  <span className="text-[10px] bg-maroon/15 text-maroon font-black px-2 py-0.5 rounded-full lowercase">
                    {triggeredEvents.length} tracked
                  </span>
                </div>
                <span className="text-sm">{showAnalyticsConsole ? "Hide Log" : "Show Log"}</span>
              </button>
              
              <AnimatePresence>
                {showAnalyticsConsole && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-maroon/10 p-4 font-mono text-[11px] text-sandalwood/85 space-y-3 bg-ivory/40"
                  >
                    <div className="flex justify-between items-center text-[10px] uppercase font-sans font-bold text-sandalwood/50">
                      <span>Event Logged via Instrument</span>
                      <span>Execution Status</span>
                    </div>

                    {triggeredEvents.length === 0 ? (
                      <p className="text-sandalwood/40 italic py-2 text-center">No events captured in this session yet. Interact with the form above to fire logs.</p>
                    ) : (
                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {triggeredEvents.map((evt, idx) => (
                          <div key={idx} className="p-2 bg-warm-ivory border border-sandalwood/10 rounded flex items-center justify-between gap-2 animate-fadeIn">
                            <div className="flex items-center gap-2">
                              <span className="text-gold font-bold">●</span>
                              <span className="text-maroon font-bold">{evt.name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sandalwood/50">
                              <span>triggered at {evt.timestamp}</span>
                              <span className="text-[9px] bg-teal/10 text-teal font-sans font-bold uppercase px-1.5 py-0.5 rounded border border-teal/20">
                                Simulated OK
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="text-[10px] font-sans text-sandalwood/60 leading-normal border-t border-maroon/5 pt-2.5">
                      💡 <strong>QA Instrumentation Blueprint:</strong> Each event maps to production analytics tags for conversion funnel, drop-off analysis, and feature usage audits.
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
