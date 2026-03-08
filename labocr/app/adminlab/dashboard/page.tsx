"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ClockIcon,
  ShieldExclamationIcon,
  InformationCircleIcon,
  CheckBadgeIcon,
  CpuChipIcon,
  XMarkIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import {
  getLabStatus,
  checkout,
  type Peminjaman,
  type ApiError,
} from "@/lib/api";

// ─── Config ──────────────────────────────────────────────
const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY || "smartlab-admin-2025";
const POLL_INTERVAL_MS = 5000;

// ─── Static Lab Data (hardcoded per design decision) ─────
const LABS = [
  { id: "1", name: "Lab Komputer 1", location: "Gedung Delta", capacity: 40, opStart: "07:00", opEnd: "18:00" },
  { id: "2", name: "Lab Komputer 2", location: "Gedung Delta", capacity: 40, opStart: "07:00", opEnd: "18:00" },
  { id: "3", name: "Lab Multimedia", location: "Gedung Delta", capacity: 30, opStart: "07:00", opEnd: "18:00" },
  { id: "4", name: "Lab Pemrograman", location: "Gedung Epsilon", capacity: 25, opStart: "07:00", opEnd: "18:00" },
];

// ─── Realtime Clock Component ────────────────────────────
// Prevents the entire Dashboard from re-rendering every second.
function RealtimeClock() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <div className="text-right">
        <p className="text-[10px] font-black text-[#E40082] uppercase tracking-widest mb-0.5">Status Real-time</p>
        <p className="text-sm font-bold text-slate-700">
          {currentTime
            ? currentTime.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
            : "—"}
        </p>
      </div>
      <div className="h-8 w-[1px] bg-slate-200" />
      <div className="flex items-center gap-2">
        <ClockIcon className="h-5 w-5 text-[#263C92]" />
        <span className="text-xl font-bold text-[#263C92] tabular-nums">
          {currentTime
            ? currentTime.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
            : "--:--:--"}
        </span>
      </div>
    </>
  );
}

