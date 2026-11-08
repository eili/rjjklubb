import React from 'react';
import { ClubConfig, PageTab } from '../types';
import { 
  Sparkles, 
  MapPin, 
  Award, 
  BookOpen, 
  Calendar, 
  ChevronRight, 
  Quote, 
  ShieldCheck, 
  CheckCircle2,
  Globe2
} from 'lucide-react';

interface SokeYamaueProps {
  clubConfig: ClubConfig;
  onSelectTab: (tab: PageTab) => void;
  onOpenTrial: () => void;
}

export const SokeYamaue: React.FC<SokeYamaueProps> = ({
  clubConfig,
  onSelectTab,
  onOpenTrial,
}) => {
  return (
    <div className="bg-stone-50 text-stone-900 min-h-screen">
      {/* Header Banner */}
      <section className="bg-stone-900 text-stone-100 py-16 border-b border-stone-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-5 pointer-events-none select-none flex items-center pr-10 font-heading text-[180px] font-black text-white">
          宗家
        </div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-800 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-4 border border-stone-700">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Stilartens Grunnlegger & Hombu Dojo</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
            Vår Stilart & Soke Yamaue
          </h1>
          <p className="text-stone-300 text-base sm:text-lg max-w-3xl leading-relaxed">
            {clubConfig.clubName} i Risør er stolt tilknyttet og veiledet direkte av stormester <strong className="text-amber-400">{clubConfig.sokeName}</strong> (Soke er tittelen som stilartsoverhode), 
            lokalisert i <strong className="text-stone-100">{clubConfig.sokeCity}</strong>. 
            Her kan du lese om historien, stilartens særpreg og vår ubrutte linje til stormesteren.
          </p>
        </div>
      </section>

      {/* Main Profile Grid */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Soke Portrait & Quick Facts (4 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
              <div className="relative h-80 bg-stone-800">
                <img
                  src="https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&w=800&q=80"
                  alt="Soke Yamaue"
                  className="w-full h-full object-cover object-top filter contrast-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
                    Hombu Dojo • København
                  </div>
                  <h3 className="text-xl font-heading font-extrabold text-white">
                    {clubConfig.sokeName}
                  </h3>
                  <p className="text-xs text-stone-300">10. Dan Hanshi • Soke (Stilartsoverhode)</p>
                </div>
              </div>

              {/* Badges and summary */}
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3 text-xs text-stone-600">
                  <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Basert i <strong>København, Danmark</strong></span>
                </div>
                <div className="flex items-center gap-3 text-xs text-stone-600">
                  <Award className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>50 års erfaring innen Nihon Ju Jutsu, Aiki Jutsu & Koryu</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-stone-600">
                  <Globe2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Stilartsoverhode for dojoer internasjonalt</span>
                </div>

                <div className="pt-4 border-t border-stone-100">
                  <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-2">
                    Spesialfelt
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {['Kansetsu-waza', 'Aiki-prinsipper', 'Koryu Kata', 'Kyusho (Trykkpunkter)', 'Tanto-jutsu', 'Mestergraderinger'].map((spec) => (
                      <span key={spec} className="px-2.5 py-1 rounded-lg bg-stone-100 text-stone-700 text-[11px] font-medium border border-stone-200/60">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Summer Camp Direct Link */}
                <div 
                  onClick={() => onSelectTab('sommerleir')}
                  className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 hover:bg-amber-500/20 transition-all cursor-pointer text-xs"
                >
                  <p className="font-bold flex items-center justify-between">
                    <span>Møt Soke Yamaue i Risør:</span>
                    <ChevronRight className="w-4 h-4 text-amber-700" />
                  </p>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    Hovedinstruktør på Sommerleir 19.–21. juni 2026 i Risørhallen.
                  </p>
                </div>
              </div>
            </div>

            {/* Soke Quote Box */}
            <div className="bg-stone-900 text-stone-100 p-6 rounded-3xl border border-stone-800 relative shadow-sm">
              <Quote className="w-8 h-8 text-amber-500/30 mb-2" />
              <blockquote className="text-xs italic leading-relaxed text-stone-300">
                «Ekte Ju Jutsu handler aldri om å beseire en annen person i dojoen. 
                Det handler om å oppnå absolutt kontroll over egne bevegelser, pust og sinne. 
                Når teknikken er ren og sinnet er stille, trengs det minimal kraft for å avverge selv det farligste angrep.»
              </blockquote>
              <div className="mt-4 pt-3 border-t border-stone-800 text-right">
                <p className="text-xs font-bold text-amber-400">{clubConfig.sokeName}</p>
                <p className="text-[10px] text-stone-500">Hombu Dojo København, Danmark</p>
              </div>
            </div>
          </div>

          {/* Right Column: Deep explanation of Style, Lineage and Danish Connection (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            {/* The Style: What makes it unique */}
            <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm space-y-4">
              <h2 className="font-heading text-2xl font-bold text-stone-900">
                Stilartens Filosofi og Oppbygning
              </h2>
              <p className="text-sm text-stone-700 leading-relaxed">
                Stilarten under <strong>{clubConfig.sokeName}</strong> skiller seg fra mange moderne retninger 
                ved å holde standhaftig fast på den tradisjonelle japanske formen, samtidig som den er 
                pedagogisk tilrettelagt for skandinaviske utøvere.
              </p>
              <p className="text-sm text-stone-700 leading-relaxed">
                Soke Yamaue etablerte stilartens skandinaviske hovedkvarter (Hombu Dojo) i København 
                etter mange tiår med trening under ledende japanske stormestere. Filosofien bygger på 
                fire grunnpilarer:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                  <h4 className="font-bold text-stone-900 text-xs mb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-amber-600" />
                    Rasjonell Biomekanikk
                  </h4>
                  <p className="text-[11px] text-stone-600 leading-relaxed">
                    Teknikkene krever ikke ekstrem muskelmasse eller akrobatikk. 
                    De er utformet slik at en mindre utøver effektivt kan nøytralisere en fysisk større angriper.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                  <h4 className="font-bold text-stone-900 text-xs mb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-amber-600" />
                    Klassiske Kata & Form
                  </h4>
                  <p className="text-[11px] text-stone-600 leading-relaxed">
                    Kataene bevarer hemmelighetene i fotarbeid (ashi-sabaki) og tidsberegning (choshi) 
                    slik de har blitt overlevert fra samuraienes tid.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                  <h4 className="font-bold text-stone-900 text-xs mb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-amber-600" />
                    Trygghet og Samhold
                  </h4>
                  <p className="text-[11px] text-stone-600 leading-relaxed">
                    I dojoen er partneren din viktigste læremester. Vi passer på hverandre 
                    slik at alle kan trene hardt og målrettet uten frykt for skader.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                  <h4 className="font-bold text-stone-900 text-xs mb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-amber-600" />
                    Skandinavisk Nødvergerett
                  </h4>
                  <p className="text-[11px] text-stone-600 leading-relaxed">
                    Selvforsvarsteknikkene er tilpasset norsk og skandinavisk lovgivning om nødverge – 
                    proporsjonalt, kontrollert og defensivt.
                  </p>
                </div>
              </div>
            </div>

            {/* Connection between Risør and Copenhagen */}
            <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm space-y-4">
              <h3 className="font-heading text-xl font-bold text-stone-900 flex items-center gap-2">
                <Globe2 className="w-5 h-5 text-amber-600" />
                Båndet Mellom Risør Ju Jutsu klubb og København
              </h3>
              <p className="text-sm text-stone-700 leading-relaxed">
                {clubConfig.clubName} har et unikt og nært samarbeid med Soke Yamaue:
              </p>
              
              <ul className="space-y-3 text-xs text-stone-600">
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                  <span>
                    <strong>Årlige besøk i Risør:</strong> Soke Yamaue reiser jevnlig fra København til Risør for å lede den offisielle 
                    sommerleiren (Gasshuku) i Risørhallen og personlig overvære Dan-graderinger for klubbens viderekomne utøvere.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                  <span>
                    <strong>Videreutdanning for instruktørene:</strong> Instruktørene i Risør Ju Jutsu klubb reiser til 
                    Hombu Dojo i København for kontinuerlig kalibrering, fordypning i stilartens prinsipper og instruktørsamlinger.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                  <span>
                    <strong>Klubbledelse i Risør:</strong> Klubbleder og hovedinstruktør <strong>Kittel Gjernes (3. Dan)</strong> er direkte 
                    elev under Soke Yamaue, og sikrer at all undervisning i Risørhallen følger stilartens autentiske prinsipper og pensum.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                  <span>
                    <strong>Offisielle Graderingsdiplomer:</strong> Svarte belter og Dan-diplomer er internasjonalt anerkjente, 
                    og signeres personlig av Soke Yamaue med det offisielle stempel (Hanko).
                  </span>
                </li>
              </ul>
            </div>

            {/* Timeline / Milestones */}
            <div className="bg-stone-100 p-6 rounded-3xl border border-stone-200">
              <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-4">
                Historiske Milepæler
              </h4>
              <div className="space-y-4 text-xs">
                <div className="flex gap-4">
                  <span className="font-mono font-bold text-amber-700 shrink-0">1970-tallet</span>
                  <p className="text-stone-700">
                    Soke Yamaue studerer under klassiske japanske mestere i Japan, med vekt på tradisjonell Nihon Ju Jitsu, Aiki Jutsu og Shaolin-røtter.
                  </p>
                </div>
                <div className="flex gap-4">
                  <span className="font-mono font-bold text-amber-700 shrink-0">1990-tallet</span>
                  <p className="text-stone-700">
                    Etablering av Hombu Dojo i København og formalisering av stilarten internasjonalt.
                  </p>
                </div>
                <div className="flex gap-4">
                  <span className="font-mono font-bold text-amber-700 shrink-0">Risør</span>
                  <p className="text-stone-700">
                    Risør Ju Jutsu klubb etableres i Risørhallen og blir et kjernefeste for tradisjonell Ju Jutsu på Sørlandet.
                  </p>
                </div>
                <div className="flex gap-4">
                  <span className="font-mono font-bold text-amber-700 shrink-0">I dag</span>
                  <p className="text-stone-700">
                    Årlige samlinger og sommerleirer i Risørhallen med utøvere fra hele Norden.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Action Banner */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="p-8 rounded-3xl bg-stone-900 text-white flex flex-col sm:flex-row items-center justify-between gap-6 border border-stone-800 shadow-xl">
          <div>
            <h3 className="font-heading text-xl font-bold">Vil du trene Ju Jutsu i Risørhallen?</h3>
            <p className="text-stone-300 text-xs sm:text-sm mt-1 max-w-lg">
              Vi tar imot nye medlemmer i Risør Ju Jutsu klubb fortløpende. Ta din første treningsøkt med oss.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={onOpenTrial}
              className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              Prøv en gratis trening
            </button>
            <button
              onClick={() => onSelectTab('sommerleir')}
              className="px-5 py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs font-semibold transition-all cursor-pointer"
            >
              Les om Sommerleir 2026 i Risør
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
