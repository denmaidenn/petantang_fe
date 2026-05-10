"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDownTrayIcon,
  UserMinusIcon,
  ClockIcon,
  UsersIcon,
  ComputerDesktopIcon,
  DocumentArrowDownIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { getPeminjamanHistory, type ApiError, type PeminjamanHistory } from "@/lib/api";

import Swal from "sweetalert2";

interface ReportRow {
  id: number;
  nama: string;
  nim: string;
  prodi: string;
  lab: string;
  tgl: string;
  jam: string;
  durasi: number;
  status: string;
  statusRaw: string;
  catatan: string;
}

const LIST_BULAN = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
] as const;

const MONTH_NAME_TO_NUMBER: Record<string, number> = {
  Januari: 1,
  Februari: 2,
  Maret: 3,
  April: 4,
  Mei: 5,
  Juni: 6,
  Juli: 7,
  Agustus: 8,
  September: 9,
  Oktober: 10,
  November: 11,
  Desember: 12,
};

function buildYearOptions(): string[] {
  const y = new Date().getFullYear();
  return [String(y - 1), String(y), String(y + 1), String(y + 2)];
}

function defaultMonthName(): string {
  return LIST_BULAN[new Date().getMonth()] ?? "Januari";
}

function formatIntId(n: number): string {
  return new Intl.NumberFormat("id-ID").format(n);
}

function formatDecimalId(n: number, fraction = 1): string {
  return new Intl.NumberFormat("id-ID", { minimumFractionDigits: fraction, maximumFractionDigits: fraction }).format(n);
}

function downloadCsv(filename: string, header: string[], rows: string[][]) {
  const esc = (s: string) => `"${String(s).replace(/"/g, '""')}"`;
  const lines = [header.map(esc).join(","), ...rows.map((r) => r.map(esc).join(","))];
  const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Slot 2 jam mulai jam 7–19: distribusi waktu_masuk dari riwayat terfilter. */
function computeBusySlots(rows: PeminjamanHistory[]): { label: string; pct: number; count: number }[] {
  const starts = [7, 9, 11, 13, 15, 17, 19];
  const counts = starts.map((start) => {
    let c = 0;
    for (const row of rows) {
      if (!row.waktu_masuk) continue;
      const d = parseDbDateTime(row.waktu_masuk);
      if (!d) continue;
      const h = d.getHours();
      if (h >= start && h < start + 2) c++;
    }
    return c;
  });
  const max = Math.max(...counts, 1);
  return starts.map((start, i) => ({
    label: `${String(start).padStart(2, "0")}.00`,
    pct: Math.round((counts[i] / max) * 100),
    count: counts[i],
  }));
}

function relativeUpdateLabel(d: Date): string {
  const sec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (sec < 60) return "Baru saja";
  if (sec < 3600) return `${Math.floor(sec / 60)} m lalu`;
  return `${Math.floor(sec / 3600)} j lalu`;
}

/** Durasi sesi dalam jam; tidak negatif (penolakan / waktu_masuk di masa depan vs waktu_keluar). */
function sessionDurationHours(masuk: Date | null, keluar: Date | null): number {
  if (!keluar || !masuk) return 0;
  const t0 = masuk.getTime();
  const t1 = keluar.getTime();
  if (Number.isNaN(t0) || Number.isNaN(t1) || t1 <= t0) return 0;
  return Math.round(((t1 - t0) / (1000 * 60 * 60)) * 10) / 10;
}

/**
 * Parse datetime dari MySQL / API (`YYYY-MM-DD HH:mm:ss` tanpa Z sering gagal di `new Date(str)`).
 */
function parseDbDateTime(raw: string | null | undefined): Date | null {
  if (raw == null) return null;
  const s = String(raw).trim();
  if (!s) return null;
  const tryNative = new Date(s);
  if (!Number.isNaN(tryNative.getTime())) return tryNative;
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/);
  if (m) {
    const d = new Date(
      Number(m[1]),
      Number(m[2]) - 1,
      Number(m[3]),
      Number(m[4]),
      Number(m[5]),
      Number(m[6]),
    );
    if (!Number.isNaN(d.getTime())) return d;
  }
  return null;
}

/** Satu slot jadwal publik ~2 jam — dipakai jika sesi selesai tapi interval masuk–keluar tidak terhitung. */
const DEFAULT_SLOT_JAM = 2;

