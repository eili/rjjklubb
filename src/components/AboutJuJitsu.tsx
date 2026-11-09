import React, { useState } from 'react';
import { 
  ShieldCheck, 
  BookOpen, 
  Layers, 
  Compass, 
  Award, 
  HelpCircle, 
  ChevronRight,
  Flame,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { PageTab, SiteContent } from '../types';

interface AboutJuJitsuProps {
  siteContent?: SiteContent;
  onSelectTab: (tab: PageTab) => void;
  onOpenTrial: () => void;
}

export const AboutJuJitsu: React.FC<AboutJuJitsuProps> = ({ 
  siteContent,
  onSelectTab, 
  onOpenTrial 
}) => {
  const aboutData = siteContent?.aboutJuJitsu;
  const [activeCategory, setActiveCategory] = useState<'prinsipper' | 'teknikker' | 'historie' | 'forskjell'>('prinsipper');

  const techniqueCategories = [
    {
      id: 'kansetsu',
      kanji: '関節技',
      title: 'Kansetsu-waza (Leddmanipulasjon)',
      description: 'Presise låser på håndledd (kote-gaeshi, kote-hineri), albuer og skuldre som tvinger angriperen i kne eller uskadeliggjør angrepet uten unødig rå makt.',
      tags: ['Håndledd', 'Albuelåser', 'Skuldre', 'Biomekanikk'],
    },
    {
      id: 'nage',
      kanji: '投げ技',
      title: 'Nage-waza (Kast og Feinger)',
      description: 'Balansebrudd (kuzushi) hvor motstanderens egen fart og bevegelse benyttes til å kaste dem kontrollert i bakken med minimal anstrengelse.',
      tags: ['Hoftekast', 'Skulderkast', 'Feiinger', 'Balansebrudd'],
    },
    {
      id: 'atemi',
      kanji: '当て身技',
      title: 'Atemi-waza (Vitale Støt og Distraksjon)',
      description: 'Målrettede slag, spark og trykk mot kroppens sårbare anatomiske punkter (kyusho) for å bryte angriperens konsentrasjon og åpne for låser eller kast.',
      tags: ['Trykkpunkter', 'Reflekser', 'Avledning', 'Presisjon'],
    },
    {
      id: 'newaza',
      kanji: '寝技・絞技',
      title: 'Ne-waza & Shime-waza (Bakkekamp og Kvelninger)',
      description: 'Fastholdinger og skånsomme kvelningsteknikker på bakken som nøytraliserer en motstander dersom situasjonen fører ned på bakken.',
      tags: ['Kontrollgrep', 'Reverseringer', 'Sikkerhet', 'Trygghet'],
    },
    {
      id: 'ukemi',
      kanji: '受身',
      title: 'Ukemi-waza (Kunsten å Falle Trygt)',
      description: 'Læren om å motta fall, rulle mykt og reise seg lynraskt uten å skade hode, rygg eller ledd. Dette er grunnlaget for all videre trening.',
      tags: ['Fallteknikk', 'Sirkulære ruller', 'Skadeforebygging'],
    },
    {
      id: 'buki',
      kanji: '武器術',
      title: 'Buki-waza (Tradisjonell Våpenforståelse)',
      description: 'Viderekomne utøvere lærer forsvar mot og bruk av tradisjonelle våpen: Hanbo (kort stokk), Tanto (kniv) og Bokken (tresverd) for å forstå avstand (ma-ai).',
      tags: ['Knivforsvar', 'Stokk', 'Avstand (Ma-ai)', 'Tradisjon'],
    },
  ];

  const beltStages = [
    { rank: '6. Kyu', color: 'Hvitt belte', meaning: 'Begynnelsen – et åpent sinn, lære fallteknikk og dojo-etikette (Reiho).' },
    { rank: '5. Kyu', color: 'Gult belte', meaning: 'Grunnleggende frigjøringsgrep, balansebrudd og enkle hoftekast.' },
    { rank: '4. Kyu', color: 'Oransje belte', meaning: 'Kombinasjoner, mer dynamiske kast og kontrollerende leddlåser.' },
    { rank: '3. Kyu', color: 'Grønt belte', meaning: 'Hurtigere reaksjonstid, forsvar mot slag og spark, bakkekontroll.' },
    { rank: '2. Kyu', color: 'Blått belte', meaning: 'Avanserte leddlåser, flytende bevegelse (tai sabaki) og flerperson-forsvar.' },
    { rank: '1. Kyu', color: 'Brunt belte', meaning: 'Mesterens forstadium – dyp teknisk innsikt, kata og assisterende instruksjon.' },
    { rank: '1. Dan+', color: 'Sort belte (Yudansha)', meaning: 'Den virkelige reisen starter. Full beherskelse av stilarten under Soke Yamaue.' },
  ];

  return (
    <div className="bg-stone-50 text-stone-900 min-h-screen">
      {/* Header Banner */}
      <section className="bg-stone-900 text-stone-100 py-16 border-b border-stone-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-5 pointer-events-none select-none flex items-center pr-10 font-heading text-[180px] font-black text-white">
          柔術
        </div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-800 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-4 border border-stone-700">
            <span>Risør Ju Jutsu • 日本柔術</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
            {aboutData?.title || 'Hva er Tradisjonell Japansk Ju Jitsu?'}
          </h1>
          <p className="text-stone-300 text-base sm:text-lg max-w-3xl leading-relaxed">
            {aboutData?.intro || (
              <>
                Ju Jitsu er en av verdens eldste og mest helhetlige kampsporter. 
                Direkte oversatt betyr det <strong className="text-amber-400">«den myke kunst»</strong> – 
                kunsten å nøytralisere rå, brutal makt gjennom smidighet, biomekanikk og balansebrudd.
              </>
            )}
          </p>
        </div>
      </section>

      {/* Philosophy Essence (Kanji Breakdown) */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white p-8 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-2xl bg-stone-900 text-amber-400 flex flex-col items-center justify-center font-heading text-3xl font-black shrink-0 border border-stone-700 shadow-md">
              <span>柔</span>
              <span className="text-[10px] tracking-widest text-stone-300 uppercase font-sans">JŪ (MYK)</span>
            </div>
            <div>
              <h3 className="text-xl font-bold font-heading text-stone-900">Jū yoku gô o seisu</h3>
              <p className="text-sm text-stone-600 mt-1 leading-relaxed">
                Et klassisk japansk ordtak: <em>«Mykhet overvinner hardhet»</em>. 
                I stedet for å spenne imot en voldsom kraft, gir utøveren etter og leder angriperens 
                egen energi dit man selv ønsker – akkurat som bambus bøyer seg i stormen uten å knekke.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 md:border-l md:border-stone-200 md:pl-8">
            <div className="w-24 h-24 rounded-2xl bg-stone-900 text-amber-400 flex flex-col items-center justify-center font-heading text-3xl font-black shrink-0 border border-stone-700 shadow-md">
              <span>術</span>
              <span className="text-[10px] tracking-widest text-stone-300 uppercase font-sans">JUTSU (KUNST)</span>
            </div>
            <div>
              <h3 className="text-xl font-bold font-heading text-stone-900">Metodisk Vitenskap</h3>
              <p className="text-sm text-stone-600 mt-1 leading-relaxed">
                Jutsu representerer det tekniske håndverket. Det handler ikke om flaks eller muskelmasse, 
                men om eksakt vinkel, vektstangprinsipper, trykk mot leddenes naturlige begrensninger og 
                kontrollert utførelse.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Tabs */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex flex-wrap gap-2 border-b border-stone-200 pb-3 mb-8">
          <button
            onClick={() => setActiveCategory('prinsipper')}
            className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${
              activeCategory === 'prinsipper'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Kjerneprinsipper</span>
          </button>

          <button
            onClick={() => setActiveCategory('teknikker')}
            className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${
              activeCategory === 'teknikker'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Teknikker (Waza)</span>
          </button>

          <button
            onClick={() => setActiveCategory('forskjell')}
            className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${
              activeCategory === 'forskjell'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Tradisjonell vs. Sport / BJJ</span>
          </button>

          <button
            onClick={() => setActiveCategory('historie')}
            className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${
              activeCategory === 'historie'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Samuraienes Røtter</span>
          </button>
        </div>

        {/* Tab 1: Prinsipper */}
        {activeCategory === 'prinsipper' && (
          <div className="space-y-8 animate-in fade-in-50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-lg mb-4">
                  崩
                </div>
                <h4 className="font-heading font-bold text-stone-900 text-base mb-2">
                  1. Kuzushi (Balansebrudd)
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Før noe kast eller en lås kan gjennomføres, må angriperens balanse brytes. 
                  En person som er i ubalanse kan hverken slå kraftfullt eller yte motstand mot en teknikk.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-lg mb-4">
                  体
                </div>
                <h4 className="font-heading font-bold text-stone-900 text-base mb-2">
                  2. Tai Sabaki (Kroppsforflytning)
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Sirkulære og flytende unnamanøvre som fjerner deg fra angrepslinjen og samtidig 
                  posisjonerer deg i en optimal vinkel bak eller ved siden av motstanderen.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-lg mb-4">
                  残
                </div>
                <h4 className="font-heading font-bold text-stone-900 text-base mb-2">
                  3. Zanshin (Årvåkenhet)
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Tilstanden av total mental tilstedeværelse og ro før, under og etter en teknikk. 
                  Selv når motstanderen er lagt i bakken, opprettholdes kontroll og oppmerksomhet mot omgivelsene.
                </p>
              </div>
            </div>

            {/* Dojo Etikette (Reiho) */}
            <div className="bg-stone-900 text-stone-100 p-8 rounded-2xl border border-stone-800">
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck className="w-6 h-6 text-amber-400" />
                <h3 className="font-heading text-xl font-bold text-white">
                  Reiho – Etikette og Respekt i Dojoen
                </h3>
              </div>
              <p className="text-sm text-stone-300 leading-relaxed mb-6">
                I tradisjonell japansk Ju Jitsu starter og slutter alt med respekt. Dojoen er et treningsrom 
                for personlig vekst, der trygghet og gjensidig tillit er avgjørende:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-stone-300">
                <div className="flex items-start gap-2.5 bg-stone-800/60 p-3.5 rounded-xl border border-stone-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Bukke ved mattekanten (Rei):</strong> Vi bukker når vi trer på og av tatamien for å vise respekt for stedet og treningskameratene.</span>
                </div>
                <div className="flex items-start gap-2.5 bg-stone-800/60 p-3.5 rounded-xl border border-stone-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Klapp ut (Mairi / Tappe):</strong> Når en lås sitter, klapper partneren to ganger på matten eller kroppen, og låsen slippes umiddelbart. Skader forebygges 100%.</span>
                </div>
                <div className="flex items-start gap-2.5 bg-stone-800/60 p-3.5 rounded-xl border border-stone-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Hygene og ren Gi:</strong> Ren drakt, klippede negler og avtagning av smykker/ringer for partnerens sikkerhet.</span>
                </div>
                <div className="flex items-start gap-2.5 bg-stone-800/60 p-3.5 rounded-xl border border-stone-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Ydmykhet (Mushin):</strong> Vi trener for å mestre oss selv, ikke for å dominere andre. Egoet legges igjen ved skohyllen.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Teknikker */}
        {activeCategory === 'teknikker' && (
          <div className="space-y-8 animate-in fade-in-50">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {techniqueCategories.map((tech) => (
                <div
                  key={tech.id}
                  className="bg-white p-6 rounded-2xl border border-stone-200 hover:border-amber-500/50 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-heading text-lg font-bold text-stone-900">{tech.title}</span>
                      <span className="text-sm font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                        {tech.kanji}
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 leading-relaxed mb-4">
                      {tech.description}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-3 border-t border-stone-100">
                    {tech.tags.map((tag) => (
                      <span key={tag} className="text-[10px] px-2 py-0.5 rounded bg-stone-100 text-stone-600 font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Beltegraderinger */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-sm">
              <h3 className="font-heading text-xl font-bold text-stone-900 mb-2 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                Graderingsveien – Fra Nybegynner til Mester
              </h3>
              <p className="text-xs text-stone-600 mb-6 leading-relaxed">
                Vårt graderingspensum er godkjent av Soke Yamaue i København og følger klassisk japansk 
                Kyu- og Dan-struktur. Hver grad representerer en fordypning i forståelse, teknikk og modenhet:
              </p>

              <div className="space-y-3">
                {beltStages.map((stage, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-stone-50 border border-stone-200/80 gap-2"
                  >
                    <div className="flex items-center gap-3 min-w-[200px]">
                      <span className="w-7 h-7 rounded-lg bg-stone-900 text-amber-400 font-bold text-xs flex items-center justify-center font-mono">
                        {stage.rank}
                      </span>
                      <span className="font-bold text-stone-900 text-sm">{stage.color}</span>
                    </div>
                    <span className="text-xs text-stone-600 flex-1">{stage.meaning}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Tradisjonell vs. BJJ / Sport */}
        {activeCategory === 'forskjell' && (
          <div className="space-y-8 animate-in fade-in-50">
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-sm">
              <h3 className="font-heading text-xl font-bold text-stone-900 mb-2">
                Hva skiller Tradisjonell Japansk Ju Jitsu fra Brasiliansk Jiu-Jitsu (BJJ) og Sport?
              </h3>
              <p className="text-sm text-stone-600 leading-relaxed mb-6">
                Mange lurer på forskjellen mellom stilartene. Mens moderne BJJ og konkurranseidrett 
                spesialiserer seg på sportsregler på bakken, bevarer den tradisjonelle japanske stilen 
                helheten for reell nødverge og selvforsvar.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b-2 border-stone-300 bg-stone-100">
                      <th className="py-3 px-4 font-bold text-stone-900">Karakteristikk</th>
                      <th className="py-3 px-4 font-bold text-amber-900 bg-amber-50/70 border-l border-r border-amber-200">
                        Tradisjonell Japansk Ju Jitsu (Oss)
                      </th>
                      <th className="py-3 px-4 font-bold text-stone-700">Brasiliansk Jiu-Jitsu (BJJ)</th>
                      <th className="py-3 px-4 font-bold text-stone-700">Moderne Judo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    <tr>
                      <td className="py-3 px-4 font-semibold text-stone-800">Hovedfokus</td>
                      <td className="py-3 px-4 bg-amber-50/30 border-l border-r border-amber-200 font-medium text-stone-900">
                        Komplett selvforsvar, nøytralisering av trussel, stående og bakke
                      </td>
                      <td className="py-3 px-4 text-stone-600">Bakke-posisjonering og låser under sportsreglement</td>
                      <td className="py-3 px-4 text-stone-600">Olympisk sportskamp og kast for poeng (Ippon)</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-stone-800">Slag og spark (Atemi)</td>
                      <td className="py-3 px-4 bg-amber-50/30 border-l border-r border-amber-200 font-medium text-stone-900">
                        Ja – vitale trykkpunkter og avledende støt er integrert
                      </td>
                      <td className="py-3 px-4 text-stone-600">Nei – ikke tillatt i standard grappling</td>
                      <td className="py-3 px-4 text-stone-600">Nei – forbudt i konkurransereglene</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-stone-800">Våpenforsvar</td>
                      <td className="py-3 px-4 bg-amber-50/30 border-l border-r border-amber-200 font-medium text-stone-900">
                        Ja – forsvar mot kniv, slagvåpen og stokk
                      </td>
                      <td className="py-3 px-4 text-stone-600">Svært sjelden i ordinær trening</td>
                      <td className="py-3 px-4 text-stone-600">Kun i historiske kata-oppvisninger</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-stone-800">Flere angripere</td>
                      <td className="py-3 px-4 bg-amber-50/30 border-l border-r border-amber-200 font-medium text-stone-900">
                        Ja – vi trener på å holde seg oppreist og ha oversikt (Zanshin)
                      </td>
                      <td className="py-3 px-4 text-stone-600">Nei – fokusert på 1-mot-1 duell</td>
                      <td className="py-3 px-4 text-stone-600">Nei – kun 1-mot-1 konkurranse</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-stone-800">Filosofi & Budo</td>
                      <td className="py-3 px-4 bg-amber-50/30 border-l border-r border-amber-200 font-medium text-stone-900">
                        Dyp forankring i samuraienes æreskodeks og etikk
                      </td>
                      <td className="py-3 px-4 text-stone-600">Sportslig lagånd og konkurranseglede</td>
                      <td className="py-3 px-4 text-stone-600">Gjensidig velferd og maksimal effektivitet</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Historie */}
        {activeCategory === 'historie' && (
          <div className="space-y-8 animate-in fade-in-50">
            <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm space-y-6">
              <h3 className="font-heading text-2xl font-bold text-stone-900">
                Samuraienes Kampkunst Gjennom Århundrene
              </h3>
              
              <div className="space-y-4 text-sm text-stone-700 leading-relaxed">
                <p>
                  Tradisjonell japansk Ju Jitsu (ofte omtalt som <em>Koryu Jujutsu</em>) oppsto under 
                  de blodige borgerkrigene i Sengoku-perioden (1467–1603). Samuraiene bar tunge metallrustninger 
                  (Yoroi). Hvis sverdet (Katana) eller lansen (Yari) brakk på slagmarken, var vanlige knyttneveslag 
                  ubrukelige mot rustningen.
                </p>
                <p>
                  Løsningen ble å utvikle intrikate leddlåser på håndledd og albuer, kaste motstanderen på hodet 
                  eller nakken, og utnytte vekten av rustningen mot dem selv. Slik ble fundamentet for Ju Jitsu lagt.
                </p>
                <p>
                  Da Japan trådte inn i den fredeligere Edo-perioden (1603–1867) under Tokugawa-shogunatet, 
                  tilpasset kampskolene seg ubevæpnet sivil kamp i bygatene. Systemet ble raffinert til et 
                  sofistikert selvforsvarssystem og en moralsk dannelsesvei (Budo).
                </p>
              </div>

              <div className="p-5 rounded-xl bg-stone-100 border-l-4 border-amber-500 text-xs text-stone-800">
                <strong>Vår Linje:</strong> Vår stilart videreføres under ledelse av <strong>Soke Yamaue</strong> i København, 
                som har bevart de tradisjonelle bevegelsesmønstrene og kataene samtidig som teknikkene er tilpasset moderne 
                fysiske nødvergesituasjoner i Norge og Skandinavia.
              </div>
            </div>
          </div>
        )}

        {/* Bottom CTA Card */}
        <div className="mt-12 p-8 rounded-2xl bg-gradient-to-r from-stone-900 to-stone-800 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div>
            <h4 className="font-heading text-xl font-bold">Lyst til å oppleve tradisjonen på matten?</h4>
            <p className="text-stone-300 text-xs sm:text-sm mt-1 max-w-xl">
              Vi tilbyr gratis prøvetime for alle nysgjerrige. Ingen forkunnskaper nødvendig – ta med vanlig treningstøy.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <button
              onClick={onOpenTrial}
              className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs tracking-wider uppercase transition-all shadow cursor-pointer"
            >
              Meld på prøvetime
            </button>
            <button
              onClick={() => onSelectTab('soke-yamaue')}
              className="px-5 py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-600 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Om Soke Yamaue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
