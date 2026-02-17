// src/services/dataService.ts
import { createClient } from '@supabase/supabase-js';
import { Reservation, Comment } from '../types';

// Učitavanje environment varijabli
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Provera da li ključevi postoje (bitno za debagovanje)
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('UPOZORENJE: Supabase ključevi nedostaju! Proveri .env fajl ili GitHub Secrets.');
}

export const supabase = createClient(
  SUPABASE_URL || '', 
  SUPABASE_ANON_KEY || ''
);

export const dataService = {
  // --- REZERVACIJE ---

  getReservations: async (): Promise<Reservation[]> => {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Reservation[] || [];
    } catch (error) {
      console.error('Greška pri učitavanju rezervacija:', error);
      return []; 
    }
  },

  isSlotOccupied: async (date: string, timeSlot: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('id')
        .eq('date', date)
        .eq('time_slot', timeSlot)
        .neq('status', 'cancelled'); // Ignorišemo otkazane ako postoje
      
      if (error) throw error;
      return data && data.length > 0;
    } catch (error) {
      console.error('Greška pri proveri termina:', error);
      return false;
    }
  },

  saveReservation: async (res: Omit<Reservation, 'id' | 'created_at'>) => {
    // Supabase očekuje da extras bude JSON, ali biblioteka to radi automatski
    const { error } = await supabase
      .from('reservations')
      .insert([res]);
    
    if (error) {
      console.error('Greška pri čuvanju rezervacije:', error);
      throw error;
    }
  },

  deleteReservation: async (id: string | number) => {
    const { error } = await supabase
      .from('reservations')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // --- KOMENTARI ---

  getComments: async (): Promise<Comment[]> => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Ako nema komentara u bazi, vraćamo prazan niz (ne lažne podatke)
      return data as Comment[] || [];
    } catch (error) {
      console.error('Greška pri učitavanju komentara:', error);
      return [];
    }
  },

  saveComment: async (comment: Omit<Comment, 'id' | 'created_at' | 'date'>) => {
    const newComment = { 
      ...comment, 
      date: new Date().toISOString() // Dodajemo datum ručno jer ga tvoj UI očekuje
    };
    const { error } = await supabase
      .from('comments')
      .insert([newComment]);
    
    if (error) throw error;
  },

  updateComment: async (id: string | number, text: string) => {
    const { error } = await supabase
      .from('comments')
      .update({ text })
      .eq('id', id);
    
    if (error) throw error;
  },

  deleteComment: async (id: string | number) => {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};
