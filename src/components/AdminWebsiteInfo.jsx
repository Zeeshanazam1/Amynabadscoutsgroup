import { useState } from 'react';

import { Save, Check } from 'lucide-react';
import {
  getWebsiteInfo,
  updateWebsiteInfo,
} from '../utils/dataManager';

export default function AdminWebsiteInfo() {
  const [info, setInfo] = useState(() => getWebsiteInfo());
  const [saved, setSaved] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setInfo(prev => ({ ...prev, [name]: value }));
    setSaved(false);
  };

  const handleLeaderEmailsChange = (e) => {
    const value = e.target.value || '';
    const arr = value.split(',').map(s => s.trim()).filter(Boolean);
    setInfo(prev => ({ ...prev, leaderEmails: arr }));
    setSaved(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateWebsiteInfo(info);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (

    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Website Information</h2>
        <p className="text-slate-600">Manage your organization's public information</p>
      </div>

      {saved && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <Check className="w-5 h-5 text-green-600" />
          <p className="text-green-800">Changes saved successfully!</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-slate-50 rounded-lg p-6 border border-slate-200 space-y-6">
        {/* Unit Name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Organization Name
          </label>
          <input
            type="text"
            name="unitName"
            value={info.unitName}
            onChange={handleChange}
            placeholder="Amynabad Scouts Group"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-slate-500 mt-1">
            The main name of your scout organization
          </p>
        </div>

        {/* Tagline */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Tagline / Mission Statement
          </label>
          <input
            type="text"
            name="tagline"
            value={info.tagline}
            onChange={handleChange}
            placeholder="Building character, developing skills, fostering leadership"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-slate-500 mt-1">
            Displayed in the website footer
          </p>
        </div>

        {/* Contact Email */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Contact Email
          </label>
          <input
            type="email"
            name="contactEmail"
            value={info.contactEmail}
            onChange={handleChange}
            placeholder="contact@example.com"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-slate-500 mt-1">
            Main contact email for inquiries
          </p>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            name="phone"
            value={info.phone}
            onChange={handleChange}
            placeholder="+92 XXX XXXXXXX"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-slate-500 mt-1">
            Contact phone number
          </p>
        </div>

        {/* Leader emails */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Leader Emails (comma separated)
          </label>
          <input
            type="text"
            name="leaderEmails"
            value={(info.leaderEmails || []).join(', ')}
            onChange={handleLeaderEmailsChange}
            placeholder="zeeshanazam11122@gmail.com, k250150@nu.edu.pk"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-slate-500 mt-1">Emails allowed to select the Leader category.</p>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">ℹ️ Information</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Changes here will appear on your public website</li>
            <li>• The tagline appears in the website footer</li>
            <li>• Contact info should be accurate for visitors to reach you</li>
            <li>• All changes are saved to your Firebase database and appear on the public site</li>
          </ul>
        </div>

        {/* Save Button */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition font-medium"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
