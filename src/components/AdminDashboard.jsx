import { useState } from 'react';


import { logout } from '../utils/authManager';
import { LogOut, Badge, Calendar, FileText, Settings, Download, Upload, MessageCircle } from 'lucide-react';
import AdminResults from './AdminResults';
import AdminBadges from './AdminBadges';
import AdminEvents from './AdminEvents';
import AdminWebsiteInfo from './AdminWebsiteInfo';
import AdminTheme from './AdminTheme';
import AdminPageThemeSettings from './AdminPageThemeSettings';
import AdminThemeBackgrounds from './AdminThemeBackgrounds';


import AdminShopSettings from './AdminShopSettings';

import AdminAdvertisements from './AdminAdvertisements';
import AdminContactRequests from './AdminContactRequests';
import AdminChatControl from './AdminChatControl';
import AdminContactAndAdRequests from './AdminContactAndAdRequests';
import { exportData } from '../utils/dataManager';



export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('results');

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout();
      window.location.hash = '#/home';
    }
  };

  const handleExport = () => {
    exportData();
    alert('Data exported successfully!');
  };

  const menuItems = [
    { id: 'results', label: 'Upload Results', icon: FileText },
    { id: 'badges', label: 'Manage Badges', icon: Badge },
    { id: 'events', label: 'Manage Events', icon: Calendar },
    { id: 'advertisements', label: 'Advertisements', icon: Upload },
    { id: 'contact-ad-requests', label: 'Contact & Ad Requests', icon: MessageCircle },

    { id: 'shop-settings', label: 'Shop Settings', icon: Settings },

    { id: 'website-info', label: 'Website Info', icon: Settings },
    { id: 'theme', label: 'Global Theme Customizer', icon: Settings },
    { id: 'theme-backgrounds', label: 'Theme Background Images', icon: Settings },
    { id: 'page-theme', label: 'Page Theme Settings', icon: Settings },
  ];




  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-slate-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-slate-400 text-sm">Amynabad Scouts Group Management</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition"
              title="Export all data as JSON"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="bg-white rounded-lg shadow-md overflow-hidden">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 border-l-4 transition ${
                      activeTab === item.id
                        ? 'bg-amber-50 border-amber-500 text-amber-700 font-semibold'
                        : 'border-transparent text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Quick Stats */}
            <div className="mt-6 bg-white rounded-lg shadow-md p-4">
              <h3 className="font-semibold text-slate-900 mb-4">Quick Info</h3>
              <div className="space-y-3 text-sm">
                <p className="text-slate-600">
                  💡 Use the menu on the left to manage different sections of your website.
                </p>
                <p className="text-slate-600">
                  📊 All changes are saved automatically to your browser's storage.
                </p>
                <p className="text-slate-600">
                  ⬇️ Use Export button to backup your data as JSON.
                </p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md p-6">
              {activeTab === 'results' && <AdminResults />}
              {activeTab === 'badges' && <AdminBadges />}
              {activeTab === 'events' && <AdminEvents />}
              {activeTab === 'advertisements' && <AdminAdvertisements />}
              {activeTab === 'contact-ad-requests' && <AdminContactAndAdRequests />}
              {activeTab === 'chat-control' && <AdminChatControl />}

              {activeTab === 'shop-settings' && <AdminShopSettings />}

              {activeTab === 'website-info' && <AdminWebsiteInfo />}
              {activeTab === 'theme' && <AdminTheme />}
              {activeTab === 'page-theme' && <AdminPageThemeSettings />}






            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
