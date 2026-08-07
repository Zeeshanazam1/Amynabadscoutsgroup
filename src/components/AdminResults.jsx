import { useState, useEffect } from 'react';
import { Trash2, Edit2, Plus, X } from 'lucide-react';

import {
  getResults,
  addResult,
  updateResult,
  deleteResult,
  subscribeToData,
} from '../utils/dataManager';

export default function AdminResults() {
  const [results, setResults] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    scoutName: '',
    section: '',
    badge: '',
    status: 'Passed',
    date: new Date().toISOString().split('T')[0],
    remarks: '',
  });

  const loadResults = () => {
    setResults(getResults());
  };

  useEffect(() => {
    loadResults();
    const unsub = subscribeToData(loadResults);
    return () => unsub();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await updateResult(editingId, formData);
      setEditingId(null);
    } else {
      await addResult(formData);
    }
    resetForm();
    loadResults();
  };

  const handleEdit = (result) => {
    setFormData({
      scoutName: result.scoutName,
      section: result.section,
      badge: result.badge,
      status: result.status,
      date: result.date,
      remarks: result.remarks,
    });
    setEditingId(result.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this result?')) {
      await deleteResult(id);
      loadResults();
    }
  };

  const resetForm = () => {
    setFormData({
      scoutName: '',
      section: '',
      badge: '',
      status: 'Passed',
      date: new Date().toISOString().split('T')[0],
      remarks: '',
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Manage Results</h2>
        <p className="text-slate-600">Add, edit, or delete badge test results</p>
      </div>

      {/* Add Button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg mb-6 transition"
        >
          <Plus className="w-4 h-4" />
          Add New Result
        </button>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-slate-50 rounded-lg p-6 mb-6 border border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-slate-900">
              {editingId ? 'Edit Result' : 'Add New Result'}
            </h3>
            <button
              onClick={resetForm}
              className="text-slate-500 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Scout Name *
                </label>
                <input
                  type="text"
                  name="scoutName"
                  value={formData.scoutName}
                  onChange={handleChange}
                  placeholder="Enter scout name"
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
                  Badge *
                </label>
                <input
                  type="text"
                  name="badge"
                  value={formData.badge}
                  onChange={handleChange}
                  placeholder="Badge name"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Status *
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Passed">Passed</option>
                  <option value="Failed">Failed</option>
                  <option value="In Review">In Review</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Remarks
              </label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                placeholder="Optional remarks about the performance"
                rows="3"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
              >
                {editingId ? 'Update Result' : 'Add Result'}
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

      {/* Results Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-200 text-slate-900">
              <th className="px-4 py-3 text-left font-semibold">Scout Name</th>
              <th className="px-4 py-3 text-left font-semibold">Section</th>
              <th className="px-4 py-3 text-left font-semibold">Badge</th>
              <th className="px-4 py-3 text-left font-semibold">Status</th>
              <th className="px-4 py-3 text-left font-semibold">Date</th>
              <th className="px-4 py-3 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {results.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center text-slate-500">
                  No results yet. Add one to get started.
                </td>
              </tr>
            ) : (
              results.map(result => (
                <tr key={result.id} className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-900">{result.scoutName}</td>
                  <td className="px-4 py-3 text-slate-700">{result.section}</td>
                  <td className="px-4 py-3 text-slate-700">{result.badge}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      result.status === 'Passed' ? 'bg-green-100 text-green-800' :
                      result.status === 'Failed' ? 'bg-red-100 text-red-800' :
                      result.status === 'In Review' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-slate-100 text-slate-800'
                    }`}>
                      {result.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{result.date}</td>
                  <td className="px-4 py-3 flex gap-2">
                    <button
                      onClick={() => handleEdit(result)}
                      className="text-blue-600 hover:text-blue-800 transition"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(result.id)}
                      className="text-red-600 hover:text-red-800 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
