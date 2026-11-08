import React, { useState } from 'react';
import { ClubConfig, PageTab } from '../types';
import { 
  Phone, 
  Mail, 
  MapPin, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  User, 
  ShieldCheck, 
  ChevronRight,
  Send
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ContactSectionProps {
  clubConfig: ClubConfig;
  onSelectTab: (tab: PageTab) => void;
  onOpenTrial: () => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  clubConfig,
  onSelectTab,
  onOpenTrial,
}) => {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [contactData, setContactData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Generelt spørsmål',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactData.name || !contactData.message) return;

    try {
      confetti({
        particleCount: 60,
        spread: 50,
        origin: { y: 0.7 },
      });
    } catch {
      // ignore
    }

    setFormSubmitted(true);
  };

  return (
    <div className="bg-stone-50 text-stone-900 min-h-screen">
      {/* Top Banner */}
      <section className="bg-stone-900 text-stone-100 py-16 border-b border-stone-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-800 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-4 border border-stone-700">
            <Phone className="w-3.5 h-3.5" />
            <span>Kontakt & Veiledning</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
            Kontakt Oss
          </h1>
          <p className="text-stone-300 text-base sm:text-lg max-w-3xl leading-relaxed">
            Lurer du på noe om medlemskap, prøvetimer, alderstilpasning eller sommerleiren? 
            Vår kontaktperson og instruktører svarer gjerne på dine spørsmål.
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
          
          {/* Left: Contact Person Spotlight Card (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-7 shadow-sm space-y-6">
              <div>
                <span className="text-[10px] font-mono text-amber-700 font-bold uppercase tracking-wider block">
                  Klubbleder & Kontaktperson
                </span>
                <h3 className="font-heading text-2xl font-bold text-stone-900 mt-1">
                  {clubConfig.contactPerson.name}
                </h3>
                <p className="text-xs text-stone-500 font-medium">
                  {clubConfig.contactPerson.role}
                </p>
              </div>

              <div className="space-y-3.5 text-xs text-stone-700">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 border border-stone-100">
                  <Phone className="w-4 h-4 text-amber-600 shrink-0" />
                  <div>
                    <span className="text-stone-400 text-[10px] block">Telefon:</span>
                    <a href={`tel:${clubConfig.contactPerson.phone}`} className="font-bold text-stone-900 hover:text-amber-600">
                      {clubConfig.contactPerson.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 border border-stone-100">
                  <Mail className="w-4 h-4 text-amber-600 shrink-0" />
                  <div>
                    <span className="text-stone-400 text-[10px] block">E-post:</span>
                    <a href={`mailto:${clubConfig.contactPerson.email}`} className="font-bold text-stone-900 hover:text-amber-600">
                      {clubConfig.contactPerson.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 border border-stone-100">
                  <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                  <div>
                    <span className="text-stone-400 text-[10px] block">Dojo-adresse:</span>
                    <span className="font-medium text-stone-900">
                      {clubConfig.dojoAddress.street}, {clubConfig.dojoAddress.city}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 border border-stone-100">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <div>
                    <span className="text-stone-400 text-[10px] block">Svartid:</span>
                    <span className="font-medium text-stone-900">
                      Vanligvis innen 24 timer alle hverdager
                    </span>
                  </div>
                </div>
              </div>

              {/* Vipps quick reference */}
              <div className="p-4 rounded-xl bg-[#ff5b24]/10 border border-[#ff5b24]/30 text-xs">
                <span className="font-bold text-[#ff5b24] block">Vippsnummer:</span>
                <span className="font-mono text-base font-extrabold text-stone-900">
                  #{clubConfig.vippsNumber}
                </span>
                <p className="text-[11px] text-stone-600 mt-1">
                  Merk alltid innbetaling med utøvers fulle navn.
                </p>
              </div>

              <button
                onClick={onOpenTrial}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all shadow cursor-pointer"
              >
                Meld på gratis prøvetime
              </button>
            </div>
          </div>

          {/* Right: Message Form (7 cols) */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-sm">
              <h3 className="font-heading font-bold text-xl text-stone-900 mb-2">
                Send oss en henvendelse
              </h3>
              <p className="text-xs text-stone-500 mb-6">
                Fyll ut skjemaet så tar vi kontakt med deg så snart som mulig.
              </p>

              {formSubmitted ? (
                <div className="bg-stone-50 border border-emerald-500/40 p-8 rounded-2xl text-center space-y-4">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="font-heading font-bold text-lg text-stone-900">
                    Tusen takk, {contactData.name}!
                  </h4>
                  <p className="text-xs text-stone-600 max-w-sm mx-auto leading-relaxed">
                    Henvendelsen din er mottatt. Vi vil svare deg per e-post ({contactData.email || 'din e-post'}) 
                    eller telefon så snart vi kan.
                  </p>
                  <button
                    onClick={() => {
                      setFormSubmitted(false);
                      setContactData({ name: '', email: '', phone: '', subject: 'Generelt spørsmål', message: '' });
                    }}
                    className="px-4 py-2 bg-stone-900 text-white font-bold text-xs rounded-xl"
                  >
                    Send ny melding
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">Ditt navn *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ola Nordmann"
                        value={contactData.name}
                        onChange={(e) => setContactData({ ...contactData, name: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">E-postadresse *</label>
                      <input
                        type="email"
                        required
                        placeholder="ola@example.no"
                        value={contactData.email}
                        onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">Telefonnummer</label>
                      <input
                        type="tel"
                        placeholder="+47 000 00 000"
                        value={contactData.phone}
                        onChange={(e) => setContactData({ ...contactData, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">Hva gjelder henvendelsen?</label>
                      <select
                        value={contactData.subject}
                        onChange={(e) => setContactData({ ...contactData, subject: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-500"
                      >
                        <option>Generelt spørsmål</option>
                        <option>Prøvetime & Nybegynnerkurs</option>
                        <option>Barn & Ungdomspartiet</option>
                        <option>Sommerleir 2026 med Soke Yamaue</option>
                        <option>Kontingent & Vipps-betaling</option>
                        <option>Bedriftstrening & Selvforsvarskurs</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">Din melding *</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Skriv din melding her..."
                      value={contactData.message}
                      onChange={(e) => setContactData({ ...contactData, message: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5 text-amber-400" />
                    <span>Send henvendelse</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* FAQ section */}
        <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-sm">
          <h3 className="font-heading font-bold text-xl text-stone-900 mb-6">
            Ofte Stilte Spørsmål (FAQ)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-stone-600">
            <div className="space-y-1.5 p-4 rounded-xl bg-stone-50 border border-stone-100">
              <h4 className="font-bold text-stone-900 text-sm">
                Må jeg være i god form for å begynne?
              </h4>
              <p className="leading-relaxed">
                Nei, absolutt ikke! Formen, styrken og smidigheten bygger du opp gradvis på matten. 
                Våre teknikker baserer seg på biomekanikk fremfor rå styrke.
              </p>
            </div>

            <div className="space-y-1.5 p-4 rounded-xl bg-stone-50 border border-stone-100">
              <h4 className="font-bold text-stone-900 text-sm">
                Hva er aldersgrensen?
              </h4>
              <p className="leading-relaxed">
                Vi har barnegrupper fra 8 år, ungdomsgrupper (13–17 år) og voksengrupper fra 18 til 70+ år. 
                Kampsport er en livslang vei uansett alder.
              </p>
            </div>

            <div className="space-y-1.5 p-4 rounded-xl bg-stone-50 border border-stone-100">
              <h4 className="font-bold text-stone-900 text-sm">
                Er det farlig eller mye skader?
              </h4>
              <p className="leading-relaxed">
                Tradisjonell Ju Jitsu hos oss har svært lav skadefrekvens. Første bud er alltid 
                respekt, god oppvarming og kontrollert utførelse med umiddelbar klapp-ut (mairi).
              </p>
            </div>

            <div className="space-y-1.5 p-4 rounded-xl bg-stone-50 border border-stone-100">
              <h4 className="font-bold text-stone-900 text-sm">
                Kan jeg gradere meg videre i stilarten?
              </h4>
              <p className="leading-relaxed">
                Ja, vi har faste graderinger ved semesterslutt, og Dan-graderinger (sorte belter) 
                administreres direkte under Soke Yamaue på sommerleiren i Risørhallen.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
