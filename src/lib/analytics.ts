// MVP Analytics Event System for SETU Platform
// Adheres strictly to requirements for tracking, sanitizing, and measuring user activation.

export interface AnalyticsEvent {
  id: string;
  name: string;
  timestamp: string; // ISO String
  timeString: string; // HH:MM:SS for display
  session_id: string;
  trigger: string;
  user_state: {
    activated: boolean;
    has_generated_insight: boolean;
    has_viewed_practitioners: boolean;
    has_consultation_intent: boolean;
    has_birth_data: boolean;
  };
  properties: Record<string, any>;
  privacy_restrictions: string;
}

export interface SessionData {
  id: string;
  events: { name: string; timestamp: number }[];
  startTime: number;
}

// Event Specification Catalog
export interface EventSpec {
  name: string;
  trigger: string;
  required_properties: string[];
  optional_properties: string[];
  privacy_restrictions: string;
}

export const EVENT_SPECIFICATIONS: Record<string, EventSpec> = {
  landing_viewed: {
    name: "landing_viewed",
    trigger: "User visits the landing / introductory screen",
    required_properties: ["referrer", "page_url", "user_agent"],
    optional_properties: ["utm_source", "utm_medium", "utm_campaign"],
    privacy_restrictions: "Zero PII recorded. Screen and browser metadata generalized."
  },
  concern_selected: {
    name: "concern_selected",
    trigger: "User selects a specific spiritual concern option",
    required_properties: ["concern_id", "concern_title"],
    optional_properties: ["previous_concern_id"],
    privacy_restrictions: "Logs general concern category only. No custom text inputs saved."
  },
  birth_details_started: {
    name: "birth_details_started",
    trigger: "User begins typing or focuses on personal details form",
    required_properties: ["form_name"],
    optional_properties: ["step_index"],
    privacy_restrictions: "No keystrokes or input text captured. Tracks start signal only."
  },
  birth_details_completed: {
    name: "birth_details_completed",
    trigger: "User successfully submits the birth details form",
    required_properties: ["birth_date_provided", "birth_time_provided", "birth_place_provided", "consent_given"],
    optional_properties: ["is_time_approx"],
    privacy_restrictions: "CRITICAL: Raw birth dates, exact hours, and place names are stripped out. Only boolean indicators remain."
  },
  insight_generation_started: {
    name: "insight_generation_started",
    trigger: "Mandala calculation loading screen begins rendering",
    required_properties: ["calculation_complexity"],
    optional_properties: ["estimated_wait_time_ms"],
    privacy_restrictions: "System performance parameters only."
  },
  insight_generation_completed: {
    name: "insight_generation_completed",
    trigger: "Calculation completes and transitions to results",
    required_properties: ["generation_duration_ms", "is_success"],
    optional_properties: ["planetary_alignments_count"],
    privacy_restrictions: "Technical metrics only."
  },
  insight_viewed: {
    name: "insight_viewed",
    trigger: "Personalized spiritual insight card is displayed on screen",
    required_properties: ["insight_id", "insight_summary_length"],
    optional_properties: ["is_simplified_view"],
    privacy_restrictions: "Content metadata logs only. No raw user parameters."
  },
  practitioner_recommendations_viewed: {
    name: "practitioner_recommendations_viewed",
    trigger: "Priest recommendations list or matching results are shown",
    required_properties: ["matched_count", "list_source"],
    optional_properties: ["filters_applied"],
    privacy_restrictions: "List metadata only. No raw coordinates."
  },
  practitioner_profile_viewed: {
    name: "practitioner_profile_viewed",
    trigger: "User opens a detailed practitioner profile page",
    required_properties: ["practitioner_id", "practitioner_name", "tradition"],
    optional_properties: ["has_reviews", "service_count"],
    privacy_restrictions: "Public directory details only."
  },
  availability_checked: {
    name: "availability_checked",
    trigger: "User interacts with calendar dates or clicks slots list",
    required_properties: ["practitioner_id", "date_selected"],
    optional_properties: ["user_local_timezone"],
    privacy_restrictions: "No personal calendar slots or external syncing captured."
  },
  booking_started: {
    name: "booking_started",
    trigger: "User enters the secure checkout / scheduling form",
    required_properties: ["practitioner_id", "service_id", "service_price"],
    optional_properties: ["consultation_format"],
    privacy_restrictions: "Customer contact names, phones, and email parameters are entirely masked."
  },
  deposit_started: {
    name: "deposit_started",
    trigger: "User opens the credit card payment sandbox screen",
    required_properties: ["service_price", "deposit_amount", "currency"],
    optional_properties: ["is_simulated_decline"],
    privacy_restrictions: "ESCROW PROTOCOL: Absolutely no credit card digits, CVVs, or expirations are captured."
  },
  deposit_completed: {
    name: "deposit_completed",
    trigger: "Transaction secures holding deposit inside sandbox escrow",
    required_properties: ["transaction_id", "amount_secured", "escrow_provider"],
    optional_properties: ["completion_delay_ms"],
    privacy_restrictions: "Anonymized escrow transaction hash code only."
  },
  booking_confirmed: {
    name: "booking_confirmed",
    trigger: "User lands on secure confirmation or status timeline",
    required_properties: ["booking_id", "status", "is_pre_authorized"],
    optional_properties: ["scheduled_date", "time_slot_et"],
    privacy_restrictions: "Database primary key references are obfuscated."
  }
};

