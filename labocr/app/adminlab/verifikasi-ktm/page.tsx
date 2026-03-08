"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ArrowPathIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  UserCircleIcon,
  TrashIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { getLabStatus, resetFace, type Peminjaman, type ApiError } from "@/lib/api";

// ─── Config ──────────────────────────────────────────────
const POLL_INTERVAL_MS = 5000;

export default function VerifikasiKTMPage() {
  const router = useRouter();

  // ─── API State ──────────────────────────────────────
  const [peminjaman, setPeminjaman] = useState<Peminjaman[]>([]);
  const [peminjamanPending, setPeminjamanPending] = useState<Peminjaman[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  // ─── Reset Modal State ────────────────────────────────
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [selectedForReset, setSelectedForReset] = useState<Peminjaman | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [resetMsg, setResetMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // ─── Action State ────────────────────────────────────
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  // ─── Fetch ────────────────────────────────────────────
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

  // ─── Actions (Approve / Reject / Reset) ────────────────
  const handleApprove = async (pid: number) => {
    if (actionLoadingId) return;
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

  const handleResetFace = async () => {
    if (!selectedForReset) return;
    setIsResetting(true);
    setResetMsg(null);
    try {
      const token = localStorage.getItem("admin_jwt_token");
      if (!token) {
        router.push("/auth/login");
        return;
      }
      await resetFace(selectedForReset.nim, token);
      setResetMsg({ text: `✅ Data wajah ${selectedForReset.nama} berhasil direset.`, ok: true });
    } catch (err) {
      const e = err as ApiError;
      setResetMsg({
        text: e.status === 404 ? "Wajah belum pernah terdaftar." : `Gagal: ${e.detail}`,
        ok: false,
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] pb-12 font-sans antialiased">

      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm mb-8">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-1.5 h-10 bg-[#263C92] rounded-full" />
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-none">Verifikasi KTM</h1>
              <p className="text-slate-500 text-sm mt-1">Monitor log peminjaman & manajemen data wajah</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {lastRefresh && (
              <p className="text-[10px] text-slate-400 font-bold hidden md:block">
                Update: {lastRefresh.toLocaleTimeString("id-ID")}
              </p>
            )}
            <button
              onClick={fetchStatus}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#263C92] hover:text-white transition-all"
            >
              <ArrowPathIcon className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border border-emerald-100 rounded-xl">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Live</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 space-y-8">

        {/* ERROR BANNER */}
        {apiError && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
            <ShieldExclamationIcon className="h-5 w-5 text-amber-500 shrink-0" />
            <p className="text-sm font-bold text-amber-700">{apiError}</p>
            <button onClick={fetchStatus} className="ml-auto text-[10px] font-black bg-amber-100 px-3 py-1.5 rounded-lg uppercase text-amber-700 flex items-center gap-1.5">
              <ArrowPathIcon className="h-3.5 w-3.5" /> Retry
            </button>
          </div>
        )}

        {/* INFO BANNER: How this page works */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex items-start gap-4">
          <ShieldCheckIcon className="h-6 w-6 text-[#263C92] shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-[#263C92] text-sm mb-1">Sistem Verifikasi Otomatis (ML)</h4>
            <p className="text-xs text-blue-600 leading-relaxed font-medium">
              Verifikasi KTM & wajah dilakukan secara otomatis oleh AI saat mahasiswa melakukan scan.
              Halaman ini menampilkan peminjaman aktif yang sudah terverifikasi. Gunakan fitur{" "}
              <strong>Reset Wajah</strong> jika mahasiswa mengalami kendala saat verifikasi wajah.
            </p>
          </div>
        </div>

        {/* MENUNGGU PERSETUJUAN TABLE (PENDING) */}
        {peminjamanPending.length > 0 && (
          <div className="bg-white shadow-sm border border-amber-200 rounded-[2rem] overflow-hidden mb-8">
            <div className="p-6 border-b border-amber-100 flex justify-between items-center bg-amber-50/50">
              <div>
                <h3 className="text-base font-bold text-amber-800">Menunggu Persetujuan Admin (Pending)</h3>
                <p className="text-[10px] text-amber-600 mt-0.5">
                  {peminjamanPending.length} peminjaman membutuhkan ACC
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-amber-50/30 text-amber-700 text-xs uppercase font-bold tracking-widest">
                  <tr>
                    <th className="px-8 py-5 text-left">Mahasiswa</th>
                    <th className="px-8 py-5 text-left">Lab</th>
                    <th className="px-8 py-5 text-left">Jam Tunggu</th>
                    <th className="px-8 py-5 text-left">Verifikasi ML</th>
                    <th className="px-8 py-5 text-center">Keputusan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-50 text-sm">
                  {peminjamanPending.map((p) => (
                    <tr key={p.id} className="hover:bg-amber-50/30 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                            <ClockIcon className="h-5 w-5 text-amber-600" />
                          </div>
                          <div>
                            <p className="font-bold text-amber-900">{p.nama}</p>
                            <p className="text-xs text-amber-600 mt-0.5">{p.nim}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase bg-slate-100 text-slate-600">
                          {p.lab}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <ClockIcon className="h-3.5 w-3.5" />
                          <span className="font-bold text-xs">{p.waktu_masuk?.slice(11, 16) || "—"}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          <CheckCircleIcon className="h-4 w-4 text-emerald-500" />
                          <span className="text-[10px] font-black uppercase text-emerald-600">Lolos AI</span>
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
                              ? <ArrowPathIcon className="h-3.5 w-3.5 animate-spin" />
                              : <CheckCircleIcon className="h-3.5 w-3.5" />
                            } Setujui
                          </button>
                          <button
                            onClick={() => handleReject(p.id)}
                            disabled={!!actionLoadingId}
                            className="px-3 py-2 bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {actionLoadingId === p.id
                              ? <ArrowPathIcon className="h-3.5 w-3.5 animate-spin" />
                              : <TrashIcon className="h-3.5 w-3.5" />
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

        {/* LIVE QUEUE TABLE */}
        <div className="bg-white shadow-sm border border-slate-200 rounded-[2rem] overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div>
              <h3 className="text-base font-bold text-slate-800">Peminjaman Aktif Terverifikasi</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {isLoading ? "Memuat..." : `${peminjaman.length} peminjaman aktif`}
              </p>
            </div>
            <span className="text-[11px] bg-emerald-100 text-emerald-600 px-3 py-1.5 rounded-lg font-bold uppercase tracking-widest">
              Auto-refresh 5s
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-widest">
                <tr>
                  <th className="px-8 py-5 text-left">Mahasiswa</th>
                  <th className="px-8 py-5 text-left">Lab</th>
                  <th className="px-8 py-5 text-left">Jam Masuk</th>
                  <th className="px-8 py-5 text-left">Verifikasi ML</th>
                  <th className="px-8 py-5 text-center">Aksi Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <td key={j} className="px-8 py-5">
                          <div className="h-4 bg-slate-100 rounded animate-pulse w-28" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : peminjaman.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-16 text-center text-slate-400 font-bold text-sm">
                      {apiError ? "Tidak dapat memuat data." : "Belum ada peminjaman aktif."}
                    </td>
                  </tr>
                ) : (
                  peminjaman.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#263C92]/10 flex items-center justify-center shrink-0">
                            <UserCircleIcon className="h-5 w-5 text-[#263C92]" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 group-hover:text-[#263C92] transition-colors">{p.nama}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{p.nim}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase bg-slate-100 text-slate-600">
                          {p.lab}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <ClockIcon className="h-3.5 w-3.5" />
                          <span className="font-bold text-xs">{p.waktu_masuk?.slice(11, 16) || "—"}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          <CheckCircleIcon className="h-4 w-4 text-emerald-500" />
                          <span className="text-[10px] font-black uppercase text-emerald-600">Terverifikasi AI</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <button
                          onClick={() => {
                            setSelectedForReset(p);
                            setResetMsg(null);
                            setResetModalOpen(true);
                          }}
                          className="px-4 py-2 bg-red-50 text-red-600 border border-red-100 text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-red-100 transition-all flex items-center gap-1.5 mx-auto"
                        >
                          <TrashIcon className="h-3.5 w-3.5" /> Reset Wajah
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* LEGEND */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <h4 className="font-black text-xs text-slate-400 uppercase tracking-widest mb-4">Keterangan</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-xl">
              <CheckCircleIcon className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-emerald-700">Terverifikasi AI</p>
                <p className="text-emerald-600 font-medium">Mahasiswa sudah lolos verifikasi KTM + wajah secara otomatis.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-red-50 rounded-xl">
              <XCircleIcon className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-red-700">Reset Wajah</p>
                <p className="text-red-600 font-medium">Hapus data biometrik wajah mahasiswa. Gunakan jika mahasiswa komplain tidak bisa verifikasi.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ─── MODAL: RESET FACE KONFIRMASI ─────────────────── */}
      {resetModalOpen && selectedForReset && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden">
            <div className="p-6 text-white text-center bg-gradient-to-br from-red-600 to-red-800">
              <div className="w-16 h-16 bg-white/10 rounded-[20px] flex items-center justify-center mx-auto mb-4">
                <TrashIcon className="h-8 w-8 text-white" />
              </div>
              <h2 className="font-bold text-lg uppercase tracking-tight">Reset Data Wajah</h2>
              <p className="text-xs font-bold opacity-80 uppercase tracking-widest mt-1.5">Tindakan Tidak Dapat Dibatalkan</p>
            </div>

            <div className="p-8">
              <div className="bg-slate-50 rounded-[1.5rem] p-5 mb-6 space-y-2 border border-slate-100 text-xs font-bold">
                <div className="flex justify-between"><span className="text-slate-400">Nama</span><span>{selectedForReset.nama}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">NIM</span><span>{selectedForReset.nim}</span></div>
              </div>

              <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6 text-center">
                Data biometrik wajah mahasiswa ini akan <strong className="text-red-600">dihapus permanen</strong>.
                Mahasiswa harus melakukan <strong>enroll ulang</strong> saat scan KTM berikutnya.
              </p>

              {resetMsg && (
                <div className={`p-3 rounded-2xl text-xs font-bold mb-4 text-center ${resetMsg.ok ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
                  {resetMsg.text}
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={handleResetFace}
                  disabled={isResetting || !!resetMsg?.ok}
                  className={`w-full py-4 rounded-2xl text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${isResetting || resetMsg?.ok ? "bg-slate-300 cursor-not-allowed" : "bg-red-600 hover:bg-red-700 shadow-lg"
                    }`}
                >
                  {isResetting ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : <TrashIcon className="h-4 w-4" />}
                  {isResetting ? "Mereset..." : "Hapus Data Wajah"}
                </button>
                <button
                  onClick={() => { setResetModalOpen(false); setSelectedForReset(null); setResetMsg(null); }}
                  className="w-full py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
