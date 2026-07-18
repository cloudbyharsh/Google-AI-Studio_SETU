export interface Service {
  id: string;
  name: string;
  devanagariName?: string;
  price: number;
  duration: string;
  category: "Puja" | "Astrology" | "Vastu" | "Meditation" | "Havan";
  categoryEmoji: string;
  description: string;
  whatsIncluded: string[];
  preparation?: string[]; // Family preparation details
}

export interface Practitioner {
  id: string;
  name: string;
  devanagariName?: string;
  title: string;
  photo: string;
  tradition: string;
  bio: string;
  experienceYears: number;
  specializations: string[];
  verificationReasons: string[];
  services: Service[];
  founderNote: string;
  languages?: string[]; // Languages spoken
  location?: string; // Location / Region
  lastVerifiedDate?: string; // Last verification check date
}

export interface BookingRequest {
  id: string;
  practitionerId: string;
  serviceId: string;
  preferredDate: string;
  alternativeDate?: string; // Alternative date (optional but recommended)
  preferredTime: "morning" | "afternoon" | "evening";
  selectedTimeSlot?: string; // Exact selected hour slot (e.g. "10:00 AM")
  name: string;
  email: string;
  phone?: string; // Contact phone details
  note?: string;
  status:
    | "Available"
    | "Slot temporarily held"
    | "Slot unavailable"
    | "Payment pending"
    | "Payment failed"
    | "Confirmed"
    | "Practitioner confirmation pending"
    | "Practitioner declined"
    | "User cancelled"
    | "Practitioner cancelled"
    | "Refund initiated"
    | "Refund completed"
    | "submitted" // keep for compatibility
    | "secured";  // keep for compatibility
  createdAt: string;
  // Conditional astrology fields
  birthDate?: string;
  birthTime?: string;
  birthPlace?: string;
  gender?: string;
  format?: "online" | "inperson";
  priceAtBooking?: number;
  depositPaid?: number;
  consentGiven?: boolean;
}
