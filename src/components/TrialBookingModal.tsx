import React, { useState, useEffect } from 'react';
import { ClubConfig } from '../types';
import { X, CheckCircle2, ChevronRight, ArrowLeft } from 'lucide-react';
import confetti from 'canvas-confetti';
import { submitTrialBookingToFirestore } from '../lib/firebase';

interface TrialBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  clubConfig: ClubConfig;
}

export const TrialBookingModal: React.FC<TrialBookingModalProps> = ({
  isOpen,
  onClose,
  clubConfig,
}) => {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    group: 'Voksne Nybegynnere',
    preferredDay: 'Mandag kl 18:45',
    experience: 'Ingen tidligere erfaring',
    message: '',
  });

  const handleResetAndClose = () => {
    setSubmitted(false);
    onClose();
  };

  // Keyboard shortcut (Escape) & prevent body background scroll when open
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleResetAndClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) return;

    try {
      submitTrialBookingToFirestore({
        name: form.name,
        email: form.email,
        phone: form.phone,
        ageGroup: form.group,
        preferredDay: form.preferredDay,
        experience: form.experience,
        message: form.message,
      });
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#10b981', '#3b82f6'],
      });
    } catch {
      // ignore
    }

    setSubmitted(true);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
      onClick={handleResetAndClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="trial-modal-title"
    >
      <div 
        className="bg-white rounded-3xl max-w-lg w-full border border-stone-200 shadow-2xl overflow-hidden relative my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Fixed at top */}
        <div className="bg-stone-900 text-white px-5 py-4 flex items-center justify-between border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-stone-950 flex items-center justify-center font-bold text-sm">
              柔
            </div>
            <div>
              <h3 id="trial-modal-title" className="font-heading font-bold text-sm text-white">
                Gratis Prøvetime
              </h3>
              <p className="text-[11px] text-stone-400">{clubConfig.clubName}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleResetAndClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white transition-all border border-stone-700 text-xs font-semibold cursor-pointer shadow-sm active:scale-95"
            aria-label="Lukk prøvetime-vindu"
          >
            <span>Lukk</span>
            <X className="w-4 h-4 text-stone-300" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-4 flex-1">
          {submitted ? (
            /* Confirmation Screen */
            <div className="text-center space-y-5 py-2">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h4 className="font-heading text-2xl font-bold text-stone-900">
                  Velkommen til oss, {form.name}!
                </h4>
                <p className="text-xs text-stone-600 mt-2 leading-relaxed max-w-sm mx-auto">
                  Vi har registrert din påmelding til prøvetime for <strong>{form.group}</strong> ({form.preferredDay}). 
                  Klubbleder {clubConfig.contactPerson.name} kontakter deg på {form.phone} dersom du har spørsmål.
                </p>
              </div>

              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 text-left text-xs space-y-1.5 text-stone-600">
                <p className="font-bold text-stone-900">Husk til første trening:</p>
                <p>• Vanlig t-skjorte og lang treningsbukse (joggebukse)</p>
                <p>• Vannflaske og godt humør</p>
                <p>• Vi trener barbent på tatamien (ingen sko)</p>
                <p>• Møt opp 10–15 minutter før start i {clubConfig.dojoAddress.street}</p>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="w-full py-3.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Flott, vi ses på matten! (Lukk)</span>
                </button>
              </div>
            </div>
          ) : (
            /* Booking Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <h4 className="font-heading font-bold text-lg text-stone-900">
                  Meld deg på uforpliktende prøvetime
                </h4>
                <p className="text-xs text-stone-500 mt-0.5">
                  Ingen forkunnskaper kreves. Både barn, ungdom og voksne er velkomne.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">Fullt navn *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ola Nordmann"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">Telefonnummer *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+47 000 00 000"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">E-postadresse</label>
                    <input
                      type="email"
                      placeholder="ola@example.no"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">Ønsket parti</label>
                    <select
                      value={form.group}
                      onChange={(e) => setForm({ ...form, group: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-500"
                    >
                      <option>Voksne Nybegynnere (14+ år)</option>
                      <option>Barn & Ungdom (8-13 år)</option>
                      <option>Viderekomne & Sortbelter</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">Ønsket tidspunkt</label>
                    <select
                      value={form.preferredDay}
                      onChange={(e) => setForm({ ...form, preferredDay: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-500"
                    >
                      <option>Mandag kl 18:45 (Voksne)</option>
                      <option>Mandag kl 17:30 (Barn)</option>
                      <option>Torsdag kl 18:30 (Felles/Nybegynner)</option>
                      <option>Lørdag kl 11:00 (Åpen matte)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">Eventuell kommentar / spørsmål</label>
                  <textarea
                    rows={2}
                    placeholder="Har du skader vi bør vite om, eller spørsmål?"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Bekreft gratis prøvetime</span>
                  <ChevronRight className="w-4 h-4 text-stone-900" />
                </button>

                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="w-full py-2.5 text-xs bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl transition-colors border border-stone-300 cursor-pointer flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Avbryt og gå tilbake</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