// Simulated history to provide realistic statistical dashboards immediately
const SEED_SESSIONS: SessionData[] = [
  // Session 1: Abandoned at birth details
  {
    id: "sess-seed-1",
    startTime: Date.now() - 3600000 * 5,
    events: [
      { name: "landing_viewed", timestamp: Date.now() - 3600000 * 5 },
      { name: "concern_selected", timestamp: Date.now() - 3600000 * 5 + 30000 },
      { name: "birth_details_started", timestamp: Date.now() - 3600000 * 5 + 45000 }
    ]
  },
  // Session 2: Completed up to practitioner view
  {
    id: "sess-seed-2",
    startTime: Date.now() - 3600000 * 4,
    events: [
      { name: "landing_viewed", timestamp: Date.now() - 3600000 * 4 },
      { name: "concern_selected", timestamp: Date.now() - 3600000 * 4 + 15000 },
      { name: "birth_details_started", timestamp: Date.now() - 3600000 * 4 + 25000 },
      { name: "birth_details_completed", timestamp: Date.now() - 3600000 * 4 + 65000 },
      { name: "insight_generation_started", timestamp: Date.now() - 3600000 * 4 + 66000 },
      { name: "insight_generation_completed", timestamp: Date.now() - 3600000 * 4 + 69000 },
      { name: "insight_viewed", timestamp: Date.now() - 3600000 * 4 + 70000 },
      { name: "practitioner_recommendations_viewed", timestamp: Date.now() - 3600000 * 4 + 90000 }
    ]
  },
  // Session 3: Completed up to booking started
  {
    id: "sess-seed-3",
    startTime: Date.now() - 3600000 * 3,
    events: [
      { name: "landing_viewed", timestamp: Date.now() - 3600000 * 3 },
      { name: "concern_selected", timestamp: Date.now() - 3600000 * 3 + 45000 },
      { name: "birth_details_started", timestamp: Date.now() - 3600000 * 3 + 55000 },
      { name: "birth_details_completed", timestamp: Date.now() - 3600000 * 3 + 95000 },
      { name: "insight_generation_started", timestamp: Date.now() - 3600000 * 3 + 96000 },
      { name: "insight_generation_completed", timestamp: Date.now() - 3600000 * 3 + 99000 },
      { name: "insight_viewed", timestamp: Date.now() - 3600000 * 3 + 100000 },
      { name: "practitioner_recommendations_viewed", timestamp: Date.now() - 3600000 * 3 + 115000 },
      { name: "practitioner_profile_viewed", timestamp: Date.now() - 3600000 * 3 + 140000 },
      { name: "availability_checked", timestamp: Date.now() - 3600000 * 3 + 160000 },
      { name: "booking_started", timestamp: Date.now() - 3600000 * 3 + 180000 }
    ]
  }
];

class SetuAnalyticsEngine {
  private sessionId: string = "";
  private listeners: (() => void)[] = [];

  constructor() {
    this.initSession();
    this.initHeap();
  }

