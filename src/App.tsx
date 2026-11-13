/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { PageTab, ClubConfig, Instructor, SummerCampInfo, TrainingClass, VippsProduct, AdminMFAConfig, SiteContent, MediaItem, Member } from './types';
import clubLogo from './assets/rjjk-logo.png';
import { 
  initialClubConfig, 
  initialInstructors, 
  initialClasses, 
  initialSummerCamp, 
  initialVippsProducts,
  initialMFAConfig,
  initialSiteContent,
  initialMediaLibrary,
  initialMembers
} from './data/initialData';

import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HeroSection } from './components/HeroSection';
import { AboutJuJitsu } from './components/AboutJuJitsu';
import { SokeYamaue } from './components/SokeYamaue';
import { ScheduleSection } from './components/ScheduleSection';
import { SummerCampSection } from './components/SummerCampSection';
import { VippsPaymentSection } from './components/VippsPaymentSection';
import { LocationSection } from './components/LocationSection';
import { InstructorsSection } from './components/InstructorsSection';
import { ContactSection } from './components/ContactSection';
import { AdminModal } from './components/AdminModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { VippsModal } from './components/VippsModal';
import { TrialBookingModal } from './components/TrialBookingModal';
import { 
  testConnection, 
  subscribeToClubData, 
  saveClubDataToFirestore,
  FullClubData
} from './lib/firebase';
import { useMembers } from './hooks/useMembers';
import { useTrialBookings } from './hooks/useTrialBookings';

function migrateLegacyClubConfig(cfg: ClubConfig): { data: ClubConfig; changed: boolean } {
  const isLegacyEmail = cfg.contactPerson?.email === 'kittel@risorjujutsu.no';
  const isLegacyPhone = cfg.contactPerson?.phone === '+47 920 14 550';
  const isLegacyStreet = cfg.dojoAddress?.street === 'Risørhallen, Caspersens vei 1';
  if (!isLegacyEmail && !isLegacyPhone && !isLegacyStreet) {
    return { data: cfg, changed: false };
  }
  return {
    changed: true,
    data: {
      ...cfg,
      clubName: cfg.clubName === 'Risør Ju Jutsu klubb' ? initialClubConfig.clubName : cfg.clubName,
      styleName: cfg.styleName === 'Nihon Ju Jutsu / Yamaue Ryu' ? initialClubConfig.styleName : cfg.styleName,
      contactPerson: {
        ...cfg.contactPerson,
        role: isLegacyEmail ? initialClubConfig.contactPerson.role : cfg.contactPerson.role,
        email: isLegacyEmail ? initialClubConfig.contactPerson.email : cfg.contactPerson.email,
        phone: isLegacyPhone ? initialClubConfig.contactPerson.phone : cfg.contactPerson.phone,
      },
      dojoAddress: {
        ...cfg.dojoAddress,
        street: isLegacyStreet ? initialClubConfig.dojoAddress.street : cfg.dojoAddress.street,
        directions: isLegacyStreet ? initialClubConfig.dojoAddress.directions : cfg.dojoAddress.directions,
        transitInfo: isLegacyStreet ? initialClubConfig.dojoAddress.transitInfo : cfg.dojoAddress.transitInfo,
      },
    },
  };
}

function migrateLegacySiteContent(content: SiteContent): { data: SiteContent; changed: boolean } {
  const isLegacyHero = content.hero?.title === 'Mykhet overvinner rå styrke';
  const isLegacyAbout = content.aboutJuJitsu?.title === 'Hva er Tradisjonell Japansk Ju Jitsu?';
  if (!isLegacyHero && !isLegacyAbout) {
    return { data: content, changed: false };
  }
  return {
    changed: true,
    data: {
      ...content,
      hero: isLegacyHero ? { ...initialSiteContent.hero, bgImage: content.hero.bgImage } : content.hero,
      aboutJuJitsu: isLegacyAbout ? { ...initialSiteContent.aboutJuJitsu, image: content.aboutJuJitsu.image } : content.aboutJuJitsu,
    },
  };
}

