"use client";

import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Zap, Shield, Database, Activity, Server, Globe, Lock, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const [config, setConfig] = useState({
    livePolling: true,
    idempotency: true,
    globalAccess: true,
    notifications: true,
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Configuration Saved",
        description: "Core functionality models updated successfully.",
        variant: "success",
      });
    }, 1000);
  };

  const toggle = (key: keyof typeof config) => {
    setConfig(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <Sidebar />
      <main className="flex-1 p-8 lg:p-12 bg-[#f8f9fc]">
        <div className="max-w-4xl mx-auto animate-page-in">
          <div className="mb-10">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              Settings
            </h1>
            <p className="text-sm text-slate-500 mt-2 font-medium">
              Configure your dashboard preferences and core system behaviors.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8">
            {/* Functionality Models */}
            <section className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 leading-tight">
                    Functionality Models
                  </h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    Core Access & Performance
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Live Node Polling */}
                <div className="flex items-center justify-between p-5 rounded-2xl border border-slate-100 bg-slate-50/30 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <Database className="h-5 w-5 text-slate-400" />
                    <div>
                      <p className="text-sm font-black text-slate-900">Live Node Polling</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Real-time inventory synchronization</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => toggle('livePolling')}
                    className={`h-7 w-12 rounded-full transition-colors relative flex items-center px-1 ${config.livePolling ? "bg-emerald-500" : "bg-slate-200"}`}
                  >
                    <div className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${config.livePolling ? "translate-x-5" : "translate-x-0"}`} />
                  </button>
                </div>

                {/* Idempotency Protection */}
                <div className="flex items-center justify-between p-5 rounded-2xl border border-slate-100 bg-slate-50/30 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <Shield className="h-5 w-5 text-slate-400" />
                    <div>
                      <p className="text-sm font-black text-slate-900">Idempotency Protection</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Prevention of duplicate reservations</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => toggle('idempotency')}
                    className={`h-7 w-12 rounded-full transition-colors relative flex items-center px-1 ${config.idempotency ? "bg-emerald-500" : "bg-slate-200"}`}
                  >
                    <div className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${config.idempotency ? "translate-x-5" : "translate-x-0"}`} />
                  </button>
                </div>

                {/* Global Access Button Control */}
                <div className="flex items-center justify-between p-5 rounded-2xl border border-slate-100 bg-slate-50/30 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <Lock className="h-5 w-5 text-slate-400" />
                    <div>
                      <p className="text-sm font-black text-slate-900">Global Access Buttons</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Enable/Disable all reservation functions</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => toggle('globalAccess')}
                    className={`h-7 w-12 rounded-full transition-colors relative flex items-center px-1 ${config.globalAccess ? "bg-emerald-500" : "bg-slate-200"}`}
                  >
                    <div className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${config.globalAccess ? "translate-x-5" : "translate-x-0"}`} />
                  </button>
                </div>
              </div>
            </section>

            {/* Customer Support & Access Section */}
            <section className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 leading-tight">
                    Customer Support & Access
                  </h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    Direct Assistance & Documentation
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/30">
                  <div className="flex items-center gap-3 mb-3">
                    <Activity className="h-4 w-4 text-indigo-500" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">Support Status</span>
                  </div>
                  <p className="text-2xl font-black text-slate-900">Active</p>
                  <p className="text-[9px] font-bold text-indigo-600 uppercase mt-1">Average Response: 15min</p>
                </div>

                <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/30">
                  <div className="flex items-center gap-3 mb-3">
                    <Globe className="h-4 w-4 text-emerald-500" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">Global Priority</span>
                  </div>
                  <p className="text-2xl font-black text-slate-900">Level 4</p>
                  <p className="text-[9px] font-bold text-emerald-600 uppercase mt-1">24/7 Dedicated Access</p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-100 space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-400">Support Email</span>
                  <span className="font-black text-slate-900 uppercase">support@alloinventory.com</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-400">Documentation</span>
                  <span className="font-black text-indigo-600 uppercase cursor-pointer hover:underline">View Knowledge Base</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-400">Support Access ID</span>
                  <span className="font-black text-slate-900 uppercase">#ALLO-8829-PX</span>
                </div>
              </div>
            </section>

            <div className="flex justify-end gap-4 mt-4">
              <Button variant="ghost" className="rounded-xl px-8 h-12 font-black text-xs tracking-widest text-slate-500 hover:bg-slate-100">
                DISCARD CHANGES
              </Button>
              <Button 
                onClick={handleSave}
                isLoading={isSaving}
                className="rounded-xl px-12 h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs tracking-widest shadow-xl shadow-indigo-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                SAVE CONFIGURATION
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
