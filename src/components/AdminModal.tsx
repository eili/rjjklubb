import React, { useState, useEffect } from 'react';
import { ClubConfig, Instructor, SummerCampInfo, TrainingClass } from '../types';
import { 
  X, 
  Settings, 
  Users, 
  Sun, 
  Save, 
  Plus, 
  Trash2, 
  QrCode, 
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Calendar
} from 'lucide-react';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  clubConfig: ClubConfig;
  onUpdateClubConfig: (cfg: ClubConfig) => void;
  summerCamp: SummerCampInfo;
  onUpdateSummerCamp: (camp: SummerCampInfo) => void;
  instructors: Instructor[];
  onUpdateInstructors: (insts: Instructor[]) => void;
  classes?: TrainingClass[];
  onUpdateClasses?: (classes: TrainingClass[]) => void;
  onResetDefaults: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  clubConfig,
  onUpdateClubConfig,
  summerCamp,
  onUpdateSummerCamp,
  instructors,
  onUpdateInstructors,
  classes = [],
  onUpdateClasses,
  onResetDefaults,
}) => {
  const [activeTab, setActiveTab] = useState<'leir' | 'instruktorer' | 'klubb'>('leir');
  const [saveToast, setSaveToast] = useState(false);

  // Local state copies
  const [tempConfig, setTempConfig] = useState<ClubConfig>(clubConfig);
  const [tempCamp, setTempCamp] = useState<SummerCampInfo>(summerCamp);
  const [tempInstructors, setTempInstructors] = useState<Instructor[]>(instructors);

  // New instructor form
  const [showAddInst, setShowAddInst] = useState(false);
  const [newInst, setNewInst] = useState<Partial<Instructor>>({
    name: '',
    title: 'Sensei',
    rank: '1. Dan',
    experienceYears: 8,
    role: 'Hjelpeinstruktør',
    bio: '',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
    specialties: ['Kast', 'Fallteknikk'],
  });

  // Keyboard shortcut (Escape) & prevent body scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const triggerSaveToast = () => {
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  const handleSaveAll = () => {
    onUpdateClubConfig(tempConfig);
    onUpdateSummerCamp(tempCamp);
    onUpdateInstructors(tempInstructors);
    triggerSaveToast();
  };

  const handleAddInstructor = () => {
    if (!newInst.name) return;
    const created: Instructor = {
      id: 'inst-' + Date.now(),
      name: newInst.name,
      title: newInst.title || 'Sensei',
      rank: newInst.rank || '1. Dan',
      experienceYears: Number(newInst.experienceYears) || 5,
      role: newInst.role || 'Instruktør',
      bio: newInst.bio || 'Engasjert instruktør med fokus på trygg progresjon og Budo-tradisjon.',
      image: newInst.image || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
      specialties: newInst.specialties || ['Selvforsvar'],
    };
    const updated = [...tempInstructors, created];
    setTempInstructors(updated);
    onUpdateInstructors(updated);
    setShowAddInst(false);
    setNewInst({ name: '', title: 'Sensei', rank: '1. Dan', experienceYears: 8, role: 'Instruktør', bio: '', specialties: ['Kast'] });
    triggerSaveToast();
  };

  const handleDeleteInstructor = (id: string) => {
    if (confirm('Er du sikker på at du vil fjerne denne instruktøren?')) {
      const updated = tempInstructors.filter((i) => i.id !== id);
      setTempInstructors(updated);
      onUpdateInstructors(updated);
      triggerSaveToast();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col border border-stone-200 shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="bg-stone-900 text-white px-6 py-4 flex items-center justify-between border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-white">Klubbadministrasjon & Vedlikehold</h3>
              <p className="text-[11px] text-stone-400">
                Oppdater instruktører, sommerleir, priser og Vippsnummer
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white transition-all border border-stone-700 text-xs font-semibold cursor-pointer shadow-sm active:scale-95"
            aria-label="Lukk administrasjonsvindu"
          >
            <span>Lukk</span>
            <X className="w-4 h-4 text-stone-300" />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="bg-stone-100 border-b border-stone-200 px-6 pt-3 flex flex-wrap gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('leir')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
              activeTab === 'leir'
                ? 'bg-white text-stone-900 border-t-2 border-amber-500 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Sun className="w-4 h-4 text-amber-500" />
            <span>Vedlikehold Sommerleir</span>
          </button>

          <button
            onClick={() => setActiveTab('instruktorer')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
              activeTab === 'instruktorer'
                ? 'bg-white text-stone-900 border-t-2 border-amber-500 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Users className="w-4 h-4 text-amber-500" />
            <span>Vedlikehold Instruktører ({tempInstructors.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('klubb')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
              activeTab === 'klubb'
                ? 'bg-white text-stone-900 border-t-2 border-amber-500 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <QrCode className="w-4 h-4 text-[#ff5b24]" />
            <span>Vipps & Klubbinnstillinger</span>
          </button>
        </div>

        {/* Content Body (Scrollable) */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs text-stone-700">
          
          {/* TAB 1: Sommerleir */}
          {activeTab === 'leir' && (
            <div className="space-y-5">
              <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl flex items-start gap-3">
                <Sun className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-amber-900 text-sm">Administrasjon av Årlig Sommerleir</h4>
                  <p className="text-[11px] text-amber-800 leading-relaxed mt-0.5">
                    Her kan instruktører og styret oppdatere leir-tema, datoer, gjesteinstruktør (Soke Yamaue fra København) og priser for leirpass. Endringene lagres direkte på nettsiden.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">Leirtema</label>
                  <input
                    type="text"
                    value={tempCamp.theme}
                    onChange={(e) => setTempCamp({ ...tempCamp, theme: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">Datoer</label>
                  <input
                    type="text"
                    value={tempCamp.dates}
                    onChange={(e) => setTempCamp({ ...tempCamp, dates: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">Spesiell gjestelærer</label>
                  <input
                    type="text"
                    value={tempCamp.specialGuest}
                    onChange={(e) => setTempCamp({ ...tempCamp, specialGuest: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">Gjestens rolle / tittel</label>
                  <input
                    type="text"
                    value={tempCamp.specialGuestRole}
                    onChange={(e) => setTempCamp({ ...tempCamp, specialGuestRole: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">Påmeldingsstatus</label>
                  <select
                    value={tempCamp.status}
                    onChange={(e) => setTempCamp({ ...tempCamp, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:border-amber-500"
                  >
                    <option>Åpen for påmelding</option>
                    <option>Få plasser igjen</option>
                    <option>Fulltegnet</option>
                  </select>
                </div>
              </div>

              {/* Prices */}
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-3">
                <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider">
                  Priser for sommerleir (NOK)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[10px] text-stone-500 mb-1">Full helg (Voksen)</label>
                    <input
                      type="number"
                      value={tempCamp.prices.fullCampAdult}
                      onChange={(e) => setTempCamp({
                        ...tempCamp,
                        prices: { ...tempCamp.prices, fullCampAdult: Number(e.target.value) }
                      })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-stone-500 mb-1">Full helg (Ungdom)</label>
                    <input
                      type="number"
                      value={tempCamp.prices.fullCampYouth}
                      onChange={(e) => setTempCamp({
                        ...tempCamp,
                        prices: { ...tempCamp.prices, fullCampYouth: Number(e.target.value) }
                      })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-stone-500 mb-1">Dagspass</label>
                    <input
                      type="number"
                      value={tempCamp.prices.singleDayAdult}
                      onChange={(e) => setTempCamp({
                        ...tempCamp,
                        prices: { ...tempCamp.prices, singleDayAdult: Number(e.target.value) }
                      })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-stone-500 mb-1">Festmiddag lørdag</label>
                    <input
                      type="number"
                      value={tempCamp.prices.dinnerParty}
                      onChange={(e) => setTempCamp({
                        ...tempCamp,
                        prices: { ...tempCamp.prices, dinnerParty: Number(e.target.value) }
                      })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs font-bold"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">Leirbeskrivelse</label>
                <textarea
                  rows={3}
                  value={tempCamp.description}
                  onChange={(e) => setTempCamp({ ...tempCamp, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                />
              </div>
            </div>
          )}

          {/* TAB 2: Instruktører */}
          {activeTab === 'instruktorer' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-stone-900 text-sm">Vedlikehold Instruktøroversikt</h4>
                  <p className="text-[11px] text-stone-500">
                    Rediger eksisterende instruktører eller legg til nye trenere for klubben.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddInst(!showAddInst)}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{showAddInst ? 'Avbryt' : 'Ny Instruktør'}</span>
                </button>
              </div>

              {/* Add form */}
              {showAddInst && (
                <div className="bg-stone-50 border border-stone-300 p-4 rounded-2xl space-y-3 animate-in fade-in">
                  <h5 className="font-bold text-stone-900 text-xs uppercase tracking-wider">
                    Legg til ny instruktør
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Fullt navn (f.eks. Sensei Jonas Moe)"
                      value={newInst.name}
                      onChange={(e) => setNewInst({ ...newInst, name: e.target.value })}
                      className="px-3 py-1.5 rounded-lg border border-stone-300 text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Grad (f.eks. 2. Dan)"
                      value={newInst.rank}
                      onChange={(e) => setNewInst({ ...newInst, rank: e.target.value })}
                      className="px-3 py-1.5 rounded-lg border border-stone-300 text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Rolle (f.eks. Ungdomstrener)"
                      value={newInst.role}
                      onChange={(e) => setNewInst({ ...newInst, role: e.target.value })}
                      className="px-3 py-1.5 rounded-lg border border-stone-300 text-xs"
                    />
                  </div>
                  <textarea
                    rows={2}
                    placeholder="Kort biografi og kampsportbakgrunn..."
                    value={newInst.bio}
                    onChange={(e) => setNewInst({ ...newInst, bio: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs"
                  />
                  <button
                    onClick={handleAddInstructor}
                    className="px-4 py-2 bg-stone-900 text-white font-bold text-xs rounded-lg"
                  >
                    Lagre instruktør
                  </button>
                </div>
              )}

              {/* Instructor List */}
              <div className="space-y-3">
                {tempInstructors.map((inst, index) => (
                  <div
                    key={inst.id}
                    className="bg-stone-50 p-4 rounded-xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={inst.image}
                        alt={inst.name}
                        className="w-12 h-12 rounded-xl object-cover border border-stone-300"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-900 text-sm">{inst.name}</span>
                          <span className="px-2 py-0.2 rounded bg-stone-200 text-stone-700 font-mono text-[10px]">
                            {inst.rank}
                          </span>
                          {inst.isGuestInstructor && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[9px] font-bold">
                              København
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-stone-500">{inst.role} • {inst.experienceYears} års erfaring</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {!inst.isGuestInstructor && (
                        <button
                          onClick={() => handleDeleteInstructor(inst.id)}
                          className="p-2 text-stone-400 hover:text-red-600 transition-colors"
                          title="Slett instruktør"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Vipps & Klubbinnstillinger */}
          {activeTab === 'klubb' && (
            <div className="space-y-5">
              <div className="bg-[#ff5b24]/10 border border-[#ff5b24]/30 p-4 rounded-2xl flex items-start gap-3">
                <QrCode className="w-5 h-5 text-[#ff5b24] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-stone-900 text-sm">Vippsnummer & Kontaktperson</h4>
                  <p className="text-[11px] text-stone-600 leading-relaxed mt-0.5">
                    Endre klubbens offisielle Vippsnummer. Alle QR-koder og betalingslenker på nettsiden oppdateres automatisk til dette nummeret!
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">Klubbens Vippsnummer *</label>
                  <input
                    type="text"
                    value={tempConfig.vippsNumber}
                    onChange={(e) => setTempConfig({ ...tempConfig, vippsNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 font-mono font-bold text-stone-900 text-sm focus:border-[#ff5b24]"
                  />
                  <p className="text-[10px] text-stone-400 mt-1">Dette vises på QR-kodene og i instruksjonene.</p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">Klubbnavn</label>
                  <input
                    type="text"
                    value={tempConfig.clubName}
                    onChange={(e) => setTempConfig({ ...tempConfig, clubName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-stone-200">
                <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider mb-3">
                  Kontaktperson i klubben
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-stone-500 mb-1">Navn</label>
                    <input
                      type="text"
                      value={tempConfig.contactPerson.name}
                      onChange={(e) => setTempConfig({
                        ...tempConfig,
                        contactPerson: { ...tempConfig.contactPerson, name: e.target.value }
                      })}
                      className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-stone-500 mb-1">Rolle</label>
                    <input
                      type="text"
                      value={tempConfig.contactPerson.role}
                      onChange={(e) => setTempConfig({
                        ...tempConfig,
                        contactPerson: { ...tempConfig.contactPerson, role: e.target.value }
                      })}
                      className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-stone-500 mb-1">Telefon</label>
                    <input
                      type="text"
                      value={tempConfig.contactPerson.phone}
                      onChange={(e) => setTempConfig({
                        ...tempConfig,
                        contactPerson: { ...tempConfig.contactPerson, phone: e.target.value }
                      })}
                      className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-stone-500 mb-1">E-post</label>
                    <input
                      type="email"
                      value={tempConfig.contactPerson.email}
                      onChange={(e) => setTempConfig({
                        ...tempConfig,
                        contactPerson: { ...tempConfig.contactPerson, email: e.target.value }
                      })}
                      className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-stone-100 p-4 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (confirm('Nullstille alle data til standardinnstillinger?')) {
                  onResetDefaults();
                  onClose();
                }
              }}
              className="px-3 py-2 text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Tilbakestill standard</span>
            </button>

            {saveToast && (
              <span className="text-emerald-700 font-bold text-xs flex items-center gap-1 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" />
                Endringer lagret!
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-xs rounded-xl"
            >
              Lukk
            </button>
            <button
              onClick={handleSaveAll}
              className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow"
            >
              <Save className="w-4 h-4 text-amber-400" />
              <span>Lagre alle endringer</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