/** Jam pakai untuk laporan: hanya status selesai; fallback slot bila durasi riil = 0. */
function usageHoursForLaporan(statusRaw: string, masuk: Date | null, keluar: Date | null): number {
  if (statusRaw !== "selesai") return 0;
  const h = sessionDurationHours(masuk, keluar);
  if (h > 0) return h;
  if (masuk && !Number.isNaN(masuk.getTime())) return DEFAULT_SLOT_JAM;
  return 0;
}

function localDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function normLab(lab: string | undefined | null): string | null {
  const s = (lab != null ? String(lab) : "").trim();
  if (!s || s === "—") return null;
  return s;
}

function addLabToDayMap(map: Map<string, Set<string>>, dateKey: string, lab: string | null) {
  if (!lab) return;
  let set = map.get(dateKey);
  if (!set) {
    set = new Set<string>();
    map.set(dateKey, set);
  }
  set.add(lab);
}

type LabUsageBar = { label: string; count: number; pct: number; sub?: string };

function toBarsWithPct(counts: number[], labels: string[], subs?: (string | undefined)[]): LabUsageBar[] {
  const max = Math.max(...counts, 1);
  return labels.map((label, i) => ({
    label,
    count: counts[i] ?? 0,
    pct: Math.round(((counts[i] ?? 0) / max) * 100),
    sub: subs?.[i],
  }));
}

/** Harian: tiap tanggal dalam bulan terpilih — jumlah lab berbeda yang dipakai. */
function computeLabUsageDaily(rows: PeminjamanHistory[], year: number, month: number): LabUsageBar[] {
  const last = new Date(year, month, 0).getDate();
  const dayMap = new Map<string, Set<string>>();
  for (const row of rows) {
    if (!row.waktu_masuk) continue;
    const d = parseDbDateTime(row.waktu_masuk);
    if (!d) continue;
    if (d.getFullYear() !== year || d.getMonth() + 1 !== month) continue;
    const lab = normLab(row.lab);
    addLabToDayMap(dayMap, localDateKey(d), lab);
  }
  const counts: number[] = [];
  const labels: string[] = [];
  const subs: string[] = [];
  for (let day = 1; day <= last; day++) {
    const key = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const n = dayMap.get(key)?.size ?? 0;
    counts.push(n);
    labels.push(String(day));
    subs.push(`${day}/${month}`);
  }
  return toBarsWithPct(counts, labels, subs);
}

const WEEKDAY_LABELS_MON_FIRST = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"] as const;

/** Mingguan: agregat per hari dalam minggu (Sen–Min) dalam bulan terpilih — lab unik yang pernah dipakai pada hari itu (gabungan semua tanggal). */
function computeLabUsageByWeekday(rows: PeminjamanHistory[], year: number, month: number): LabUsageBar[] {
  const dowToLabs: Set<string>[] = Array.from({ length: 7 }, () => new Set<string>());
  for (const row of rows) {
    if (!row.waktu_masuk) continue;
    const d = parseDbDateTime(row.waktu_masuk);
    if (!d) continue;
    if (d.getFullYear() !== year || d.getMonth() + 1 !== month) continue;
    const lab = normLab(row.lab);
    if (!lab) continue;
    let idx = d.getDay() - 1;
    if (idx < 0) idx = 6;
    dowToLabs[idx].add(lab);
  }
  const counts = dowToLabs.map((s) => s.size);
  return toBarsWithPct(counts, [...WEEKDAY_LABELS_MON_FIRST]);
}

/** Bulanan: tiap bulan dalam tahun — lab unik yang dipakai (butuh data satu tahun penuh). */
function computeLabUsageMonthly(rows: PeminjamanHistory[], year: number): LabUsageBar[] {
  const monthToLabs: Set<string>[] = Array.from({ length: 12 }, () => new Set<string>());
  for (const row of rows) {
    if (!row.waktu_masuk) continue;
    const d = parseDbDateTime(row.waktu_masuk);
    if (!d) continue;
    if (d.getFullYear() !== year) continue;
    const lab = normLab(row.lab);
    if (!lab) continue;
    monthToLabs[d.getMonth()].add(lab);
  }
  const counts = monthToLabs.map((s) => s.size);
  const labels = LIST_BULAN.map((b) => b.slice(0, 3));
  return toBarsWithPct(counts, labels);
}

