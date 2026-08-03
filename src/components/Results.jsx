import { useEffect, useState } from 'react';

import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import AdGuard from './AdGuard';
import { getResults, subscribeToData } from '../utils/dataManager';

export default function Results() {
  const [results, setResults] = useState(() => getResults());

  useEffect(() => {
    const unsubscribe = subscribeToData(() => {
      setResults(getResults());
    });

    const handleStorage = (event) => {
      if (event.key === 'scouts_data') {
        setResults(getResults());
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => {
      unsubscribe();
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Passed':
        return <CheckCircle className="text-[var(--color-secondary)]" size={20} />;
      case 'In Review':
        return <Clock className="text-[var(--color-accent)]" size={20} />;
      default:
        return <AlertCircle className="text-[var(--color-header)]" size={20} />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Passed':
        return 'bg-[rgba(16,185,129,0.12)] text-[var(--color-secondary)]';
      case 'In Review':
        return 'bg-[color-mix(in srgb, var(--color-secondary) 18%, transparent)] text-[var(--color-secondary)]';
      default:
        return 'bg-[color-mix(in srgb, var(--color-primary) 14%, transparent)] text-[var(--color-primary)]';
    }
  };

  const getSectionColor = (section) => {
    switch (section) {
      case 'Shaheen':
        return 'bg-[color-mix(in srgb, var(--color-accent) 14%, transparent)] border-[color-mix(in srgb, var(--color-accent) 30%, transparent)]';
      case 'Scout':
        return 'bg-[color-mix(in srgb, var(--color-secondary) 14%, transparent)] border-[color-mix(in srgb, var(--color-secondary) 25%, transparent)]';
      case 'Rover':
        return 'bg-[color-mix(in srgb, var(--color-primary) 12%, transparent)] border-[color-mix(in srgb, var(--color-primary) 22%, transparent)]';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 pt-8 pb-12">
      <AdGuard trigger="results" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-800 mb-3">
            Badge Testing Results
          </h1>
          <p className="text-lg text-slate-600">
            Recent badge testing outcomes and scout achievements
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-md p-6 border-t-4" style={{ borderTopColor: 'var(--color-secondary)' }}>
            <p className="text-slate-600 text-sm font-semibold">Passed</p>
            <p className="text-3xl font-bold text-[var(--color-secondary)] mt-2">
              {results.filter((r) => r.status === 'Passed').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-t-4" style={{ borderTopColor: 'var(--color-accent)' }}>
            <p className="text-slate-600 text-sm font-semibold">In Review</p>
            <p className="text-3xl font-bold text-[var(--color-accent)] mt-2">
              {results.filter((r) => r.status === 'In Review').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-slate-600">
            <p className="text-slate-600 text-sm font-semibold">Total Results</p>
            <p className="text-3xl font-bold text-slate-700 mt-2">{results.length}</p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ background: 'linear-gradient(90deg, var(--color-header), var(--color-primary))' }}>
                <tr>
                  <th className="px-6 py-4 text-left text-white font-bold text-sm">
                    Scout Name
                  </th>
                  <th className="px-6 py-4 text-left text-white font-bold text-sm">
                    Section
                  </th>
                  <th className="px-6 py-4 text-left text-white font-bold text-sm">
                    Badge
                  </th>
                  <th className="px-6 py-4 text-left text-white font-bold text-sm">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-white font-bold text-sm">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-white font-bold text-sm">
                    Remarks
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {results.map((result) => (
                  <tr
                    key={result.id}
                    className={`hover:bg-slate-50 transition-colors border-l-4 ${getSectionColor(
                      result.section
                    )}`}
                  >
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      {result.scoutName}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          result.section === 'Shaheen'
                            ? 'bg-[rgba(251,191,36,0.12)] text-[var(--color-accent)]'
                            : result.section === 'Scout'
                            ? 'bg-[rgba(16,185,129,0.12)] text-[var(--color-secondary)]'
                            : 'bg-[rgba(109,40,217,0.12)] text-[var(--color-header)]'
                        }`}
                      >
                        {result.section}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-700">{result.badge}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(result.status)}
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadge(
                            result.status
                          )}`}
                        >
                          {result.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm">
                      {new Date(result.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 max-w-xs">
                      {result.remarks}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden mt-8 space-y-4">
          {results.map((result) => (
            <div
              key={result.id}
              className={`bg-white rounded-lg shadow-md p-4 border-l-4 ${getSectionColor(
                result.section
              )}`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-slate-800">{result.scoutName}</h3>
                  <p className="text-sm text-slate-600">{result.badge}</p>
                </div>
                <div className="flex items-center space-x-1">
                  {getStatusIcon(result.status)}
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold ${getStatusBadge(
                      result.status
                    )}`}
                  >
                    {result.status}
                  </span>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <p className="text-slate-600">
                  <span className="font-semibold">Section:</span> {result.section}
                </p>
                <p className="text-slate-600">
                  <span className="font-semibold">Date:</span>{' '}
                  {new Date(result.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
                <p className="text-slate-600">
                  <span className="font-semibold">Remarks:</span> {result.remarks}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
