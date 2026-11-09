import React, { useState, useRef } from 'react';
import { MediaItem } from '../types';
import { curatedUnsplashCatalog, UnsplashPreset } from '../data/initialData';
import { 
  Upload, 
  Search, 
  Sparkles, 
  Copy, 
  CheckCircle2, 
  Trash2, 
  ExternalLink, 
  Check, 
  X, 
  Maximize2,
  Filter,
  Plus,
  Compass,
  Layers,
  ArrowRight
} from 'lucide-react';

interface MediaGalleryProps {
  mediaLibrary: MediaItem[];
  onUpdateMediaLibrary: (items: MediaItem[]) => void;
  onSelectImage?: (url: string) => void;
  selectedImageUrl?: string;
  isPickerMode?: boolean;
}

export const MediaGallery: React.FC<MediaGalleryProps> = ({
  mediaLibrary,
  onUpdateMediaLibrary,
  onSelectImage,
  selectedImageUrl,
  isPickerMode = false,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'gallery' | 'unsplash' | 'upload'>('gallery');
  const [categoryFilter, setCategoryFilter] = useState<string>('alle');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<{ url: string; title: string; photographer?: string } | null>(null);

  // Upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState<MediaItem['category']>('forside');
  const [customUnsplashUrl, setCustomUnsplashUrl] = useState('');
  const [customUnsplashTitle, setCustomUnsplashTitle] = useState('');
  const [customUnsplashCategory, setCustomUnsplashCategory] = useState<MediaItem['category']>('forside');

  // Copy URL to clipboard
  const handleCopyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Delete from media library
  const handleDeleteItem = (id: string) => {
    if (confirm('Er du sikker på at du vil fjerne dette bildet fra mediabiblioteket?')) {
      const updated = mediaLibrary.filter((item) => item.id !== id);
      onUpdateMediaLibrary(updated);
    }
  };

  // Add from Unsplash preset
  const handleAddFromUnsplash = (preset: UnsplashPreset) => {
    // Check if already in library
    const exists = mediaLibrary.some((item) => item.url === preset.url);
    if (exists) {
      alert('Dette bildet finnes allerede i klubbens mediabibliotek.');
      return;
    }

    const newItem: MediaItem = {
      id: 'media-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      url: preset.url,
      title: preset.title,
      category: preset.category,
      source: 'unsplash',
      photographer: preset.photographer,
      addedAt: new Date().toISOString().split('T')[0],
    };

    const updated = [newItem, ...mediaLibrary];
    onUpdateMediaLibrary(updated);

    if (isPickerMode && onSelectImage) {
      onSelectImage(preset.url);
    } else {
      setActiveSubTab('gallery');
    }
  };

  // Add custom Unsplash / external URL
  const handleAddCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUnsplashUrl) return;

    let cleanUrl = customUnsplashUrl.trim();
    // Normalize unsplash page URL to direct image URL if needed
    if (cleanUrl.includes('unsplash.com/photos/')) {
      const photoId = cleanUrl.split('photos/')[1]?.split('?')[0]?.split('/')[0];
      if (photoId) {
        cleanUrl = `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=1600&q=80`;
      }
    }

    const newItem: MediaItem = {
      id: 'media-' + Date.now(),
      url: cleanUrl,
      title: customUnsplashTitle.trim() || 'Unsplash Bilde',
      category: customUnsplashCategory,
      source: 'unsplash',
      addedAt: new Date().toISOString().split('T')[0],
    };

    onUpdateMediaLibrary([newItem, ...mediaLibrary]);
    setCustomUnsplashUrl('');
    setCustomUnsplashTitle('');
    setActiveSubTab('gallery');

    if (isPickerMode && onSelectImage) {
      onSelectImage(cleanUrl);
    }
  };

  // Handle local file upload with canvas compression
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const MAX_DIM = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.82);

          const title = uploadTitle.trim() || file.name.replace(/\.[^/.]+$/, '');
          const newItem: MediaItem = {
            id: 'media-' + Date.now(),
            url: dataUrl,
            title: title,
            category: uploadCategory,
            source: 'upload',
            addedAt: new Date().toISOString().split('T')[0],
          };

          const updated = [newItem, ...mediaLibrary];
          onUpdateMediaLibrary(updated);
          setUploadTitle('');
          setActiveSubTab('gallery');

          if (isPickerMode && onSelectImage) {
            onSelectImage(dataUrl);
          }
        }
        setIsProcessing(false);
      };
      img.onerror = () => setIsProcessing(false);
      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Filtered media items
  const filteredLibrary = mediaLibrary.filter((item) => {
    const matchesCategory = categoryFilter === 'alle' || item.category === categoryFilter;
    const matchesSearch = searchQuery === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.photographer && item.photographer.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Filtered Unsplash presets
  const filteredUnsplash = curatedUnsplashCatalog.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.photographer.toLowerCase().includes(q) ||
      item.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-4">
      {/* Top Banner & Mode Notice */}
      <div className="bg-gradient-to-r from-stone-900 to-stone-850 text-white p-4 sm:p-5 rounded-2xl border border-stone-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-amber-500 text-stone-950 font-bold text-[10px] uppercase font-mono">
              Mediabibliotek
            </span>
            <span className="text-xs text-stone-400">
              {mediaLibrary.length} lagrede bilder
            </span>
          </div>
          <h3 className="font-heading font-bold text-base text-white">
            Klubbens Bildegalleri & Unsplash
          </h3>
          <p className="text-[11px] text-stone-300 max-w-xl leading-relaxed">
            Administrer bildene som brukes på nettsiden. Last opp egne fotografier fra mobil/PC, 
            eller koble til høyoppløselige kampsportbilder fra Unsplash med ett klikk.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveSubTab('upload')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSubTab === 'upload'
                ? 'bg-amber-500 text-stone-950 shadow'
                : 'bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Last opp bilde</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('unsplash')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSubTab === 'unsplash'
                ? 'bg-amber-500 text-stone-950 shadow'
                : 'bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span>Utforsk Unsplash</span>
          </button>
        </div>
      </div>

      {/* Subtab selection tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-2">
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => setActiveSubTab('gallery')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
              activeSubTab === 'gallery'
                ? 'bg-stone-900 text-white shadow'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Klubbens Galleri ({mediaLibrary.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('unsplash')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center gap-1 ${
              activeSubTab === 'unsplash'
                ? 'bg-stone-900 text-white shadow'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Søk & Velg fra Unsplash</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('upload')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center gap-1 ${
              activeSubTab === 'upload'
                ? 'bg-stone-900 text-white shadow'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5 text-stone-500" />
            <span>Last opp fra enhet</span>
          </button>
        </div>

        {/* Search input */}
        <div className="relative min-w-[200px] w-full sm:w-auto">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={activeSubTab === 'unsplash' ? "Søk etter tatami, dojo, belte, kast..." : "Filtrer bilder..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-amber-500 bg-white"
          />
        </div>
      </div>

      {/* VIEW 1: KLUBBENS GALLERI */}
      {activeSubTab === 'gallery' && (
        <div className="space-y-4 animate-in fade-in">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[11px] font-bold text-stone-500 flex items-center gap-1 mr-1">
              <Filter className="w-3 h-3" />
              Kategori:
            </span>
            {[
              { id: 'alle', label: 'Alle' },
              { id: 'forside', label: 'Forside & Hero' },
              { id: 'instruktor', label: 'Instruktører' },
              { id: 'sommerleir', label: 'Sommerleir' },
              { id: 'dojo', label: 'Dojo & Tatami' },
              { id: 'tradisjon', label: 'Tradisjon' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  categoryFilter === cat.id
                    ? 'bg-amber-500 text-stone-950 font-bold'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Image Grid */}
          {filteredLibrary.length === 0 ? (
            <div className="text-center py-12 bg-stone-50 rounded-2xl border border-dashed border-stone-300 p-6 space-y-3">
              <Compass className="w-8 h-8 text-stone-400 mx-auto" />
              <p className="text-xs text-stone-600 font-medium">
                Ingen bilder matcher filteret «{searchQuery || categoryFilter}».
              </p>
              <div className="flex justify-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => { setCategoryFilter('alle'); setSearchQuery(''); }}
                  className="px-3 py-1.5 bg-white border border-stone-300 rounded-xl text-xs font-bold text-stone-700 hover:bg-stone-50"
                >
                  Nullstill filter
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSubTab('unsplash')}
                  className="px-3 py-1.5 bg-amber-500 text-stone-950 rounded-xl text-xs font-bold hover:bg-amber-400"
                >
                  Utforsk Unsplash
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {filteredLibrary.map((item) => {
                const isSelected = selectedImageUrl === item.url;
                return (
                  <div
                    key={item.id}
                    className={`group relative bg-white rounded-2xl border overflow-hidden shadow-sm flex flex-col justify-between transition-all hover:shadow-md ${
                      isSelected ? 'border-amber-500 ring-2 ring-amber-500/30' : 'border-stone-200'
                    }`}
                  >
                    {/* Image View with Hover Actions */}
                    <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
                      <img
                        src={item.url}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* Source badge */}
                      <div className="absolute top-2 left-2 flex gap-1">
                        <span className="px-1.5 py-0.5 rounded bg-stone-900/80 backdrop-blur-md text-[9px] font-mono font-bold text-white uppercase">
                          {item.source === 'unsplash' ? 'Unsplash' : item.source === 'upload' ? 'Opplastet' : 'Standard'}
                        </span>
                      </div>

                      {/* Lightbox Trigger */}
                      <button
                        type="button"
                        onClick={() => setPreviewItem(item)}
                        className="absolute top-2 right-2 p-1 rounded-lg bg-stone-900/70 hover:bg-stone-900 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Forstørr bilde"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete button */}
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item.id)}
                        className="absolute bottom-2 right-2 p-1 rounded-lg bg-red-600/80 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Fjern fra galleri"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      {isSelected && (
                        <div className="absolute bottom-2 left-2 bg-amber-500 text-stone-950 font-bold px-2 py-0.5 rounded text-[10px] flex items-center gap-1 shadow">
                          <Check className="w-3 h-3" />
                          <span>Valgt</span>
                        </div>
                      )}
                    </div>

                    {/* Metadata & Actions */}
                    <div className="p-2.5 space-y-1.5 bg-white">
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="font-bold text-stone-900 text-xs truncate" title={item.title}>
                          {item.title}
                        </h4>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-stone-400">
                        <span className="capitalize">{item.category}</span>
                        {item.photographer && (
                          <span className="truncate max-w-[90px]" title={`Foto: ${item.photographer}`}>
                            © {item.photographer}
                          </span>
                        )}
                      </div>

                      <div className="pt-1 flex gap-1.5">
                        {isPickerMode && onSelectImage ? (
                          <button
                            type="button"
                            onClick={() => onSelectImage(item.url)}
                            className={`w-full py-1.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-amber-500 text-stone-950 font-extrabold'
                                : 'bg-stone-900 hover:bg-stone-800 text-white'
                            }`}
                          >
                            <Check className="w-3 h-3" />
                            <span>{isSelected ? 'Valgt bilde' : 'Bruk dette'}</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleCopyUrl(item.id, item.url)}
                            className="w-full py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-[10px] font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                          >
                            {copiedId === item.id ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Kopiert!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Kopier URL</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: UTFORSK & KOBLE TIL UNSPASH */}
      {activeSubTab === 'unsplash' && (
        <div className="space-y-5 animate-in fade-in">
          {/* Unsplash Search & Custom Link Form */}
          <div className="bg-stone-50 border border-stone-200 p-4 rounded-2xl space-y-3">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-amber-600" />
              <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider">
                Koble til valgfritt bilde fra Unsplash
              </h4>
            </div>

            <form onSubmit={handleAddCustomUrl} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
              <div className="sm:col-span-6">
                <input
                  type="url"
                  required
                  placeholder="Lim inn Unsplash-lenke (f.eks. https://unsplash.com/photos/...)"
                  value={customUnsplashUrl}
                  onChange={(e) => setCustomUnsplashUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white text-stone-900 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div className="sm:col-span-3">
                <input
                  type="text"
                  placeholder="Navn / Tittel"
                  value={customUnsplashTitle}
                  onChange={(e) => setCustomUnsplashTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white text-stone-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="sm:col-span-3">
                <button
                  type="submit"
                  className="w-full py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-400" />
                  <span>Legg til i galleri</span>
                </button>
              </div>
            </form>

            <p className="text-[10px] text-stone-500">
              Tips: Du kan gå til <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer" className="underline font-bold text-stone-700">unsplash.com</a>, finne et bilde, og kopiere lenken direkte inn her.
            </p>
          </div>

          {/* Quick search tag pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[11px] font-bold text-stone-500 flex items-center gap-1 mr-1">
              <Sparkles className="w-3 h-3 text-amber-600" />
              Populære kampsporttemaer:
            </span>
            {[
              'dojo',
              'jujitsu',
              'kast',
              'sort belte',
              'samurai',
              'mokuso',
              'risør',
              'instruktør',
            ].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSearchQuery(tag)}
                className={`px-2.5 py-0.5 rounded-lg text-xs font-medium border cursor-pointer transition-colors ${
                  searchQuery.toLowerCase() === tag
                    ? 'bg-amber-100 border-amber-400 text-amber-900 font-bold'
                    : 'bg-white border-stone-300 text-stone-700 hover:bg-stone-100'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>

          {/* Curated Unsplash Catalog Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {filteredUnsplash.map((preset) => {
              const inLibrary = mediaLibrary.some((item) => item.url === preset.url);
              return (
                <div
                  key={preset.id}
                  className="group bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
                    <img
                      src={preset.url}
                      alt={preset.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2">
                      <span className="px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-md text-[9px] font-mono font-bold text-white">
                        Unsplash
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setPreviewItem(preset)}
                      className="absolute top-2 right-2 p-1 rounded-lg bg-stone-900/70 hover:bg-stone-900 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Forstørr bilde"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="p-2.5 space-y-1.5 bg-white">
                    <div>
                      <h4 className="font-bold text-stone-900 text-xs truncate" title={preset.title}>
                        {preset.title}
                      </h4>
                      <p className="text-[10px] text-stone-400 truncate">
                        Foto av {preset.photographer} (Unsplash)
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddFromUnsplash(preset)}
                      className={`w-full py-1.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors ${
                        inLibrary
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-stone-900 hover:bg-stone-800 text-white'
                      }`}
                    >
                      {inLibrary ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Lagt til i galleri</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3 h-3 text-amber-400" />
                          <span>Bruk i klubbgalleri</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 3: LAST OPP FRA ENHET (MOBIL/PC) */}
      {activeSubTab === 'upload' && (
        <div className="bg-stone-50 border-2 border-dashed border-stone-300 rounded-3xl p-6 sm:p-8 text-center space-y-4 animate-in fade-in">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />

          <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-700 flex items-center justify-center mx-auto">
            <Upload className="w-8 h-8" />
          </div>

          <div>
            <h4 className="font-heading font-bold text-base text-stone-900">
              Last opp bilde fra datamaskin eller mobil
            </h4>
            <p className="text-xs text-stone-500 max-w-md mx-auto mt-1 leading-relaxed">
              Velg et bilde fra telefonens kamerarull eller harddisken. Bildet komprimeres og optimaliseres automatisk i nettleseren for lynrask innlasting.
            </p>
          </div>

          {/* Title and Category for uploaded photo */}
          <div className="max-w-md mx-auto grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
            <div>
              <label className="block text-[11px] font-bold text-stone-700 mb-1">Bildetittel</label>
              <input
                type="text"
                placeholder="f.eks. Gradering i Risørhallen"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-stone-300 text-xs bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-stone-700 mb-1">Kategori</label>
              <select
                value={uploadCategory}
                onChange={(e) => setUploadCategory(e.target.value as any)}
                className="w-full px-3 py-1.5 rounded-xl border border-stone-300 text-xs bg-white"
              >
                <option value="forside">Forside & Hero</option>
                <option value="instruktor">Instruktører</option>
                <option value="sommerleir">Sommerleir</option>
                <option value="dojo">Dojo & Tatami</option>
                <option value="tradisjon">Tradisjon</option>
                <option value="annet">Annet</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 mx-auto cursor-pointer shadow disabled:opacity-50"
            >
              <Upload className="w-4 h-4 text-amber-400" />
              <span>{isProcessing ? 'Optimaliserer bilde...' : 'Velg bildefil (PNG/JPG/WEBP)'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Lightbox / Preview Modal */}
      {previewItem && (
        <div
          className="fixed inset-0 z-[70] bg-stone-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setPreviewItem(null)}
        >
          <div 
            className="max-w-3xl w-full bg-stone-900 rounded-2xl overflow-hidden border border-stone-800 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative max-h-[75vh] flex items-center justify-center bg-black">
              <img
                src={previewItem.url}
                alt={previewItem.title}
                className="max-w-full max-h-[70vh] object-contain"
              />
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="absolute top-3 right-3 p-1.5 rounded-xl bg-stone-900/80 hover:bg-stone-800 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-stone-900 text-white flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm">{previewItem.title}</h4>
                {previewItem.photographer && (
                  <p className="text-xs text-stone-400">Foto: {previewItem.photographer}</p>
                )}
              </div>

              {isPickerMode && onSelectImage && (
                <button
                  type="button"
                  onClick={() => {
                    onSelectImage(previewItem.url);
                    setPreviewItem(null);
                  }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Velg dette bildet</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
