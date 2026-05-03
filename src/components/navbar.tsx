"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { LoginModal } from "@/components/login-modal";
import { LogOut, User as UserIcon, ChevronDown } from "lucide-react";
import { maskEmail } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const { user, logout, isAuthenticated } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const navItems = [
    { name: "Product", href: "/" },
    { name: "Warehouses", href: "/warehouses" },
    { name: "Reservations", href: "/reservations" },
    { name: "Settings", href: "/settings" },
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 glass">
        <div className="mx-auto px-6 lg:px-12">
          <div className="flex h-18 items-center justify-between">
            <div className="flex items-center gap-12">
              <Link href="/" className="flex items-center gap-3 group transition-all">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white font-bold text-xl shadow-lg shadow-primary/30 group-hover:rotate-3 transition-all duration-300">
                  A
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-slate-900 tracking-tight leading-none">AlloInventory</span>
                  <span className="text-[10px] font-bold text-primary tracking-widest uppercase mt-1">Global Systems</span>
                </div>
              </Link>

              <div className="hidden lg:flex items-center gap-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`relative px-5 py-2.5 text-sm font-bold transition-all duration-300 rounded-xl ${
                        isActive
                          ? "text-primary bg-primary/5"
                          : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/50"
                      }`}
                    >
                      {item.name}
                      {isActive && (
                        <div className="absolute bottom-2 left-5 right-5 h-0.5 bg-primary rounded-full animate-in" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-6">
              {isAuthenticated && user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-3 pl-4 pr-3 py-2 rounded-2xl border border-slate-200 bg-white hover:border-primary/30 transition-all shadow-sm group"
                  >
                    <div className="flex items-center">
                      <span className="text-sm font-bold text-slate-900 leading-none">
                        {user.name}
                      </span>
                    </div>
                    <div className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      <UserIcon className="h-5 w-5" />
                    </div>
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-3 w-56 rounded-3xl bg-white border border-slate-100 shadow-2xl py-3 animate-in overflow-hidden">
                      <div className="px-5 py-2 border-b border-slate-50 mb-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          Management Portal
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          logout();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-5 py-3 text-sm font-bold text-rose-500 hover:bg-rose-50 transition-colors"
                      >
                        <LogOut className="h-5 w-5" />
                        Log Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Button
                  onClick={() => setIsLoginOpen(true)}
                  className="rounded-2xl bg-slate-900 text-white hover:bg-slate-800 px-8 h-11 text-sm font-bold shadow-xl shadow-slate-900/10 active:scale-95 transition-all"
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
  );
}
