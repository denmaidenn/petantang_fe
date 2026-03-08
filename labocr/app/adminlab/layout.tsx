"use client";

import { ReactNode, useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  BellIcon,
  MagnifyingGlassIcon,
  HomeIcon,
  CalendarIcon,
  DocumentTextIcon,
  ArrowRightOnRectangleIcon,
  ComputerDesktopIcon,
  Bars3Icon,
  XMarkIcon,
  UserIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";

// --- DATA DUMMY NOTIFIKASI ---
interface Notification {
  id: string;
  type: "verification" | "reminder" | "warning";
  title: string;
  message: string;
  time: string;
  status: "pending" | "done";
  href: string;
}

const initialNotifications: Notification[] = [
  {
    id: "1",
    type: "verification",
    title: "Permintaan Verifikasi KTM",
    message: "Ahmad Rizki (A24200123) meminta verifikasi untuk Lab Komputer 1.",
    time: "Baru saja",
    status: "pending",
    href: "/adminlab/verifikasi-ktm"
  },
  {
    id: "2",
    type: "reminder",
    title: "Pembukaan Ruangan (15m)",
    message: "Kelas TI-4A akan dimulai. Silahkan bersiap membuka akses ruangan.",
    time: "15 menit lagi",
    status: "pending",
    href: "/adminlab/kelolalab"
  },
  {
    id: "3",
    type: "warning",
    title: "Sesi Berakhir (5m)",
    message: "Peringatan: Sesi penggunaan Lab 2 oleh kelas IK-3B akan berakhir.",
    time: "5 menit lagi",
    status: "pending",
    href: "/adminlab/kelolalab"
  },
];

const menuItems = [
  { name: "Dashboard", icon: HomeIcon, href: "/adminlab/dashboard" },
  { name: "Kelola Laboratorium", icon: ComputerDesktopIcon, href: "/adminlab/kelolalab" },
  { name: "Verifikasi KTM", icon: DocumentTextIcon, href: "/adminlab/verifikasi-ktm" },
  { name: "Jadwal Semester", icon: CalendarIcon, href: "/adminlab/jadwal" },
  { name: "Laporan", icon: ChartBarIcon, href: "/adminlab/laporan" },
  { name: "Pengaturan", icon: Cog6ToothIcon, href: "/adminlab/pengaturan" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const pendingCount = notifications.filter(n => n.status === "pending").length;

  const handleMarkAsDone = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: "done" } : n));
  };

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check auth as soon as the layout mounts on the client
    const token = localStorage.getItem("admin_jwt_token");
    if (!token) {
      router.replace("/auth/login");
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) setShowNotif(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const confirmLogout = () => {
    setShowLogoutModal(false);
    localStorage.removeItem("admin_jwt_token");
    router.push("/auth/login");
  };

  // Prevent flash of unauthenticated content
  if (!isAuthenticated) {
    return null; // Or return a loading spinner here if desired
  }

  return (
    <div className="flex h-screen bg-[#F1F5F9] text-slate-900 overflow-hidden font-sans">

      {/* MODAL KONFIRMASI LOGOUT */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
            </div>
            <div className="mt-4 text-center">
              <h3 className="text-lg font-bold text-slate-800">Konfirmasi Logout</h3>
              <p className="mt-2 text-sm text-slate-500">
                Apakah Anda yakin ingin keluar dari sistem? Sesi Anda akan diakhiri.
              </p>
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setShowLogoutModal(false)} className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">Batal</button>
              <button onClick={confirmLogout} className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-shadow shadow-lg shadow-red-200">Ya, Logout</button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay Mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* SIDEBAR */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 bg-[#263C92] text-white flex flex-col justify-between transition-all duration-300 shadow-2xl lg:shadow-none ${sidebarOpen ? "w-64 translate-x-0" : "w-20 lg:w-20 -translate-x-full lg:translate-x-0"}`}>
        <div>
          <div className="flex items-center justify-between p-5">
            {sidebarOpen && (
              <div className="flex flex-col min-w-0 animate-in fade-in duration-300">
                <span className="text-sm font-bold leading-tight tracking-tight">Sistem Peminjaman Lab</span>
                <span className="text-[10px] font-medium text-blue-200/80 uppercase tracking-wider mt-1">Sekolah Vokasi IPB</span>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`p-1.5 hover:bg-blue-800 rounded-lg transition-colors ${!sidebarOpen ? "mx-auto" : ""}`}
            >
              {sidebarOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
            </button>
          </div>

          <nav className="flex flex-col space-y-1 px-3 mt-4">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <a key={item.name} href={item.href} className={`flex items-center p-3 rounded-xl transition-all duration-200 group ${isActive ? "bg-[#E40082] shadow-lg shadow-pink-900/20" : "hover:bg-blue-800"}`}>
                  <item.icon className={`h-5 w-5 shrink-0 ${isActive ? "text-white" : "text-blue-200 group-hover:text-white"}`} />
                  {sidebarOpen && <span className="ml-3 text-sm font-medium">{item.name}</span>}
                </a>
              );
            })}
          </nav>
        </div>

        <div className="p-4">
          <button onClick={() => setShowLogoutModal(true)} className="flex items-center justify-center gap-2 w-full bg-red-500/10 text-red-100 p-3 rounded-xl hover:bg-red-600 transition-colors border border-red-500/20">
            <ArrowRightOnRectangleIcon className="h-5 w-5 shrink-0" />
            {sidebarOpen && <span className="text-sm font-bold">Logout</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex justify-between items-center p-4 bg-white border-b border-slate-200 h-16 md:h-20 shrink-0">
          <div className="flex items-center flex-1 pr-4">
            {!sidebarOpen && (
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 mr-4 bg-slate-100 rounded-lg text-slate-600">
                <Bars3Icon className="h-6 w-6" />
              </button>
            )}
            {/* SEARCH BAR - DIPANJANGKAN DISINI */}
            <div className="hidden sm:flex items-center bg-slate-100 p-2.5 px-4 rounded-xl flex-1 max-w-3xl">
              <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 mr-3" />
              <input type="text" placeholder="Cari data peminjaman, mahasiswa, atau laboratorium..." className="bg-transparent outline-none w-full text-sm font-medium" />
            </div>
          </div>

          <div className="flex items-center space-x-4 shrink-0">
            {/* NOTIFICATION */}
            <div className="relative" ref={notifRef}>
              <button onClick={() => setShowNotif(!showNotif)} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full relative transition-transform active:scale-90">
                <BellIcon className="h-6 w-6 text-slate-600" />
                {pendingCount > 0 && (
                  <span className="absolute top-1 right-1 h-4 w-4 bg-[#E40082] text-white text-[10px] font-bold flex items-center justify-center rounded-full ring-2 ring-white">
                    {pendingCount}
                  </span>
                )}
              </button>

              {showNotif && (
                <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                  <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <h4 className="font-bold text-sm">Notifikasi</h4>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Terbaru</span>
                  </div>
                  <div className="max-h-[350px] overflow-y-auto">
                    {notifications.map((n) => (
                      <div key={n.id} className={`p-4 border-b border-slate-50 transition-colors ${n.status === 'done' ? 'opacity-50' : 'hover:bg-slate-50'}`}>
                        <div className="flex gap-3">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${n.type === 'verification' ? 'bg-amber-100 text-amber-600' : n.type === 'warning' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                            {n.type === 'verification' ? <DocumentTextIcon className="h-4 w-4" /> : <ClockIcon className="h-4 w-4" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-[11px] font-bold text-slate-800 leading-tight">{n.title}</p>
                            <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{n.message}</p>
                            <div className="mt-3 flex flex-col gap-2">
                              <span className="text-[9px] text-slate-400 font-medium">{n.time}</span>
                              <div className="flex gap-2">
                                {n.status === 'pending' ? (
                                  <>
                                    <button onClick={() => { router.push(n.href); setShowNotif(false); }} className="flex-1 py-1.5 bg-[#263C92] text-white text-[10px] font-bold rounded-lg hover:bg-blue-900 transition-colors">Check Detail</button>
                                    {(n.type === 'reminder' || n.type === 'warning') && (
                                      <button onClick={() => handleMarkAsDone(n.id)} className="px-3 py-1.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-lg hover:bg-emerald-100 transition-colors border border-emerald-100">Oke</button>
                                    )}
                                  </>
                                ) : (
                                  <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 uppercase italic"><CheckIcon className="h-3 w-3" /> Selesai</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* PROFILE */}
            <div className="relative" ref={profileRef}>
              <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-3 pl-3 border-l border-slate-200 group transition-all">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-slate-800 group-hover:text-[#263C92]">Admin Lab</p>
                  <p className="text-[10px] text-slate-400">Petugas Jaga</p>
                </div>
                <div className="h-9 w-9 rounded-xl bg-[#263C92] flex items-center justify-center text-white text-sm font-bold shadow-md hover:scale-105 transition-transform">AL</div>
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in duration-200">
                  <button onClick={() => { router.push("/adminlab/pengaturan"); setProfileOpen(false); }} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#263C92] transition-colors"><UserIcon className="h-4 w-4" /> Edit Profil</button>
                  <div className="h-px bg-slate-100 my-1 mx-2"></div>
                  <button onClick={() => { setShowLogoutModal(true); setProfileOpen(false); }} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"><ArrowRightOnRectangleIcon className="h-4 w-4" /> Logout</button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-[#F8FAFC]">
          <div className="pb-20 lg:pb-8">{children}</div>
        </main>
      </div>
    </div>
  );
}