import React, { useRef, useState } from 'react';
import { Upload, Link as LinkIcon, X, Image as ImageIcon, Sparkles, Check, Compass } from 'lucide-react';
import { MediaItem } from '../types';
import { initialMediaLibrary } from '../data/initialData';
import { MediaGallery } from './MediaGallery';

interface ImageInputProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  helperText?: string;
  aspectRatio?: 'square' | 'video' | 'portrait';
  presets?: { name: string; url: string }[];
  mediaLibrary?: MediaItem[];
  onUpdateMediaLibrary?: (items: MediaItem[]) => void;
}

export const ImageInput: React.FC<ImageInputProps> = ({
  label,
  value,
  onChange,
  helperText,
  aspectRatio = 'video',
  presets,
  mediaLibrary = initialMediaLibrary,
  onUpdateMediaLibrary,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [showGalleryPicker, setShowGalleryPicker] = useState(false);

  // Resize and compress image using HTML Canvas
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
          onChange(compressedDataUrl);
        }
        setIsProcessing(false);
      };
      img.onerror = () => {
        setIsProcessing(false);
      };
      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const getAspectClass = () => {
    switch (aspectRatio) {
      case 'square':
        return 'aspect-square max-w-[140px]';
      case 'portrait':
        return 'aspect-[3/4] max-w-[140px]';
      case 'video':
      default:
        return 'aspect-video max-w-[240px]';
    }
  };

  return (
    <div className="space-y-2 bg-stone-50 p-3.5 rounded-2xl border border-stone-200">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-stone-800">
          {label}
        </label>
        {value && (
          <span className="text-[10px] font-mono text-stone-500">
            {value.startsWith('data:') ? 'Opplastet bilde' : 'Ekstern / Unsplash'}
          </span>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-start">
        {/* Thumbnail Preview */}
        <div className={`relative rounded-xl overflow-hidden bg-stone-200 border border-stone-300 shrink-0 w-full sm:w-auto ${getAspectClass()}`}>
          {value ? (
            <>
              <img
                src={value}
                alt="Forhåndsvisning"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => onChange('')}
                className="absolute top-1.5 right-1.5 p-1 bg-stone-900/80 hover:bg-red-600 text-white rounded-lg transition-colors shadow cursor-pointer"
                title="Fjern bilde"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <div className="w-full h-28 flex flex-col items-center justify-center text-stone-400 gap-1 p-2 text-center">
              <ImageIcon className="w-6 h-6 stroke-1 text-stone-400" />
              <span className="text-[10px]">Ingen bilde valgt</span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex-1 space-y-2 w-full">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setShowGalleryPicker(true)}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all active:scale-95"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Velg fra Galleri / Unsplash</span>
            </button>

            <button
              type="button"
              disabled={isProcessing}
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all active:scale-95 disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5 text-amber-400" />
              <span>{isProcessing ? 'Behandler bilde...' : 'Last opp fil'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="px-3 py-1.5 bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <LinkIcon className="w-3.5 h-3.5 text-stone-500" />
              <span>{showUrlInput ? 'Skjul URL' : 'Lim inn URL'}</span>
            </button>
          </div>

          {/* URL Input Form */}
          {showUrlInput && (
            <div className="animate-in fade-in space-y-1">
              <input
                type="url"
                placeholder="https://images.unsplash.com/photo-..."
                value={value.startsWith('data:') ? '' : value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs font-mono text-stone-900 focus:outline-none focus:border-amber-500 bg-white"
              />
              <p className="text-[10px] text-stone-500">
                Lim inn direkte bildelenke (f.eks. fra Unsplash, klubbens nettside eller Facebook).
              </p>
            </div>
          )}

          {/* Quick Presets if supplied */}
          {presets && presets.length > 0 && (
            <div className="pt-1">
              <span className="text-[10px] font-bold text-stone-500 block mb-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-600" />
                Forslag til kampsportbilder:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {presets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onChange(preset.url)}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-medium border flex items-center gap-1 cursor-pointer transition-colors ${
                      value === preset.url
                        ? 'bg-amber-100 border-amber-300 text-amber-900 font-bold'
                        : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    {value === preset.url && <Check className="w-2.5 h-2.5 text-amber-700" />}
                    <span>{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {helperText && (
            <p className="text-[10px] text-stone-400 italic">
              {helperText}
            </p>
          )}
        </div>
      </div>

      {/* Gallery & Unsplash Picker Modal */}
      {showGalleryPicker && (
        <div 
          className="fixed inset-0 z-[65] bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in"
          onClick={() => setShowGalleryPicker(false)}
        >
          <div 
            className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-stone-200 shadow-2xl overflow-hidden my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-stone-900 text-white px-5 py-4 flex items-center justify-between border-b border-stone-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-stone-950 flex items-center justify-center font-bold text-sm">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-sm text-white">
                    Velg bilde fra Galleri eller Unsplash
                  </h3>
                  <p className="text-[11px] text-stone-400">
                    Klikk på et bilde for å bruke det direkte
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowGalleryPicker(false)}
                className="p-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto flex-1">
              <MediaGallery
                mediaLibrary={mediaLibrary}
                onUpdateMediaLibrary={onUpdateMediaLibrary || (() => {})}
                isPickerMode={true}
                selectedImageUrl={value}
                onSelectImage={(url) => {
                  onChange(url);
                  setShowGalleryPicker(false);
                }}
              />
            </div>

            <div className="p-3 bg-stone-100 border-t border-stone-200 flex justify-end">
              <button
                type="button"
                onClick={() => setShowGalleryPicker(false)}
                className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-xs rounded-xl"
              >
                Lukk
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
