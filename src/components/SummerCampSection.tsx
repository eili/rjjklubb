import React, { useState } from 'react';
import { SummerCampInfo, ClubConfig, VippsProduct, CampPhoto } from '../types';
import { 
  Sun, 
  Calendar, 
  MapPin, 
  Sparkles, 
  Check, 
  Users, 
  QrCode, 
  Award, 
  Clock, 
  ChevronRight,
  ChevronLeft,
  Edit3,
  Coffee,
  Bed,
  CheckCircle2,
  Camera,
  X,
  ExternalLink,
  Shield,
  Layers,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SummerCampSectionProps {
  camp: SummerCampInfo;
  clubConfig: ClubConfig;
  onOpenAdmin: () => void;
  onPayVipps: (product: VippsProduct) => void;
}

export const SummerCampSection: React.FC<SummerCampSectionProps> = ({
  camp,
  clubConfig,
  onOpenAdmin,
  onPayVipps,
}) => {
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('alle');
  const [selectedPhotoCategory, setSelectedPhotoCategory] = useState<string>('alle');
  const [activePhoto, setActivePhoto] = useState<CampPhoto | null>(null);

  // Registration state
  const [selectedPackage, setSelectedPackage] = useState<'fullAdult' | 'fullYouth' | 'dayPass'>('fullAdult');
  const [includeDinner, setIncludeDinner] = useState(true);
  const [registered, setRegistered] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    beltRank: 'Gult belte (5. Kyu)',
    club: 'Risør Ju Jutsu klubb',
    allergies: '',
  });

  const getPackagePrice = () => {
    let base = 0;
    if (selectedPackage === 'fullAdult') base = camp.prices.fullCampAdult;
    if (selectedPackage === 'fullYouth') base = camp.prices.fullCampYouth;
    if (selectedPackage === 'dayPass') base = camp.prices.singleDayAdult;
    return base + (includeDinner ? camp.prices.dinnerParty : 0);
  };

  const handleSubmitRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    try {
      confetti({
        particleCount: 90,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#ff5b24', '#f59e0b', '#10b981'],
      });
    } catch {
      // ignore
    }

    setRegistered(true);
  };

  const handleStartVippsForCamp = () => {
    const product: VippsProduct = {
      id: `camp-${selectedPackage}-${includeDinner ? 'dinner' : 'nodinner'}`,
      title: `Sommerleir 2026 (${selectedPackage === 'fullAdult' ? 'Full Voksen' : selectedPackage === 'fullYouth' ? 'Ungdom' : 'Dagspass'})`,
      category: 'leir',
      amount: getPackagePrice(),
      description: `Påmelding for ${formData.name || 'utøver'}. Middag: ${includeDinner ? 'Ja' : 'Nei'}.`,
    };
    onPayVipps(product);
  };

  // Schedule filtering
  const filteredSchedule = camp.schedule.filter(
    (item) => selectedDayFilter === 'alle' || item.day === selectedDayFilter
  );

  // Gallery filtering
  const filteredGallery = (camp.gallery || []).filter(
    (photo) => selectedPhotoCategory === 'alle' || photo.category === selectedPhotoCategory
  );

  const activePhotoIndex = (camp.gallery || []).findIndex((p) => p.id === activePhoto?.id);

  const handleNextPhoto = () => {
    if (!camp.gallery || camp.gallery.length === 0) return;
    if (activePhotoIndex >= 0 && activePhotoIndex < camp.gallery.length - 1) {
      setActivePhoto(camp.gallery[activePhotoIndex + 1]);
    } else {
      setActivePhoto(camp.gallery[0]);
    }
  };

  const handlePrevPhoto = () => {
    if (!camp.gallery || camp.gallery.length === 0) return;
    if (activePhotoIndex > 0) {
      setActivePhoto(camp.gallery[activePhotoIndex - 1]);
    } else {
      setActivePhoto(camp.gallery[camp.gallery.length - 1]);
    }
  };

  return (
    <div className="bg-stone-50 text-stone-900 min-h-screen">
      {/* Hero Banner */}
      <section className="bg-stone-900 text-stone-100 py-16 border-b border-stone-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <img
            src="https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&w=1800&q=80"
            alt="Sommerleir Ju Jitsu"
            className="w-full h-full object-cover grayscale"
          />
        </div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider border border-amber-500/30">
              <Sun className="w-3.5 h-3.5" />
              <span>Årlig Gasshuku • Sommerleir {camp.year}</span>
            </div>
            
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs transition-colors border border-stone-700 cursor-pointer"
              title="Vedlikehold sommerleir og instruktørdetaljer"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-400" />
              <span>Vedlikehold leirinformasjon</span>
            </button>
          </div>

          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-3">
            Sommerleir {camp.year}
          </h1>
          <p className="text-amber-400 text-lg sm:text-xl font-medium mb-4">
            Tema: {camp.theme}
          </p>

          <div className="flex flex-wrap items-center gap-6 text-xs text-stone-300">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-white text-sm">{camp.dates}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>{camp.location}, {camp.city}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-emerald-400 font-bold">{camp.status}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Guest Instructor Highlight: Soke Yamaue */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-3xl border-2 border-amber-500/40 p-6 sm:p-8 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-amber-500 text-stone-950 text-[10px] font-extrabold uppercase px-4 py-1 rounded-bl-2xl tracking-wider">
            Æresgjest & Hovedlærer
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-stone-900 border-2 border-amber-500/50 overflow-hidden shrink-0 shadow-md">
              <img
                src="https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&w=400&q=80"
                alt={camp.specialGuest}
                className="w-full h-full object-cover object-top"
              />
            </div>

            <div className="space-y-1.5 text-center sm:text-left flex-1">
              <div className="text-xs font-mono font-bold text-amber-700 uppercase tracking-widest">
                Stilartsoverhode fra Hombu Dojo København
              </div>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-stone-900">
                {camp.specialGuest}
              </h2>
              <p className="text-xs text-stone-500 font-medium">
                {camp.specialGuestRole}
              </p>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed pt-1 max-w-2xl">
                Soke Yamaue tar nok en gang turen fra København til Risør for å lede den årlige 
                sommerleiren i Risørhallen. Dette er årets største faglige høydepunkt for alle klubbens medlemmer 
                og gjesteutøvere fra hele Norden.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: Schedule of Activities */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Aktivitetsplan</span>
              <h3 className="font-heading text-2xl font-bold text-stone-900">
                Timeplan & Aktiviteter Dag for Dag
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Over 14 timer intensiv trening fordelt på tre dager
              </p>
            </div>

            {/* Day filters */}
            <div className="flex flex-wrap gap-1.5">
              {['alle', 'Fredag', 'Lørdag', 'Søndag'].map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDayFilter(d)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedDayFilter === d
                      ? 'bg-stone-900 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {d === 'alle' ? 'Hele helgen' : d}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3.5">
            {filteredSchedule.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 hover:border-amber-400/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5 min-w-[200px]">
                  <span className="px-2.5 py-1 rounded-lg bg-stone-900 text-amber-400 font-bold text-xs uppercase font-mono">
                    {item.day}
                  </span>
                  <span className="text-xs font-mono font-bold text-stone-700 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    {item.time}
                  </span>
                </div>

                <div className="flex-1 space-y-0.5">
                  <h4 className="font-heading font-bold text-stone-900 text-sm">
                    {item.title}
                  </h4>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="text-xs text-stone-500 sm:text-right shrink-0">
                  <span className="text-[10px] text-stone-400 block uppercase">Instruktør</span>
                  <span className="font-semibold text-stone-800">{item.instructor}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION: Gallery of Photos from Previous Camps */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-amber-700 text-xs font-bold uppercase tracking-wider">
                <Camera className="w-4 h-4" />
                <span>Bildegalleri</span>
              </div>
              <h3 className="font-heading text-2xl font-bold text-stone-900">
                Glimt fra Tidligere Sommerleirer
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Bilder fra fellesøktene med Soke Yamaue, graderinger og den sosiale stemningen i Risør
              </p>
            </div>

            {/* Gallery Category filter */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'alle', label: 'Alle bilder' },
                { id: 'soke', label: 'Soke Yamaue' },
                { id: 'trening', label: 'Trening' },
                { id: 'gradering', label: 'Gradering' },
                { id: 'sosialt', label: 'Sosialt' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedPhotoCategory(c.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedPhotoCategory === c.id
                      ? 'bg-amber-500 text-stone-950'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Photos Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredGallery.map((photo) => (
              <div
                key={photo.id}
                onClick={() => setActivePhoto(photo)}
                className="group relative h-64 rounded-2xl overflow-hidden cursor-pointer border border-stone-200 shadow-sm hover:shadow-lg transition-all"
              >
                <img
                  src={photo.url}
                  alt={photo.title}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent opacity-85 group-hover:opacity-95 transition-opacity" />
                
                {/* Year tag */}
                <div className="absolute top-3 left-3 bg-stone-900/80 backdrop-blur-md text-amber-400 font-mono text-[10px] font-bold px-2.5 py-1 rounded-lg border border-stone-700">
                  {photo.year}
                </div>

                {/* Bottom Title & Caption */}
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h4 className="font-heading font-bold text-sm leading-snug group-hover:text-amber-400 transition-colors">
                    {photo.title}
                  </h4>
                  <p className="text-[11px] text-stone-300 line-clamp-1 mt-0.5">
                    {photo.caption}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox Modal for Photo Gallery */}
      {activePhoto && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/90 backdrop-blur-md overflow-y-auto animate-in fade-in"
          onClick={() => setActivePhoto(null)}
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="bg-stone-900 text-white rounded-3xl max-w-3xl w-full border border-stone-800 shadow-2xl overflow-hidden relative flex flex-col my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Toolbar */}
            <div className="p-4 flex items-center justify-between border-b border-stone-800">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono text-xs font-bold">
                  {activePhoto.year}
                </span>
                <span className="text-xs text-stone-400">Sommerleir Fotoarkiv</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevPhoto}
                  className="p-1.5 rounded-lg bg-stone-800 text-stone-300 hover:text-white"
                  title="Forrige bilde"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNextPhoto}
                  className="p-1.5 rounded-lg bg-stone-800 text-stone-300 hover:text-white"
                  title="Neste bilde"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setActivePhoto(null)}
                  className="p-1.5 rounded-lg bg-stone-800 text-stone-300 hover:text-white ml-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Photo */}
            <div className="relative bg-black flex items-center justify-center max-h-[60vh] overflow-hidden">
              <img
                src={activePhoto.url}
                alt={activePhoto.title}
                className="max-h-[60vh] w-auto object-contain"
              />
            </div>

            {/* Bottom Caption */}
            <div className="p-5 bg-stone-900 border-t border-stone-800 space-y-1">
              <h4 className="font-heading font-bold text-base text-white">
                {activePhoto.title}
              </h4>
              <p className="text-xs text-stone-300 leading-relaxed">
                {activePhoto.caption}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION: Registration & Vipps Payment */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-stone-900 text-white rounded-3xl p-8 sm:p-10 border border-stone-800 shadow-xl">
          <div className="flex flex-col md:flex-row gap-10">
            {/* Left: Registration Form */}
            <div className="flex-1 space-y-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ff5b24]/20 text-[#ff5b24] text-xs font-bold uppercase mb-2">
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Slik melder du deg på</span>
                </div>
                <h3 className="font-heading text-2xl font-bold text-white">
                  Meld deg på Sommerleir {camp.year}
                </h3>
                <p className="text-stone-400 text-xs mt-1">
                  1. Velg pakke • 2. Fyll ut opplysninger • 3. Betal enkelt via Vipps.
                </p>
              </div>

              {registered ? (
                <div className="bg-stone-800/90 border border-emerald-500/40 p-6 rounded-2xl text-center space-y-4">
                  <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="font-heading text-lg font-bold text-white">
                    Takk for påmeldingen, {formData.name}!
                  </h4>
                  <p className="text-xs text-stone-300 max-w-md mx-auto leading-relaxed">
                    Vi har registrert din deltagelse på sommerleiren. For å fullføre betalingen, 
                    vipps <strong>{getPackagePrice()} kr</strong> til <strong>#{clubConfig.vippsNumber}</strong>.
                  </p>

                  <div className="pt-2 flex justify-center gap-3">
                    <button
                      onClick={handleStartVippsForCamp}
                      className="px-5 py-2.5 rounded-xl bg-[#ff5b24] text-white font-bold text-xs flex items-center gap-2 hover:bg-[#e04814] transition-colors"
                    >
                      <QrCode className="w-4 h-4" />
                      Åpne Vipps QR-betaling nå
                    </button>
                    <button
                      onClick={() => setRegistered(false)}
                      className="px-4 py-2.5 rounded-xl bg-stone-700 text-stone-300 text-xs font-semibold hover:bg-stone-600"
                    >
                      Meld på en til
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitRegistration} className="space-y-4">
                  {/* Select camp package */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-300">
                      Velg deltagelsespakke:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div
                        onClick={() => setSelectedPackage('fullAdult')}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                          selectedPackage === 'fullAdult'
                            ? 'bg-amber-500/20 border-amber-500 text-white'
                            : 'bg-stone-800/60 border-stone-700 text-stone-400 hover:border-stone-600'
                        }`}
                      >
                        <div className="text-xs font-bold text-white">Full Voksen</div>
                        <div className="text-[11px] text-stone-400">Hele helgen</div>
                        <div className="text-sm font-extrabold text-amber-400 mt-1">
                          {camp.prices.fullCampAdult} kr
                        </div>
                      </div>

                      <div
                        onClick={() => setSelectedPackage('fullYouth')}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                          selectedPackage === 'fullYouth'
                            ? 'bg-amber-500/20 border-amber-500 text-white'
                            : 'bg-stone-800/60 border-stone-700 text-stone-400 hover:border-stone-600'
                        }`}
                      >
                        <div className="text-xs font-bold text-white">Full Ungdom</div>
                        <div className="text-[11px] text-stone-400">Til og med 17 år</div>
                        <div className="text-sm font-extrabold text-amber-400 mt-1">
                          {camp.prices.fullCampYouth} kr
                        </div>
                      </div>

                      <div
                        onClick={() => setSelectedPackage('dayPass')}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                          selectedPackage === 'dayPass'
                            ? 'bg-amber-500/20 border-amber-500 text-white'
                            : 'bg-stone-800/60 border-stone-700 text-stone-400 hover:border-stone-600'
                        }`}
                      >
                        <div className="text-xs font-bold text-white">Dagspass</div>
                        <div className="text-[11px] text-stone-400">Lørdag med Soke</div>
                        <div className="text-sm font-extrabold text-amber-400 mt-1">
                          {camp.prices.singleDayAdult} kr
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dinner party checkbox */}
                  <label className="flex items-center gap-3 p-3 bg-stone-800/60 rounded-2xl border border-stone-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeDinner}
                      onChange={(e) => setIncludeDinner(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-0 cursor-pointer"
                    />
                    <div className="text-xs text-stone-300">
                      <span className="font-bold text-white">Inkluder festmiddag lørdag kveld</span> (+{camp.prices.dinnerParty} kr)
                      <span className="block text-[11px] text-stone-400">2-retters middag og sosial hygge</span>
                    </div>
                  </label>

                  {/* Contact inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-stone-400 mb-1 font-medium">Fullt navn *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ditt navn"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-white text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-stone-400 mb-1 font-medium">Telefonnummer *</label>
                      <input
                        type="tel"
                        required
                        placeholder="+47 000 00 000"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-white text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-stone-400 mb-1 font-medium">E-postadresse</label>
                      <input
                        type="email"
                        placeholder="din.epost@example.no"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-white text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-stone-400 mb-1 font-medium">Nåværende beltegrad</label>
                      <select
                        value={formData.beltRank}
                        onChange={(e) => setFormData({ ...formData, beltRank: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-white text-xs focus:outline-none focus:border-amber-500"
                      >
                        <option>Hvitt belte (Nybegynner)</option>
                        <option>Gult belte (5. Kyu)</option>
                        <option>Oransje belte (4. Kyu)</option>
                        <option>Grønt belte (3. Kyu)</option>
                        <option>Blått belte (2. Kyu)</option>
                        <option>Brunt belte (1. Kyu)</option>
                        <option>Sort belte (Dan-grad)</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Bekreft påmelding ({getPackagePrice()} kr)</span>
                    <ChevronRight className="w-4 h-4 text-stone-900" />
                  </button>
                </form>
              )}
            </div>

            {/* Right: Quick Vipps Card */}
            <div className="md:w-72 bg-stone-950 p-6 rounded-3xl border border-stone-800 flex flex-col justify-between text-center space-y-4">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#ff5b24]/20 text-[#ff5b24] flex items-center justify-center mx-auto mb-3 font-bold">
                  v:
                </div>
                <h4 className="font-heading font-bold text-base text-white">Betal med Vipps</h4>
                <p className="text-xs text-stone-400 mt-1">
                  Klubbens Vippsnummer:
                </p>
                <div className="mt-2 py-2 px-3 bg-stone-900 rounded-xl border border-stone-800 font-mono font-extrabold text-[#ff5b24] text-lg">
                  #{clubConfig.vippsNumber}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-stone-900/60 border border-stone-800 text-xs text-stone-400 text-left space-y-1">
                <p className="text-stone-300 font-medium">Slik vippser du leiren:</p>
                <p>1. Åpne Vipps-appen på mobilen</p>
                <p>2. Tast <strong>#{clubConfig.vippsNumber}</strong></p>
                <p>3. Skriv inn beløpet: <strong>{getPackagePrice()} kr</strong></p>
                <p>4. Skriv «Sommerleir - {formData.name || 'Ditt navn'}» i meldingen</p>
              </div>

              <button
                onClick={handleStartVippsForCamp}
                className="w-full py-2.5 rounded-xl bg-[#ff5b24] hover:bg-[#e04814] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow"
              >
                <QrCode className="w-4 h-4" />
                <span>Vis Vipps QR-kode</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
