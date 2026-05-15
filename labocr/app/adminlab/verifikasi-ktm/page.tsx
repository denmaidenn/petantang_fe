"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowPathIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  MapPinIcon,
  ShieldCheckIcon,
  SparklesIcon,
  UserCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import Swal from "sweetalert2";
import {
  approvePeminjaman,
  getLabStatus,
  rejectPeminjaman,
  type ApiError,
  type Peminjaman,
} from "@/lib/api";

const POLL_INTERVAL_MS = 5000;

type QueueTab = "live" | "approved" | "failed";

type VerificationItem = Peminjaman & {
  queueStatus: "pending" | "approved";
};

function formatTime(value?: string | null) {
  if (!value) return "--:--";
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  }
  return value.slice(11, 16) || "--:--";
}

function formatDate(value?: string | null) {
  if (!value) return "Hari ini";
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  }
  return "Hari ini";
}

function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "KT";
  return words.slice(0, 2).map((word) => word[0]).join("").toUpperCase();
}

function getBookingTime(item: Peminjaman) {
  if (item.jam_mulai && item.jam_selesai) return `${item.jam_mulai} - ${item.jam_selesai}`;
  if (item.slot_start && item.slot_end) return `${item.slot_start} - ${item.slot_end}`;
  return formatTime(item.waktu_masuk);
}

function getConfidence(item: Peminjaman) {
  const value = item.scan_confidence;
  if (value == null) return item.status === "aktif" ? "99%" : "Menunggu";
  const pct = value <= 1 ? value * 100 : value;
  return `${pct.toFixed(1)}%`;
}

