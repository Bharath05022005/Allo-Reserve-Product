"use client";

import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { useState } from "react";

export function RefreshButton() {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    router.refresh();
    // Simulate a bit of loading for UX
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <button
      onClick={handleRefresh}
      disabled={isRefreshing}
      className="flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-600 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 transition-colors disabled:opacity-50"
    >
      <RefreshCw className={`h-3 w-3 ${isRefreshing ? "animate-spin" : ""}`} />
      {isRefreshing ? "Refreshing..." : "Refresh Feed"}
    </button>
  );
}