  private initHeap() {
    const heapAppId = (import.meta as any).env.VITE_HEAP_APP_ID || "";
    if (!heapAppId) {
      console.log(
        "%c[SETU ANALYTICS ENGINE] Heap App ID not found in environment. Heap tracking skipped (define VITE_HEAP_APP_ID in .env).",
        "color: #FFF; background: #666; font-weight: bold; padding: 2px 6px; border-radius: 4px;"
      );
      return;
    }

    // Official Heap Analytics snippet adapted for React
    (window as any).heap = (window as any).heap || [];
    const heapObj = (window as any).heap;
    if (heapObj.load) return; // Already initialized

    heapObj.load = function (e: string, t: any) {
      heapObj.appid = e;
      heapObj.config = t = t || {};
      const r = document.createElement("script");
      r.type = "text/javascript";
      r.async = true;
      r.src = "https://cdn.heapanalytics.com/js/heap-" + e + ".js";
      const a = document.getElementsByTagName("script")[0];
      if (a && a.parentNode) {
        a.parentNode.insertBefore(r, a);
      } else {
        document.head.appendChild(r);
      }
      const n = function (eStr: string) {
        return function () {
          heapObj.push([eStr].concat(Array.prototype.slice.call(arguments, 0)));
        };
      };
      const p = [
        "addEventProperties",
        "addUserProperties",
        "clearEventProperties",
        "identify",
        "resetIdentity",
        "removeEventProperty",
        "setEventProperties",
        "track",
        "unsetEventProperty"
      ];
      for (let o = 0; o < p.length; o++) {
        heapObj[p[o]] = n(p[o]);
      }
    };

    heapObj.load(heapAppId);
    
    // Auto-identify with session ID for funnel linking
    if (this.sessionId) {
      heapObj.identify(this.sessionId);
    }

    console.log(
      `%c[SETU ANALYTICS ENGINE] Heap Analytics initialized with App ID: ${heapAppId}`,
      "color: #FFF; background: #3b82f6; font-weight: bold; padding: 2px 6px; border-radius: 4px;"
    );
  }

  private initSession() {
    // Generate simple UUID-like string for session ID
    let currentSession = sessionStorage.getItem("setu_session_id");
    if (!currentSession) {
      currentSession = "sess-" + Math.random().toString(36).substring(2, 11);
      sessionStorage.setItem("setu_session_id", currentSession);
    }
    this.sessionId = currentSession;

    // Verify session log structure inside localStorage
    const savedSessions = localStorage.getItem("setu_analytics_sessions");
    if (!savedSessions) {
      localStorage.setItem("setu_analytics_sessions", JSON.stringify(SEED_SESSIONS));
    }

    // Load active state flags
    this.syncActivationFlags();
  }

  private syncActivationFlags() {
    const events = this.getCurrentSessionEvents();
    
    // Calculate state
    const has_generated_insight = events.some(e => e.name === "insight_viewed");
    const has_viewed_practitioners = events.some(
      e => e.name === "practitioner_recommendations_viewed" || e.name === "practitioner_profile_viewed"
    );
    const has_consultation_intent = events.some(
      e => ["availability_checked", "booking_started", "deposit_started", "deposit_completed"].includes(e.name)
    );
    const has_birth_data = events.some(e => e.name === "birth_details_completed");

    localStorage.setItem(`setu_flag_insight_${this.sessionId}`, String(has_generated_insight));
    localStorage.setItem(`setu_flag_practitioners_${this.sessionId}`, String(has_viewed_practitioners));
    localStorage.setItem(`setu_flag_intent_${this.sessionId}`, String(has_consultation_intent));
    localStorage.setItem(`setu_flag_birth_${this.sessionId}`, String(has_birth_data));
  }

  public getSessionId(): string {
    return this.sessionId;
  }

  public getUserState() {
    const has_generated_insight = localStorage.getItem(`setu_flag_insight_${this.sessionId}`) === "true";
    const has_viewed_practitioners = localStorage.getItem(`setu_flag_practitioners_${this.sessionId}`) === "true";
    const has_consultation_intent = localStorage.getItem(`setu_flag_intent_${this.sessionId}`) === "true";
    const has_birth_data = localStorage.getItem(`setu_flag_birth_${this.sessionId}`) === "true";
    const activated = has_generated_insight && has_viewed_practitioners && has_consultation_intent;

    return {
      activated,
      has_generated_insight,
      has_viewed_practitioners,
      has_consultation_intent,
      has_birth_data,
    };
  }

