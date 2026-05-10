"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { ArrowRightOnRectangleIcon, Bars3Icon, XMarkIcon, BellIcon, CheckIcon, ClockIcon, DocumentTextIcon } from "@heroicons/react/24/outline";
import { useState, useEffect, useRef, useMemo } from "react";
import { Instagram, Youtube, Globe } from "lucide-react";
import { getMahasiswaNotifications, markNotificationDone, type Notification } from "@/lib/api";
import { NotificationDetailModal } from "@/components/NotificationDetailModal";

function formatRelativeTimeId(createdAt: string): string {
  try {
    const d = new Date(createdAt);
    const diffSec = Math.floor((Date.now() - d.getTime()) / 1000);
    if (diffSec < 45) return "Baru saja";
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)} menit lalu`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} jam lalu`;
    if (diffSec < 604800) return `${Math.floor(diffSec / 86400)} hari lalu`;
    return d.toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  } catch {
    return createdAt;
  }
}

function studentNotifMeta(type: Notification["type"]) {
  switch (type) {
    case "booking_pending":
      return {
        chip: "Menunggu ACC",
        chipClass: "bg-amber-50 text-amber-900 border-amber-100",
      };
    case "booking_approved":
      return {
        chip: "Disetujui admin",
        chipClass: "bg-emerald-50 text-emerald-900 border-emerald-100",
      };
    case "booking_rejected":
      return {
        chip: "Ditolak admin",
        chipClass: "bg-red-50 text-red-900 border-red-100",
      };
    default:
      return {
        chip: "Informasi",
        chipClass: "bg-slate-50 text-slate-700 border-slate-100",
      };
  }
}

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [showText, setShowText] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [nim, setNim] = useState<string | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifDetail, setNotifDetail] = useState<Notification | null>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShowText(true);
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);

    const storedName = window.localStorage.getItem("smartlab_user_name");
    const storedRole = window.localStorage.getItem("smartlab_user_role");
    const storedToken = window.localStorage.getItem("smartlab_jwt_token");
    const storedNim = window.localStorage.getItem("smartlab_user_nim");
    if (storedName) setUserName(storedName);
    if (storedRole) setUserRole(storedRole);
    if (storedToken) setToken(storedToken);
    if (storedNim) setNim(storedNim);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!token || userRole !== "mahasiswa" || !nim) return;
      try {
        const response = await getMahasiswaNotifications(token, nim);
        setNotifications(response.notifications);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
        setNotifications([]);
      }
    };

    fetchNotifications();
    const ms = showNotif ? 5000 : 10000;
    const interval = setInterval(fetchNotifications, ms);
    return () => clearInterval(interval);
  }, [token, userRole, nim, showNotif]);

  useEffect(() => {
    if (!showNotif) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowNotif(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showNotif]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotif(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const logout = () => {
    localStorage.removeItem("smartlab_jwt_token");
    localStorage.removeItem("smartlab_user_name");
    localStorage.removeItem("smartlab_user_role");
    localStorage.removeItem("smartlab_user_nim");
    router.push("/auth/login");
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return parts.slice(0, 2).map((word) => word[0].toUpperCase()).join("");
  };

  const userInitials = userName ? getInitials(userName) : "U";
  const pendingCount = notifications.filter((n) => n.status === "pending").length;

  const orderedStudentNotifications = useMemo(() => {
    const copy = [...notifications];
    copy.sort((a, b) => {
      const pa = a.status === "pending" ? 0 : 1;
      const pb = b.status === "pending" ? 0 : 1;
      if (pa !== pb) return pa - pb;
      return b.id - a.id;
    });
    return copy;
  }, [notifications]);

  const formatNotificationTime = (createdAt: string) => {
    try {
      const date = new Date(createdAt);
      return date.toLocaleString("id-ID", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" });
    } catch {
      return createdAt;
    }
  };

  const handleMarkAsDone = async (id: number) => {
    if (!token) return;

    try {
      await markNotificationDone(id, token);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, status: "done" } : n)));
    } catch (error) {
      console.error("Failed to mark notification done:", error);
    }
  };

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
            {userName && userRole === "mahasiswa" ? (
              <>
                <div className="relative" ref={notifRef}>
                  <button onClick={() => setShowNotif(!showNotif)} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full relative transition-transform active:scale-90">
                    <BellIcon className="h-5 w-5 text-slate-600" />
                    {pendingCount > 0 && (
                      <span className="absolute top-0 right-0 h-4 min-w-[1rem] px-1 rounded-full bg-[#E40082] text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                        {pendingCount}
                      </span>
                    )}
                  </button>

                  {showNotif && (
                    <div
                      role="dialog"
                      aria-label="Notifikasi mahasiswa"
                      className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right"
                    >
                      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-start gap-2">
                        <div>
                          <h4 className="font-bold text-sm text-slate-900">Notifikasi</h4>
                          <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                            {pendingCount > 0
                              ? `${pendingCount} belum dibaca · status peminjaman lab`
                              : "Menunggu ACC, disetujui, atau ditolak"}
                          </p>
                          <p className="text-[9px] text-slate-400 mt-1.5 leading-snug">ESC tutup · yang belum dibaca di atas</p>
                        </div>
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 shrink-0">Live</span>
                      </div>
                      <div className="max-h-[350px] overflow-y-auto">
                        {orderedStudentNotifications.length === 0 ? (
                          <div className="p-8 text-center text-slate-400 text-sm">
                            <p>Belum ada notifikasi</p>
                          </div>
                        ) : (
                          orderedStudentNotifications.map((n) => {
                          const meta = studentNotifMeta(n.type);
                          const iconWrap =
                            n.type === "booking_rejected"
                              ? "bg-red-100 text-red-600 border border-red-200/80"
                              : n.type === "booking_approved"
                                ? "bg-emerald-100 text-emerald-600 border border-emerald-200/80"
                                : n.type === "booking_pending"
                                  ? "bg-amber-100 text-amber-600 border border-amber-200/80"
                                  : "bg-blue-100 text-blue-600 border border-blue-200/80";
                          return (
                            <div key={n.id} className={`p-4 border-b border-slate-50 transition-colors ${n.status === "done" ? "opacity-55" : "hover:bg-slate-50/90"}`}>
                              <div className="flex gap-3">
                                <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${iconWrap}`}>
                                  {n.type === "booking_approved" ? (
                                    <CheckIcon className="h-4 w-4" />
                                  ) : n.type === "booking_rejected" ? (
                                    <XMarkIcon className="h-4 w-4" />
                                  ) : (
                                    <DocumentTextIcon className="h-4 w-4" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                    <span className={`text-[9px] font-bold uppercase tracking-tight px-2 py-0.5 rounded-md border ${meta.chipClass}`}>
                                      {meta.chip}
                                    </span>
                                    {n.status === "pending" && (
                                      <span className="text-[9px] font-bold text-[#E40082] bg-[#FFF0F7] px-2 py-0.5 rounded-md border border-pink-100">Baru</span>
                                    )}
                                  </div>
                                  <p className="text-[11px] font-bold text-slate-800 leading-tight">{n.title}</p>
                                  <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{n.message}</p>
                                  {n.lab ? <p className="text-[9px] text-slate-400 mt-1 font-medium">Lab: {n.lab}</p> : null}
                                  <div className="mt-3 flex flex-col gap-2">
                                    <div>
                                      <span className="text-[9px] text-slate-600 font-semibold">{formatRelativeTimeId(n.created_at)}</span>
                                      <span className="text-[8px] text-slate-400 block mt-0.5">{formatNotificationTime(n.created_at)}</span>
                                    </div>
                                    <div className="flex gap-2">
                                      {n.status === "pending" ? (
                                        <>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setNotifDetail(n);
                                              setShowNotif(false);
                                            }}
                                            className="flex-1 py-1.5 bg-[#263C92] text-white text-[10px] font-bold rounded-lg hover:bg-blue-900 transition-colors"
                                          >
                                            Detail
                                          </button>
                                          <button type="button" onClick={() => handleMarkAsDone(n.id)} className="px-3 py-1.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-lg hover:bg-emerald-100 transition-colors border border-emerald-100">Selesai</button>
                                        </>
                                      ) : (
                                        <div className="flex flex-wrap items-center gap-2 w-full">
                                          <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 uppercase italic">
                                            <CheckIcon className="h-3 w-3" /> Dibaca
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setNotifDetail(n);
                                              setShowNotif(false);
                                            }}
                                            className="text-[10px] font-bold text-[#263C92] hover:underline"
                                          >
                                            Lihat detail
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div className="relative" ref={profileRef}>
                  <button onClick={() => setProfileOpen(!profileOpen)} className="hidden md:flex items-center gap-3 pl-3 pr-4 py-2 rounded-full border border-slate-200 text-slate-700 bg-white shadow-sm transition-all duration-300 hover:border-[#263C92] hover:text-[#263C92]">
                    <div className="text-left">
                      <p className="text-[12px] font-bold">Hai, {userName}</p>
                      <p className="text-[10px] text-slate-400">Mahasiswa</p>
                    </div>
                    <div className="h-9 w-9 rounded-xl bg-[#263C92] flex items-center justify-center text-white text-sm font-bold shadow-md transition-transform group-hover:scale-105">{userInitials}</div>
                  </button>
                  {profileOpen && (
                    <div className="absolute right-0 mt-3 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in duration-200">
                      <button onClick={logout} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#263C92] transition-colors"><ArrowRightOnRectangleIcon className="h-4 w-4" /> Logout</button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link href="/auth/login" className="hidden md:flex items-center gap-2 px-6 py-2.5 rounded-full text-[13px] font-bold transition-all duration-300 bg-[#263C92] text-white hover:bg-[#1a2b6d] active:scale-95">
                <span>Login</span>
                <ArrowRightOnRectangleIcon className="h-4 w-4" />
              </Link>
            )}

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
              {userName ? (
                <>
                  {userRole === "mahasiswa" && (
                    <button onClick={() => setShowNotif(!showNotif)} className="mt-2 flex items-center justify-center gap-2 p-4 rounded-2xl bg-slate-100 text-slate-900 font-bold hover:bg-slate-200 transition-colors">
                      <BellIcon className="h-4 w-4" /> Notifikasi {pendingCount > 0 ? `(${pendingCount})` : ""}
                    </button>
                  )}
                  <button onClick={logout} className="mt-2 flex items-center justify-center gap-2 p-4 rounded-2xl bg-[#E40082] text-white font-bold hover:bg-[#c30d67] transition-colors">
                    Logout
                  </button>
                </>
              ) : (
                <Link href="/auth/login" className="mt-2 flex items-center justify-center gap-2 p-4 rounded-2xl bg-[#263C92] text-white font-bold">
                  Login Sistem <ArrowRightOnRectangleIcon className="h-5 w-5" />
                </Link>
              )}
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

      <NotificationDetailModal
        notification={notifDetail}
        onClose={() => setNotifDetail(null)}
        onOpenRelatedPage={(href) => router.push(href)}
        defaultRelatedHref="/jadwal"
        relatedButtonLabel="Buka halaman terkait"
      />
    </div>
  );
}