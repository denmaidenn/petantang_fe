"use client";

import { useState, useMemo } from "react";
import {
  ArrowDownTrayIcon,
  UserMinusIcon,
  ClockIcon,
  UsersIcon,
  ComputerDesktopIcon,
  CalendarIcon,
  DocumentArrowDownIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";

interface Student {
  id: number;
  nama: string;
  nim: string;
  prodi: string;
  lab: string;
  tgl: string;
  jam: string;
  durasi: number;
  status: string;
  kesalahan: string;
  semester: string;
  email: string;
}

const LIST_PRODI = [
  "Komunikasi Digital dan Media",
  "Ekowisata",
  "Teknologi Rekayasa Komputer",
  "Teknologi Rekayasa Perangkat Lunak",
  "Supervisor Jaminan Mutu Pangan",
  "Manajemen Industri Jasa Makanan dan Gizi",
  "Teknologi dan Manajemen Pembenihan Ikan",
  "Teknologi dan Manajemen Ternak",
  "Manajemen Agribisnis",
  "Manajemen Industri",
  "Analisis Kimia",
  "Teknik dan Manajemen Lingkungan",
  "Akuntansi",
  "Paramedik Veteriner",
  "Teknologi dan Manajemen Produksi Perkebunan",
  "Teknologi Produksi dan Pengembangan Masyarakat Pertanian",
  "Teknologi Industri Benih",
];

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
];
const LIST_TAHUN = ["2024", "2025", "2026", "2027", "2028"];

const MOCK_HISTORY = [
  {
    id: 1,
    nama: "Budi Santoso",
    nim: "J030321101",
    prodi: "Teknologi Rekayasa Komputer",
    lab: "Lab Jaringan 01",
    tgl: "2026-02-20",
    jam: "08:00 - 10:00",
    durasi: 2,
    status: "Berhasil",
    kesalahan: "-",
    semester: "4",
    email: "budi@apps.ipb.ac.id",
  },
  {
    id: 2,
    nama: "Siti Aminah",
    nim: "J030321105",
    prodi: "Akuntansi",
    lab: "Lab Komputer 02",
    tgl: "2026-02-20",
    jam: "10:00 - 12:00",
    durasi: 2,
    status: "Berhasil",
    kesalahan: "-",
    semester: "2",
    email: "siti@apps.ipb.ac.id",
  },
  {
    id: 3,
    nama: "Andi Wijaya",
    nim: "J030321110",
    prodi: "Teknologi Rekayasa Perangkat Lunak",
    lab: "Lab Jaringan 01",
    tgl: "2026-02-19",
    jam: "13:00 - 15:00",
    durasi: 2,
    status: "Terblokir",
    kesalahan: "Membawa Makanan ke Lab",
    semester: "6",
    email: "andi@apps.ipb.ac.id",
  },
];

