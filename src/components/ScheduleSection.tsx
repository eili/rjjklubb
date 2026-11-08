import React, { useState } from 'react';
import { TrainingClass, Instructor, PageTab } from '../types';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  MapPin, 
  Plus, 
  Edit2, 
  Trash2, 
  Filter, 
  CheckCircle2, 
  X, 
  Save, 
  ShieldCheck, 
  Sparkles,
  Users,
  Info,
  CalendarCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ScheduleSectionProps {
  classes: TrainingClass[];
  instructors: Instructor[];
  onUpdateClasses: (classes: TrainingClass[]) => void;
  onSelectTab: (tab: PageTab) => void;
  onOpenTrial: () => void;
}

const DAYS_ORDER: ('Mandag' | 'Tirsdag' | 'Onsdag' | 'Torsdag' | 'Fredag' | 'Lørdag' | 'Søndag')[] = [
  'Mandag',
  'Tirsdag',
  'Onsdag',
  'Torsdag',
  'Fredag',
  'Lørdag',
  'Søndag',
];

export const ScheduleSection: React.FC<ScheduleSectionProps> = ({
  classes,
  instructors,
  onUpdateClasses,
  onSelectTab,
  onOpenTrial,
}) => {
  const [selectedGroup, setSelectedGroup] = useState<string>('alle');
  const [selectedDay, setSelectedDay] = useState<string>('alle');
  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('calendar');
  const [adminMode, setAdminMode] = useState(false);

  // Edit / Add Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<TrainingClass | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const groups = [
    { id: 'alle', label: 'Alle partier' },
    { id: 'Barn & Ungdom (8-13 år)', label: 'Barn & Ungdom' },
    { id: 'Voksne Nybegynnere', label: 'Voksne Nybegynnere' },
    { id: 'Voksne Viderekomne', label: 'Viderekomne' },
    { id: 'Åpen Matte / Egentrening', label: 'Åpen Matte' },
  ];

  const filteredClasses = classes.filter((cls) => {
    const matchGroup = selectedGroup === 'alle' || cls.targetGroup === selectedGroup;
    const matchDay = selectedDay === 'alle' || cls.day === selectedDay;
    return matchGroup && matchDay;
  });

  // Open modal for new session
  const handleOpenAdd = (defaultDay?: 'Mandag' | 'Tirsdag' | 'Onsdag' | 'Torsdag' | 'Fredag' | 'Lørdag' | 'Søndag') => {
    setEditingSession({
      id: 'session-' + Date.now(),
      day: defaultDay || 'Mandag',
      time: '18:00 – 19:30',
      name: '',
      targetGroup: 'Voksne Nybegynnere',
      instructor: instructors[1]?.name || 'Kittel Gjernes',
      room: 'Tatami 1 (Hoveddojo)',
      description: '',
      maxSpots: 20,
    });
    setModalOpen(true);
  };

  // Open modal for editing session
  const handleOpenEdit = (session: TrainingClass) => {
    setEditingSession({ ...session });
    setModalOpen(true);
  };

  // Delete session
  const handleDelete = (id: string, name: string) => {
    if (confirm(`Er du sikker på at du vil slette treningsøkten «${name}»?`)) {
      const updated = classes.filter((c) => c.id !== id);
      onUpdateClasses(updated);
      showToast('Treningsøkten ble slettet');
    }
  };

  // Save Add/Edit
  const handleSaveSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSession || !editingSession.name || !editingSession.time) return;

    const exists = classes.some((c) => c.id === editingSession.id);
    let updated: TrainingClass[];
    if (exists) {
      updated = classes.map((c) => (c.id === editingSession.id ? editingSession : c));
      showToast('Treningsøkten ble oppdatert');
    } else {
      updated = [...classes, editingSession];
      showToast('Ny treningsøkt lagt til i kalenderen');
      try {
        confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 } });
      } catch {
        // ignore
      }
    }

    onUpdateClasses(updated);
    setModalOpen(false);
    setEditingSession(null);
  };

  return (
    <div className="bg-stone-50 text-stone-900 min-h-screen">
      {/* Top Banner */}
      <section className="bg-stone-900 text-stone-100 py-16 border-b border-stone-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-800 text-amber-400 text-xs font-semibold uppercase tracking-wider border border-stone-700">
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Dynamisk Treningskalender</span>
            </div>

            {/* Admin toggle and Add button */}
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 bg-stone-800/90 border border-stone-700 px-3 py-1.5 rounded-xl cursor-pointer select-none text-xs text-stone-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={adminMode}
                  onChange={(e) => setAdminMode(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-0 cursor-pointer"
                />
                <span className="font-semibold">Administrator-modus</span>
              </label>

              <button
                onClick={() => handleOpenAdd()}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Legg til treningsøkt</span>
              </button>
            </div>
          </div>

          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
            Treningstider & Partier
          </h1>
          <p className="text-stone-300 text-base sm:text-lg max-w-3xl leading-relaxed">
            Her finner du ukens fulle treningsoversikt. Både barn, ungdom, nybegynnere og viderekomne 
            kan trene regelmessig i dojoen. Administratorer kan legge til, redigere og slette økter direkte.
          </p>

          {/* Toast message notification */}
          {toastMessage && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{toastMessage}</span>
            </div>
          )}
        </div>
      </section>

      {/* Main Container */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Controls Toolbar: Filters & View Switcher */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* View mode toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewMode === 'calendar'
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                <CalendarCheck className="w-3.5 h-3.5" />
                <span>Ukesvisning</span>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewMode === 'grid'
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Kortliste ({filteredClasses.length})</span>
              </button>
            </div>

            {/* Target group filter pills */}
            <div className="flex flex-wrap gap-1.5">
              {groups.map((grp) => (
                <button
                  key={grp.id}
                  onClick={() => setSelectedGroup(grp.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    selectedGroup === grp.id
                      ? 'bg-amber-500 text-stone-950 font-bold'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {grp.label}
                </button>
              ))}
            </div>
          </div>

          {/* Day Selector Pills for mobile/quick filter */}
          <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-medium text-stone-400 mr-1">Filtrer dag:</span>
            {['alle', ...DAYS_ORDER].map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDay(d)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  selectedDay === d
                    ? 'bg-stone-900 text-white font-bold'
                    : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                {d === 'alle' ? 'Alle dager' : d}
              </button>
            ))}
          </div>
        </div>

        {/* VIEW 1: Ukesvisning / Dynamic Calendar Grid */}
        {viewMode === 'calendar' && (
          <div className="space-y-6 mb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {DAYS_ORDER.map((dayName) => {
                const daySessions = classes.filter((c) => c.day === dayName);
                if (selectedDay !== 'alle' && selectedDay !== dayName) return null;

                return (
                  <div
                    key={dayName}
                    className={`bg-white rounded-3xl border flex flex-col justify-between transition-all shadow-sm ${
                      daySessions.length > 0 ? 'border-stone-200' : 'border-stone-100 opacity-70'
                    }`}
                  >
                    <div>
                      {/* Day Header */}
                      <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/80 rounded-t-3xl">
                        <div className="flex items-center gap-2">
                          <span className="font-heading font-extrabold text-stone-900 text-base">
                            {dayName}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-stone-200 text-stone-700">
                            {daySessions.length} {daySessions.length === 1 ? 'økt' : 'økter'}
                          </span>
                        </div>
                        {adminMode && (
                          <button
                            onClick={() => handleOpenAdd(dayName)}
                            className="p-1 rounded-lg hover:bg-stone-200 text-amber-700"
                            title={`Legg til økt på ${dayName}`}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Sessions on this day */}
                      <div className="p-3.5 space-y-3">
                        {daySessions.length === 0 ? (
                          <div className="py-6 text-center text-xs text-stone-400 italic">
                            Ingen faste treninger denne dagen.
                          </div>
                        ) : (
                          daySessions.map((session) => (
                            <div
                              key={session.id}
                              className="p-3.5 rounded-2xl bg-stone-50 hover:bg-stone-100/90 border border-stone-200/80 transition-all space-y-2 relative group"
                            >
                              {/* Time & Group */}
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-mono font-bold text-stone-900 flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                                  {session.time}
                                </span>
                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-200 text-stone-800 truncate max-w-[120px]">
                                  {session.targetGroup.split(' ')[0]}
                                </span>
                              </div>

                              {/* Title */}
                              <h4 className="font-heading font-bold text-stone-900 text-sm leading-snug">
                                {session.name}
                              </h4>

                              {/* Room & Instructor */}
                              <div className="text-[11px] text-stone-500 space-y-1">
                                <div className="flex items-center gap-1.5">
                                  <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                                  <span className="font-medium text-stone-700">{session.room}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <User className="w-3 h-3 text-stone-400 shrink-0" />
                                  <span>{session.instructor}</span>
                                </div>
                              </div>

                              {/* Admin or User Actions */}
                              <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between text-[11px]">
                                {adminMode ? (
                                  <div className="flex items-center gap-2 w-full justify-between">
                                    <button
                                      onClick={() => handleOpenEdit(session)}
                                      className="text-stone-700 hover:text-amber-700 font-bold flex items-center gap-1"
                                    >
                                      <Edit2 className="w-3 h-3" />
                                      Rediger
                                    </button>
                                    <button
                                      onClick={() => handleDelete(session.id, session.name)}
                                      className="text-red-500 hover:text-red-700 font-bold flex items-center gap-1"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                      Slett
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={onOpenTrial}
                                    className="text-amber-700 font-bold hover:underline flex items-center gap-1"
                                  >
                                    Meld prøvetime →
                                  </button>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Bottom Add shortcut in day card */}
                    {adminMode && (
                      <div className="p-3 border-t border-stone-100 bg-stone-50/50 rounded-b-3xl">
                        <button
                          onClick={() => handleOpenAdd(dayName)}
                          className="w-full py-1.5 rounded-xl border border-dashed border-stone-300 text-stone-600 hover:border-amber-500 hover:text-amber-700 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Legg til økt</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VIEW 2: Detaljert Listevisning */}
        {viewMode === 'grid' && (
          <div className="space-y-4 mb-12">
            {filteredClasses.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-stone-200">
                <p className="text-stone-500 text-sm">Ingen treninger funnet med dette filteret.</p>
                <button
                  onClick={() => {
                    setSelectedGroup('alle');
                    setSelectedDay('alle');
                  }}
                  className="mt-3 text-xs text-amber-600 font-bold hover:underline"
                >
                  Nullstill filtre
                </button>
              </div>
            ) : (
              filteredClasses.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl border border-stone-200 hover:border-amber-500/50 p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  {/* Left: Time & Day */}
                  <div className="flex items-center gap-4 min-w-[220px]">
                    <div className="w-14 h-14 rounded-2xl bg-stone-900 text-amber-400 flex flex-col items-center justify-center font-bold text-center shrink-0 border border-stone-800 shadow">
                      <span className="text-[10px] uppercase font-sans tracking-wider text-stone-400">
                        {item.day.slice(0, 3)}
                      </span>
                      <span className="text-xs font-mono">{item.day}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-stone-900 font-extrabold text-base font-mono">
                        <Clock className="w-4 h-4 text-amber-600" />
                        <span>{item.time}</span>
                      </div>
                      <div className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-600" />
                        <span className="font-medium text-stone-700">{item.room}</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Details */}
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-heading font-bold text-stone-900 text-base">
                        {item.name}
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-700 border border-stone-200">
                        {item.targetGroup}
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 leading-relaxed max-w-xl">
                      {item.description}
                    </p>
                    <div className="text-[11px] text-stone-500 flex items-center gap-2 pt-1">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-amber-600" />
                        Instruktør: <strong>{item.instructor}</strong>
                      </span>
                      {item.maxSpots && (
                        <span className="text-stone-400">• Maks {item.maxSpots} deltagere</span>
                      )}
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="shrink-0 flex items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-stone-100">
                    {adminMode ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition-colors flex items-center gap-1"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Rediger</span>
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.name)}
                          className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl transition-colors flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Slett</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={onOpenTrial}
                        className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs tracking-wider uppercase transition-all shadow-sm cursor-pointer whitespace-nowrap"
                      >
                        Prøvetime
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Practical Guide for Beginners */}
        <div className="bg-white rounded-3xl border border-stone-200 p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-700">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-xl text-stone-900">
                Første gang på trening? Dette må du vite
              </h3>
              <p className="text-xs text-stone-500">
                Praktisk informasjon til nye utøvere og foresatte
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-stone-600">
            <div className="space-y-2 bg-stone-50 p-4 rounded-2xl border border-stone-200/80">
              <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Klær & Utstyr
              </h4>
              <p className="leading-relaxed">
                Vanlig t-skjorte og lang treningsbukse (joggebukse). Vi trener 
                barbent på myke tatami-matter. Ingen sko, smykker eller klokker på matten.
              </p>
            </div>

            <div className="space-y-2 bg-stone-50 p-4 rounded-2xl border border-stone-200/80">
              <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Oppmøtetid
              </h4>
              <p className="leading-relaxed">
                Møt opp 10–15 minutter før start. Da rekker instruktøren å vise deg 
                garderoben, forklare dojo-etikette og ønske deg velkommen.
              </p>
            </div>

            <div className="space-y-2 bg-stone-50 p-4 rounded-2xl border border-stone-200/80">
              <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Gratis Prøvetime
              </h4>
              <p className="leading-relaxed">
                Første time er <strong>100% gratis og uforpliktende</strong>. Du kan 
                melde deg på via nettsiden eller bare møte opp til en nybegynnerøkt.
              </p>
            </div>
          </div>
        </div>

      </section>

      {/* Add / Edit Training Session Modal */}
      {modalOpen && editingSession && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-sm overflow-y-auto animate-in fade-in"
          onClick={() => setModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-7 space-y-4 border border-stone-200 shadow-2xl my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold">
                  <CalendarIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base text-stone-900">
                    {classes.some((c) => c.id === editingSession.id) ? 'Rediger treningsøkt' : 'Legg til ny treningsøkt'}
                  </h3>
                  <p className="text-[11px] text-stone-500">Oppdater dag, tid og lokasjon</p>
                </div>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSession} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">Ukedag *</label>
                  <select
                    value={editingSession.day}
                    onChange={(e) => setEditingSession({ ...editingSession, day: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-xl bg-white text-stone-900"
                  >
                    {DAYS_ORDER.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">Klokkeslett (f.eks. 18:00 – 19:30) *</label>
                  <input
                    type="text"
                    required
                    placeholder="18:00 – 19:30"
                    value={editingSession.time}
                    onChange={(e) => setEditingSession({ ...editingSession, time: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">Øktens Navn / Tittel *</label>
                <input
                  type="text"
                  required
                  placeholder="f.eks. Voksne Nybegynnere & Grunnkurs"
                  value={editingSession.name}
                  onChange={(e) => setEditingSession({ ...editingSession, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">Målgruppe / Nivå *</label>
                  <select
                    value={editingSession.targetGroup}
                    onChange={(e) => setEditingSession({ ...editingSession, targetGroup: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-xl bg-white text-stone-900"
                  >
                    <option value="Barn & Ungdom (8-13 år)">Barn & Ungdom (8-13 år)</option>
                    <option value="Voksne Nybegynnere">Voksne Nybegynnere</option>
                    <option value="Voksne Viderekomne">Voksne Viderekomne</option>
                    <option value="Sortbelter & Instruktører">Sortbelter & Instruktører</option>
                    <option value="Åpen Matte / Egentrening">Åpen Matte / Egentrening</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">Lokasjon / Rom *</label>
                  <input
                    type="text"
                    required
                    placeholder="f.eks. Tatami 1 (Hoveddojo)"
                    value={editingSession.room}
                    onChange={(e) => setEditingSession({ ...editingSession, room: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">Hovedinstruktør *</label>
                  <input
                    type="text"
                    required
                    placeholder="Kittel Gjernes"
                    value={editingSession.instructor}
                    onChange={(e) => setEditingSession({ ...editingSession, instructor: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">Maks antall plasser</label>
                  <input
                    type="number"
                    min="5"
                    max="50"
                    value={editingSession.maxSpots || 24}
                    onChange={(e) => setEditingSession({ ...editingSession, maxSpots: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">Beskrivelse av økten</label>
                <textarea
                  rows={2}
                  placeholder="Hva fokuseres det på under denne treningen?"
                  value={editingSession.description}
                  onChange={(e) => setEditingSession({ ...editingSession, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl"
                >
                  Avbryt
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl flex items-center gap-1.5 shadow"
                >
                  <Save className="w-4 h-4 text-amber-400" />
                  <span>Lagre treningsøkt</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
