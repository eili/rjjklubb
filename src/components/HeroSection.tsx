import React from 'react';
import { ClubConfig, PageTab, SiteContent } from '../types';
import { 
  ChevronRight, 
  ShieldCheck, 
  Calendar, 
  Sparkles, 
  Sun, 
  MapPin, 
  QrCode,
  Award,
  Users
} from 'lucide-react';

interface HeroSectionProps {
  clubConfig: ClubConfig;
  siteContent?: SiteContent;
  onSelectTab: (tab: PageTab) => void;
  onOpenTrial: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  clubConfig,
  siteContent,
  onSelectTab,
  onOpenTrial,
}) => {
  const heroData = siteContent?.hero;
  const bgImg = heroData?.bgImage || 'https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&w=2000&q=80';
  const heroTitle = heroData?.title || 'Mykhet overvinner rå styrke';
  const heroDesc = heroData?.description || `Velkommen til ${clubConfig.clubName}. Opplev den opprinnelige japanske kampsporten som samuraiene utviklet for ubevæpnet kamp. Hos oss lærer du presise leddlåser, kast, frigjøringsteknikker og mental styrke i et trygt og inkluderende fellesskap.`;

  return (
    <div className="relative overflow-hidden bg-stone-900 text-stone-100">
      {/* Subtle martial arts visual background & gradient textures */}
      <div className="absolute inset-0 z-0">
        <img
          src={bgImg}
          alt="Ju Jitsu Dojo"
          className="w-full h-full object-cover object-center opacity-25 filter grayscale contrast-125 scale-105 transform motion-safe:transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/90 to-stone-900/70" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 sm:pt-24 sm:pb-28">
        {/* Japanese Lineage & Club Leadership Top Pill */}
        <div className="inline-flex flex-wrap items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-800/80 border border-stone-700/80 backdrop-blur-md mb-8 text-xs text-stone-300">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
          <span className="font-semibold text-amber-400">{clubConfig.clubName}</span>
          <span className="text-stone-600">•</span>
          <span className="text-stone-200 font-medium">Klubbleder: Kittel Gjernes (4. Dan)</span>
          <span className="text-stone-600">•</span>
          <span className="text-stone-300">Stilart: {clubConfig.sokeName} ({clubConfig.sokeCity})</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Main Hero Text (Left 7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              {heroTitle}
            </h1>

            <p className="text-lg sm:text-xl text-stone-300 font-light leading-relaxed max-w-2xl">
              {heroDesc}
            </p>

            {/* Quick action buttons */}
            <div className="pt-2 flex flex-wrap gap-3.5 items-center">
              <button
                onClick={onOpenTrial}
                className="px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm tracking-wide shadow-lg shadow-amber-500/20 hover:scale-[1.02] transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Bli med på gratis prøvetime</span>
                <ChevronRight className="w-4 h-4 text-stone-900" />
              </button>

              <button
                onClick={() => onSelectTab('treningstider')}
                className="px-5 py-3.5 rounded-xl bg-stone-800 hover:bg-stone-700/80 text-stone-200 border border-stone-700 text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-stone-400" />
                <span>Se Treningstider</span>
              </button>

              <button
                onClick={() => onSelectTab('vipps')}
                className="px-4 py-3.5 rounded-xl bg-[#ff5b24]/15 hover:bg-[#ff5b24]/25 text-[#ff5b24] border border-[#ff5b24]/40 text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer"
              >
                <QrCode className="w-4 h-4" />
                <span>Vipps #{clubConfig.vippsNumber}</span>
              </button>
            </div>

            {/* Micro badges below CTA */}
            <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-stone-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Ingen forkunnskaper kreves</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                <span>Grupper for barn, ungdom og voksne</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-blue-400" />
                <span>Internasjonalt godkjente Dan-grader</span>
              </div>
            </div>
          </div>

          {/* Right Hero Card: Spotlight on Leadership, Soke Yamaue & Summer Camp (5 cols) */}
          <div className="lg:col-span-5 space-y-3.5">
            {/* Klubbleder Spotlight Card */}
            <div 
              onClick={() => onSelectTab('instruktorer')}
              className="group p-4 rounded-2xl bg-gradient-to-r from-stone-900/95 to-stone-850/95 border border-amber-500/40 hover:border-amber-400 backdrop-blur-md transition-all cursor-pointer shadow-lg flex items-center gap-3.5"
            >
              <div className="relative shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=300&q=80"
                  alt="Klubbleder Kittel Gjernes"
                  className="w-14 h-14 rounded-xl object-cover border border-amber-500/40 group-hover:scale-105 transition-transform"
                />
                <div className="absolute -bottom-1 -right-1 bg-amber-500 text-stone-950 text-[9px] font-black px-1.5 py-0.5 rounded font-mono shadow">
                  4. DAN
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30">
                    Klubbleder
                  </span>
                  <span className="text-xs text-stone-400 font-mono">Risørhallen</span>
                </div>
                <div className="text-base font-bold text-stone-100 group-hover:text-amber-400 transition-colors truncate mt-0.5">
                  Kittel Gjernes
                </div>
                <p className="text-xs text-stone-400 truncate">
                  4. Dan • Hovedinstruktør og klubbleder i Risør
                </p>
              </div>

              <ChevronRight className="w-4 h-4 text-stone-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all shrink-0" />
            </div>

            {/* Summer Camp Spotlight Card */}
            <div 
              onClick={() => onSelectTab('sommerleir')}
              className="group p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-stone-800/90 to-stone-900/90 border border-stone-700 hover:border-amber-500/50 backdrop-blur-md transition-all cursor-pointer shadow-xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-colors pointer-events-none" />
              
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-400 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  Årlig Sommerleir 2026
                </span>
                <span className="text-xs text-stone-400 font-mono">19.–21. Juni</span>
              </div>

              <h3 className="font-heading text-lg font-bold text-stone-100 group-hover:text-amber-400 transition-colors">
                Gjestelærer: Soke Yamaue (København)
              </h3>
              <p className="text-xs text-stone-400 mt-1.5 leading-relaxed">
                Møt vår stilartsleder fra København til tre dager med dypdykk i tradisjonelle leddlåser, 
                kast og våpenforsvar i Risørhallen.
              </p>
              
              <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-stone-700/60">
                <span className="text-amber-400 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                  Les mer om leiren & påmelding <ChevronRight className="w-3.5 h-3.5" />
                </span>
                <span className="px-2 py-0.5 rounded bg-stone-700/80 text-[11px] text-stone-300">
                  Åpen for alle grader
                </span>
              </div>
            </div>

            {/* Quick Soke Yamaue lineage badge */}
            <div 
              onClick={() => onSelectTab('soke-yamaue')}
              className="group p-4 rounded-2xl bg-stone-900/80 border border-stone-800 hover:border-stone-700 transition-all cursor-pointer flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-stone-800 border border-stone-700 flex items-center justify-center text-amber-400 font-heading text-xl font-bold shrink-0">
                宗家
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] text-stone-400 uppercase tracking-widest font-semibold">
                  Vår Stilart & Linje
                </div>
                <div className="text-sm font-bold text-stone-200 group-hover:text-white transition-colors truncate">
                  Soke Yamaue – Hombu Dojo København
                </div>
                <p className="text-xs text-stone-400 truncate">
                  Les om tradisjonen, filosofien og Dan-systemet
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-500 group-hover:text-stone-300 shrink-0" />
            </div>

            {/* Location quick badge */}
            <div 
              onClick={() => onSelectTab('dojo-kart')}
              className="p-3.5 rounded-xl bg-stone-950/60 border border-stone-800/80 hover:border-stone-700 flex items-center justify-between text-xs text-stone-400 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-500" />
                <span className="text-stone-300 font-medium">{clubConfig.dojoAddress.street}, {clubConfig.dojoAddress.city}</span>
              </div>
              <span className="text-stone-500 text-[11px]">Se kart og veibeskrivelse →</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Feature Columns Banner */}
      <div className="relative z-10 border-t border-stone-800 bg-stone-950/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 text-amber-400 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-stone-200 font-bold text-sm">Autentisk Selvforsvar</h4>
                <p className="text-stone-400 text-xs mt-1 leading-relaxed">
                  Ikke sportslige restriksjoner, men rasjonelt forsvar mot slag, spark, kvelertak og våpen.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 text-amber-400 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-stone-200 font-bold text-sm">Budo & Filosofi</h4>
                <p className="text-stone-400 text-xs mt-1 leading-relaxed">
                  Respekt (Reiho), mental tilstedeværelse (Zanshin) og balanse i kropp og sinn.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 text-amber-400 shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-stone-200 font-bold text-sm">Mester fra København</h4>
                <p className="text-stone-400 text-xs mt-1 leading-relaxed">
                  Direkte linje til Soke Yamaue og Hombu Dojo i København med faste årlige samlinger.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 text-[#ff5b24] shrink-0">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-stone-200 font-bold text-sm">Enkel Vipps-betaling</h4>
                <p className="text-stone-400 text-xs mt-1 leading-relaxed">
                  Betal semesterkontingent, sommerleir og drakt trygt med Vipps QR-koder.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
