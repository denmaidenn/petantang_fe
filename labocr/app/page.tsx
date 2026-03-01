"use client";

import Link from "next/link";
import { 
  QrCode, 
  Calendar, 
  Monitor, 
  Cpu, 
  Network, 
  Info, 
  ArrowRight,
  ShieldCheck,
  Timer,
  CheckCircle2,
  ChevronRight,
  Upload,
  Search
} from "lucide-react";

export default function LabvoksHome() {
  const labs = [
    {
      name: "Lab Multimedia",
      status: "Available",
      time: null,
      icon: <Monitor className="w-5 h-5" />,
      desc: "Produksi konten visual & editing video."
    },
    {
      name: "Lab Programming",
      status: "Use",
      time: "08:00 - 10:00",
      icon: <Cpu className="w-5 h-5" />,
      desc: "Pengembangan software & basis data."
    },
    {
      name: "Lab Networking",
      status: "Pending",
      time: null,
      icon: <Network className="w-5 h-5" />,
      desc: "Konfigurasi jaringan & mikrotik."
    },
  ];

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Available": return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "Use": return "bg-rose-50 text-rose-600 border-rose-100";
      case "Pending": return "bg-amber-50 text-amber-600 border-amber-100";
      default: return "bg-slate-50 text-slate-500 border-slate-100";
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 relative">
      {/* BACKGROUND: Grid Pattern Elegan */}
      <div className="absolute inset-0 z-0 opacity-[0.4] pointer-events-none" 
           style={{ 
             backgroundImage: `linear-gradient(#e2e8f0 1.2px, transparent 1.2px), linear-gradient(90deg, #e2e8f0 1.2px, transparent 1.2px)`, 
             backgroundSize: '40px 40px' 
           }} />

      <div className="relative z-10 space-y-16 pb-20">
        
        {/* ================= HERO SECTION ================= */}
        <section className="relative flex flex-col items-center justify-center pt-12 pb-16 px-6 text-center">
          {/* Badge Portal */}
          <div className="inline-flex items-center gap-2 bg-white border border-slate-200 px-4 py-1.5 rounded-full mb-6 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[#E40082]" />
            <span className="text-[10px] font-bold text-[#263C92] uppercase tracking-[0.15em]">
              Sistem Informasi Laboratorium
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-[#263C92] leading-tight tracking-tight mb-5">
            Monitoring Lab <br />
            <span className="text-[#E40082] font-semibold">Real-Time SV IPB</span>
          </h1>

          <p className="text-slate-500 max-w-xl mx-auto text-[15px] font-normal leading-relaxed mb-10">
            Akses fasilitas laboratorium Sekolah Vokasi dalam satu genggaman. 
            Pantau ketersediaan, cek jadwal, dan scan digital KTM Anda dengan praktis.
          </p>

          {/* Buttons dengan Animasi Halus */}
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/mahasiswa/scan"
              className="group flex items-center justify-center gap-2 px-8 py-3.5 bg-[#E40082] text-white rounded-xl font-bold text-sm shadow-lg shadow-pink-100 hover:bg-[#c40070] hover:scale-[1.02] active:scale-95 transition-all duration-200"
            >
              <QrCode className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
              Scan KTM Digital
            </Link>

            <Link
              href="/mahasiswa/jadwal"
              className="flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-[#263C92] border border-slate-200 rounded-xl font-bold text-sm hover:bg-slate-50 hover:border-[#263C92] hover:scale-[1.02] active:scale-95 transition-all duration-200 shadow-sm"
            >
              <Calendar className="w-4 h-4 text-slate-400" />
              Lihat Jadwal Lab
            </Link>
          </div>
        </section>

        {/* ================= ALUR PENGGUNAAN (4 LANGKAH HORIZONTAL) ================= */}
        <section className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-[#263C92] mb-3">4 Langkah Mudah</h2>
            <p className="text-slate-500 text-sm font-normal">Prosedur simpel peminjaman laboratorium praktikum.</p>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Garis penghubung tipis (Desktop) */}
            <div className="absolute top-[35%] left-[10%] right-[10%] h-[1px] bg-slate-200 hidden lg:block -z-0" />

            {[
              { step: "01", title: "Upload KTM", icon: <Upload className="w-5 h-5" />, desc: "Unggah foto KTM aktif Anda melalui portal sistem." },
              { step: "02", title: "Proses OCR", icon: <Search className="w-5 h-5" />, desc: "Sistem membaca data identitas Anda secara otomatis." },
              { step: "03", title: "Verifikasi", icon: <ShieldCheck className="w-5 h-5" />, desc: "Validasi data dengan database untuk akses lab." },
              { step: "04", title: "Booking Lab", icon: <Calendar className="w-5 h-5" />, desc: "Pilih ruangan dan jadwal praktikum yang tersedia." }
            ].map((item, i) => (
              <div key={i} className="relative group z-10">
                <div className="absolute -top-3 -right-2 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-[10px] shadow-md group-hover:bg-[#E40082] transition-colors">
                  {item.step}
                </div>
                <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all h-full">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                    {item.icon}
                  </div>
                  <h3 className="font-semibold text-[#263C92] text-lg mb-2">{item.title}</h3>
                  <p className="text-[13px] text-slate-500 font-normal leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ================= STATUS LAB ================= */}
        <section className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between mb-8 border-l-4 border-[#E40082] pl-6">
            <div>
              <h2 className="text-xl font-bold text-[#263C92]">Ketersediaan Ruangan</h2>
              <p className="text-xs text-slate-400 mt-1 font-normal">Status lab saat ini.</p>
            </div>
            <Link href="/mahasiswa/jadwal" className="group text-xs font-bold text-slate-400 hover:text-[#263C92] flex items-center gap-1 transition-all">
              Semua Jadwal <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {labs.map((lab, index) => (
              <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 p-6 hover:shadow-md hover:border-[#E40082]/20 transition-all duration-300 group">
                <div className="flex justify-between items-center mb-6">
                  <div className="p-3 bg-slate-50 rounded-xl text-[#263C92] group-hover:bg-[#263C92] group-hover:text-white transition-colors duration-300">
                    {lab.icon}
                  </div>
                  <span className={`px-3 py-1 text-[10px] rounded-lg font-bold uppercase tracking-wider border ${getStatusStyle(lab.status)}`}>
                    {lab.status}
                  </span>
                </div>
                <h3 className="font-semibold text-[#263C92] mb-1">{lab.name}</h3>
                <p className="text-[12px] text-slate-400 font-normal leading-relaxed mb-6">{lab.desc}</p>
                <div className="flex items-center gap-2 text-slate-500 pt-4 border-t border-slate-50">
                  <Timer className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-medium">{lab.time || "Open Access"}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ================= INFO PANEL ================= */}
        <section className="max-w-6xl mx-auto px-6 py-12 mb-10">
          <div className="bg-white rounded-3xl border border-slate-100 p-8 flex flex-col md:flex-row items-center gap-8 shadow-sm">
            <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center shrink-0">
              <Info className="w-8 h-8 text-amber-500" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-[#263C92] mb-4">Kebijakan Sistem</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  "Scan KTM wajib sebelum masuk area lab.",
                  "Booking maksimal dilakukan H-1 jadwal.",
                  "Dilarang merusak inventaris laboratorium.",
                  "Wajib menjaga kebersihan dan kerapihan."
                ].map((info, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-slate-600 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                    <ShieldCheck className="w-4 h-4 text-[#E40082]" />
                    <span className="text-[12px] font-normal">{info}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}