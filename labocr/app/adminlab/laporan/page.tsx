"use client";

import { useState, useMemo } from "react";
import { 
  ArrowDownTrayIcon, 
  FunnelIcon, 
  UserMinusIcon, 
  ClockIcon, 
  UsersIcon, 
  ComputerDesktopIcon,
  CalendarIcon,
  DocumentArrowDownIcon,
  XMarkIcon,
  ArrowPathIcon,
  TrashIcon,
  ChevronDownIcon,
  ExclamationTriangleIcon
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
  "Komunikasi Digital dan Media", "Ekowisata", "Teknologi Rekayasa Komputer", 
  "Teknologi Rekayasa Perangkat Lunak", "Supervisor Jaminan Mutu Pangan", 
  "Manajemen Industri Jasa Makanan dan Gizi", "Teknologi dan Manajemen Pembenihan Ikan", 
  "Teknologi dan Manajemen Ternak", "Manajemen Agribisnis", "Manajemen Industri", 
  "Analisis Kimia", "Teknik dan Manajemen Lingkungan", "Akuntansi", 
  "Paramedik Veteriner", "Teknologi dan Manajemen Produksi Perkebunan", 
  "Teknologi Produksi dan Pengembangan Masyarakat Pertanian", "Teknologi Industri Benih"
];

const LIST_BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const LIST_TAHUN = ["2024", "2025", "2026", "2027", "2028"];

const MOCK_HISTORY = [
  { id: 1, nama: "Budi Santoso", nim: "J030321101", prodi: "Teknologi Rekayasa Komputer", lab: "Lab Jaringan 01", tgl: "2026-02-20", jam: "08:00 - 10:00", durasi: 2, status: "Berhasil", kesalahan: "-", semester: "4", email: "budi@apps.ipb.ac.id" },
  { id: 2, nama: "Siti Aminah", nim: "J030321105", prodi: "Akuntansi", lab: "Lab Komputer 02", tgl: "2026-02-20", jam: "10:00 - 12:00", durasi: 2, status: "Berhasil", kesalahan: "-", semester: "2", email: "siti@apps.ipb.ac.id" },
  { id: 3, nama: "Andi Wijaya", nim: "J030321110", prodi: "Teknologi Rekayasa Perangkat Lunak", lab: "Lab Jaringan 01", tgl: "2026-02-19", jam: "13:00 - 15:00", durasi: 2, status: "Terblokir", kesalahan: "Membawa Makanan ke Lab", semester: "6", email: "andi@apps.ipb.ac.id" },
];

