// src/types.ts

export type PackageKey = 'kids' | 'teen' | 'adult' | 'baby' | 'gender' | 'eighteen' | 'slavlja';

export interface ExtraServices {
  tables: number;
  waiterHours: number;
  ledKg: number;
  photographer: boolean;
  decoration: boolean;
  catering: boolean;
  makeup: boolean;
  dj: boolean;
}

export interface Reservation {
  id?: number; // Supabase vraća broj (bigint). Opciono je jer ga nemamo pre čuvanja.
  package_type: PackageKey | string; // Dozvoljavamo string zbog baze, ali preferiramo PackageKey
  space: 'open' | 'closed';
  guest_count: number;
  date: string;
  time_slot: string;
  extras: ExtraServices; // Supabase ovo automatski mapira iz JSONB
  total_price: number;
  deposit_paid: boolean;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  notes?: string;
  status: 'confirmed' | 'pending' | 'cancelled' | string; // Dozvoljavamo string zbog baze
  created_at?: string; // Opciono, baza generiše
}

export interface Comment {
  id?: number; // Supabase vraća broj
  author: string;
  text: string;
  rating: number;
  date: string;
  created_at?: string;
}

// Ovo ostaje isto jer se koristi samo za frontend logiku
export interface PackageConfig {
  name: string;
  emoji: string;
  duration: string;
  inclusions: string;
  slots: string[];
  maxGuests: { open: number; closed: number };
  minChildren?: number;
  minAdults?: number;
  calcPrice: (...args: any[]) => number;
}
