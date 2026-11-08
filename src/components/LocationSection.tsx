import React from 'react';
import { ClubConfig, PageTab } from '../types';
import { 
  MapPin, 
  Navigation, 
  Train, 
  Car, 
  CheckCircle2, 
  Clock, 
  Phone, 
  Mail, 
  ExternalLink,
  Shield,
  Coffee,
  Sparkles
} from 'lucide-react';

interface LocationSectionProps {
  clubConfig: ClubConfig;
  onSelectTab: (tab: PageTab) => void;
  onOpenTrial: () => void;
}

export const LocationSection: React.FC<LocationSectionProps> = ({
  clubConfig,
  onSelectTab,
  onOpenTrial,
}) => {
  const mapQuery = encodeURIComponent(`${clubConfig.dojoAddress.street}, ${clubConfig.dojoAddress.city}, Norge`);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

  return (
    <div className="bg-stone-50 text-stone-900 min-h-screen">
      {/* Top Banner */}
      <section className="bg-stone-900 text-stone-100 py-16 border-b border-stone-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-800 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-4 border border-stone-700">
            <MapPin className="w-3.5 h-3.5" />
            <span>Vår Dojo • 道場</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
            Beliggenhet & Veibeskrivelse
          </h1>
          <p className="text-stone-300 text-base sm:text-lg max-w-3xl leading-relaxed">
            Velkommen til vår dojo i Oslo. Her trener vi i romslige, spesialtilpassede lokaler 
            med førsteklasses tatami-matter, god ventilasjon og moderne garderober.
          </p>
        </div>
      </section>

      {/* Main Location Grid */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
          
          {/* Map & Visual representation (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
              {/* Interactive Map Embed */}
              <div className="relative w-full h-80 bg-stone-200">
                <iframe
                  title="Kart over Dojoen"
                  width="100%"
                  height="100%"
                  className="border-0 grayscale contrast-115"
                  loading="lazy"
                  src={`https://maps.google.com/maps?q=${mapQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                />
                
                {/* Overlay Pin Badge */}
                <div className="absolute top-4 left-4 bg-stone-900/90 text-white px-3.5 py-2 rounded-xl backdrop-blur-md border border-stone-700 shadow-lg flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse"></div>
                  <div>
                    <div className="text-xs font-bold leading-tight">{clubConfig.clubName}</div>
                    <div className="text-[10px] text-stone-300">{clubConfig.dojoAddress.street}</div>
                  </div>
                </div>
              </div>

              {/* Map Footer Toolbar */}
              <div className="p-4 bg-stone-50 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="text-stone-600 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{clubConfig.dojoAddress.street}, {clubConfig.dojoAddress.postalCode} {clubConfig.dojoAddress.city}</span>
                </div>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <span>Åpne i Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Inngang og adkomst */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-2">
              <h3 className="font-heading font-bold text-sm text-stone-900 flex items-center gap-2">
                <Navigation className="w-4 h-4 text-amber-600" />
                Slik finner du inngangen
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                {clubConfig.dojoAddress.directions} 
                Når du ankommer, gå inn hovedinngang B. Ta trappen eller heisen til 2. etasje. 
                Dojoen er merket med klubbens logo og japansk kanji 柔術.
              </p>
            </div>
          </div>

          {/* Right Transport & Contact info (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Public Transport */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-700">
                  <Train className="w-4 h-4" />
                </div>
                <span>Kollektivtransport</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                {clubConfig.dojoAddress.transitInfo}
              </p>
              <div className="pt-2 text-[11px] text-stone-500 border-t border-stone-100">
                Det tar ca. 4–6 minutter å spasere fra nærmeste holdeplass.
              </div>
            </div>

            {/* Parking */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-700">
                  <Car className="w-4 h-4" />
                </div>
                <span>Parkering for bil & sykkel</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                {clubConfig.dojoAddress.parkingInfo}
              </p>
              <div className="pt-2 text-[11px] text-stone-500 border-t border-stone-100">
                Sykkelstativ under tak like ved inngangsdøren.
              </div>
            </div>

            {/* Contact Person Box */}
            <div className="bg-stone-900 text-stone-100 p-6 rounded-2xl border border-stone-800 space-y-4">
              <div>
                <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block">
                  Kontaktperson i Dojoen
                </span>
                <h4 className="font-heading text-lg font-bold text-white mt-0.5">
                  {clubConfig.contactPerson.name}
                </h4>
                <p className="text-xs text-stone-400">{clubConfig.contactPerson.role}</p>
              </div>

              <div className="space-y-2 text-xs text-stone-300">
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                  <a href={`tel:${clubConfig.contactPerson.phone}`} className="hover:text-amber-400 transition-colors">
                    {clubConfig.contactPerson.phone}
                  </a>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                  <a href={`mailto:${clubConfig.contactPerson.email}`} className="hover:text-amber-400 transition-colors">
                    {clubConfig.contactPerson.email}
                  </a>
                </div>
              </div>

              <button
                onClick={onOpenTrial}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Book gratis prøvetime
              </button>
            </div>
          </div>
        </div>

        {/* Facilities in the dojo */}
        <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-sm">
          <h3 className="font-heading font-bold text-xl text-stone-900 mb-6">
            Dojoens Fasiliteter & Treningsforhold
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-xs">
            <div className="space-y-1.5 p-4 rounded-xl bg-stone-50 border border-stone-100">
              <span className="text-amber-600 font-bold block text-sm">160 kvm Tatami</span>
              <p className="text-stone-600 leading-relaxed">
                Støtdempende matter godkjent for kampsport, ideelt for trygge fall og kast.
              </p>
            </div>

            <div className="space-y-1.5 p-4 rounded-xl bg-stone-50 border border-stone-100">
              <span className="text-amber-600 font-bold block text-sm">Garderober & Dusj</span>
              <p className="text-stone-600 leading-relaxed">
                Separate dame- og herregarderober med låsbare skap og varme dusjer.
              </p>
            </div>

            <div className="space-y-1.5 p-4 rounded-xl bg-stone-50 border border-stone-100">
              <span className="text-amber-600 font-bold block text-sm">Kafékrok & Foresatte</span>
              <p className="text-stone-600 leading-relaxed">
                Sitteplasser med gratis kaffe og te for foreldre som venter under barnetrening.
              </p>
            </div>

            <div className="space-y-1.5 p-4 rounded-xl bg-stone-50 border border-stone-100">
              <span className="text-amber-600 font-bold block text-sm">Tradisjonelt Kamiza</span>
              <p className="text-stone-600 leading-relaxed">
                Æresvegg med kalligrafi, portrett av Soke Yamaue og stilartens symboler.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