export default function VerifikasiKTMPage() {
  const router = useRouter();

  const [peminjaman, setPeminjaman] = useState<Peminjaman[]>([]);
  const [peminjamanPending, setPeminjamanPending] = useState<Peminjaman[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<QueueTab>("live");
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

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
        localStorage.removeItem("admin_jwt_token");
        router.push("/auth/login");
      } else {
        setApiError("Backend tidak dapat dijangkau. Pastikan server berjalan.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchStatus();
    const poll = setInterval(fetchStatus, POLL_INTERVAL_MS);
    return () => clearInterval(poll);
  }, [fetchStatus]);

  const queueItems = useMemo<VerificationItem[]>(() => {
    const pending = peminjamanPending.map((item) => ({ ...item, queueStatus: "pending" as const }));
    const approved = peminjaman.map((item) => ({ ...item, queueStatus: "approved" as const }));
    return [...pending, ...approved];
  }, [peminjaman, peminjamanPending]);

  const visibleItems = useMemo(() => {
    if (activeTab === "approved") return queueItems.filter((item) => item.queueStatus === "approved");
    if (activeTab === "failed") return [];
    return queueItems;
  }, [activeTab, queueItems]);

  const selectedItem = useMemo(() => {
    return queueItems.find((item) => item.id === selectedId) || visibleItems[0] || queueItems[0] || null;
  }, [queueItems, selectedId, visibleItems]);

  useEffect(() => {
    if (!selectedItem) {
      setSelectedId(null);
      return;
    }
    if (!visibleItems.some((item) => item.id === selectedItem.id)) {
      setSelectedId(visibleItems[0]?.id ?? queueItems[0]?.id ?? null);
    }
  }, [queueItems, selectedItem, visibleItems]);

  const handleApprove = async (pid: number) => {
    if (actionLoadingId) return;
    setActionLoadingId(pid);
    try {
      const token = localStorage.getItem("admin_jwt_token");
      if (!token) {
        router.push("/auth/login");
        return;
      }
      await approvePeminjaman(pid, token);
      Swal.fire({ icon: "success", title: "Akses Diizinkan", text: "Mahasiswa dapat masuk laboratorium.", timer: 1500, showConfirmButton: false });
      await fetchStatus();
    } catch (err) {
      const apiErr = err as ApiError;
      Swal.fire({ icon: "error", title: "Gagal", text: apiErr.detail || "Gagal menyetujui peminjaman." });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (pid: number) => {
    if (actionLoadingId) return;
    setActionLoadingId(pid);
    try {
      const token = localStorage.getItem("admin_jwt_token");
      if (!token) {
        router.push("/auth/login");
        return;
      }
      await rejectPeminjaman(pid, token);
      Swal.fire({ icon: "success", title: "Akses Ditolak", text: "Permintaan peminjaman sudah ditolak.", timer: 1500, showConfirmButton: false });
      await fetchStatus();
    } catch (err) {
      const apiErr = err as ApiError;
      Swal.fire({ icon: "error", title: "Gagal", text: apiErr.detail || "Gagal menolak peminjaman." });
    } finally {
      setActionLoadingId(null);
    }
  };

  const tabs = [
    { id: "live" as const, label: "Antrean Live", count: peminjamanPending.length },
    { id: "approved" as const, label: "Berhasil", count: peminjaman.length },
    { id: "failed" as const, label: "Gagal/Tinjau", count: 0 },
  ];

  return (
    <div className="min-h-full bg-[#F8FAFC] font-sans antialiased text-slate-900">
      <header className="border-b border-slate-200 bg-white px-4 py-5 md:px-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-1.5 rounded-full bg-[#E40082]" />
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-950">Verifikasi Identitas KTM</h1>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                OCR Technology · Status: {apiError ? "Reconnecting" : "Connected"}
                {lastRefresh ? ` · Update ${lastRefresh.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}` : ""}
              </p>
            </div>
          </div>

          <div className="flex w-full max-w-xl items-center rounded-2xl border border-slate-200 bg-slate-100 p-1.5 shadow-inner">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 rounded-xl px-3 py-3 text-[10px] font-black uppercase tracking-wider transition-all ${
                  activeTab === tab.id
                    ? "bg-white text-[#263C92] shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {tab.label}
                <span className="ml-2 rounded-md bg-slate-100 px-2 py-0.5 text-[9px]">{tab.count}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="p-4 md:p-6">
        {apiError && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <XCircleIcon className="h-5 w-5 shrink-0 text-amber-600" />
            <p className="text-sm font-bold text-amber-800">{apiError}</p>
            <button
              type="button"
              onClick={fetchStatus}
              className="ml-auto flex items-center gap-2 rounded-xl bg-amber-100 px-3 py-2 text-[10px] font-black uppercase text-amber-800"
            >
              <ArrowPathIcon className="h-4 w-4" />
              Retry
            </button>
          </div>
        )}

        <div className="grid min-h-[620px] gap-4 xl:grid-cols-[290px_minmax(0,1fr)]">
          <aside className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Feed Scan Terbaru</p>
            </div>

            <div className="max-h-[560px] space-y-2 overflow-y-auto p-3">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-16 rounded-xl bg-slate-100 animate-pulse" />
                ))
              ) : visibleItems.length === 0 ? (
                <div className="flex h-52 flex-col items-center justify-center px-5 text-center">
                  <DocumentTextIcon className="h-10 w-10 text-slate-300" />
                  <p className="mt-3 text-sm font-bold text-slate-500">
                    {activeTab === "failed" ? "Belum ada data gagal/tinjau." : "Belum ada antrean scan."}
                  </p>
                </div>
              ) : (
                visibleItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                      selectedItem?.id === item.id
                        ? "border-slate-300 bg-slate-100 shadow-sm"
                        : "border-transparent hover:bg-slate-50"
                    }`}
                  >
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xs font-black ${
                      item.queueStatus === "pending" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                    }`}>
                      {getInitials(item.nama)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black text-slate-900">{item.nama}</p>
                      <p className="mt-0.5 truncate text-xs font-semibold text-slate-400">{item.nim}</p>
                    </div>
                    <span className={`h-2.5 w-2.5 rounded-full ${item.queueStatus === "pending" ? "bg-amber-400" : "bg-emerald-400"}`} />
                  </button>
                ))
              )}
            </div>
          </aside>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-8">
            {selectedItem ? (
              <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
                <div className="space-y-4">
                  <div className="relative aspect-[1/1] overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-b from-blue-50 to-white">
                    <div className="absolute right-5 top-5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-700 shadow-sm">
                      KTM Scan
                    </div>
                    <div className="flex h-full flex-col items-center justify-end pt-12">
                      <div className="flex h-36 w-36 items-center justify-center rounded-full bg-[#F2B77E] text-5xl font-black text-[#A54418] shadow-inner">
                        {getInitials(selectedItem.nama)}
                      </div>
                      <div className="mt-[-8px] h-32 w-52 rounded-t-[80px] bg-sky-200" />
                    </div>
                  </div>

                  <div className="rounded-2xl bg-slate-950 p-5 text-white">
                    <div className="mb-5 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-sky-400">
                      <SparklesIcon className="h-4 w-4" />
                      AI Analysis
                    </div>
                    <div className="space-y-4 text-xs font-semibold">
                      <div className="flex justify-between border-b border-white/10 pb-3">
                        <span className="text-slate-400">Kecocokan Wajah</span>
                        <span className="font-black text-emerald-400">{getConfidence(selectedItem)}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/10 pb-3">
                        <span className="text-slate-400">Validasi OCR NIM</span>
                        <span className="font-black text-emerald-400">Match</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Security Status</span>
                        <span className="font-black text-emerald-400">Secure</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex min-w-0 flex-col justify-center">
                  <div className="border-b border-slate-100 pb-7">
                    <h2 className="text-3xl font-black tracking-tight text-slate-950">{selectedItem.nama}</h2>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <span className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-black text-[#263C92]">{selectedItem.nim}</span>
                      <span className="text-xs font-black uppercase tracking-widest text-slate-300">·</span>
                      <span className="text-xs font-black uppercase tracking-widest text-slate-500">
                        {selectedItem.queueStatus === "pending" ? "Menunggu ACC" : "Akses Aktif"}
                      </span>
                    </div>
                    <p className="mt-4 text-base font-semibold text-slate-500">
                      Hasil scan KTM cocok dengan data mahasiswa dan permintaan booking laboratorium.
                    </p>
                  </div>

                  <div className="mt-7 grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                      <div className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <MapPinIcon className="h-4 w-4" />
                        Lab Tujuan
                      </div>
                      <p className="text-base font-black text-slate-900">{selectedItem.lab}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                      <div className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <ClockIcon className="h-4 w-4" />
                        Jam Booking
                      </div>
                      <p className="text-base font-black text-slate-900">{getBookingTime(selectedItem)}</p>
                      <p className="mt-1 text-xs font-semibold text-slate-400">{formatDate(selectedItem.booking_date || selectedItem.waktu_masuk)}</p>
                    </div>
                  </div>

                  <div className={`mt-6 flex items-start gap-4 rounded-2xl border p-5 ${
                    selectedItem.queueStatus === "pending"
                      ? "border-amber-100 bg-amber-50"
                      : "border-emerald-100 bg-emerald-50"
                  }`}>
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      selectedItem.queueStatus === "pending" ? "bg-amber-500 text-white" : "bg-emerald-500 text-white"
                    }`}>
                      <ShieldCheckIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className={`text-sm font-black uppercase ${
                        selectedItem.queueStatus === "pending" ? "text-amber-800" : "text-emerald-800"
                      }`}>
                        {selectedItem.queueStatus === "pending" ? "Siap Diverifikasi Admin" : "Jadwal Terverifikasi"}
                      </p>
                      <p className={`mt-1 text-sm font-semibold ${
                        selectedItem.queueStatus === "pending" ? "text-amber-700" : "text-emerald-700"
                      }`}>
                        {selectedItem.queueStatus === "pending"
                          ? "Mahasiswa sudah lolos scan KTM dan verifikasi wajah. Klik izinkan untuk membuka akses lab."
                          : "Akses sudah disetujui dan sesi peminjaman sedang aktif."}
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 grid gap-3 md:grid-cols-[200px_minmax(0,1fr)]">
                    <button
                      type="button"
                      onClick={() => handleReject(selectedItem.id)}
                      disabled={!!actionLoadingId || selectedItem.queueStatus === "approved"}
                      className="flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-4 text-xs font-black uppercase tracking-wider text-red-600 transition-all hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {actionLoadingId === selectedItem.id ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : <XCircleIcon className="h-4 w-4" />}
                      Tolak Akses
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApprove(selectedItem.id)}
                      disabled={!!actionLoadingId || selectedItem.queueStatus === "approved"}
                      className="flex items-center justify-center gap-2 rounded-xl bg-[#263C92] px-5 py-4 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-blue-900/20 transition-all hover:bg-[#1f3178] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                    >
                      {actionLoadingId === selectedItem.id ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : <CheckCircleIcon className="h-4 w-4" />}
                      {selectedItem.queueStatus === "approved" ? "Sudah Diizinkan" : "Izinkan & Buka Pintu"}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex min-h-[520px] flex-col items-center justify-center text-center">
                <UserCircleIcon className="h-16 w-16 text-slate-300" />
                <h2 className="mt-4 text-xl font-black text-slate-800">Belum Ada Data Scan</h2>
                <p className="mt-2 max-w-sm text-sm font-semibold text-slate-500">
                  Data mahasiswa akan muncul setelah scan KTM dan verifikasi wajah dari halaman booking laboratorium.
                </p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
