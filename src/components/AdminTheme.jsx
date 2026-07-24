import { useEffect, useState } from 'react';
import { Save, RotateCcw } from 'lucide-react';

import { getTheme, setTheme, resetTheme, presetThemes } from '../utils/themeManager';
import AdminThemeBackgrounds from './AdminThemeBackgrounds';
import { getAllThemeBackgrounds, setThemeBackgroundByCategory } from '../utils/themeBackgroundManager';



export default function AdminTheme() {
  const [theme, setLocalTheme] = useState(getTheme());

  const [saved, setSaved] = useState(false);

  const [backgroundsByCategory, setBackgroundsByCategory] = useState({});

  useEffect(() => {
    setBackgroundsByCategory(getAllThemeBackgrounds() || {});
  }, []);

  const handleBackgroundChange = (category, url) => {
    setBackgroundsByCategory((prev) => {
      const next = { ...(prev || {}) };
      if (!url) delete next[String(category || '').toLowerCase()];
      else next[String(category || '').toLowerCase()] = url;
      return next;
    });

    // Ensure persistence (upload already writes, but clear may not).
    setThemeBackgroundByCategory(category, url);
  };


  const handleColorChange = (field, value) => {
    setLocalTheme(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSelectChange = (field, value) => {
    setLocalTheme(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleToggle = (field) => {
    setLocalTheme(prev => ({ ...prev, [field]: !prev[field] }));
    setSaved(false);
  };

  const handleSave = () => {
    setTheme(theme);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    if (confirm('Reset theme to default?')) {
      resetTheme();
      setLocalTheme(getTheme());
      setSaved(false);
    }
  };

  const applyPreset = (presetTheme) => {
    setLocalTheme(presetTheme.theme);
    setSaved(false);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Customize Theme</h2>
        <p className="text-slate-600">Change colors and design options for your website</p>
      </div>

      {saved && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <span className="text-green-600 text-2xl">✓</span>
          <p className="text-green-800 font-medium">Theme updated successfully!</p>
        </div>
      )}

      {/* Preset Themes */}
      <div className="mb-8 bg-slate-50 rounded-lg p-6 border border-slate-200">
        <h3 className="font-semibold text-slate-900 mb-4">Quick Presets</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.values(presetThemes).map(preset => (
            <button
              key={preset.name}
              onClick={() => applyPreset(preset)}
              className="p-3 rounded-lg border-2 border-slate-200 hover:border-blue-500 transition text-center"
            >
              <div className="flex gap-1 mb-2 justify-center">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: preset.theme.primary }}
                />
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: preset.theme.secondary }}
                />
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: preset.theme.accent }}
                />
              </div>
              <p className="text-xs font-medium text-slate-700">{preset.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Color Palette */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Primary Colors */}
        <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-4">Colors</h3>
          <div className="space-y-4">
            {[
              { label: 'Primary Color', key: 'primary' },
              { label: 'Secondary Color', key: 'secondary' },
              { label: 'Accent Color', key: 'accent' },
            ].map(({ label, key }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {label}
                </label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={theme[key]}
                    onChange={e => handleColorChange(key, e.target.value)}
                    className="w-12 h-10 rounded cursor-pointer border border-slate-300"
                  />
                  <input
                    type="text"
                    value={theme[key]}
                    onChange={e => handleColorChange(key, e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg font-mono text-sm"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Background & Text */}
        <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-4">Background & Text</h3>
          <div className="space-y-4">
            {[
              { label: 'Background Color', key: 'background' },
              { label: 'Text Color', key: 'text' },
            ].map(({ label, key }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {label}
                </label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={theme[key]}
                    onChange={e => handleColorChange(key, e.target.value)}
                    className="w-12 h-10 rounded cursor-pointer border border-slate-300"
                  />
                  <input
                    type="text"
                    value={theme[key]}
                    onChange={e => handleColorChange(key, e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg font-mono text-sm"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Header & Footer */}
        <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-4">Header & Footer</h3>
          <div className="space-y-4">
            {[
              { label: 'Header Color', key: 'headerColor' },
              { label: 'Footer Color', key: 'footerColor' },
            ].map(({ label, key }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {label}
                </label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={theme[key]}
                    onChange={e => handleColorChange(key, e.target.value)}
                    className="w-12 h-10 rounded cursor-pointer border border-slate-300"
                  />
                  <input
                    type="text"
                    value={theme[key]}
                    onChange={e => handleColorChange(key, e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg font-mono text-sm"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Design Options */}
        <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-4">Design Options</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Font Family
              </label>
              <select
                value={theme.fontFamily}
                onChange={e => handleSelectChange('fontFamily', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Poppins">Poppins</option>
                <option value="Inter">Inter</option>
                <option value="Courier">Courier</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Border Radius
              </label>
              <select
                value={theme.borderRadius}
                onChange={e => handleSelectChange('borderRadius', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="sm">Small</option>
                <option value="md">Medium</option>
                <option value="lg">Large</option>
                <option value="full">Rounded</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-300">
              <label className="text-sm font-medium text-slate-700">
                Enable Animations
              </label>
              <input
                type="checkbox"
                checked={theme.animation}
                onChange={() => handleToggle('animation')}
                className="w-5 h-5 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Theme Background Images */}
      <div className="mb-8">
        <AdminThemeBackgrounds
          valueByCategory={backgroundsByCategory}
          onChange={(category, url) => handleBackgroundChange(category, url)}
        />
      </div>

      {/* Preview */}
      <div className="bg-slate-50 rounded-lg p-6 border border-slate-200 mb-6">
        <h3 className="font-semibold text-slate-900 mb-4">Live Preview</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div
            className="h-20 rounded-lg flex items-center justify-center text-white font-semibold"
            style={{ backgroundColor: theme.primary }}
          >
            Primary
          </div>
          <div
            className="h-20 rounded-lg flex items-center justify-center text-white font-semibold"
            style={{ backgroundColor: theme.secondary }}
          >
            Secondary
          </div>
          <div
            className="h-20 rounded-lg flex items-center justify-center text-white font-semibold"
            style={{ backgroundColor: theme.accent }}
          >
            Accent
          </div>
          <div
            className="h-20 rounded-lg flex items-center justify-center font-semibold border-2 border-slate-300"
            style={{ backgroundColor: theme.background, color: theme.text }}
          >
            Background
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg transition"
        >
          <Save className="w-4 h-4" />
          Save Theme
        </button>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 bg-slate-300 hover:bg-slate-400 text-slate-900 font-semibold px-6 py-2 rounded-lg transition"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>
    </div>
  );
}