function migrateLegacyClasses(clsList: TrainingClass[]): { data: TrainingClass[]; changed: boolean } {
  const hasOldPlaceholder =
    clsList.length === 6 &&
    clsList[0]?.id === 'c-1' &&
    clsList[0]?.day === 'Mandag' &&
    clsList[0]?.time === '17:30 – 18:30';
  if (!hasOldPlaceholder) {
    return { data: clsList, changed: false };
  }
  return { data: initialClasses, changed: true };
}

function migrateLegacyMediaLibrary(items: MediaItem[]): { data: MediaItem[]; changed: boolean } {
  const hasBrokenLogoUrl = items.some((item) => item.id === 'media-logo' && item.url === '/rjjk-logo.png');
  if (hasBrokenLogoUrl) {
    return {
      data: items.map((item) => (item.id === 'media-logo' ? { ...item, url: clubLogo } : item)),
      changed: true,
    };
  }
  if (items.some((item) => item.id === 'media-logo' || item.url === clubLogo)) {
    return { data: items, changed: false };
  }
  return { data: [initialMediaLibrary[0], ...items], changed: true };
}

export default function App() {
  const [currentTab, setCurrentTab] = useState<PageTab>('hjem');

  // Local storage state with fallbacks + automatic migration of legacy placeholder defaults
  const [clubConfig, setClubConfig] = useState<ClubConfig>(() => {
    try {
      const saved = localStorage.getItem('risor_jujutsu_club_config');
      return saved ? migrateLegacyClubConfig(JSON.parse(saved)).data : initialClubConfig;
    } catch {
      return initialClubConfig;
    }
  });

  const [instructors, setInstructors] = useState<Instructor[]>(() => {
    try {
      const saved = localStorage.getItem('risor_jujutsu_instructors');
      if (saved) {
        const parsed: Instructor[] = JSON.parse(saved);
        return parsed.map((inst) => {
          if (inst.id === 'kittel-gjernes') {
            return {
              ...inst,
              rank: '4. dan',
              title: 'Sensei / Klubbleder',
              role: 'Klubbleder og Hovedinstruktør Risør',
              email: inst.email === 'kittel@risorjujutsu.no' ? initialInstructors[1].email : inst.email,
              phone: inst.phone === '+47 920 14 550' ? initialInstructors[1].phone : inst.phone,
              certifications: [
                '4. dan sort belte Ju Jutsu (gradert v/ Soke Yamaue)',
                'Trener Sertifisering - Norges Kampsportforbund (NKF)',
                'Politiattest og førstehjelpsgodkjenning'
              ],
            };
          }
          return inst;
        });
      }
      return initialInstructors;
    } catch {
      return initialInstructors;
    }
  });

  const [summerCamp, setSummerCamp] = useState<SummerCampInfo>(() => {
    try {
      const saved = localStorage.getItem('risor_jujutsu_summer_camp');
      return saved ? JSON.parse(saved) : initialSummerCamp;
    } catch {
      return initialSummerCamp;
    }
  });

  const [classes, setClasses] = useState<TrainingClass[]>(() => {
    try {
      const saved = localStorage.getItem('risor_jujutsu_classes');
      return saved ? migrateLegacyClasses(JSON.parse(saved)).data : initialClasses;
    } catch {
      return initialClasses;
    }
  });

  const [vippsProducts, setVippsProducts] = useState<VippsProduct[]>(() => {
    try {
      const saved = localStorage.getItem('risor_jujutsu_vipps_products');
      if (saved) {
        const parsed: VippsProduct[] = JSON.parse(saved);
        const hasLegacyPrice = parsed.some((p) => p.id === 'vp-sem-voksen' && p.amount === 2450);
        return hasLegacyPrice ? initialVippsProducts : parsed;
      }
      return initialVippsProducts;
    } catch {
      return initialVippsProducts;
    }
  });

  // MFA & Auth states
  const [mfaConfig, setMfaConfig] = useState<AdminMFAConfig>(() => {
    try {
      const saved = localStorage.getItem('risor_jujutsu_mfa_config');
      return saved ? JSON.parse(saved) : initialMFAConfig;
    } catch {
      return initialMFAConfig;
    }
  });

  const [siteContent, setSiteContent] = useState<SiteContent>(() => {
    try {
      const saved = localStorage.getItem('risor_jujutsu_site_content');
      return saved ? migrateLegacySiteContent(JSON.parse(saved)).data : initialSiteContent;
    } catch {
      return initialSiteContent;
    }
  });

  const [mediaLibrary, setMediaLibrary] = useState<MediaItem[]>(() => {
    try {
      const saved = localStorage.getItem('risor_jujutsu_media_library');
      return saved ? migrateLegacyMediaLibrary(JSON.parse(saved)).data : initialMediaLibrary;
    } catch {
      return initialMediaLibrary;
    }
  });

  // Members hook & Trial inquiries hook
  const {
    members,
    addMember,
    updateMember,
    deleteMember,
    toggleFee,
    resetMembers,
  } = useMembers();

  const {
    trialBookings,
    updateStatus: updateTrialStatus,
    deleteBooking: deleteTrialBooking,
  } = useTrialBookings();

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);

  // Modal states
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isTrialOpen, setIsTrialOpen] = useState(false);
  const [activeVippsProduct, setActiveVippsProduct] = useState<VippsProduct | null>(null);

  // Real-time Firestore sync & connectivity test on initial boot
  useEffect(() => {
    testConnection();

    const unsubscribe = subscribeToClubData((cloudData) => {
      let needsCloudMigration = false;
      const migratedPayload: Partial<FullClubData> = {};

      if (cloudData.clubConfig) {
        const res = migrateLegacyClubConfig(cloudData.clubConfig);
        setClubConfig(res.data);
        if (res.changed) {
          needsCloudMigration = true;
          migratedPayload.clubConfig = res.data;
        }
      }
      if (cloudData.siteContent) {
        const res = migrateLegacySiteContent(cloudData.siteContent);
        setSiteContent(res.data);
        if (res.changed) {
          needsCloudMigration = true;
          migratedPayload.siteContent = res.data;
        }
      }
      if (cloudData.instructors) {
        const mapped = cloudData.instructors.map((inst) =>
          inst.id === 'kittel-gjernes' && inst.email === 'kittel@risorjujutsu.no'
            ? { ...inst, email: initialInstructors[1].email, phone: initialInstructors[1].phone, rank: '4. dan' }
            : inst
        );
        setInstructors(mapped);
      }
      if (cloudData.summerCamp) setSummerCamp(cloudData.summerCamp);
      if (cloudData.classes) {
        const res = migrateLegacyClasses(cloudData.classes);
        setClasses(res.data);
        if (res.changed) {
          needsCloudMigration = true;
          migratedPayload.classes = res.data;
        }
      }
      if (cloudData.mediaLibrary) {
        const res = migrateLegacyMediaLibrary(cloudData.mediaLibrary);
        setMediaLibrary(res.data);
        if (res.changed) {
          needsCloudMigration = true;
          migratedPayload.mediaLibrary = res.data;
        }
      }

      if (needsCloudMigration) {
        saveClubDataToFirestore(migratedPayload);
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('risor_jujutsu_club_config', JSON.stringify(clubConfig));
  }, [clubConfig]);

  useEffect(() => {
    localStorage.setItem('risor_jujutsu_instructors', JSON.stringify(instructors));
  }, [instructors]);

  useEffect(() => {
    localStorage.setItem('risor_jujutsu_summer_camp', JSON.stringify(summerCamp));
  }, [summerCamp]);

  useEffect(() => {
    localStorage.setItem('risor_jujutsu_classes', JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    localStorage.setItem('risor_jujutsu_mfa_config', JSON.stringify(mfaConfig));
  }, [mfaConfig]);

  useEffect(() => {
    localStorage.setItem('risor_jujutsu_site_content', JSON.stringify(siteContent));
  }, [siteContent]);

  useEffect(() => {
    localStorage.setItem('risor_jujutsu_media_library', JSON.stringify(mediaLibrary));
  }, [mediaLibrary]);

  const handleResetDefaults = () => {
    setClubConfig(initialClubConfig);
    setInstructors(initialInstructors);
    setSummerCamp(initialSummerCamp);
    setClasses(initialClasses);
    setVippsProducts(initialVippsProducts);
    setMfaConfig(initialMFAConfig);
    setSiteContent(initialSiteContent);
    setMediaLibrary(initialMediaLibrary);
    resetMembers();
    setIsAdminAuthenticated(false);
    localStorage.removeItem('risor_jujutsu_club_config');
    localStorage.removeItem('risor_jujutsu_instructors');
    localStorage.removeItem('risor_jujutsu_summer_camp');
    localStorage.removeItem('risor_jujutsu_classes');
    localStorage.removeItem('risor_jujutsu_vipps_products');
    localStorage.removeItem('risor_jujutsu_mfa_config');
    localStorage.removeItem('risor_jujutsu_site_content');
    localStorage.removeItem('risor_jujutsu_media_library');
    saveClubDataToFirestore({
      clubConfig: initialClubConfig,
      siteContent: initialSiteContent,
      instructors: initialInstructors,
      summerCamp: initialSummerCamp,
      classes: initialClasses,
      mediaLibrary: initialMediaLibrary,
    });
  };

  const handleOpenVippsCheckout = (product: VippsProduct) => {
    setActiveVippsProduct(product);
  };

  // Secure admin opening requiring 2FA MFA
  const handleOpenAdmin = () => {
    if (isAdminAuthenticated) {
      setIsAdminOpen(true);
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  const handleAdminLoginSuccess = () => {
    setIsAdminAuthenticated(true);
    setIsAdminOpen(true);
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    setIsAdminOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 selection:bg-amber-500 selection:text-stone-950 font-sans">
      {/* Navigation Header */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        clubConfig={clubConfig}
        onOpenAdmin={handleOpenAdmin}
        onOpenTrial={() => setIsTrialOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentTab === 'hjem' && (
          <div>
            <HeroSection
              clubConfig={clubConfig}
              siteContent={siteContent}
              onSelectTab={setCurrentTab}
              onOpenTrial={() => setIsTrialOpen(true)}
            />
            {/* Quick Teaser for Hva er Ju Jitsu */}
            <div className="bg-white border-b border-stone-200 py-16">
              <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto mb-12">
                  <span className="text-xs font-bold uppercase tracking-widest text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                    Tradisjonell kampform tilpasset moderne forhold
                  </span>
                  <h2 className="font-heading text-3xl font-extrabold text-stone-900 mt-3">
                    Mestring for liten og stor
                  </h2>
                  <p className="text-sm text-stone-600 mt-2 leading-relaxed">
                    Risør Ju Jutsu klubb er for alle som har lyst til å trene kampsport. 
                    Gjennom Goho (hard form) og Juho (myk form) lærer du funksjonell styrke, smertekontroll, kroppsbeherskelse og effektivt selvforsvar.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div 
                    onClick={() => setCurrentTab('tradisjon')}
                    className="p-6 rounded-2xl bg-stone-50 border border-stone-200 hover:border-amber-500/60 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="w-12 h-12 rounded-full bg-white border border-stone-200 p-1 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform overflow-hidden shadow-xs">
                      <img src={clubLogo} alt="Risør Ju Jutsu Klubb" className="w-full h-full object-contain rounded-full" />
                    </div>
                    <h3 className="font-heading font-bold text-lg text-stone-900 group-hover:text-amber-700 transition-colors">
                      Hva er Ju Jutsu?
                    </h3>
                    <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                      Kombinasjonen av tradisjonell kampsport og moderne selvforsvar: Goho (slag/spark) og Juho (frigjøringer, kast og låsinger).
                    </p>
                    <span className="mt-4 inline-block text-xs font-bold text-amber-700">
                      Les om Goho & Juho →
                    </span>
                  </div>

                  <div 
                    onClick={() => setCurrentTab('soke-yamaue')}
                    className="p-6 rounded-2xl bg-stone-50 border border-stone-200 hover:border-amber-500/60 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-stone-900 text-amber-400 font-heading text-xl font-bold flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                      宗
                    </div>
                    <h3 className="font-heading font-bold text-lg text-stone-900 group-hover:text-amber-700 transition-colors">
                      Soke Yamaue (København)
                    </h3>
                    <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                      Oppdag vår stilarts grunnlegger basert i Hombu Dojo i København og det tette samarbeidet med Risør.
                    </p>
                    <span className="mt-4 inline-block text-xs font-bold text-amber-700">
                      Utforsk stilarten →
                    </span>
                  </div>

                  <div 
                    onClick={() => setCurrentTab('sommerleir')}
                    className="p-6 rounded-2xl bg-stone-50 border border-stone-200 hover:border-amber-500/60 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-stone-900 text-amber-400 font-heading text-xl font-bold flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                      夏
                    </div>
                    <h3 className="font-heading font-bold text-lg text-stone-900 group-hover:text-amber-700 transition-colors">
                      Årlig Sommerleir 2026
                    </h3>
                    <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                      19.–21. juni i Risørhallen med Soke Yamaue. Tre dager med intensiv trening, leddlåser og gradering.
                    </p>
                    <span className="mt-4 inline-block text-xs font-bold text-amber-700">
                      Se program & påmelding →
                    </span>
                  </div>
                </div>

                <div className="text-center pt-2">
                  <button
                    onClick={() => setCurrentTab('treningstider')}
                    className="px-6 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs uppercase tracking-wider transition-colors inline-flex items-center gap-2 cursor-pointer shadow"
                  >
                    <span>Se hele timeplanen for voksne & barn</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Dedicated Klubbleder Section on Homepage */}
            <div className="bg-stone-100 border-b border-stone-200 py-16">
              <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-10 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                  <div className="md:col-span-5 relative">
                    <div className="relative rounded-2xl overflow-hidden aspect-[4/5] bg-stone-900 border border-stone-200 shadow-md group">
                      <img
                        src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80"
                        alt="Kittel Gjernes - Klubbleder"
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-4 left-4 bg-stone-950/90 text-amber-400 border border-amber-500/40 px-3 py-1 rounded-xl text-xs font-mono font-bold shadow">
                        4. dan Sensei
                      </div>
                      <div className="absolute bottom-4 left-4 right-4 bg-stone-950/85 backdrop-blur-md p-3.5 rounded-xl border border-stone-800 text-white text-xs">
                        <span className="font-bold text-amber-400 block text-xs">Sensei & Klubbleder</span>
                        <span className="text-stone-300 text-[11px]">{clubConfig.dojoAddress.street}, {clubConfig.dojoAddress.postalCode} {clubConfig.dojoAddress.city}</span>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-7 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold uppercase tracking-wider">
                      <span>Klubbens Ledelse i Risør</span>
                    </div>
                    <h2 className="font-heading text-3xl font-extrabold text-stone-900">
                      Sensei Kittel Gjernes
                    </h2>
                    <div className="flex flex-wrap items-center gap-2.5 text-xs text-stone-600 font-medium">
                      <span className="px-2.5 py-1 rounded-md bg-stone-900 text-amber-400 font-mono font-bold text-xs">
                        4. dan sort belte
                      </span>
                      <span>Klubbleder og Hovedinstruktør • Risør Ju Jutsu Klubb</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-stone-50 border-l-4 border-amber-500 text-xs italic text-stone-700 leading-relaxed">
                      «Gå til Dojoen, ha det gøy, har du det gøy kommer du tilbake. Kommer du tilbake blir du dyktig.»
                    </div>

                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                      Sensei Kittel Gjernes (4. dan sort belte) er en av de i Norge som har holdt på lengst med Ju Jutsu. 
                      Sammen med klubbens instruktørteam leder han treningene i underetasjen i Risørhallen for både barn (fra 2. klasse) og voksne (fra 15 år). 
                      Bryt dine barrierer og opplev trygghet, samhold, respekt og funksjonell styrke på matten.
                    </p>

                    <div className="pt-2 flex flex-wrap gap-3">
                      <button
                        onClick={() => setCurrentTab('instruktorer')}
                        className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow"
                      >
                        Se instruktørprofil
                      </button>
                      <button
                        onClick={() => setIsTrialOpen(true)}
                        className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all shadow cursor-pointer"
                      >
                        Meld på prøvetime
                      </button>
                      <button
                        onClick={() => setCurrentTab('kontakt')}
                        className="px-4 py-2.5 rounded-xl bg-white hover:bg-stone-100 text-stone-800 font-semibold text-xs transition-all border border-stone-300 cursor-pointer"
                      >
                        Kontakt Kittel ({clubConfig.contactPerson.phone})
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentTab === 'tradisjon' && (
          <AboutJuJitsu
            siteContent={siteContent}
            onSelectTab={setCurrentTab}
            onOpenTrial={() => setIsTrialOpen(true)}
          />
        )}

        {currentTab === 'soke-yamaue' && (
          <SokeYamaue
            clubConfig={clubConfig}
            siteContent={siteContent}
            onSelectTab={setCurrentTab}
            onOpenTrial={() => setIsTrialOpen(true)}
          />
        )}

        {currentTab === 'treningstider' && (
          <ScheduleSection
            classes={classes}
            instructors={instructors}
            onUpdateClasses={setClasses}
            onSelectTab={setCurrentTab}
            onOpenTrial={() => setIsTrialOpen(true)}
          />
        )}

        {currentTab === 'sommerleir' && (
          <SummerCampSection
            camp={summerCamp}
            clubConfig={clubConfig}
            onOpenAdmin={handleOpenAdmin}
            onPayVipps={handleOpenVippsCheckout}
          />
        )}

        {currentTab === 'vipps' && (
          <VippsPaymentSection
            products={vippsProducts}
            clubConfig={clubConfig}
            onPayVipps={handleOpenVippsCheckout}
            onSelectTab={setCurrentTab}
          />
        )}

        {currentTab === 'dojo-kart' && (
          <LocationSection
            clubConfig={clubConfig}
            onSelectTab={setCurrentTab}
            onOpenTrial={() => setIsTrialOpen(true)}
          />
        )}

        {currentTab === 'instruktorer' && (
          <InstructorsSection
            instructors={instructors}
            clubConfig={clubConfig}
            onUpdateInstructors={setInstructors}
            onOpenAdmin={handleOpenAdmin}
            onSelectTab={setCurrentTab}
            onOpenTrial={() => setIsTrialOpen(true)}
          />
        )}

        {currentTab === 'kontakt' && (
          <ContactSection
            clubConfig={clubConfig}
            onSelectTab={setCurrentTab}
            onOpenTrial={() => setIsTrialOpen(true)}
          />
        )}
      </main>

      {/* Global Modals */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={handleAdminLoginSuccess}
        mfaConfig={mfaConfig}
        clubConfig={clubConfig}
        onUpdateMFAConfig={setMfaConfig}
      />

      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        clubConfig={clubConfig}
        onUpdateClubConfig={setClubConfig}
        summerCamp={summerCamp}
        onUpdateSummerCamp={setSummerCamp}
        instructors={instructors}
        onUpdateInstructors={setInstructors}
        classes={classes}
        onUpdateClasses={setClasses}
        onResetDefaults={handleResetDefaults}
        mfaConfig={mfaConfig}
        onUpdateMFAConfig={setMfaConfig}
        onLogout={handleAdminLogout}
        siteContent={siteContent}
        onUpdateSiteContent={setSiteContent}
        mediaLibrary={mediaLibrary}
        onUpdateMediaLibrary={setMediaLibrary}
        members={members}
        onAddMember={addMember}
        onUpdateMember={updateMember}
        onDeleteMember={deleteMember}
        onToggleFee={toggleFee}
        trialBookings={trialBookings}
        onUpdateTrialBookingStatus={updateTrialStatus}
        onDeleteTrialBooking={deleteTrialBooking}
      />

      <VippsModal
        isOpen={!!activeVippsProduct}
        product={activeVippsProduct}
        clubConfig={clubConfig}
        onClose={() => setActiveVippsProduct(null)}
      />

      <TrialBookingModal
        isOpen={isTrialOpen}
        onClose={() => setIsTrialOpen(false)}
        clubConfig={clubConfig}
      />

      {/* Footer */}
      <Footer
        clubConfig={clubConfig}
        onSelectTab={setCurrentTab}
        onOpenAdmin={handleOpenAdmin}
      />
    </div>
  );
}
