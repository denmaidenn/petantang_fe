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
  const [notifFilter, setNotifFilter] = useState<"all" | "unread">("all");
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

  const visibleStudentNotifications = useMemo(() => {
    if (notifFilter === "unread") {
      return orderedStudentNotifications.filter((n) => n.status === "pending");
    }
    return orderedStudentNotifications;
  }, [notifFilter, orderedStudentNotifications]);

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

  const handleMarkAllAsDone = async () => {
    const unread = notifications.filter((n) => n.status === "pending");
    if (unread.length === 0) return;
    await Promise.all(unread.map((n) => handleMarkAsDone(n.id)));
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
                      className="absolute right-0 mt-3 w-[min(92vw,420px)] bg-white border border-slate-200 rounded-[1.5rem] shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right"
                    >
                      <div className="p-5 border-b border-slate-100 bg-white">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h4 className="font-black text-lg text-slate-950 tracking-tight">Notifikasi</h4>
                            <p className="text-xs text-slate-500 mt-1">
                              {pendingCount > 0 ? `${pendingCount} update peminjaman belum dibaca` : "Status peminjaman terbaru akan muncul di sini"}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="relative flex h-2.5 w-2.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Live</span>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center gap-2">
                          {[
                            { id: "all" as const, label: "Semua", count: notifications.length },
                            { id: "unread" as const, label: "Belum dibaca", count: pendingCount },
                          ].map((tab) => (
                            <button
                              key={tab.id}
                              type="button"
                              onClick={() => setNotifFilter(tab.id)}
                              className={`rounded-full px-3 py-1.5 text-[11px] font-black transition-all ${
                                notifFilter === tab.id
                                  ? "bg-[#263C92] text-white shadow-sm"
                                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                              }`}
                            >
                              {tab.label}<span className="ml-1.5 opacity-75">{tab.count}</span>
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={handleMarkAllAsDone}
                            disabled={pendingCount === 0}
                            className="ml-auto text-[10px] font-black text-[#263C92] hover:underline disabled:text-slate-300 disabled:no-underline"
                          >
                            Tandai semua
                          </button>
                        </div>
                      </div>

                      <div className="max-h-[440px] overflow-y-auto bg-slate-50/70 p-3">
                        {visibleStudentNotifications.length === 0 ? (
                          <div className="rounded-2xl bg-white p-8 text-center text-slate-400 text-sm">
                            <BellIcon className="mx-auto mb-3 h-8 w-8 text-slate-300" />
                            <p className="font-bold text-slate-600">
                              {notifFilter === "unread" ? "Tidak ada yang belum dibaca" : "Belum ada notifikasi"}
                            </p>
                            <p className="mt-1 text-xs">Update ACC, penolakan, dan status peminjaman akan tampil di sini.</p>
                          </div>
                        ) : (
                          visibleStudentNotifications.map((n) => {
                            const meta = studentNotifMeta(n.type);
                            const iconWrap =
                              n.type === "booking_rejected"
                                ? "bg-red-100 text-red-600 border border-red-200/80"
                                : n.type === "booking_approved"
                                  ? "bg-emerald-100 text-emerald-600 border border-emerald-200/80"
                                  : n.type === "booking_pending"
                                    ? "bg-amber-100 text-amber-600 border border-amber-200/80"
                                    : "bg-blue-100 text-blue-600 border border-blue-200/80";
                            const isUnread = n.status === "pending";
                            return (
                              <div key={n.id} className={`relative mb-2 rounded-2xl border bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${isUnread ? "border-blue-100 ring-1 ring-blue-50" : "border-transparent opacity-75"}`}>
                                {isUnread && <span className="absolute right-4 top-4 h-2.5 w-2.5 rounded-full bg-[#E40082]" />}
                                <div className="flex gap-3 pr-4">
                                  <div className={`h-11 w-11 rounded-full flex items-center justify-center shrink-0 ${iconWrap}`}>
                                    {n.type === "booking_approved" ? (
                                      <CheckIcon className="h-5 w-5" />
                                    ) : n.type === "booking_rejected" ? (
                                      <XMarkIcon className="h-5 w-5" />
                                    ) : (
                                      <DocumentTextIcon className="h-5 w-5" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                      <span className={`text-[9px] font-black uppercase tracking-tight px-2 py-0.5 rounded-full border ${meta.chipClass}`}>
                                        {meta.chip}
                                      </span>
                                      <span className="text-[10px] font-semibold text-slate-400">{formatRelativeTimeId(n.created_at)}</span>
                                    </div>
                                    <p className="text-sm font-black text-slate-900 leading-snug">{n.title}</p>
                                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-2">{n.message}</p>
                                    {n.lab ? <p className="mt-2 text-[10px] font-bold text-slate-400">Lab: {n.lab}</p> : null}
                                    <div className="mt-3 flex gap-2">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setNotifDetail(n);
                                          setShowNotif(false);
                                        }}
                                        className="flex-1 rounded-xl bg-[#263C92] py-2 text-[11px] font-black text-white transition-colors hover:bg-blue-900"
                                      >
                                        Buka detail
                                      </button>
                                      {isUnread ? (
                                        <button
                                          type="button"
                                          onClick={() => handleMarkAsDone(n.id)}
                                          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-black text-slate-500 transition-colors hover:bg-slate-50"
                                        >
                                          Oke
                                        </button>
                                      ) : (
                                        <span className="flex items-center gap-1 px-2 text-[10px] font-bold text-emerald-600">
                                          <CheckIcon className="h-3 w-3" /> Dibaca
                                        </span>
                                      )}
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
