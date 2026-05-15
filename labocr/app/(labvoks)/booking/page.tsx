"use client";

import React, { Suspense, useMemo } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  MapPin,
  QrCode,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function parseLocalDate(iso: string): Date | null {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso.trim())) return null;
  const [y, m, d] = iso.trim().split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) return null;
  return dt;
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function BookingContent() {
  const searchParams = useSearchParams();

  const tanggalParam = searchParams.get("tanggal");
  const slotStart = searchParams.get("slotStart") || "";
  const slotEnd = searchParams.get("slotEnd") || "";
  const gedungParam = searchParams.get("gedung") || "";
  const labParam = searchParams.get("lab") || "";

  const bookingDate = useMemo(() => parseLocalDate(tanggalParam || ""), [tanggalParam]);
  const todayStart = useMemo(() => startOfDay(new Date()), []);

  const validation = useMemo(() => {
    if (!tanggalParam?.trim()) {
      return {
        ok: false,
        message: "Booking harus dibuka dari halaman Jadwal dengan memilih sel tanggal dan slot waktu.",
      };
    }
    if (!bookingDate) {
      return { ok: false, message: "Parameter tanggal tidak valid." };
    }
    if (!slotStart || !slotEnd || !gedungParam || !labParam) {
      return {
        ok: false,
        message: "Data jadwal belum lengkap. Pilih slot praktikum yang sudah terjadwal dari halaman Jadwal.",
      };
    }

    const bookingTime = startOfDay(bookingDate).getTime();
    const todayTime = todayStart.getTime();
    if (bookingTime < todayTime) {
      return { ok: false, message: "Tanggal booking sudah lewat. Booking hanya bisa dilakukan pada hari H." };
    }
    if (bookingTime > todayTime) {
      return { ok: false, message: "Booking belum bisa dibuka. Akses scan KTM hanya aktif pada hari H." };
    }
    return { ok: true as const, message: null };
  }, [tanggalParam, bookingDate, todayStart, slotStart, slotEnd, gedungParam, labParam]);

  const scanHref = useMemo(() => {
    const q = new URLSearchParams();
    if (tanggalParam) q.set("tanggal", tanggalParam);
    if (slotStart) q.set("slotStart", slotStart);
    if (slotEnd) q.set("slotEnd", slotEnd);
    if (gedungParam) q.set("gedung", gedungParam);
    if (labParam) q.set("lab", labParam);
    return `/scan?${q.toString()}`;
  }, [tanggalParam, slotStart, slotEnd, gedungParam, labParam]);

  const formattedTanggal =
    bookingDate &&
    bookingDate.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center font-sans text-slate-800 antialiased p-6 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-md relative z-10"
      >


        <h1 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Konfirmasi Jadwal</h1>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          Pastikan jadwal praktikum yang dipilih sudah sesuai sebelum melanjutkan ke scan KTM.
        </p>

        {!validation.ok ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 mb-6 flex gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-900 font-medium">{validation.message}</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 px-4 py-4 mb-6 space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-800">Jadwal dipilih</p>
            <div className="flex items-start gap-3 text-emerald-950">
              <CalendarDays className="w-5 h-5 shrink-0 opacity-80" />
              <div>
                <p className="text-xs font-semibold text-emerald-800">Tanggal</p>
                <p className="text-sm font-bold capitalize">{formattedTanggal}</p>
              </div>
            </div>
            {(slotStart || slotEnd) && (
              <div className="flex items-start gap-3 text-emerald-950">
                <Clock className="w-5 h-5 shrink-0 opacity-80" />
                <div>
                  <p className="text-xs font-semibold text-emerald-800">Rentang jam</p>
                  <p className="text-sm font-bold">{slotStart || "-"} - {slotEnd || "-"} WIB</p>
                </div>
              </div>
            )}
            <div className="grid gap-3 border-t border-emerald-100 pt-3 sm:grid-cols-2">
              <div className="rounded-xl border border-emerald-100 bg-white/70 p-3">
                <div className="flex items-center gap-2 text-emerald-800">
                  <MapPin className="h-4 w-4" />
                  <p className="text-xs font-semibold">Gedung</p>
                </div>
                <p className="mt-1 text-sm font-bold text-emerald-950">{gedungParam}</p>
              </div>
              <div className="rounded-xl border border-emerald-100 bg-white/70 p-3">
                <div className="flex items-center gap-2 text-emerald-800">
                  <QrCode className="h-4 w-4" />
                  <p className="text-xs font-semibold">Laboratorium</p>
                </div>
                <p className="mt-1 text-sm font-bold text-emerald-950">{labParam}</p>
              </div>
            </div>
            <p className="text-[11px] text-emerald-900/90 leading-snug pt-1 border-t border-emerald-100 mt-2">
              Data ini berasal dari slot jadwal yang dipilih dan akan dikirim ke proses scan KTM serta dashboard admin.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {validation.ok ? (
            <Link
              href={scanHref}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-[11px] uppercase tracking-widest shadow-md transition-colors bg-[#263C92] text-white hover:bg-[#1e2f73]"
            >
              <QrCode size={16} />
              Lanjut Scan KTM
            </Link>
          ) : (
            <Link
              href="/jadwal"
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#263C92] text-white rounded-2xl font-bold text-[11px] uppercase tracking-widest shadow-md hover:bg-[#1e2f73] transition-colors"
            >
              <CalendarDays size={16} />
              Kembali ke Jadwal
            </Link>
          )}
          <button
            type="button"
            onClick={() => window.history.back()}
            className="w-full flex items-center justify-center gap-3 py-3.5 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold text-[11px] uppercase tracking-widest shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all"
          >
            <ArrowLeft size={16} className="text-slate-400" />
            Halaman sebelumnya
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center text-slate-500 text-sm">Memuat...</div>}>
      <BookingContent />
    </Suspense>
  );
}