export default function DashboardPage() {
  const router = useRouter();

  // ─── API State ──────────────────────────────────────
  const [peminjaman, setPeminjaman] = useState<Peminjaman[]>([]);
  const [peminjamanPending, setPeminjamanPending] = useState<Peminjaman[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  // ─── Modal State ─────────────────────────────────────
  const [modalOpen, setModalOpen] = useState(false);
  const [checklist, setChecklist] = useState({ clean: false, gear: false, noDamage: false });
  const [selectedPeminjaman, setSelectedPeminjaman] = useState<Peminjaman | null>(null);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [checkoutMsg, setCheckoutMsg] = useState<string | null>(null);

  // ─── Action State ────────────────────────────────────
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  // ─── Detail Modal ────────────────────────────────────
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<Peminjaman | null>(null);

  // ─── Actions (Approve / Reject) ──────────────────────
  const handleApprove = async (pid: number) => {
    if (actionLoadingId) return; // Prevent spam clicks
    setActionLoadingId(pid);
    try {
      const token = localStorage.getItem("admin_jwt_token");
      if (!token) return;
      const { approvePeminjaman } = await import("@/lib/api");
      await approvePeminjaman(pid, token);
      fetchStatus();
    } catch (err) {
      console.error("Gagal menyetujui peminjaman", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (pid: number) => {
    if (actionLoadingId) return;
    setActionLoadingId(pid);
    try {
      const token = localStorage.getItem("admin_jwt_token");
      if (!token) return;
      const { rejectPeminjaman } = await import("@/lib/api");
      await rejectPeminjaman(pid, token);
      fetchStatus();
    } catch (err) {
      console.error("Gagal menolak peminjaman", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // ─── Fetch Data from BE ──────────────────────────────
  const fetchStatus = useCallback(async () => {
    const token = localStorage.getItem("admin_jwt_token");
    if (!token) {
      router.push("/auth/login");
      return;
    }

    try {
      const data = await getLabStatus(token);
      setPeminjaman(data.peminjaman || []);
      setPeminjamanPending(data.peminjaman_pending || []);
      setLastRefresh(new Date());
      setApiError(null);
    } catch (err) {
      const e = err as ApiError;
      if (e.status === 401 || e.status === 403) {
        localStorage.removeItem("admin_jwt_token"); // hapus token usang
        router.push("/auth/login");
      } else {
        setApiError("Backend tidak dapat dijangkau. Pastikan server berjalan.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // Initial fetch + polling
  useEffect(() => {
    fetchStatus();
    const poll = setInterval(fetchStatus, POLL_INTERVAL_MS);
    return () => clearInterval(poll);
  }, [fetchStatus]);

  // ─── Handlers ────────────────────────────────────────
  const handleCheckoutClick = (p: Peminjaman) => {
    setSelectedPeminjaman(p);
    setChecklist({ clean: false, gear: false, noDamage: false });
    setCheckoutMsg(null);
    setModalOpen(true);
  };

  const handleCheckoutConfirm = async () => {
    if (!selectedPeminjaman) return;
    setIsCheckoutLoading(true);
    try {
      const token = localStorage.getItem("admin_jwt_token") || "";
      const result = await checkout(selectedPeminjaman.nim, token);
      setCheckoutMsg(result.message || "Checkout berhasil!");
      await fetchStatus(); // refresh data
      setTimeout(() => setModalOpen(false), 1800);
    } catch (err) {
      const e = err as ApiError;
      setCheckoutMsg(`Gagal: ${e.detail || "Terjadi kesalahan."}`);
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  // ─── Computed Stats ──────────────────────────────────
  const activeCount = peminjaman.length;
  const pendingCount = peminjamanPending.length;
  const labsWithUser = new Set(peminjaman.map((p) => p.lab));

  // useMemo to prevent recalculating layout objects every render
  const stats = useMemo(() => [
    {
      title: "Total Laboratorium",
      value: LABS.length.toString(),
      subtitle: `${LABS.length - labsWithUser.size} tidak digunakan`,
      color: "text-[#263C92]",
      iconBg: "bg-blue-50",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      title: "Peminjaman Aktif",
      value: activeCount.toString(),
      subtitle: "Sedang berlangsung",
      color: "text-[#E40082]",
      iconBg: "bg-pink-50",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: "Menunggu ACC",
      value: pendingCount.toString(),
      subtitle: "Butuh persetujuan",
      color: "text-amber-600",
      iconBg: "bg-amber-100",
      icon: (
        <ClockIcon className="w-5 h-5" />
      ),
    },
    {
      title: "Sesi Hari Ini",
      value: activeCount.toString(),
      subtitle: "Dari data database",
      color: "text-[#E40082]",
      iconBg: "bg-pink-50",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
    },
  ], [labsWithUser.size, activeCount, pendingCount]);

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] pb-12 font-sans antialiased">
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm mb-8">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4 self-start">
            <div className="w-1.5 h-10 bg-[#E40082] rounded-full" />
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-none">Dashboard</h1>
              <p className="text-slate-500 text-sm mt-1">Sistem Peminjaman Laboratorium Terintegrasi</p>
            </div>
          </div>
          <div className="bg-slate-50 px-5 py-2.5 rounded-2xl border border-slate-200 flex items-center gap-4">
            <RealtimeClock />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 space-y-8">
        {/* BACKEND STATUS BANNER */}
        {apiError && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
            <ShieldExclamationIcon className="h-5 w-5 text-amber-500 shrink-0" />
            <p className="text-sm font-bold text-amber-700">{apiError}</p>
            <button onClick={fetchStatus} className="ml-auto text-[10px] font-black bg-amber-100 px-3 py-1.5 rounded-lg uppercase text-amber-700 flex items-center gap-1.5">
              <ArrowPathIcon className="h-3.5 w-3.5" /> Retry
            </button>
          </div>
        )}

        {/* 1. STATISTIK */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all group">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{stat.title}</p>
                  <h3 className={`text-3xl font-bold mt-2 ${stat.color}`}>
                    {isLoading ? <span className="inline-block w-8 h-8 bg-slate-100 rounded animate-pulse" /> : stat.value}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium mt-1">{stat.subtitle}</p>
                </div>
                <div className={`p-3 rounded-xl ${stat.iconBg} ${stat.color} transition-transform group-hover:scale-110`}>{stat.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* 1.5 TABEL MENUNGGU PERSETUJUAN (PENDING) */}
        {peminjamanPending.length > 0 && (
          <div className="bg-white shadow-sm border border-amber-200 rounded-[2rem] overflow-hidden">
            <div className="p-6 border-b border-amber-100 flex justify-between items-center bg-amber-50/50">
              <div>
                <h3 className="text-base font-bold text-amber-800">Menunggu Persetujuan Admin (Pending)</h3>
                <p className="text-[10px] text-amber-600 mt-0.5">
                  {peminjamanPending.length} peminjaman menunggu Anda klik ACC sebelum diizinkan masuk lab.
                </p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-amber-50/30 text-amber-700 text-xs uppercase font-bold tracking-widest">
                  <tr>
                    <th className="px-8 py-5 text-left">Mahasiswa</th>
                    <th className="px-8 py-5 text-left">Lab Tujuan</th>
                    <th className="px-8 py-5 text-left">Jam Tunggu</th>
                    <th className="px-8 py-5 text-center">Keputusan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-50 text-sm">
                  {peminjamanPending.map((p) => (
                    <tr key={p.id} className="hover:bg-amber-50/30 transition-colors group">
                      <td className="px-8 py-5">
                        <div>
                          <p className="font-bold text-amber-900">{p.nama}</p>
                          <p className="text-xs text-amber-600 mt-0.5">{p.nim}</p>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase bg-white text-amber-700 shadow-sm border border-amber-100">
                          {p.lab}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-1.5 text-amber-700">
                          <ClockIcon className="h-3.5 w-3.5" />
                          <span className="font-bold text-xs">{p.waktu_masuk?.slice(11, 16) || "—"}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleApprove(p.id)}
                            disabled={!!actionLoadingId}
                            className="px-4 py-2 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-emerald-600 transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {actionLoadingId === p.id
                              ? <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
                              : <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                            }
                            Setujui ACC
                          </button>
                          <button
                            onClick={() => handleReject(p.id)}
                            disabled={!!actionLoadingId}
                            className="px-3 py-2 bg-white text-slate-500 border border-slate-200 text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {actionLoadingId === p.id
                              ? <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
                              : <XMarkIcon className="h-3.5 w-3.5" />
                            } Tolak
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 2. TABEL PEMINJAMAN AKTIF */}
        <div className="bg-white shadow-sm border border-slate-200 rounded-[2rem] overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div>
              <h3 className="text-base font-bold text-slate-800">Antrean Peminjaman Laboratorium</h3>
              {lastRefresh && (
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Diperbarui: {lastRefresh.toLocaleTimeString("id-ID")}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button disabled={isLoading} onClick={fetchStatus} className="p-2 text-slate-400 hover:text-[#263C92] transition-colors rounded-xl hover:bg-slate-100">
                <ArrowPathIcon className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              </button>
              <span className="text-[11px] bg-[#E40082]/10 text-[#E40082] px-3 py-1.5 rounded-lg font-bold uppercase tracking-widest">Live Update</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-widest">
                <tr>
                  <th className="px-8 py-5 text-left font-black">Waktu Masuk</th>
                  <th className="px-8 py-5 text-left font-black">Peminjam</th>
                  <th className="px-8 py-5 text-left font-black">Lab</th>
                  <th className="px-8 py-5 text-left font-black">Status</th>
                  <th className="px-8 py-5 text-center font-black">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <td key={j} className="px-8 py-5">
                          <div className="h-4 bg-slate-100 rounded animate-pulse w-24" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : peminjaman.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-16 text-center text-slate-400 font-bold text-sm">
                      {apiError ? "Tidak dapat memuat data." : "Tidak ada peminjaman aktif saat ini."}
                    </td>
                  </tr>
                ) : (
                  peminjaman.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-8 py-5 text-slate-500 font-bold text-xs">
                        {p.waktu_masuk?.slice(11, 16) || "—"}
                      </td>
                      <td className="px-8 py-5">
                        <p className="font-bold text-slate-800 text-sm group-hover:text-[#263C92] transition-colors">{p.nama}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{p.nim}</p>
                      </td>
                      <td className="px-8 py-5 text-slate-600 font-bold text-sm">{p.lab}</td>
                      <td className="px-8 py-5">
                        <span className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase bg-emerald-100 text-emerald-600">
                          Aktif
                        </span>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => { setDetailItem(p); setDetailModalOpen(true); }}
                            className="px-4 py-2 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-slate-200 transition-all flex items-center gap-1.5"
                          >
                            <InformationCircleIcon className="h-3.5 w-3.5" /> Detail
                          </button>
                          <button
                            onClick={() => handleCheckoutClick(p)}
                            className="px-4 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-[#E40082] transition-all flex items-center gap-1.5"
                          >
                            <CheckBadgeIcon className="h-3.5 w-3.5" /> Checkout
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. MONITORING LAB (static, data from hardcoded labs) */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1.5 h-6 bg-[#E40082] rounded-full" />
            <h3 className="text-slate-800 text-lg font-bold tracking-tight uppercase text-sm">Monitoring Laboratorium</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {LABS.map((lab) => {
              const activePeminjaman = peminjaman.filter((p) => p.lab === lab.name);
              const isActive = activePeminjaman.length > 0;
              return (
                <div key={lab.id} className="bg-white border border-slate-200 rounded-[2rem] p-7 shadow-sm flex flex-col hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-5">
                    <div>
                      <h3 className="font-bold text-xl text-[#263C92]">{lab.name}</h3>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">{lab.location}</p>
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase border ${isActive
                      ? "bg-blue-50 text-blue-600 border-blue-100"
                      : "bg-emerald-50 text-emerald-600 border-emerald-100"
                      }`}>
                      {isActive ? "Digunakan" : "Tersedia"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8 bg-slate-50 p-5 rounded-3xl border border-slate-100">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Operasional</p>
                      <p className="text-base font-bold text-slate-700">{lab.opStart} - {lab.opEnd}</p>
                    </div>
                    <div className="space-y-1 border-l border-slate-200 pl-5">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {isActive ? "Pengguna" : "Kapasitas"}
                      </p>
                      <p className="text-base font-bold text-slate-700">
                        {isActive ? `${activePeminjaman.length} orang` : `${lab.capacity} PC`}
                      </p>
                    </div>
                  </div>

                  {isActive && (
                    <div className="bg-blue-50 rounded-2xl p-4 mb-4 space-y-1 border border-blue-100">
                      {activePeminjaman.slice(0, 2).map((p) => (
                        <div key={p.id} className="flex justify-between items-center text-xs">
                          <span className="font-bold text-blue-700">{p.nama}</span>
                          <span className="text-blue-400">{p.nim}</span>
                        </div>
                      ))}
                      {activePeminjaman.length > 2 && (
                        <p className="text-[10px] text-blue-400 font-bold">+{activePeminjaman.length - 2} lainnya</p>
                      )}
                    </div>
                  )}

                  <div className="flex gap-3 mt-auto pt-2">
                    <button
                      onClick={() => { if (activePeminjaman[0]) { setDetailItem(activePeminjaman[0]); setDetailModalOpen(true); } }}
                      disabled={!isActive}
                      className={`flex-1 py-3.5 text-xs font-bold rounded-2xl border uppercase flex items-center justify-center gap-2 transition-all ${isActive
                        ? "text-slate-600 border-slate-200 hover:bg-slate-50"
                        : "text-slate-300 border-slate-100 cursor-not-allowed"
                        }`}
                    >
                      <InformationCircleIcon className="h-4 w-4" /> Detail
                    </button>
                    <button
                      onClick={() => { if (activePeminjaman[0]) handleCheckoutClick(activePeminjaman[0]); }}
                      disabled={!isActive}
                      className={`flex-1 py-3.5 text-white text-xs font-bold rounded-2xl uppercase flex items-center justify-center gap-2 shadow-lg transition-all ${isActive ? "bg-[#263C92] hover:bg-[#1a2b6d]" : "bg-slate-300 cursor-not-allowed"
                        }`}
                    >
                      <CheckBadgeIcon className="h-4 w-4" /> Checkout
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* ─── MODAL: DETAIL PEMINJAMAN ──────────────────────── */}
      {detailModalOpen && detailItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden">
            <div className="p-6 text-white text-center bg-[#263C92]">
              <h2 className="font-bold text-lg uppercase tracking-tight">Detail Peminjaman</h2>
              <p className="text-xs font-bold opacity-80 uppercase tracking-widest mt-1.5">{detailItem.lab}</p>
            </div>
            <div className="p-8 space-y-4">
              <div className="p-5 bg-slate-50 rounded-[2rem] space-y-4 border border-slate-100 text-xs font-bold">
                <div className="flex justify-between border-b pb-2"><span className="text-slate-400">Nama</span><span>{detailItem.nama}</span></div>
                <div className="flex justify-between border-b pb-2"><span className="text-slate-400">NIM</span><span>{detailItem.nim}</span></div>
                <div className="flex justify-between border-b pb-2"><span className="text-slate-400">Lab</span><span>{detailItem.lab}</span></div>
                <div className="flex justify-between border-b pb-2"><span className="text-slate-400">Masuk</span><span>{detailItem.waktu_masuk?.slice(11, 16) || "—"}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Status</span><span className="text-emerald-600">Aktif</span></div>
              </div>
              <button onClick={() => { setDetailModalOpen(false); handleCheckoutClick(detailItem); }} className="w-full py-4 bg-[#E40082] text-white rounded-2xl font-black text-xs uppercase tracking-widest">Checkout Sekarang</button>
              <button onClick={() => setDetailModalOpen(false)} className="w-full py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest">Tutup</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: CHECKOUT KONFIRMASI ───────────────────── */}
      {modalOpen && selectedPeminjaman && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row">

            {/* Sisi Kiri: Info */}
            <div className="w-full md:w-5/12 bg-[#0F172A] p-10 flex flex-col items-center justify-center">
              <div className="w-20 h-20 rounded-[2rem] bg-slate-800 border-4 border-slate-700 flex items-center justify-center mb-6">
                <CpuChipIcon className="h-10 w-10 text-blue-400" />
              </div>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-400 mb-4">Data Mahasiswa</p>
              <div className="w-full space-y-3 border-t border-slate-800 pt-5 text-[10px]">
                <div className="flex justify-between"><span className="text-slate-500 font-bold">Nama</span><span className="text-white font-bold">{selectedPeminjaman.nama}</span></div>
                <div className="flex justify-between"><span className="text-slate-500 font-bold">NIM</span><span className="text-white font-black">{selectedPeminjaman.nim}</span></div>
                <div className="flex justify-between"><span className="text-slate-500 font-bold">Lab</span><span className="text-emerald-400 font-black">{selectedPeminjaman.lab}</span></div>
                <div className="flex justify-between"><span className="text-slate-500 font-bold">Masuk</span><span className="text-white font-bold">{selectedPeminjaman.waktu_masuk?.slice(11, 16)}</span></div>
              </div>
            </div>

            {/* Sisi Kanan: Checklist */}
            <div className="flex-1 p-10 bg-white relative flex flex-col">
              <button onClick={() => setModalOpen(false)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-900 transition-colors">
                <XMarkIcon className="w-6 h-6" />
              </button>

              <div className="mb-6">
                <span className="text-[#E40082] text-[10px] font-black uppercase tracking-[0.2em] mb-2 block">Checkout Checklist</span>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Selesaikan Peminjaman</h2>
              </div>

              <div className="bg-red-50 p-4 rounded-2xl flex gap-3 border border-red-100 mb-5">
                <ShieldExclamationIcon className="h-5 w-5 text-red-500 shrink-0" />
                <p className="text-[10px] font-bold text-red-600">Pelanggaran prosedur akan menyebabkan pemblokiran akun.</p>
              </div>

              <div className="space-y-3 mb-6">
                {[
                  { key: "clean", label: "Meja & Lantai Bersih" },
                  { key: "gear", label: "PC & AC Sudah Mati" },
                  { key: "noDamage", label: "Barang & Peralatan Utuh" },
                ].map((item) => (
                  <label key={item.key} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={(checklist as Record<string, boolean>)[item.key]}
                      onChange={(e) => setChecklist({ ...checklist, [item.key]: e.target.checked })}
                      className="w-5 h-5 rounded text-[#E40082]"
                    />
                    <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wide">{item.label}</span>
                  </label>
                ))}
              </div>

              {checkoutMsg && (
                <div className={`p-3 rounded-2xl text-xs font-bold mb-4 text-center ${checkoutMsg.startsWith("Gagal") ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"}`}>
                  {checkoutMsg}
                </div>
              )}

              <button
                onClick={handleCheckoutConfirm}
                disabled={isCheckoutLoading || !(checklist.clean && checklist.gear && checklist.noDamage)}
                className={`w-full py-4 rounded-2xl text-white font-black text-xs uppercase mt-auto shadow-lg transition-all flex items-center justify-center gap-2 ${checklist.clean && checklist.gear && checklist.noDamage && !isCheckoutLoading
                  ? "bg-[#263C92] hover:bg-[#1a2b6d]"
                  : "bg-slate-300 cursor-not-allowed"
                  }`}
              >
                {isCheckoutLoading ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : <CheckBadgeIcon className="h-4 w-4" />}
                {isCheckoutLoading ? "Memproses..." : "Konfirmasi Checkout"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}