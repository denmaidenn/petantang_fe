"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  ShieldCheck,
  UserCheck,
  Info,
  AlertCircle,
  Ban,
  CalendarDays,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Users,
  CalendarPlus,
  QrCode,
  Eye,
  X,
  User,
  LifeBuoy,
  Monitor,
  Coffee,
} from "lucide-react";

export default function MonitoringLabVokasi() {
  const [selectedGedung, setSelectedGedung] = useState("Semua Gedung");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeModal, setActiveModal] = useState<any>(null);

  // --- LOGIKA TANGGAL ---
  const getWeekDays = (date: Date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    const today = new Date(); // Referensi hari ini secara realtime

    const days = [];
    for (let i = 0; i < 6; i++) {
      const nextDay = new Date(startOfWeek);
      nextDay.setDate(startOfWeek.getDate() + i);

      // Cek apakah tanggal ini adalah hari ini
      const isToday = nextDay.toDateString() === today.toDateString();

      days.push({
        hari: nextDay.toLocaleDateString("id-ID", { weekday: "long" }),
        tgl: nextDay.toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
        }),
        isToday: isToday,
      });
    }
    return days;
  };

  const handlePrevWeek = () => {
    const prev = new Date(currentDate);
    prev.setDate(currentDate.getDate() - 7);
    setCurrentDate(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(currentDate);
    next.setDate(currentDate.getDate() + 7);
    setCurrentDate(next);
  };

  const hariKerja = getWeekDays(currentDate);
  const currentMonthYear = currentDate.toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });
  const rangeLabel = `${hariKerja[0].tgl.split(" ")[0]} - ${hariKerja[5].tgl} ${currentMonthYear}`;

  const jamKuliah = [
    { start: "07:00", end: "09:00" },
    { start: "09:00", end: "11:00" },
    { start: "11:00", end: "13:00" },
    { start: "13:00", end: "15:00" },
    { start: "15:00", end: "17:00" },
    { start: "17:00", end: "18:00" },
  ];

  // --- MOCK DATA ---
  const getDemoData = (row: number, col: number) => {
    const data: any = {
      "0-0": {
        status: "digunakan",
        lab: "Lab Multimedia 1",
        gedung: "Gedung CA",
        prodi: "Teknologi Digital",
        peminjam: "Bpk. Heru Subakti",
        durasi: 2,
      },
      "2-0": {
        status: "tersedia",
        lab: "Lab Pemrograman 2",
        gedung: "Gedung CA",
        prodi: "Sistem Informasi",
        peminjam: "Ibu Siti Aminah",
        durasi: 2,
      },
      "4-0": {
        status: "menunggu",
        lab: "Lab Jaringan",
        gedung: "Gedung CB",
        prodi: "Teknologi Digital",
        peminjam: "Bpk. Lukman",
        durasi: 1,
      },
      "0-1": {
        status: "tersedia",
        lab: "Lab Hardware",
        gedung: "Gedung CB",
        prodi: "Teknologi Digital",
        peminjam: "Tim Lab",
        durasi: 1,
      },
      "1-1": {
        status: "digunakan",
        lab: "Lab Desain Kreatif",
        gedung: "Gedung CA",
        prodi: "Komunikasi",
        peminjam: "Bpk. Rahmat",
        durasi: 3,
      },
      "4-1": {
        status: "maintenance",
        lab: "Lab Multimedia 2",
        gedung: "Gedung CA",
        prodi: "Fasilitas SV",
        peminjam: "Tim IT SV",
        durasi: 2,
      },
      "0-2": {
        status: "digunakan",
        lab: "Lab Jaringan",
        gedung: "Gedung CB",
        prodi: "Teknologi Digital",
        peminjam: "Bpk. Lukman",
        durasi: 2,
      },
      "2-2": {
        status: "tersedia",
        lab: "Lab Robotik",
        gedung: "Gedung CB",
        prodi: "Sistem Informasi",
        peminjam: "Bpk. Andi",
        durasi: 2,
      },
      "5-2": {
        status: "menunggu",
        lab: "Lab Software",
        gedung: "Gedung CA",
        prodi: "Teknologi Digital",
        peminjam: "Ibu Dian",
        durasi: 1,
      },
      "0-3": {
        status: "maintenance",
        lab: "Lab Hardware",
        gedung: "Gedung CB",
        prodi: "Sarana Prasarana",
        peminjam: "Teknisi",
        durasi: 1,
      },
      "1-3": {
        status: "digunakan",
        lab: "Lab Pemrograman 1",
        gedung: "Gedung CA",
        prodi: "Sistem Informasi",
        peminjam: "Bpk. Heru",
        durasi: 4,
      },
      "0-4": {
        status: "menunggu",
        lab: "Lab Desain",
        gedung: "Gedung CA",
        prodi: "Komunikasi",
        peminjam: "Ibu Maya",
        durasi: 3,
      },
      "3-4": {
        status: "digunakan",
        lab: "Lab Jaringan",
        gedung: "Gedung CB",
        prodi: "Teknologi Digital",
        peminjam: "Bpk. Lukman",
        durasi: 2,
      },
      "0-5": {
        status: "tersedia",
        lab: "Lab Open Source",
        gedung: "Gedung CA",
        prodi: "Teknologi Digital",
        peminjam: "Bpk. Farhan",
        durasi: 2,
      },
      "2-5": {
        status: "maintenance",
        lab: "Lab Multimedia 1",
        gedung: "Gedung CA",
        prodi: "Maintenance Rutin",
        peminjam: "Laboran",
        durasi: 1,
      },
    };
    return data[`${row}-${col}`];
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800 relative antialiased">
      {/* SECTION 1: HERO */}
      <section className="relative flex flex-col items-center justify-center pt-32 pb-40 px-6 text-center bg-gradient-to-br from-[#FFF0F7] via-[#F0F4FF] to-[#F5F8FF] overflow-hidden">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="relative z-10 max-w-7xl mx-auto"
        >
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 bg-white border border-slate-200 px-5 py-2 rounded-full mb-6 shadow-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#263C92] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#263C92]"></span>
            </span>
            <span className="text-[10px] font-semibold text-[#263C92] uppercase tracking-widest">
              Sistem Informasi Laboratorium
            </span>
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#263C92] leading-tight mb-5 tracking-tight">
            Jadwal Laboratorium <br />
            <span className="text-[#E40082] font-medium">
              Sekolah Vokasi IPB
            </span>
          </h1>
          <p className="text-slate-500 max-w-xl mx-auto text-[15px] md:text-[16px] font-normal leading-relaxed">
            Pantau ketersediaan ruangan praktikum secara otomatis dan real-time
            untuk mendukung efisiensi kegiatan belajar mengajar.
          </p>
        </motion.div>
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
          <svg
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            className="relative block w-[calc(100%+1.3px)] h-[80px] fill-white"
          >
            <path
              d="M0,120 C200,100 400,0 600,60 C800,120 1000,20 1200,120 L1200,120 L0,120 Z"
              opacity="0.3"
            />
            <path d="M0,120 C150,110 350,30 600,80 C850,130 1050,40 1200,120 L1200,120 L0,120 Z" />
          </svg>
        </div>
      </section>

      {/* SECTION 2: TATA TERTIB & OPERASIONAL */}
      <section className="py-20 bg-white overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="flex flex-col lg:flex-row gap-10 items-stretch"
          >
            {/* KIRI: TATA TERTIB */}
            <div className="w-full lg:w-3/5 flex flex-col">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 bg-[#FFF0F7] rounded-xl shadow-sm border border-pink-100">
                  <ShieldCheck className="w-6 h-6 text-[#E40082]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#263C92] tracking-tight">
                    Tata Tertib Penggunaan
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
                {[
                  {
                    icon: <UserCheck className="w-5 h-5" />,
                    title: "AKSES DAN KEHADIRAN",
                    desc: "Masuk sesuai jadwal atau booking. Wajib scan KTM dan tunggu verifikasi.",
                  },
                  {
                    icon: <Monitor className="w-5 h-5" />,
                    title: "PENGGUNAAN PERANGKAT",
                    desc: "Gunakan perangkat sesuai kebutuhan. Dilarang ubah sistem tanpa izin.",
                  },
                  {
                    icon: (
                      <div className="relative">
                        <Coffee className="w-5 h-5" />
                        <Ban className="w-3 h-3 text-red-500 absolute -top-1 -right-1 bg-white rounded-full" />
                      </div>
                    ),
                    title: "KETERTIBAN DAN KEBERSIHAN",
                    desc: "Jaga ketenangan dan kebersihan. Dilarang makan dan minum di dalam lab.",
                  },
                  {
                    icon: <LifeBuoy className="w-5 h-5" />,
                    title: "KEAMANAN DAN TANGGUNG JAWAB",
                    desc: "Segera laporkan kerusakan atau kendala kepada laboran.",
                  },
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ y: -5, borderColor: "#E40082" }}
                    className="p-5 rounded-[24px] border border-slate-100 bg-slate-50/30 flex flex-col gap-3 transition-all duration-300 group hover:bg-white hover:shadow-xl hover:shadow-pink-500/5"
                  >
                    <div className="p-2.5 w-fit rounded-xl bg-white shadow-sm text-slate-400 group-hover:text-[#E40082] transition-colors">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="text-[14px] font-bold text-[#263C92] mb-1">
                        {item.title}
                      </h4>
                      <p className="text-[13px] text-slate-500 font-medium leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* KANAN: OPERASIONAL */}
            <div className="w-full lg:w-2/5 flex flex-col">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 bg-[#F0F4FF] rounded-xl shadow-sm border border-blue-100">
                  <CalendarDays className="w-6 h-6 text-[#263C92]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#263C92] tracking-tight">
                    Jam Layanan
                  </h3>
                </div>
              </div>

              <motion.div className="flex-grow p-8 rounded-[32px] bg-[#263C92] text-white shadow-2xl relative overflow-hidden group">
                {/* Decorative Circles */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:bg-[#E40082]/10 transition-colors duration-700" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#E40082]/10 rounded-full blur-3xl" />

                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-10">
                      <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-200">
                          Active Status
                        </span>
                      </div>
                      <Clock className="w-6 h-6 text-blue-200 animate-pulse" />
                    </div>

                    <div className="space-y-6">
                      <div>
                        <p className="text-blue-200 text-[12px] font-bold uppercase tracking-widest mb-3">
                          Hari Operasional
                        </p>
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-bold tracking-tight">
                            Senin — Sabtu
                          </span>
                        </div>
                      </div>

                      <div className="w-full h-px bg-white/10" />

                      <div>
                        <p className="text-blue-200 text-[12px] font-bold uppercase tracking-widest mb-3">
                          Sesi Pelayanan
                        </p>
                        <div className="flex items-end gap-2">
                          <span className="text-4xl font-extrabold tracking-tighter">
                            07:00
                          </span>
                          <span className="text-xl font-medium text-blue-300 mb-1">
                            —
                          </span>
                          <span className="text-4xl font-extrabold tracking-tighter text-[#E40082]">
                            18:00
                          </span>
                          <span className="text-sm font-bold text-blue-200 ml-2 mb-2 italic">
                            WIB
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-12 flex items-center gap-3 p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/5">
                    <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
                    <p className="text-[11px] text-blue-100 font-medium leading-tight">
                      Lab ditutup pada hari Minggu dan hari libur nasional
                      sesuai kalender akademik IPB.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 3: MONITORING JADWAL */}
<section className="pt-12 pb-0 bg-[#F8FAFF]">
  <div className="w-full">
    {/* HEADER SECTION */}
    <div className="flex flex-col items-center text-center mb-10 px-4">
      <h2 className="text-3xl font-bold text-[#263C92] mb-2 tracking-tight">
        Monitoring Penggunaan Lab
      </h2>
      <p className="text-sm text-slate-500 font-normal tracking-wide mb-8">
        Update real-time jadwal penggunaan ruangan laboratorium.
      </p>

      {/* FILTER & NAVIGASI */}
      <div className="flex flex-wrap justify-center gap-4 w-full">
        <div className="relative">
          <select
            value={selectedGedung}
            onChange={(e) => setSelectedGedung(e.target.value)}
            className="bg-white border border-slate-200 rounded-2xl pl-11 pr-10 py-3 text-[12px] font-semibold text-[#263C92] outline-none shadow-sm appearance-none min-w-[200px] focus:ring-2 focus:ring-[#263C92]/10 transition-all"
          >
            <option>Semua Gedung</option>
            <option>Gedung CA</option>
            <option>Gedung CB</option>
          </select>
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#E40082]" />
        </div>

        <div className="flex items-center bg-white border border-slate-200 rounded-2xl p-1 shadow-sm">
          <button
            onClick={handlePrevWeek}
            className="p-2 hover:bg-slate-50 rounded-xl transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-[#263C92]" />
          </button>
          <span className="px-6 text-[11px] font-bold text-[#263C92] uppercase tracking-widest min-w-[150px] sm:min-w-[200px] text-center">
            {rangeLabel}
          </span>
          <button
            onClick={handleNextWeek}
            className="p-2 hover:bg-slate-50 rounded-xl transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-[#263C92]" />
          </button>
        </div>
      </div>
    </div>

    {/* TABLE CONTAINER - RESPONSIVE SCROLL */}
    <div className="bg-white rounded-t-[40px] border-t border-slate-100 overflow-hidden">
      <div className="overflow-x-auto scrollbar-hide pb-4">
        <table className="w-full min-w-[850px] table-fixed border-collapse">
          <thead>
            <tr className="bg-white border-b border-slate-100">
              <th className="w-20 sm:w-28 p-6 border-r border-slate-50 text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                Sesi
              </th>
              {hariKerja.map((h, i) => (
                <th
                  key={i}
                  className={`p-5 text-center transition-all duration-300 ${
                    h.isToday ? "bg-[#E40082]" : "bg-white"
                  }`}
                >
                  <span
                    className={`block text-[14px] font-bold uppercase mb-1 ${
                      h.isToday ? "text-white" : "text-[#263C92]"
                    }`}
                  >
                    {h.hari}
                  </span>
                  <span
                    className={`text-[10px] font-medium px-3 py-1 rounded-full ${
                      h.isToday
                        ? "bg-white/20 text-white"
                        : "text-slate-400 bg-slate-50"
                    }`}
                  >
                    {h.tgl}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {jamKuliah.map((j, idx) => (
              <tr key={idx}>
                <td className="p-6 border-r border-slate-50 bg-slate-50/20 text-center">
                  <div className="flex flex-col items-center">
                    <span className="text-[14px] font-bold text-[#263C92]">
                      {j.start}
                    </span>
                    <div className="w-4 h-[2px] bg-[#E40082] my-1 rounded-full"></div>
                    <span className="text-[12px] font-medium text-slate-400">
                      {j.end}
                    </span>
                  </div>
                </td>

                {hariKerja.map((hari, hIdx) => {
                  let isCovered = false;
                  for (let k = 1; k <= idx; k++) {
                    const prevData = getDemoData(idx - k, hIdx);
                    if (prevData && prevData.durasi > k) {
                      isCovered = true;
                      break;
                    }
                  }
                  if (isCovered) return null;

                  const data = getDemoData(idx, hIdx);
                  const rowSpan = data?.durasi || 1;

                  return (
                    <td
                      key={hIdx}
                      rowSpan={rowSpan}
                      className="p-2 sm:p-3 align-top border-r border-slate-50/50 h-56 sm:h-60"
                    >
                      {data ? (
                        /* CARD ISI (JADWAL) */
                        <motion.div
                          whileHover={{ y: -2 }}
                          className="bg-white border border-slate-100 rounded-2xl p-3 sm:p-4 shadow-sm h-full flex flex-col justify-between transition-all group relative overflow-hidden"
                        >
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-2 gap-1">
                              <span className="text-[8px] sm:text-[9px] font-bold text-[#E40082] uppercase tracking-tighter bg-[#FFF0F7] px-2 py-0.5 rounded truncate">
                                {data.gedung}
                              </span>
                              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full shrink-0 ${
                                data.status === "digunakan" ? "bg-rose-50 text-rose-600" : 
                                data.status === "menunggu" ? "bg-amber-50 text-amber-600" : 
                                "bg-emerald-50 text-emerald-600"
                              }`}>
                                <span className="text-[7px] sm:text-[8px] font-bold uppercase tracking-tighter">{data.status}</span>
                              </div>
                            </div>
                            <h4 className="text-[11px] sm:text-[13px] font-bold text-[#263C92] leading-tight mb-2 line-clamp-2">
                              {data.lab}
                            </h4>
                            <div className="flex items-center gap-2 text-slate-400">
                              <Users className="w-3 h-3 shrink-0" />
                              <span className="text-[10px] font-normal truncate">
                                {data.prodi}
                              </span>
                            </div>
                          </div>

                          <div className="mt-2 pt-3 border-t border-slate-50 flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-[#263C92]">
                              <Clock className="w-3 h-3 text-[#E40082] shrink-0" />
                              <span className="text-[10px] sm:text-[11px] font-bold">
                                {j.start} - {jamKuliah[idx + rowSpan - 1]?.end}
                              </span>
                            </div>
                            <button
                              onClick={() => setActiveModal({...data, waktu: `${j.start} - ${jamKuliah[idx + rowSpan - 1]?.end}`})}
                              className="w-full flex items-center justify-center gap-2 bg-[#263C92] sm:bg-slate-50 text-white sm:text-slate-600 py-2.5 sm:py-2 rounded-xl text-[10px] font-bold sm:font-semibold active:scale-95 transition-all"
                            >
                              <Eye className="w-3.5 h-3.5" /> Detail
                            </button>
                          </div>
                        </motion.div>
                      ) : (
                        /* CARD KOSONG (AVAILABLE) - PERBAIKAN TOMBOL AGAR TIDAK KELUAR */
                        <motion.div
                          whileHover={{ scale: 1.01, borderColor: "#263C92" }}
                          className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-3 sm:p-4 h-full flex flex-col justify-between transition-all group overflow-hidden"
                        >
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-tighter bg-slate-50 px-2 py-0.5 rounded">
                                Gedung CB
                              </span>
                              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-50 text-slate-400">
                                <span className="text-[7px] sm:text-[8px] font-bold uppercase tracking-tighter">Kosong</span>
                              </div>
                            </div>
                            <h4 className="text-[11px] sm:text-[13px] font-medium text-slate-400 leading-tight mb-2 italic">
                              Lab Terbuka
                            </h4>
                            <div className="flex items-center gap-2 text-slate-300">
                              <Users className="w-3 h-3 shrink-0" />
                              <span className="text-[9px] sm:text-[10px] font-normal italic">Belum Terjadwal</span>
                            </div>
                          </div>

                          <div className="mt-2 pt-3 border-t border-slate-50 flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-slate-300">
                              <Clock className="w-3 h-3 shrink-0" />
                              <span className="text-[10px] sm:text-[11px] font-semibold">{j.start} - {j.end}</span>
                            </div>
                            <button
                              onClick={() => (window.location.href = "/labvoks/booking")}
                              className="w-full flex items-center justify-center gap-2 bg-white border border-slate-200 text-[#263C92] py-2 sm:py-2.5 rounded-xl text-[10px] font-bold uppercase hover:bg-[#263C92] hover:text-white transition-all active:scale-95 shadow-sm"
                            >
                              <CalendarPlus className="w-3.5 h-3.5" /> Booking
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* LEGEND */}
      <div className="flex flex-wrap justify-center gap-x-10 gap-y-4 bg-white pt-8 pb-6 px-8 border-t border-slate-50">
        {[
          { label: "Digunakan", color: "bg-rose-500", desc: "Sedang dipakai" },
          { label: "Menunggu", color: "bg-amber-500", desc: "Verifikasi" },
          { label: "Tersedia", color: "bg-emerald-500", desc: "Siap Scan" },
          { label: "Maintenance", color: "bg-slate-400", desc: "Perbaikan" },
          { label: "Kosong", color: "border-2 border-dashed border-slate-300", desc: "Bisa Booking" },
        ].map((l, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className={`w-3 h-3 rounded-full shrink-0 ${l.color}`}></span>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-[#263C92] uppercase tracking-tighter leading-none">{l.label}</span>
              <span className="text-[9px] text-slate-400 font-normal">{l.desc}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
</section>
      {/* --- MODAL DETAIL --- */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[32px] w-full max-w-md p-8 shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="absolute top-6 right-6">
                <button
                  onClick={() => setActiveModal(null)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-bold text-[#E40082] bg-[#FFF0F7] px-3 py-1 rounded-full uppercase tracking-widest">
                    {activeModal.gedung}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest ${
                      activeModal.status === "digunakan"
                        ? "bg-rose-50 text-rose-600"
                        : activeModal.status === "menunggu"
                          ? "bg-amber-50 text-amber-600"
                          : activeModal.status === "tersedia"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {activeModal.status}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-[#263C92] leading-tight tracking-tight">
                  {activeModal.lab}
                </h3>
              </div>

              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-blue-50 rounded-xl text-[#263C92]">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                      Peminjam / Dosen
                    </p>
                    <p className="text-base font-semibold text-[#263C92]">
                      {activeModal.peminjam}
                    </p>
                    <p className="text-xs text-slate-500">
                      {activeModal.prodi}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-rose-50 rounded-xl text-[#E40082]">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                      Waktu Praktikum
                    </p>
                    <p className="text-base font-semibold text-[#263C92]">
                      {activeModal.waktu}{" "}
                      <span className="text-xs font-normal ml-1 text-slate-400">
                        WIB
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {activeModal.status === "tersedia" && (
                <button
                  onClick={() => (window.location.href = "/labvoks/scan")}
                  className="w-full mt-10 bg-[#263C92] text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-[#1a2b6d] transition-all shadow-lg shadow-blue-900/10"
                >
                  <QrCode className="w-5 h-5" /> Buka Scanner
                </button>
              )}

              {activeModal.status !== "tersedia" && (
                <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                  <Info className="w-4 h-4 text-slate-400" />
                  <p className="text-[11px] text-slate-500 font-normal">
                    {activeModal.status === "digunakan" &&
                      "Ruangan sedang digunakan. Scanner dinonaktifkan."}
                    {activeModal.status === "menunggu" &&
                      "Menunggu verifikasi admin. Lab dalam proses persiapan untuk digunakan."}
                    {activeModal.status === "maintenance" &&
                      "Ruangan dalam perbaikan. Akses masuk ditutup sementara."}
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
