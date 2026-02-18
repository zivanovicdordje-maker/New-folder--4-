import React, { useState, useEffect, useRef } from 'react';
import { Reservation, PackageKey, ExtraServices, Comment } from './types';
import { dataService } from './services/dataService';
import { PACKAGES, COLORS, DEPOSIT_AMOUNT, ALL_DAY_SLOTS } from './constants';
import AdminPortal from './components/AdminPortal';
import PrivacyPolicy from './components/PrivacyPolicy';
import HouseRules from './components/HouseRules';
import Toast from './components/Toast';

declare global {
  interface Window {
    paypal: any;
  }
}

// POMOĆNA FUNKCIJA ZA SLIKE - Rešava problem sa GitHub putanjama
const getImgPath = (path: string) => {
  const base = import.meta.env.BASE_URL || '/';
  // Uklanja ./ sa početka ako postoji i spaja sa bazom
  const cleanPath = path.replace(/^\.\//, '');
  return `${base}${cleanPath}`;
};

const PKG_IMAGES: Record<PackageKey, string> = {
  kids: getImgPath("slike/paketi/deca.jpg"),
  teen: getImgPath("slike/paketi/zurka6.jpg"),
  adult: getImgPath("slike/paketi/zurka2.jpg"),
  baby: getImgPath("slike/galerija/rodjenje2.JPG"),
  gender: getImgPath("slike/paketi/gender.jpg"),
  eighteen: getImgPath("slike/paketi/zurka5.jpg"),
  slavlja: getImgPath("slike/paketi/slavlja.jpg")
};

const SERVICE_IMAGES: Record<string, string> = {
  photographer: getImgPath("slike/galerija/foto.jpg"),
  decoration: getImgPath("slike/galerija/dekoracija.jpg"),
  catering: getImgPath("slike/galerija/ketering.jpg"),
  makeup: getImgPath("slike/galerija/sminka.jpg"),
  dj: getImgPath("slike/galerija/dj.jpg"),
  waiter: getImgPath("slike/galerija/konobar.jpg"),
  tables: getImgPath("slike/galerija/stolovi.jpg")
};

const GALLERY_IMAGES = [
  getImgPath("slike/galerija/zurka1.jpg"),
  getImgPath("slike/galerija/zurka5.jpg"),
  getImgPath("slike/galerija/prosotr1.jpg"),
  getImgPath("slike/galerija/pozadina.jpg"),
  getImgPath("slike/galerija/zurka.jpg"),
  getImgPath("slike/galerija/zurka6.jpg")
];

const HOLIDAYS = [
  { name: 'Nova Godina', img: getImgPath('slike/galerija/vatromet.jpg'), icon: '🎄' },
  { name: 'Repriza Nove Godine', img: getImgPath('slike/galerija/sampanjac.jpg'), icon: '🎆' },
  { name: 'Srpska Nova Godina', img: getImgPath('slike/galerija/prskalica.jpg'), icon: '🇷🇸' },
  { name: '1. Maj', img: getImgPath('slike/galerija/1maj.jpg'), icon: '🌱' }
];

const CANVA_PRESENTATION_URL = "https://www.canva.com/design/DAGty2-d1Ik/kEB1xHTzGHi0krgT0lC6tg/view?utm_content=DAGty2-d1Ik&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=ha42092f073";

const isHolidayDate = (dateStr: string | null) => {
  if (!dateStr) return false;
  const parts = dateStr.split('-');
  const m = parseInt(parts[1]);
  const d = parseInt(parts[2]);
  if (m === 12 && d === 31) return true;
  if (m === 1 && (d === 1 || d === 2 || d === 13 || d === 14)) return true;
  if (m === 5 && d === 1) return true;
  return false;
};

const App: React.FC = () => {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isAboutDetailsOpen, setIsAboutDetailsOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [toasts, setToasts] = useState<{ id: number; msg: string; type: 'success' | 'error' | 'info' }[]>([]);
  const [activePackage, setActivePackage] = useState<PackageKey>('kids');
  const [selectedSpace, setSelectedSpace] = useState<'open' | 'closed' | null>(null);
  const [teenDuration, setTeenDuration] = useState<3 | 4 | null>(null);
  const [guestCount, setGuestCount] = useState(30);
  const [childrenCount, setChildrenCount] = useState(20);
  const [adultsCount, setAdultsCount] = useState(30);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [isWaiterEnabled, setIsWaiterEnabled] = useState(false);
  const [extras, setExtras] = useState<ExtraServices>({ 
    tables: 0, waiterHours: 0, ledKg: 0, photographer: false, decoration: false, catering: false, makeup: false, dj: false
  });
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPaymentReady, setIsPaymentReady] = useState(false);
  const [userRating, setUserRating] = useState(5);
  const paypalContainerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const cartCount = (selectedDate && selectedTimeSlot) ? 1 : 0;
  const isSlavlja = activePackage === 'slavlja';

const refreshData = async () => {
    try {
      console.log("Osvežavam podatke iz baze...");
      const resData = await dataService.getReservations();
      const commData = await dataService.getComments();
      
      if (resData) {
        setReservations(resData);
        console.log("Stiglo rezervacija:", resData.length);
      }
      if (commData) setComments(commData);
    } catch (err) {
      console.error("Greška pri osvežavanju podataka:", err);
    }
};

useEffect(() => {
    refreshData(); // Poziva se jednom kad se sajt učita
    const interval = setInterval(() => {
      refreshData();
    }, 5000); // Svakih 5 sekundi proverava bazu
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isWaiterEnabled || activePackage === 'slavlja') {
      setExtras(prev => ({ ...prev, waiterHours: 0 }));
      return;
    }

    const pkg = PACKAGES[activePackage];
    let duration = 0;
    if (activePackage === 'teen') {
      duration = teenDuration || 3;
    } else {
      const match = pkg.duration.match(/(\d+)h/);
      duration = match ? parseInt(match[1]) : 0;
    }

    setExtras(prev => ({ ...prev, waiterHours: duration }));
  }, [activePackage, selectedTimeSlot, isWaiterEnabled, teenDuration]);

  useEffect(() => {
    if (selectedSpace === 'closed') {
      if (guestCount > 70) setGuestCount(70);
      if (childrenCount + adultsCount > 70) {
        const remaining = 70 - childrenCount;
        setAdultsCount(remaining > 0 ? remaining : 0);
      }
    }
  }, [selectedSpace, guestCount, childrenCount, adultsCount]);

  useEffect(() => {
    if (selectedTimeSlot && isPaymentReady && paypalContainerRef.current && window.paypal) {
      paypalContainerRef.current.innerHTML = '';
      window.paypal.HostedButtons({
        hostedButtonId: "KB6QMB3QM5CP8",
        onApprove: (data: any, actions: any) => {
          handleBooking({ preventDefault: () => {} } as React.FormEvent, true);
        }
      }).render("#paypal-container-KB6QMB3QM5CP8");
    }
  }, [selectedTimeSlot, isPaymentReady]);

  const addToast = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type }]);
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 100;
      const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({ top: elementPosition - offset, behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  const calculateTotalPrice = () => {
    const pkg = PACKAGES[activePackage];
    if (activePackage === 'slavlja') return 0;

    let base = activePackage === 'kids' 
      ? pkg.calcPrice(childrenCount, adultsCount) 
      : pkg.calcPrice(guestCount, selectedTimeSlot || '');
    
    if (isHolidayDate(selectedDate)) {
      base += 70;
    }
    
    const extrasTotal = 
      (extras.tables * 10) + 
      (extras.waiterHours * 10) + 
      (extras.ledKg * 0.8);
      
    return base + extrasTotal;
  };

  const getAvailableSlots = () => {
    if (!selectedDate) return [];
    const pkg = PACKAGES[activePackage];
   const dayReservations = reservations.filter(r => (r.date?.split('T')[0] === selectedDate) && r.status === 'confirmed');
    
    let possibleSlots = pkg.slots;
    if (activePackage === 'teen' && teenDuration) {
      possibleSlots = teenDuration === 3 
        ? ['20:00–23:00', '21:00–00:00', '22:00–01:00']
        : ['20:00–00:00', '21:00–01:00', '22:00–02:00'];
    }

    return possibleSlots.filter(slot => !dayReservations.some(r => r.time_slot === slot));
  };

  const renderCalendar = () => {
    const months = ['Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun', 'Jul', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar'];
    const days = ['Pon', 'Uto', 'Sre', 'Čet', 'Pet', 'Sub', 'Ned'];
    const firstDay = new Date(calYear, calMonth, 1);
    const lastDay = new Date(calYear, calMonth + 1, 0);
    const startDay = (firstDay.getDay() + 6) % 7;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const cells = [];
    for (let i = 0; i < startDay; i++) cells.push(<div key={`empty-${i}`}></div>);
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isPast = new Date(calYear, calMonth, d) < today;
      const isHoliday = isHolidayDate(dateStr);
     const dayReservations = reservations.filter(r => {
  // Ovo osigurava da poredimo samo YYYY-MM-DD deo, čak i ako baza vrati drugačije
  const rDate = r.date ? r.date.split('T')[0] : '';
  return rDate === dateStr && (r.status === 'confirmed' || r.status === 'booked');
});
      
      const totalPossibleSlots = ALL_DAY_SLOTS.length;
      const bookedCount = dayReservations.length;
      
      let statusColor = 'bg-green-500';
      if (bookedCount >= totalPossibleSlots) statusColor = 'bg-red-500';
      else if (bookedCount > 0) statusColor = 'bg-orange-400';

      if (isPast) statusColor = 'bg-gray-200 opacity-40 cursor-not-allowed';

      cells.push(
        <div 
          key={dateStr}
          onClick={() => !isPast && bookedCount < totalPossibleSlots && setSelectedDate(dateStr)}
          className={`w-10 h-10 md:w-12 md:h-12 flex flex-col items-center justify-center rounded-full text-[10px] md:text-xs cursor-pointer transition-all ${statusColor} ${selectedDate === dateStr ? 'ring-4 ring-[var(--gold)] font-bold' : 'text-white'} shadow-sm relative ${isHoliday && !isPast ? 'ring-2 ring-[var(--gold)] ring-offset-2' : ''}`}
        >
          <span>{d}</span>
          {isHoliday && !isPast && <span className="absolute -top-1 right-0 text-[8px]">✨</span>}
        </div>
      );
    }

    return (
      <div className="bg-white p-4 md:p-8 rounded-[40px] shadow-2xl border border-gray-100">
        <div className="flex justify-between items-center mb-8">
          <button onClick={() => calMonth === 0 ? (setCalMonth(11), setCalYear(calYear - 1)) : setCalMonth(calMonth - 1)} className="text-[var(--gold)] text-3xl px-3 hover:scale-110 transition-transform">‹</button>
          <span className="font-display font-bold uppercase tracking-[3px] text-xs md:text-base">{months[calMonth]} {calYear}</span>
          <button onClick={() => calMonth === 11 ? (setCalMonth(0), setCalYear(calYear + 1)) : setCalMonth(calMonth + 1)} className="text-[var(--gold)] text-3xl px-3 hover:scale-110 transition-transform">›</button>
        </div>
        <div className="grid grid-cols-7 gap-1 md:gap-2 text-center">
          {days.map(d => <div key={d} className="text-[8px] md:text-[9px] uppercase font-black text-gray-400 mb-3 tracking-widest">{d}</div>)}
          {cells}
        </div>
        <div className="mt-8 flex flex-wrap gap-4 text-[8px] md:text-[9px] uppercase font-black text-gray-400 justify-center">
           <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500"></span> Slobodno</div>
           <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-orange-400"></span> Zauzeto</div>
           <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500"></span> Popunjeno</div>
           <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full ring-1 ring-[var(--gold)]"></span> ✨ Praznik</div>
        </div>
      </div>
    );
  };

  const handleBooking = (e: React.FormEvent, isConfirmed: boolean = false) => {
    e.preventDefault();
    if (activePackage === 'slavlja') return;

    if (!isConfirmed) {
      const formData = new FormData(formRef.current!);
      
      if (!selectedSpace) {
        addToast('Prvo izaberite tip prostora (Korak 01).', 'error');
        scrollTo('space-step');
        return;
      }
      
      if (!selectedDate) {
        addToast('Molimo izaberite datum na kalendaru (Korak 03).', 'error');
        scrollTo('date-step');
        return;
      }

      if (!selectedTimeSlot) {
        addToast('Izaberite jedan od slobodnih termina (Korak 04).', 'error');
        scrollTo('slot-step');
        return;
      }

      if (!formData.get('name') || !formData.get('phone')) {
        addToast('Popunite Vaše kontakt podatke.', 'error');
        scrollTo('form-step');
        return;
      }

      setIsPaymentReady(true); 
      addToast('Uplatite depozit od 40€ za finalnu potvrdu.', 'info'); 
      return;
    }

    const formData = new FormData(formRef.current!);
    if (dataService.isSlotOccupied(selectedDate!, selectedTimeSlot!)) {
      addToast('Žao nam je, ovaj termin je upravo rezervisan. Molimo izaberite drugi.', 'error');
      refreshData();
      return;
    }

    dataService.saveReservation({
      package_type: activePackage, space: selectedSpace!, date: selectedDate!, time_slot: selectedTimeSlot!,
      guest_count: activePackage === 'kids' ? (childrenCount + adultsCount) : guestCount, extras, 
      total_price: calculateTotalPrice(), deposit_paid: true, customer_name: formData.get('name') as string,
      customer_email: formData.get('email') as string, customer_phone: formData.get('phone') as string,
      status: 'confirmed', created_at: new Date().toISOString()
    });
    refreshData(); addToast('Rezervacija uspešno potvrđena! ✨', 'success');
    formRef.current?.reset(); setSelectedDate(null); setSelectedTimeSlot(null); setIsPaymentReady(false);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget as HTMLFormElement);
    const author = f.get('author') as string;
    const text = f.get('text') as string;
    if (author && text) {
      dataService.saveComment({ author, text, rating: userRating });
      refreshData();
      setIsReviewModalOpen(false);
      setUserRating(5);
      addToast('Hvala na utisku! ✨', 'success');
    }
  };

  return (
    <div className="min-h-screen selection:bg-[var(--gold)] selection:text-white">
      {isAdminOpen && <AdminPortal onClose={() => { setIsAdminOpen(false); refreshData(); }} />}
      {isPrivacyOpen && <PrivacyPolicy onClose={() => setIsPrivacyOpen(false)} />}
      {isRulesOpen && <HouseRules onClose={() => setIsRulesOpen(false)} />}
      
      {isAboutDetailsOpen && (
        <div className="fixed inset-0 z-[5000] bg-[var(--dark-green)] text-white overflow-y-auto animate-fade-up">
           <button onClick={() => setIsAboutDetailsOpen(false)} className="fixed top-8 right-8 text-4xl font-black z-[5001] bg-black/20 w-16 h-16 rounded-full flex items-center justify-center hover:bg-[var(--gold)] transition-all">✕</button>
           <div className="max-w-4xl mx-auto px-6 py-32 space-y-16">
              <div className="text-center space-y-4">
                 <h2 className="font-display text-5xl md:text-8xl">Indođija</h2>
                 <p className="text-[var(--gold)] italic text-xl md:text-2xl tracking-widest font-display">Vaša Oaza Luksuza</p>
              </div>
              <img src={getImgPath("slike/galerija/prosotr1.jpg")} className="w-full h-[300px] md:h-[500px] object-cover rounded-[40px] md:rounded-[60px] shadow-2xl" alt="Indođija Prozor" />
              
              <div className="grid md:grid-cols-2 gap-10 md:gap-16 text-base md:text-lg leading-relaxed text-white/80 font-light">
                 <p>Smeštena u samom srcu vojvođanske ravnice, Indođija Luxury Event Garden predstavlja krunu inđijske ponude za proslave. Naša misija je jednostavna: stvoriti prostor u kojem se priroda i moderni luksuz prepliću, stvarajući atmosferu koja oduzima dah.</p>
                 <p>Od intimnih proslava rođenja i krštenja, do spektakularnih punoletstava i korporativnih događaja, naš vrt se prilagođava vašoj viziji. Sa kapacitetom do 200 gostiju na otvorenom, svaka proslava dobija notu ekskluzivnosti.</p>
              </div>

              {/* Canva Presentation Preview Section */}
              <div className="py-12 px-6 bg-white/5 border border-white/10 rounded-[40px] text-center space-y-8 animate-fade-up">
                 <div className="space-y-4">
                    <h3 className="font-display text-3xl md:text-4xl text-[var(--gold)]">Digitalni Katalog</h3>
                    <p className="text-white/60 text-sm md:text-base max-w-xl mx-auto">Pogledajte našu kompletnu digitalnu prezentaciju sa svim detaljima, paketima i dodatnim opcijama.</p>
                 </div>
                 <div className="relative group max-w-2xl mx-auto overflow-hidden rounded-3xl aspect-video bg-black/20 flex items-center justify-center border border-white/5">
                    <img src={getImgPath("slike/galerija/pozadina.jpg")} className="absolute inset-0 w-full h-full object-cover opacity-30 blur-sm group-hover:scale-110 transition-transform duration-700" alt="Preview" />
                    <div className="relative z-10 flex flex-col items-center gap-6">
                       <div className="w-20 h-20 bg-[var(--gold)] rounded-full flex items-center justify-center shadow-2xl animate-pulse">
                          <svg width="40" height="40" fill="currentColor" viewBox="0 0 24 24" className="text-[var(--dark-green)]"><path d="M8 5v14l11-7z"/></svg>
                       </div>
                       <a 
                        href={CANVA_PRESENTATION_URL} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="px-10 py-4 bg-white text-[var(--dark-green)] font-black uppercase tracking-widest text-xs rounded-full hover:bg-[var(--gold)] hover:text-white transition-all shadow-2xl"
                       >
                         Pogledaj Prezentaciju
                       </a>
                    </div>
                 </div>
              </div>

              <div className="space-y-8">
                 <h3 className="font-display text-3xl md:text-4xl text-[var(--gold)] text-center">Šta nas izdvaja?</h3>
                 <div className="grid md:grid-cols-3 gap-6 md:gap-8">
                    {[
                       { t: 'Ambijent', d: 'U prirodi odvojen od gradske buke i haosa.' },
                       { t: 'Prilagodljivost', d: 'Zatvoreni prostor za hladnije dane sa grejanjem i klimatizacijom.' },
                       { t: 'Kvalitet', d: 'Saradnja sa najboljim kuvarima, fotografima,dekoraterima, dj-evima u Inđiji.' }
                    ].map(f => (
                       <div key={f.t} className="p-6 md:p-8 bg-white/5 border border-white/10 rounded-3xl text-center space-y-4">
                          <div className="text-xl md:text-2xl font-display text-[var(--gold)]">{f.t}</div>
                          <p className="text-xs md:text-sm text-white/60">{f.d}</p>
                       </div>
                    ))}
                 </div>
              </div>
              <div className="text-center pt-10 pb-20">
                 <button onClick={() => { setIsAboutDetailsOpen(false); scrollTo('booking-section'); }} className="px-10 py-5 md:px-16 md:py-6 bg-[var(--gold)] text-[var(--dark-green)] font-black uppercase tracking-[3px] md:tracking-[4px] rounded-full hover:bg-white transition-all shadow-2xl text-[10px] md:text-xs">Rezerviši svoj termin</button>
              </div>
           </div>
        </div>
      )}

      {isReviewModalOpen && (
        <div className="fixed inset-0 z-[5000] bg-[var(--dark-green)]/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white p-8 md:p-12 rounded-[40px] shadow-2xl w-full max-w-lg relative animate-fade-up">
            <button onClick={() => setIsReviewModalOpen(false)} className="absolute top-6 right-6 text-xl">✕</button>
            <h3 className="font-display text-2xl md:text-3xl mb-8 text-center text-[var(--dark-green)]">Ostavite Utisak</h3>
            <form onSubmit={handleCommentSubmit} className="space-y-6">
               <div className="flex justify-center gap-2 mb-4">
                 {[1, 2, 3, 4, 5].map((star) => (
                   <button
                     key={star}
                     type="button"
                     onClick={() => setUserRating(star)}
                     className={`text-3xl transition-all ${star <= userRating ? 'text-[var(--gold)]' : 'text-gray-200'}`}
                   >
                     ★
                   </button>
                 ))}
               </div>
               <input name="author" required placeholder="Vaše Ime" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[var(--gold)] font-bold text-sm" />
               <textarea name="text" required placeholder="Vaše iskustvo u Indođiji..." rows={4} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[var(--gold)] font-medium text-sm resize-none"></textarea>
               <button type="submit" className="w-full py-5 bg-[var(--dark-green)] text-[var(--gold)] font-black rounded-3xl uppercase tracking-widest text-[10px] hover:brightness-110 transition-all">Objavi Utisak</button>
            </form>
          </div>
        </div>
      )}

      <div className="fixed top-24 right-4 z-[2000] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => <Toast key={t.id} message={t.msg} type={t.type} onClose={() => setToasts(prev => prev.filter(x => x.id !== t.id))} />)}
      </div>

      <header className="fixed top-0 inset-x-0 z-[1000] bg-[var(--dark-green)]/85 backdrop-blur-3xl border-b border-white/5 py-4 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => scrollTo('hero')}>
            <div className="w-10 h-10 border border-[var(--gold)] rounded-full overflow-hidden transition-all group-hover:scale-110 bg-[var(--dark-green)]">
               <img src={getImgPath("slike/galerija/logo.jpg")} alt="Indođija Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-display text-white text-lg md:text-xl tracking-[2px] font-bold">INDOĐIJA</span>
          </div>
          <nav className="hidden lg:flex items-center gap-8 text-[11px] tracking-[3px] font-black">
            {[
              { l: 'O NAMA', i: 'onama' },
              { l: 'PONUDE', i: 'ponude' },
              { l: 'UTISCI', i: 'utisci-sekcija' },
              { l: 'GALERIJA', i: 'galerija' },
              { l: 'LOKACIJA', i: 'lokacija-sekcija' },
              { l: 'PRAVILA', i: 'rules' },
              { l: 'KONTAKT', i: 'contact-footer' }
            ].map(item => (
              <span key={item.l} className="hover:text-[var(--gold)] cursor-pointer transition-colors uppercase menu-item-outline" onClick={() => item.i === 'rules' ? setIsRulesOpen(true) : scrollTo(item.i)}>{item.l}</span>
            ))}
            <div className="flex items-center gap-3 cursor-pointer group px-5 py-2 bg-white/10 rounded-full border border-white/20 hover:border-[var(--gold)]/50 transition-all" onClick={() => scrollTo('booking-section')}>
              <span className="text-[var(--gold)] uppercase tracking-widest text-[9px]">KORPA</span>
              <div className="w-6 h-6 rounded-full bg-[var(--gold)] text-[var(--dark-green)] flex items-center justify-center text-[9px] font-black group-hover:scale-110 transition-transform">
                {cartCount}
              </div>
            </div>
          </nav>
          <button className="lg:hidden text-[var(--gold)] text-3xl" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>{isMobileMenuOpen ? '✕' : '☰'}</button>
        </div>
      </header>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[1100] bg-[var(--dark-green)]/98 backdrop-blur-3xl flex flex-col items-center justify-center gap-6 text-white font-display text-2xl animate-fade-up">
           <button className="absolute top-8 right-8 text-4xl" onClick={() => setIsMobileMenuOpen(false)}>✕</button>
           {[
              { l: 'O NAMA', i: 'onama' },
              { l: 'PONUDE', i: 'ponude' },
              { l: 'UTISCI', i: 'utisci-sekcija' },
              { l: 'GALERIJA', i: 'galerija' },
              { l: 'LOKACIJA', i: 'lokacija-sekcija' },
              { l: 'PRAVILA KUĆE', i: 'rules' },
              { l: 'KONTAKT', i: 'contact-footer' }
            ].map(item => (
              <span key={item.l} onClick={() => { if(item.i === 'rules') setIsRulesOpen(true); else scrollTo(item.i); setIsMobileMenuOpen(false); }}>{item.l}</span>
            ))}
        </div>
      )}

      <section id="hero" className="relative h-screen flex items-center justify-center bg-[var(--dark-green)]">
        <div 
          className="absolute inset-0 opacity-40 bg-cover bg-center grayscale scale-105"
          style={{ backgroundImage: `url(${getImgPath('slike/galerija/pozadina.jpg')})` }}
        ></div>
        <div className="relative z-10 text-center px-6">
           <h1 className="font-display text-6xl md:text-9xl text-white mb-6 drop-shadow-2xl animate-fade-up uppercase tracking-tighter text-shadow-xl">INDOĐIJA</h1>
           <p className="font-display italic text-xl md:text-3xl text-[var(--gold)] mb-12 animate-fade-up delay-100">Gde luksuz susreće prirodu.</p>
           <button onClick={() => scrollTo('booking-section')} className="px-10 py-5 md:px-14 md:py-6 bg-[var(--gold)] text-[var(--dark-green)] font-black uppercase text-[10px] md:text-[11px] tracking-[4px] hover:bg-white transition-all shadow-2xl rounded-sm">Rezervišite termin</button>
        </div>
      </section>

      {/* 1. GALERIJA */}
      <section id="galerija" className="py-24 bg-[var(--ivory)] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-5xl md:text-7xl text-[var(--dark-green)] mb-4">Galerija</h2>
            <div className="w-16 md:w-24 h-px bg-[var(--gold)] mx-auto mb-6"></div>
            <p className="text-[var(--gold)] font-display italic text-lg md:text-2xl tracking-widest">Zakoračite u naš svet</p>
          </div>
          <div className="flex gap-6 md:gap-12 overflow-x-auto pb-10 gallery-scroll snap-x scroll-smooth px-4">
            {GALLERY_IMAGES.map((img, i) => (
              <div key={i} className="flex-shrink-0 w-[260px] md:w-[480px] h-[400px] md:h-[650px] rounded-[50px] md:rounded-[70px] overflow-hidden shadow-2xl snap-center group relative transition-all duration-700 hover:scale-[1.02] cursor-pointer border-4 md:border-8 border-white">
                  <img src={img} className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 grayscale group-hover:grayscale-0" alt={`G ${i}`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--dark-green)]/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8 md:p-12">
                    <span className="text-white font-display text-2xl md:text-3xl italic tracking-[2px]">Inspiracija #{i+1}</span>
                  </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. O NAMA / SAZNAJTE VIŠE */}
      <section id="onama" className="py-24 px-6 md:px-12 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 md:gap-24">
           <div className="flex-1 space-y-10 md:space-y-12">
              <h2 className="font-display text-5xl md:text-7xl text-[var(--dark-green)] leading-tight text-center lg:text-left">Vrt Iz Snova <br/> <span className="text-[var(--gold)] italic tracking-[3px] md:tracking-[4px]">U Srcu Ravnice</span></h2>
              <div className="w-20 md:w-24 h-px bg-[var(--gold)] mx-auto lg:mx-0"></div>
              <p className="text-gray-600 leading-[1.8] md:leading-[2.2] tracking-[1px] md:tracking-[2px] text-base md:text-lg text-center lg:text-left">Indođija Luxury Event Garden je unikatno mesto za vaše najbitnije proslave. Spoj netaknute prirode i vrhunskog luksuza pruža nezaboravno iskustvo vama i vašim gostima.</p>
              <div className="text-center lg:text-left">
                <button onClick={() => setIsAboutDetailsOpen(true)} className="px-10 py-4 md:px-14 md:py-5 border-2 border-[var(--gold)] text-[var(--gold)] uppercase font-black tracking-[4px] md:tracking-[5px] text-[10px] md:text-[12px] hover:bg-[var(--gold)] hover:text-white transition-all rounded-[4px]">Saznajte Više</button>
              </div>
              
              <div className="mt-16 p-8 md:p-10 bg-white rounded-[40px] md:rounded-[50px] shadow-xl border border-gray-100 animate-fade-up relative overflow-hidden group">
                 <div className="absolute top-0 right-0 bg-[var(--gold)] text-[var(--dark-green)] px-6 md:px-8 py-2 font-black uppercase text-[8px] md:text-[9px] tracking-widest rounded-bl-3xl">Novo u ponudi</div>
                 <div className="flex flex-col md:flex-row gap-8 md:gap-10 items-center">
                    <div className="flex-1 space-y-4 md:space-y-6 text-left">
                       <h3 className="font-display text-2xl md:text-3xl text-[var(--dark-green)]">Adrenalinska Zabava</h3>
                       <p className="text-gray-500 text-xs md:text-sm leading-relaxed font-medium">Od sada u Indođiji rezervisati <strong>vožnju kvadom</strong>! Priuštite mališanima nezaboravnu avanturu u bezbednom okruženju uz stručan nadzor.</p>
                    </div>
                    <div className="w-full md:w-[200px] lg:w-[240px] aspect-square rounded-[30px] md:rounded-[40px] overflow-hidden shadow-2xl transition-transform hover:scale-105 duration-500 border-4 border-white">
                       <img src={getImgPath("slike/galerija/kvad.jpg")} alt="Deciji Kvad" className="w-full h-full object-cover" />
                    </div>
                 </div>
              </div>
           </div>
           <div className="flex-1 relative w-full">
              <div className="w-full h-[400px] md:h-[650px] rounded-[60px] md:rounded-[120px] overflow-hidden shadow-2xl z-10 lg:rotate-[2deg] border-[8px] md:border-[12px] border-white">
                 <img src={getImgPath("slike/galerija/slavlja.jpg")} className="w-full h-full object-cover" alt="Garden" />
              </div>
              <div className="absolute -bottom-8 -left-8 md:-bottom-16 md:-left-16 w-40 md:w-80 h-40 md:h-80 bg-[var(--gold)]/30 rounded-full blur-[60px] md:blur-[120px] z-0"></div>
           </div>
        </div>
      </section>

      {/* 3. PONUDE / REZERVACIJA */}
      <section id="ponude" className="py-24 px-4 md:px-12 bg-[var(--ivory)]">
        <div id="booking-section" className="max-w-7xl mx-auto">
          <div className="text-center mb-16 px-4">
            <h2 className="font-display text-5xl md:text-7xl text-[var(--dark-green)] mb-6">Izaberite Paket</h2>
            <div className="w-16 md:w-24 h-px bg-[var(--gold)] mx-auto"></div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 md:gap-6 mb-16 px-2">
            {(Object.keys(PACKAGES) as PackageKey[]).map(k => (
              <button 
                key={k} 
                onClick={() => { setActivePackage(k); setSelectedDate(null); setSelectedTimeSlot(null); setTeenDuration(null); }}
                className={`relative group aspect-square rounded-[24px] md:rounded-[32px] overflow-hidden shadow-2xl transition-all duration-500 ${activePackage === k ? 'ring-4 ring-[var(--gold)] scale-105' : 'hover:scale-105 opacity-80 hover:opacity-100'}`}
              >
                <img src={PKG_IMAGES[k]} className="w-full h-full object-cover transition-all duration-700 grayscale group-hover:grayscale-0" alt={k} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col items-center justify-end p-4 md:p-6">
                  <span className="text-white font-black text-[9px] md:text-[11px] uppercase tracking-[1px] md:tracking-[2px] text-center leading-tight">{PACKAGES[k].name}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="bg-white rounded-[40px] md:rounded-[60px] shadow-2xl overflow-hidden flex flex-col lg:flex-row border border-gray-100 min-h-[850px]">
            <div className="flex-1 p-6 md:p-14 lg:border-r border-gray-100 space-y-12 md:space-y-16">
              <div className="space-y-6 md:space-y-8">
                 <h3 className="font-display text-3xl md:text-4xl text-[var(--dark-green)]">{PACKAGES[activePackage].name}</h3>
                 <div className="space-y-4">
                    <p className="text-[var(--gold)] font-black uppercase tracking-[3px] md:tracking-[4px] text-[9px] md:text-[10px] mb-2">U ponudu ulazi:</p>
                    <div className="flex flex-wrap gap-2">
                       {PACKAGES[activePackage].inclusions.split(', ').map((item, idx) => (
                          <span key={idx} className="bg-gray-50 border border-gray-100 px-3 py-1.5 md:px-4 md:py-2 rounded-full text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-gray-500 shadow-sm">{item}</span>
                       ))}
                    </div>
                 </div>
              </div>

              {isSlavlja ? (
                <div className="bg-gray-50 rounded-[30px] md:rounded-[40px] p-8 md:p-14 border border-gray-100 flex flex-col items-center text-center space-y-8 md:space-y-10 animate-fade-up">
                  <div className="text-4xl md:text-5xl">🥂</div>
                  <div className="space-y-6 max-w-2xl text-center">
                    <h4 className="font-display text-2xl md:text-3xl text-[var(--dark-green)] font-bold">Personalizovana Organizacija</h4>
                    <p className="text-gray-500 leading-loose text-xs md:text-sm font-medium">Premium slavlja u Indođiji su namenjena za klijente koji žele beskompromisni luksuz i potpunu posvećenost detaljima.</p>
                  </div>
                  <div className="w-full pt-8 md:pt-10 border-t border-gray-200">
                     <a href="tel:+38163558512" className="inline-flex items-center gap-3 md:gap-4 px-10 py-5 md:px-12 md:py-6 bg-[var(--gold)] text-[var(--dark-green)] font-black uppercase tracking-[3px] md:tracking-[4px] text-[10px] md:text-[12px] rounded-full hover:bg-[var(--dark-green)] hover:text-white transition-all shadow-2xl">
                        📞 Pozovi za dogovor
                     </a>
                  </div>
                </div>
              ) : (
                <>
                  <div id="space-step" className="grid md:grid-cols-2 gap-8 md:gap-10">
                    <div className="space-y-6">
                      <label className="text-[10px] md:text-[11px] font-black uppercase tracking-[3px] md:tracking-[4px] text-[var(--gold)]">01 TIP PROSTORA</label>
                      <div className="grid grid-cols-2 gap-3 md:gap-4">
                        {['open', 'closed'].map(type => (
                          <button key={type} onClick={() => setSelectedSpace(type as any)} className={`p-6 md:p-8 rounded-[30px] md:rounded-[40px] border-2 transition-all flex flex-col items-center gap-2 md:gap-3 ${selectedSpace === type ? 'border-[var(--gold)] bg-[var(--gold)]/5' : 'border-gray-50 bg-gray-50 hover:bg-gray-100'}`}>
                            <span className="text-3xl md:text-4xl">{type === 'open' ? '🌳' : '🏠'}</span>
                            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest">{type === 'open' ? 'Otvoreno' : 'Zatvoreno'}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    {selectedSpace && (
                      <div id="guests-step" className="space-y-6">
                        <label className="text-[10px] md:text-[11px] font-black uppercase tracking-[3px] md:tracking-[4px] text-[var(--gold)]">02 BROJ GOSTIJU</label>
                        <div className="bg-gray-50 p-6 md:p-8 rounded-[30px] md:rounded-[40px] border border-gray-100">
                          {activePackage === 'kids' ? (
                            <div className="space-y-5 md:space-y-6">
                              <div>
                                <div className="flex justify-between text-[8px] md:text-[10px] font-black uppercase mb-3 text-gray-400"><span>Deca</span><span className="text-[var(--gold)] font-bold">{childrenCount}</span></div>
                                <input type="range" min="10" max={selectedSpace === 'closed' ? 70 - adultsCount : 200} value={childrenCount} onChange={e => setChildrenCount(parseInt(e.target.value))} className="w-full accent-[var(--gold)]" />
                              </div>
                              <div>
                                <div className="flex justify-between text-[8px] md:text-[10px] font-black uppercase mb-3 text-gray-400"><span>Odrasli</span><span className="text-[var(--gold)] font-bold">{adultsCount}</span></div>
                                <input type="range" min="10" max={selectedSpace === 'closed' ? 70 - childrenCount : 200} value={adultsCount} onChange={e => setAdultsCount(parseInt(e.target.value))} className="w-full accent-[var(--gold)]" />
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-2 md:py-4">
                              <div className="text-5xl md:text-6xl font-display text-[var(--dark-green)] mb-6">{guestCount}</div>
                              <input type="range" min="10" max={selectedSpace === 'closed' ? 70 : 200} value={guestCount} onChange={e => setGuestCount(parseInt(e.target.value))} className="w-full accent-[var(--gold)]" />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {selectedSpace && (
                    <div className="grid md:grid-cols-2 gap-8 md:gap-10 pt-10 border-t border-gray-100">
                      <div id="date-step" className="space-y-6"><label className="text-[10px] md:text-[11px] font-black uppercase tracking-[3px] md:tracking-[4px] text-[var(--gold)]">03 IZABERITE DATUM</label>{renderCalendar()}</div>
                      <div id="slot-step" className="space-y-6">
                        <label className="text-[10px] md:text-[11px] font-black uppercase tracking-[3px] md:tracking-[4px] text-[var(--gold)]">04 IZABERITE TERMIN</label>
                        
                        {activePackage === 'teen' && !teenDuration ? (
                           <div className="grid grid-cols-2 gap-3 md:gap-4 animate-fade-up">
                              {[3, 4].map(d => (
                                 <button key={d} onClick={() => setTeenDuration(d as any)} className="p-6 md:p-8 border-2 border-[var(--gold)]/20 rounded-[24px] md:rounded-[30px] flex flex-col items-center gap-2 md:gap-3 hover:bg-[var(--gold)]/5 transition-all">
                                    <span className="text-2xl md:text-3xl">⏳</span>
                                    <span className="text-[9px] md:text-[11px] font-black uppercase tracking-widest">{d} SATA</span>
                                 </button>
                              ))}
                           </div>
                        ) : selectedDate ? (
                          <div className="flex flex-col gap-3 md:gap-4">
                            {activePackage === 'teen' && (
                               <button onClick={() => { setTeenDuration(null); setSelectedTimeSlot(null); }} className="text-[8px] md:text-[9px] font-black text-[var(--gold)] uppercase text-left mb-2">← Promeni trajanje</button>
                            )}
                            {getAvailableSlots().map(slot => (
                              <button key={slot} onClick={() => { setSelectedTimeSlot(slot); setIsPaymentReady(false); }} className={`p-5 md:p-6 rounded-[20px] md:rounded-[24px] border-2 text-[11px] md:text-[12px] font-black text-left flex justify-between items-center transition-all ${selectedTimeSlot === slot ? 'border-[var(--gold)] bg-[var(--gold)]/5 shadow-xl' : 'border-gray-50 bg-gray-50 hover:bg-gray-100'}`}>
                                <div className="flex flex-col">
                                  <span className="tracking-widest">{slot}</span>
                                  {isHolidayDate(selectedDate) && <span className="text-[7px] md:text-[8px] text-[var(--gold)] font-bold uppercase mt-1">Praznični termin (+70€)</span>}
                                </div>
                                {selectedTimeSlot === slot && <span className="text-[var(--gold)] font-bold">✓</span>}
                              </button>
                            ))}
                          </div>
                        ) : <div className="p-16 md:p-20 border-2 border-dashed border-gray-100 rounded-[30px] md:rounded-[40px] text-center text-gray-300 font-bold uppercase text-[9px] md:text-[10px] tracking-[3px]">Prvo izaberite datum</div>}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {!isSlavlja && (
              <div id="usluge" className="w-full lg:w-[450px] xl:w-[480px] bg-gray-50 p-6 md:p-14 flex flex-col border-t lg:border-t-0">
                 <div className="flex-grow">
                    <h3 className="text-[11px] md:text-[12px] font-black uppercase tracking-[3px] md:tracking-[4px] text-[var(--gold)] mb-8 md:mb-10">05 DODATNE USLUGE</h3>
                    <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 md:gap-5 max-h-[500px] lg:max-h-[480px] overflow-y-auto pr-2 gallery-scroll">
                      {[
                        { id: 'photographer', label: 'Fotograf', desc: 'Na Upit', icon: '📸' },
                        { id: 'decoration', label: 'Dekoracije', desc: 'Na Upit', icon: '✨' },
                        { id: 'catering', label: 'Ketering', desc: 'Na Upit', icon: '🍽️' },
                        { id: 'makeup', label: 'Šminka', desc: 'Na Upit', icon: '💄' },
                        { id: 'dj', label: 'DJ Paket', desc: 'Na Upit', icon: '🎵' },
                        { id: 'waiter', label: 'Konobar', desc: '10€/h', icon: '🤵' },
                        { id: 'tables', label: 'Barski Stolovi', desc: 'Crni/Beli', icon: '🍷' }
                      ].map(item => (
                        <label key={item.id} className="flex flex-col lg:flex-row items-center p-4 lg:p-5 bg-white rounded-2xl lg:rounded-3xl shadow-sm cursor-pointer border-2 border-transparent hover:border-[var(--gold)]/40 transition-all text-center lg:text-left group relative">
                          <input 
                            type="checkbox" 
                            checked={item.id === 'waiter' ? isWaiterEnabled : (extras as any)[item.id]} 
                            onChange={e => {
                              if (item.id === 'waiter') setIsWaiterEnabled(e.target.checked);
                              else setExtras({...extras, [item.id]: e.target.checked});
                            }} 
                            className="hidden" 
                          />
                          <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl overflow-hidden mb-3 lg:mb-0 lg:mr-5 border border-gray-100 flex-shrink-0">
                             <img src={SERVICE_IMAGES[item.id]} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt={item.label} />
                          </div>
                          <div className="flex-grow">
                             <div className="text-[10px] lg:text-[11px] font-black uppercase text-[var(--dark-green)] tracking-widest leading-tight">{item.label}</div>
                             <div className="text-[8px] text-gray-400 font-bold uppercase mt-1">
                               {item.id === 'waiter' && isWaiterEnabled ? `${extras.waiterHours}h` : item.desc}
                             </div>
                          </div>
                          <div className={`w-5 h-5 lg:w-7 lg:h-7 rounded-full border-2 flex items-center justify-center mt-3 lg:mt-0 ${(item.id === 'waiter' ? isWaiterEnabled : (extras as any)[item.id]) ? 'bg-[var(--gold)] border-[var(--gold)] shadow-lg' : 'border-gray-100'}`}>
                             { (item.id === 'waiter' ? isWaiterEnabled : (extras as any)[item.id]) && <span className="text-white text-[9px] lg:text-[12px]">✓</span> }
                          </div>
                        </label>
                      ))}
                      {!isSlavlja && (
                        <div className="col-span-2 lg:col-span-1 space-y-4 pt-4 border-t border-gray-200">
                          {extras.tables > 0 && (
                             <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                               <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">Broj stolova (10€/kom)</div>
                               <div className="flex items-center gap-4">
                                   <button onClick={() => setExtras({...extras, tables: Math.max(0, extras.tables-1)})} className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center font-black hover:bg-gray-100">-</button>
                                   <span className="text-xs font-black w-8 text-center">{extras.tables}</span>
                                   <button onClick={() => setExtras({...extras, tables: extras.tables+1})} className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center font-black hover:bg-gray-100">+</button>
                               </div>
                             </div>
                          )}
                          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">LED piće (0.8€/kg)</div>
                            <div className="flex items-center gap-4">
                                <button onClick={() => setExtras({...extras, ledKg: Math.max(0, extras.ledKg-5)})} className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center font-black hover:bg-gray-100">-</button>
                                <span className="text-xs font-black w-8 text-center">{extras.ledKg}kg</span>
                                <button onClick={() => setExtras({...extras, ledKg: extras.ledKg+5})} className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center font-black hover:bg-gray-100">+</button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                 </div>
                 <div id="form-step" className="mt-10 md:mt-14 pt-8 md:pt-10 border-t border-gray-200">
                    <form ref={formRef} onSubmit={handleBooking} className="space-y-6">
                       <div className="space-y-3">
                          <input name="name" required placeholder="IME I PREZIME" className="w-full p-4 bg-white border border-gray-100 rounded-2xl outline-none focus:border-[var(--gold)] text-[9px] md:text-[11px] font-black uppercase tracking-[2px]" />
                          <input name="phone" required placeholder="KONTAKT TELEFON" className="w-full p-4 bg-white border border-gray-100 rounded-2xl outline-none focus:border-[var(--gold)] text-[9px] md:text-[11px] font-black uppercase tracking-[2px]" />
                       </div>
                       <div className="py-6 border-y border-gray-100 space-y-3">
                          <div className="flex justify-between items-center text-[9px] md:text-[11px] font-black uppercase tracking-[2px] text-gray-400"><span>UKUPNA CENA</span><span>{calculateTotalPrice() + '€'}</span></div>
                          <div className="flex justify-between items-center text-[9px] md:text-[11px] font-black uppercase tracking-[2px] text-green-600"><span>DEPOZIT (SADA)</span><span>{DEPOSIT_AMOUNT}€</span></div>
                          <div className="flex justify-between items-end pt-4"><span className="text-[11px] font-black uppercase tracking-[3px]">OSTATAK</span><span className="text-4xl md:text-5xl font-display text-[var(--dark-green)] font-bold leading-none">{calculateTotalPrice() - DEPOSIT_AMOUNT}€</span></div>
                       </div>
                       {!isPaymentReady ? (
                          <button type="submit" className="w-full py-5 bg-[var(--dark-green)] text-[var(--gold)] font-black rounded-[30px] uppercase tracking-[3px] text-[10px] md:text-[12px] hover:brightness-125 transition-all shadow-2xl">
                            Nastavi Na Plaćanje
                          </button>
                       ) : (
                          <div className="animate-fade-up"><div id="paypal-container-KB6QMB3QM5CP8" ref={paypalContainerRef}></div></div>
                       )}
                    </form>
                 </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. UTISCI */}
      <section id="utisci-sekcija" className="py-24 px-6 md:px-12 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
             <h2 className="font-display text-5xl md:text-8xl text-[var(--dark-green)] leading-none">Utisci Gosti</h2>
             <div className="w-16 md:w-24 h-px bg-[var(--gold)] mx-auto"></div>
             <p className="text-[var(--gold)] font-display italic text-lg md:text-2xl tracking-[2px]">Vaša sreća je naš najveći uspeh</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-16">
             {comments.slice(0, 6).map((c, idx) => (
               <div key={idx} className="bg-gray-50 p-8 md:p-10 rounded-[30px] md:rounded-[40px] shadow-sm border border-gray-100 flex flex-col justify-between group hover:-translate-y-2 transition-all duration-500">
                  <div className="space-y-4 md:space-y-6">
                     <div className="flex text-[var(--gold)] text-lg md:text-xl">{'★'.repeat(c.rating)}{'☆'.repeat(5-c.rating)}</div>
                     <p className="text-gray-600 leading-relaxed italic font-medium text-sm md:text-base">"{c.text}"</p>
                  </div>
                  <div className="pt-6 md:pt-8 mt-6 md:mt-8 border-t border-gray-200 flex items-center gap-3 md:gap-4">
                     <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center font-black text-[var(--gold)] text-[10px] md:text-xs">{c.author[0]}</div>
                     <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[2px] md:tracking-[3px] text-[var(--dark-green)]">{c.author}</span>
                  </div>
               </div>
             ))}
          </div>

          <div className="text-center">
             <button onClick={() => setIsReviewModalOpen(true)} className="px-10 py-5 md:px-14 md:py-6 bg-[var(--gold)] text-[var(--dark-green)] font-black uppercase tracking-[4px] md:tracking-[5px] text-[10px] md:text-[12px] rounded-full hover:bg-[var(--dark-green)] hover:text-white transition-all shadow-2xl">Podeli svoj utisak</button>
          </div>
        </div>
      </section>

      {/* 5. PRAZNICI */}
      <section id="praznici-sekcija" className="py-24 px-6 md:px-12 bg-[var(--dark-green)] text-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-5xl md:text-7xl mb-4">Rezervacija Praznika</h2>
            <div className="w-16 md:w-24 h-px bg-[var(--gold)] mx-auto mb-8"></div>
            <p className="text-[var(--gold)] font-black uppercase tracking-[3px] md:tracking-[4px] text-[10px] md:text-xs">Doživite magiju Indođije tokom posebnih datuma</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 md:mb-16">
             {HOLIDAYS.map(h => (
               <div key={h.name} className="group flex flex-col items-center gap-4 cursor-pointer">
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-[var(--gold)]/40 p-1.5 transition-all duration-500 group-hover:scale-110 group-hover:border-[var(--gold)] group-hover:shadow-[0_0_20px_rgba(200,164,93,0.4)]">
                     <img src={h.img} alt={h.name} className="w-full h-full object-cover rounded-full transition-transform duration-700 group-hover:rotate-6" />
                  </div>
                  <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-center leading-tight text-white/80 group-hover:text-[var(--gold)]">{h.name}</span>
               </div>
             ))}
          </div>

          <div className="bg-white/5 p-8 md:p-14 rounded-[30px] md:rounded-[50px] border border-white/10 text-center space-y-6 md:space-y-8 max-w-3xl mx-auto">
             <div className="space-y-4">
                <p className="text-white font-display text-xl md:text-2xl italic tracking-wider">Planirajte prazničnu čaroliju na vreme.</p>
                <p className="text-white/70 text-[9px] md:text-xs uppercase tracking-widest leading-loose">Praznični termini obuhvataju premium dekoraciju i posebne organizacione detalje.</p>
             </div>
             <a href="tel:+38163558512" className="inline-flex items-center gap-3 md:gap-4 px-10 py-5 md:px-14 md:py-6 bg-[var(--gold)] text-[var(--dark-green)] font-black uppercase tracking-[3px] md:tracking-[4px] text-[10px] md:text-[12px] rounded-full hover:bg-white transition-all shadow-2xl">
                Pozovi Za Dogovor
             </a>
          </div>
        </div>
      </section>

      {/* 6. LOKACIJA */}
      <section id="lokacija-sekcija" className="h-[500px] md:h-[650px] w-full relative">
         <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2817.7144741438615!2d20.058923776708873!3d45.07130285956705!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x475af9b3c8e9392d%3A0xeef7e5250975bc63!2zSU5kb8SRaWph!5e0!3m2!1ssr!2srs!4v1770745011422!5m2!1ssr!2srs" width="100%" height="100%" style={{ border: 0 }} allowFullScreen={true} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="grayscale brightness-75 contrast-125"></iframe>
         <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-[var(--dark-green)] text-[var(--gold)] px-8 md:px-10 py-3 md:py-4 rounded-full font-black uppercase text-[9px] md:text-[11px] tracking-[3px] md:tracking-[4px] shadow-2xl">Naša Lokacija</div>
      </section>

      {/* Footer */}
      <footer id="contact-footer" className="bg-[var(--dark-green)] pt-24 md:pt-40 pb-16 px-6 md:px-12 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-24 mb-24 md:mb-32 text-center md:text-left">
            <div className="space-y-8 md:space-y-10 flex flex-col items-center md:items-start">
               <div className="w-20 h-20 md:w-24 md:h-24 border border-white/10 rounded-full overflow-hidden grayscale hover:grayscale-0 transition-all duration-700 mb-4 md:mb-6 bg-[var(--dark-green)] flex items-center justify-center">
                 <img src={getImgPath("slike/galerija/logo.jpg")} alt="Indođija Logo" className="w-full h-full object-cover" />
               </div>
               <p className="text-white/30 text-[9px] md:text-[11px] leading-loose uppercase tracking-[2px] md:tracking-[3px]">Inđijski premium event vrt. Vaše uspomene zaslužuju luksuz koji pruža Indođija.</p>
            </div>
            <div className="space-y-8 md:space-y-10">
               <h4 className="text-[var(--gold)] font-black uppercase tracking-[4px] md:tracking-[5px] text-[10px] md:text-xs">Kontakt</h4>
               <div className="space-y-4 md:space-y-6">
                  <a href="tel:+38163558512" className="text-2xl md:text-3xl font-display italic tracking-[1px] md:tracking-[2px] block hover:text-[var(--gold)] transition-colors">+381 63 558 512</a>
                  <p className="text-white/50 text-[9px] md:text-[11px] uppercase tracking-widest font-bold">info@indodjija.rs</p>
               </div>
            </div>
            <div className="space-y-8 md:space-y-10">
               <h4 className="text-[var(--gold)] font-black uppercase tracking-[4px] md:tracking-[5px] text-[10px] md:text-xs">Adresa</h4>
               <p className="text-white/50 text-[9px] md:text-[11px] uppercase tracking-widest font-bold leading-loose">Vocarska 75<br/> 22320 Inđija, Srbija</p>
            </div>
            <div className="space-y-8 md:space-y-10">
               <h4 className="text-[var(--gold)] font-black uppercase tracking-[4px] md:tracking-[5px] text-[10px] md:text-xs">Pratite Nas</h4>
               <div className="flex justify-center md:justify-start gap-5 md:gap-6">
                 <a href="https://www.instagram.com/indodjija023/" target="_blank" className="w-12 h-12 md:w-14 md:h-14 rounded-full border border-white/10 flex items-center justify-center hover:bg-[var(--gold)] hover:text-[var(--dark-green)] transition-all">
                    <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                 </a>
                 <a href="https://www.tiktok.com/@indodjija023" target="_blank" className="w-12 h-12 md:w-14 md:h-14 rounded-full border border-white/10 flex items-center justify-center hover:bg-[var(--gold)] hover:text-[var(--dark-green)] transition-all">
                    <svg width="18" height="18" fill="currentColor" viewBox="0 0 448 512"><path d="M448 209.91a210.06 210.06 0 0 1-122.77-39.25V349.38A162.55 162.55 0 1 1 185 188.31V278.2a74.62 74.62 0 1 0 52.23 71.18V0l88 0a121.18 121.18 0 0 0 1.86 22.17A122.18 122.18 0 0 0 381 102.39a121.43 121.43 0 0 0 67 20.14z"/></svg>
                 </a>
                 <a href="https://www.facebook.com" className="w-12 h-12 md:w-14 md:h-14 rounded-full border border-white/10 flex items-center justify-center hover:bg-[var(--gold)] hover:text-[var(--dark-green)] transition-all">
                    <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.324v-21.35c0-.732-.593-1.325-1.325-1.325z"/></svg>
                 </a>
               </div>
            </div>
          </div>
          <div className="pt-12 md:pt-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 md:gap-10 text-[8px] md:text-[10px] font-black uppercase tracking-[4px] md:tracking-[6px] text-white/20">
            <nav className="flex flex-wrap justify-center gap-8 md:gap-12">
               <span className="hover:text-[var(--gold)] cursor-pointer" onClick={() => scrollTo('hero')}>Početna</span>
               <span className="hover:text-[var(--gold)] cursor-pointer" onClick={() => scrollTo('ponude')}>Ponude</span>
               <span className="hover:text-[var(--gold)] cursor-pointer" onClick={() => setIsPrivacyOpen(true)}>Privatnost</span>
               <span className="hover:text-[var(--gold)] cursor-pointer" onClick={() => setIsRulesOpen(true)}>Pravila</span>
               <span className="hover:text-[var(--gold)] cursor-pointer text-[var(--gold)]" onClick={() => setIsAdminOpen(true)}>Admin</span>
            </nav>
            <p className="tracking-[3px] md:tracking-[4px] text-center md:text-left">© 2026 Indođija Luxury. Sva prava zadržana.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
