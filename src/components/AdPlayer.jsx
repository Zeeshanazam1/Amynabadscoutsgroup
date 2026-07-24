import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function AdPlayer({ ad, onClose, autoClose = true, duration = 5 }) {
  const [timeLeft, setTimeLeft] = useState(duration);


  useEffect(() => {
    if (!autoClose) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoClose, onClose]);


  if (!ad) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full mx-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex justify-between items-center">
          <h3 className="text-lg font-bold">Advertisement</h3>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Image Ad */}
          {ad.type === 'image' && ad.imageUrl && (
            <div className="mb-4">
              <img
                src={ad.imageUrl}
                alt={ad.title}
                className="w-full rounded-lg object-cover max-h-64"
              />
            </div>
          )}

          {/* Video Ad */}
          {ad.type === 'video' && ad.videoUrl && (
            <div className="mb-4">
              <video
                src={ad.videoUrl}
                controls
                className="w-full rounded-lg max-h-64"
                autoPlay
              />
            </div>
          )}

          {/* Ad Title & Description */}
          <h4 className="text-2xl font-bold text-slate-900 mb-2">{ad.title}</h4>
          {ad.description && (
            <p className="text-slate-600 mb-4">{ad.description}</p>
          )}

          {/* Action Button */}
          {ad.linkUrl && (
            <a
              href={ad.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition mb-4"
            >
              Learn More
            </a>
          )}

          {/* Timer & Skip */}
          <div className="mt-6 pt-4 border-t border-slate-200 flex justify-between items-center">
            {autoClose && (
              <div className="text-sm text-slate-600">
                Auto-closing in <span className="font-bold">{timeLeft}s</span>
              </div>
            )}
            <button
              onClick={onClose}
              className="bg-slate-200 hover:bg-slate-300 text-slate-900 font-semibold px-4 py-2 rounded-lg transition"
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
