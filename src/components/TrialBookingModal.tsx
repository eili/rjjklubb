import React, { useState } from 'react';
import { ClubConfig } from '../types';
import { X, CheckCircle2, Calendar, User, Phone, Mail, Sparkles, ChevronRight } from 'lucide-react';
import confetti from 'canvas-confetti';

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

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) return;

    try {
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

  const handleResetAndClose = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-stone-200 shadow-2xl overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-stone-900 text-white p-5 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-stone-950 flex items-center justify-center font-bold text-sm">
              柔
            </div>
            <div>
              <h3 className="font-heading font-bold text-sm text-white">Gratis Prøvetime</h3>
              <p className="text-[11px] text-stone-400">{clubConfig.clubName}</p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          /* Confirmation Screen */
          <div className="p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h4 className="font-heading text-2xl font-bold text-stone-900">
                Velkommen til oss, {form.name}!
              </h4>
              <p className="text-xs text-stone-600 mt-2 leading-relaxed max-w-sm mx-auto">
                Vi har registrert din påmelding til prøvetime for <strong>{form.group}</strong> ({form.preferredDay}). 
                {clubConfig.contactPerson.name} kontakter deg på {form.phone} dersom du har spørsmål.
              </p>
            </div>

            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 text-left text-xs space-y-1.5 text-stone-600">
              <p className="font-bold text-stone-900">Husk til første trening:</p>
              <p>• Vanlig t-skjorte og lang treningsbukse (joggebukse)</p>
              <p>• Vannflaske og godt humør</p>
              <p>• Vi trener barbent på tatamien (ingen sko)</p>
              <p>• Møt opp 10–15 minutter før start i {clubConfig.dojoAddress.street}</p>
            </div>

            <button
              onClick={handleResetAndClose}
              className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl"
            >
              Flott, vi ses på matten!
            </button>
          </div>
        ) : (
          /* Booking Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-500"
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
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">E-postadresse</label>
                  <input
                    type="email"
                    placeholder="ola@example.no"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">Ønsket parti</label>
                  <select
                    value={form.group}
                    onChange={(e) => setForm({ ...form, group: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-500"
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
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-500"
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

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Bekreft gratis prøvetime</span>
                <ChevronRight className="w-4 h-4 text-stone-900" />
              </button>
              <p className="text-[10px] text-stone-400 text-center mt-2">
                100% uforpliktende • Ingen medlemskapsbinding
              </p>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
