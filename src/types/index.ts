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
