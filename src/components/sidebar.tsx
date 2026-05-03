"use client";

import { useEffect, useState } from "react";

export function Sidebar() {
  const [warehouses, setWarehouses] = useState<any[]>([]);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/warehouses/status");
        const json = await res.json();
        if (json.data) {
          setWarehouses(json.data);
        }
      } catch (err) {
        console.error("Sidebar failed to fetch status", err);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 10000); // Poll every 10s for sidebar status speed
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hidden md:block w-[300px] border-r border-slate-200 bg-slate-50/50 p-8 shrink-0 h-[calc(100vh-4.5rem)] sticky top-18 overflow-y-auto">
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[11px] font-bold text-slate-400 tracking-[0.15em] uppercase">Warehouse Status</h3>
          <div className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[9px] font-bold uppercase tracking-wider">Live</div>
        </div>
        <div className="space-y-4">
          {warehouses.length > 0 ? (
            warehouses.map((w, index) => {
              const total = w.stocks.reduce((acc: number, s: any) => acc + s.totalUnits, 0);
              const reserved = w.stocks.reduce((acc: number, s: any) => acc + s.reservedUnits, 0);
              const percentage = total > 0 ? (reserved / total) * 100 : 0;
              const isPrimary = index === 0;

              return (
                <div key={w.id} className="p-5 rounded-3xl bg-white border border-slate-100 shadow-sm transition-all hover:border-primary/20 group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-slate-900 leading-tight">
                        {w.name}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-tighter">
                        {w.location.split(',')[0]}
                      </span>
                    </div>
                    <div className={`h-2 w-2 rounded-full ${isPrimary ? "bg-primary shadow-[0_0_8px_rgba(59,130,246,0.5)]" : "bg-slate-300"}`} />
                  </div>
                  
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 mb-2">
                    <span>Load</span>
                    <span className={percentage > 80 ? "text-rose-500" : "text-slate-900"}>{Math.round(percentage)}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${percentage > 80 ? "bg-rose-500" : isPrimary ? "bg-primary" : "bg-indigo-400"}`}
                      style={{ width: `${Math.max(percentage, 5)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })
          ) : (
            // Skeleton / Loading
            Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="p-5 border border-slate-50 rounded-3xl bg-white/50 animate-pulse h-28" />
            ))
          )}
        </div>
      </div>


      <div>
        <h3 className="text-[11px] font-bold text-slate-400 mb-6 tracking-[0.15em] uppercase">Availability</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: "US-E", status: "ok" },
            { id: "EU-C", status: "ok" },
            { id: "AS-S", status: "warn" },
            { id: "AU-E", status: "ok" }
          ].map((region) => (
            <div key={region.id} className="flex flex-col gap-2 p-3 rounded-2xl bg-white border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-700">{region.id}</span>
                <div className={`h-1.5 w-1.5 rounded-full ${region.status === "ok" ? "bg-emerald-500" : "bg-amber-500"}`}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
