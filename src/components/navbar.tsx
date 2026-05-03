"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { LoginModal } from "@/components/login-modal";
import { LogOut, User as UserIcon, Menu, X, ChevronRight } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const { user, logout, isAuthenticated } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: "Product", href: "/" },
    { name: "Warehouses", href: "/warehouses" },
    { name: "Reservations", href: "/reservations" },
    { name: "Settings", href: "/settings" },
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 glass border-b border-slate-200/50">
        <div className="mx-auto px-4 md:px-6 lg:px-12">
          <div className="flex h-16 md:h-18 items-center justify-between">
            <div className="flex items-center gap-4 lg:gap-12">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 -ml-2 lg:hidden text-slate-600 hover:text-slate-900 transition-colors"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>

              <Link href="/" className="flex items-center gap-2 md:gap-3 group transition-all">
                <div className="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-lg md:rounded-xl bg-primary text-white font-bold text-lg md:text-xl shadow-lg shadow-primary/30 group-hover:rotate-3 transition-all duration-300">
                  A
                </div>
                <div className="flex flex-col">
                  <span className="text-lg md:text-xl font-bold text-slate-900 tracking-tight leading-none">AlloInventory</span>
                  <span className="hidden xs:block text-[8px] md:text-[10px] font-bold text-primary tracking-widest uppercase mt-1">Global Systems</span>
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

            <div className="flex items-center gap-2 md:gap-6">
              {isAuthenticated && user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 md:gap-3 pl-2 pr-2 md:pl-4 md:pr-3 py-1.5 md:py-2 rounded-xl md:rounded-2xl border border-slate-200 bg-white hover:border-primary/30 transition-all shadow-sm group"
                  >
                    <div className="hidden sm:flex items-center">
                      <span className="text-sm font-bold text-slate-900 leading-none">
                        {user.name}
                      </span>
                    </div>
                    <div className="h-8 w-8 md:h-9 md:w-9 rounded-lg md:rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      <UserIcon className="h-4 w-5 md:h-5 md:w-5" />
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
                  className="rounded-xl md:rounded-2xl bg-slate-900 text-white hover:bg-slate-800 px-4 md:px-8 h-9 md:h-11 text-xs md:text-sm font-bold shadow-xl shadow-slate-900/10 active:scale-95 transition-all"
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-100 bg-white/95 backdrop-blur-md animate-in slide-in-from-top duration-300">
            <div className="p-4 space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-6 py-4 rounded-2xl text-sm font-bold transition-all ${
                      isActive
                        ? "text-primary bg-primary/5"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {item.name}
                    <ChevronRight className={`h-4 w-4 ${isActive ? "text-primary" : "text-slate-300"}`} />
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
  );
}

