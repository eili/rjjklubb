import React from 'react';
import { ClubConfig, PageTab } from '../types';
import { MapPin, Phone, Mail, Clock, Shield, Heart } from 'lucide-react';

interface FooterProps {
  clubConfig: ClubConfig;
  onSelectTab: (tab: PageTab) => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ clubConfig, onSelectTab, onOpenAdmin }) => {
  return (
    <footer className="bg-stone-950 text-stone-400 border-t border-stone-800 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Col 1: Club info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center text-amber-500 font-heading text-xl font-bold">
                柔
              </div>
              <div>
                <h3 className="text-stone-100 font-heading font-bold text-base tracking-wider">
                  {clubConfig.clubName}
                </h3>
                <p className="text-xs text-stone-500">Stilart: {clubConfig.styleName}</p>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-stone-400">
              Tradisjonell japansk kampsport med direkte røtter til samuraienes koryu-skoler. 
              Vi trener autentisk selvforsvar, disiplin, leddlåser og kast under veiledning av {clubConfig.sokeName} i {clubConfig.sokeCity}.
            </p>
            <div className="pt-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-800 text-xs text-stone-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Tilknyttet Hombu Dojo København</span>
              </div>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-stone-200 font-semibold text-sm tracking-wide uppercase mb-4">
              Hurtignavigasjon
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  onClick={() => onSelectTab('tradisjon')}
                  className="hover:text-amber-400 transition-colors text-left"
                >
                  Hva er Tradisjonell Japansk Ju Jitsu?
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('soke-yamaue')}
                  className="hover:text-amber-400 transition-colors text-left"
                >
                  Vår Stilart & Soke Yamaue (København)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('treningstider')}
                  className="hover:text-amber-400 transition-colors text-left"
                >
                  Treningstider for barn og voksne
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('sommerleir')}
                  className="hover:text-amber-400 transition-colors text-left flex items-center gap-1.5"
                >
                  <span>Årlig Sommerleir 2026</span>
                  <span className="px-1.5 py-0.5 text-[9px] bg-amber-500/20 text-amber-400 rounded">Gasshuku</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('vipps')}
                  className="hover:text-[#ff5b24] transition-colors text-left font-medium"
                >
                  Vipps Betaling (Vipps #{clubConfig.vippsNumber})
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('instruktorer')}
                  className="hover:text-amber-400 transition-colors text-left"
                >
                  Våre instruktører
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Dojo & Training */}
          <div>
            <h4 className="text-stone-200 font-semibold text-sm tracking-wide uppercase mb-4">
              Dojo & Beliggenhet
            </h4>
            <div className="space-y-3 text-xs text-stone-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-stone-200 font-medium">{clubConfig.dojoAddress.street}</p>
                  <p>{clubConfig.dojoAddress.postalCode} {clubConfig.dojoAddress.city}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-stone-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-stone-300 font-medium">Treningstider:</p>
                  <p>Mandag, Tirsdag, Torsdag: 17:30 – 20:30</p>
                  <p>Lørdag: 11:00 – 13:00</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Shield className="w-4 h-4 text-stone-500 mt-0.5 shrink-0" />
                <p>Nyopptak hver måned. Gratis prøvetime for alle interesserte.</p>
              </div>
            </div>
          </div>

          {/* Col 4: Contact & Vipps */}
          <div>
            <h4 className="text-stone-200 font-semibold text-sm tracking-wide uppercase mb-4">
              Kontakt & Betaling
            </h4>
            <div className="space-y-2.5 text-xs text-stone-400">
              <p className="text-stone-300 font-medium">{clubConfig.contactPerson.name}</p>
              <p className="text-stone-500 text-[11px]">{clubConfig.contactPerson.role}</p>
              
              <div className="flex items-center gap-2 pt-1">
                <Phone className="w-3.5 h-3.5 text-amber-500" />
                <a href={`tel:${clubConfig.contactPerson.phone}`} className="hover:text-stone-200">
                  {clubConfig.contactPerson.phone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-amber-500" />
                <a href={`mailto:${clubConfig.contactPerson.email}`} className="hover:text-stone-200">
                  {clubConfig.contactPerson.email}
                </a>
              </div>

              {/* Vipps quick box */}
              <div className="mt-4 p-3 rounded-xl bg-stone-900 border border-stone-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-stone-200">Vippsnummer:</span>
                  <span className="font-mono font-bold text-[#ff5b24] text-sm">
                    #{clubConfig.vippsNumber}
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  Merk betaling med utøvers navn og semester.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-stone-900 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-600">
          <div>
            © {new Date().getFullYear()} {clubConfig.clubName}. Alle rettigheter reservert. 
            Stilart under tilsyn av {clubConfig.sokeName} ({clubConfig.sokeCity}).
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={onOpenAdmin}
              className="text-stone-500 hover:text-amber-400 transition-colors flex items-center gap-1 cursor-pointer"
              title="Klubbadministrasjon (sikret med 2FA)"
            >
              <Shield className="w-3.5 h-3.5 text-amber-500" />
              <span>Administrasjon (2FA)</span>
            </button>
            <span>•</span>
            <span className="flex items-center gap-1 text-stone-500">
              Bygget med respekt for <Heart className="w-3 h-3 text-red-500 inline fill-red-500" /> Budo
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