export default function LaporanLaboratorium() {
  const [filterProdi, setFilterProdi] = useState("Semua Prodi");
  const [filterBulan, setFilterBulan] = useState("Februari");
  const [filterTahun, setFilterTahun] = useState("2026");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const filteredData = useMemo(() => {
    return MOCK_HISTORY.filter((item) => {
      const matchProdi =
        filterProdi === "Semua Prodi" || item.prodi === filterProdi;
      const matchWaktu = item.tgl.includes(filterTahun);
      return matchProdi && matchWaktu;
    });
  }, [filterProdi, filterBulan, filterTahun]);

  const blockedData = useMemo(
    () => MOCK_HISTORY.filter((item) => item.status === "Terblokir"),
    [],
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 pb-12 antialiased">
      {/* HEADER & FILTER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm px-6 md:px-10 py-5">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4 self-start lg:self-center">
            <span className="w-1.5 h-10 bg-[#E40082] rounded-full shrink-0"></span>
            <div>
              <h1 className="text-2xl font-bold text-[#263C92] tracking-tight">
                Laporan & Analitik
              </h1>
              <p className="text-slate-500 text-sm font-medium">
                Sekolah Vokasi IPB University
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
                {LIST_TAHUN.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
              <select
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 ring-blue-500 font-medium"
                value={filterBulan}
                onChange={(e) => setFilterBulan(e.target.value)}
              >
                {LIST_BULAN.map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
              <select
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm max-w-[150px] outline-none focus:ring-1 ring-blue-500 font-medium"
                value={filterProdi}
                onChange={(e) => setFilterProdi(e.target.value)}
              >
                <option>Semua Prodi</option>
                {LIST_PRODI.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>

            <div className="hidden md:block w-[1px] h-8 bg-slate-200 mx-1"></div>

            <div className="flex gap-2">
              <button
                onClick={() => alert("Exporting PDF...")}
                className="bg-[#263C92] hover:bg-[#1d2e70] transition-all text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm"
              >
                <DocumentArrowDownIcon className="h-4 w-4" /> PDF
              </button>
              <button
                onClick={() => alert("Exporting Excel...")}
                className="bg-emerald-600 hover:bg-emerald-700 transition-all text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm"
              >
                <ArrowDownTrayIcon className="h-4 w-4" /> EXCEL
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-8 space-y-8">
        {/* STATS CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            {
              label: "Total Mahasiswa",
              val: "1,284",
              icon: UsersIcon,
              color: "text-blue-600",
              bg: "bg-blue-50",
            },
            {
              label: "Total Pinjam",
              val: "3,450",
              icon: ComputerDesktopIcon,
              color: "text-pink-600",
              bg: "bg-pink-50",
            },
            {
              label: "Jam Pakai",
              val: "8,920 Hrs",
              icon: ClockIcon,
              color: "text-orange-600",
              bg: "bg-orange-50",
            },
            {
              label: "KTM Terblokir",
              val: blockedData.length,
              icon: ExclamationTriangleIcon,
              color: "text-red-600",
              bg: "bg-red-50",
            },
          ].map((card, i) => (
            <div
              key={i}
              className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex items-center gap-4"
            >
              <div
                className={`h-12 w-12 ${card.bg} ${card.color} rounded-xl flex items-center justify-center`}
              >
                <card.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">
                  {card.label}
                </p>
                <h4 className="text-xl font-bold text-slate-800">{card.val}</h4>
              </div>
            </div>
          ))}
        </div>

        {/* GRAFIK JAM SIBUK */}
        <div className="bg-[#263C92] text-white p-8 rounded-[2rem] shadow-xl hover:shadow-2xl transition-shadow duration-500">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
              <ClockIcon className="h-5 w-5 text-[#E40082]" /> Jam Sibuk
              Laboratorium (Real-time)
            </h3>
            <div className="flex gap-2">
              <span className="text-xs bg-white/10 px-3 py-1.5 rounded-md border border-white/20">
                Update: 5m ago
              </span>
            </div>
          </div>
          <div className="flex items-end justify-between h-40 gap-4 px-2">
            {[20, 45, 90, 100, 80, 60, 30, 15].map((val, i) => (
              <div
                key={i}
                className="flex-1 flex flex-col items-center gap-3 group"
              >
                <div
                  className="w-full bg-[#E40082] rounded-t-lg group-hover:bg-white transition-all duration-300"
                  style={{ height: `${val}%` }}
                ></div>
                <span className="text-xs font-bold opacity-60">
                  {8 + i * 2}.00
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* TABEL RIWAYAT */}
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="text-sm font-bold text-[#263C92] uppercase">
              Riwayat Peminjaman
            </h3>
            <button className="text-xs font-bold text-slate-500 hover:text-[#263C92] flex items-center gap-2 border border-slate-200 px-4 py-2 rounded-lg shadow-sm bg-white">
              <DocumentArrowDownIcon className="h-4 w-4" /> Download Data
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-400 uppercase font-bold text-xs">
                <tr>
                  <th className="p-5 text-left">Mahasiswa</th>
                  <th className="p-5 text-left">Prodi</th>
                  <th className="p-5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredData.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="p-5 font-bold">
                      {item.nama}
                      <br />
                      <span className="font-normal text-slate-400 text-xs">
                        {item.nim}
                      </span>
                    </td>
                    <td className="p-5 text-slate-600 font-medium">
                      {item.prodi}
                    </td>
                    <td className="p-5 text-center">
                      <span
                        className={`px-3 py-1 rounded-md text-xs font-bold ${item.status === "Berhasil" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* DAFTAR KTM TERBLOKIR */}
        <div className="bg-red-50/30 rounded-[2rem] border border-red-100 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-red-100 flex justify-between items-center bg-red-50/50">
            <h3 className="text-sm font-bold text-red-600 uppercase flex items-center gap-2">
              <UserMinusIcon className="h-5 w-5" /> KTM Terblokir
            </h3>
            {/* DOWNLOAD DI ATAS TABLE */}
            <button
              onClick={() => alert("Downloading Data...")}
              className="text-xs font-bold text-slate-500 hover:text-red-600 flex items-center gap-2 border border-slate-200 px-4 py-2 rounded-lg shadow-sm bg-white transition-all"
            >
              <DocumentArrowDownIcon className="h-4 w-4" /> Download List
              Terblokir
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-red-100/20 text-red-500 uppercase text-xs font-bold">
                <tr>
                  <th className="p-5 text-left">Nama</th>
                  <th className="p-5 text-left">NIM</th>
                  <th className="p-5 text-left">Keterangan Kesalahan</th>
                  <th className="p-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-red-100">
                {blockedData.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-red-50 transition-colors"
                  >
                    <td className="p-5 font-bold text-slate-800">
                      {item.nama}
                    </td>
                    <td className="p-5 font-medium text-red-600/80">
                      {item.nim}
                    </td>
                    <td className="p-5 italic text-slate-600">
                      {item.kesalahan}
                    </td>
                    <td className="p-5 text-right">
                      <button
                        onClick={() => setSelectedStudent(item)}
                        className="bg-white border border-red-200 text-red-600 px-4 py-2 rounded-lg font-bold hover:bg-red-600 hover:text-white transition-all shadow-sm text-xs"
                      >
                        Check Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* MODAL POPUP - IDENTIK DENGAN CARD MONITORING DASHBOARD */}

      {selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row">
            {/* --- SISI KIRI: AI ANALYSIS (Identitas Digital) --- */}
            <div className="w-full md:w-5/12 bg-[#0F172A] p-10 flex flex-col items-center justify-center relative overflow-hidden">
              {/* Dekorasi Background */}
              <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-40 h-40 bg-blue-500 rounded-full blur-3xl"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-40 h-40 bg-pink-500 rounded-full blur-3xl"></div>
              </div>

              <div className="relative mb-8 group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-[#E40082] rounded-[2.2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedStudent.nama}`}
                  className="relative w-44 h-44 rounded-[2rem] object-cover border-4 border-slate-800 bg-slate-100 shadow-2xl"
                  alt="KTM Scan"
                />
                <div className="absolute top-3 right-3 bg-red-600 px-2 py-1 rounded text-[8px] font-black text-white uppercase shadow-xl animate-pulse">
                  Suspended
                </div>
              </div>

              <div className="w-full space-y-4 relative z-10">
                <div className="flex items-center gap-2 text-blue-400">
                  <div className="h-1 w-1 bg-blue-400 rounded-full animate-ping"></div>
                  <span className="text-[9px] font-black uppercase tracking-[0.3em]">
                    Neural Verification System
                  </span>
                </div>

                <div className="space-y-3 border-t border-slate-800 pt-5">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-500 font-bold uppercase">
                      Identity Match
                    </span>
                    <span className="text-emerald-400 font-black tracking-widest">
                      VERIFIED
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-500 font-bold uppercase">
                      Security Flag
                    </span>
                    <span className="text-red-500 font-black tracking-widest">
                      VIOLATION DETECTED
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-500 font-bold uppercase">
                      KTM Database
                    </span>
                    <span className="text-blue-400 font-black tracking-widest">
                      LOCKED
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* --- SISI KANAN: DETAIL PELANGGARAN & ACTIONS --- */}
            <div className="flex-1 p-10 bg-white relative flex flex-col">
              <button
                onClick={() => setSelectedStudent(null)}
                className="absolute top-8 right-8 text-slate-300 hover:text-slate-900 transition-colors p-2 hover:bg-slate-50 rounded-full"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>

              <div className="mb-8">
                <span className="text-[#E40082] text-[10px] font-black uppercase tracking-[0.2em] mb-2 block">
                  Detail Laporan Pelanggaran
                </span>
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight leading-tight">
                  {selectedStudent.nama}
                </h2>
                <div className="flex items-center gap-2 mt-3">
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-[10px] font-black rounded uppercase tracking-wider">
                    NIM: {selectedStudent.nim}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {selectedStudent.prodi}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-1 tracking-tighter">
                    Waktu Kejadian
                  </p>
                  <p className="text-xs font-bold text-slate-800">
                    {selectedStudent.tgl}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-1 tracking-tighter">
                    Jam Sesi
                  </p>
                  <p className="text-xs font-bold text-slate-800">
                    {selectedStudent.jam.split(" - ")[0]}
                  </p>
                </div>
                <div className="p-5 bg-red-50/50 rounded-2xl border border-dashed border-red-200 col-span-2">
                  <p className="text-[9px] font-black text-red-500 uppercase mb-2 tracking-widest flex items-center gap-2">
                    <ExclamationTriangleIcon className="h-3 w-3" /> Jenis
                    Pelanggaran
                  </p>
                  <p className="text-sm font-bold text-red-900 italic leading-relaxed">
                    "{selectedStudent.kesalahan}"
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-auto pt-6 border-t border-slate-50">
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="flex-1 py-4 text-slate-500 text-[10px] font-black rounded-2xl border border-slate-200 uppercase tracking-widest hover:bg-slate-50 transition-all"
                >
                  Batal
                </button>
                <button
                  onClick={() => {
                    alert(`Akses ${selectedStudent.nama} dipulihkan!`);
                    setSelectedStudent(null);
                  }}
                  className="flex-[2] py-4 bg-[#263C92] text-white text-[10px] font-black rounded-2xl uppercase tracking-widest shadow-xl shadow-blue-900/20 hover:bg-[#1a2b6d] transition-all flex items-center justify-center gap-2"
                >
                  <ArrowPathIcon className="h-4 w-4" /> Pulihkan Akses KTM
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
