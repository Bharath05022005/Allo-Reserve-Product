"use client";

import { useEffect, useState } from "react";
import { Activity } from "lucide-react";

export function LiveLatency() {
  const [data, setData] = useState([4, 2, 6, 3, 8, 4, 10, 5, 8]);

  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) => {
        const newData = [...prev.slice(1)];
        // Generate a random height between 2 and 10
        newData.push(Math.floor(Math.random() * 9) + 2);
        return newData;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl lg:col-span-1 border border-slate-800">
      <div className="flex justify-between items-start mb-6">
        <div className="h-10 w-10 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
          <Activity className="h-5 w-5 text-indigo-400 animate-pulse" />
        </div>
        <div className="text-right">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            NODE SYNC
          </div>
          <div className="text-xs font-bold text-emerald-400 flex items-center justify-end gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
            Stable
          </div>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">
          CLUSTER LATENCY
        </h3>
        <div className="flex items-end gap-1 h-12">
          {data.map((h, i) => (
            <div
              key={i}
              className="flex-1 bg-indigo-500/40 rounded-t-sm transition-all duration-500 ease-in-out"
              style={{ height: `${h * 10}%` }}
            />
          ))}
        </div>
      </div>
      <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest flex justify-between">
        <span>BACKBONE: AWS-GLOBAL-MESH</span>
        <span className="font-mono text-indigo-500/60">12MS AVG</span>
      </div>
    </div>
  );
}
