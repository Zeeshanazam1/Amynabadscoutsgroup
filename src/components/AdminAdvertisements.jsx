import { useState, useEffect } from 'react';
import { Trash2, Edit2, Plus, X } from 'lucide-react';
import {
  getAdvertisements,
  addAdvertisement,
  updateAdvertisement,
  deleteAdvertisement,
} from '../utils/adManager';

export default function AdminAdvertisements() {
  const [ads, setAds] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'image',
    imageUrl: '',
    videoUrl: '',
    linkUrl: '',
    triggerOn: [],
    displayDuration: 5,
    enabled: true,
  });

  useEffect(() => {
    // initialize
    queueMicrotask(() => {
      setAds(getAdvertisements());
    });
  }, []);





  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleTriggerToggle = (trigger) => {
    setFormData(prev => ({
      ...prev,
      triggerOn: prev.triggerOn.includes(trigger)
        ? prev.triggerOn.filter(t => t !== trigger)
        : [...prev.triggerOn, trigger],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || formData.triggerOn.length === 0) {
      alert('Please fill in title and select at least one trigger point');
      return;
    }

    if (editingId) {
      updateAdvertisement(editingId, formData);
      setEditingId(null);
    } else {
      addAdvertisement(formData);
    }

    resetForm();
    setAds(getAdvertisements());

  };

  const handleEdit = (ad) => {
    setFormData({
      title: ad.title,
      description: ad.description,
      type: ad.type,
      imageUrl: ad.imageUrl,
      videoUrl: ad.videoUrl,
      linkUrl: ad.linkUrl,
      triggerOn: ad.triggerOn,
      displayDuration: ad.displayDuration,
      enabled: ad.enabled,
    });
    setEditingId(ad.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (confirm('Delete this advertisement?')) {
      deleteAdvertisement(id);
      setAds(getAdvertisements());

    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'image',
      imageUrl: '',
      videoUrl: '',
      linkUrl: '',
      triggerOn: [],
      displayDuration: 5,
      enabled: true,
    });
    setShowForm(false);
    setEditingId(null);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Manage Advertisements</h2>
        <p className="text-slate-600">Create and manage ads that display on your website</p>
      </div>

      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg mb-6 transition"
        >
          <Plus className="w-4 h-4" />
          Add New Advertisement
        </button>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-slate-50 rounded-lg p-6 mb-6 border border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-slate-900">
              {editingId ? 'Edit Advertisement' : 'Add New Advertisement'}
            </h3>
            <button
              onClick={resetForm}
              className="text-slate-500 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Ad Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Summer Camp Promotion"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Ad description (optional)"
                rows="3"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Ad Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Display Duration (seconds)
                </label>
                <input
                  type="number"
                  name="displayDuration"
                  value={formData.displayDuration}
                  onChange={handleChange}
                  min="1"
                  max="60"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {formData.type === 'image' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {formData.type === 'video' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Video URL
                </label>
                <input
                  type="url"
                  name="videoUrl"
                  value={formData.videoUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/video.mp4"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Link URL (optional)
              </label>
              <input
                type="url"
                name="linkUrl"
                value={formData.linkUrl}
                onChange={handleChange}
                placeholder="https://example.com"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Trigger Points */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Where to Show Ad *
              </label>
              <div className="space-y-2">
                {[
                  { id: 'results', label: 'Results Page' },
                  { id: 'badges', label: 'Badge Details' },
                ].map(trigger => (
                  <label key={trigger.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.triggerOn.includes(trigger.id)}
                      onChange={() => handleTriggerToggle(trigger.id)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-slate-700">{trigger.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Enabled Status */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="enabled"
                checked={formData.enabled}
                onChange={handleChange}
                className="w-4 h-4"
              />
              <span className="text-sm text-slate-700">Enable this advertisement</span>
            </label>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
              >
                {editingId ? 'Update Ad' : 'Add Ad'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-slate-300 hover:bg-slate-400 text-slate-900 px-4 py-2 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Ads List */}
      <div className="space-y-4">
        {ads.length === 0 ? (
          <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg">
            <p>No advertisements yet. Add one to get started.</p>
          </div>
        ) : (
          ads.map(ad => (
            <div key={ad.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-slate-900">{ad.title}</h3>
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${ad.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {ad.enabled ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">{ad.description}</p>
                  <div className="text-sm text-slate-600 space-y-1">
                    <p>📺 Type: {ad.type.charAt(0).toUpperCase() + ad.type.slice(1)}</p>
                    <p>⏱️ Duration: {ad.displayDuration}s</p>
                    <p>📍 Shows on: {ad.triggerOn.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(', ')}</p>
                  </div>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleEdit(ad)}
                    className="text-blue-600 hover:text-blue-800 transition"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(ad.id)}
                    className="text-red-600 hover:text-red-800 transition"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
