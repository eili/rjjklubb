import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  ClubConfig, 
  Instructor, 
  SummerCampInfo, 
  TrainingClass, 
  AdminMFAConfig, 
  SiteContent, 
  CampPhoto,
  MediaItem 
} from '../types';
import { initialSiteContent, initialMediaLibrary } from '../data/initialData';
import { ImageInput } from './ImageInput';
import { MediaGallery } from './MediaGallery';
import { saveClubDataToFirestore } from '../lib/firebase';
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
  ShieldCheck,
  Lock,
  Smartphone,
  KeyRound,
  Copy,
  LogOut,
  RefreshCw,
  Mail,
  FileText,
  Edit2,
  Image as ImageIcon,
  Check,
  ChevronDown,
  Sparkles,
  Compass,
  Download,
  UploadCloud
} from 'lucide-react';
import { generateBase32Secret, generateBackupCodes, getOTPAuthURL } from '../utils/totp';

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
  mfaConfig: AdminMFAConfig;
  onUpdateMFAConfig: (config: AdminMFAConfig) => void;
  onLogout: () => void;
  siteContent?: SiteContent;
  onUpdateSiteContent?: (content: SiteContent) => void;
  mediaLibrary?: MediaItem[];
  onUpdateMediaLibrary?: (items: MediaItem[]) => void;
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
  mfaConfig,
  onUpdateMFAConfig,
  onLogout,
  siteContent = initialSiteContent,
  onUpdateSiteContent,
  mediaLibrary = initialMediaLibrary,
  onUpdateMediaLibrary,
}) => {
  const [activeTab, setActiveTab] = useState<'innhold' | 'galleri' | 'instruktorer' | 'leir' | 'klubb' | 'sikkerhet'>('innhold');
  const [contentSubTab, setContentSubTab] = useState<'forside' | 'om-jujutsu' | 'soke-yamaue'>('forside');
  const [saveToast, setSaveToast] = useState(false);

  // Local state copies
  const [tempConfig, setTempConfig] = useState<ClubConfig>(clubConfig);
  const [tempCamp, setTempCamp] = useState<SummerCampInfo>(summerCamp);
  const [tempInstructors, setTempInstructors] = useState<Instructor[]>(instructors);
  const [tempMFA, setTempMFA] = useState<AdminMFAConfig>(mfaConfig);
  const [tempSiteContent, setTempSiteContent] = useState<SiteContent>(siteContent || initialSiteContent);
  const [tempMediaLibrary, setTempMediaLibrary] = useState<MediaItem[]>(mediaLibrary || initialMediaLibrary);

  // Instructor editing state
  const [editingInstId, setEditingInstId] = useState<string | null>(null);
  const [editingInstData, setEditingInstData] = useState<Instructor | null>(null);

  // New instructor form state
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

  // Camp photo gallery management
  const [showAddPhoto, setShowAddPhoto] = useState(false);
  const [newPhoto, setNewPhoto] = useState<Partial<CampPhoto>>({
    url: '',
    title: '',
    caption: '',
    year: 2026,
    category: 'trening',
  });

  // MFA settings local state
  const [mfaQrUrl, setMfaQrUrl] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordToast, setPasswordToast] = useState('');
  const [copiedKey, setCopiedKey] = useState(false);

  // Sync / Export / Import state
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [copiedSync, setCopiedSync] = useState(false);
  const [importJsonInput, setImportJsonInput] = useState('');
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [importErrorMessage, setImportErrorMessage] = useState('');

  // Synchronize local state with props when modal opens or props update
  useEffect(() => {
    if (isOpen) {
      setTempConfig(clubConfig);
      setTempCamp(summerCamp);
      setTempInstructors(instructors);
      setTempSiteContent(siteContent || initialSiteContent);
      setTempMediaLibrary(mediaLibrary || initialMediaLibrary);
      setTempMFA(mfaConfig || {
        isEnabled: true,
        totpSecret: 'JBSWY3DPEHPK3PXP',
        backupCodes: ['4829-1094', '9912-3841', '7521-6643', '2019-8472'],
        adminEmail: 'kittel@risorjujutsu.no',
        password: 'risorjujutsu2026',
      });
      setEditingInstId(null);
      setEditingInstData(null);
    }
  }, [isOpen, clubConfig, summerCamp, instructors, mfaConfig, siteContent, mediaLibrary]);

  // QR Code generator effect (MUST be placed before any early returns)
  useEffect(() => {
    if (tempMFA?.totpSecret) {
      const url = getOTPAuthURL(
        tempMFA.adminEmail || 'admin@risorjujutsu.no',
        tempConfig?.clubName || 'Risør Ju Jutsu klubb',
        tempMFA.totpSecret
      );
      QRCode.toDataURL(url, {
        width: 180,
        margin: 2,
        color: { dark: '#1c1917', light: '#ffffff' },
      })
        .then(setMfaQrUrl)
        .catch(() => {});
    }
  }, [tempMFA?.totpSecret, tempMFA?.adminEmail, tempConfig?.clubName]);

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

  // Guard against closed modal AFTER all hooks have executed unconditionally
  if (!isOpen) return null;

  const triggerSaveToast = () => {
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  const handleSaveAll = () => {
    onUpdateClubConfig(tempConfig);
    onUpdateSummerCamp(tempCamp);
    onUpdateInstructors(tempInstructors);
    onUpdateMFAConfig(tempMFA);
    if (onUpdateSiteContent) {
      onUpdateSiteContent(tempSiteContent);
    }
    if (onUpdateMediaLibrary) {
      onUpdateMediaLibrary(tempMediaLibrary);
    }
    // Also save directly to Firebase Firestore
    saveClubDataToFirestore({
      clubConfig: tempConfig,
      siteContent: tempSiteContent,
      instructors: tempInstructors,
      summerCamp: tempCamp,
      classes: classes,
      mediaLibrary: tempMediaLibrary,
    });
    triggerSaveToast();
  };

  // Instructor Edit Handlers
  const handleStartEditInstructor = (inst: Instructor) => {
    setEditingInstId(inst.id);
    setEditingInstData({ ...inst });
  };

  const handleSaveEditedInstructor = () => {
    if (!editingInstData) return;
    const updated = tempInstructors.map((i) => (i.id === editingInstData.id ? editingInstData : i));
    setTempInstructors(updated);
    onUpdateInstructors(updated);
    saveClubDataToFirestore({
      clubConfig: tempConfig,
      siteContent: tempSiteContent,
      instructors: updated,
      summerCamp: tempCamp,
      classes: classes,
      mediaLibrary: tempMediaLibrary,
    });
    setEditingInstId(null);
    setEditingInstData(null);
    triggerSaveToast();
  };

  const handleCancelEditInstructor = () => {
    setEditingInstId(null);
    setEditingInstData(null);
  };

  // Sync and Export logic
  const getExportData = () => ({
    version: '1.0',
    exportedAt: new Date().toISOString(),
    clubConfig: tempConfig,
    siteContent: tempSiteContent,
    instructors: tempInstructors,
    summerCamp: tempCamp,
    classes: classes,
    mediaLibrary: tempMediaLibrary,
  });

  const handleCopySyncData = () => {
    const json = JSON.stringify(getExportData(), null, 2);
    navigator.clipboard.writeText(json);
    setCopiedSync(true);
    setTimeout(() => setCopiedSync(false), 3000);
  };

  const handleDownloadBackup = () => {
    const json = JSON.stringify(getExportData(), null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `risor_jujutsu_innhold_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleApplyImport = () => {
    setImportErrorMessage('');
    if (!importJsonInput.trim()) {
      setImportErrorMessage('Lim inn JSON-data i tekstfeltet først.');
      setImportStatus('error');
      return;
    }
    try {
      const data = JSON.parse(importJsonInput);
      if (data.clubConfig) {
        setTempConfig(data.clubConfig);
        onUpdateClubConfig(data.clubConfig);
      }
      if (data.siteContent) {
        setTempSiteContent(data.siteContent);
        if (onUpdateSiteContent) onUpdateSiteContent(data.siteContent);
      }
      if (data.instructors) {
        setTempInstructors(data.instructors);
        onUpdateInstructors(data.instructors);
      }
      if (data.summerCamp) {
        setTempCamp(data.summerCamp);
        onUpdateSummerCamp(data.summerCamp);
      }
      if (data.mediaLibrary) {
        setTempMediaLibrary(data.mediaLibrary);
        if (onUpdateMediaLibrary) onUpdateMediaLibrary(data.mediaLibrary);
      }
      if (data.classes && onUpdateClasses) {
        onUpdateClasses(data.classes);
      }
      setImportStatus('success');
      triggerSaveToast();
    } catch {
      setImportStatus('error');
      setImportErrorMessage('Kunne ikke lese JSON. Vennligst sjekk at teksten er gyldig JSON.');
    }
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

  // Camp Photos Handlers
  const handleAddCampPhoto = () => {
    if (!newPhoto.url || !newPhoto.title) return;
    const photo: CampPhoto = {
      id: 'photo-' + Date.now(),
      url: newPhoto.url,
      title: newPhoto.title,
      caption: newPhoto.caption || '',
      year: Number(newPhoto.year) || 2026,
      category: newPhoto.category || 'trening',
    };
    const updatedGallery = [photo, ...(tempCamp.gallery || [])];
    const updatedCamp = { ...tempCamp, gallery: updatedGallery };
    setTempCamp(updatedCamp);
    onUpdateSummerCamp(updatedCamp);
    setShowAddPhoto(false);
    setNewPhoto({ url: '', title: '', caption: '', year: 2026, category: 'trening' });
    triggerSaveToast();
  };

  const handleDeleteCampPhoto = (id: string) => {
    if (confirm('Fjerne dette bildet fra leirgalleriet?')) {
      const updatedGallery = (tempCamp.gallery || []).filter((p) => p.id !== id);
      const updatedCamp = { ...tempCamp, gallery: updatedGallery };
      setTempCamp(updatedCamp);
      onUpdateSummerCamp(updatedCamp);
      triggerSaveToast();
    }
  };

  // MFA Handlers
  const handleRegenerateSecret = () => {
    if (confirm('Generere ny hemmelig TOTP-nøkkel? Du må skanne den nye QR-koden i mobilappen (Google/Microsoft Authenticator) på nytt.')) {
      const newSecret = generateBase32Secret(16);
      const updated = { ...tempMFA, totpSecret: newSecret };
      setTempMFA(updated);
      onUpdateMFAConfig(updated);
      triggerSaveToast();
    }
  };

  const handleRegenerateBackupCodes = () => {
    if (confirm('Generere 4 nye nød-reservekoder? Tidligere reservekoder vil bli ugyldiggjort.')) {
      const newCodes = generateBackupCodes(4);
      const updated = { ...tempMFA, backupCodes: newCodes };
      setTempMFA(updated);
      onUpdateMFAConfig(updated);
      triggerSaveToast();
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setPasswordToast('Passordet må være minst 6 tegn langt.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordToast('Passordene matcher ikke.');
      return;
    }
    const updated = { ...tempMFA, password: newPassword };
    setTempMFA(updated);
    onUpdateMFAConfig(updated);
    setNewPassword('');
    setConfirmPassword('');
    setPasswordToast('Admin-passord er oppdatert!');
    setTimeout(() => setPasswordToast(''), 3000);
  };

  const handleCopySecret = () => {
    navigator.clipboard.writeText(tempMFA.totpSecret || '');
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-stone-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col border border-stone-200 shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="bg-stone-900 text-white px-5 sm:px-6 py-4 flex items-center justify-between border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-sm sm:text-base text-white">
                Klubbadministrasjon & CMS
              </h3>
              <p className="text-[11px] text-stone-400">
                Rediger tekster, bilder, instruktører, sommerleir og Vipps
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[10px] text-emerald-300 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Firebase Sky: Tilkoblet</span>
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
        </div>

        {/* Tab Navigation */}
        <div className="bg-stone-100 border-b border-stone-200 px-4 sm:px-6 pt-2 flex flex-wrap gap-1.5 shrink-0">
          <button
            onClick={() => setActiveTab('innhold')}
            className={`px-3.5 py-2.5 rounded-t-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'innhold'
                ? 'bg-white text-stone-900 border-t-2 border-amber-500 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <FileText className="w-4 h-4 text-amber-600" />
            <span>Tekst & Sider (CMS)</span>
          </button>

          <button
            onClick={() => setActiveTab('galleri')}
            className={`px-3.5 py-2.5 rounded-t-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'galleri'
                ? 'bg-white text-stone-900 border-t-2 border-amber-500 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Compass className="w-4 h-4 text-amber-500" />
            <span>Bildegalleri & Unsplash</span>
          </button>

          <button
            onClick={() => setActiveTab('instruktorer')}
            className={`px-3.5 py-2.5 rounded-t-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'instruktorer'
                ? 'bg-white text-stone-900 border-t-2 border-amber-500 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Users className="w-4 h-4 text-amber-500" />
            <span>Instruktører & Bilder ({tempInstructors.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('leir')}
            className={`px-3.5 py-2.5 rounded-t-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'leir'
                ? 'bg-white text-stone-900 border-t-2 border-amber-500 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Sun className="w-4 h-4 text-amber-500" />
            <span>Sommerleir & Galleri</span>
          </button>

          <button
            onClick={() => setActiveTab('klubb')}
            className={`px-3.5 py-2.5 rounded-t-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'klubb'
                ? 'bg-white text-stone-900 border-t-2 border-amber-500 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <QrCode className="w-4 h-4 text-[#ff5b24]" />
            <span>Vipps & Klubbinfo</span>
          </button>

          <button
            onClick={() => setActiveTab('sikkerhet')}
            className={`px-3.5 py-2.5 rounded-t-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'sikkerhet'
                ? 'bg-white text-stone-900 border-t-2 border-amber-500 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Sikkerhet & MFA</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6 text-xs text-stone-700">
          
          {/* TAB 1: INNHOLD & NETTSIDETEKSTER (CMS) */}
          {activeTab === 'innhold' && (
            <div className="space-y-6">
              <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl flex items-start gap-3">
                <FileText className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-amber-900 text-sm">Rediger Innhold & Bilder på Nettsiden</h4>
                  <p className="text-[11px] text-amber-800 leading-relaxed mt-0.5">
                    Her kan du redigere overskrifter, introtekster og bytte bilder for nettsidens hovedseksjoner. 
                    Du kan både laste opp bilder fra mobilen/PC-en og lime inn eksterne bildelenker.
                  </p>
                </div>
              </div>

              {/* Sub-tabs for content sections */}
              <div className="flex gap-2 border-b border-stone-200 pb-2">
                <button
                  type="button"
                  onClick={() => setContentSubTab('forside')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                    contentSubTab === 'forside'
                      ? 'bg-stone-900 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  1. Forsiden (Hero & Velkomst)
                </button>
                <button
                  type="button"
                  onClick={() => setContentSubTab('om-jujutsu')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                    contentSubTab === 'om-jujutsu'
                      ? 'bg-stone-900 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  2. Hva er Ju Jitsu (Tradisjon)
                </button>
                <button
                  type="button"
                  onClick={() => setContentSubTab('soke-yamaue')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                    contentSubTab === 'soke-yamaue'
                      ? 'bg-stone-900 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  3. Vår Stilart & Soke Yamaue
                </button>
              </div>

              {/* SUBTAB: FORSIDE */}
              {contentSubTab === 'forside' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-stone-800">
                      Hovedoverskrift på Forsiden (Hero)
                    </label>
                    <input
                      type="text"
                      value={tempSiteContent.hero.title}
                      onChange={(e) => setTempSiteContent({
                        ...tempSiteContent,
                        hero: { ...tempSiteContent.hero, title: e.target.value }
                      })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold text-stone-900 focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-stone-800">
                      Velkomsttekst / Ingress
                    </label>
                    <textarea
                      rows={3}
                      value={tempSiteContent.hero.description}
                      onChange={(e) => setTempSiteContent({
                        ...tempSiteContent,
                        hero: { ...tempSiteContent.hero, description: e.target.value }
                      })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 focus:border-amber-500"
                    />
                  </div>

                  {/* Hero Background Image */}
                  <ImageInput
                    label="Bakgrunnsbilde for Toppseksjonen (Hero)"
                    value={tempSiteContent.hero.bgImage}
                    onChange={(val) => setTempSiteContent({
                      ...tempSiteContent,
                      hero: { ...tempSiteContent.hero, bgImage: val }
                    })}
                    aspectRatio="video"
                    helperText="Bruk et mørkt, stemningsfullt kampsportbilde for optimal lesbarhet."
                    presets={[
                      { name: 'Klassisk dojo', url: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&w=2000&q=80' },
                      { name: 'Ju Jitsu kast', url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=2000&q=80' },
                      { name: 'Tatami matter', url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=2000&q=80' },
                    ]}
                    mediaLibrary={tempMediaLibrary}
                    onUpdateMediaLibrary={setTempMediaLibrary}
                  />
                </div>
              )}

              {/* SUBTAB: OM JU JITSU */}
              {contentSubTab === 'om-jujutsu' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-stone-800">
                      Sidetittel
                    </label>
                    <input
                      type="text"
                      value={tempSiteContent.aboutJuJitsu.title}
                      onChange={(e) => setTempSiteContent({
                        ...tempSiteContent,
                        aboutJuJitsu: { ...tempSiteContent.aboutJuJitsu, title: e.target.value }
                      })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold text-stone-900 focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-stone-800">
                      Introduksjonstekst
                    </label>
                    <textarea
                      rows={3}
                      value={tempSiteContent.aboutJuJitsu.intro}
                      onChange={(e) => setTempSiteContent({
                        ...tempSiteContent,
                        aboutJuJitsu: { ...tempSiteContent.aboutJuJitsu, intro: e.target.value }
                      })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-stone-800">
                      Overskrift for Historiedelen
                    </label>
                    <input
                      type="text"
                      value={tempSiteContent.aboutJuJitsu.historyTitle}
                      onChange={(e) => setTempSiteContent({
                        ...tempSiteContent,
                        aboutJuJitsu: { ...tempSiteContent.aboutJuJitsu, historyTitle: e.target.value }
                      })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold text-stone-900 focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-stone-800">
                      Historietekst
                    </label>
                    <textarea
                      rows={4}
                      value={tempSiteContent.aboutJuJitsu.historyText}
                      onChange={(e) => setTempSiteContent({
                        ...tempSiteContent,
                        aboutJuJitsu: { ...tempSiteContent.aboutJuJitsu, historyText: e.target.value }
                      })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 focus:border-amber-500"
                    />
                  </div>
                </div>
              )}

              {/* SUBTAB: SOKE YAMAUE */}
              {contentSubTab === 'soke-yamaue' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-stone-800">
                      Sidetittel
                    </label>
                    <input
                      type="text"
                      value={tempSiteContent.sokeYamaue.title}
                      onChange={(e) => setTempSiteContent({
                        ...tempSiteContent,
                        sokeYamaue: { ...tempSiteContent.sokeYamaue, title: e.target.value }
                      })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold text-stone-900 focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-stone-800">
                      Introduksjonstekst
                    </label>
                    <textarea
                      rows={3}
                      value={tempSiteContent.sokeYamaue.intro}
                      onChange={(e) => setTempSiteContent({
                        ...tempSiteContent,
                        sokeYamaue: { ...tempSiteContent.sokeYamaue, intro: e.target.value }
                      })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 focus:border-amber-500"
                    />
                  </div>

                  {/* Soke Photo */}
                  <ImageInput
                    label="Hovedportrett av Soke Yamaue"
                    value={tempSiteContent.sokeYamaue.image}
                    onChange={(val) => setTempSiteContent({
                      ...tempSiteContent,
                      sokeYamaue: { ...tempSiteContent.sokeYamaue, image: val }
                    })}
                    aspectRatio="portrait"
                    helperText="Last opp eller velg et portrett av Soke Yamaue."
                    mediaLibrary={tempMediaLibrary}
                    onUpdateMediaLibrary={setTempMediaLibrary}
                  />

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-stone-800">
                      Filosofisk sitat fra Soke Yamaue
                    </label>
                    <textarea
                      rows={2}
                      value={tempSiteContent.sokeYamaue.quote}
                      onChange={(e) => setTempSiteContent({
                        ...tempSiteContent,
                        sokeYamaue: { ...tempSiteContent.sokeYamaue, quote: e.target.value }
                      })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 focus:border-amber-500"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: BILDEGALLERI & UNSPASH */}
          {activeTab === 'galleri' && (
            <div className="space-y-4">
              <MediaGallery
                mediaLibrary={tempMediaLibrary}
                onUpdateMediaLibrary={(items) => {
                  setTempMediaLibrary(items);
                  if (onUpdateMediaLibrary) onUpdateMediaLibrary(items);
                }}
              />
            </div>
          )}

          {/* TAB 3: INSTRUKTØRER & BILDER */}
          {activeTab === 'instruktorer' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-stone-900 text-sm">Vedlikehold Instruktører & Bilder</h4>
                  <p className="text-[11px] text-stone-500">
                    Rediger bilder, gradering, roller og biografier for klubbens trenere.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddInst(!showAddInst)}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{showAddInst ? 'Avbryt' : 'Ny Instruktør'}</span>
                </button>
              </div>

              {/* Form to Add New Instructor */}
              {showAddInst && (
                <div className="bg-stone-50 border border-stone-300 p-4 rounded-2xl space-y-3 animate-in fade-in">
                  <h5 className="font-bold text-stone-900 text-xs uppercase tracking-wider">
                    Legg til ny instruktør
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Fullt navn (f.eks. Sensei Ola Nordmann)"
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

                  <ImageInput
                    label="Instruktørbilde"
                    value={newInst.image || ''}
                    onChange={(url) => setNewInst({ ...newInst, image: url })}
                    aspectRatio="square"
                    mediaLibrary={tempMediaLibrary}
                    onUpdateMediaLibrary={setTempMediaLibrary}
                  />

                  <textarea
                    rows={2}
                    placeholder="Kort biografi og kampsportbakgrunn..."
                    value={newInst.bio}
                    onChange={(e) => setNewInst({ ...newInst, bio: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddInstructor}
                    className="px-4 py-2 bg-stone-900 text-white font-bold text-xs rounded-lg cursor-pointer"
                  >
                    Lagre instruktør
                  </button>
                </div>
              )}

              {/* Edit Modal / Expand for an existing instructor */}
              {editingInstData && (
                <div className="bg-amber-50/70 border-2 border-amber-400 p-5 rounded-2xl space-y-4 animate-in fade-in shadow-md">
                  <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                    <h5 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                      <Edit2 className="w-4 h-4 text-amber-700" />
                      <span>Rediger instruktør: {editingInstData.name}</span>
                    </h5>
                    <button
                      type="button"
                      onClick={handleCancelEditInstructor}
                      className="text-stone-500 hover:text-stone-800 text-xs font-semibold"
                    >
                      Lukk redigering
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-stone-700 mb-1">Navn</label>
                      <input
                        type="text"
                        value={editingInstData.name}
                        onChange={(e) => setEditingInstData({ ...editingInstData, name: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-stone-700 mb-1">Grad</label>
                      <input
                        type="text"
                        value={editingInstData.rank}
                        onChange={(e) => setEditingInstData({ ...editingInstData, rank: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-stone-700 mb-1">Rolle i klubben</label>
                      <input
                        type="text"
                        value={editingInstData.role}
                        onChange={(e) => setEditingInstData({ ...editingInstData, role: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs bg-white"
                      />
                    </div>
                  </div>

                  {/* Image Input */}
                  <ImageInput
                    label="Instruktørbilde (Last opp bilde fra telefon/PC eller lim inn URL)"
                    value={editingInstData.image}
                    onChange={(url) => setEditingInstData({ ...editingInstData, image: url })}
                    aspectRatio="square"
                    mediaLibrary={tempMediaLibrary}
                    onUpdateMediaLibrary={setTempMediaLibrary}
                  />

                  <div>
                    <label className="block text-[10px] font-bold text-stone-700 mb-1">Biografi & Erfaring</label>
                    <textarea
                      rows={3}
                      value={editingInstData.bio}
                      onChange={(e) => setEditingInstData({ ...editingInstData, bio: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-stone-700 mb-1">Filosofisitat</label>
                    <input
                      type="text"
                      value={editingInstData.philosophy || ''}
                      onChange={(e) => setEditingInstData({ ...editingInstData, philosophy: e.target.value })}
                      placeholder="«Ju Jutsu bygger trygge mennesker...»"
                      className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs bg-white"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handleSaveEditedInstructor}
                      className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow"
                    >
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Lagre endringer for {editingInstData.name}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEditInstructor}
                      className="px-3 py-2 text-stone-600 hover:text-stone-900 text-xs font-semibold"
                    >
                      Avbryt
                    </button>
                  </div>
                </div>
              )}

              {/* Instructor List */}
              <div className="space-y-3">
                {tempInstructors.map((inst) => (
                  <div
                    key={inst.id}
                    className="bg-stone-50 p-4 rounded-xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-stone-300 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={inst.image}
                        alt={inst.name}
                        className="w-14 h-14 rounded-xl object-cover border border-stone-300 shadow-sm"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-900 text-sm">{inst.name}</span>
                          <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-mono text-[10px] font-bold">
                            {inst.rank}
                          </span>
                          {inst.isGuestInstructor && (
                            <span className="px-1.5 py-0.5 rounded bg-stone-200 text-stone-700 text-[9px] font-bold">
                              København
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-stone-500 mt-0.5">{inst.role} • {inst.experienceYears} års erfaring</p>
                        <p className="text-[11px] text-stone-600 line-clamp-1 mt-1 max-w-md">{inst.bio}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleStartEditInstructor(inst)}
                        className="px-3 py-1.5 bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-amber-600" />
                        <span>Rediger bilde & tekst</span>
                      </button>

                      {!inst.isGuestInstructor && (
                        <button
                          type="button"
                          onClick={() => handleDeleteInstructor(inst.id)}
                          className="p-2 text-stone-400 hover:text-red-600 transition-colors cursor-pointer"
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

          {/* TAB 3: SOMMERLEIR & GALLERI */}
          {activeTab === 'leir' && (
            <div className="space-y-6">
              <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl flex items-start gap-3">
                <Sun className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-amber-900 text-sm">Administrasjon av Årlig Sommerleir & Fotogalleri</h4>
                  <p className="text-[11px] text-amber-800 leading-relaxed mt-0.5">
                    Oppdater leir-tema, datoer, gjesteinstruktør (Soke Yamaue fra København), priser og fotogalleri fra tidligere leirer.
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

              {/* SUMMER CAMP PHOTO GALLERY MANAGEMENT */}
              <div className="pt-4 border-t border-stone-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-heading font-bold text-sm text-stone-900 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-amber-600" />
                      <span>Fotogalleri for Sommerleir ({(tempCamp.gallery || []).length} bilder)</span>
                    </h4>
                    <p className="text-[11px] text-stone-500">
                      Legg til nye bilder eller slett eldre fotografier fra leirgalleriet.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowAddPhoto(!showAddPhoto)}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{showAddPhoto ? 'Avbryt' : 'Legg til leirbilde'}</span>
                  </button>
                </div>

                {/* Form to Add Camp Photo */}
                {showAddPhoto && (
                  <div className="bg-stone-50 border border-stone-300 p-4 rounded-2xl space-y-3 animate-in fade-in">
                    <h5 className="font-bold text-stone-900 text-xs uppercase tracking-wider">
                      Nytt bilde i sommerleirgalleriet
                    </h5>

                    <ImageInput
                      label="Velg bilde (Last opp fra mobil/PC eller lim inn URL)"
                      value={newPhoto.url || ''}
                      onChange={(url) => setNewPhoto({ ...newPhoto, url })}
                      aspectRatio="video"
                      mediaLibrary={tempMediaLibrary}
                      onUpdateMediaLibrary={setTempMediaLibrary}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-stone-700 mb-1">Bildetittel</label>
                        <input
                          type="text"
                          placeholder="f.eks. Mesterdemonstrasjon på tatamien"
                          value={newPhoto.title}
                          onChange={(e) => setNewPhoto({ ...newPhoto, title: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-stone-700 mb-1">Kategori</label>
                        <select
                          value={newPhoto.category}
                          onChange={(e) => setNewPhoto({ ...newPhoto, category: e.target.value as any })}
                          className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs"
                        >
                          <option value="trening">Trening</option>
                          <option value="gradering">Gradering</option>
                          <option value="sosialt">Sosialt / Middag</option>
                          <option value="soke">Soke Yamaue</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-stone-700 mb-1">Årstall</label>
                        <input
                          type="number"
                          value={newPhoto.year}
                          onChange={(e) => setNewPhoto({ ...newPhoto, year: Number(e.target.value) })}
                          className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-stone-700 mb-1">Bildetekst (Beskrivelse)</label>
                      <input
                        type="text"
                        placeholder="Kort tekst om hva som skjer på bildet..."
                        value={newPhoto.caption}
                        onChange={(e) => setNewPhoto({ ...newPhoto, caption: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleAddCampPhoto}
                      className="px-4 py-2 bg-stone-900 text-white font-bold text-xs rounded-xl cursor-pointer"
                    >
                      Legg til bilde i galleriet
                    </button>
                  </div>
                )}

                {/* Gallery Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {(tempCamp.gallery || []).map((photo) => (
                    <div
                      key={photo.id}
                      className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm flex flex-col justify-between"
                    >
                      <div className="relative aspect-video bg-stone-100">
                        <img
                          src={photo.url}
                          alt={photo.title}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleDeleteCampPhoto(photo.id)}
                          className="absolute top-1.5 right-1.5 p-1 bg-stone-900/80 hover:bg-red-600 text-white rounded-lg transition-colors shadow cursor-pointer"
                          title="Slett bilde"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="p-2.5 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-stone-900 text-xs truncate">{photo.title}</span>
                          <span className="text-[10px] font-mono text-stone-400">{photo.year}</span>
                        </div>
                        <p className="text-[10px] text-stone-500 line-clamp-1">{photo.caption}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: VIPPS & KLUBBINNSTILLINGER */}
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

          {/* TAB 5: SIKKERHET & MFA */}
          {activeTab === 'sikkerhet' && (
            <div className="space-y-6">
              {/* MFA Status & Setup Box */}
              <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-amber-700 uppercase tracking-wider block">
                      Aktiv Status
                    </span>
                    <h4 className="font-heading font-bold text-base text-stone-900 flex items-center gap-2">
                      <span>TOTP Flerfaktorautentisering</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase">
                        Aktiv
                      </span>
                    </h4>
                  </div>

                  <button
                    type="button"
                    onClick={handleRegenerateSecret}
                    className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold border border-stone-300 flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-stone-600" />
                    <span>Koble til ny telefon (Ny QR)</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                  <div className="sm:col-span-5 flex flex-col items-center p-3 bg-stone-50 rounded-2xl border border-stone-200 text-center">
                    {mfaQrUrl ? (
                      <img
                        src={mfaQrUrl}
                        alt="2FA QR Code"
                        className="w-40 h-40 rounded-xl shadow-sm border border-stone-200"
                      />
                    ) : (
                      <div className="w-40 h-40 flex items-center justify-center text-xs text-stone-400">
                        Laster QR-kode...
                      </div>
                    )}
                    <span className="text-[10px] text-stone-500 font-medium mt-2">
                      Skann med Google / Microsoft Authenticator
                    </span>
                  </div>

                  <div className="sm:col-span-7 space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">
                        Hemmelig Base32-nøkkel:
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="flex-1 px-3 py-2 bg-stone-100 rounded-xl font-mono text-xs font-extrabold text-stone-900 border border-stone-200">
                          {tempMFA.totpSecret}
                        </span>
                        <button
                          type="button"
                          onClick={handleCopySecret}
                          className="px-3 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          {copiedKey ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedKey ? 'Kopiert' : 'Kopier'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1 text-[11px] text-stone-600">
                      <p>• <strong>Konto:</strong> {tempMFA.adminEmail || 'kittel@risorjujutsu.no'}</p>
                      <p>• <strong>Utsteder:</strong> {tempConfig.clubName}</p>
                      <p>• <strong>Tidsintervall:</strong> 30 sekunder (RFC 6238)</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Emergency Backup Codes */}
              <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-3">
                  <div>
                    <h4 className="font-heading font-bold text-sm text-stone-900 flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-amber-600" />
                      <span>Nød-reservekoder (Backup Codes)</span>
                    </h4>
                    <p className="text-[11px] text-stone-500">
                      Hver kode kan brukes én gang dersom du ikke har tilgang til autentiseringsappen.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleRegenerateBackupCodes}
                    className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold border border-stone-300 flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-stone-600" />
                    <span>Generer nye reservekoder</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {(tempMFA?.backupCodes || ['4829-1094', '9912-3841', '7521-6643', '2019-8472']).map((code, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-center font-mono text-xs font-bold text-stone-900"
                    >
                      {code}
                    </div>
                  ))}
                </div>
              </div>

              {/* Change Admin Password */}
              <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-4">
                <h4 className="font-heading font-bold text-sm text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-3">
                  <Lock className="w-4 h-4 text-amber-600" />
                  <span>Endre Hovedpassord for Admin</span>
                </h4>

                {passwordToast && (
                  <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    passwordToast.includes('oppdatert')
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}>
                    {passwordToast.includes('oppdatert') ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600" />
                    )}
                    <span>{passwordToast}</span>
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="space-y-3 max-w-md">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      Nytt admin-passord (minst 6 tegn):
                    </label>
                    <input
                      type="password"
                      placeholder="Skriv inn nytt passord..."
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      Gjenta nytt admin-passord:
                    </label>
                    <input
                      type="password"
                      placeholder="Gjenta passord..."
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-900"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow"
                  >
                    Oppdater passord
                  </button>
                </form>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-stone-100 p-4 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (confirm('Nullstille alle data til standardinnstillinger?')) {
                  onResetDefaults();
                  onClose();
                }
              }}
              className="px-3 py-2 text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Tilbakestill standard</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setShowSyncModal(true);
                setImportStatus('idle');
                setImportJsonInput('');
              }}
              className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Eksporter innhold til AI-editor eller last ned sikkerhetskopi"
            >
              <Download className="w-3.5 h-3.5 text-amber-700" />
              <span>Eksporter / Synk med AI</span>
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
              type="button"
              onClick={() => {
                if (confirm('Er du sikker på at du vil logge ut av admin? Du må taste inn passord og MFA-kode ved neste innlogging.')) {
                  onLogout();
                  onClose();
                }
              }}
              className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-xl border border-red-200 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Logg ut og krev 2FA ved neste åpning"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logg ut av admin</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-xs rounded-xl cursor-pointer"
            >
              Lukk
            </button>

            <button
              type="button"
              onClick={handleSaveAll}
              className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow cursor-pointer"
            >
              <Save className="w-4 h-4 text-amber-400" />
              <span>Lagre alle endringer</span>
            </button>
          </div>
        </div>

        {/* SYNC / EXPORT / IMPORT MODAL */}
        {showSyncModal && (
          <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-stone-200 space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                    <Download className="w-5 h-5 text-amber-700" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-stone-900">Synk & Eksporter til AI-editor</h3>
                    <p className="text-xs text-stone-500">Hvordan få endringer fra GitHub Page tilbake til AI-editoren</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSyncModal(false)}
                  className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Informative explanation */}
              <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-2xl text-xs text-stone-700 space-y-2">
                <p className="font-bold text-amber-900 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Slik fungerer synkroniseringen:</span>
                </p>
                <p>
                  GitHub Pages er en <strong>statisk nettside</strong>. Når du gjør endringer i admin-panelet her i nettleseren, lagres de trygt i nettleserens minne (<code className="bg-amber-100/80 px-1 py-0.5 rounded">localStorage</code>), men nettleseren har av sikkerhetsmessige årsaker ikke lov til å skrive direkte tilbake til GitHub-filene dine automatisk.
                </p>
                <div className="bg-white p-3 rounded-xl border border-amber-200 space-y-1.5 font-medium text-[11px] text-stone-800">
                  <p className="font-bold text-stone-900">For å bake endringene permanent inn i kildekoden for alle besøkende:</p>
                  <ol className="list-decimal list-inside space-y-1 text-stone-600">
                    <li>Trykk på <strong>«Kopier for AI-editor»</strong> under.</li>
                    <li>Gå til chatten i AI Studio og skriv: <em className="text-amber-800">«Oppdater kildekoden med dette innholdet»</em> og lim inn.</li>
                    <li>AI-editoren oppdaterer kildefilene direkte. Neste gang koden pushes til GitHub, vises dine oppdateringer automatisk for alle i hele verden!</li>
                  </ol>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleCopySyncData}
                  className="flex-1 py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow transition-all"
                >
                  {copiedSync ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-300">Kopiert til utklippstavle!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-amber-400" />
                      <span>Kopier alt innhold for AI-editor (JSON)</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleDownloadBackup}
                  className="py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer border border-stone-300 transition-colors"
                >
                  <Download className="w-4 h-4 text-stone-600" />
                  <span>Last ned .json-fil</span>
                </button>
              </div>

              {/* Import / Restore Section */}
              <div className="pt-4 border-t border-stone-200 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                    <UploadCloud className="w-4 h-4 text-stone-600" />
                    <span>Gjenopprett eller overfør data fra en annen enhet:</span>
                  </h4>
                </div>
                <textarea
                  rows={3}
                  placeholder="Lim inn JSON-data her for å gjenopprette innhold på denne enheten..."
                  value={importJsonInput}
                  onChange={(e) => {
                    setImportJsonInput(e.target.value);
                    setImportStatus('idle');
                  }}
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-stone-300 bg-stone-50 text-stone-900 focus:bg-white focus:border-amber-500"
                />

                {importStatus === 'error' && (
                  <p className="text-xs text-red-600 font-semibold">{importErrorMessage}</p>
                )}

                {importStatus === 'success' && (
                  <p className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Innholdet ble importert og lagret!
                  </p>
                )}

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleApplyImport}
                    disabled={!importJsonInput.trim()}
                    className="px-4 py-2 bg-stone-800 hover:bg-stone-900 disabled:opacity-40 text-white font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Bruk importert data
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