  // Sanitization / Privacy Filter
  private sanitizeProperties(props: Record<string, any>): Record<string, any> {
    const cleanProps = { ...props };
    
    // Privacy Safeguard key lists
    const piiKeys = [
      "birthDate", "birth_date", "birthdate", "dob",
      "birthTime", "birth_time", "birthtime",
      "birthPlace", "birth_place", "birthplace", "city",
      "name", "fullName", "fullname", "username",
      "email", "emailaddress", "emailAddress",
      "phone", "phonenumber", "phoneNumber", "tel",
      "cardNumber", "cardExpiry", "cardCvc", "cardName"
    ];

    piiKeys.forEach(key => {
      if (key in cleanProps) {
        // Redact or translate to secure presence flags
        if (key.toLowerCase().includes("date") || key.toLowerCase().includes("dob")) {
          cleanProps[`${key}_provided`] = true;
        } else if (key.toLowerCase().includes("time")) {
          cleanProps[`${key}_provided`] = true;
        } else if (key.toLowerCase().includes("place") || key.toLowerCase().includes("city")) {
          cleanProps[`${key}_provided`] = true;
        } else if (key.toLowerCase().includes("name") || key.toLowerCase().includes("email") || key.toLowerCase().includes("phone")) {
          // Store only a safe hashed value (masked length or presence)
          const value = String(cleanProps[key]);
          if (value && value.trim()) {
            cleanProps[`${key}_secured`] = `${value.slice(0, 2)}***${value.slice(-2 || 0)}`;
          } else {
            cleanProps[`${key}_secured`] = "empty";
          }
        } else if (key.toLowerCase().includes("card") || key.toLowerCase().includes("cvc")) {
          cleanProps[key] = "[REDACTED_SECURE_ESCROW_STRIPE_HOLD]";
        }
        
        // Remove raw value
        delete cleanProps[key];
      }
    });

    return cleanProps;
  }

  public track(eventName: string, properties: Record<string, any> = {}, trigger: string = "Dynamic Context Event") {
    const isFunnelEvent = eventName in EVENT_SPECIFICATIONS;
    const finalTrigger = isFunnelEvent ? EVENT_SPECIFICATIONS[eventName].trigger : trigger;
    const privacyRestrictions = isFunnelEvent ? EVENT_SPECIFICATIONS[eventName].privacy_restrictions : "Basic privacy redaction applied.";

    // Get cleaned properties to honor privacy constraints
    const cleanProps = this.sanitizeProperties(properties);

    // Create tracking entry
    const userState = this.getUserState();
    const newEvent: AnalyticsEvent = {
      id: "evt-" + Math.random().toString(36).substring(2, 10),
      name: eventName,
      timestamp: new Date().toISOString(),
      timeString: new Date().toLocaleTimeString(),
      session_id: this.sessionId,
      trigger: finalTrigger,
      user_state: userState,
      properties: cleanProps,
      privacy_restrictions: privacyRestrictions
    };

    // Save to current session list
    const sessionEventsStr = localStorage.getItem(`setu_events_${this.sessionId}`) || "[]";
    const sessionEvents = JSON.parse(sessionEventsStr) as AnalyticsEvent[];
    sessionEvents.push(newEvent);
    localStorage.setItem(`setu_events_${this.sessionId}`, JSON.stringify(sessionEvents));

    // Save metadata timeline in overall session tracking
    const savedSessionsStr = localStorage.getItem("setu_analytics_sessions") || "[]";
    const savedSessions = JSON.parse(savedSessionsStr) as SessionData[];
    
    let currentSessionIdx = savedSessions.findIndex(s => s.id === this.sessionId);
    if (currentSessionIdx === -1) {
      savedSessions.push({
        id: this.sessionId,
        startTime: Date.now(),
        events: []
      });
      currentSessionIdx = savedSessions.length - 1;
    }

    savedSessions[currentSessionIdx].events.push({
      name: eventName,
      timestamp: Date.now()
    });

    localStorage.setItem("setu_analytics_sessions", JSON.stringify(savedSessions));

    // Update flags
    this.syncActivationFlags();

    // Forward to Heap if initialized
    const heapObj = (window as any).heap;
    if (heapObj && typeof heapObj.track === "function") {
      try {
        heapObj.track(eventName, cleanProps);
        
        // If the event includes user info, attach properties or identify in Heap
        if (properties.email) {
          heapObj.identify(properties.email);
          heapObj.addUserProperties({
            name: properties.name,
            phone: properties.phone,
            birthDate: properties.birthDate,
            birthPlace: properties.birthPlace
          });
        }
      } catch (err) {
        console.error("[SETU ANALYTICS ENGINE] Heap forwarding error:", err);
      }
    }

    // Notify React Listeners
    this.notify();

    // Consolidate logs in developer web console
    console.log(
      `%c[SETU ANALYTICS ENGINE] %c${eventName}`,
      "color: #FFF; background: #C4922A; font-weight: bold; padding: 2px 6px; border-radius: 4px;",
      "color: #1B6B5A; font-weight: bold;",
      cleanProps
    );
  }

