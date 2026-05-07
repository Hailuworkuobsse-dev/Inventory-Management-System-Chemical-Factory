import React, { useState } from 'react';
import { Settings, Save, Bell, Database, Lock, Globe, Palette, Server } from 'lucide-react';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import StatusBadge from '../../../components/StatusBadge';

const SystemSettingsPage = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [hasChanges, setHasChanges] = useState(false);

  const settingsTabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'data', label: 'Data & Storage', icon: Database },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'localization', label: 'Localization', icon: Globe },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'integrations', label: 'Integrations', icon: Server },
  ];

  const handleSave = () => {
    console.log('Saving settings...');
    setHasChanges(false);
  };

  const handleChange = () => {
    setHasChanges(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-500 mt-1">Configure system-wide preferences and options</p>
        </div>
        {hasChanges && (
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        )}
      </div>

      <div className="flex gap-6">
        {/* Sidebar Tabs */}
        <div className="w-64 flex-shrink-0">
          <nav className="space-y-1">
            {settingsTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">General Settings</h2>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name
                  </label>
                  <Input defaultValue="Acme Corporation" onChange={handleChange} />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    System Name
                  </label>
                  <Input defaultValue="WMS Pro" onChange={handleChange} />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Warehouse
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" onChange={handleChange}>
                    <option>Main Warehouse</option>
                    <option>Cold Storage Facility</option>
                    <option>Distribution Center</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timezone
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" onChange={handleChange}>
                    <option>UTC</option>
                    <option>America/New_York</option>
                    <option>Europe/London</option>
                    <option>Asia/Singapore</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Format
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" onChange={handleChange}>
                    <option>MM/DD/YYYY</option>
                    <option>DD/MM/YYYY</option>
                    <option>YYYY-MM-DD</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-4">System Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">System Version</span>
                    <StatusBadge status="success" label="v2.4.1" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Database Status</span>
                    <StatusBadge status="success" label="Connected" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Last Backup</span>
                    <span className="text-sm text-gray-500">Today at 02:00 AM</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Notification Settings</h2>
              
              <div className="space-y-4">
                {[
                  { label: 'Email Notifications', description: 'Receive email alerts for critical events' },
                  { label: 'Push Notifications', description: 'Browser push notifications for real-time updates' },
                  { label: 'Low Stock Alerts', description: 'Get notified when stock falls below threshold' },
                  { label: 'Expiry Warnings', description: 'Alerts for products approaching expiry date' },
                  { label: 'System Maintenance', description: 'Notifications about scheduled maintenance' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{item.label}</p>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked onChange={handleChange} />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Security Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session Timeout (minutes)
                  </label>
                  <Input type="number" defaultValue="30" onChange={handleChange} />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password Policy
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" onChange={handleChange}>
                    <option>Standard (8+ characters)</option>
                    <option>Strong (12+ characters, special chars)</option>
                    <option>Enterprise (Custom policy)</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-500">Require 2FA for all users</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" onChange={handleChange} />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">IP Whitelisting</p>
                    <p className="text-sm text-gray-500">Restrict access to specific IP addresses</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" onChange={handleChange} />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {(activeTab !== 'general' && activeTab !== 'notifications' && activeTab !== 'security') && (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Settings className="w-12 h-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Coming Soon</h3>
              <p className="text-gray-500 mt-1">This settings section is under development</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemSettingsPage;
