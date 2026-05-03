"use client";

import { useEffect, useState } from "react";
import { Building2, Activity } from "lucide-react";

interface WarehouseStatusProps {
  warehouses: any[];
}

export function WarehouseStatus({ warehouses: initialWarehouses }: WarehouseStatusProps) {
  const [warehouses, setWarehouses] = useState(initialWarehouses);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const poll = async () => {
      setIsUpdating(true);
      try {
        const res = await fetch("/api/warehouses/status");
        const json = await res.json();
        if (json.data) {
          setWarehouses(json.data);
        }
      } catch (err) {
        console.error("Failed to poll warehouse status", err);
      } finally {
        setTimeout(() => setIsUpdating(false), 1000);
      }
    };

    const interval = setInterval(poll, 4000); // Poll every 4 seconds for high-speed updates
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="premium-card p-10 animate-in">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="h-px w-8 bg-primary" />
            <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Network Status</span>
          </div>
          <div className="flex items-center gap-4">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              Global Node <span className="text-gradient">Distribution</span>
            </h2>
            {isUpdating && (
              <Activity className="h-5 w-5 text-primary animate-pulse" />
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 px-5 py-2.5 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100 shadow-sm">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          <span className="text-xs font-bold uppercase tracking-wider">All Systems Operational</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {warehouses.map((warehouse: any, index: number) => {
          const totalStock = warehouse.stocks.reduce((acc: number, s: any) => acc + s.totalUnits, 0);
          const usedStock = warehouse.stocks.reduce((acc: number, s: any) => acc + s.reservedUnits, 0);
          const percentage = totalStock > 0 ? (usedStock / totalStock) * 100 : 0;
          
          const isPrimary = index === 0;

          return (
            <div key={warehouse.id} className="group p-8 rounded-3xl border border-slate-50 bg-slate-50/50 hover:border-primary/20 hover:bg-white transition-all duration-300">
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-5">
                  <div className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-105 ${isPrimary ? "bg-primary text-white shadow-xl shadow-primary/30" : "bg-white border border-slate-200 text-slate-400 shadow-sm"}`}>
                    <Building2 className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 leading-tight">
                      {warehouse.name}
                    </h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                      {warehouse.location}
                    </p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${isPrimary ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-500"}`}>
                  {isPrimary ? "Primary Node" : "Regional Node"}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-bold text-slate-500">Utilization Rate</span>
                  <span className={`text-sm font-bold tabular-nums ${percentage > 80 ? "text-rose-500" : "text-slate-900"}`}>{Math.round(percentage)}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${percentage > 80 ? "bg-rose-500" : isPrimary ? "bg-primary" : "bg-indigo-400"}`}
                    style={{ width: `${Math.max(percentage, 5)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-2">
                  <span>{usedStock} Reserved</span>
                  <span>{totalStock} Total Capacity</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
