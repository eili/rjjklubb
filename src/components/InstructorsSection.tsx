import React, { useState } from 'react';
import { Instructor, ClubConfig, PageTab } from '../types';
import { 
  Users, 
  Award, 
  Sparkles, 
  Edit3, 
  ChevronRight, 
  ChevronLeft,
  X, 
  MapPin, 
  Clock,
  ShieldCheck,
  Mail,
  Phone,
  BookOpen,
  Calendar,
  Plus,
  Trash2,
  CheckCircle2
} from 'lucide-react';

interface InstructorsSectionProps {
  instructors: Instructor[];
  clubConfig: ClubConfig;
  onUpdateInstructors: (instructors: Instructor[]) => void;
  onOpenAdmin: () => void;
  onSelectTab: (tab: PageTab) => void;
  onOpenTrial: () => void;
}

export const InstructorsSection: React.FC<InstructorsSectionProps> = ({
  instructors,
  clubConfig,
  onUpdateInstructors,
  onOpenAdmin,
  onSelectTab,
  onOpenTrial,
}) => {
  const [selectedInstructorId, setSelectedInstructorId] = useState<string | null>(null);
  const [filterRole, setFilterRole] = useState<'alle' | 'hoved' | 'gjest' | 'barn'>('alle');
  const [isEditing, setIsEditing] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState<Instructor | null>(null);

  // Selected instructor object
  const selectedInstructor = instructors.find((i) => i.id === selectedInstructorId) || null;
  const currentIndex = instructors.findIndex((i) => i.id === selectedInstructorId);

  const handleNextInstructor = () => {
    if (currentIndex >= 0 && currentIndex < instructors.length - 1) {
      setSelectedInstructorId(instructors[currentIndex + 1].id);
    } else {
      setSelectedInstructorId(instructors[0].id);
    }
  };

  const handlePrevInstructor = () => {
    if (currentIndex > 0) {
      setSelectedInstructorId(instructors[currentIndex - 1].id);
    } else {
      setSelectedInstructorId(instructors[instructors.length - 1].id);
    }
  };

  const filteredInstructors = instructors.filter((inst) => {
    if (filterRole === 'gjest') return inst.isGuestInstructor;
    if (filterRole === 'hoved') return inst.role.toLowerCase().includes('hoved');
    if (filterRole === 'barn') return inst.role.toLowerCase().includes('barn');
    return true;
  });

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInstructor) return;

    const updated = instructors.map((i) => (i.id === editingInstructor.id ? editingInstructor : i));
    onUpdateInstructors(updated);
    setIsEditing(false);
    setEditingInstructor(null);
  };

  return (
    <div className="bg-stone-50 text-stone-900 min-h-screen">
      {/* Top Banner */}
      <section className="bg-stone-900 text-stone-100 py-16 border-b border-stone-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-800 text-amber-400 text-xs font-semibold uppercase tracking-wider border border-stone-700">
              <Users className="w-3.5 h-3.5" />
              <span>Instruktørteam & Læremestere</span>
            </div>

            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs transition-colors border border-stone-700 cursor-pointer"
              title="Administrer og vedlikehold instruktører"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-400" />
              <span>Administrer instruktører</span>
            </button>
          </div>

          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
            Våre Instruktører
          </h1>
          <p className="text-stone-300 text-base sm:text-lg max-w-3xl leading-relaxed">
            Hos {clubConfig.clubName} møter du dedikerte, sertifiserte instruktører med lang 
            erfaring innen tradisjonell japansk Ju Jitsu. Bli bedre kjent med våre trenere, 
            deres bakgrunn, beltegrad og filosofi på tatamien.
          </p>

          {/* Quick filter pills */}
          <div className="flex flex-wrap gap-2 mt-8">
            <button
              onClick={() => setFilterRole('alle')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterRole === 'alle'
                  ? 'bg-amber-500 text-stone-950 font-bold'
                  : 'bg-stone-800/80 text-stone-400 hover:text-white'
              }`}
            >
              Alle ({instructors.length})
            </button>
            <button
              onClick={() => setFilterRole('gjest')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterRole === 'gjest'
                  ? 'bg-amber-500 text-stone-950 font-bold'
                  : 'bg-stone-800/80 text-stone-400 hover:text-white'
              }`}
            >
              Soke Yamaue (København)
            </button>
            <button
              onClick={() => setFilterRole('hoved')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterRole === 'hoved'
                  ? 'bg-amber-500 text-stone-950 font-bold'
                  : 'bg-stone-800/80 text-stone-400 hover:text-white'
              }`}
            >
              Klubbleder (Kittel Gjernes)
            </button>
            <button
              onClick={() => setFilterRole('barn')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterRole === 'barn'
                  ? 'bg-amber-500 text-stone-950 font-bold'
                  : 'bg-stone-800/80 text-stone-400 hover:text-white'
              }`}
            >
              Barne- & Ungdomsansvarlig
            </button>
          </div>
        </div>
      </section>

      {/* Main Grid: Individual Instructor Profiles */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-14">
          {filteredInstructors.map((inst) => (
            <div
              key={inst.id}
              className={`bg-white rounded-3xl border overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group ${
                inst.isGuestInstructor
                  ? 'border-amber-500/80 ring-2 ring-amber-500/20'
                  : 'border-stone-200 hover:border-stone-400'
              }`}
            >
              <div>
                {/* Photo Header */}
                <div className="relative h-72 sm:h-80 bg-stone-900 overflow-hidden">
                  <img
                    src={inst.image}
                    alt={inst.name}
                    className="w-full h-full object-cover object-top filter contrast-105 group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />
                  
                  {/* Guest badge */}
                  {inst.isGuestInstructor ? (
                    <div className="absolute top-4 left-4 bg-amber-500 text-stone-950 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-lg">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Stilartsleder • København</span>
                    </div>
                  ) : (
                    <div className="absolute top-4 left-4 bg-stone-900/80 backdrop-blur-md text-stone-200 border border-stone-700 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide">
                      {inst.role}
                    </div>
                  )}

                  {/* Rank & Experience Badge */}
                  <div className="absolute top-4 right-4 bg-stone-950/90 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-xl text-xs font-mono font-bold">
                    {inst.experienceYears} års erfaring
                  </div>

                  {/* Bottom overlay text */}
                  <div className="absolute bottom-4 left-5 right-5 text-white">
                    <span className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider block">
                      {inst.rank}
                    </span>
                    <h3 className="font-heading font-extrabold text-2xl text-white group-hover:text-amber-400 transition-colors">
                      {inst.name}
                    </h3>
                    <p className="text-xs text-stone-300 mt-0.5">{inst.title} • {inst.role}</p>
                  </div>
                </div>

                {/* Profile Details */}
                <div className="p-6 sm:p-7 space-y-4">
                  {/* Philosophy Quote */}
                  {inst.philosophy && (
                    <div className="p-3.5 rounded-2xl bg-stone-50 border-l-4 border-amber-500 text-xs italic text-stone-700 leading-relaxed">
                      {inst.philosophy}
                    </div>
                  )}

                  {/* Biography */}
                  <div>
                    <h4 className="text-[11px] font-bold text-stone-900 uppercase tracking-wider mb-1">
                      Om instruktøren:
                    </h4>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      {inst.bio}
                    </p>
                  </div>

                  {/* Specialties */}
                  <div>
                    <h4 className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-2">
                      Spesialfelt på tatamien:
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {inst.specialties.map((spec) => (
                        <span
                          key={spec}
                          className="px-2.5 py-1 rounded-lg bg-stone-100 text-stone-800 text-[11px] font-medium border border-stone-200/60"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="px-6 sm:px-7 py-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between gap-3">
                <button
                  onClick={() => setSelectedInstructorId(inst.id)}
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Vis full profil</span>
                  <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingInstructor({ ...inst });
                      setIsEditing(true);
                    }}
                    className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-200/60 rounded-lg transition-colors text-xs flex items-center gap-1"
                    title="Rediger instruktør"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Rediger</span>
                  </button>
                  <button
                    onClick={onOpenTrial}
                    className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl transition-all shadow-sm cursor-pointer"
                  >
                    Prøvetime
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quality assurance banner */}
        <div className="bg-stone-900 text-white rounded-3xl p-8 sm:p-10 border border-stone-800 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Kvalitet & Trygghet i Dojoen</span>
            </div>
            <h3 className="font-heading text-xl sm:text-2xl font-bold">
              Kvalitetssikrede instruktører med pedagogisk ansvar
            </h3>
            <p className="text-stone-300 text-xs leading-relaxed max-w-xl">
              Alle våre instruktører er sertifiserte under Norges Kampsportforbund (NKF) 
              og godkjent direkte under Soke Yamaue i København. For barne- og ungdomstrening 
              kreves plettfri politiattest og førstehjelpskurs.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <button
              onClick={onOpenTrial}
              className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow"
            >
              Meld på gratis prøvetime
            </button>
            <button
              onClick={() => onSelectTab('treningstider')}
              className="px-5 py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              Se timeplan
            </button>
          </div>
        </div>
      </section>

      {/* Full Dedicated Profile Modal View */}
      {selectedInstructor && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in"
          onClick={() => setSelectedInstructorId(null)}
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col border border-stone-200 shadow-2xl overflow-hidden relative my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Header Hero Image */}
            <div className="relative h-64 sm:h-72 bg-stone-900 shrink-0">
              <img
                src={selectedInstructor.image}
                alt={selectedInstructor.name}
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/50 to-transparent" />
              
              {/* Close Button */}
              <button
                onClick={() => setSelectedInstructorId(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-stone-900/80 text-white hover:bg-stone-800 transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Prev / Next buttons */}
              <div className="absolute top-4 left-4 flex gap-1 z-10">
                <button
                  onClick={handlePrevInstructor}
                  className="p-1.5 rounded-lg bg-stone-900/80 text-stone-200 hover:text-white hover:bg-stone-800 transition-colors"
                  title="Forrige instruktør"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextInstructor}
                  className="p-1.5 rounded-lg bg-stone-900/80 text-stone-200 hover:text-white hover:bg-stone-800 transition-colors"
                  title="Neste instruktør"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Header Titles */}
              <div className="absolute bottom-4 left-6 right-6 text-white">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded bg-amber-500 text-stone-950 text-xs font-mono font-bold uppercase">
                    {selectedInstructor.rank}
                  </span>
                  <span className="text-xs text-stone-300 font-mono">
                    {selectedInstructor.experienceYears} års erfaring
                  </span>
                </div>
                <h3 className="font-heading text-2xl sm:text-3xl font-extrabold text-white">
                  {selectedInstructor.name}
                </h3>
                <p className="text-xs text-stone-300">{selectedInstructor.role}</p>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6 text-xs text-stone-700">
              {/* Philosophy */}
              {selectedInstructor.philosophy && (
                <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-xs italic text-amber-950 leading-relaxed">
                  <span className="font-bold uppercase tracking-wider text-[10px] text-amber-800 block not-italic mb-1">
                    Instruktørens filosofi:
                  </span>
                  {selectedInstructor.philosophy}
                </div>
              )}

              {/* Biography */}
              <div>
                <h4 className="font-bold text-stone-900 uppercase tracking-wider text-xs mb-1.5">
                  Bakgrunn & Kampsportreise
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed text-justify">
                  {selectedInstructor.bio}
                </p>
              </div>

              {/* Certifications */}
              {selectedInstructor.certifications && selectedInstructor.certifications.length > 0 && (
                <div>
                  <h4 className="font-bold text-stone-900 uppercase tracking-wider text-xs mb-2 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-600" />
                    Sertifiseringer & Grader
                  </h4>
                  <ul className="space-y-1.5">
                    {selectedInstructor.certifications.map((c, i) => (
                      <li key={i} className="flex items-center gap-2 text-stone-600">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Specialties */}
              <div>
                <h4 className="font-bold text-stone-900 uppercase tracking-wider text-xs mb-2">
                  Tekniske Spesialområder
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedInstructor.specialties.map((s) => (
                    <span key={s} className="px-2.5 py-1 rounded-lg bg-stone-100 text-stone-800 font-medium text-xs border border-stone-200">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Contact info */}
              <div className="pt-2 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {selectedInstructor.email && (
                  <div className="flex items-center gap-2 text-stone-600">
                    <Mail className="w-4 h-4 text-amber-600 shrink-0" />
                    <a href={`mailto:${selectedInstructor.email}`} className="hover:text-amber-600 font-medium truncate">
                      {selectedInstructor.email}
                    </a>
                  </div>
                )}
                {selectedInstructor.phone && (
                  <div className="flex items-center gap-2 text-stone-600">
                    <Phone className="w-4 h-4 text-amber-600 shrink-0" />
                    <a href={`tel:${selectedInstructor.phone}`} className="hover:text-amber-600 font-medium">
                      {selectedInstructor.phone}
                    </a>
                  </div>
                )}
                {selectedInstructor.location && (
                  <div className="flex items-center gap-2 text-stone-600 sm:col-span-2">
                    <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Tilknyttet: <strong>{selectedInstructor.location}</strong></span>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="p-4 sm:p-6 bg-stone-50 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <button
                onClick={() => setSelectedInstructorId(null)}
                className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-xs rounded-xl transition-colors"
              >
                Lukk profil
              </button>
              
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedInstructorId(null);
                    onOpenTrial();
                  }}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors shadow"
                >
                  Meld prøvetime
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Edit Instructor Modal */}
      {isEditing && editingInstructor && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-sm overflow-y-auto animate-in fade-in"
          onClick={() => setIsEditing(false)}
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 border border-stone-200 shadow-2xl my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-heading font-bold text-base text-stone-900">
                Rediger profil: {editingInstructor.name}
              </h3>
              <button onClick={() => setIsEditing(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">Navn</label>
                <input
                  type="text"
                  required
                  value={editingInstructor.name}
                  onChange={(e) => setEditingInstructor({ ...editingInstructor, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">Beltegrad / Tittel</label>
                  <input
                    type="text"
                    required
                    value={editingInstructor.rank}
                    onChange={(e) => setEditingInstructor({ ...editingInstructor, rank: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">Erfaring (antall år)</label>
                  <input
                    type="number"
                    required
                    value={editingInstructor.experienceYears}
                    onChange={(e) => setEditingInstructor({ ...editingInstructor, experienceYears: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">Rolle i klubben</label>
                <input
                  type="text"
                  required
                  value={editingInstructor.role}
                  onChange={(e) => setEditingInstructor({ ...editingInstructor, role: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">Bilde URL (profesjonelt bilde)</label>
                <input
                  type="url"
                  required
                  value={editingInstructor.image}
                  onChange={(e) => setEditingInstructor({ ...editingInstructor, image: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">Biografi</label>
                <textarea
                  rows={3}
                  required
                  value={editingInstructor.bio}
                  onChange={(e) => setEditingInstructor({ ...editingInstructor, bio: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">Filosofi på matten (sitat)</label>
                <input
                  type="text"
                  value={editingInstructor.philosophy || ''}
                  onChange={(e) => setEditingInstructor({ ...editingInstructor, philosophy: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-stone-100 text-stone-700 font-bold rounded-xl"
                >
                  Avbryt
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl"
                >
                  Lagre endringer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
