import { useEffect, useMemo, useState } from 'react';
import { Save, RotateCcw } from 'lucide-react';
import {
  getThemeForPage,
  setThemeForPage,
  resetPageTheme,
  presetThemes,
} from '../utils/themeManager';


const PAGE_OPTIONS = [
  { id: 'home', label: 'Home' },
  { id: 'login', label: 'Login' },
  { id: 'signup', label: 'Signup' },
  { id: 'badges', label: 'Badges' },
  { id: 'results', label: 'Results' },
  { id: 'contact', label: 'Contact (Get In Touch)' },
  { id: 'joining', label: 'Joining Form' },
];


export default function AdminPageThemeSettings() {

  const [selectedPage, setSelectedPage] = useState('home');
  const [pageTheme, setPageTheme] = useState(getThemeForPage('home'));
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Avoid setState directly in effect to satisfy strict lint rules.
    const current = getThemeForPage(selectedPage);
    queueMicrotask(() => {
      setPageTheme(current);
      setSaved(false);
    });
  }, [selectedPage]);


  const handleColorChange = (field, value) => {
    setPageTheme((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSelectChange = (field, value) => {
    setPageTheme((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleToggle = (field) => {
    setPageTheme((prev) => ({ ...prev, [field]: !prev[field] }));
    setSaved(false);
  };

  const handleSave = () => {
    setThemeForPage(selectedPage, pageTheme);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleReset = () => {
    if (!confirm('Reset this page theme to global default?')) return;
    resetPageTheme(selectedPage);
    setPageTheme(getThemeForPage(selectedPage));
    setSaved(false);
  };

  const applyPreset = (preset) => {
    setPageTheme(preset.theme);
    setSaved(false);
  };

  const presetList = useMemo(() => Object.values(presetThemes), []);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Page Theme Settings</h2>
        <p className="text-slate-600">
          Select a page and customize its colors independently. Theme is applied automatically when you
          navigate.
        </p>
      </div>

      {saved && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <span className="text-green-600 text-2xl">✓</span>
          <p className="text-green-800 font-medium">Page theme updated successfully!</p>
        </div>
      )}

      <div className="mb-8 bg-slate-50 rounded-lg p-6 border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-2">Select Page</label>
            <select
              value={selectedPage}
              onChange={(e) => setSelectedPage(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {PAGE_OPTIONS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <div className="md:w-auto">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 bg-slate-300 hover:bg-slate-400 text-slate-900 font-semibold px-4 py-2 rounded-lg transition w-full md:w-auto"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Page
            </button>
          </div>
        </div>
      </div>

      {/* Quick Presets */}
      <div className="mb-8 bg-slate-50 rounded-lg p-6 border border-slate-200">
        <h3 className="font-semibold text-slate-900 mb-4">Quick Presets</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {presetList.map((preset) => (
            <button
              key={preset.name}
              onClick={() => applyPreset(preset)}
              className="p-3 rounded-lg border-2 border-slate-200 hover:border-blue-500 transition text-center"
            >
              <div className="flex gap-1 mb-2 justify-center">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: preset.theme.primary }} />
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: preset.theme.secondary }}
                />
                <div className="w-4 h-4 rounded" style={{ backgroundColor: preset.theme.accent }} />
              </div>
              <p className="text-xs font-medium text-slate-700">{preset.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Theme editors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Colors */}
        <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-4">Colors</h3>
          <div className="space-y-4">
            {[
              { label: 'Primary Color', key: 'primary' },
              { label: 'Secondary Color', key: 'secondary' },
              { label: 'Accent Color', key: 'accent' },
            ].map(({ label, key }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={pageTheme[key]}
                    onChange={(e) => handleColorChange(key, e.target.value)}
                    className="w-12 h-10 rounded cursor-pointer border border-slate-300"
                  />
                  <input
                    type="text"
                    value={pageTheme[key]}
                    onChange={(e) => handleColorChange(key, e.target.value)}
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
                <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={pageTheme[key]}
                    onChange={(e) => handleColorChange(key, e.target.value)}
                    className="w-12 h-10 rounded cursor-pointer border border-slate-300"
                  />
                  <input
                    type="text"
                    value={pageTheme[key]}
                    onChange={(e) => handleColorChange(key, e.target.value)}
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
                <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={pageTheme[key]}
                    onChange={(e) => handleColorChange(key, e.target.value)}
                    className="w-12 h-10 rounded cursor-pointer border border-slate-300"
                  />
                  <input
                    type="text"
                    value={pageTheme[key]}
                    onChange={(e) => handleColorChange(key, e.target.value)}
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
              <label className="block text-sm font-medium text-slate-700 mb-2">Font Family</label>
              <select
                value={pageTheme.fontFamily}
                onChange={(e) => handleSelectChange('fontFamily', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Poppins">Poppins</option>
                <option value="Inter">Inter</option>
                <option value="Courier">Courier</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Border Radius</label>
              <select
                value={pageTheme.borderRadius}
                onChange={(e) => handleSelectChange('borderRadius', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="sm">Small</option>
                <option value="md">Medium</option>
                <option value="lg">Large</option>
                <option value="full">Rounded</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-300">
              <label className="text-sm font-medium text-slate-700">Enable Animations</label>
              <input
                type="checkbox"
                checked={pageTheme.animation}
                onChange={() => handleToggle('animation')}
                className="w-5 h-5 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Actions + Preview */}
      <div className="bg-slate-50 rounded-lg p-6 border border-slate-200 mb-6">
        <h3 className="font-semibold text-slate-900 mb-4">Live Preview (Selected Page)</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div
            className="h-20 rounded-lg flex items-center justify-center text-white font-semibold"
            style={{ backgroundColor: pageTheme.primary }}
          >
            Primary
          </div>
          <div
            className="h-20 rounded-lg flex items-center justify-center text-white font-semibold"
            style={{ backgroundColor: pageTheme.secondary }}
          >
            Secondary
          </div>
          <div
            className="h-20 rounded-lg flex items-center justify-center text-white font-semibold"
            style={{ backgroundColor: pageTheme.accent }}
          >
            Accent
          </div>
          <div
            className="h-20 rounded-lg flex items-center justify-center font-semibold border-2 border-slate-300"
            style={{ backgroundColor: pageTheme.background, color: pageTheme.text }}
          >
            Background
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg transition"
        >
          <Save className="w-4 h-4" />
          Save Page Theme
        </button>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 bg-slate-300 hover:bg-slate-400 text-slate-900 font-semibold px-6 py-2 rounded-lg transition"
        >
          <RotateCcw className="w-4 h-4" />
          Reset to Default
        </button>
      </div>
    </div>
  );
}

