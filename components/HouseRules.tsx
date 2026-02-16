
import React from 'react';

interface HouseRulesProps {
  onClose: () => void;
}

const HouseRules: React.FC<HouseRulesProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[2000] bg-[#1f2e2a]/95 flex items-center justify-center p-6 overflow-y-auto">
      <div className="bg-white p-10 md:p-16 rounded-[40px] shadow-2xl w-full max-w-4xl border border-gray-100 animate-fade-up relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-8 right-8 text-gray-400 hover:text-[#c8a45d] transition-colors text-3xl font-black">✕</button>
        
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="font-display text-4xl text-[#1f2e2a] font-bold mb-4">Pravila Kuće</h2>
            <div className="w-16 h-px bg-[#c8a45d] mx-auto mb-10"></div>
          </div>

          <div className="text-gray-600 space-y-6 text-sm leading-relaxed">
            <section>
              <h3 className="font-black uppercase tracking-widest text-[#c8a45d] text-xs mb-3">1. MATERIJALNA ODGOVORNOST</h3>
              <p>Zakupac prostora preuzima punu materijalnu odgovornost za svu štetu nastalu na inventaru, opremi ili samom objektu tokom trajanja zakupa. Sva oštećenja biće procenjena i naplaćena odmah po završetku termina po važećem cenovniku reparacije.</p>
            </section>

            <section>
              <h3 className="font-black uppercase tracking-widest text-[#c8a45d] text-xs mb-3">2. PAKOVANJE PIĆA I POSLUŽENJA</h3>
              <p>Gosti i organizatori su u obavezi da počnu sa pakovanjem preostalog pića, hrane i ličnih stvari najkasnije <strong>10 minuta pre zvaničnog završetka</strong> zakupljenog termina, kako bi se prostor predao u dogovoreno vreme.</p>
            </section>

            <section>
              <h3 className="font-black uppercase tracking-widest text-[#c8a45d] text-xs mb-3">3. NAPUŠTANJE PROSTORA</h3>
              <p>Napuštanje vrta i unutrašnjeg prostora je obavezno najkasnije <strong>5 minuta nakon isteka</strong> zakupljenog vremena. Svako prekoračenje može biti dodatno naplaćeno ili uticati na proslave koje slede.</p>
            </section>

            <section>
              <h3 className="font-black uppercase tracking-widest text-[#c8a45d] text-xs mb-3">4. KUĆNI RED I MIR</h3>
              <p>Indođija Luxury Event Garden poštuje susede i lokalnu zajednicu. Prekomerna buka, neprimereno ponašanje ili upotreba pirotehnike bez prethodne dozvole nisu dozvoljeni.</p>
            </section>

            <section>
              <h3 className="font-black uppercase tracking-widest text-[#c8a45d] text-xs mb-3">5. BEZBEDNOST</h3>
              <p>Uprava ne snosi odgovornost za izgubljene ili zaboravljene stvari u krugu vrta. Molimo vas da vodite računa o svojim dragocenostima.</p>
            </section>
          </div>

          <div className="pt-8 border-t border-gray-100 flex justify-center">
            <button onClick={onClose} className="px-12 py-4 bg-[#1f2e2a] text-[#c8a45d] font-black uppercase tracking-widest text-[11px] rounded-full shadow-xl">Razumem i prihvatam</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HouseRules;
