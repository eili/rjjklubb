export type PageTab = 
  | 'hjem'
  | 'tradisjon'
  | 'soke-yamaue'
  | 'treningstider'
  | 'sommerleir'
  | 'vipps'
  | 'dojo-kart'
  | 'instruktorer'
  | 'kontakt';

export interface Instructor {
  id: string;
  name: string;
  title: string;
  rank: string; // f.eks. "10. Dan Hanshi", "5. Dan Renshi", "3. Dan Sensei"
  experienceYears: number;
  role: string; // f.eks. "Hovedinstruktør", "Barneansvarlig", "Gjestelærer"
  bio: string;
  image: string;
  isGuestInstructor?: boolean;
  location?: string;
  specialties: string[];
  philosophy?: string;
  certifications?: string[];
  email?: string;
  phone?: string;
}

export interface TrainingClass {
  id: string;
  day: 'Mandag' | 'Tirsdag' | 'Onsdag' | 'Torsdag' | 'Fredag' | 'Lørdag' | 'Søndag';
  time: string;
  name: string;
  targetGroup: 'Barn & Ungdom (8-13 år)' | 'Voksne Nybegynnere' | 'Voksne Viderekomne' | 'Sortbelter & Instruktører' | 'Åpen Matte / Egentrening';
  instructor: string;
  room: string;
  description: string;
  maxSpots?: number;
}

export interface CampScheduleItem {
  day: string;
  time: string;
  title: string;
  instructor: string;
  description: string;
}

export interface CampPhoto {
  id: string;
  url: string;
  title: string;
  caption: string;
  year: number;
  category: 'trening' | 'gradering' | 'sosialt' | 'soke';
}

export interface SummerCampInfo {
  year: number;
  theme: string;
  dates: string;
  location: string;
  city: string;
  status: 'Åpen for påmelding' | 'Få plasser igjen' | 'Fulltegnet';
  description: string;
  specialGuest: string;
  specialGuestRole: string;
  prices: {
    fullCampAdult: number;
    fullCampYouth: number;
    singleDayAdult: number;
    dinnerParty: number;
  };
  accommodationInfo: string;
  schedule: CampScheduleItem[];
  includedItems: string[];
  gallery: CampPhoto[];
}

export interface VippsProduct {
  id: string;
  title: string;
  category: 'kontingent' | 'leir' | 'utstyr' | 'annet';
  amount: number;
  description: string;
  popular?: boolean;
}

export interface ClubConfig {
  clubName: string;
  styleName: string;
  sokeName: string;
  sokeCity: string;
  vippsNumber: string;
  contactPerson: {
    name: string;
    role: string;
    email: string;
    phone: string;
  };
  dojoAddress: {
    street: string;
    postalCode: string;
    city: string;
    directions: string;
    transitInfo: string;
    parkingInfo: string;
  };
}

export interface AdminMFAConfig {
  isEnabled: boolean;
  password: string;
  totpSecret: string;
  backupCodes: string[];
  adminEmail: string;
  configuredAt?: string;
}

export interface SiteContent {
  hero: {
    title: string;
    subtitle: string;
    description: string;
    bgImage: string;
    kittelCardImage: string;
    kittelQuote: string;
  };
  aboutJuJitsu: {
    title: string;
    subtitle: string;
    intro: string;
    historyTitle: string;
    historyText: string;
    image: string;
    philosophyQuote: string;
  };
  sokeYamaue: {
    title: string;
    subtitle: string;
    intro: string;
    bioText1: string;
    bioText2: string;
    image: string;
    quote: string;
  };
}

export interface MediaItem {
  id: string;
  url: string;
  title: string;
  category: 'forside' | 'instruktor' | 'sommerleir' | 'dojo' | 'tradisjon' | 'annet';
  source: 'upload' | 'unsplash' | 'preset';
  addedAt?: string;
  photographer?: string;
  description?: string;
}

export interface Member {
  id: string;
  name: string;
  birthDate: string; // f.eks. "14.08.2001" eller "2001-08-14"
  phone: string;     // f.eks. "920 14 550"
  email: string;     // f.eks. "utover@eksempel.no"
  rank: string;      // f.eks. "Hvitt belte", "Gult 5. kyu", "Oransje 4. kyu", "1. Dan"
  semester: string;  // f.eks. "Høst 2026", "Vår 2027"
  hasPaidFee: boolean; // Huke av for betalt medlemsavgift
  paidDate?: string;
  notes?: string;
  status: 'aktiv' | 'inaktiv' | 'pause';
  createdAt: string;
  updatedAt?: string;
}