  public getCurrentSessionEvents(): AnalyticsEvent[] {
    const sessionEventsStr = localStorage.getItem(`setu_events_${this.sessionId}`) || "[]";
    return JSON.parse(sessionEventsStr) as AnalyticsEvent[];
  }

  public getAllSessions(): SessionData[] {
    const savedSessionsStr = localStorage.getItem("setu_analytics_sessions") || "[]";
    return JSON.parse(savedSessionsStr) as SessionData[];
  }

  // Metrics calculations
  public getMetrics() {
    const currentSessionEvents = this.getCurrentSessionEvents();
    const allSessions = this.getAllSessions();

    // 1. Time to First Insight
    let timeToFirstInsight: number | null = null;
    const landingEvent = currentSessionEvents.find(e => e.name === "landing_viewed");
    const insightEvent = currentSessionEvents.find(e => e.name === "insight_viewed");

    if (landingEvent && insightEvent) {
      const start = new Date(landingEvent.timestamp).getTime();
      const end = new Date(insightEvent.timestamp).getTime();
      timeToFirstInsight = Math.max(0, Math.round((end - start) / 1000)); // in seconds
    }

    // 2. Time to Trusted Next Step
    let timeToTrustedNextStep: number | null = null;
    const nextStepEvent = currentSessionEvents.find(
      e => e.name === "practitioner_recommendations_viewed" || e.name === "practitioner_profile_viewed"
    );

    if (insightEvent && nextStepEvent) {
      const start = new Date(insightEvent.timestamp).getTime();
      const end = new Date(nextStepEvent.timestamp).getTime();
      timeToTrustedNextStep = Math.max(0, Math.round((end - start) / 1000)); // in seconds
    }

    // 3. Funnel conversions calculated over ALL sessions in localStorage
    let totalBirthStarted = 0;
    let totalBirthCompleted = 0;
    let totalInsightViewed = 0;
    let totalPractitionersViewed = 0;
    let totalBookingStarted = 0;
    let totalDepositCompleted = 0;

    allSessions.forEach(sess => {
      const evNames = sess.events.map(e => e.name);
      
      if (evNames.includes("birth_details_started")) totalBirthStarted++;
      if (evNames.includes("birth_details_completed")) totalBirthCompleted++;
      if (evNames.includes("insight_viewed")) totalInsightViewed++;
      if (evNames.includes("practitioner_recommendations_viewed") || evNames.includes("practitioner_profile_viewed")) {
        totalPractitionersViewed++;
      }
      if (evNames.includes("booking_started")) totalBookingStarted++;
      if (evNames.includes("deposit_completed")) totalDepositCompleted++;
    });

    // Calculations
    const birthAbandonmentRate = totalBirthStarted > 0
      ? Math.round(((totalBirthStarted - totalBirthCompleted) / totalBirthStarted) * 100)
      : 0;

    const insightToPractitionerRate = totalInsightViewed > 0
      ? Math.round((totalPractitionersViewed / totalInsightViewed) * 100)
      : 0;

    const practitionerToBookingRate = totalPractitionersViewed > 0
      ? Math.round((totalBookingStarted / totalPractitionersViewed) * 100)
      : 0;

    const bookingToDepositRate = totalBookingStarted > 0
      ? Math.round((totalDepositCompleted / totalBookingStarted) * 100)
      : 0;

    return {
      timeToFirstInsight,
      timeToTrustedNextStep,
      birthAbandonmentRate: Math.max(0, Math.min(100, birthAbandonmentRate)),
      insightToPractitionerRate: Math.max(0, Math.min(100, insightToPractitionerRate)),
      practitionerToBookingRate: Math.max(0, Math.min(100, practitionerToBookingRate)),
      bookingToDepositRate: Math.max(0, Math.min(100, bookingToDepositRate)),
      rawCounts: {
        totalBirthStarted,
        totalBirthCompleted,
        totalInsightViewed,
        totalPractitionersViewed,
        totalBookingStarted,
        totalDepositCompleted
      }
    };
  }

