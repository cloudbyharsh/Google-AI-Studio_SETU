import { Practitioner } from "./types";

export const PRACTITIONERS: Practitioner[] = [
  {
    id: "rajesh-shastri",
    name: "Pandit Rajesh Shastri",
    devanagariName: "पं. राजेश शास्त्री",
    title: "Pandit",
    photo: "https://images.unsplash.com/photo-1607990283143-e81e7a2c93ab?auto=format&fit=crop&w=300&h=300&q=80",
    tradition: "North Indian Vedic Tradition",
    bio: "Pandit Rajesh Shastri is a third-generation Vedic priest and ritual scholar. Born and trained in Varanasi, he has been conducting major family and community ceremonies across North America for the past 18 years. He is widely respected for his meticulous pronunciation of Sanskrit mantras and his ability to explain the spiritual meaning of each ritual in clear Hindi and English.",
    experienceYears: 18,
    specializations: ["Griha Pravesh (House Warming)", "Satyanarayan Puja", "Navagraha Shanti", "Vastu Shastra"],
    languages: ["Hindi", "English", "Sanskrit"],
    location: "Toronto (GTA) & Southern Ontario (In-Person or Online)",
    lastVerifiedDate: "June 15, 2026",
    verificationReasons: [
      "Identity and academic background verified: Varanasi Sanskrit Vishwavidyalaya graduate (Acharya in Yajurveda).",
      "Lineage and training checked: 18+ years of independent priesthood experience verified via temple and community references.",
      "Vetted communication skills: Personally interviewed by SETU Founders for impeccable Sanskrit pronunciation and bilingual English/Hindi explanation skills.",
      "Code of conduct signed: Committed to SETU's flat-rate pricing, absolute transparency, and non-intrusive rituals."
    ],
    founderNote: "I personally attended Rajesh Shastri ji's Griha Pravesh ceremony in Oakville. His warmth, professionalism, and structured explanations of every phase of the ritual immediately put the young homeowners and their extended family at complete ease. Truly a gold standard for our community.",
    services: [
      {
        id: "griha-pravesh",
        name: "Griha Pravesh Puja (House Warming Ceremony)",
        devanagariName: "गृहप्रवेश पूजा",
        price: 351,
        duration: "3.5 Hours",
        category: "Puja",
        categoryEmoji: "🪔",
        description: "A traditional home-sanctification ceremony performed before moving into a new residence. Includes Vastu Puja (to harmonize directions), Navagraha Homa (to align cosmic influences), and threshold blessings to invite prosperity and peace into your new home.",
        whatsIncluded: [
          "Ganesh Puja and Gauri Pooja for removing initial obstacles",
          "Vastu Purusha Aradhana & Havan (sacred fire purification)",
          "Navagraha Shanti Homa to balance planetary energy",
          "Dwar Puja (threshold worship) & traditional milk-boiling ritual guidance",
          "Detailed, print-ready checklist of puja samagree (materials) provided 1 week in advance"
        ],
        preparation: [
          "1 liter of fresh unpasteurized milk (for the boiling ceremony)",
          "Fresh mango leaves or betel leaves for threshold decoration",
          "5 different types of fresh seasonal fruits",
          "A small copper or brass Kalash (pot)",
          "2 whole coconuts with husk"
        ]
      },
      {
        id: "satyanarayan-puja",
        name: "Satyanarayan Puja & Katha",
        devanagariName: "सत्यनारायण पूजा व कथा",
        price: 201,
        duration: "2 Hours",
        category: "Puja",
        categoryEmoji: "🪔",
        description: "A highly accessible Thanksgiving ritual dedicated to Lord Vishnu, promoting overall family harmony, mental peace, and success. Excellent for major milestones, monthly gatherings, or expressing deep gratitude.",
        whatsIncluded: [
          "Ganapati Puja & Kalash Sthapana (setting up the sacred altar)",
          "Recitation of the 5 traditional chapters of Satyanarayan Katha (stories of truth)",
          "Maha Aarti, Prasad sanctification, and ancestral blessings",
          "Prasad preparation guide and recipe suggestions"
        ],
        preparation: [
          "Sooji (semolina), ghee, and sugar for the Maha-Prasad (sheera)",
          "Altar setup area (chowki/low table with a clean yellow cloth)",
          "Fresh Tulsi leaves (crucial for Vishnu worship)",
          "4 whole banana leaves or stems for altar corners"
        ]
      }
    ]
  },
  {
    id: "venkatesh-raghavan",
    name: "Acharya Venkatesh Raghavan",
    devanagariName: "आचार्य वेंकटेश राघवन्",
    title: "Acharya",
    photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&h=300&q=80",
    tradition: "South Indian Smartha/Iyer Tradition",
    bio: "Acharya Venkatesh Raghavan is an ordained priest and Vedic teacher who has spent over 22 years administering South Indian Smartha, Iyer, and Iyengar rituals. Formerly serving as a head priest in a major temple in Tamil Nadu before relocating to Canada, Acharya Venkatesh is highly sought after for weddings and sacred thread ceremonies. He is fluent in Tamil, Telugu, Sanskrit, and English.",
    experienceYears: 22,
    specializations: ["Vedic Vivaha (Weddings)", "Upanayanam", "Seemantham", "Ayushya Homam"],
    languages: ["Tamil", "Telugu", "Sanskrit", "English"],
    location: "Greater Toronto Area (In-Person) & Nationwide (Travel possible on request)",
    lastVerifiedDate: "May 20, 2026",
    verificationReasons: [
      "Identity and academic background verified: Awarded Sanskrit Shiromani from Madras Sanskrit College, specializing in Mimamsa and Agama Shastra.",
      "Lineage and training checked: Former Head Priest at Vadapalani Murugan Temple with pristine credentials and impeccable lineage references.",
      "Vetted communication skills: Fluent in English, Tamil, Telugu, and Sanskrit; masterfully translates ritual philosophy for second-generation guests.",
      "Code of conduct signed: Committed to SETU's code of ethical practice, including on-time arrival and transparent preparation expectations."
    ],
    founderNote: "Acharya Raghavan's weddings are legendary in the GTA. He brings an immense sense of dignity, joy, and deep theological grounding to the wedding stage. Most importantly, he explains each vow in fluent English so second-generation couples feel fully connected to their ancestry.",
    services: [
      {
        id: "vedic-vivaha",
        name: "Vedic Vivaha (South Indian Wedding Ceremony)",
        devanagariName: "वैदिक विवाह संस्कार",
        price: 1008,
        duration: "4.5 Hours",
        category: "Puja",
        categoryEmoji: "🪔",
        description: "Comprehensive traditional South Indian wedding rituals conducted in strict accordance with the Grihya Sutras. Fully translated and explained in clear English for the couple, family, and guests.",
        whatsIncluded: [
          "Kanyadaanam (giving away the bride), Panigrahanam (holding hands), Saptapadi (seven steps), and Mangalyadharanam (tying the sacred thread)",
          "Two virtual pre-wedding planning consultations to customize specific sub-rituals",
          "Printed custom Sanskrit-English ritual guides for wedding guests to follow along",
          "Full bilingual coordination with stage organizers and event timeline managers"
        ],
        preparation: [
          "Mangalsutra or Thali (sacred thread/gold pendant)",
          "Beautifully woven flower garlands for bride and groom exchanges",
          "2 kg raw rice mixed with organic turmeric powder (Akshata)",
          "Pure cow ghee (1 liter) and traditional dry wood blocks for the Vivaha Homa fire"
        ]
      },
      {
        id: "upanayanam",
        name: "Upanayanam (Sacred Thread Rite of Passage)",
        devanagariName: "उपनयन संस्कार",
        price: 501,
        duration: "3 Hours",
        category: "Puja",
        categoryEmoji: "🪔",
        description: "The traditional Vedic rite of passage initiating a young student into the study of sacred scriptures. Includes Kumara Bhojanam, thread investiture, and sacred Gayatri Mantra instruction.",
        whatsIncluded: [
          "Kumara Bhojanam ritual coordination and dietary instruction",
          "Yagnopavitha Dharanam (investiture of the sacred thread) & Brahmopadesham (Gayatri Mantra Upadesha)",
          "Agni Karya Homa and first ceremonial alms-seeking (Bhiksha)",
          "Pre-ceremony counseling and virtual walkthrough for parents and child"
        ],
        preparation: [
          "Pristine, unworn sacred thread (Yagnopavitha) - 3 sets",
          "A small piece of deerskin (or traditional substitute as advised)",
          "Raw rice, fruits, and simple gold/silver coin for the first Bhiksha",
          "Traditional double-layered cotton Veshti (dhoti) and Angavastram for the initiate"
        ]
      }
    ]
  },
  {
    id: "meenakshi-iyer",
    name: "Smt. Meenakshi Iyer",
    devanagariName: "श्रीमती मीनाक्षी अय्यर",
    title: "Smt.",
    photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&h=300&q=80",
    tradition: "Vedic Astrology (Jyotish)",
    bio: "Smt. Meenakshi Iyer is a senior Jyotish consultant with over 15 years of experience. Armed with deep training in Parashari and Jaimini systems, she specializes in career transitions, family alignment, and matchmaking compatibility. She takes a highly practical, non-alarmist approach, focusing on actionable remedies rather than fear-inducing predictions.",
    experienceYears: 15,
    specializations: ["Birth Chart (Kundli) Analysis", "Matchmaking Compatibility", "Career & Wealth Guidance"],
    languages: ["English", "Tamil", "Hindi"],
    location: "Global (100% Online via Secure Zoom Meeting)",
    lastVerifiedDate: "July 02, 2026",
    verificationReasons: [
      "Credentials verified: Awarded Jyotish Visharad degree from the prestigious Indian Council of Astrological Sciences (ICAS).",
      "Ethical record verified: Spotless ethical compliance checked. Strictly zero fear-mongering, zero pushy cross-selling of overpriced gemstones, and no pressure to purchase secondary services.",
      "Experience check: 15+ years of independent astrological counseling with a highly reference-vetted global clientele.",
      "Strict confidentiality protocol: Signed SETU's absolute privacy charter. No birth details or consultation logs are ever stored or shared."
    ],
    founderNote: "What we absolutely love about Smt. Meenakshi is her modern, practical, and empathetic approach. She treats astrology as a celestial weather forecast to guide you through tough decisions, never as an unchangeable doom. Her clients leave sessions feeling deeply empowered, never anxious.",
    services: [
      {
        id: "kundli-consultation",
        name: "Comprehensive Birth Chart (Kundli) Consultation",
        devanagariName: "कुण्डली परामर्श",
        price: 108,
        duration: "60 Minutes",
        category: "Astrology",
        categoryEmoji: "🌙",
        description: "An intensive online reading of your birth chart. Covers current life stages, planetary transitions (Dashas), career pathways, family health, and custom, practical remedies.",
        whatsIncluded: [
          "Precise birth chart rectification and multi-system calculation",
          "Detailed, month-by-month analysis of the next 3 years of planetary transits",
          "Practical lifestyle, mantra, and charity-based remedies (no expensive gems required)",
          "High-quality audio recording and digital PDF of your full chart sent post-session"
        ],
        preparation: [
          "Extremely accurate birth date, exact birth time, and birth city (refer to birth certificate if possible)",
          "List of top 3 career, family, or personal questions you'd like targeted",
          "A quiet, distraction-free room with high-speed internet for the video call"
        ]
      },
      {
        id: "matchmaking-compatibility",
        name: "Kundli Matching & Relationship Alignment",
        devanagariName: "वर-वधू मेलापक",
        price: 125,
        duration: "45 Minutes",
        category: "Astrology",
        categoryEmoji: "🌙",
        description: "Astrological compatibility reading for prospective couples. Analyzes Guna Milap, Mangal Dosha, planetary alignments for temperamental match, and long-term marital bliss.",
        whatsIncluded: [
          "Full 36-Guna analysis and clear psychological explanation of each dimension",
          "Deep assessment of Mangal Dosha and planetary harmony of both charts",
          "Mutually auspicious wedding date ranges (Muhurthams) suggested based on alignment",
          "Empathy-based relationship alignment advice from an astrological perspective"
        ],
        preparation: [
          "Birth date, exact birth time, and birth place for BOTH prospective partners",
          "How long you have known each other and any specific compatibility questions",
          "Pen and paper to take notes of specific remedies and auspicious dates"
        ]
      }
    ]
  },
  {
    id: "anand-pathak",
    name: "Pandit Anand Pathak",
    devanagariName: "पं. आनंद पाठक",
    title: "Pandit",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&h=300&q=80",
    tradition: "Shaivite Ritual Tradition",
    bio: "Pandit Anand Pathak is an accomplished ritual priest specializing in Shaivite Pujas and planetary homas. Having trained under legendary masters at the Kashi Vishwanath Temple, he brings an intense, focused spiritual energy to his mantras. Over the past 12 years, he has built a reputation for helping families through difficult health and financial crises using traditional healing rituals.",
    experienceYears: 12,
    specializations: ["Maha Mrityunjaya Homa", "Rudrabhishek", "Navagraha Shanti", "Pitru Karma"],
    languages: ["Hindi", "Sanskrit", "Maithili"],
    location: "Toronto (GTA) & Surrounding Regions (In-Person or Online)",
    lastVerifiedDate: "April 10, 2026",
    verificationReasons: [
      "Identity and academic background verified: Achieved Master of Sanskrit Liturgy (Veda Acharya) from Sampurnanand Sanskrit University in Varanasi.",
      "Lineage and training checked: 12+ years of verified independent experience performing complex Homas and fire purification rituals.",
      "Community vetted: High-ranking references verified by leading Toronto temples and community trusts.",
      "Code of conduct signed: Meticulous commitment to traditional rules, zero upselling, and pristine cleanliness standards."
    ],
    founderNote: "Pandit Anand Pathak brings a meditative, deeply authentic presence to every Rudrabhishek. The clarity with which he recites the Sri Rudram leaves everyone present with a visible sense of peace. He is incredibly respectful of elderly family members and explains the Sanskrit chants clearly.",
    services: [
      {
        id: "rudrabhishek-homa",
        name: "Rudrabhishek & Shiva Homa (Purification Fire Ritual)",
        devanagariName: "रुद्राभिषेक व शिव होम",
        price: 301,
        duration: "2.5 Hours",
        category: "Havan",
        categoryEmoji: "🔥",
        description: "A powerful offering to Lord Shiva invoking peace, purification, and removal of obstacles. Involves bathing the Shiva Lingam with 11 sacred substances accompanied by Sri Rudram recitations.",
        whatsIncluded: [
          "Rudrabhishek Puja with 11 traditional offerings (milk, honey, curd, etc.)",
          "Sri Rudram and Chamakam recitation",
          "Shiva Homa (fire ritual) for ancestral and personal purification",
          "Special blessings for family health and mental peace"
        ],
        preparation: [
          "Fresh unpasteurized milk (2 liters)",
          "Honey, curd, sugar, ghee, sugarcane juice",
          "Pancha-patra and spoon",
          "Shiva Lingam or representation"
        ]
      },
      {
        id: "maha-mrityunjaya",
        name: "Maha Mrityunjaya Homa (Healing & Protection Fire Ritual)",
        devanagariName: "महामृत्युञ्जय पूजा",
        price: 251,
        duration: "2 Hours",
        category: "Havan",
        categoryEmoji: "🔥",
        description: "A specialized prayer dedicated to Lord Shiva for healing, long life, overcoming serious health issues, and emotional resilience during difficult times.",
        whatsIncluded: [
          "Maha Mrityunjaya Sankalpa (dedication for the family member)",
          "1008 chanting of the Maha Mrityunjaya Mantra",
          "Special health-focused Havan/Aradhana",
          "Prasad blessing and custom protective mantra instruction"
        ],
        preparation: [
          "Durva grass and Bel leaves",
          "Incense sticks, clay lamps with sesame oil",
          "Dry fruits for prasad",
          "Red cloth for puja altar"
        ]
      }
    ]
  }
];
