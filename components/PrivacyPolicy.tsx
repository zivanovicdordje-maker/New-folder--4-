
import React from 'react';

interface PrivacyPolicyProps {
  onClose: () => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[2000] bg-[#1f2e2a]/95 flex items-center justify-center p-6 overflow-y-auto">
      <div className="bg-white p-10 md:p-16 rounded-[40px] shadow-2xl w-full max-w-4xl border border-gray-100 animate-fade-up relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-8 right-8 text-gray-400 hover:text-[#c8a45d] transition-colors text-3xl font-black">✕</button>
        
        <div className="space-y-12">
          {/* USLOVI ZAKUPA */}
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="font-display text-3xl md:text-4xl text-[#1f2e2a] font-bold mb-4">Opšti uslovi zakupa</h2>
              <div className="w-16 h-px bg-[#c8a45d] mx-auto mb-6"></div>
            </div>

            <div className="text-gray-600 space-y-6 text-sm leading-relaxed">
              <section>
                <h3 className="font-black uppercase tracking-widest text-[#c8a45d] text-xs mb-3">Član 1 – Predmet zakupa</h3>
                <p>Indođija Luxury Event Garden (projekat u osnivanju) daje u zakup prostor za organizaciju privatnih događaja (rođendani, proslave, korporativni eventi i drugi događaji). Zakupac potvrđuje da je upoznat sa svim pravilima korišćenja prostora i da ih u potpunosti prihvata.</p>
              </section>

              <section>
                <h3 className="font-black uppercase tracking-widest text-[#c8a45d] text-xs mb-3">Član 2 – Rezervacija i depozit</h3>
                <p>Rezervacija termina postaje važeća isključivo nakon uplate depozita u minimalnom iznosu od 30€. Depozit se ne vraća ni u kom slučaju. Depozit se uračunava u ukupnu cenu zakupa i služi za potvrdu rezervacije.</p>
              </section>

              <section>
                <h3 className="font-black uppercase tracking-widest text-[#c8a45d] text-xs mb-3">Član 3 – Odgovornost zakupca</h3>
                <p>Zakupac preuzima punu materijalnu odgovornost za štetu na inventaru, opremi, dekoraciji ili samom objektu, kao i štetu nastalu od strane gostiju. Sva oštećenja biće procenjena i naplaćena odmah po završetku termina prema važećem cenovniku ili tržišnoj vrednosti.</p>
              </section>

              <section>
                <h3 className="font-black uppercase tracking-widest text-[#c8a45d] text-xs mb-3">Član 4 – Dečiji rođendani</h3>
                <p>Zakupac (roditelj/staratelj) je dužan da obezbedi stalni nadzor dece. Sve dečije igračke, animacije i rekviziti moraju biti vraćeni na svoje mesto u ispravnom stanju. U slučaju nestanka ili oštećenja, zakupac je dužan da nadoknadi punu vrednost istih. Indođija Luxury Event Garden ne snosi odgovornost za povrede dece nastale usled nepažnje ili nedostatka nadzora.</p>
              </section>

              <section>
                <h3 className="font-black uppercase tracking-widest text-[#c8a45d] text-xs mb-3">Član 5 – Bezbednost i zabrane</h3>
                <p>Zabranjeno je: unošenje oružja i opasnih predmeta, upotreba pirotehnike, namerno oštećivanje inventara, neprimereno i nasilno ponašanje. U slučaju ozbiljnog kršenja pravila, organizator zadržava pravo da prekine događaj bez povraćaja novca.</p>
              </section>

              <section>
                <h3 className="font-black uppercase tracking-widest text-[#c8a45d] text-xs mb-3">Član 6 – Lična imovina</h3>
                <p>Davalac prostora ne odgovara za gubitak, krađu ili oštećenje ličnih stvari zakupca ili gostiju.</p>
              </section>
            </div>
          </div>

          <div className="w-full h-px bg-gray-100"></div>

          {/* POLITIKA PRIVATNOSTI */}
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="font-display text-3xl md:text-4xl text-[#1f2e2a] font-bold mb-4">Politika privatnosti</h2>
              <div className="w-16 h-px bg-[#c8a45d] mx-auto mb-6"></div>
            </div>

            <div className="text-gray-600 space-y-6 text-sm leading-relaxed">
              <section>
                <h3 className="font-black uppercase tracking-widest text-[#c8a45d] text-xs mb-3">2.1 Opšte informacije</h3>
                <p>Indođija Luxury Event Garden (projekat u osnivanju) posvećen je zaštiti privatnosti svojih korisnika. Ova Politika privatnosti objašnjava koje podatke prikupljamo, kako ih koristimo i koliko dugo ih čuvamo. Korišćenjem sajta ili rezervacijom termina potvrđujete da ste saglasni sa ovom Politikom privatnosti.</p>
              </section>

              <section>
                <h3 className="font-black uppercase tracking-widest text-[#c8a45d] text-xs mb-3">2.2 Podaci koje prikupljamo</h3>
                <p>Prikupljamo isključivo podatke neophodne za realizaciju rezervacije i komunikaciju: Ime i prezime, Broj telefona, E-mail adresu, Informacije o događaju (datum, tip proslave, broj gostiju). Ne prikupljamo osetljive lične podatke.</p>
              </section>

              <section>
                <h3 className="font-black uppercase tracking-widest text-[#c8a45d] text-xs mb-3">2.3 Svrha i pravni osnov obrade</h3>
                <p>Podaci se koriste isključivo za: potvrdu i realizaciju rezervacije, komunikaciju u vezi sa događajem, evidenciju uplata depozita. Pravni osnov obrade je izvršenje dogovora (rezervacije) i legitimni interes organizatora u vezi sa realizacijom usluge.</p>
              </section>

              <section>
                <h3 className="font-black uppercase tracking-widest text-[#c8a45d] text-xs mb-3">2.4 Deljenje podataka</h3>
                <p>Podaci se ne prodaju niti ustupaju trećim licima u marketinške svrhe. Podaci se mogu proslediti eksternim servisima za obradu plaćanja (npr. PayPal) isključivo radi realizacije transakcije.</p>
              </section>

              <section>
                <h3 className="font-black uppercase tracking-widest text-[#c8a45d] text-xs mb-3">2.5 Rok čuvanja podataka</h3>
                <p>Podaci se čuvaju samo onoliko dugo koliko je potrebno za realizaciju događaja i zakonske obaveze. Nakon toga se brišu ili anonimizuju.</p>
              </section>

              <section>
                <h3 className="font-black uppercase tracking-widest text-[#c8a45d] text-xs mb-3">2.6 Zaštita podataka</h3>
                <p>Preduzimamo odgovarajuće tehničke i organizacione mere kako bismo sprečili neovlašćen pristup, zloupotrebu, gubitak ili izmenu podataka.</p>
              </section>

              <section>
                <h3 className="font-black uppercase tracking-widest text-[#c8a45d] text-xs mb-3">2.7 Vaša prava</h3>
                <p>Korisnik ima pravo da: zatraži pristup svojim podacima, zatraži ispravku netačnih podataka, zatraži brisanje podataka, ograniči obradu podataka, podnese pritužbu nadležnom organu za zaštitu podataka.</p>
              </section>

              <section>
                <h3 className="font-black uppercase tracking-widest text-[#c8a45d] text-xs mb-3">2.8 Kolačići (Cookies)</h3>
                <p>Sajt može koristiti tehničke i analitičke kolačiće. Korisnik će biti obavešten o upotrebi kolačića na sajtu.</p>
              </section>

              <section>
                <h3 className="font-black uppercase tracking-widest text-[#c8a45d] text-xs mb-3">2.9 Kontakt</h3>
                <p>Za sva pitanja u vezi sa privatnošću i podacima kontaktirajte nas na: <strong>indodjija023@gmail.com</strong></p>
              </section>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-100 flex justify-center pb-4">
            <button onClick={onClose} className="px-12 py-4 bg-[#1f2e2a] text-[#c8a45d] font-black uppercase tracking-widest text-[11px] rounded-full shadow-xl hover:brightness-125 transition-all">Razumem i prihvatam</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
