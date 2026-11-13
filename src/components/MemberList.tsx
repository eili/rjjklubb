import React, { useState, useMemo, useRef } from 'react';
import { Member, TrialBooking } from '../types';
import { STANDARD_RANKS, DEFAULT_SEMESTERS } from '../data/initialData';
import clubLogo from '../assets/rjjk-logo.png';
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
  ChevronDown,
  Copy,
  Printer,
  Inbox,
  UserCheck,
  ArrowUpDown,
  Sparkles,
  ExternalLink,
  MessageSquare
} from 'lucide-react';

interface MemberListProps {
  members: Member[];
  onAddMember: (member: Member) => void;
  onUpdateMember: (member: Member) => void;
  onDeleteMember: (id: string) => void;
  onToggleFee: (member: Member) => void;
  trialBookings?: TrialBooking[];
  onUpdateTrialBookingStatus?: (id: string, status: 'pending' | 'confirmed' | 'completed') => void;
  onDeleteTrialBooking?: (id: string) => void;
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

// Belt color schemes
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

// Rank ordering weight for sorting
function getRankWeight(rank: string): number {
  const r = rank.toLowerCase();
  if (r.includes('4. dan')) return 10;
  if (r.includes('3. dan')) return 9;
  if (r.includes('2. dan')) return 8;
  if (r.includes('1. dan') || r.includes('shodan') || r.includes('sort')) return 7;
  if (r.includes('brun')) return 6;
  if (r.includes('blå')) return 5;
  if (r.includes('grønn')) return 4;
  if (r.includes('oransje')) return 3;
  if (r.includes('gul')) return 2;
  if (r.includes('hvit')) return 1;
  return 0;
}

const BELT_CATEGORIES = [
  { label: 'Hvitt', key: 'hvit', bg: 'bg-stone-100 text-stone-800 border-stone-300' },
  { label: 'Gult', key: 'gul', bg: 'bg-yellow-100 text-yellow-900 border-yellow-300' },
  { label: 'Oransje', key: 'oransje', bg: 'bg-orange-100 text-orange-900 border-orange-300' },
  { label: 'Grønt', key: 'grønn', bg: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
  { label: 'Blått', key: 'blå', bg: 'bg-blue-100 text-blue-900 border-blue-300' },
  { label: 'Brunt', key: 'brun', bg: 'bg-amber-950 text-amber-100 border-amber-800' },
  { label: 'Sort (Dan)', key: 'dan', bg: 'bg-stone-900 text-amber-300 border-stone-800' },
];

export const MemberList: React.FC<MemberListProps> = ({
  members,
  onAddMember,
  onUpdateMember,
  onDeleteMember,
  onToggleFee,
  trialBookings = [],
  onUpdateTrialBookingStatus,
  onDeleteTrialBooking,
}) => {
  // Navigation between Members and Trial Inquiries Inbox
  const [activeSubTab, setActiveSubTab] = useState<'members' | 'inbox' | 'print'>('members');

  // Filters & Sorting
  const [selectedSemester, setSelectedSemester] = useState<string>('Høst 2026');
  const [feeFilter, setFeeFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name_asc' | 'name_desc' | 'unpaid_first' | 'paid_first' | 'rank_desc' | 'birthDate_desc'>('name_asc');
  const [selectedBeltFilter, setSelectedBeltFilter] = useState<string | null>(null);

  // Modals & Feedback
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [convertedBookingId, setConvertedBookingId] = useState<string | null>(null);
  const [copiedEmailToast, setCopiedEmailToast] = useState<string>('');

  // Form state
  const [formData, setFormData] = useState<Partial<Member>>({
    name: '',
    birthDate: '',
    phone: '',
    email: '',
    rank: 'Hvitt belte (6. Kyu)',
    semester: 'Høst 2026',
    hasPaidFee: false,
    notes: '',
    status: 'aktiv',
  });

  // Extract available semesters
  const availableSemesters = useMemo(() => {
    const set = new Set<string>(DEFAULT_SEMESTERS);
    members.forEach((m) => {
      if (m.semester) set.add(m.semester);
    });
    return Array.from(set);
  }, [members]);

  // Semester members (before belt/fee/search filters)
  const semesterMembers = useMemo(() => {
    return selectedSemester === 'all'
      ? members
      : members.filter((m) => m.semester === selectedSemester);
  }, [members, selectedSemester]);

  // Belt distribution count for the selected semester
  const beltCounts = useMemo(() => {
    const counts: Record<string, number> = {
      hvit: 0,
      gul: 0,
      oransje: 0,
      grønn: 0,
      blå: 0,
      brun: 0,
      dan: 0,
    };

    semesterMembers.forEach((m) => {
      const r = m.rank.toLowerCase();
      if (r.includes('dan') || r.includes('sort')) counts.dan++;
      else if (r.includes('brun')) counts.brun++;
      else if (r.includes('blå')) counts.blå++;
      else if (r.includes('grønn')) counts.grønn++;
      else if (r.includes('oransje')) counts.oransje++;
      else if (r.includes('gul')) counts.gul++;
      else counts.hvit++;
    });

    return counts;
  }, [semesterMembers]);

  // Filtered & Sorted members
  const filteredMembers = useMemo(() => {
    const list = members.filter((m) => {
      // Semester filter
      if (selectedSemester !== 'all' && m.semester !== selectedSemester) {
        return false;
      }
      // Fee filter
      if (feeFilter === 'paid' && !m.hasPaidFee) return false;
      if (feeFilter === 'unpaid' && m.hasPaidFee) return false;

      // Belt filter
      if (selectedBeltFilter) {
        const r = m.rank.toLowerCase();
        if (selectedBeltFilter === 'dan' && !r.includes('dan') && !r.includes('sort')) return false;
        if (selectedBeltFilter !== 'dan' && !r.includes(selectedBeltFilter)) return false;
      }

      // Search query
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

    // Sorting
    return list.sort((a, b) => {
      if (sortBy === 'name_asc') return a.name.localeCompare(b.name, 'no');
      if (sortBy === 'name_desc') return b.name.localeCompare(a.name, 'no');
      if (sortBy === 'unpaid_first') return Number(a.hasPaidFee) - Number(b.hasPaidFee);
      if (sortBy === 'paid_first') return Number(b.hasPaidFee) - Number(a.hasPaidFee);
      if (sortBy === 'rank_desc') return getRankWeight(b.rank) - getRankWeight(a.rank);
      if (sortBy === 'birthDate_desc') return (b.birthDate || '').localeCompare(a.birthDate || '');
      return 0;
    });
  }, [members, selectedSemester, feeFilter, selectedBeltFilter, searchQuery, sortBy]);

  // KPI calculations
  const stats = useMemo(() => {
    const paidCount = semesterMembers.filter((m) => m.hasPaidFee).length;
    const unpaidCount = semesterMembers.length - paidCount;
    const paidPct = semesterMembers.length > 0 ? Math.round((paidCount / semesterMembers.length) * 100) : 0;
    return {
      totalInSemester: semesterMembers.length,
      paidCount,
      unpaidCount,
      paidPct,
    };
  }, [semesterMembers]);

  // Pending trial bookings
  const pendingTrialCount = useMemo(() => {
    return trialBookings.filter((b) => b.status === 'pending').length;
  }, [trialBookings]);

  // Handlers
  const handleOpenAddModal = () => {
    setEditingMember(null);
    setConvertedBookingId(null);
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
    setConvertedBookingId(null);
    setFormData({ ...member });
    setIsModalOpen(true);
  };

  // Convert trial booking inquiry into full member
  const handleConvertTrialToMember = (booking: TrialBooking) => {
    setEditingMember(null);
    setConvertedBookingId(booking.id);
    setFormData({
      name: booking.name,
      birthDate: '',
      phone: booking.phone || '',
      email: booking.email || '',
      rank: 'Hvitt belte (6. Kyu)',
      semester: selectedSemester !== 'all' ? selectedSemester : 'Høst 2026',
      hasPaidFee: false,
      notes: `Registrert fra prøvetime (${booking.ageGroup}). ${booking.experience ? 'Erfaring: ' + booking.experience + '. ' : ''}${booking.message ? 'Melding: ' + booking.message : ''}`,
      status: 'aktiv',
    });
    setActiveSubTab('members');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    if (editingMember) {
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

      // If converted from trial booking, mark trial booking as completed
      if (convertedBookingId && onUpdateTrialBookingStatus) {
        onUpdateTrialBookingStatus(convertedBookingId, 'completed');
        setConvertedBookingId(null);
      }
    }

    setIsModalOpen(false);
  };

  // Copy emails for unpaid members
  const handleCopyUnpaidEmails = () => {
    const unpaidMembers = semesterMembers.filter((m) => !m.hasPaidFee && m.email?.trim());
    if (unpaidMembers.length === 0) {
      setCopiedEmailToast('Ingen ubetalte medlemmer med e-postadresse funnet.');
      setTimeout(() => setCopiedEmailToast(''), 3500);
      return;
    }

    const emailList = unpaidMembers.map((m) => m.email.trim()).join('; ');
    navigator.clipboard.writeText(emailList);
    setCopiedEmailToast(`Kopierte ${unpaidMembers.length} e-postadresser for ubetalte til utklippstavlen!`);
    setTimeout(() => setCopiedEmailToast(''), 4000);
  };

  // Export to CSV for Excel
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

  // Print attendance sheet
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-5 animate-in fade-in">
      {/* Top Sub-Navigation: Medlemmer vs Prøvetimer Innboks */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveSubTab('members')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'members'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
            }`}
          >
            <Users className="w-4 h-4 text-amber-400" />
            <span>Medlemsliste ({semesterMembers.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('inbox')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer relative ${
              activeSubTab === 'inbox'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
            }`}
          >
            <Inbox className="w-4 h-4 text-amber-500" />
            <span>Prøvetimer & Henvendelser ({trialBookings.length})</span>
            {pendingTrialCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-stone-950 font-black text-[10px] animate-pulse">
                {pendingTrialCount} nye
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('print')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'print'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
            }`}
          >
            <Printer className="w-4 h-4 text-stone-600" />
            <span>Utskrift & Tatami</span>
          </button>
        </div>

        {/* Action Buttons */}
        {activeSubTab === 'members' && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCopyUnpaidEmails}
              className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              title="Kopier e-postadresser for alle som mangler betaling for semesteret"
            >
              <Copy className="w-3.5 h-3.5 text-amber-700" />
              <span>Kopier ubetalte e-poster</span>
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-stone-300 shadow-xs"
              title="Last ned Excel-kompatibel CSV-fil"
            >
              <Download className="w-3.5 h-3.5 text-stone-600" />
              <span>Eksporter CSV</span>
            </button>

            <button
              type="button"
              onClick={handleOpenAddModal}
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow cursor-pointer active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 text-stone-950" />
              <span>+ Nytt Medlem</span>
            </button>
          </div>
        )}
      </div>

      {/* Copy Email Notification Toast */}
      {copiedEmailToast && (
        <div className="bg-emerald-950 border border-emerald-500/60 text-emerald-200 p-3 rounded-xl text-xs flex items-center justify-between shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{copiedEmailToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setCopiedEmailToast('')}
            className="text-emerald-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TAB 1: MEMBERS REGISTRY */}
      {activeSubTab === 'members' && (
        <div className="space-y-4">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs">
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

            <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs">
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

            <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs">
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

            <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block flex items-center gap-1">
                <Award className="w-3 h-3 text-stone-600" />
                Sortbelter / Dan
              </span>
              <span className="text-2xl font-black font-heading text-stone-900 mt-1 block">
                {beltCounts.dan}
              </span>
              <span className="text-[10px] text-stone-400">
                {beltCounts.hvit + beltCounts.gul} på nybegynnerbelter
              </span>
            </div>
          </div>

          {/* Belt Grade Quick Filter Strip (Budo KPI) */}
          <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-xs space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-bold text-stone-500 uppercase tracking-wider">
              <span>Beltefordeling ({selectedSemester}) - Klikk for å filtrere:</span>
              {selectedBeltFilter && (
                <button
                  type="button"
                  onClick={() => setSelectedBeltFilter(null)}
                  className="text-amber-800 hover:underline capitalize"
                >
                  Nullstill beltefilter (Vis alle)
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {BELT_CATEGORIES.map((belt) => {
                const count = beltCounts[belt.key] || 0;
                const isSelected = selectedBeltFilter === belt.key;
                return (
                  <button
                    key={belt.key}
                    type="button"
                    onClick={() => setSelectedBeltFilter(isSelected ? null : belt.key)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${belt.bg} ${
                      isSelected
                        ? 'ring-2 ring-amber-500 scale-105 shadow-sm'
                        : 'opacity-85 hover:opacity-100 hover:scale-102'
                    }`}
                  >
                    <span>{belt.label}</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-white/40 text-[10px] font-mono">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search, Semester and Sort Controls */}
          <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
              {/* Semester Selector */}
              <div className="sm:col-span-3 space-y-1">
                <label className="block text-[10px] font-bold text-stone-700 uppercase tracking-wider">
                  Semester:
                </label>
                <div className="relative">
                  <select
                    value={selectedSemester}
                    onChange={(e) => setSelectedSemester(e.target.value)}
                    className="w-full px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-stone-900 appearance-none focus:outline-none focus:border-amber-500 pr-8"
                  >
                    <option value="all">📁 Alle semestre (Komplett arkiv)</option>
                    {availableSemesters.map((sem) => (
                      <option key={sem} value={sem}>
                        🥋 {sem}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
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
                  className="w-full px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold text-stone-900 appearance-none focus:outline-none focus:border-amber-500"
                >
                  <option value="all">Alle (betalte og ubetalte)</option>
                  <option value="unpaid">Kun ubetalte ⚠️</option>
                  <option value="paid">Kun betalte ✓</option>
                </select>
              </div>

              {/* Sorting Filter */}
              <div className="sm:col-span-3 space-y-1">
                <label className="block text-[10px] font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1">
                  <ArrowUpDown className="w-3 h-3 text-stone-400" />
                  Sorter etter:
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold text-stone-900 appearance-none focus:outline-none focus:border-amber-500"
                >
                  <option value="name_asc">Navn (A til Å)</option>
                  <option value="name_desc">Navn (Å til A)</option>
                  <option value="unpaid_first">Ubetalte først ⚠️</option>
                  <option value="paid_first">Betalte først ✓</option>
                  <option value="rank_desc">Grad (Høyest grad først)</option>
                  <option value="birthDate_desc">Alder (Yngste først)</option>
                </select>
              </div>

              {/* Search Field */}
              <div className="sm:col-span-3 space-y-1">
                <label className="block text-[10px] font-bold text-stone-700 uppercase tracking-wider">
                  Søk:
                </label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Søk i listen..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-7 py-1.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-amber-500"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Members Table */}
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
            {filteredMembers.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
                  <Users className="w-6 h-6" />
                </div>
                <h5 className="font-bold text-stone-800 text-sm">Ingen medlemmer matcher utvalget</h5>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  {searchQuery || selectedBeltFilter
                    ? 'Prøv å endre søk eller tilbakestille beltefilteret.'
                    : `Ingen registrerte medlemmer for ${selectedSemester}.`}
                </p>
                <button
                  type="button"
                  onClick={handleOpenAddModal}
                  className="mt-2 px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-stone-800"
                >
                  Legg til medlem
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-2.5 px-3 sm:px-4">Navn & Fødselsdato</th>
                      <th className="py-2.5 px-3 sm:px-4">Kontaktinfo</th>
                      <th className="py-2.5 px-3 sm:px-4">Grad</th>
                      <th className="py-2.5 px-3 sm:px-4">Semester</th>
                      <th className="py-2.5 px-3 sm:px-4 text-center">Kontingent</th>
                      <th className="py-2.5 px-3 sm:px-4 text-right">Handlinger</th>
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
                          {/* Name & Age */}
                          <td className="py-2.5 px-3 sm:px-4">
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
                                {member.birthDate || 'Ikke oppgitt'}
                                {age !== null ? ` (${age} år)` : ''}
                              </span>
                            </div>
                            {member.notes && (
                              <p className="text-[10px] text-stone-400 mt-0.5 italic line-clamp-1">
                                {member.notes}
                              </p>
                            )}
                          </td>

                          {/* Contact */}
                          <td className="py-2.5 px-3 sm:px-4 space-y-0.5">
                            {member.phone && (
                              <a
                                href={`tel:${member.phone.replace(/\s+/g, '')}`}
                                className="flex items-center gap-1 text-stone-700 hover:text-amber-700 font-medium text-[11px]"
                              >
                                <Phone className="w-3 h-3 text-stone-400" />
                                <span>{member.phone}</span>
                              </a>
                            )}
                            {member.email && (
                              <a
                                href={`mailto:${member.email}`}
                                className="flex items-center gap-1 text-stone-500 hover:text-stone-900 truncate max-w-[170px] text-[11px]"
                                title={member.email}
                              >
                                <Mail className="w-3 h-3 text-stone-400 shrink-0" />
                                <span className="truncate">{member.email}</span>
                              </a>
                            )}
                          </td>

                          {/* Rank */}
                          <td className="py-2.5 px-3 sm:px-4">
                            <span className={`inline-block px-2.5 py-0.5 rounded-lg text-[10px] font-bold border font-mono shadow-xs ${getRankBadgeClass(member.rank)}`}>
                              {member.rank}
                            </span>
                          </td>

                          {/* Semester */}
                          <td className="py-2.5 px-3 sm:px-4">
                            <span className="font-semibold text-stone-800 bg-stone-100 px-2 py-0.5 rounded-md border border-stone-200 text-[11px]">
                              {member.semester}
                            </span>
                          </td>

                          {/* Fee Toggle */}
                          <td className="py-2.5 px-3 sm:px-4 text-center">
                            <button
                              type="button"
                              onClick={() => onToggleFee(member)}
                              className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-xs active:scale-95 border ${
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
                          <td className="py-2.5 px-3 sm:px-4 text-right">
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
                                  if (confirm(`Er du sikker på at du vil slette medlemmet ${member.name}?`)) {
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
        </div>
      )}

      {/* TAB 2: TRIAL BOOKINGS INBOX */}
      {activeSubTab === 'inbox' && (
        <div className="space-y-4">
          <div className="bg-amber-50/80 border border-amber-200 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
            <div>
              <h4 className="font-bold text-amber-950 flex items-center gap-1.5">
                <Inbox className="w-4 h-4 text-amber-700" />
                <span>Mottatte Påmeldinger til Prøvetime fra Nettsiden</span>
              </h4>
              <p className="text-amber-800 text-[11px] mt-0.5">
                Her vises alle henvendelser sendt inn via «Bli med på prøvetime»-skjemaet. Du kan kontakte dem og opprette dem direkte som klubbmedlem med ett klikk.
              </p>
            </div>
          </div>

          {trialBookings.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center space-y-2">
              <Inbox className="w-10 h-10 text-stone-300 mx-auto" />
              <h5 className="font-bold text-stone-800 text-sm">Ingen henvendelser enda</h5>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Når besøkende sender inn påmelding til gratis prøvetime på nettsiden, dukker de opp her umiddelbart.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {trialBookings.map((booking) => (
                <div 
                  key={booking.id}
                  className="bg-white rounded-2xl border border-stone-200 p-4 space-y-3 shadow-xs hover:border-amber-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 border-b border-stone-100 pb-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="font-bold text-stone-900 text-sm">{booking.name}</h5>
                        {booking.status === 'pending' && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold border border-amber-200">
                            Ny henvendelse
                          </span>
                        )}
                        {booking.status === 'confirmed' && (
                          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 text-[10px] font-bold border border-blue-200">
                            Avtalt oppmøte
                          </span>
                        )}
                        {booking.status === 'completed' && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-bold border border-emerald-200 flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Gjennomført / Innrullert
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-stone-400">
                        Innsendt: {new Date(booking.createdAt).toLocaleDateString('no-NO')}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {onDeleteTrialBooking && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Fjerne henvendelsen fra ${booking.name}?`)) {
                              onDeleteTrialBooking(booking.id);
                            }
                          }}
                          className="p-1 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-red-700 cursor-pointer"
                          title="Slett henvendelse"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-1.5 text-xs text-stone-600">
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      <div className="flex items-center gap-1.5 font-medium text-stone-900">
                        <Phone className="w-3.5 h-3.5 text-amber-600" />
                        <a href={`tel:${booking.phone.replace(/\s+/g, '')}`} className="hover:underline">
                          {booking.phone}
                        </a>
                      </div>
                      {booking.email && (
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-stone-400" />
                          <a href={`mailto:${booking.email}`} className="hover:underline text-stone-700">
                            {booking.email}
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100 space-y-1 text-[11px]">
                      <p><strong>Parti:</strong> {booking.ageGroup}</p>
                      {booking.preferredDay && <p><strong>Ønsket tid:</strong> {booking.preferredDay}</p>}
                      {booking.experience && <p><strong>Erfaring:</strong> {booking.experience}</p>}
                      {booking.message && <p className="italic text-stone-500 mt-1">«{booking.message}»</p>}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-1 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {booking.status !== 'confirmed' && onUpdateTrialBookingStatus && (
                        <button
                          type="button"
                          onClick={() => onUpdateTrialBookingStatus(booking.id, 'confirmed')}
                          className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-[11px] font-semibold cursor-pointer"
                        >
                          Marker som avtalt
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleConvertTrialToMember(booking)}
                      className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow transition-all hover:scale-102"
                      title="Opprett person som fullverdig medlem i medlemslisten"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                      <span>Meld inn som medlem</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PRINTABLE TATAMI ATTENDANCE SHEET */}
      {activeSubTab === 'print' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-4">
            <div>
              <h4 className="font-heading font-bold text-base text-stone-900">
                Utskriftsvennlig Oppmøte- & Tatamiprotokoll ({selectedSemester})
              </h4>
              <p className="text-xs text-stone-500 mt-0.5">
                Genererer en ferdig tabell for permen i Risørhallen med avkryssingsruter for treninger.
              </p>
            </div>
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Skriv ut til papir (A4)</span>
            </button>
          </div>

          {/* Printable Attendance Sheet Preview */}
          <div className="border border-stone-300 p-6 rounded-xl bg-white shadow-xs max-w-4xl mx-auto text-black">
            <div className="flex justify-between items-center border-b-2 border-stone-900 pb-3 mb-4">
              <div className="flex items-center gap-3">
                <img
                  src={clubLogo}
                  alt="Risør Ju Jutsu Klubb"
                  className="w-12 h-12 rounded-full object-contain border border-stone-300 bg-white shrink-0"
                />
                <div>
                  <h3 className="font-heading font-bold text-lg text-black">RISØR JU JUTSU KLUBB</h3>
                  <p className="text-xs text-stone-700">Dojo: Underetasjen i Risørhallen | Sensei Kittel Gjernes (4. dan)</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold bg-stone-100 px-3 py-1 rounded border border-stone-400">
                  {selectedSemester === 'all' ? 'Høst 2026' : selectedSemester}
                </span>
                <p className="text-[10px] text-stone-500 mt-1">Utskrevet: {new Date().toLocaleDateString('no-NO')}</p>
              </div>
            </div>

            <table className="w-full text-left border-collapse border border-stone-400 text-[11px]">
              <thead>
                <tr className="bg-stone-100">
                  <th className="border border-stone-400 p-1.5 w-8 text-center">#</th>
                  <th className="border border-stone-400 p-1.5 w-44">Navn</th>
                  <th className="border border-stone-400 p-1.5 w-28">Grad</th>
                  <th className="border border-stone-400 p-1.5 w-24">Mobil</th>
                  <th className="border border-stone-400 p-1 text-center w-8">1</th>
                  <th className="border border-stone-400 p-1 text-center w-8">2</th>
                  <th className="border border-stone-400 p-1 text-center w-8">3</th>
                  <th className="border border-stone-400 p-1 text-center w-8">4</th>
                  <th className="border border-stone-400 p-1 text-center w-8">5</th>
                  <th className="border border-stone-400 p-1 text-center w-8">6</th>
                  <th className="border border-stone-400 p-1 text-center w-8">7</th>
                  <th className="border border-stone-400 p-1 text-center w-8">8</th>
                  <th className="border border-stone-400 p-1 text-center w-8">9</th>
                  <th className="border border-stone-400 p-1 text-center w-8">10</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((m, idx) => (
                  <tr key={m.id} className="h-7">
                    <td className="border border-stone-400 p-1.5 text-center text-stone-500 font-mono">{idx + 1}</td>
                    <td className="border border-stone-400 p-1.5 font-bold text-stone-900">{m.name}</td>
                    <td className="border border-stone-400 p-1.5 text-stone-700">{m.rank}</td>
                    <td className="border border-stone-400 p-1.5 text-stone-600 font-mono text-[10px]">{m.phone}</td>
                    <td className="border border-stone-400"></td>
                    <td className="border border-stone-400"></td>
                    <td className="border border-stone-400"></td>
                    <td className="border border-stone-400"></td>
                    <td className="border border-stone-400"></td>
                    <td className="border border-stone-400"></td>
                    <td className="border border-stone-400"></td>
                    <td className="border border-stone-400"></td>
                    <td className="border border-stone-400"></td>
                    <td className="border border-stone-400"></td>
                  </tr>
                ))}
                {/* 3 extra blank rows for drop-in practitioners */}
                {[1, 2, 3].map((n) => (
                  <tr key={`blank-${n}`} className="h-7 text-stone-400">
                    <td className="border border-stone-400 p-1.5 text-center font-mono">{filteredMembers.length + n}</td>
                    <td className="border border-stone-400 p-1.5 italic text-stone-400">Ekstra utøver...</td>
                    <td className="border border-stone-400"></td>
                    <td className="border border-stone-400"></td>
                    <td className="border border-stone-400"></td>
                    <td className="border border-stone-400"></td>
                    <td className="border border-stone-400"></td>
                    <td className="border border-stone-400"></td>
                    <td className="border border-stone-400"></td>
                    <td className="border border-stone-400"></td>
                    <td className="border border-stone-400"></td>
                    <td className="border border-stone-400"></td>
                    <td className="border border-stone-400"></td>
                    <td className="border border-stone-400"></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
                    {convertedBookingId 
                      ? 'Oppretter medlem direkte fra prøvetime-henvendelse' 
                      : 'Lukket medlemsregister for Risør Ju Jutsu klubb'}
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
