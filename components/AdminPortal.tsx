import React, { useState, useEffect, useMemo } from 'react';
import { dataService } from '../services/dataService'; 
import { Reservation, PackageKey, Comment } from '../types';
import { PACKAGES, ALL_DAY_SLOTS } from '../constants';

interface AdminPortalProps {
  onClose: () => void;
}

const AdminPortal: React.FC<AdminPortalProps> = ({ onClose }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'reservations' | 'comments'>('reservations');
  
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  
  const [selectedAdminDate, setSelectedAdminDate] = useState<string | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [editingRes, setEditingRes] = useState<Partial<Reservation> | null>(null);
  const [newComment, setNewComment] = useState({ author: '', text: '', rating: 5 });
  const [adminTeenDuration, setAdminTeenDuration] = useState<3 | 4>(3);

  const ADMIN_PASSWORD = 'Indodjija2026';
  const months = ['Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun', 'Jul', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar'];

  const TEEN_SLOTS_3H = ['20:00–23:00', '21:00–00:00', '22:00–01:00'];
  const TEEN_SLOTS_4H = ['20:00–00:00', '21:00–01:00', '22:00–02:00'];

  const safeReservations = Array.isArray(reservations) ? reservations : [];
  const safeComments = Array.isArray(comments) ? comments : [];

  useEffect(() => {
    if (isAuthenticated) {
      loadReservations();
      loadComments();
    }
  }, [isAuthenticated]);

  const loadReservations = async () => {
    try {
      const data = await dataService.getReservations();
      setReservations(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Greška pri učitavanju rezervacija:", e);
      setReservations([]);
    }
  };

  const loadComments = async () => {
    try {
      const data = await dataService.getComments();
      setComments(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Greška pri učitavanju komentara:", e);
      setComments([]);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Pogrešna lozinka');
    }
  };

  const handleDelete = async (id: string | number) => {
    if (confirm('Da li ste sigurni da želite da obrišete ovu rezervaciju?')) {
      await dataService.deleteReservation(id); 
      await loadReservations();
    }
  };

  const handleDeleteComment = async (id: string | number) => {
    if (confirm('Obrisati ovaj komentar?')) {
      await dataService.deleteComment(id);
      await loadComments();
    }
  };

  const handleEditComment = async (id: string | number, oldText: string) => {
    const newText = prompt('Izmenite komentar:', oldText);
    if (newText !== null) {
      await dataService.updateComment(id, newText);
      await loadComments();
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.author && newComment.text) {
      try {
        await dataService.saveComment(newComment);
        await loadComments();
        setShowCommentModal(false);
        setNewComment({ author: '', text: '', rating: 5 });
      } catch (err) {
        console.error("Greška kod komentara:", err);
        alert("Neuspešno dodavanje utiska.");
      }
    }
  };

  // POPRAVLJENA FUNKCIJA - SADA JE ASYNC I NEMA DUPLI KOD
  const handleSaveReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRes?.customer_name || !editingRes?.date || !editingRes?.time_slot) {
      alert('Molimo popunite osnovna polja!');
      return;
    }

    try {
      const isOccupied = safeReservations.some(r => 
        r.date === editingRes.date && 
        r.time_slot === editingRes.time_slot && 
        r.id !== editingRes.id
      );

      if (isOccupied) {
        alert('Ovaj termin je VEĆ ZAUZET! Molimo izaberite drugi termin ili datum.');
        return;
      }
      
      await dataService.saveReservation({
        customer_name: editingRes.customer_name,
        customer_phone: editingRes.customer_phone,
        customer_email: editingRes.customer_email || '',
        date: editingRes.date,
        time_slot: editingRes.time_slot,
        package_type: editingRes.package_type,
        space: editingRes.space || 'open',
        guest_count: Number(editingRes.guest_count) || 30,
        total_price: Number(editingRes.total_price) || 0,
        notes: editingRes.notes || '',
        status: editingRes.status || 'confirmed',
        created_at: editingRes.created_at || new Date().toISOString(),
        deposit_paid: true,
        extras: editingRes.extras || { tables: 0, waiterHours: 0, ledKg: 0, photographer: false, decoration: false, catering: false, makeup: false, dj: false }
      } as any);
      
      alert('Uspešno sačuvano!');
      await loadReservations(); 
      setShowFormModal(false);
      setEditingRes(null);
    } catch (err: any) {
      console.error("GREŠKA PRI ČUVANJU:", err);
      alert("Greška: " + (err.message || "Proverite bazu podataka"));
    }
  };

  const filteredReservations = useMemo(() => {
    if (!searchQuery) return safeReservations;
    const q = searchQuery.toLowerCase();
    return safeReservations.filter(r => 
      (r.customer_name || '').toLowerCase().includes(q) || 
      (r.customer_phone || '').includes(q) || 
      (r.date || '').includes(q)
    );
  }, [safeReservations, searchQuery]);

  const monthStats = useMemo(() => {
    const currentMonthReservations = safeReservations.filter(r => {
      const d = new Date(r.date);
      return d.getMonth() === calMonth && d.getFullYear() === calYear;
    });
    const totalEarnings = currentMonthReservations.reduce((sum, r) => sum + (r.total_price || 0), 0);
    return {
      count: currentMonthReservations.length,
      earnings: totalEarnings
    };
  }, [safeReservations, calMonth, calYear]);

  const renderAdminCalendar = () => {
    const days = ['Pon', 'Uto', 'Sre', 'Čet', 'Pet', 'Sub', 'Ned'];
    const firstDay = new Date(calYear, calMonth, 1);
    const lastDay = new Date(calYear, calMonth + 1, 0);
    const startDay = (firstDay.getDay() + 6) % 7;

    const cells = [];
    for (let i = 0; i < startDay; i++) cells.push(<div key={`empty-${i}`}></div>);
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayReservations = safeReservations.filter(r => r.date === dateStr);
      const bookedCount = dayReservations.length;
      
      let statusColor = 'bg-green-100 text-green-700 hover:bg-green-200';
      if (bookedCount >= ALL_DAY_SLOTS.length) statusColor = 'bg-red-100 text-red-700 hover:bg-red-200';
      else if (bookedCount > 0) statusColor = 'bg-orange-100 text-orange-700 hover:bg-orange-200';

      cells.push(
        <div 
          key={dateStr} 
          onClick={() => setSelectedAdminDate(dateStr)}
          className={`group relative h-20 md:h-24 p-2 border border-gray-100 cursor-pointer transition-all flex flex-col justify-between ${statusColor} ${selectedAdminDate === dateStr ? 'ring-2 ring-inset ring-[#c8a45d] bg-white' : ''}`}
        >
          <span className="font-black text-xs md:text-sm">{d}</span>
          <div className="flex flex-col gap-0.5 overflow-hidden">
             {dayReservations.map(r => (
               <div key={r.id || Math.random()} className="text-[7px] truncate font-bold bg-white/50 px-1 rounded leading-tight">{r.customer_name}</div>
             ))}
             {bookedCount === 0 && <div className="text-[9px] opacity-40 uppercase font-bold italic">Slobodno</div>}
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-[40px] shadow-2xl border border-gray-100 overflow-hidden mb-12">
        <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6 bg-gray-50/50">
          <div className="flex items-center gap-4">
             <button onClick={() => setCalMonth(prev => prev === 0 ? 11 : prev - 1)} className="w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm text-[#c8a45d] hover:scale-110 transition-transform">‹</button>
             <h3 className="font-display text-2xl font-bold uppercase tracking-widest min-w-[200px] text-center">{months[calMonth]} {calYear}</h3>
             <button onClick={() => setCalMonth(prev => prev === 11 ? 0 : prev + 1)} className="w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm text-[#c8a45d] hover:scale-110 transition-transform">›</button>
          </div>
          <div className="flex gap-4">
             <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100 text-center">
                <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Rezervacije</div>
                <div className="text-xl font-display font-bold text-[#1f2e2a]">{monthStats.count}</div>
             </div>
             <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100 text-center">
                <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Promet</div>
                <div className="text-xl font-display font-bold text-[#c8a45d]">{monthStats.earnings}€</div>
             </div>
          </div>
        </div>
        <div className="grid grid-cols-7 border-collapse">
          {days.map(d => <div key={d} className="py-4 text-[10px] uppercase font-black text-gray-400 text-center border-b border-gray-100">{d}</div>)}
          {cells}
        </div>
      </div>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-[2000] bg-[#1f2e2a] flex items-center justify-center p-6 text-[#1f2e2a]">
        <div className="bg-white p-12 rounded-[40px] shadow-2xl w-full max-w-md border border-gray-100 animate-fade-up">
          <h2 className="font-display text-3xl text-[#1f2e2a] font-bold mb-8 text-center">Admin Pristup</h2>
          <form onSubmit={handleLogin} className="space-y-6">
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full p-5 bg-gray-50 border border-gray-100 rounded-3xl outline-none focus:border-[#c8a45d] font-bold text-center" 
              placeholder="Unesite lozinku" 
              autoFocus 
            />
            {error && <p className="text-red-500 text-xs font-bold uppercase text-center">{error}</p>}
            <button type="submit" className="w-full py-5 bg-[#c8a45d] text-[#1f2e2a] font-black rounded-3xl hover:brightness-110 transition-all uppercase tracking-widest">Pristupi Panelu</button>
            <button type="button" onClick={onClose} className="w-full text-gray-400 font-bold uppercase text-[10px] tracking-widest text-center mt-4">Nazad na sajt</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[2000] bg-[#f5f5f0] overflow-auto flex flex-col text-[#1f2e2a]">
      <header className="bg-[#1f2e2a] p-6 text-white sticky top-0 z-50 shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-full overflow-hidden bg-white/10 p-1">
                <div className="w-full h-full bg-[#c8a45d] rounded-full flex items-center justify-center font-bold text-[#1f2e2a]">I</div>
             </div>
             <h1 className="font-display text-2xl font-bold tracking-widest uppercase">Indođija <span className="text-[#c8a45d]">Admin</span></h1>
          </div>
          
          <div className="flex bg-white/5 p-1 rounded-full border border-white/10">
            <button onClick={() => setActiveTab('reservations')} className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'reservations' ? 'bg-[#c8a45d] text-[#1f2e2a]' : 'text-white/50'}`}>Rezervacije</button>
            <button onClick={() => setActiveTab('comments')} className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'comments' ? 'bg-[#c8a45d] text-[#1f2e2a]' : 'text-white/50'}`}>Utisci</button>
          </div>

          <button onClick={onClose} className="px-8 py-3 bg-[#c8a45d] text-[#1f2e2a] rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg hover:scale-105 transition-transform">Izlaz</button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 md:p-14 w-full flex-grow">
        {activeTab === 'reservations' ? (
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
                <div className="mb-8 relative">
                  <input 
                    type="text" 
                    placeholder="Pretraži rezervacije po imenu, telefonu ili datumu..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-6 pl-14 bg-white rounded-[30px] border border-gray-100 shadow-xl outline-none focus:border-[#c8a45d] text-sm font-medium"
                  />
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xl opacity-30">🔍</span>
                </div>
                {searchQuery ? (
                  <div className="bg-white rounded-[40px] p-8 shadow-xl border border-gray-100 space-y-4">
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-[#c8a45d] mb-6">Rezultati pretrage: {filteredReservations.length}</h3>
                    {filteredReservations.map(r => (
                      <div key={r.id} className="p-6 bg-gray-50 rounded-3xl border border-gray-100 flex justify-between items-center group">
                        <div className="space-y-1 text-left">
                          <div className="font-black uppercase text-sm">{r.customer_name} <span className="text-[#c8a45d] font-bold ml-2">({r.date})</span></div>
                          <div className="text-[10px] text-gray-400 font-bold uppercase">📞 {r.customer_phone} | 🕒 {r.time_slot} | 📦 {PACKAGES[r.package_type as PackageKey]?.name}</div>
                          {r.notes && <div className="text-[9px] text-gray-500 italic mt-1 bg-white p-2 rounded inline-block">📝 {r.notes}</div>}
                        </div>
                        <button onClick={() => r.id && handleDelete(r.id)} className="p-3 bg-red-50 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white">🗑️</button>
                      </div>
                    ))}
                  </div>
                ) : renderAdminCalendar()}
            </div>
            <div className="space-y-8">
                <div className="bg-white p-8 rounded-[40px] shadow-xl border border-gray-100 min-h-[400px]">
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-[#c8a45d] mb-6 text-left">Pregled Dana: {selectedAdminDate || 'Izaberi datum'}</h4>
                  {selectedAdminDate ? (
                      <div className="space-y-6">
                        <div className="space-y-4">
                            {safeReservations.filter(r => r.date === selectedAdminDate).map(r => (
                              <div key={r.id} className="p-5 bg-gray-50 rounded-2xl border border-gray-100 group text-left">
                                  <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-black uppercase text-[#1f2e2a]">{r.customer_name}</span>
                                    <button onClick={() => r.id && handleDelete(r.id)} className="text-red-500 text-[10px] font-black uppercase">Obriši</button>
                                  </div>
                                  <div className="text-[10px] text-gray-400 font-bold uppercase flex flex-col gap-1">
                                    <span className="text-[#c8a45d]">🕒 {r.time_slot}</span>
                                    <span>📦 {PACKAGES[r.package_type as PackageKey]?.name}</span>
                                    <span>📞 {r.customer_phone}</span>
                                    {r.notes && <span className="mt-2 p-2 bg-white rounded border border-gray-100 italic text-gray-600 normal-case">📝 OPIS: {r.notes}</span>}
                                    <span className="mt-2 pt-2 border-t border-gray-200 text-[#1f2e2a]">Ukupno: {r.total_price}€</span>
                                  </div>
                              </div>
                            ))}
                            {safeReservations.filter(r => r.date === selectedAdminDate).length === 0 && (
                              <p className="text-center py-10 text-gray-300 font-bold text-xs uppercase italic tracking-widest">Nema zakazanih termina</p>
                            )}
                        </div>
                        <button onClick={() => {
                          setEditingRes({
                            date: selectedAdminDate,
                            package_type: 'kids',
                            time_slot: ALL_DAY_SLOTS[0],
                            space: 'open',
                            guest_count: 50,
                            total_price: 120,
                            customer_name: '',
                            customer_phone: '',
                            customer_email: '',
                            notes: '',
                            extras: { tables: 0, waiterHours: 0, ledKg: 0, photographer: false, decoration: false, catering: false, makeup: false, dj: false }
                          });
                          setShowFormModal(true);
                        }} className="w-full py-4 bg-[#1f2e2a] text-[#c8a45d] rounded-2xl font-black text-[10px] uppercase tracking-widest hover:brightness-125 transition-all">
                            + Dodaj Ručno
                        </button>
                      </div>
                  ) : (
                      <div className="flex flex-col items-center justify-center h-[300px] text-gray-300 gap-4">
                        <span className="text-4xl">📅</span>
                        <p className="text-[10px] font-black uppercase tracking-widest text-center">Kliknite na datum u kalendaru za upravljanje</p>
                      </div>
                  )}
                </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-[40px] p-8 md:p-14 shadow-xl border border-gray-100">
             <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
                <h3 className="text-[14px] font-black uppercase tracking-widest text-[#c8a45d]">Upravljanje Utiscima Gosti</h3>
                <button 
                  onClick={() => setShowCommentModal(true)} 
                  className="px-8 py-3 bg-[#1f2e2a] text-[#c8a45d] rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg hover:brightness-125 transition-all"
                >
                  + Dodaj Utisak
                </button>
             </div>
             <div className="grid gap-6">
                {safeComments.map(c => (
                  <div key={c.id} className="p-8 bg-gray-50 rounded-[30px] border border-gray-100 group flex flex-col md:flex-row justify-between gap-6 text-left">
                    <div className="space-y-3">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-[#c8a45d] text-[#1f2e2a] rounded-full flex items-center justify-center font-black">{c.author[0]}</div>
                          <div>
                             <div className="font-black uppercase text-sm">{c.author} <span className="text-[var(--gold)] ml-2">{'★'.repeat(c.rating)}</span></div>
                             <div className="text-[10px] text-gray-400 font-bold uppercase">{c.date ? new Date(c.date).toLocaleDateString('sr-RS') : 'N/A'}</div>
                          </div>
                       </div>
                       <p className="text-gray-600 text-sm leading-relaxed italic">"{c.text}"</p>
                    </div>
                    <div className="flex items-center gap-3">
                       <button onClick={() => c.id && handleEditComment(c.id, c.text)} className="px-6 py-3 bg-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-sm hover:bg-[#c8a45d] hover:text-white transition-all">Izmeni</button>
                       <button onClick={() => c.id && handleDeleteComment(c.id)} className="px-6 py-3 bg-red-50 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-red-500 hover:text-white transition-all">Obriši</button>
                    </div>
                  </div>
                ))}
                {(safeComments.length === 0) && <p className="text-center py-20 text-gray-300 font-bold uppercase italic tracking-widest">Nema ostavljenih komentara</p>}
             </div>
          </div>
        )}
      </main>

      {showCommentModal && (
        <div className="fixed inset-0 z-[3000] bg-[#1f2e2a]/80 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-lg p-10 rounded-[40px] shadow-2xl animate-fade-up text-[#1f2e2a]">
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-display text-2xl font-bold uppercase">Ručni Utisak</h2>
              <button onClick={() => setShowCommentModal(false)} className="text-2xl">✕</button>
            </div>
            <form onSubmit={handleAddComment} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2 text-left block">Ocena</label>
                <div className="flex gap-2 justify-center">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewComment({...newComment, rating: star})}
                      className={`text-3xl transition-all ${star <= newComment.rating ? 'text-[#c8a45d]' : 'text-gray-200'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Ime Autora</label>
                <input 
                  required 
                  value={newComment.author} 
                  onChange={(e) => setNewComment({...newComment, author: e.target.value})} 
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold" 
                />
              </div>
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Tekst Utiska</label>
                <textarea 
                  required 
                  rows={4}
                  value={newComment.text} 
                  onChange={(e) => setNewComment({...newComment, text: e.target.value})} 
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-medium resize-none" 
                />
              </div>
              <button type="submit" className="w-full py-5 bg-[#1f2e2a] text-[#c8a45d] font-black rounded-3xl uppercase tracking-widest text-[10px] hover:brightness-125 transition-all">
                Objavi Utisak
              </button>
            </form>
          </div>
        </div>
      )}

      {showFormModal && (
         <div className="fixed inset-0 z-[3000] bg-[#1f2e2a]/80 backdrop-blur-sm flex items-center justify-center p-6 text-[#1f2e2a]">
            <div className="bg-white w-full max-w-4xl p-10 md:p-14 rounded-[50px] shadow-2xl animate-fade-up max-h-[90vh] overflow-y-auto">
               <div className="flex justify-between items-center mb-10">
                  <h2 className="font-display text-3xl font-bold">Ručna Rezervacija</h2>
                  <button onClick={() => setShowFormModal(false)} className="text-2xl">✕</button>
               </div>
               <form onSubmit={handleSaveReservation} className="grid md:grid-cols-2 gap-8 text-left">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Ime i Prezime</label>
                     <input required value={editingRes?.customer_name || ''} onChange={e => setEditingRes({...editingRes!, customer_name: e.target.value})} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Telefon</label>
                     <input required value={editingRes?.customer_phone || ''} onChange={e => setEditingRes({...editingRes!, customer_phone: e.target.value})} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Paket</label>
                     <select 
                        value={editingRes?.package_type} 
                        onChange={e => {
                          const pkg = e.target.value as PackageKey;
                          setEditingRes({...editingRes!, package_type: pkg, time_slot: pkg === 'teen' ? TEEN_SLOTS_3H[0] : ALL_DAY_SLOTS[0]});
                        }} 
                        className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold"
                     >
                        {Object.keys(PACKAGES).map(k => <option key={k} value={k}>{PACKAGES[k as PackageKey].name}</option>)}
                     </select>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Datum</label>
                     <input type="date" value={editingRes?.date || ''} onChange={e => setEditingRes({...editingRes!, date: e.target.value})} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold" />
                  </div>
                  
                  {editingRes?.package_type === 'teen' && (
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Trajanje Žurke</label>
                       <div className="flex gap-4">
                          {[3, 4].map(dur => (
                             <button 
                               key={dur} 
                               type="button"
                               onClick={() => {
                                 setAdminTeenDuration(dur as 3 | 4);
                                 setEditingRes({...editingRes!, time_slot: dur === 3 ? TEEN_SLOTS_3H[0] : TEEN_SLOTS_4H[0]});
                               }}
                               className={`flex-1 py-4 rounded-2xl font-black uppercase text-[10px] border-2 transition-all ${adminTeenDuration === dur ? 'border-[#c8a45d] bg-[#c8a45d]/5 text-[#c8a45d]' : 'border-gray-100 bg-gray-50'}`}
                             >
                               {dur} Sata
                             </button>
                          ))}
                       </div>
                    </div>
                  )}

                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Termin (Od - Do)</label>
                     <select value={editingRes?.time_slot || ''} onChange={e => setEditingRes({...editingRes!, time_slot: e.target.value})} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold">
                        {editingRes?.package_type === 'teen' ? (
                          adminTeenDuration === 3 ? TEEN_SLOTS_3H.map(s => <option key={s} value={s}>{s}</option>) : TEEN_SLOTS_4H.map(s => <option key={s} value={s}>{s}</option>)
                        ) : (
                          ALL_DAY_SLOTS.map(s => <option key={s} value={s}>{s}</option>)
                        )}
                        <option value="custom">Proizvoljan (upiši ručno)</option>
                     </select>
                     {editingRes?.time_slot === 'custom' && (
                        <input className="w-full mt-2 p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold" placeholder="npr. 12:00–16:00" onChange={e => setEditingRes({...editingRes!, time_slot: e.target.value})} />
                     )}
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Ukupna Cena (€)</label>
                     <input type="number" value={editingRes?.total_price || 0} onChange={e => setEditingRes({...editingRes!, total_price: parseInt(e.target.value)})} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-[#c8a45d]" />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                     <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Beleške (Važne informacije o rezervaciji)</label>
                     <textarea 
                        value={editingRes?.notes || ''} 
                        onChange={e => setEditingRes({...editingRes!, notes: e.target.value})} 
                        rows={3}
                        className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-medium resize-none placeholder:text-gray-300"
                        placeholder="Npr. Rođendan od male Milice, donose svoju tortu..."
                     />
                  </div>

                  <button type="submit" className="md:col-span-2 py-5 bg-[#1f2e2a] text-[#c8a45d] font-black rounded-3xl uppercase tracking-widest text-sm hover:brightness-125 transition-all shadow-xl mt-6">
                     Potvrdi i Sačuvaj
                  </button>
               </form>
            </div>
         </div>
      )}

      <footer className="p-12 text-center bg-gray-50 border-t border-gray-100 mt-auto text-[#1f2e2a]">
         <div className="text-[10px] font-black uppercase tracking-[8px] text-gray-300 mb-2">Administracija Sistema</div>
         <div className="font-display italic text-gray-400 text-sm">Volim te mama❤️ </div>
      </footer>
    </div>
  );
};

export default AdminPortal;
