
import { Reservation, Comment } from '../types';

const STORAGE_KEY = 'indodjija_reservations';
const COMMENTS_KEY = 'indodjija_comments';

export const dataService = {
  // Rezervacije
  getReservations: (): Reservation[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },
  isSlotOccupied: (date: string, timeSlot: string): boolean => {
    const reservations = dataService.getReservations();
    return reservations.some(r => r.date === date && r.time_slot === timeSlot && r.status === 'confirmed');
  },
  saveReservation: (res: Omit<Reservation, 'id'>) => {
    const reservations = dataService.getReservations();
    const newRes = { ...res, id: Math.random().toString(36).substr(2, 9) };
    reservations.push(newRes as Reservation);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reservations));
  },
  deleteReservation: (id: string) => {
    const reservations = dataService.getReservations().filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reservations));
  },

  // Komentari
  getComments: (): Comment[] => {
    const data = localStorage.getItem(COMMENTS_KEY);
    return data ? JSON.parse(data) : [
      { id: '1', author: 'Jelena M.', text: 'Prelepo mesto, deca su bila oduševljena igralištem!', rating: 5, date: new Date().toISOString() },
      { id: '2', author: 'Marko K.', text: 'Odlična organizacija za punoletstvo. Sve preporuke.', rating: 5, date: new Date().toISOString() }
    ];
  },
  saveComment: (comment: Omit<Comment, 'id' | 'date'>) => {
    const comments = dataService.getComments();
    const newComment = { ...comment, id: Math.random().toString(36).substr(2, 9), date: new Date().toISOString() };
    comments.unshift(newComment);
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
  },
  updateComment: (id: string, text: string) => {
    const comments = dataService.getComments().map(c => c.id === id ? { ...c, text } : c);
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
  },
  deleteComment: (id: string) => {
    const comments = dataService.getComments().filter(c => c.id !== id);
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
  }
};