export default function LaporanLaboratorium() {
  const [filterProdi, setFilterProdi] = useState("Semua Prodi");
  const [filterBulan, setFilterBulan] = useState("Februari");
  const [filterTahun, setFilterTahun] = useState("2026");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const filteredData = useMemo(() => {
    return MOCK_HISTORY.filter(item => {
      const matchProdi = filterProdi === "Semua Prodi" || item.prodi === filterProdi;
      const matchWaktu = item.tgl.includes(filterTahun); 
      return matchProdi && matchWaktu;
    });
  }, [filterProdi, filterBulan, filterTahun]);

  const blockedData = useMemo(() => MOCK_HISTORY.filter(item => item.status === "Terblokir"), []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 pb-12 antialiased">
      
      {/* HEADER & FILTER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm px-6 md:px-10 py-5">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-4">
          
          {/* Judul dengan Aksen Pink */}
          <div className="flex items-center gap-4 self-start lg:self-center">
            <span className="w-1.5 h-10 bg-[#E40082] rounded-full shrink-0"></span>
            <div>
              <h1 className="text-2xl font-bold text-[#263C92] tracking-tight">Laporan & Analitik</h1>
              <p className="text-slate-500 text-sm font-medium">Sekolah Vokasi IPB University</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-3">
            {/* Group Filter */}
            <div className="flex gap-2">
                <select className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 ring-blue-500 font-medium" value={filterTahun} onChange={(e)=>setFilterTahun(e.target.value)}>
                  {LIST_TAHUN.map(t => <option key={t}>{t}</option>)}
                </select>
                <select className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 ring-blue-500 font-medium" value={filterBulan} onChange={(e)=>setFilterBulan(e.target.value)}>
                  {LIST_BULAN.map(b => <option key={b}>{b}</option>)}
                </select>
                <select className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm max-w-[150px] outline-none focus:ring-1 ring-blue-500 font-medium" value={filterProdi} onChange={(e)=>setFilterProdi(e.target.value)}>
                  <option>Semua Prodi</option>
                  {LIST_PRODI.map(p => <option key={p}>{p}</option>)}
                </select>
            </div>

            {/* Garis Pemisah Vertikal */}
            <div className="hidden md:block w-[1px] h-8 bg-slate-200 mx-1"></div>

            {/* Group Export */}
            <div className="flex gap-2">
              <button onClick={() => alert('Exporting PDF...')} className="bg-[#263C92] hover:bg-[#1d2e70] transition-all text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm">
                <DocumentArrowDownIcon className="h-4 w-4" /> PDF
              </button>
              <button onClick={() => alert('Exporting Excel...')} className="bg-emerald-600 hover:bg-emerald-700 transition-all text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm">
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
            { label: "Total Mahasiswa", val: "1,284", icon: UsersIcon, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Total Pinjam", val: "3,450", icon: ComputerDesktopIcon, color: "text-pink-600", bg: "bg-pink-50" },
            { label: "Jam Pakai", val: "8,920 Hrs", icon: ClockIcon, color: "text-orange-600", bg: "bg-orange-50" },
            { label: "KTM Terblokir", val: blockedData.length, icon: ExclamationTriangleIcon, color: "text-red-600", bg: "bg-red-50" },
          ].map((card, i) => (
            <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex items-center gap-4">
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

        {/* GRAFIK JAM SIBUK */}
        <div className="bg-[#263C92] text-white p-8 rounded-[2rem] shadow-xl hover:shadow-2xl transition-shadow duration-500">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
              <ClockIcon className="h-5 w-5 text-[#E40082]" /> Jam Sibuk Laboratorium (Real-time)
            </h3>
            <div className="flex gap-2">
                <span className="text-xs bg-white/10 px-3 py-1.5 rounded-md border border-white/20">Update: 5m ago</span>
            </div>
          </div>
          <div className="flex items-end justify-between h-40 gap-4 px-2">
            {[20, 45, 90, 100, 80, 60, 30, 15].map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                <div className="w-full bg-[#E40082] rounded-t-lg group-hover:bg-white transition-all duration-300" style={{ height: `${val}%` }}></div>
                <span className="text-xs font-bold opacity-60">{8 + i*2}.00</span>
              </div>
            ))}
          </div>
        </div>

        {/* ANALITIK GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
            <h3 className="text-sm font-bold text-[#263C92] uppercase mb-8 flex items-center gap-2">Lab Teraktif</h3>
            <div className="space-y-6">
              {[{ name: "Lab Jaringan 01", use: 85, color: "bg-[#263C92]" }, { name: "Lab Multimedia", use: 60, color: "bg-[#E40082]" }].map((lab, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-xs font-bold"><span>{lab.name}</span><span>{lab.use}%</span></div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className={`${lab.color} h-full transition-all duration-1000`} style={{ width: `${lab.use}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center">
            <h3 className="text-sm font-bold text-[#263C92] uppercase mb-6 self-start">Distribusi Prodi</h3>
            <div className="relative h-32 w-32 rounded-full border-[10px] border-slate-100 flex items-center justify-center">
                <div className="absolute inset-[-10px] rounded-full border-[10px] border-[#263C92] border-t-transparent border-l-transparent rotate-45"></div>
                <span className="text-sm font-bold text-slate-800">45% INF</span>
            </div>
          </div>
        </div>

        {/* TABEL RIWAYAT */}
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="text-sm font-bold text-[#263C92] uppercase">Riwayat Peminjaman</h3>
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
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-5 font-bold">{item.nama}<br/><span className="font-normal text-slate-400 text-xs">{item.nim}</span></td>
                    <td className="p-5 text-slate-600 font-medium">{item.prodi}</td>
                    <td className="p-5 text-center">
                      <span className={`px-3 py-1 rounded-md text-xs font-bold ${item.status === 'Berhasil' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>{item.status}</span>
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
                  <tr key={item.id} className="hover:bg-red-50 transition-colors">
                    <td className="p-5 font-bold text-slate-800">{item.nama}</td>
                    <td className="p-5 font-medium text-red-600/80">{item.nim}</td>
                    <td className="p-5 italic text-slate-600">{item.kesalahan}</td>
                    <td className="p-5 text-right">
                      <button onClick={() => setSelectedStudent(item)} className="bg-white border border-red-200 text-red-600 px-4 py-2 rounded-lg font-bold hover:bg-red-600 hover:text-white transition-all shadow-sm text-xs">Check Detail</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* MODAL DETAIL */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-200">
            <div className="bg-red-600 p-6 text-white flex justify-between items-center">
              <h2 className="font-bold text-base uppercase tracking-tight">Detail Pelanggaran</h2>
              <XMarkIcon className="h-6 w-6 cursor-pointer" onClick={()=>setSelectedStudent(null)} />
            </div>
            <div className="p-8 space-y-6 text-sm">
              <div className="border-b border-slate-100 pb-4">
                <p className="text-slate-400 font-bold uppercase text-xs mb-1">Mahasiswa</p>
                <p className="font-bold text-slate-800 text-lg">{selectedStudent.nama}</p>
                <p className="font-medium text-red-600">{selectedStudent.nim}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-xl text-red-700 font-medium italic border border-red-100">
                "{selectedStudent.kesalahan}"
              </div>
              <div className="pt-4 flex flex-col gap-3">
                <button onClick={()=>{alert('Akses KTM dipulihkan'); setSelectedStudent(null)}} className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold uppercase text-xs tracking-wider shadow-md hover:bg-emerald-700 transition-colors">Restore Akses</button>
                <button onClick={()=>setSelectedStudent(null)} className="w-full text-slate-400 py-1 font-bold text-xs uppercase">Tutup</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}