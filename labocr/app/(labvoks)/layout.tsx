"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ArrowRightOnRectangleIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import { Instagram, Youtube, Globe } from "lucide-react";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [showText, setShowText] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShowText(true);
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // UPDATE: href sudah disesuaikan dengan Route Groups (tanpa /labvoks)
  const navLinks = [
    { name: "Beranda", href: "/" },
    { name: "Jadwal Lab", href: "/jadwal" },
    { name: "Tentang", href: "/tentang" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] antialiased font-sans">
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
                      active 
                      ? "bg-white text-[#E40082] shadow-sm" 
                      : "text-[#263C92] hover:text-[#E40082]"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex w-1/3 justify-end items-center gap-2 relative z-[60]">
            <Link href="/auth/login" className="hidden md:flex items-center gap-2 px-6 py-2.5 rounded-full text-[13px] font-bold transition-all duration-300 bg-[#263C92] text-white hover:bg-[#1a2b6d] active:scale-95">
              <span>Login</span>
              <ArrowRightOnRectangleIcon className="h-4 w-4" />
            </Link>

            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 rounded-full bg-slate-50 text-[#263C92] md:hidden transition-colors">
              {isMobileMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
            </button>
          </div>

          <div className={`absolute top-0 left-0 w-full bg-white border-b border-slate-100 rounded-[2rem] pt-20 pb-8 px-6 shadow-xl transition-all duration-500 ease-in-out md:hidden z-[50] ${isMobileMenuOpen ? "translate-y-0 opacity-100 shadow-2xl" : "-translate-y-full opacity-0 pointer-events-none"}`}>
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setIsMobileMenuOpen(false)} className={`p-4 rounded-2xl text-[15px] font-bold ${pathname === link.href ? "bg-[#E40082]/5 text-[#E40082]" : "text-[#263C92] bg-slate-50"}`}>
                  {link.name}
                </Link>
              ))}
              <Link href="/auth/login" className="mt-2 flex items-center justify-center gap-2 p-4 rounded-2xl bg-[#263C92] text-white font-bold">
                Login Sistem <ArrowRightOnRectangleIcon className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </nav>
      </header>

      <main className="flex-1 w-full">{children}</main>

      <footer className="bg-white border-t border-slate-100 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
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