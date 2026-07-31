import { useState, useEffect } from 'react';
import { Trash2, Edit2, Plus, X } from 'lucide-react';
import {
  getBadges,
  addBadge,
  updateBadge,
  deleteBadge,
} from '../utils/dataManager';

export default function AdminBadges() {
  const [badges, setBadges] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    section: '',
    category: '',
    requirements: [],
    badgeType: 'Proficiency Badge',
    descriptionHtml: '',
    images: [],
    pdf: null,
  });
  const [newRequirement, setNewRequirement] = useState('');
  const [imageUrlDraft, setImageUrlDraft] = useState('');


  const addImageUrl = (url) => {
    const trimmed = (url || '').trim();
    if (!trimmed) return;
    setFormData((prev) => ({ ...prev, images: [...(prev.images || []), trimmed] }));
  };

  const removeImageUrl = (idx) => {
    setFormData((prev) => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== idx),
    }));
  };


  const loadBadges = () => {
    setBadges(getBadges());
  };

  useEffect(() => {
    queueMicrotask(loadBadges);
  }, []);



  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.section || !formData.category) {
      alert('Please fill in all required fields');
      return;
    }

    if (editingId) {
      updateBadge(editingId, formData);
      setEditingId(null);
    } else {
      addBadge(formData);
    }
    resetForm();
    loadBadges();
  };

  const handleEdit = (badge) => {
    setFormData({
      title: badge.title,
      section: badge.section,
      category: badge.category,
      requirements: [...(badge.requirements || [])],
      badgeType: badge.badgeType || 'Proficiency Badge',
      descriptionHtml: badge.descriptionHtml || '',
      images: badge.images || [],
      pdf: badge.pdf || null,
    });
    setEditingId(badge.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this badge?')) {
      deleteBadge(id);
      loadBadges();
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      section: '',
      category: '',
      requirements: [],
      badgeType: 'Proficiency Badge',
      descriptionHtml: '',
      images: [],
      pdf: null,
    });
    setNewRequirement('');
    setShowForm(false);
    setEditingId(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, newRequirement.trim()],
      }));
      setNewRequirement('');
    }
  };

  const removeRequirement = (index) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index),
    }));
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Manage Badges</h2>
        <p className="text-slate-600">Create, edit, or delete scout badges</p>
      </div>

      {/* Add Button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg mb-6 transition"
        >
          <Plus className="w-4 h-4" />
          Add New Badge
        </button>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-slate-50 rounded-lg p-6 mb-6 border border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-slate-900">
              {editingId ? 'Edit Badge' : 'Add New Badge'}
            </h3>
            <button
              onClick={resetForm}
              className="text-slate-500 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Badge Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Outdoor Skills"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Section *
                </label>
                <select
                  name="section"
                  value={formData.section}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select section</option>
                  <option value="Shaheen">Shaheen</option>
                  <option value="Scout">Scout</option>
                  <option value="Rover">Rover</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select category</option>
                  <option value="Adventure">Spiritual</option>
                  <option value="Conservation">Mental</option>
                  <option value="Leadership">Social</option>
                  <option value="Service">Physical</option>
                </select>
              </div>
            </div>

            {/* Requirements */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Requirements
              </label>
              <div className="space-y-2 mb-3">
                {formData.requirements.map((req, index) => (
                  <div key={index} className="flex items-center gap-2 bg-white p-2 rounded border border-slate-300">
                    <span className="text-slate-700 flex-1">{req}</span>
                    <button
                      type="button"
                      onClick={() => removeRequirement(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newRequirement}
                  onChange={(e) => setNewRequirement(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                  placeholder="Add a requirement and press Enter"
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={addRequirement}
                  className="bg-slate-300 hover:bg-slate-400 text-slate-900 px-4 py-2 rounded-lg transition"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Badge type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Badge Type</label>
                <select
                  name="badgeType"
                  value={formData.badgeType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Rank Badge">Rank Badge</option>
                  <option value="Proficiency Badge">Proficiency Badge</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">PDF URL</label>
                <input
                  type="text"
                  name="pdf"
                  value={formData.pdf || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, pdf: e.target.value || null }))}
                  placeholder="https://.../file.pdf"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Image URLs</label>
              <div className="space-y-2 mb-3">
                {(formData.images || []).map((src, idx) => (
                  <div key={`${src}-${idx}`} className="flex items-center gap-2 bg-white p-2 rounded border border-slate-300">
                    <a href={src} target="_blank" rel="noreferrer" className="text-xs text-blue-700 hover:underline flex-1 truncate">
                      {src}
                    </a>
                    <button
                      type="button"
                      onClick={() => removeImageUrl(idx)}
                      className="text-red-600 hover:text-red-800"
                      title="Remove"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={imageUrlDraft}
                  onChange={(e) => setImageUrlDraft(e.target.value)}
                  placeholder="Paste image URL and press Add"
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addImageUrl(imageUrlDraft);
                      setImageUrlDraft('');
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    addImageUrl(imageUrlDraft);
                    setImageUrlDraft('');
                  }}
                  className="bg-slate-300 hover:bg-slate-400 text-slate-900 px-4 py-2 rounded-lg transition"
                >
                  Add
                </button>
              </div>

            </div>

            {/* Description HTML */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description (HTML)</label>
              <textarea
                name="descriptionHtml"
                value={formData.descriptionHtml}
                onChange={handleChange}
                rows={6}
                placeholder="Paste HTML here (supports text sizes/colors/images etc.)"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>


            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
              >
                {editingId ? 'Update Badge' : 'Add Badge'}
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

      {/* Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {badges.length === 0 ? (
          <div className="col-span-full text-center py-8 text-slate-500">
            <p>No badges yet. Add one to get started.</p>
          </div>
        ) : (
          badges.map(badge => (
            <div key={badge.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-lg transition">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{badge.title}</h3>
                  <p className="text-sm text-slate-600">{badge.category}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(badge)}
                    className="text-blue-600 hover:text-blue-800 transition"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(badge.id)}
                    className="text-red-600 hover:text-red-800 transition"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mb-3">
                <span className="inline-block px-2 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded">
                  {badge.section}
                </span>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-700 mb-2">Requirements:</p>
                <ul className="text-sm text-slate-600 space-y-1">
                  {badge.requirements.slice(0, 3).map((req, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span>•</span>
                      <span>{req}</span>
                    </li>
                  ))}
                  {badge.requirements.length > 3 && (
                    <li className="text-slate-500 italic">
                      +{badge.requirements.length - 3} more...
                    </li>
                  )}
                </ul>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
