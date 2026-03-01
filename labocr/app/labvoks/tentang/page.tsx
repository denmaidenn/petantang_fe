"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  QrCode,
  Info,
  ShieldCheck,
  ChevronDown,
  HelpCircle,
  Mail,
  Instagram,
  CheckCircle2,
  FileText,
  UserCheck,
  Smartphone,
  MapPin,
  ScanFace,
  Clock,
  BellRing,
} from "lucide-react";

// 1. Definisikan Variants
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.8, ease: "easeOut" } 
  },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

export default function TentangPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: "Mengapa Face Recognition saya selalu gagal?",
      a: "Pastikan Anda berada di area dengan pencahayaan yang cukup dan tidak menggunakan aksesoris yang menutupi wajah seperti masker atau kacamata hitam yang sangat gelap saat proses pemindaian.",
    },
    {
      q: "Bagaimana jika KTM Digital saya tidak terbaca oleh scanner?",
      a: "Pastikan kecerahan layar HP Anda maksimal dan QR Code KTM tidak terpotong. Jika masih gagal, silakan hubungi admin di ruang teknisi untuk sinkronisasi ulang data akun Anda.",
    },
    {
      q: "Kapan pintu laboratorium akan dibukakan?",
      a: "Pintu akan dibukakan secara otomatis oleh sistem 10-15 menit sebelum jam jadwal praktikum Anda dimulai, pastikan Anda sudah menyelesaikan semua tahapan validasi.",
    },
    {
      q: "Apakah saya bisa membatalkan reservasi yang sudah dikonfirmasi?",
      a: "Bisa, namun harus dilakukan melalui dashboard akun Anda minimal 1 jam sebelum jadwal dimulai agar kuota ruangan dapat dialokasikan untuk mahasiswa lain.",
    },
    {
      q: "Apa sanksinya jika saya melanggar aturan penggunaan lab?",
      a: "Sistem akan mencatat setiap pelanggaran secara otomatis. Pelanggaran berulang dapat mengakibatkan penangguhan akun (pembekuan akses) selama periode tertentu.",
    },
  ];

  // DATA ATURAN YANG SUDAH DIPERBAIKI SESUAI REQUEST
  const rules = [
    { 
      title: "AKSES DAN KEHADIRAN", 
      desc: "Masuk sesuai jadwal atau booking. Wajib scan KTM dan tunggu verifikasi.", 
      icon: <UserCheck className="w-5 h-5" /> 
    },
    { 
      title: "PENGGUNAAN PERANGKAT", 
      desc: "Gunakan perangkat sesuai kebutuhan. Dilarang ubah sistem tanpa izin.", 
      icon: <Smartphone className="w-5 h-5" /> 
    },
    { 
      title: "KETERTIBAN DAN KEBERSIHAN", 
      desc: "Jaga ketenangan dan kebersihan. Dilarang makan dan minum di dalam lab.", 
      icon: <ShieldCheck className="w-5 h-5" /> 
    },
    { 
      title: "KEAMANAN DAN TANGGUNG JAWAB", 
      desc: "Segera laporkan kerusakan atau kendala kepada laboran.", 
      icon: <QrCode className="w-5 h-5" /> 
    },
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 antialiased">
      
      {/* ================= SECTION 1: HERO (FIXED) ================= */}
      <section className="relative pt-40 pb-20 px-6 text-center bg-gradient-to-br from-[#FFF0F7] via-[#F0F4FF] to-[#F5F8FF] overflow-hidden">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white border border-slate-200 px-4 py-1.5 rounded-full mb-6 shadow-sm">
            <Info className="w-4 h-4 text-[#263C92]" />
            <span className="text-[10px] font-bold text-[#263C92] uppercase tracking-[0.15em]">Sistem Informasi Laboratorium</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-[#263C92] leading-tight mb-6">
            Solusi Modern Manajemen <br />
            <span className="text-[#E40082]">Laboratorium Digital</span>
          </h1>

          <p className="text-slate-500 text-[14px] md:text-[16px] leading-relaxed max-w-2xl mx-auto mb-10">
            Platform terintegrasi SV IPB yang menggabungkan teknologi biometrik dan validasi digital 
            untuk memastikan akses fasilitas laboratorium yang aman, efisien, dan transparan bagi seluruh mahasiswa.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
            {[
              { label: "Update Real-Time", icon: <Smartphone /> },
              { label: "Akses Terverifikasi", icon: <ShieldCheck /> },
              { label: "Prosedur Terstandar", icon: <FileText /> },
              { label: "Deteksi Wajah", icon: <ScanFace /> },
            ].map((item, i) => (
              <div key={i} className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-white shadow-sm hover:shadow-md transition-shadow">
                <div className="text-[#E40082] mb-2 flex justify-center">{item.icon}</div>
                <span className="text-[10px] font-bold text-[#263C92] uppercase tracking-tighter">{item.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="absolute bottom-0 left-0 w-full leading-[0]">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[60px] fill-white">
            <path d="M0,120 C150,110 350,30 600,80 C850,130 1050,40 1200,120 L1200,120 L0,120 Z" />
          </svg>
        </div>
      </section>

      {/* ================= SECTION 2: ALUR & TATA TERTIB ================= */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} className="grid lg:grid-cols-2 gap-10 items-start">
            
            {/* Tata Cara (Visual Alur) */}
            <div className="lg:pr-5">
              <h2 className="text-2xl font-bold text-[#263C92] mb-10 flex items-center gap-3">
                <CheckCircle2 className="text-[#E40082]" /> Alur Penggunaan Lab
              </h2>
              <div className="relative space-y-0">
                <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-slate-100 md:block hidden" />
                {[
                  { title: "Verifikasi Wajah", desc: "Lakukan pemindaian wajah (Face Recognition) sebagai langkah keamanan biometrik utama.", icon: <ScanFace /> },
                  { title: "Scan KTM Digital", desc: "Tempelkan QR Code KTM Digital Anda pada perangkat scanner yang tersedia di pintu lab.", icon: <QrCode /> },
                  { title: "Persetujuan", desc: "Setujui pakta integritas dan tanggung jawab penggunaan sarana yang muncul di sistem.", icon: <FileText /> },
                  { title: "Pilih Sesi Praktikum", desc: "Pilih Laboratorium, Gedung, dan Jam sesi yang sesuai dengan jadwal terjadwal Anda.", icon: <Clock /> },
                  { title: "Validasi Admin", desc: "Data akan divalidasi secara sistematis dan dikonfirmasi oleh Admin/Laboran yang bertugas.", icon: <UserCheck /> },
                  { title: "Akses Berhasil", desc: "Notifikasi akan muncul dan pintu akan otomatis dapat dibuka 10-15 menit sebelum sesi dimulai.", icon: <BellRing /> },
                ].map((item, i) => (
                  <motion.div key={i} variants={fadeInUp} className="relative flex gap-6 pb-8 last:pb-0 group">
                    <div className="relative z-10 flex-shrink-0 w-10 h-10 rounded-full bg-white border-2 border-[#263C92] text-[#263C92] group-hover:bg-[#E40082] group-hover:border-[#E40082] group-hover:text-white flex items-center justify-center font-bold text-xs transition-all duration-300 shadow-sm">
                      {i + 1}
                    </div>
                    <div className="pt-1">
                      <h4 className="font-bold text-[#263C92] text-[13px] uppercase tracking-wide group-hover:text-[#E40082] transition-colors">{item.title}</h4>
                      <p className="text-slate-500 text-[12px] leading-relaxed mt-1">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* TATA TERTIB PENGGUNAAN (REVISI TEKS) */}
            <div className="bg-[#F8FAFF] p-8 md:p-10 rounded-[40px] border border-slate-100 sticky top-24 shadow-sm">
              <h2 className="text-2xl font-bold text-[#263C92] mb-6">Tata Tertib Penggunaan</h2>
              <div className="space-y-4">
                {rules.map((rule, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 bg-white rounded-2xl shadow-sm border border-slate-50 hover:border-[#E40082]/20 transition-all">
                    <div className="p-2 bg-[#FFF0F7] text-[#E40082] rounded-lg">{rule.icon}</div>
                    <div>
                      <h5 className="font-bold text-[#263C92] text-[12px] uppercase tracking-tight">{rule.title}</h5>
                      <p className="text-slate-500 text-[12px] leading-relaxed mt-1">{rule.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 p-5 bg-[#263C92] rounded-2xl flex gap-4 items-center">
                <ShieldCheck className="w-5 h-5 text-[#E40082] shrink-0" />
                <p className="text-[11px] text-blue-50 leading-relaxed font-medium">
                  Sanksi pembekuan akses permanen menanti bagi setiap penyalahgunaan fasilitas.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ================= SECTION 3: FAQ (JARAK RAPAT) ================= */}
      <section className="py-12 px-6 bg-[#F8FAFF]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-[#263C92] mb-2">Pertanyaan Populer</h2>
            <p className="text-slate-500 text-xs italic">Jawaban singkat untuk kendala teknis Anda.</p>
          </div>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <button onClick={() => setActiveFaq(activeFaq === i ? null : i)} className="w-full flex items-center justify-between p-4 text-left transition-all hover:bg-slate-50/50">
                  <span className="font-bold text-[#263C92] text-[13px] pr-4 flex items-center gap-3">
                    <HelpCircle className="w-4 h-4 text-[#E40082]" /> {faq.q}
                  </span>
                  <motion.div animate={{ rotate: activeFaq === i ? 180 : 0 }} transition={{ duration: 0.3 }}>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </motion.div>
                </button>
                <AnimatePresence initial={false}>
                  {activeFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}>
                      <div className="px-4 pb-4 text-slate-500 text-[12px] leading-relaxed border-t border-slate-50 pt-3 bg-slate-50/10">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= SECTION 4: KONTAK (NO WHATSAPP) ================= */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="bg-[#263C92] rounded-[40px] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-10 overflow-hidden relative shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#E40082]/10 rounded-full -mr-20 -mt-20 blur-3xl" />
            <div className="max-w-lg text-center md:text-left z-10">
              <h2 className="text-3xl font-bold text-white mb-4">Masih Ada Pertanyaan?</h2>
              <p className="text-blue-100/70 text-[13px] mb-8 leading-relaxed italic">
                Tim teknisi kami tersedia Senin-Jumat pukul 08:00 - 16:00 WIB. Silakan hubungi kanal resmi kami atau kunjungi helpdesk offline.
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <a href="mailto:admin.lab@apps.ipb.ac.id" className="flex items-center gap-3 bg-white/10 hover:bg-[#E40082] px-6 py-3 rounded-2xl transition-all border border-white/10 active:scale-95">
                  <Mail className="w-4 h-4 text-white" />
                  <span className="text-white font-bold text-[10px] uppercase tracking-widest">Email Resmi</span>
                </a>
                <a href="#" className="flex items-center gap-3 bg-white/10 hover:bg-[#E40082] px-6 py-3 rounded-2xl transition-all border border-white/10 active:scale-95">
                  <Instagram className="w-4 h-4 text-white" />
                  <span className="text-white font-bold text-[10px] uppercase tracking-widest">@sv.ipb</span>
                </a>
              </div>
            </div>
            <div className="bg-white p-7 rounded-3xl shadow-2xl w-full max-w-xs z-10 border border-white/20">
              <h4 className="text-[#263C92] font-bold text-sm mb-5 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#E40082]" /> Helpdesk Offline
              </h4>
              <div className="space-y-4">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="block text-[9px] font-black text-[#E40082] uppercase mb-0.5 tracking-wider">Gedung CA (Teknisi)</span>
                  <p className="text-[#263C92] text-[11px] font-semibold">Lt. 2 - Belakang Lab Hardware</p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="block text-[9px] font-black text-[#E40082] uppercase mb-0.5 tracking-wider">Gedung CB (Admin)</span>
                  <p className="text-[#263C92] text-[11px] font-semibold">Lt. 1 - Ruang Administrasi Utama</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}