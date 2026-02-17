import { createClient } from '@supabase/supabase-js';
import { Reservation, Comment } from '../types';

// Ovi ključevi se automatski povlače iz GitHub Secrets (za produkciju) ili .env fajla (lokalno)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const dataService = {
  // --- REZERVACIJE ---

  getReservations: async (): Promise<Reservation[]> => {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Greška pri čitanju rezervacija:', error);
      return [];
    }
    return data || [];
  },

  isSlotOccupied: async (date: string, timeSlot: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from('reservations')
      .select('id')
      .eq('date', date)
      .eq('time_slot', timeSlot)
      .eq('status', 'confirmed');
    
    if (error) return false;
    return data && data.length > 0;
  },

  saveReservation: async (res: Omit<Reservation, 'id'>) => {
    const { error } = await supabase
      .from('reservations')
      .insert([res]);
    
    if (error) throw error;
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
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      // Ako baza ne radi, vraćamo tvoje default komentare kao rezervu
      return [
        { id: '1', author: 'Jelena M.', text: 'Prelepo mesto, deca su bila oduševljena igralištem!', rating: 5, date: new Date().toISOString() },
        { id: '2', author: 'Marko K.', text: 'Odlična organizacija za punoletstvo. Sve preporuke.', rating: 5, date: new Date().toISOString() }
      ];
    }
    return data || [];
  },

  saveComment: async (comment: Omit<Comment, 'id' | 'date'>) => {
    const newComment = { 
      ...comment, 
      date: new Date().toISOString() 
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
