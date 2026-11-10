import React, { useState, useMemo } from 'react';
import { Member } from '../types';
import { STANDARD_RANKS, DEFAULT_SEMESTERS } from '../data/initialData';
import { 
  Users, 
  Plus, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  Phone, 
  Mail, 
  Edit2, 
  Trash2, 
  Download, 
  X, 
  Check, 
  AlertCircle,
  Filter,
  CreditCard,
  Award,
  Clock,
  ChevronDown
} from 'lucide-react';

interface MemberListProps {
  members: Member[];
  onAddMember: (member: Member) => void;
  onUpdateMember: (member: Member) => void;
  onDeleteMember: (id: string) => void;
  onToggleFee: (member: Member) => void;
}

// Calculate age from birthdate string
function getAge(birthDateStr: string): number | null {
  if (!birthDateStr) return null;
  const birth = new Date(birthDateStr);
  if (isNaN(birth.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

// Get color scheme for belt ranks
function getRankBadgeClass(rank: string): string {
  const r = rank.toLowerCase();
  if (r.includes('dan') || r.includes('sort')) {
    return 'bg-stone-900 text-amber-300 border-amber-500/40';
  }
  if (r.includes('brun')) {
    return 'bg-amber-950 text-amber-100 border-amber-800';
  }
  if (r.includes('blå')) {
    return 'bg-blue-100 text-blue-900 border-blue-300';
  }
  if (r.includes('grønn')) {
    return 'bg-emerald-100 text-emerald-900 border-emerald-300';
  }
  if (r.includes('oransje')) {
    return 'bg-orange-100 text-orange-900 border-orange-300';
  }
  if (r.includes('gul')) {
    return 'bg-yellow-100 text-yellow-900 border-yellow-300';
  }
  return 'bg-stone-100 text-stone-800 border-stone-300';
}

export const MemberList: React.FC<MemberListProps> = ({
  members,
  onAddMember,
  onUpdateMember,
  onDeleteMember,
  onToggleFee,
}) => {
  const [selectedSemester, setSelectedSemester] = useState<string>('Høst 2026');
  const [feeFilter, setFeeFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  // Form state for new / edit member
  const [formData, setFormData] = useState<Partial<Member>>({
    name: '',
    birthDate: '',
    phone: '',
    email: '',
    rank: 'Gult belte (5. Kyu)',
    semester: 'Høst 2026',
    hasPaidFee: false,
    notes: '',
    status: 'aktiv',
  });

  // Extract all available semesters dynamically from members + defaults
  const availableSemesters = useMemo(() => {
    const set = new Set<string>(DEFAULT_SEMESTERS);
    members.forEach((m) => {
      if (m.semester) set.add(m.semester);
    });
    return Array.from(set);
  }, [members]);

  // Filtered members list
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      // Semester filter
      if (selectedSemester !== 'all' && m.semester !== selectedSemester) {
        return false;
      }
      // Fee filter
      if (feeFilter === 'paid' && !m.hasPaidFee) return false;
      if (feeFilter === 'unpaid' && m.hasPaidFee) return false;

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = m.name.toLowerCase().includes(q);
        const matchesEmail = m.email.toLowerCase().includes(q);
        const matchesPhone = m.phone.toLowerCase().includes(q);
        const matchesRank = m.rank.toLowerCase().includes(q);
        const matchesSemester = m.semester.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesPhone && !matchesRank && !matchesSemester) {
          return false;
        }
      }
      return true;
    });
  }, [members, selectedSemester, feeFilter, searchQuery]);

  // KPI Calculations
  const stats = useMemo(() => {
    const semesterMembers = selectedSemester === 'all' 
      ? members 
      : members.filter((m) => m.semester === selectedSemester);
    const paidCount = semesterMembers.filter((m) => m.hasPaidFee).length;
    const unpaidCount = semesterMembers.length - paidCount;
    const paidPct = semesterMembers.length > 0 ? Math.round((paidCount / semesterMembers.length) * 100) : 0;
    return {
      totalInSemester: semesterMembers.length,
      paidCount,
      unpaidCount,
      paidPct,
    };
  }, [members, selectedSemester]);

  const handleOpenAddModal = () => {
    setEditingMember(null);
    setFormData({
      name: '',
      birthDate: '',
      phone: '',
      email: '',
      rank: 'Hvitt belte (6. Kyu)',
      semester: selectedSemester !== 'all' ? selectedSemester : 'Høst 2026',
      hasPaidFee: false,
      notes: '',
      status: 'aktiv',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (member: Member) => {
    setEditingMember(member);
    setFormData({ ...member });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    if (editingMember) {
      // Update existing
      const updated: Member = {
        ...editingMember,
        name: formData.name.trim(),
        birthDate: formData.birthDate || '',
        phone: formData.phone || '',
        email: formData.email || '',
        rank: formData.rank || 'Hvitt belte (6. Kyu)',
        semester: formData.semester || 'Høst 2026',
        hasPaidFee: !!formData.hasPaidFee,
        paidDate: formData.hasPaidFee ? (editingMember.paidDate || new Date().toISOString().slice(0, 10)) : undefined,
        notes: formData.notes || '',
        status: formData.status || 'aktiv',
        updatedAt: new Date().toISOString(),
      };
      onUpdateMember(updated);
    } else {
      // Create new
      const created: Member = {
        id: 'member-' + Date.now(),
        name: formData.name.trim(),
        birthDate: formData.birthDate || '',
        phone: formData.phone || '',
        email: formData.email || '',
        rank: formData.rank || 'Hvitt belte (6. Kyu)',
        semester: formData.semester || 'Høst 2026',
        hasPaidFee: !!formData.hasPaidFee,
        paidDate: formData.hasPaidFee ? new Date().toISOString().slice(0, 10) : undefined,
        notes: formData.notes || '',
        status: formData.status || 'aktiv',
        createdAt: new Date().toISOString(),
      };
      onAddMember(created);
    }

    setIsModalOpen(false);
  };

  // Export to CSV for Excel with UTF-8 BOM
  const handleExportCSV = () => {
    const headers = ['Navn', 'Fødselsdato', 'Mobil', 'E-post', 'Grad', 'Semester', 'Betalt Kontingent', 'Betalt Dato', 'Status', 'Notater'];
    const rows = filteredMembers.map((m) => [
      `"${m.name.replace(/"/g, '""')}"`,
      `"${m.birthDate || ''}"`,
      `"${m.phone || ''}"`,
      `"${m.email || ''}"`,
      `"${m.rank || ''}"`,
      `"${m.semester || ''}"`,
      `"${m.hasPaidFee ? 'Ja' : 'Nei'}"`,
      `"${m.paidDate || ''}"`,
      `"${m.status}"`,
      `"${(m.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const semName = selectedSemester === 'all' ? 'alle_semestre' : selectedSemester.replace(/\s+/g, '_').toLowerCase();
    link.download = `risor_jujutsu_medlemmer_${semName}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 animate-in fade-in">
      {/* Top Banner / Info */}
      <div className="bg-stone-900 text-white p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-heading font-bold text-base text-white">
                Lukket Medlemsliste (Admin)
              </h4>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] uppercase font-bold border border-amber-500/30">
                Konfidensiell
              </span>
            </div>
            <p className="text-[11px] text-stone-300">
              Innvendig register for klubbledelsen. Gamle semestre blir liggende trygt lagret i skyen.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-stone-700 shadow-sm"
            title="Last ned Excel-kompatibel CSV-fil"
          >
            <Download className="w-3.5 h-3.5 text-stone-400" />
            <span>Eksporter CSV</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4 text-stone-950" />
            <span>+ Nytt Medlem</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
            Medlemmer i utvalg
          </span>
          <span className="text-2xl font-black font-heading text-stone-900 mt-1 block">
            {stats.totalInSemester}
          </span>
          <span className="text-[10px] text-stone-400">
            {selectedSemester === 'all' ? 'Totalt i registeret' : selectedSemester}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Betalt kontingent
          </span>
          <span className="text-2xl font-black font-heading text-emerald-700 mt-1 block">
            {stats.paidCount}
          </span>
          <span className="text-[10px] text-emerald-600 font-medium">
            {stats.paidPct}% innbetalt
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-600" />
            Ubetalt kontingent
          </span>
          <span className="text-2xl font-black font-heading text-amber-800 mt-1 block">
            {stats.unpaidCount}
          </span>
          <span className="text-[10px] text-amber-700">
            {stats.unpaidCount > 0 ? 'Mangler innbetaling' : 'Alle har betalt!'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
            Aktive semestre i arkiv
          </span>
          <span className="text-2xl font-black font-heading text-stone-900 mt-1 block">
            {availableSemesters.length}
          </span>
          <span className="text-[10px] text-stone-400">
            Historikk bevart i databasen
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Semester Selector */}
          <div className="sm:col-span-4 space-y-1">
            <label className="block text-[10px] font-bold text-stone-700 uppercase tracking-wider">
              Velg Semester / Periode:
            </label>
            <div className="relative">
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-stone-900 appearance-none focus:outline-none focus:border-amber-500 pr-8"
              >
                <option value="all">📁 Alle semestre (Komplett arkiv)</option>
                {availableSemesters.map((sem) => (
                  <option key={sem} value={sem}>
                    🥋 {sem}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Fee Filter */}
          <div className="sm:col-span-3 space-y-1">
            <label className="block text-[10px] font-bold text-stone-700 uppercase tracking-wider">
              Kontingent:
            </label>
            <select
              value={feeFilter}
              onChange={(e) => setFeeFilter(e.target.value as any)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold text-stone-900 appearance-none focus:outline-none focus:border-amber-500"
            >
              <option value="all">Alle (betalte og ubetalte)</option>
              <option value="unpaid">Kun ubetalte ⚠️</option>
              <option value="paid">Kun betalte ✓</option>
            </select>
          </div>

          {/* Search Input */}
          <div className="sm:col-span-5 space-y-1">
            <label className="block text-[10px] font-bold text-stone-700 uppercase tracking-wider">
              Søk i medlemmer:
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Søk på navn, telefon, e-post, grad..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-amber-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Member Table for Desktop / Cards for Mobile */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
        {filteredMembers.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
              <Users className="w-6 h-6" />
            </div>
            <h5 className="font-bold text-stone-800 text-sm">Ingen medlemmer funnet</h5>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              {searchQuery
                ? `Ingen treff for søket «${searchQuery}». Prøv et annet søkeord eller tilbakestill filteret.`
                : `Det er ikke lagt inn noen medlemmer for ${selectedSemester === 'all' ? 'valgt filter' : selectedSemester} enda.`}
            </p>
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="mt-2 px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-stone-800"
            >
              Legg til første medlem
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Navn & Alder</th>
                  <th className="py-3 px-4">Kontaktinfo</th>
                  <th className="py-3 px-4">Grad</th>
                  <th className="py-3 px-4">Semester</th>
                  <th className="py-3 px-4 text-center">Medlemsavgift</th>
                  <th className="py-3 px-4 text-right">Handlinger</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredMembers.map((member) => {
                  const age = getAge(member.birthDate);
                  return (
                    <tr 
                      key={member.id}
                      className="hover:bg-amber-50/40 transition-colors group"
                    >
                      {/* Name & Age / Birthdate */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-stone-900 text-xs flex items-center gap-1.5">
                          <span>{member.name}</span>
                          {member.status !== 'aktiv' && (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-stone-200 text-stone-600 uppercase">
                              {member.status}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3 text-stone-400" />
                          <span>
                            {member.birthDate || 'Fødselsdato ikke oppgitt'}
                            {age !== null ? ` (${age} år)` : ''}
                          </span>
                        </div>
                        {member.notes && (
                          <p className="text-[10px] text-stone-400 mt-0.5 italic line-clamp-1">
                            {member.notes}
                          </p>
                        )}
                      </td>

                      {/* Phone & Email */}
                      <td className="py-3 px-4 space-y-0.5">
                        {member.phone && (
                          <a
                            href={`tel:${member.phone.replace(/\s+/g, '')}`}
                            className="flex items-center gap-1 text-stone-700 hover:text-amber-700 font-medium"
                          >
                            <Phone className="w-3 h-3 text-stone-400" />
                            <span>{member.phone}</span>
                          </a>
                        )}
                        {member.email && (
                          <a
                            href={`mailto:${member.email}`}
                            className="flex items-center gap-1 text-stone-500 hover:text-stone-900 truncate max-w-[180px]"
                            title={member.email}
                          >
                            <Mail className="w-3 h-3 text-stone-400 shrink-0" />
                            <span className="truncate">{member.email}</span>
                          </a>
                        )}
                      </td>

                      {/* Rank */}
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold border font-mono shadow-xs ${getRankBadgeClass(member.rank)}`}>
                          {member.rank}
                        </span>
                      </td>

                      {/* Semester */}
                      <td className="py-3 px-4">
                        <span className="font-semibold text-stone-800 bg-stone-100 px-2 py-0.5 rounded-md border border-stone-200 text-[11px]">
                          {member.semester}
                        </span>
                      </td>

                      {/* Fee Payment Toggle Button */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => onToggleFee(member)}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-xs active:scale-95 border ${
                            member.hasPaidFee
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                              : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                          }`}
                          title={member.hasPaidFee ? 'Markert som betalt. Klikk for å endre til ubetalt.' : 'Ikke betalt. Klikk for å markere som betalt.'}
                        >
                          {member.hasPaidFee ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Betalt</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5 text-amber-600" />
                              <span>Ubetalt</span>
                            </>
                          )}
                        </button>
                        {member.hasPaidFee && member.paidDate && (
                          <span className="block text-[9px] text-stone-400 mt-0.5">
                            {member.paidDate}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(member)}
                            className="p-1.5 rounded-lg hover:bg-stone-200 text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
                            title="Rediger medlem"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Er du sikker på at du vil slette medlemmet ${member.name} fra registeret?`)) {
                                onDeleteMember(member.id);
                              }
                            }}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-700 transition-colors cursor-pointer"
                            title="Slett medlem"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: ADD / EDIT MEMBER */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <Users className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900">
                    {editingMember ? 'Rediger Medlem' : 'Registrer Nytt Medlem'}
                  </h3>
                  <p className="text-xs text-stone-500">
                    Lukket medlemsregister for Risør Ju Jutsu klubb
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              {/* Name */}
              <div>
                <label className="block text-[11px] font-bold text-stone-800 mb-1">
                  Fullt Navn: *
                </label>
                <input
                  type="text"
                  required
                  placeholder="f.eks. Ola Nordmann"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Birthdate & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-stone-800 mb-1">
                    Fødselsdato:
                  </label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-800 mb-1">
                    Mobilnummer:
                  </label>
                  <input
                    type="tel"
                    placeholder="f.eks. 920 14 550"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-[11px] font-bold text-stone-800 mb-1">
                  E-postadresse:
                </label>
                <input
                  type="email"
                  placeholder="f.eks. medlem@eksempel.no"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Rank & Semester */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-stone-800 mb-1">
                    Grad:
                  </label>
                  <select
                    value={formData.rank}
                    onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 text-xs font-semibold focus:outline-none focus:border-amber-500"
                  >
                    {STANDARD_RANKS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-800 mb-1">
                    Semester (f.eks. Høst 2026, Vår 2027):
                  </label>
                  <input
                    type="text"
                    list="semester-options"
                    placeholder="Høst 2026"
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 text-xs font-semibold focus:outline-none focus:border-amber-500"
                  />
                  <datalist id="semester-options">
                    {availableSemesters.map((s) => (
                      <option key={s} value={s} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Fee checkbox & Status */}
              <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 space-y-2">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hasPaidFee}
                    onChange={(e) => setFormData({ ...formData, hasPaidFee: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-stone-300"
                  />
                  <div>
                    <span className="font-bold text-stone-900 text-xs">
                      Medlemsavgift / Treningskontingent er betalt
                    </span>
                    <p className="text-[10px] text-stone-500">
                      Huk av for å markere at avgiften for dette semesteret er mottatt.
                    </p>
                  </div>
                </label>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[11px] font-bold text-stone-800 mb-1">
                  Valgfrie notater (foresatte, draktstørrelse, helseopplysninger):
                </label>
                <textarea
                  rows={2}
                  placeholder="f.eks. Foresatte: Kari Nordmann, drakt str. 160 cm..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Avbryt
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-amber-400" />
                  <span>{editingMember ? 'Oppdater medlem' : 'Lagre medlem'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
