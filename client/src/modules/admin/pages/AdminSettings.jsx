import React, { useState } from "react";
import { Save, User, Bell, Shield, Lock } from "lucide-react";
import AdminSidebar from "../components/AdminSidebar";

const AdminSettings = () => {
  const [collapsed, setCollapsed] = useState(false);

  // Mock settings state
  const [settings, setSettings] = useState({
    siteName: "EduHackTech",
    maintenanceMode: false,
    emailNotifications: true,
    allowRegistration: true,
  });

  const handleToggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-100">
      <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <main
        className={`transition-all duration-300 ${collapsed ? "ml-20" : "ml-64"} p-8`}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Platform Settings
          </h1>
          <p className="text-slate-400">
            Manage your platform configuration and preferences.
          </p>
        </div>

        <div className="space-y-6 max-w-4xl">
          {/* General Settings */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-500/20 p-2 rounded-lg">
                <User className="text-blue-500" size={20} />
              </div>
              <h2 className="text-xl font-semibold text-white">
                General Information
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-slate-400 mb-2 text-sm">
                  Platform Name
                </label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) =>
                    setSettings({ ...settings, siteName: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Security & Access */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-emerald-500/20 p-2 rounded-lg">
                <Shield className="text-emerald-500" size={20} />
              </div>
              <h2 className="text-xl font-semibold text-white">
                Security & Access
              </h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-xl border border-slate-800/50">
                <div>
                  <h3 className="font-medium text-white">
                    Allow Public Registration
                  </h3>
                  <p className="text-sm text-slate-400">
                    If disabled, only admins can add users.
                  </p>
                </div>
                <button
                  onClick={() => handleToggle("allowRegistration")}
                  className={`relative w-12 h-6 rounded-full transition-colors ${settings.allowRegistration ? "bg-emerald-500" : "bg-slate-700"}`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.allowRegistration ? "translate-x-6" : "translate-x-0"}`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-xl border border-slate-800/50">
                <div>
                  <h3 className="font-medium text-white">Maintenance Mode</h3>
                  <p className="text-sm text-slate-400">
                    Disable platform access for non-admins.
                  </p>
                </div>
                <button
                  onClick={() => handleToggle("maintenanceMode")}
                  className={`relative w-12 h-6 rounded-full transition-colors ${settings.maintenanceMode ? "bg-blue-500" : "bg-slate-700"}`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.maintenanceMode ? "translate-x-6" : "translate-x-0"}`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-amber-500/20 p-2 rounded-lg">
                <Bell className="text-amber-500" size={20} />
              </div>
              <h2 className="text-xl font-semibold text-white">
                Notifications
              </h2>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-xl border border-slate-800/50">
              <div>
                <h3 className="font-medium text-white">Email Notifications</h3>
                <p className="text-sm text-slate-400">
                  Receive summaries of platform activity.
                </p>
              </div>
              <button
                onClick={() => handleToggle("emailNotifications")}
                className={`relative w-12 h-6 rounded-full transition-colors ${settings.emailNotifications ? "bg-blue-500" : "bg-slate-700"}`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.emailNotifications ? "translate-x-6" : "translate-x-0"}`}
                />
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors shadow-lg shadow-blue-600/20">
              <Save size={20} />
              Save Changes
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminSettings;
