"use client";

import { useState, useRef } from 'react';
import { Upload, Link as LinkIcon, X, Loader2 } from 'lucide-react';
import api from '@/lib/axios';

interface ImageInputProps {
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
}

export default function ImageInput({ value, onChange, placeholder = 'https://...' }: ImageInputProps) {
  const [mode, setMode] = useState<'url' | 'upload'>('url');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

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
      onChange(res.data.url);
    } catch (err: any) {
      setUploadError(err.response?.data?.message || 'Error al subir la imagen.');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      {/* Mode toggle */}
      <div className="flex gap-1 p-0.5 bg-gray-100 rounded-lg w-fit">
        <button
          type="button"
          onClick={() => setMode('url')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${mode === 'url' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <LinkIcon size={12} /> URL
        </button>
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${mode === 'upload' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Upload size={12} /> Subir archivo
        </button>
      </div>

      {mode === 'url' ? (
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-gray-100 border border-gray-300 text-gray-900 rounded-lg p-2.5 text-sm outline-none focus:border-[#ff5000] focus:ring-1 focus:ring-[#ff5000]"
        />
      ) : (
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
