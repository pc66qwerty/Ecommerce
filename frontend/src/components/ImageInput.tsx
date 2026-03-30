"use client";

import { useState, useRef, useEffect } from 'react';
import { Upload, Link as LinkIcon, X, Loader2, Clock } from 'lucide-react';
import api from '@/lib/axios';

const STORAGE_KEY = 'mian_recent_images';
const MAX_RECENT = 24;

function getRecent(): string[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}

function saveRecent(url: string) {
  if (!url || typeof window === 'undefined') return;
  const list = getRecent().filter(u => u !== url);
  list.unshift(url);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, MAX_RECENT)));
}

interface ImageInputProps {
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
}

type Mode = 'url' | 'upload' | 'recent';

export default function ImageInput({ value, onChange, placeholder = 'https://...' }: ImageInputProps) {
  const [mode, setMode] = useState<Mode>('url');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [recentImages, setRecentImages] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setRecentImages(getRecent());
  }, [mode]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError('');
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await api.post('/admin/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      saveRecent(res.data.url);
      onChange(res.data.url);
    } catch (err: any) {
      setUploadError(err.response?.data?.message || 'Error al subir la imagen.');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleUrlCommit = (url: string) => {
    if (url) saveRecent(url);
    onChange(url);
  };

  const pickRecent = (url: string) => {
    onChange(url);
    setMode('url');
  };

  const removeRecent = (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = getRecent().filter(u => u !== url);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setRecentImages(updated);
  };

  const TAB_CLASS = (active: boolean) =>
    `flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${active ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`;

  return (
    <div className="space-y-2">
      {/* Mode toggle */}
      <div className="flex gap-1 p-0.5 bg-gray-100 rounded-lg w-fit">
        <button type="button" onClick={() => setMode('url')} className={TAB_CLASS(mode === 'url')}>
          <LinkIcon size={12} /> URL
        </button>
        <button type="button" onClick={() => setMode('upload')} className={TAB_CLASS(mode === 'upload')}>
          <Upload size={12} /> Subir
        </button>
        <button type="button" onClick={() => setMode('recent')} className={TAB_CLASS(mode === 'recent')}>
          <Clock size={12} /> Recientes
          {recentImages.length > 0 && (
            <span className="bg-[#ff5000] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full leading-none">
              {recentImages.length}
            </span>
          )}
        </button>
      </div>

      {mode === 'url' && (
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          onBlur={e => { if (e.target.value) saveRecent(e.target.value); }}
          placeholder={placeholder}
          className="w-full bg-gray-100 border border-gray-300 text-gray-900 rounded-lg p-2.5 text-sm outline-none focus:border-[#ff5000] focus:ring-1 focus:ring-[#ff5000]"
        />
      )}

      {mode === 'upload' && (
        <div>
          <label className={`flex items-center justify-center gap-2 w-full h-11 border-2 border-dashed rounded-lg cursor-pointer transition-colors text-sm font-medium
            ${uploading ? 'border-[#ff5000] bg-orange-50 text-[#ff5000]' : 'border-gray-300 hover:border-[#ff5000] hover:bg-orange-50 text-gray-500 hover:text-[#ff5000]'}`}>
            {uploading
              ? <><Loader2 size={16} className="animate-spin" /> Subiendo...</>
              : <><Upload size={16} /> Seleccionar imagen (JPG, PNG, WebP — máx. 5MB)</>
            }
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              disabled={uploading}
              onChange={handleFileChange}
            />
          </label>
          {uploadError && <p className="text-xs text-red-500 font-bold mt-1">{uploadError}</p>}
        </div>
      )}

      {mode === 'recent' && (
        <div>
          {recentImages.length === 0 ? (
            <p className="text-xs text-gray-400 font-medium py-3 text-center">
              Aún no hay imágenes recientes. Sube o pega una URL para guardarla aquí.
            </p>
          ) : (
            <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
              {recentImages.map((url, i) => (
                <div
                  key={i}
                  onClick={() => pickRecent(url)}
                  className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all hover:border-[#ff5000] ${value === url ? 'border-[#ff5000]' : 'border-gray-200'}`}
                >
                  <img src={url} alt="" className="w-full h-16 object-cover" />
                  {/* Remove from recents */}
                  <button
                    type="button"
                    onClick={(e) => removeRecent(url, e)}
                    className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={9} />
                  </button>
                  {value === url && (
                    <div className="absolute inset-0 bg-[#ff5000]/20 flex items-center justify-center">
                      <span className="text-white text-[10px] font-black bg-[#ff5000] px-1.5 py-0.5 rounded">✓</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Preview + clear */}
      {value && (
        <div className="relative group w-fit">
          <img src={value} alt="preview" className="h-20 w-40 object-cover rounded-lg border border-gray-200" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X size={11} />
          </button>
        </div>
      )}
    </div>
  );
}