export default function LaporanLaboratorium() {
  const router = useRouter();
  const [history, setHistory] = useState<PeminjamanHistory[]>([]);
  const [prodiOptions, setProdiOptions] = useState<string[]>([]);
  const [prodiListLoading, setProdiListLoading] = useState(false);
  const [filterProdi, setFilterProdi] = useState("Semua Prodi");
  const [filterBulan, setFilterBulan] = useState(defaultMonthName);
  const [filterTahun, setFilterTahun] = useState(() => String(new Date().getFullYear()));
  const [selectedRow, setSelectedRow] = useState<ReportRow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);
  const [labDistMode, setLabDistMode] = useState<"jam_masuk" | "mingguan" | "bulanan">("jam_masuk");
  const [historyYear, setHistoryYear] = useState<PeminjamanHistory[]>([]);
  const [yearDataLoading, setYearDataLoading] = useState(false);

  const loadHistory = useCallback(async () => {
    const token = localStorage.getItem("admin_jwt_token");
    if (!token) {
      router.replace("/auth/login");
      return;
    }

    setIsLoading(true);
    setFetchError(null);

    try {
      const monthNum = MONTH_NAME_TO_NUMBER[filterBulan];
      const data = await getPeminjamanHistory(
        token,
        parseInt(filterTahun, 10),
        monthNum,
        filterProdi === "Semua Prodi" ? undefined : filterProdi,
      );
      setHistory(Array.isArray(data) ? data : []);
      setLastUpdatedAt(new Date());
    } catch (err) {
      const apiErr = err as ApiError;
      setFetchError(apiErr.detail || "Gagal memuat laporan.");
      setHistory([]);
    } finally {
      setIsLoading(false);
    }
  }, [filterProdi, filterBulan, filterTahun, router]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    let cancelled = false;
    async function loadProdiList() {
      const token = localStorage.getItem("admin_jwt_token");
      if (!token) return;
      setProdiListLoading(true);
      try {
        const rows = await getPeminjamanHistory(token, parseInt(filterTahun, 10), undefined, undefined);
        if (cancelled) return;
        const set = new Set<string>();
        for (const r of rows) {
          const p = r.prodi != null ? String(r.prodi).trim() : "";
          if (p) set.add(p);
        }
        setProdiOptions(Array.from(set).sort((a, b) => a.localeCompare(b, "id")));
      } catch {
        if (!cancelled) setProdiOptions([]);
      } finally {
        if (!cancelled) setProdiListLoading(false);
      }
    }
    loadProdiList();
    return () => {
      cancelled = true;
    };
  }, [filterTahun]);

  useEffect(() => {
    let cancelled = false;
    async function loadYearForLabChart() {
      const token = localStorage.getItem("admin_jwt_token");
      if (!token) return;
      setYearDataLoading(true);
      try {
        const rows = await getPeminjamanHistory(
          token,
          parseInt(filterTahun, 10),
          undefined,
          filterProdi === "Semua Prodi" ? undefined : filterProdi,
        );
        if (!cancelled) setHistoryYear(Array.isArray(rows) ? rows : []);
      } catch {
        if (!cancelled) setHistoryYear([]);
      } finally {
        if (!cancelled) setYearDataLoading(false);
      }
    }
    loadYearForLabChart();
    return () => {
      cancelled = true;
    };
  }, [filterTahun, filterProdi]);

  const formattedHistory = useMemo((): ReportRow[] => {
    return history.map((item) => {
      const masuk = parseDbDateTime(item.waktu_masuk);
      const keluar = parseDbDateTime(item.waktu_keluar);

      const tgl = masuk ? localDateKey(masuk) : "";
      const jamMasuk = masuk
        ? masuk.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false })
        : "";
      const jamKeluar = keluar
        ? keluar.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false })
        : "";
      const jam = jamKeluar ? `${jamMasuk} – ${jamKeluar}` : jamMasuk;

      const raw = (item.status || "").toLowerCase();
      const durasi = usageHoursForLaporan(raw, masuk, keluar);
      const status = raw === "ditolak" ? "Ditolak" : raw === "selesai" ? "Selesai" : item.status || "—";

      return {
        id: item.id,
        nama: item.nama || "—",
        nim: item.nim || "—",
        prodi: item.prodi || "—",
        lab: item.lab || "—",
        tgl,
        jam,
        durasi,
        status,
        statusRaw: raw,
        catatan: item.catatan != null && String(item.catatan).trim() !== "" ? String(item.catatan) : "—",
      };
    });
  }, [history]);

  const filteredData = useMemo(() => {
    return formattedHistory.filter((item) => filterProdi === "Semua Prodi" || item.prodi === filterProdi);
  }, [formattedHistory, filterProdi]);

  const rejectedData = useMemo(
    () => filteredData.filter((item) => item.statusRaw === "ditolak"),
    [filteredData],
  );

  const stats = useMemo(() => {
    const rows = filteredData;
    const nimSet = new Set(rows.map((r) => r.nim).filter((n) => n && n !== "—"));
    // durasi per baris: 0 untuk ditolak; untuk selesai = jam riil atau perkiraan 1 slot (2 j) bila perlu
    const totalJam = rows.reduce((s, r) => s + (Number.isFinite(r.durasi) ? r.durasi : 0), 0);
    return {
      uniqueMahasiswa: nimSet.size,
      totalSesi: rows.length,
      totalJam,
      ditolak: rejectedData.length,
    };
  }, [filteredData, rejectedData.length]);

  const busySlots = useMemo(() => computeBusySlots(history), [history]);

  const labUsageBars = useMemo((): LabUsageBar[] => {
    const y = parseInt(filterTahun, 10);
    const m = MONTH_NAME_TO_NUMBER[filterBulan];
    if (labDistMode === "mingguan") {
      return computeLabUsageByWeekday(history, y, m);
    }
    if (labDistMode === "bulanan") {
      return computeLabUsageMonthly(historyYear, y);
    }
    return [];
  }, [history, historyYear, filterTahun, filterBulan, labDistMode]);

  const labDistSubtitle =
    labDistMode === "jam_masuk"
      ? `Jumlah sesi (07:00–20:00) dari waktu masuk.`
      : labDistMode === "mingguan"
        ? `Dalam ${filterBulan} ${filterTahun}: untuk tiap hari (Sen–Min), jumlah lab berbeda yang dipakai pada tanggal manapun yang jatuh pada hari tersebut.`
        : `Seluruh tahun ${filterTahun}: jumlah lab berbeda yang dipakai per bulan.`;

  const exportRiwayatCsv = () => {
    if (filteredData.length === 0) {
      Swal.fire({ icon: "info", title: "Tidak ada data", text: "Sesuaikan filter atau pilih bulan lain." });
      return;
    }
    const h = ["ID", "Nama", "NIM", "Prodi", "Lab", "Tanggal", "Jam", "Durasi_jam", "Status", "Catatan"];
    const rows = filteredData.map((r) => [
      String(r.id),
      r.nama,
      r.nim,
      r.prodi,
      r.lab,
      r.tgl,
      r.jam,
      String(r.durasi),
      r.status,
      r.catatan,
    ]);
    downloadCsv(`laporan-peminjaman-${filterTahun}-${filterBulan}.csv`, h, rows);
    Swal.fire({ icon: "success", title: "CSV diunduh", timer: 1200, showConfirmButton: false });
  };

  const exportRejectedCsv = () => {
    if (rejectedData.length === 0) {
      Swal.fire({ icon: "info", title: "Tidak ada penolakan", text: "Tidak ada peminjaman ditolak pada filter ini." });
      return;
    }
    const h = ["ID", "Nama", "NIM", "Prodi", "Lab", "Tanggal", "Jam", "Catatan"];
    const rows = rejectedData.map((r) => [String(r.id), r.nama, r.nim, r.prodi, r.lab, r.tgl, r.jam, r.catatan]);
    downloadCsv(`laporan-ditolak-${filterTahun}-${filterBulan}.csv`, h, rows);
    Swal.fire({ icon: "success", title: "CSV diunduh", timer: 1200, showConfirmButton: false });
  };

  const yearOptions = useMemo(() => buildYearOptions(), []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 pb-12 antialiased">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm px-6 md:px-10 py-5">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4 self-start lg:self-center">
            <span className="w-1.5 h-10 bg-[#E40082] rounded-full shrink-0"></span>
            <div>
              <h1 className="text-2xl font-bold text-[#263C92] tracking-tight">Laporan & Analitik</h1>
              <p className="text-slate-500 text-sm font-medium">
                Data peminjaman laboratorium dari sistem (riwayat selesai & ditolak)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="flex gap-2">
              <select
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 ring-blue-500 font-medium"
                value={filterTahun}
                onChange={(e) => setFilterTahun(e.target.value)}
              >
                {yearOptions.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <select
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 ring-blue-500 font-medium"
                value={filterBulan}
                onChange={(e) => setFilterBulan(e.target.value)}
              >
                {LIST_BULAN.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
              <select
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm max-w-[200px] outline-none focus:ring-1 ring-blue-500 font-medium"
                value={filterProdi}
                onChange={(e) => setFilterProdi(e.target.value)}
                disabled={prodiListLoading && prodiOptions.length === 0}
              >
                <option value="Semua Prodi">Semua Prodi</option>
                {prodiOptions.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div className="hidden md:block w-[1px] h-8 bg-slate-200 mx-1"></div>

            <button
              type="button"
              onClick={exportRiwayatCsv}
              className="bg-[#263C92] hover:bg-[#1d2e70] transition-all text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm"
            >
              <ArrowDownTrayIcon className="h-4 w-4" /> Unduh CSV
            </button>
          </div>
        </div>
      </header>

      {fetchError && (
        <div className="max-w-7xl mx-auto px-6 mb-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">{fetchError}</div>
        </div>
      )}

      {isLoading && (
        <div className="max-w-7xl mx-auto px-6 mb-4">
          <div className="bg-white border border-slate-200 text-slate-600 px-6 py-4 rounded-lg">Memuat laporan…</div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-6 mt-8 space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            {
              label: "Mahasiswa (unik)",
              val: formatIntId(stats.uniqueMahasiswa),
              icon: UsersIcon,
              color: "text-blue-600",
              bg: "bg-blue-50",
            },
            {
              label: "Total sesi",
              val: formatIntId(stats.totalSesi),
              icon: ComputerDesktopIcon,
              color: "text-pink-600",
              bg: "bg-pink-50",
            },
            {
              label: "Total jam pakai",
              val: `${formatDecimalId(stats.totalJam)} jam`,
              icon: ClockIcon,
              color: "text-orange-600",
              bg: "bg-orange-50",
            },
            {
              label: "Ditolak admin",
              val: formatIntId(stats.ditolak),
              icon: ExclamationTriangleIcon,
              color: "text-red-600",
              bg: "bg-red-50",
            },
          ].map((card, i) => (
            <div
              key={i}
              className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex items-center gap-4"
            >
              <div className={`h-12 w-12 ${card.bg} ${card.color} rounded-xl flex items-center justify-center`}>
                <card.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">{card.label}</p>
                <h4 className="text-xl font-bold text-slate-800">{card.val}</h4>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[#263C92] text-white p-8 rounded-[2rem] shadow-xl hover:shadow-2xl transition-shadow duration-500">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between lg:gap-8 mb-8">
            <div className="min-w-0 space-y-2">
              <h3 className="text-sm font-bold uppercase tracking-widest flex flex-wrap items-center gap-2">
                {labDistMode === "jam_masuk" ? (
                  <ClockIcon className="h-5 w-5 text-[#E40082] shrink-0" />
                ) : (
                  <ChartBarIcon className="h-5 w-5 text-[#E40082] shrink-0" />
                )}
                {labDistMode === "jam_masuk" ? "Distribusi jam masuk lab" : "Distribusi pemakaian lab"}
              </h3>
              <p className="text-[10px] sm:text-[11px] opacity-75 max-w-2xl leading-relaxed">{labDistSubtitle}</p>
            </div>

            <div
              className="flex w-full flex-col gap-2 sm:w-auto sm:max-w-full lg:shrink-0 lg:pt-0.5"
              role="group"
              aria-label="Pembaruan data dan jenis grafik"
            >
              <div className="flex w-full max-w-full overflow-hidden rounded-2xl border border-white/25 bg-white/[0.07] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] sm:inline-flex sm:w-auto sm:max-w-none">
                <div className="flex min-h-[2.75rem] shrink-0 items-center gap-2 border-white/15 px-3 sm:border-r sm:px-4">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-white/60">Update</span>
                  <span className="text-xs font-bold tabular-nums text-white">
                    {lastUpdatedAt ? relativeUpdateLabel(lastUpdatedAt) : "—"}
                  </span>
                </div>
                <div className="relative flex min-h-[2.75rem] min-w-0 flex-1 items-center sm:min-w-[12rem]">
                  <label htmlFor="laporan-chart-mode" className="sr-only">
                    Jenis grafik
                  </label>
                  <select
                    id="laporan-chart-mode"
                    value={labDistMode}
                    onChange={(e) => setLabDistMode(e.target.value as "jam_masuk" | "mingguan" | "bulanan")}
                    className="h-full w-full min-w-0 cursor-pointer appearance-none bg-white px-4 py-2.5 pr-10 text-sm font-bold text-[#263C92] outline-none transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-[#E40082] focus-visible:ring-inset sm:min-w-[12.5rem]"
                  >
                    <option value="jam_masuk">Harian</option>
                    <option value="mingguan">Mingguan</option>
                    <option value="bulanan">Bulanan</option>
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#263C92] opacity-70" aria-hidden>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {labDistMode === "jam_masuk" ? (
            busySlots.every((s) => s.count === 0) ? (
              <p className="text-sm opacity-80 py-8 text-center">Belum ada data peminjaman pada periode ini.</p>
            ) : (
              <div className="flex items-end justify-between h-40 gap-2 sm:gap-4 px-2">
                {busySlots.map((slot) => (
                  <div key={slot.label} className="flex-1 flex flex-col items-center gap-3 group min-w-0">
                    <div className="w-full flex flex-col items-center justify-end h-32">
                      <span className="text-[10px] font-bold opacity-90 mb-1 tabular-nums">{slot.count}</span>
                      <div
                        className="w-full bg-[#E40082] rounded-t-lg group-hover:bg-white transition-all duration-300 min-h-[4px]"
                        style={{ height: `${Math.max(slot.pct, 4)}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold opacity-60 tabular-nums truncate w-full text-center">
                      {slot.label}
                    </span>
                  </div>
                ))}
              </div>
            )
          ) : labDistMode === "bulanan" && yearDataLoading ? (
            <p className="text-sm text-white/80 py-12 text-center">Memuat agregat tahun…</p>
          ) : labUsageBars.every((b) => b.count === 0) ? (
            <p className="text-sm text-white/80 py-12 text-center">Belum ada data lab untuk periode ini.</p>
          ) : (
            <div className="min-h-[200px] px-1 pt-4">
              <div className="flex items-end gap-1.5 sm:gap-3">
                {labUsageBars.map((bar, idx) => (
                  <div key={`${labDistMode}-${bar.label}-${idx}`} className="flex-1 min-w-0 flex flex-col items-center gap-2 group">
                    <div className="w-full flex flex-col items-center justify-end h-40">
                      <span className="text-[10px] font-bold text-white mb-1 tabular-nums">{bar.count}</span>
                      <div
                        className="w-full max-w-[2.5rem] sm:max-w-none bg-[#E40082] rounded-t-md group-hover:bg-white transition-all duration-300"
                        style={{ height: `${Math.max(Math.round((bar.pct / 100) * 128), 6)}px` }}
                        title={bar.sub ? `${bar.sub}: ${bar.count} lab` : `${bar.label}: ${bar.count} lab`}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-white/80 text-center truncate w-full">
                      {bar.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 flex-wrap gap-3">
            <h3 className="text-sm font-bold text-[#263C92] uppercase">Riwayat peminjaman</h3>
            <button
              type="button"
              onClick={exportRiwayatCsv}
              className="text-xs font-bold text-slate-500 hover:text-[#263C92] flex items-center gap-2 border border-slate-200 px-4 py-2 rounded-lg shadow-sm bg-white"
            >
              <DocumentArrowDownIcon className="h-4 w-4" /> Unduh CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-400 uppercase font-bold text-xs">
                <tr>
                  <th className="p-5 text-left">Mahasiswa</th>
                  <th className="p-5 text-left">Prodi</th>
                  <th className="p-5 text-left">Lab</th>
                  <th className="p-5 text-left">Tanggal</th>
                  <th className="p-5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      Tidak ada riwayat untuk filter ini.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-5 font-bold">
                        {item.nama}
                        <br />
                        <span className="font-normal text-slate-400 text-xs">{item.nim}</span>
                      </td>
                      <td className="p-5 text-slate-600 font-medium max-w-[200px]">{item.prodi}</td>
                      <td className="p-5 text-slate-700 font-medium">{item.lab}</td>
                      <td className="p-5 text-slate-600 text-xs whitespace-nowrap">
                        {item.tgl}
                        <br />
                        <span className="text-slate-400">{item.jam}</span>
                      </td>
                      <td className="p-5 text-center">
                        <span
                          className={`px-3 py-1 rounded-md text-xs font-bold ${
                            item.statusRaw === "ditolak"
                              ? "bg-red-50 text-red-600"
                              : "bg-emerald-50 text-emerald-600"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-red-50/30 rounded-[2rem] border border-red-100 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-red-100 flex justify-between items-center bg-red-50/50 flex-wrap gap-3">
            <h3 className="text-sm font-bold text-red-600 uppercase flex items-center gap-2">
              <UserMinusIcon className="h-5 w-5" />
              Peminjaman ditolak
            </h3>
            <button
              type="button"
              onClick={exportRejectedCsv}
              className="text-xs font-bold text-slate-500 hover:text-red-600 flex items-center gap-2 border border-slate-200 px-4 py-2 rounded-lg shadow-sm bg-white transition-all"
            >
              <DocumentArrowDownIcon className="h-4 w-4" /> Unduh CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-red-100/20 text-red-500 uppercase text-xs font-bold">
                <tr>
                  <th className="p-5 text-left">Nama</th>
                  <th className="p-5 text-left">NIM</th>
                  <th className="p-5 text-left">Lab</th>
                  <th className="p-5 text-left">Catatan / keterangan</th>
                  <th className="p-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-red-100">
                {rejectedData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      Tidak ada penolakan pada periode ini.
                    </td>
                  </tr>
                ) : (
                  rejectedData.map((item) => (
                    <tr key={item.id} className="hover:bg-red-50 transition-colors">
                      <td className="p-5 font-bold text-slate-800">{item.nama}</td>
                      <td className="p-5 font-medium text-red-600/80">{item.nim}</td>
                      <td className="p-5 text-slate-700">{item.lab}</td>
                      <td className="p-5 text-slate-600">{item.catatan}</td>
                      <td className="p-5 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedRow(item)}
                          className="bg-white border border-red-200 text-red-600 px-4 py-2 rounded-lg font-bold hover:bg-red-600 hover:text-white transition-all shadow-sm text-xs"
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {selectedRow && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden relative">
            <button
              type="button"
              onClick={() => setSelectedRow(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 p-2 hover:bg-slate-50 rounded-full"
              aria-label="Tutup"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>

            <div className="p-8 pt-10">
              <span className="text-[#E40082] text-[10px] font-black uppercase tracking-[0.2em] mb-2 block">
                Detail penolakan peminjaman
              </span>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight leading-tight">{selectedRow.nama}</h2>
              <p className="text-sm text-slate-500 mt-1 font-mono">ID peminjaman #{selectedRow.id}</p>

              <dl className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between gap-4 border-b border-slate-100 pb-2">
                  <dt className="text-slate-500 font-semibold">NIM</dt>
                  <dd className="text-slate-900 font-medium text-right">{selectedRow.nim}</dd>
                </div>
                <div className="flex justify-between gap-4 border-b border-slate-100 pb-2">
                  <dt className="text-slate-500 font-semibold">Prodi</dt>
                  <dd className="text-slate-900 text-right">{selectedRow.prodi}</dd>
                </div>
                <div className="flex justify-between gap-4 border-b border-slate-100 pb-2">
                  <dt className="text-slate-500 font-semibold">Laboratorium</dt>
                  <dd className="text-slate-900 font-medium text-right">{selectedRow.lab}</dd>
                </div>
                <div className="flex justify-between gap-4 border-b border-slate-100 pb-2">
                  <dt className="text-slate-500 font-semibold">Tanggal & jam</dt>
                  <dd className="text-slate-900 text-right">
                    {selectedRow.tgl}
                    <br />
                    <span className="text-xs text-slate-500">{selectedRow.jam}</span>
                  </dd>
                </div>
                <div className="rounded-xl bg-red-50/80 border border-red-100 p-4">
                  <dt className="text-[10px] font-bold text-red-600 uppercase tracking-wide flex items-center gap-2 mb-2">
                    <ExclamationTriangleIcon className="h-4 w-4" />
                    Catatan
                  </dt>
                  <dd className="text-slate-800 text-sm leading-relaxed">{selectedRow.catatan}</dd>
                </div>
              </dl>

              <button
                type="button"
                onClick={() => setSelectedRow(null)}
                className="mt-8 w-full py-3 rounded-xl bg-[#263C92] text-white text-sm font-bold hover:bg-[#1a2b6d] transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
