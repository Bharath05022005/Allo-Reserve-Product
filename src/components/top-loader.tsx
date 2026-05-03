"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function TopLoader() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // When pathname changes, show the loader briefly
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, [pathname]);

  if (!loading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-1 bg-indigo-600 transition-all duration-300 ease-out animate-in fade-in slide-in-from-left-full" />
  );
}
