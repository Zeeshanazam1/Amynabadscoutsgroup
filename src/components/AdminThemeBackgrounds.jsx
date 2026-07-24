import { useMemo, useState } from 'react';
import { Upload, Trash2, Image as ImageIcon } from 'lucide-react';

import { uploadThemeBackground } from '../utils/themeBackgroundManager';

const CATEGORIES = [
  { key: 'shaheen', label: 'Shaheen' },
  { key: 'scout', label: 'Scout (Boy Scouts)' },
  { key: 'rover', label: 'Rover' },
];

export default function AdminThemeBackgrounds({ valueByCategory, onChange }) {
  const [selectedFileByCategory, setSelectedFileByCategory] = useState({});
  const [uploading, setUploading] = useState(null);

  const currentUrls = valueByCategory || {};

  const fileFor = (cat) => selectedFileByCategory[String(cat).toLowerCase()] || null;

  const handlePick = (category, file) => {
    setSelectedFileByCategory((prev) => ({
      ...prev,
      [String(category).toLowerCase()]: file,
    }));
  };

  const handleUpload = async (category) => {
    const cat = String(category).toLowerCase();
    const file = fileFor(cat);
    if (!file || !cat) return;

    setUploading(cat);
    try {
      const url = await uploadThemeBackground({ category: cat, file });
      onChange?.(cat, url);
      setSelectedFileByCategory((prev) => ({ ...prev, [cat]: null }));
    } catch (e) {
      alert(e?.message || 'Failed to upload background image');
    } finally {
      setUploading(null);
    }
  };

  const handleClear = async (category) => {
    const cat = String(category).toLowerCase();
    if (!confirm(`Remove background image for ${cat}?`)) return;

    // Update mapping optimistically in UI; storage deletion is optional.
    // AdminTheme already stores mapping by calling uploadThemeBackground; clear uses localStorage removal.
    try {
      // If you later want deletion, wire deleteThemeBackgroundFromCategory here.
      const updated = { ...(currentUrls || {}) };
      delete updated[cat];
      onChange?.(cat, null, { cleared: true });
    } catch {}
  };

  return (
    <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
      <h3 className="font-semibold text-slate-900 mb-4">Theme Background Images</h3>
      <p className="text-sm text-slate-600 mb-4">
        Upload an image for each theme. Home page hero will use the image of the user’s section.
      </p>

      <div className="space-y-6">
        {CATEGORIES.map((cat) => {
          const url = currentUrls?.[cat.key] || null;
          const file = fileFor(cat.key);
          const isUploading = uploading === cat.key;

          return (
            <div key={cat.key} className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-semibold text-slate-900">{cat.label}</div>
                  <div className="text-xs text-slate-500 mt-1">Category key: {cat.key}</div>
                </div>

                {url ? (
                  <button
                    type="button"
                    onClick={() => handleClear(cat.key)}
                    className="text-slate-500 hover:text-red-600 transition"
                    title="Remove background"
                  >
                    <Trash2 size={18} />
                  </button>
                ) : null}
              </div>

              <div className="mt-4">
                {url ? (
                  <div className="mb-3">
                    <div className="w-full h-40 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 relative">
                      <img src={url} alt={`${cat.label} background`} className="absolute inset-0 w-full h-full object-cover" />
                    </div>
                  </div>
                ) : (
                  <div className="mb-3 text-sm text-slate-500 flex items-center gap-2">
                    <ImageIcon size={16} /> No image uploaded
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                  <input
                    type="file"
                    accept="image/*"
                    className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:border-0 file:rounded-full file:text-sm file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
                    onChange={(e) => handlePick(cat.key, e.target.files?.[0] || null)}
                  />

                  <button
                    type="button"
                    disabled={!file || isUploading}
                    onClick={() => handleUpload(cat.key)}
                    className="px-4 py-2 rounded-lg bg-[var(--color-primary)] hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition flex items-center gap-2"
                  >
                    <Upload size={16} />
                    {isUploading ? 'Uploading…' : 'Upload'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

