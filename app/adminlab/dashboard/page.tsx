"use client";

import { useState, useEffect } from "react";
import { 
  ClockIcon, 
  ShieldExclamationIcon, 
  WrenchScrewdriverIcon,
  InformationCircleIcon,
  CheckBadgeIcon,
  CpuChipIcon,
  XMarkIcon,
  UserCircleIcon
} from "@heroicons/react/24/outline";

// --- INTERFACES ---
interface Lab {
  id: string;
  name: string;
  location: string;
  capacity: number;
  currentUsers: number;
  status: "Tersedia" | "Digunakan" | "Perbaikan" | "Pending";
  opStart: string;
  opEnd: string;
  useStart?: string;
  useEnd?: string;
}

interface Borrowing {
  id: string;
  time: string;
  name: string;
  nim: string;
  kelas: string;
  prodi: string;
  lab: string;
  gedung: string;
  status: "Aktif" | "Menunggu" | "Selesai" | "Ditolak";
}

export default function DashboardPage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // --- STATE MANAGEMENT ---
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"detail" | "checkout">("detail");
  const [activeLab, setActiveLab] = useState<Lab | null>(null);
  const [checklist, setChecklist] = useState({ clean: false, gear: false, noDamage: false });

  // STATE: Verifikasi AI
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [selectedBorrower, setSelectedBorrower] = useState<Borrowing | null>(null);

  const [borrowings, setBorrowings] = useState<Borrowing[]>([
    { id: "b1", time: "14:35", name: "Ahmad Rizki Prasetyo", nim: "A24200123", kelas: "TI-4A", prodi: "Teknik Informatika", lab: "Lab Komputer 1", gedung: "Gedung Delta", status: "Aktif" },
    { id: "b2", time: "14:28", name: "Siti Nurhaliza", nim: "A24200145", kelas: "TI-4B", prodi: "Teknik Informatika", lab: "Lab Multimedia", gedung: "Gedung Delta", status: "Menunggu" },
    { id: "b3", time: "14:15", name: "Budi Santoso", nim: "A24200098", kelas: "TI-4C", prodi: "Teknik Informatika", lab: "Lab Pemrograman", gedung: "Gedung Epsilon", status: "Aktif" },
  ]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const [labs, setLabs] = useState<Lab[]>([
    { id: "1", name: "Lab Komputer 1", location: "Gedung Delta", capacity: 40, currentUsers: 35, status: "Digunakan", opStart: "07:00", opEnd: "18:00", useStart: "08:30", useEnd: "10:30" },
    { id: "2", name: "Lab Komputer 2", location: "Gedung Delta", capacity: 40, currentUsers: 28, status: "Pending", opStart: "07:00", opEnd: "18:00" },
    { id: "3", name: "Lab Multimedia", location: "Gedung Delta", capacity: 30, currentUsers: 0, status: "Tersedia", opStart: "07:00", opEnd: "18:00" },
    { id: "4", name: "Lab Pemrograman", location: "Gedung Epsilon", capacity: 25, currentUsers: 0, status: "Perbaikan", opStart: "07:00", opEnd: "18:00" },
  ]);

  const stats = [
    { title: "Total Laboratorium", value: labs.length.toString(), subtitle: `${labs.filter(l => l.status === 'Tersedia').length} tersedia`, color: "text-[#263C92]", iconBg: "bg-blue-50", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg> },
    { title: "Peminjaman Aktif", value: borrowings.filter(b => b.status === "Aktif").length.toString(), subtitle: "Sedang berlangsung", color: "text-[#E40082]", iconBg: "bg-pink-50", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { title: "Menunggu Verifikasi", value: borrowings.filter(b => b.status === "Menunggu").length.toString(), subtitle: "Perlu verifikasi KTM", color: "text-[#263C92]", iconBg: "bg-slate-100", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg> },
    { title: "Peminjaman Hari Ini", value: "1", subtitle: "1 selesai", color: "text-[#E40082]", iconBg: "bg-pink-50", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg> },
  ];

  // --- HANDLERS ---
  const handleOpenModal = (lab: Lab, type: "detail" | "checkout") => {
    setActiveLab(lab);
    setModalType(type);
    setChecklist({ clean: false, gear: false, noDamage: false });
    setModalOpen(true);
  };

  const handleVerifyStatus = (id: string, newStatus: "Aktif" | "Ditolak") => {
    setBorrowings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
    setIsVerifyModalOpen(false);
  };

  const handleAction = (type: "normal" | "block") => {
    if (!activeLab) return;
    const currentBorrower = borrowings.find(b => b.lab === activeLab.name && b.status === "Aktif");
    
    if (type === "block" && currentBorrower) {
      alert(`⚠️ KTM ${currentBorrower.nim} (${currentBorrower.name}) telah DIBLOKIR sementara.`);
    } else {
      alert(`✅ ${activeLab.name} berhasil diselesaikan.`);
    }
    setLabs(prev => prev.map(l => l.id === activeLab.id ? { ...l, status: "Tersedia", currentUsers: 0 } : l));
    setModalOpen(false);
  };

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
            <div className="text-right">
                <p className="text-[10px] font-black text-[#E40082] uppercase tracking-widest mb-0.5">Status Real-time</p>
                <p className="text-sm font-bold text-slate-700">
                    {currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
            </div>
            <div className="h-8 w-[1px] bg-slate-200" />
            <div className="flex items-center gap-2">
                <ClockIcon className="h-5 w-5 text-[#263C92]" />
                <span className="text-xl font-bold text-[#263C92] tabular-nums">
                    {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 space-y-8">
        
        {/* 1. Statistik */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all group">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{stat.title}</p>
                  <h3 className={`text-3xl font-bold mt-2 ${stat.color}`}>{stat.value}</h3>
                  <p className="text-[10px] text-slate-400 font-medium mt-1">{stat.subtitle}</p>
                </div>
                <div className={`p-3 rounded-xl ${stat.iconBg} ${stat.color} transition-transform group-hover:scale-110`}>{stat.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* 2. Tabel Antrean */}
        <div className="bg-white shadow-sm border border-slate-200 rounded-[2rem] overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="text-base font-bold text-slate-800">Antrean Peminjaman Laboratorium</h3>
            <span className="text-[11px] bg-[#E40082]/10 text-[#E40082] px-3 py-1.5 rounded-lg font-bold uppercase tracking-widest">Live Update</span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-widest">
                <tr>
                  <th className="px-8 py-5 text-left font-black">Waktu</th>
                  <th className="px-8 py-5 text-left font-black">Peminjam</th>
                  <th className="px-8 py-5 text-left font-black">Lab</th>
                  <th className="px-8 py-5 text-left font-black">Status</th>
                  <th className="px-8 py-5 text-center font-black">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {borrowings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-8 py-5 text-slate-500 font-bold">{b.time}</td>
                    <td className="px-8 py-5">
                      <p className="font-bold text-slate-800 text-sm group-hover:text-[#263C92] transition-colors">{b.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{b.nim}</p>
                    </td>
                    <td className="px-8 py-5 text-slate-600 font-bold">{b.lab}</td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase ${
                        b.status === "Aktif" ? "bg-emerald-100 text-emerald-600" : 
                        b.status === "Menunggu" ? "bg-amber-100 text-amber-600" : 
                        b.status === "Ditolak" ? "bg-red-100 text-red-600" :
                        "bg-slate-100 text-slate-600"
                      }`}>
                        {b.status === "Menunggu" ? "Menunggu" : b.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <button 
                        onClick={() => {
                          setSelectedBorrower(b);
                          setIsVerifyModalOpen(true);
                        }}
                        className="px-4 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-[#E40082] transition-all flex items-center gap-2 mx-auto shadow-sm"
                      >
                        <InformationCircleIcon className="h-3.5 w-3.5" />
                        Check Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. Monitoring Lab */}
        <section>
          <div className="flex items-center gap-3 mb-6">
              <div className="w-1.5 h-6 bg-[#E40082] rounded-full" />
              <h3 className="text-slate-800 text-lg font-bold tracking-tight uppercase text-sm">Monitoring Laboratorium</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {labs.map((lab) => (
              <div key={lab.id} className="bg-white border border-slate-200 rounded-[2rem] p-7 shadow-sm flex flex-col hover:shadow-md transition-all group">
                <div className="flex justify-between items-start mb-5">
                  <div>
                    <h3 className="font-bold text-xl text-[#263C92]">{lab.name}</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">{lab.location}</p>
                  </div>
                  <span className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase border ${
                    lab.status === 'Tersedia' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                    lab.status === 'Digunakan' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                    'bg-red-50 text-red-600 border-red-100'
                  }`}>
                    {lab.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8 bg-slate-50 p-5 rounded-3xl border border-slate-100">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Operasional</p>
                    <p className="text-base font-bold text-slate-700">{lab.opStart} - {lab.opEnd}</p>
                  </div>
                  <div className="space-y-1 border-l border-slate-200 pl-5">
                    {lab.status === "Digunakan" ? (
                      <>
                        <p className="text-[10px] font-black text-[#E40082] uppercase tracking-widest">Sesi Berakhir</p>
                        <p className="text-base font-bold text-slate-700">{lab.useEnd}</p>
                      </>
                    ) : (
                      <>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kapasitas</p>
                        <p className="text-base font-bold text-slate-700">{lab.capacity} PC</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 mt-auto pt-4">
                  <button onClick={() => handleOpenModal(lab, "detail")} className="flex-1 py-3.5 text-slate-600 text-xs font-bold rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all uppercase flex items-center justify-center gap-2">
                    <InformationCircleIcon className="h-4 w-4" /> Detail
                  </button>
                  <button 
                    onClick={() => handleOpenModal(lab, "checkout")} 
                    disabled={lab.status !== "Digunakan"}
                    className={`flex-1 py-3.5 text-white text-xs font-bold rounded-2xl transition-all uppercase flex items-center justify-center gap-2 shadow-lg ${
                      lab.status === "Digunakan" ? "bg-[#263C92] hover:bg-[#1a2b6d]" : "bg-slate-300 cursor-not-allowed"
                    }`}
                  >
                    <CheckBadgeIcon className="h-4 w-4" /> Checkout
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* --- MODAL 1: CHECKOUT/DETAIL LAB --- */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden">
            <div className={`p-6 text-white text-center ${modalType === 'detail' ? 'bg-[#263C92]' : 'bg-[#E40082]'}`}>
              <h2 className="font-bold text-lg uppercase tracking-tight">{modalType === "detail" ? "Detail Lab" : "Checkout Checklist"}</h2>
              <p className="text-xs font-bold opacity-80 uppercase tracking-widest mt-1.5">{activeLab?.name}</p>
            </div>
            <div className="p-8">
              {modalType === "detail" ? (
                <div className="space-y-5">
                    <div className="p-5 bg-slate-50 rounded-[2rem] space-y-4 border border-slate-100 text-xs font-bold">
                       <div className="flex justify-between border-b pb-2"><span>Kapasitas</span><span>{activeLab?.capacity} PC</span></div>
                       <div className="flex justify-between border-b pb-2"><span>Lokasi</span><span>{activeLab?.location}</span></div>
                       <div className="flex justify-between"><span>Status</span><span className="text-[#E40082]">{activeLab?.status}</span></div>
                    </div>
                    <button onClick={() => setModalOpen(false)} className="w-full py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest">Tutup</button>
                </div>
              ) : (
                <div className="space-y-4">
                    <div className="bg-red-50 p-4 rounded-2xl flex gap-3 border border-red-100 mb-2">
                       <ShieldExclamationIcon className="h-5 w-5 text-red-500 shrink-0" />
                       <p className="text-[10px] font-bold text-red-600">Pelanggaran prosedur akan menyebabkan pemblokiran akun.</p>
                    </div>
                    {['clean', 'gear', 'noDamage'].map((key) => (
                      <label key={key} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer">
                        <input type="checkbox" checked={(checklist as any)[key]} onChange={(e) => setChecklist({...checklist, [key]: e.target.checked})} className="w-5 h-5 rounded text-[#E40082]" />
                        <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wide">
                         {key === 'clean' ? 'Meja & Lantai Bersih' : key === 'gear' ? 'PC & AC Sudah Mati' : 'Barang Utuh'}
                        </span>
                      </label>
                    ))}
                    <button 
                     onClick={() => handleAction(checklist.clean && checklist.gear && checklist.noDamage ? "normal" : "block")} 
                     className={`w-full py-4 rounded-2xl text-white font-black text-xs uppercase mt-2 shadow-lg ${checklist.clean && checklist.gear && checklist.noDamage ? 'bg-[#263C92]' : 'bg-red-600'}`}
                    >
                     {checklist.clean && checklist.gear && checklist.noDamage ? "Selesai" : "Blokir & Selesai"}
                    </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: VERIFIKASI IDENTITAS (PERBAIKAN BUTTON) --- */}
      {isVerifyModalOpen && selectedBorrower && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row">
            
            {/* Sisi Kiri: AI Analysis */}
            <div className="w-full md:w-5/12 bg-[#0F172A] p-10 flex flex-col items-center">
              <div className="relative mb-8 group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-pink-500 rounded-[2.2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedBorrower.name}`} 
                  className="relative w-40 h-40 rounded-[2rem] object-cover border-4 border-slate-800 bg-slate-100" 
                  alt="KTM Scan" 
                />
                <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-md text-[8px] font-black text-slate-900 uppercase shadow-xl">Live Scan</div>
              </div>

              <div className="w-full space-y-4">
                <div className="flex items-center gap-2 text-blue-400">
                  <CpuChipIcon className="h-4 w-4" />
                  <span className="text-[9px] font-black uppercase tracking-[0.3em]">Neural Analysis</span>
                </div>
                <div className="space-y-3 border-t border-slate-800 pt-5">
                  <div className="flex justify-between text-[10px]"><span className="text-slate-500 font-bold uppercase">Face Match</span><span className="text-emerald-400 font-black">99.8%</span></div>
                  <div className="flex justify-between text-[10px]"><span className="text-slate-500 font-bold uppercase">OCR Integrity</span><span className="text-emerald-400 font-black">Valid</span></div>
                  <div className="flex justify-between text-[10px]"><span className="text-slate-500 font-bold uppercase">KTM Status</span><span className="text-emerald-400 font-black">Active</span></div>
                </div>
              </div>
            </div>

            {/* Sisi Kanan: Detail & Perbaikan Actions */}
            <div className="flex-1 p-10 bg-white relative flex flex-col">
              <button onClick={() => setIsVerifyModalOpen(false)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-900 transition-colors">
                 <XMarkIcon className="w-6 h-6" />
              </button>

              <div className="mb-8">
                <span className="text-[#E40082] text-[10px] font-black uppercase tracking-[0.2em] mb-2 block">
                    Verifikasi Identitas {selectedBorrower.status !== "Menunggu" && `(${selectedBorrower.status})`}
                </span>
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{selectedBorrower.name}</h2>
                <div className="flex items-center gap-2 mt-3">
                  <span className="px-2 py-1 bg-slate-100 text-slate-700 text-[10px] font-black rounded uppercase tracking-wider">{selectedBorrower.nim}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedBorrower.kelas}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-1 tracking-tighter">Laboratorium</p>
                  <p className="text-xs font-bold text-slate-800">{selectedBorrower.lab}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-1 tracking-tighter">Gedung</p>
                  <p className="text-xs font-bold text-slate-800">{selectedBorrower.gedung}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 col-span-2">
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-1 tracking-tighter">Jam Penggunaan</p>
                  <p className="text-xs font-bold text-emerald-600 uppercase">14.00 - 17.00</p>
                </div>
              </div>

              {/* ACTION BUTTONS LOGIC */}
              <div className="flex gap-4 mt-auto">
                {selectedBorrower.status === "Menunggu" ? (
                  <>
                    <button 
                      onClick={() => handleVerifyStatus(selectedBorrower.id, "Ditolak")} 
                      className="flex-1 py-4 border-2 border-slate-100 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all"
                    >
                      Tolak
                    </button>
                    <button 
                      onClick={() => handleVerifyStatus(selectedBorrower.id, "Aktif")} 
                      className="flex-[2.5] py-4 bg-[#263C92] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] shadow-xl shadow-blue-900/20 hover:bg-[#1a2b6d] transition-all flex items-center justify-center gap-2"
                    >
                      <CheckBadgeIcon className="h-4 w-4" /> Izinkan Akses
                    </button>
                  </>
                ) : (
                  /* Jika Status Bukan Menunggu (Sudah Aktif/Ditolak/dll) */
                  <button 
                    onClick={() => setIsVerifyModalOpen(false)} 
                    className="w-full py-4 bg-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                  >
                    Tutup Detail
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}