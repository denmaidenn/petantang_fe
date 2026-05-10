"use client";

import React, { Suspense, useMemo } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  Coffee,
  MapPin,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

/** Tanggal lokal YYYY-MM-DD tanpa timezone UTC bug. */
function parseLocalDate(iso: string): Date | null {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso.trim())) return null;
  const [y, m, d] = iso.trim().split("-").map(Number);
  if (!y || m < 1 || m > 12 || d < 1 || d > 31) return null;
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

  const bookingDate = useMemo(() => parseLocalDate(tanggalParam || ""), [tanggalParam]);

  const todayStart = useMemo(() => startOfDay(new Date()), []);

  const validation = useMemo(() => {
    if (!tanggalParam?.trim()) {
      return {
        ok: false,
        message:
          "Booking harus dibuka dari halaman Jadwal dengan memilih sel tanggal dan slot waktu.",
      };
    }
    if (!bookingDate) {
      return { ok: false, message: "Parameter tanggal tidak valid." };
    }
    if (startOfDay(bookingDate) < todayStart) {
      return {
        ok: false,
        message: "Tanggal booking sudah lewat. Pilih sel jadwal pada hari mendatang dari halaman Jadwal.",
      };
    }
    return { ok: true as const, message: null };
  }, [tanggalParam, bookingDate, todayStart]);

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
        <div className="relative inline-block mb-6">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-lg shadow-blue-900/5 flex items-center justify-center text-[#263C92] border border-slate-100">
            <Coffee size={28} strokeWidth={1.5} />
          </div>
          <Sparkles className="absolute -top-1 -right-1 text-amber-400" size={18} />
        </div>

        <h1 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">
          Booking Laboratorium
        </h1>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          Booking hanya berlaku untuk <strong className="text-slate-700">tanggal yang sama</strong>{" "}
          dengan sel jadwal yang Anda pilih di halaman Jadwal (kolom hari/tanggal + slot waktu).
        </p>

        {!validation.ok ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 mb-6 flex gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-900 font-medium">{validation.message}</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 px-4 py-4 mb-6 space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-800">
              Jadwal booking terkunci
            </p>
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
                  <p className="text-xs font-semibold text-emerald-800">Rentang slot</p>
                  <p className="text-sm font-bold">
                    {slotStart || "—"} — {slotEnd || "—"} WIB
                  </p>
                </div>
              </div>
            )}
            {gedungParam && (
              <div className="flex items-start gap-3 text-emerald-950">
                <MapPin className="w-5 h-5 shrink-0 opacity-80" />
                <div>
                  <p className="text-xs font-semibold text-emerald-800">Gedung (filter)</p>
                  <p className="text-sm font-bold">{gedungParam}</p>
                </div>
              </div>
            )}
            <p className="text-[11px] text-emerald-900/90 leading-snug pt-1 border-t border-emerald-100 mt-2">
              Validasi: pengajuan booking Anda harus memakai tanggal ini — tidak boleh mengubah ke
              hari lain agar selaras dengan jadwal operasional lab.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Link
            href="/jadwal"
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#263C92] text-white rounded-2xl font-bold text-[11px] uppercase tracking-widest shadow-md hover:bg-[#1e2f73] transition-colors"
          >
            <CalendarDays size={16} />
            Kembali ke Jadwal
          </Link>
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

      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[100px] opacity-50 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-50 rounded-full blur-[100px] opacity-50 pointer-events-none" />
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center text-slate-500 text-sm">
          Memuat…
        </div>
      }
    >
      <BookingContent />
    </Suspense>
  );
}