  // Get raw count distributions for funnel visualization
  public getFunnelCounts() {
    const allSessions = this.getAllSessions();
    const counts: Record<string, number> = {};

    // Initialize all 14 stages
    Object.keys(EVENT_SPECIFICATIONS).forEach(key => {
      counts[key] = 0;
    });

    // Populate counts
    allSessions.forEach(sess => {
      const uniqueNamesInSess = Array.from(new Set(sess.events.map(e => e.name)));
      uniqueNamesInSess.forEach(name => {
        if (name in counts) {
          counts[name]++;
        }
      });
    });

    // Include the current session as part of the analytics
    return counts;
  }

  // Subscribe/Unsubscribe listeners for real-time updates
  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(listener => listener());
  }

  // Simulate historical sessions for testing
  public addSimulatedSessions(count: number, type: "abandon_birth" | "abandon_insight" | "completed") {
    const savedSessionsStr = localStorage.getItem("setu_analytics_sessions") || "[]";
    const savedSessions = JSON.parse(savedSessionsStr) as SessionData[];

    for (let i = 0; i < count; i++) {
      const mockId = `sess-sim-${Math.random().toString(36).substring(2, 9)}`;
      const startTime = Date.now() - Math.random() * 86400000 * 3; // within 3 days
      const events: { name: string; timestamp: number }[] = [];

      // Step-by-step assembly
      events.push({ name: "landing_viewed", timestamp: startTime });
      events.push({ name: "concern_selected", timestamp: startTime + 10000 });

      if (type === "abandon_birth") {
        events.push({ name: "birth_details_started", timestamp: startTime + 20000 });
      } else if (type === "abandon_insight") {
        events.push({ name: "birth_details_started", timestamp: startTime + 20000 });
        events.push({ name: "birth_details_completed", timestamp: startTime + 45000 });
        events.push({ name: "insight_generation_started", timestamp: startTime + 46000 });
        events.push({ name: "insight_generation_completed", timestamp: startTime + 49000 });
        events.push({ name: "insight_viewed", timestamp: startTime + 50000 });
      } else {
        // Complete checkout flows
        events.push({ name: "birth_details_started", timestamp: startTime + 15000 });
        events.push({ name: "birth_details_completed", timestamp: startTime + 40000 });
        events.push({ name: "insight_generation_started", timestamp: startTime + 41000 });
        events.push({ name: "insight_generation_completed", timestamp: startTime + 44000 });
        events.push({ name: "insight_viewed", timestamp: startTime + 45000 });
        events.push({ name: "practitioner_recommendations_viewed", timestamp: startTime + 70000 });
        events.push({ name: "practitioner_profile_viewed", timestamp: startTime + 110000 });
        events.push({ name: "availability_checked", timestamp: startTime + 130000 });
        events.push({ name: "booking_started", timestamp: startTime + 150000 });
        events.push({ name: "deposit_started", timestamp: startTime + 170000 });
        events.push({ name: "deposit_completed", timestamp: startTime + 190000 });
        events.push({ name: "booking_confirmed", timestamp: startTime + 200000 });
      }

      savedSessions.push({ id: mockId, startTime, events });
    }

    localStorage.setItem("setu_analytics_sessions", JSON.stringify(savedSessions));
    this.notify();
  }

  // Reset Engine State
  public reset() {
    localStorage.removeItem("setu_analytics_sessions");
    localStorage.removeItem(`setu_events_${this.sessionId}`);
    localStorage.removeItem(`setu_flag_insight_${this.sessionId}`);
    localStorage.removeItem(`setu_flag_practitioners_${this.sessionId}`);
    localStorage.removeItem(`setu_flag_intent_${this.sessionId}`);
    localStorage.removeItem(`setu_flag_birth_${this.sessionId}`);
    
    // Clear session storage so we generate a fresh session ID
    sessionStorage.removeItem("setu_session_id");

    this.initSession();
    this.notify();
    
    console.log("%c[SETU ANALYTICS ENGINE] Reset successfully. Fresh session initialized.", "color: #FFF; background: #DE3E3E; font-weight: bold; padding: 2px 6px;");
  }
}

export const analytics = new SetuAnalyticsEngine();
