import React, { useState } from 'react';
import { PageTab, ClubConfig } from '../types';
import clubLogo from '../assets/rjjk-logo.png';
import { 
  Menu, 
  X, 
  Calendar, 
  MapPin, 
  Users, 
  Phone, 
  QrCode, 
  Sun, 
  ShieldCheck, 
  Settings, 
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface NavbarProps {
  currentTab: PageTab;
  onSelectTab: (tab: PageTab) => void;
  clubConfig: ClubConfig;
  onOpenAdmin: () => void;
  onOpenTrial: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  clubConfig,
  onOpenAdmin,
  onOpenTrial,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: PageTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'hjem', label: 'Velkommen', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'tradisjon', label: 'Hva er Ju Jitsu?', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'soke-yamaue', label: 'Soke Yamaue & Stilart', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'treningstider', label: 'Treningstider', icon: <Calendar className="w-4 h-4" /> },
    { id: 'sommerleir', label: 'Sommerleir', icon: <Sun className="w-4 h-4" />, badge: 'Juni 2026' },
    { id: 'vipps', label: 'Vipps Betaling', icon: <QrCode className="w-4 h-4" /> },
    { id: 'dojo-kart', label: 'Dojo & Kart', icon: <MapPin className="w-4 h-4" /> },
    { id: 'instruktorer', label: 'Instruktører', icon: <Users className="w-4 h-4" /> },
    { id: 'kontakt', label: 'Kontakt', icon: <Phone className="w-4 h-4" /> },
  ];

  const handleNavClick = (tab: PageTab) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-stone-900/95 backdrop-blur-md text-stone-100 border-b border-stone-800 transition-all">
      {/* Top micro banner */}
      <div className="bg-stone-950 text-stone-400 text-xs py-1.5 px-4 border-b border-stone-800/80">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-stone-300 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Trening i Risørhallen – Nyopptak er åpent
            </span>
            <span className="hidden sm:inline text-stone-600">•</span>
            <span className="hidden sm:inline">Gratis uforpliktende prøvetime</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleNavClick('vipps')}
              className="hover:text-[#ff5b24] transition-colors flex items-center gap-1 font-mono text-xs"
            >
              <span className="px-1.5 py-0.5 rounded bg-[#ff5b24]/20 text-[#ff5b24] font-bold text-[10px]">
                VIPPS
              </span>
              #{clubConfig.vippsNumber}
            </button>
            <span className="text-stone-700">|</span>
            <button
              onClick={onOpenAdmin}
              className="text-stone-400 hover:text-stone-200 transition-colors flex items-center gap-1.5 text-[11px] cursor-pointer"
              title="Klubbadministrasjon (sikret med 2-faktor MFA)"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
              <span>Admin (2FA)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Club Identity */}
          <div 
            onClick={() => handleNavClick('hjem')}
            className="flex items-center gap-3.5 cursor-pointer group select-none"
          >
            {/* Official Round Club Crest */}
            <div className="w-12 h-12 rounded-full bg-white p-0.5 border-2 border-amber-500/70 flex items-center justify-center shadow-md group-hover:border-amber-400 group-hover:scale-105 transition-all overflow-hidden shrink-0">
              <img
                src={clubLogo}
                alt="Risør Ju Jutsu Klubb logo"
                className="w-full h-full object-contain rounded-full"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-extrabold text-lg sm:text-xl tracking-wider text-stone-100 group-hover:text-amber-400 transition-colors">
                  RISØR JU JUTSU
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold tracking-widest bg-stone-800 text-stone-400 uppercase rounded">
                  RJJK
                </span>
              </div>
              <div className="text-[11px] text-stone-400 tracking-wide flex items-center gap-1.5">
                <span>Risørhallen</span>
                <span className="text-stone-600">•</span>
                <span className="text-stone-400 truncate max-w-[170px] sm:max-w-none">
                  Ledet av Soke Yamaue (København)
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center space-x-1">
            {navItems.map((item) => {
              const active = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative px-3 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                    active
                      ? 'text-white bg-stone-800/90 shadow-sm border border-stone-700/60'
                      : 'text-stone-300 hover:text-white hover:bg-stone-800/50'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-1 px-1.5 py-0.2 text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded font-semibold">
                      {item.badge}
                    </span>
                  )}
                  {active && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-amber-500 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Action CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => handleNavClick('vipps')}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-[#ff5b24]/15 hover:bg-[#ff5b24]/25 text-[#ff5b24] border border-[#ff5b24]/30 transition-all cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Vipps</span>
            </button>
            <button
              onClick={onOpenTrial}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-stone-100 hover:bg-white text-stone-900 transition-all shadow-sm hover:shadow hover:scale-[1.02] cursor-pointer"
            >
              <span>Gratis Prøvetime</span>
              <ChevronRight className="w-3.5 h-3.5 text-stone-600" />
            </button>
          </div>

          {/* Mobile hamburger button */}
          <div className="flex xl:hidden items-center gap-2">
            <button
              onClick={onOpenTrial}
              className="sm:hidden px-3 py-1.5 text-xs font-bold rounded-lg bg-stone-100 text-stone-900"
            >
              Prøvetime
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-lg text-stone-300 hover:text-white hover:bg-stone-800 focus:outline-none"
              aria-label="Meny"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-stone-950 border-b border-stone-800 px-4 pt-2 pb-6 space-y-1 shadow-2xl animate-in slide-in-from-top-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-4">
            {navItems.map((item) => {
              const active = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full text-left px-3.5 py-3 rounded-lg text-sm font-medium flex items-center justify-between transition-colors ${
                    active
                      ? 'bg-stone-800 text-white font-semibold border-l-4 border-amber-500'
                      : 'text-stone-300 hover:bg-stone-900 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-stone-400">{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-xs rounded bg-amber-500/20 text-amber-400 font-semibold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-stone-800 flex flex-col gap-2.5">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenTrial();
              }}
              className="w-full py-3 bg-stone-100 text-stone-900 font-bold text-sm rounded-xl text-center shadow"
            >
              Meld deg på gratis prøvetime
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => handleNavClick('vipps')}
                className="flex-1 py-2.5 bg-[#ff5b24] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
              >
                <QrCode className="w-4 h-4" />
                Betal med Vipps (#{clubConfig.vippsNumber})
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdmin();
                }}
                className="py-2.5 px-3 bg-stone-800 text-stone-200 text-xs rounded-xl flex items-center justify-center gap-1.5 border border-stone-700 cursor-pointer"
                title="Klubbadministrasjon (sikret med 2FA)"
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Admin (2FA)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
