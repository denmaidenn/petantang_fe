"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ArrowRightOnRectangleIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import { Instagram, Youtube, Globe, LogOut, User, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [showText, setShowText] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // --- LOGIKA LOGIN & MODAL ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    setShowText(true);
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);

    const storedName = localStorage.getItem("user_name");
    if (storedName) {
      setIsLoggedIn(true);
      setUserName(storedName);
    }

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const confirmLogout = () => {
    localStorage.removeItem("user_name");
    localStorage.removeItem("access_token");
    setIsLoggedIn(false);
    setUserName("");
    setShowLogoutModal(false);
    setIsMobileMenuOpen(false);
  };

  const navLinks = [
    { name: "Beranda", href: "/" },
    { name: "Jadwal Lab", href: "/jadwal" },
    { name: "Tentang", href: "/tentang" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] antialiased font-sans">
      
      {/* ================= MODAL LOGOUT MODERN ================= */}
      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white rounded-[2.5rem] p-8 shadow-2xl max-w-sm w-full text-center border border-slate-100"
            >
              <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-rose-500" />
              </div>
              <h3 className="text-xl font-bold text-[#263C92] mb-2">Konfirmasi Keluar</h3>
              <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                Apakah kamu yakin ingin keluar dari sistem? Kamu perlu login kembali untuk mengakses fitur lab.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 py-3.5 rounded-2xl font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 transition-colors text-[13px]"
                >
                  Batal
                </button>
                <button 
                  onClick={confirmLogout}
                  className="flex-1 py-3.5 rounded-2xl font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-200 transition-all text-[13px]"
                >
                  Ya, Keluar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <header className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-500 ${scrolled ? "pt-2 px-4" : "pt-4 px-4 md:px-8"}`}>
        <nav className={`
          mx-auto transition-all duration-500 ease-in-out px-4 md:px-8
          ${scrolled 
            ? "max-w-5xl rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.06)] border-slate-200 bg-white/95" 
            : "max-w-7xl rounded-[2rem] border-transparent bg-transparent"} 
          backdrop-blur-md border flex items-center justify-between h-16 md:h-20
        `}>
          
          <div className="flex w-1/3 justify-start">
            <Link href="/" className="flex items-center gap-3 md:gap-4 group relative z-[60]">
              <div className="relative shrink-0">
                <Image src="/images/logosvipb.png" alt="Logo SV IPB" width={100} height={100} className="object-contain md:w-[50px] md:h-[50px]" priority />
              </div>
              <div className="w-[1.5px] h-6 md:h-8 bg-[#E40082] hidden sm:block"></div>
              <div className="hidden sm:flex flex-col">
                <h1 className={`text-[12px] md:text-[13px] font-bold text-[#263C92] tracking-tight transition-all duration-700 ${showText ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}`}>
                  Sistem Informasi Laboratorium
                </h1>
                <span className={`text-[8px] md:text-[9px] text-slate-400 font-extrabold uppercase tracking-[0.15em] transition-all duration-700 delay-100 ${showText ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}`}>
                  Sekolah Vokasi IPB
                </span>
              </div>
            </Link>
          </div>

          <div className="hidden md:flex w-1/3 justify-center">
            <div className="flex items-center bg-slate-50/50 p-1 rounded-full border border-slate-100 backdrop-blur-sm">
              {navLinks.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link 
                    key={link.href} 
                    href={link.href} 
                    className={`px-5 py-2 rounded-full text-[13px] transition-all duration-300 font-bold whitespace-nowrap ${
                      active ? "bg-white text-[#E40082] shadow-sm" : "text-[#263C92] hover:text-[#E40082]"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex w-1/3 justify-end items-center gap-2 relative z-[60]">
            {isLoggedIn ? (
              <div className="hidden md:flex items-center gap-2">
                <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-full border border-slate-200 shadow-sm max-w-[220px]">
                  <div className="w-7 h-7 bg-[#263C92] rounded-full flex items-center justify-center text-white shrink-0 shadow-sm">
                    <User className="w-4 h-4" />
                  </div>
                  {/* Nama Mahasiswa - Truncate jika kepanjangan */}
                  <span className="text-[12px] font-bold text-[#263C92] truncate block">
                    {userName}
                  </span>
                </div>
                {/* Button Keluar (Hanya Logo) */}
                <button 
                  onClick={() => setShowLogoutModal(true)}
                  className="p-2.5 rounded-full bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-600 hover:text-white transition-all duration-300 shadow-sm"
                  title="Keluar"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link href="/auth/login" className="hidden md:flex items-center gap-2 px-6 py-2.5 rounded-full text-[13px] font-bold transition-all duration-300 bg-[#263C92] text-white hover:bg-[#1a2b6d] active:scale-95 shadow-md">
                <span>Login</span>
                <ArrowRightOnRectangleIcon className="h-4 w-4" />
              </Link>
            )}

            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 rounded-full bg-slate-50 text-[#263C92] md:hidden transition-colors">
              {isMobileMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
            </button>
          </div>

          {/* --- MOBILE MENU --- */}
          <div className={`absolute top-0 left-0 w-full bg-white border-b border-slate-100 rounded-[2rem] pt-20 pb-8 px-6 shadow-xl transition-all duration-500 ease-in-out md:hidden z-[50] ${isMobileMenuOpen ? "translate-y-0 opacity-100 shadow-2xl" : "-translate-y-full opacity-0 pointer-events-none"}`}>
            <div className="flex flex-col gap-4">
              {isLoggedIn && (
                 <div className="p-4 rounded-2xl bg-slate-50 flex items-center justify-between border border-slate-200">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 bg-[#263C92] rounded-full flex items-center justify-center text-white shrink-0 shadow-md">
                        <User className="w-6 h-6" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Mahasiswa</p>
                        <p className="text-[14px] font-bold text-[#263C92] truncate">{userName}</p>
                      </div>
                    </div>
                    <button onClick={() => setShowLogoutModal(true)} className="p-3 bg-rose-100 text-rose-600 rounded-xl shadow-sm">
                      <LogOut className="w-5 h-5" />
                    </button>
                 </div>
              )}
              
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setIsMobileMenuOpen(false)} className={`p-4 rounded-2xl text-[15px] font-bold ${pathname === link.href ? "bg-[#E40082]/5 text-[#E40082]" : "text-[#263C92] bg-slate-50"}`}>
                  {link.name}
                </Link>
              ))}

              {!isLoggedIn && (
                <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)} className="mt-2 flex items-center justify-center gap-2 p-4 rounded-2xl bg-[#263C92] text-white font-bold">
                  Login Sistem <ArrowRightOnRectangleIcon className="h-5 w-5" />
                </Link>
              )}
            </div>
          </div>
        </nav>
      </header>

      <main className="flex-1 w-full">{children}</main>

      {/* Footer code tetap sama */}
      <footer className="bg-white border-t border-slate-100 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          {/* ... footer content ... */}
          <div className="flex flex-col lg:flex-row gap-12 mb-12">
            <div className="lg:w-[40%] space-y-6 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-4">
                <Image src="/images/logosvipb.png" alt="Logo" width={80} height={80} />
                <div className="w-[2px] h-8 bg-[#E40082] rounded-full"></div>
                <div className="text-left">
                  <h3 className="text-[14px] font-bold text-[#263C92]">Sistem Informasi Laboratorium</h3>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Sekolah Vokasi IPB</span>
                </div>
              </div>
              <p className="text-[14px] text-slate-500 leading-relaxed max-w-md mx-auto md:mx-0">
                Akses informasi jadwal dan peminjaman fasilitas laboratorium Sekolah Vokasi IPB University dalam satu platform terpadu.
              </p>
            </div>
            <div className="lg:w-[60%] grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div className="text-center md:text-left">
                <h4 className="font-bold text-[#263C92] text-[12px] uppercase tracking-widest mb-4">Navigasi</h4>
                <ul className="space-y-2 text-[14px] text-slate-500">
                  {navLinks.map((link) => (
                    <li key={link.href}><Link href={link.href} className="hover:text-[#E40082] transition-colors">{link.name}</Link></li>
                  ))}
                </ul>
              </div>
              <div className="text-center md:text-left">
                <h4 className="font-bold text-[#263C92] text-[12px] uppercase tracking-widest mb-4">Kontak</h4>
                <div className="text-[14px] text-slate-500 space-y-2">
                  <p>Jl. Kumbang No.14, Bogor</p>
                  <p>sv@apps.ipb.ac.id</p>
                </div>
              </div>
              <div className="text-center md:text-left">
                <h4 className="font-bold text-[#263C92] text-[12px] uppercase tracking-widest mb-4">Sosial Media</h4>
                <div className="flex justify-center md:justify-start gap-3">
                  {[Instagram, Youtube, Globe].map((Icon, i) => (
                    <a key={i} href="#" className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#263C92] transition-all shadow-sm">
                      <Icon className="w-4 h-4" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-100 text-center text-[10px] text-slate-400 font-bold tracking-[0.2em] uppercase">
            © 2026 Sekolah Vokasi IPB University.
          </div>
        </div>
      </footer>
    </div>
  );
}