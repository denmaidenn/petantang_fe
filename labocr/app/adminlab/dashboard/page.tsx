"use client";

import { useState, useEffect } from "react";
import { 
  ClockIcon, 
  ShieldExclamationIcon, 
  WrenchScrewdriverIcon,
  InformationCircleIcon,
  CheckBadgeIcon
} from "@heroicons/react/24/outline";

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
  time: string;
  name: string;
  nim: string;
  kelas: string;
  prodi: string;
  lab: string;
  status: "Aktif" | "Menunggu" | "Selesai";
}

export default function DashboardPage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const stats = [
    { title: "Total Laboratorium", value: "5", subtitle: "3 tersedia", color: "text-[#263C92]", iconBg: "bg-blue-50", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg> },
    { title: "Peminjaman Aktif", value: "2", subtitle: "Sedang berlangsung", color: "text-[#E40082]", iconBg: "bg-pink-50", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { title: "Menunggu Verifikasi", value: "1", subtitle: "Perlu verifikasi KTM", color: "text-[#263C92]", iconBg: "bg-slate-100", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg> },
    { title: "Peminjaman Hari Ini", value: "1", subtitle: "1 selesai", color: "text-[#E40082]", iconBg: "bg-pink-50", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg> },
  ];

  const [labs, setLabs] = useState<Lab[]>([
    { id: "1", name: "Lab Komputer 1", location: "Gedung Delta", capacity: 40, currentUsers: 35, status: "Digunakan", opStart: "07:00", opEnd: "18:00", useStart: "08:30", useEnd: "10:30" },
    { id: "2", name: "Lab Komputer 2", location: "Gedung Delta", capacity: 40, currentUsers: 28, status: "Pending", opStart: "07:00", opEnd: "18:00" },
    { id: "3", name: "Lab Multimedia", location: "Gedung Delta", capacity: 30, currentUsers: 0, status: "Tersedia", opStart: "07:00", opEnd: "18:00" },
    { id: "4", name: "Lab Pemrograman", location: "Gedung Epsilon", capacity: 25, currentUsers: 0, status: "Perbaikan", opStart: "07:00", opEnd: "18:00" },
  ]);

  const latestBorrowings: Borrowing[] = [
    { time: "14:35", name: "Ahmad Rizki Prasetyo", nim: "A24200123", kelas: "TI-4A", prodi: "Teknik Informatika", lab: "Lab Komputer 1", status: "Aktif" },
    { time: "14:28", name: "Siti Nurhaliza", nim: "A24200145", kelas: "TI-4B", prodi: "Teknik Informatika", lab: "Lab Multimedia", status: "Menunggu" },
    { time: "14:15", name: "Budi Santoso", nim: "A24200098", kelas: "TI-4C", prodi: "Teknik Informatika", lab: "Lab Pemrograman", status: "Aktif" },
  ];

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"detail" | "checkout">("detail");
  const [activeLab, setActiveLab] = useState<Lab | null>(null);
  const [checklist, setChecklist] = useState({ clean: false, gear: false, noDamage: false });

  const activeUser = latestBorrowings.find(b => b.lab === activeLab?.name && b.status === "Aktif");
  const isChecklistComplete = checklist.clean && checklist.gear && checklist.noDamage;

  const handleOpenModal = (lab: Lab, type: "detail" | "checkout") => {
    setActiveLab(lab);
    setModalType(type);
    setChecklist({ clean: false, gear: false, noDamage: false });
    setModalOpen(true);
  };

  const handleAction = (type: "normal" | "block") => {
    if (!activeLab) return;
    if (type === "block" && activeUser) {
      alert(`⚠️ KTM ${activeUser.nim} (${activeUser.name}) telah DIBLOKIR sementara.`);
    } else {
      alert(`✅ ${activeLab.name} berhasil diselesaikan.`);
    }
    setLabs(prev => prev.map(l => l.id === activeLab.id ? { ...l, status: "Tersedia", currentUsers: 0 } : l));
    setModalOpen(false);
  };

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] pb-12 font-sans antialiased">
      
      {/* HEADER - Diseragamkan dengan Kelola Lab */}
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

      {/* MAIN CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-6 space-y-8">
        
        {/* 1. Statistik Grid */}
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

        {/* 2. Kartu Status Lab */}
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
                        <p className="text-[10px] font-black text-[#E40082] uppercase tracking-widest">Waktu Sesi</p>
                        <p className="text-base font-bold text-slate-700">{lab.useStart} - {lab.useEnd}</p>
                      </>
                    ) : (
                      <>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kapasitas</p>
                        <p className="text-base font-bold text-slate-700">{lab.capacity} Unit PC</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 mt-auto pt-4">
                  <button 
                    onClick={() => handleOpenModal(lab, "detail")} 
                    className="flex-1 py-3.5 text-slate-600 text-xs font-bold rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all uppercase flex items-center justify-center gap-2"
                  >
                    <InformationCircleIcon className="h-4 w-4" /> Detail
                  </button>
                  <button 
                    onClick={() => handleOpenModal(lab, "checkout")} 
                    disabled={lab.status !== "Digunakan"}
                    className={`flex-1 py-3.5 text-white text-xs font-bold rounded-2xl transition-all uppercase flex items-center justify-center gap-2 shadow-lg shadow-blue-900/10 ${
                      lab.status === "Digunakan" ? "bg-[#263C92] hover:bg-[#1a2b6d]" : "bg-slate-300 cursor-not-allowed shadow-none"
                    }`}
                  >
                    <CheckBadgeIcon className="h-4 w-4" /> Checkout
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Tabel Peminjaman Terbaru */}
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
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {latestBorrowings.map((b, i) => (
                  <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-8 py-5 text-slate-500 font-bold">{b.time}</td>
                    <td className="px-8 py-5">
                      <p className="font-bold text-slate-800 text-sm">{b.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{b.nim}</p>
                    </td>
                    <td className="px-8 py-5 text-slate-600 font-bold">{b.lab}</td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase ${
                        b.status === "Aktif" ? "bg-[#263C92]/10 text-[#263C92]" : "bg-amber-50 text-amber-600"
                      }`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* --- MODAL --- */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            
            <div className={`p-6 text-white text-center ${modalType === 'detail' ? 'bg-[#263C92]' : 'bg-[#E40082]'}`}>
              <h2 className="font-bold text-lg uppercase tracking-tight">{modalType === "detail" ? "Detail Peminjam" : "Checkout Checklist"}</h2>
              <p className="text-xs font-bold opacity-80 uppercase tracking-widest mt-1.5">{activeLab?.name}</p>
            </div>

            <div className="p-8">
              {modalType === "detail" ? (
                <div className="space-y-5">
                  <div className="p-5 bg-slate-50 rounded-[2rem] space-y-4 border border-slate-100">
                    {activeUser ? (
                      <>
                        <div className="flex justify-between border-b border-slate-200 pb-3"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama</span><span className="text-xs font-bold text-slate-800">{activeUser.name}</span></div>
                        <div className="flex justify-between border-b border-slate-200 pb-3"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">NIM</span><span className="text-xs font-bold text-[#263C92]">{activeUser.nim}</span></div>
                        <div className="flex justify-between border-b border-slate-200 pb-3"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kelas</span><span className="text-xs font-bold text-slate-800">{activeUser.kelas}</span></div>
                        <div className="flex justify-between"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Masuk</span><span className="text-xs font-bold text-[#E40082]">{activeUser.time}</span></div>
                      </>
                    ) : (
                      <p className="text-center text-sm text-slate-400 italic py-6 uppercase font-bold text-[10px]">Tidak ada peminjaman aktif.</p>
                    )}
                  </div>
                  <button onClick={() => setModalOpen(false)} className="w-full py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase hover:bg-slate-200 transition-all tracking-widest">Tutup</button>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex gap-3">
                    <ShieldExclamationIcon className="h-6 w-6 text-red-500 shrink-0" />
                    <p className="text-[11px] font-bold text-red-600 leading-snug">Kelalaian checklist akan mengakibatkan pemblokiran KTM otomatis.</p>
                  </div>
                  
                  <div className="space-y-3">
                    {[
                      { key: 'clean', label: 'Meja & Lantai Bersih' },
                      { key: 'gear', label: 'PC & AC Sudah Mati' },
                      { key: 'noDamage', label: 'Barang Lengkap & Utuh' }
                    ].map((item) => (
                      <label key={item.key} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl cursor-pointer border border-slate-100 hover:border-pink-200 transition-all group">
                        <input 
                          type="checkbox" 
                          className="w-5 h-5 rounded-lg border-slate-300 text-[#E40082] focus:ring-[#E40082] transition-all" 
                          checked={(checklist as any)[item.key]} 
                          onChange={(e) => setChecklist({...checklist, [item.key]: e.target.checked})} 
                        />
                        <span className="text-sm font-bold text-slate-700 uppercase text-[11px] tracking-wide">{item.label}</span>
                      </label>
                    ))}
                  </div>

                  <div className="flex flex-col gap-3 pt-3">
                    <button 
                      onClick={() => handleAction(isChecklistComplete ? "normal" : "block")}
                      className={`w-full py-4 rounded-2xl text-white font-black text-xs uppercase transition-all tracking-widest shadow-lg ${isChecklistComplete ? 'bg-[#263C92] shadow-blue-900/20' : 'bg-red-600 shadow-red-900/20'}`}
                    >
                      {isChecklistComplete ? "Selesaikan Peminjaman" : "Blokir & Selesaikan"}
                    </button>
                    <button onClick={() => setModalOpen(false)} className="w-full py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Batal</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}