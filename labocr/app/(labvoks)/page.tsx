"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, easeInOut, Variants } from "framer-motion";
import {
  QrCode,
  Clock,
  ArrowRight,
  Users,
  FileText,
  AlertCircle,
  Info,
  ShieldCheck,
  ChevronRight,
  ScanFace,
  CheckCircle2,
} from "lucide-react";
import { getPublicJadwal, getPublicStatus, LabStatusResponse } from "@/lib/api";

// Animation variants
const containerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.2,
      duration: 0.8,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: easeInOut,
    },
  },
};

export default function Labvokshome() {
  const [labCards, setLabCards] = useState<Array<{ name: string; prodi: string; gedung: string; status: string; time: string }>>([]);
  const [loadingLabs, setLoadingLabs] = useState(true);
  const [labError, setLabError] = useState<string | null>(null);

  const getScheduleStatus = (s: { status?: string; lab: string }, labStatus: LabStatusResponse | null): string => {
    let baseStatus = s.status || "tersedia";

    const isLabUsed = labStatus?.peminjaman?.some(p => p.lab === s.lab && p.status === "aktif");
    const isLabWaiting = labStatus?.peminjaman_pending?.some(p => p.lab === s.lab && p.status === "menunggu");

    if (isLabUsed) return "digunakan";
    if (isLabWaiting) return "menunggu";

    return baseStatus as string;
  };

  useEffect(() => {
    Promise.all([getPublicJadwal(), getPublicStatus()])
      .then(([jadwalData, statusData]) => {
        const todayName = new Date().toLocaleDateString("id-ID", { weekday: "long" }).toLowerCase();

        // Filter jadwal hari ini dan urutkan berdasarkan jam mulai
        const todaySchedule = jadwalData
          .filter((s) => s.hari.toLowerCase() === todayName)
          .sort((a, b) => a.jamMulai.localeCompare(b.jamMulai));

        // Ambil maksimal 3 jadwal dengan lab yang berbeda
        const uniqueLabs = new Set<string>();
        const displayedSchedules = [];

        for (const s of todaySchedule) {
          if (!uniqueLabs.has(s.lab)) {
            uniqueLabs.add(s.lab);
            displayedSchedules.push(s);
            if (displayedSchedules.length === 3) break;
          }
        }

        setLabCards(
          displayedSchedules.map((s) => ({
            name: s.lab,
            prodi: s.prodi,
            gedung: s.gedung,
            status: getScheduleStatus(s, statusData).toLowerCase(),
            time: `${s.jamMulai} - ${s.jamSelesai}`,
          }))
        );
      })
      .catch((err) => {
        setLabError(err?.message || "Gagal memuat data lab");
      })
      .finally(() => setLoadingLabs(false));
  }, []);

  // UPDATE: ALUR 4 TAHAP
  const steps = [
    { title: "Scan KTM Digital", desc: "Pindai QR Code KTM Digital Anda.", icon: <QrCode className="w-5 h-5" /> },
    { title: "Verifikasi Wajah", desc: "Validasi identitas melalui biometrik wajah.", icon: <ScanFace className="w-5 h-5" /> },
    { title: "Syarat & Ketentuan", desc: "Persetujuan pakta integritas penggunaan lab.", icon: <FileText className="w-5 h-5" /> },
    { title: "Akses Berhasil", desc: "Selesai! Praktikum dapat dimulai.", icon: <CheckCircle2 className="w-5 h-5" /> },
  ];

  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev === steps.length - 1 ? 0 : prev + 1));
    }, 3000);
    return () => clearInterval(interval);
  }, [steps.length]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "digunakan": return "bg-rose-50 text-rose-600";
      case "menunggu": return "bg-amber-50 text-amber-600";
      case "tersedia": return "bg-emerald-50 text-emerald-600";
      default: return "bg-slate-50 text-slate-500";
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 relative antialiased">
      {/* ================= SECTION 1: HERO WITH DOUBLE WAVE ================= */}
      <section className="relative flex flex-col items-center justify-center pt-32 pb-20 px-6 text-center bg-gradient-to-br from-[#FFF0F7] via-[#F0F4FF] to-[#F5F8FF] overflow-hidden">

        <motion.div
          className="relative z-10 max-w-7xl mx-auto"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 bg-white border border-slate-200 px-5 py-2 rounded-full mb-6 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#263C92] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#263C92]"></span>
            </span>
            <span className="text-[10px] font-semibold text-[#263C92] uppercase tracking-widest">
              Sistem Informasi Laboratorium
            </span>
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-4xl md:text-5xl font-bold text-[#263C92] leading-tight mb-5 tracking-tight">
            Monitoring Lab <br />
            <span className="text-[#E40082] font-medium">Real-Time SV IPB</span>
          </motion.h1>

          <motion.p variants={itemVariants} className="text-slate-500 max-w-xl mx-auto text-[15px] md:text-[16px] font-normal leading-relaxed mb-10">
            Pantau penggunaan ruangan praktikum secara otomatis berdasarkan jadwal berjalan hari ini untuk mendukung efisiensi kegiatan belajar mengajar.
          </motion.p>
        </motion.div>

        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] z-0">
          <svg
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            className="relative block w-[calc(100%+1.3px)] h-[80px] fill-white"
          >
            <path d="M0,120 C200,100 400,0 600,60 C800,120 1000,20 1200,120 L1200,120 L0,120 Z" opacity="0.3" />
            <path d="M0,120 C150,110 350,30 600,80 C850,130 1050,40 1200,120 L1200,120 L0,120 Z" />
          </svg>
        </div>
      </section>

      {/* ================= SECTION 2: STATUS LAB ================= */}
      <section className="relative w-full bg-white pt-16 pb-12 border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            className="text-center mb-12 flex flex-col items-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-2 bg-[#FFF0F7] text-[#E40082] px-4 py-1.5 rounded-full border border-[#E40082]/20 mb-4 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E40082] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E40082]"></span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest">Real Time</span>
            </div>
            <h2 className="text-3xl font-bold text-[#263C92] tracking-tight mb-3">Status Laboratorium</h2>
            <p className="text-slate-500 text-sm font-medium">Kondisi ruangan pada sesi yang sedang berjalan saat ini.</p>
          </motion.div>

          <motion.div
            key={loadingLabs ? "loading" : "loaded"}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {loadingLabs && (
              <div className="col-span-full text-center text-slate-500 py-12">
                Memuat data jadwal...
              </div>
            )}

            {labError && (
              <div className="col-span-full text-center text-red-600 py-12">
                {labError}
              </div>
            )}

            {!loadingLabs && !labError && labCards.length === 0 && (
              <div className="col-span-full text-center text-slate-500 py-12">
                Tidak ada jadwal untuk hari ini.
              </div>
            )}

            {labCards.map((lab, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm h-full flex flex-col justify-between transition-all group overflow-hidden"
              >
                <div>
                  <div className="flex justify-between items-start mb-3 gap-1">
                    <span className="text-[9px] font-bold text-[#E40082] uppercase tracking-tighter bg-[#FFF0F7] px-2 py-0.5 rounded">
                      {lab.gedung}
                    </span>
                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${getStatusStyle(lab.status)}`}>
                      <span className="text-[8px] font-bold uppercase tracking-tighter">{lab.status}</span>
                    </div>
                  </div>
                  <h3 className="text-[15px] font-bold text-[#263C92] leading-tight mb-2 group-hover:text-[#E40082] transition-colors">{lab.name}</h3>
                  <div className="flex items-center gap-2 text-slate-400 mb-4">
                    <Users className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-medium truncate">{lab.prodi}</span>
                  </div>
                </div>
                <div className="mt-2 pt-4 border-t border-slate-50 flex items-center gap-2 text-[#263C92]">
                  <Clock className="w-3.5 h-3.5 text-[#E40082]" />
                  <span className="text-[12px] font-bold">{lab.time}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <div className="flex justify-center">
            <Link href="/jadwal" className="group flex items-center gap-2 text-[#263C92] font-bold text-sm hover:text-[#E40082] transition-colors">
              Lihat Jadwal Lengkap
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* ================= SECTION 3: CARA KERJA (ALUR DIPERBAIKI - 4 LANGKAH) ================= */}
      <section className="relative w-full py-20 px-6 overflow-hidden bg-[#F8FAFC]">
        <div className="absolute inset-0 z-0 opacity-[0.25] pointer-events-none" style={{ backgroundImage: `linear-gradient(#cbd5e1 0.5px, transparent 0.5px), linear-gradient(90deg, #cbd5e1 0.5px, transparent 0.5px)`, backgroundSize: "30px 30px" }} />

        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <div className="inline-flex items-center gap-2 bg-white text-[#E40082] px-4 py-1.5 rounded-full mb-6 border border-slate-200 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#263C92] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#263C92]"></span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest">Alur Prosedur</span>
            </div>
            <h2 className="text-3xl font-bold text-[#263C92] tracking-tight mb-4">Alur Penggunaan Lab</h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-sm font-medium leading-relaxed mb-16">
              Ikuti 4 tahapan berikut untuk mendapatkan akses masuk ke fasilitas laboratorium secara otomatis.
            </p>
          </motion.div>

          <div className="relative">
            {/* Progress Bar Line */}
            <div className="absolute top-10 left-[10%] right-[10%] h-[3px] bg-slate-200/50 rounded-full hidden md:block overflow-hidden">
              <motion.div
                className="h-full bg-[#E40082]"
                animate={{ width: `${(activeStep / (steps.length - 1)) * 100}%` }}
                transition={{ duration: 1, ease: "easeInOut" }}
              />
            </div>

            {/* Grid 4 Steps */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10 max-w-5xl mx-auto">
              {steps.map((step, index) => {
                const isActive = index === activeStep;
                return (
                  <motion.div
                    key={index}
                    className={`p-6 rounded-[2rem] transition-all duration-700 text-center border relative flex flex-col items-center ${isActive ? "bg-[#263C92] shadow-2xl scale-105 -translate-y-2 border-transparent text-white" : "bg-white/80 backdrop-blur-sm border-slate-100 shadow-sm"}`}
                  >
                    <div className={`w-12 h-12 mb-4 flex items-center justify-center rounded-2xl font-bold transition-all duration-500 ${isActive ? "bg-[#E40082] text-white rotate-12 shadow-lg shadow-pink-500/30" : "bg-slate-50 text-slate-400"}`}>
                      {isActive ? step.icon : index + 1}
                    </div>
                    <h3 className={`font-bold mb-2 text-[13px] leading-tight tracking-tight ${isActive ? "text-white" : "text-[#263C92]"}`}>{step.title}</h3>
                    <p className={`text-[10px] leading-relaxed font-medium ${isActive ? "text-white/80" : "text-slate-500"}`}>{step.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ================= SECTION 4: KETENTUAN PENTING ================= */}
      <section className="relative w-full py-24 md:py-32 bg-gradient-to-tr from-[#263C92]/5 via-white to-[#E40082]/5 overflow-hidden font-sans antialiased">
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <motion.div
            className="flex flex-col lg:flex-row items-start justify-between gap-16"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.div className="w-full lg:w-1/2" variants={itemVariants}>
              <div className="inline-flex items-center gap-2 bg-[#F0F4FF] text-[#263C92] px-5 py-2 rounded-full mb-8 border border-[#263C92]/10 shadow-sm">
                <Info className="w-4 h-4" />
                <span className="text-[11px] font-extrabold uppercase tracking-[0.2em]">Pusat Informasi</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-[#263C92] mb-8 leading-[1.1] tracking-tight">
                Ketentuan Penting <br />
                <span className="text-[#E40082] font-semibold">Layanan LabVoks</span>
              </h2>
              <div className="relative p-6 rounded-[32px] bg-amber-50 border border-red-200 flex items-start gap-5 overflow-hidden group shadow-sm">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-sm relative z-10 border border-red-100">
                  <AlertCircle className="w-7 h-7 text-red-600" />
                </div>
                <div className="relative z-10">
                  <h5 className="font-bold text-red-700 mb-1 text-[15px] uppercase tracking-wide">Peringatan Keras</h5>
                  <p className="text-[13px] text-red-800 leading-relaxed font-semibold tracking-tight">
                    Pelanggaran protokol dapat mengakibatkan penangguhan akun secara otomatis oleh sistem keamanan kami.
                  </p>
                </div>
              </div>
            </motion.div>

            <div className="w-full lg:w-1/2 flex flex-col gap-5">
              {[
                { title: "Window Waktu Presensi", desc: "Scan KTM digital hanya berlaku 15–30 menit sebelum sesi dimulai. Keterlambatan akan membatalkan sesi.", icon: <Clock className="w-6 h-6" />, bg: "bg-[#263C92]" },
                // { title: "Batas Reservasi Mandiri", desc: "Booking ruangan untuk riset atau tugas mandiri wajib diajukan H-1 untuk validasi admin.", icon: <Calendar className="w-6 h-6" />, bg: "bg-[#E40082]" },
                { title: "Komitmen Fasilitas", desc: "Setiap kerusakan sarana akibat kelalaian menjadi tanggung jawab penuh peminjam secara legal.", icon: <ShieldCheck className="w-6 h-6" />, bg: "bg-emerald-600" },
              ].map((card, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  whileHover={{ scale: 1.03, transition: { duration: 0.4, ease: "easeOut" } }}
                  className="group relative p-6 bg-white border border-slate-100 rounded-[32px] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-12px_rgba(38,60,146,0.12)] transition-all duration-300 flex items-center gap-6 cursor-pointer"
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 ${card.bg} text-white group-hover:rotate-6 shadow-lg shadow-black/5`}>
                    {card.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-[#263C92] text-md mb-1 flex items-center gap-2 tracking-tight">
                      {card.title}
                      <ChevronRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#E40082]" />
                    </h4>
                    <p className="text-[13px] text-slate-500 leading-relaxed font-medium group-hover:text-slate-700 transition-colors tracking-tight">{card.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}