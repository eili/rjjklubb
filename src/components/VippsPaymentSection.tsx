import React, { useState } from 'react';
import { VippsProduct, ClubConfig, PageTab } from '../types';
import { VippsQRCode } from './VippsQRCode';
import { 
  QrCode, 
  Smartphone, 
  Check, 
  ShieldCheck, 
  HelpCircle, 
  Sparkles, 
  ArrowRight,
  CreditCard,
  HeartHandshake
} from 'lucide-react';

interface VippsPaymentSectionProps {
  products: VippsProduct[];
  clubConfig: ClubConfig;
  onPayVipps: (product: VippsProduct) => void;
  onSelectTab: (tab: PageTab) => void;
}

export const VippsPaymentSection: React.FC<VippsPaymentSectionProps> = ({
  products,
  clubConfig,
  onPayVipps,
  onSelectTab,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('alle');
  const [customAmount, setCustomAmount] = useState<string>('250');
  const [customNote, setCustomNote] = useState<string>('Dojo-kaffe og støttebidrag');

  const categories = [
    { id: 'alle', label: 'Alle betalinger' },
    { id: 'kontingent', label: 'Semesterkontingent' },
    { id: 'leir', label: 'Sommerleir 2026' },
    { id: 'utstyr', label: 'Drakt & Utstyr' },
    { id: 'annet', label: 'Støtte & Annet' },
  ];

  const filteredProducts = products.filter(
    (p) => selectedCategory === 'alle' || p.category === selectedCategory
  );

  const handleCustomVipps = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseInt(customAmount, 10);
    if (!amountNum || amountNum <= 0) return;

    onPayVipps({
      id: 'custom-' + Date.now(),
      title: customNote || 'Valgfri innbetaling',
      category: 'annet',
      amount: amountNum,
      description: `Egendefinert beløp via Vipps til ${clubConfig.clubName}`,
    });
  };

  return (
    <div className="bg-stone-50 text-stone-900 min-h-screen">
      {/* Top Banner */}
      <section className="bg-stone-900 text-stone-100 py-16 border-b border-stone-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff5b24]/20 text-[#ff5b24] text-xs font-semibold uppercase tracking-wider mb-4 border border-[#ff5b24]/30">
            <QrCode className="w-3.5 h-3.5" />
            <span>Offisiell Vipps-Betaling</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
            Betaling & Medlemskontingent
          </h1>
          <p className="text-stone-300 text-base sm:text-lg max-w-3xl leading-relaxed">
            Hos {clubConfig.clubName} gjør vi det enkelt for medlemmer og foresatte. 
            Skann QR-koden direkte med Vipps på telefonen, eller velg ønsket kontingent nedenfor.
          </p>
        </div>
      </section>

      {/* Quick Vipps Standout Box */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white rounded-3xl p-6 sm:p-8 border border-stone-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          
          <div className="space-y-3 max-w-lg">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-[#ff5b24] text-white flex items-center justify-center font-bold text-sm">
                v:
              </span>
              <span className="font-bold tracking-wide text-sm text-stone-300 uppercase">
                Vipps Bedriftsnummer
              </span>
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-white">
              Vipps til <span className="text-[#ff5b24]">#{clubConfig.vippsNumber}</span>
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Dette er klubbens offisielle Vippsnummer godkjent for idrettslag. 
              Du kan når som helst åpne Vipps på mobilen, søke opp <strong>#{clubConfig.vippsNumber}</strong> 
              eller skanne QR-koden ved siden av.
            </p>
            <div className="pt-2 flex flex-wrap gap-4 text-xs text-stone-400">
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400" />
                Ingen gebyrer for medlemmer
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400" />
                Automatisk kvittering i appen
              </span>
            </div>
          </div>

          {/* Quick interactive QR card */}
          <div className="shrink-0">
            <VippsQRCode
              value={`vipps://pay?recipient=${clubConfig.vippsNumber}`}
              size={170}
              vippsNumber={clubConfig.vippsNumber}
              title="Skann for å åpne Vipps"
            />
          </div>
        </div>
      </section>

      {/* Product Categories & Grid */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Category switcher */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Product Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredProducts.map((prod) => (
            <div
              key={prod.id}
              className={`bg-white rounded-2xl border p-6 flex flex-col justify-between transition-all hover:shadow-md ${
                prod.popular
                  ? 'border-amber-500/80 ring-1 ring-amber-500/30'
                  : 'border-stone-200 hover:border-stone-300'
              }`}
            >
              <div>
                {prod.popular && (
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-800 mb-3">
                    Mest populær
                  </span>
                )}
                <h3 className="font-heading font-bold text-base text-stone-900 mb-1">
                  {prod.title}
                </h3>
                <p className="text-xs text-stone-500 leading-relaxed mb-4">
                  {prod.description}
                </p>
              </div>

              <div className="pt-4 border-t border-stone-100">
                <div className="flex items-baseline justify-between mb-4">
                  <span className="text-xs text-stone-500 font-medium">Pris:</span>
                  <span className="text-2xl font-black text-stone-900">
                    {prod.amount.toLocaleString('no-NO')} <span className="text-sm font-bold text-stone-600">kr</span>
                  </span>
                </div>

                <button
                  onClick={() => onPayVipps(prod)}
                  className="w-full py-2.5 bg-[#ff5b24] hover:bg-[#e04814] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Betal med Vipps</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Custom amount section */}
        <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-sm">
          <div className="max-w-xl">
            <div className="flex items-center gap-2.5 mb-2">
              <HeartHandshake className="w-5 h-5 text-[#ff5b24]" />
              <h3 className="font-heading font-bold text-lg text-stone-900">
                Valgfritt Beløp / Donasjon / Kiosk
              </h3>
            </div>
            <p className="text-xs text-stone-600 mb-4 leading-relaxed">
              Skal du betale for dojo-kaffe, graderingsavgift eller gi et støttebidrag til klubben? 
              Tast inn ønsket beløp og generer en tilpasset Vipps QR-kode.
            </p>

            <form onSubmit={handleCustomVipps} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">Beløp (NOK)</label>
                  <input
                    type="number"
                    min="10"
                    step="10"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-stone-900 text-sm font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">Formål / Merking</label>
                  <input
                    type="text"
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                    placeholder="f.eks. Kiosk, støtte, gradering"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-stone-900 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer"
              >
                <QrCode className="w-4 h-4 text-[#ff5b24]" />
                <span>Generer Vipps QR-kode ({customAmount} kr)</span>
              </button>
            </form>
          </div>
        </div>

        {/* Support & Subsidy info */}
        <div className="mt-8 p-6 rounded-2xl bg-stone-100 border border-stone-200/80 text-xs text-stone-600 space-y-2">
          <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Støtteordninger & Fritidskort
          </h4>
          <p className="leading-relaxed">
            Vi ønsker at kampsport skal være tilgjengelig for alle barn og unge. 
            Vi godtar kommunale fritidskort og samarbeider med bydelsordninger for kontingentstøtte. 
            Trenger du faktura til bedriftsidrettslag eller oppdelt betaling? Ta kontakt med klubbleder.
          </p>
        </div>
      </section>
    </div>
  );
};
