"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ScanFace,
  QrCode,
  FileText,
  CheckCircle2,
  ShieldCheck,
  X,
  RefreshCcw,
  Clock,
  MapPin,
  CalendarDays,
  Loader2,
  AlertCircle,
  Camera,
} from "lucide-react";
import {
  scanKTM,
  enrollFace,
  verifyFace,
  captureFrameAsBase64,
  captureFrameAsBlob,
  getErrorMessage,
  type ScanResult,
  type FaceResponse,
  type ApiError,
} from "@/lib/api";

// ─── Types ───────────────────────────────────────────────
interface ScanData {
  nim: string;
  nama: string;
  db_nama: string;
  action_required: "face_enroll" | "face_verify" | null;
}

interface CheckinData {
  similarity?: number;
  waktu_masuk?: string;
  face_status?: string;
}

const ScanLabPage = () => {
  // ─── State ───────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState(1);
  const [showExitModal, setShowExitModal] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // API states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanData, setScanData] = useState<ScanData | null>(null);
  const [checkinData, setCheckinData] = useState<CheckinData | null>(null);

  const steps = [
    { id: 1, title: "KTM", icon: <QrCode className="w-3.5 h-3.5" /> },
    { id: 2, title: "Wajah", icon: <ScanFace className="w-3.5 h-3.5" /> },
    { id: 3, title: "S&K", icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 4, title: "Selesai", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  ];

  // ─── Camera Control ──────────────────────────────────
  const startCamera = useCallback(async () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    try {
      const constraints = { video: { facingMode: facingMode } };
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
    } catch (err) {
      console.error("Camera Error:", err);
      setError("Tidak dapat mengakses kamera. Pastikan izin kamera diberikan.");
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    stream?.getTracks().forEach((track) => track.stop());
    setStream(null);
  }, [stream]);

  const toggleCamera = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  useEffect(() => {
    if (currentStep === 1 || currentStep === 2) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [currentStep, facingMode]);

  // ─── API: Scan KTM ──────────────────────────────────
  const handleScanKTM = async () => {
    if (!videoRef.current) return;
    setIsLoading(true);
    setError(null);

    try {
      const blob = await captureFrameAsBlob(videoRef.current);
      const result: ScanResult = await scanKTM(blob);

      if (!result.db_verified || !result.nim_final) {
        setError("KTM tidak dikenali. Pastikan KTM terlihat jelas dan coba lagi.");
        setIsLoading(false);
        return;
      }

      // ── Cek sesi aktif sebelum lanjut ke face verify ─────
      // Terdeteksi dari backend melalui action_required
      if (result.action_required === "already_checked_in") {
        setError(result.db_message || `Anda sudah memiliki sesi aktif. Lakukan checkout terlebih dahulu.`);
        setIsLoading(false);
        return;
      }

      // Save scan data for next steps
      setScanData({
        nim: result.nim_final,
        nama: result.nama || result.db_nama || "",
        db_nama: result.db_nama || "",
        action_required: result.action_required,
      });

      // Move to step 2 (face verification)
      setCurrentStep(2);
    } catch (err) {
      const apiErr = err as ApiError;
      setError(getErrorMessage(apiErr));
    } finally {
      setIsLoading(false);
    }
  };

  // ─── API: Face Enroll / Verify ───────────────────────
  const handleFaceAction = async () => {
    if (!videoRef.current || !scanData) return;
    setIsLoading(true);
    setError(null);

    try {
      const base64 = captureFrameAsBase64(videoRef.current);
      let response: FaceResponse;

      if (scanData.action_required === "face_enroll") {
        response = await enrollFace(scanData.nim, scanData.db_nama, base64);
      } else {
        response = await verifyFace(scanData.nim, base64);
      }

      setCheckinData({
        similarity: response.similarity,
        waktu_masuk: response.checkin?.waktu_masuk,
        face_status: response.status,
      });

      // Move to step 3 (S&K)
      setCurrentStep(3);
    } catch (err) {
      const apiErr = err as ApiError;
      if (apiErr.status === 409 && scanData.action_required === "face_enroll") {
        // Face already enrolled → try verify instead
        setScanData({ ...scanData, action_required: "face_verify" });
        setError("Wajah sudah terdaftar. Tekan tombol untuk verifikasi ulang.");
      } else if (apiErr.status === 409 && scanData.action_required === "face_verify") {
        // Already checked in
        setError("Anda sudah berada di dalam lab (sesi peminjaman aktif). Silahkan check-out terlebih dahulu sebelum verifikasi lagi.");
      } else {
        setError(getErrorMessage(apiErr));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Step Navigation ─────────────────────────────────
  function nextStep() {
    setCurrentStep((prev) => prev + 1);
  }

  // ─── Formatted Date ──────────────────────────────────
  const now = new Date();
  const formattedDate = now.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const formattedTime = now.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="fixed inset-0 z-[9999] bg-[#F8FAFC] flex flex-col font-sans text-slate-800 antialiased overflow-hidden">

      {/* MODAL EXIT */}
      <AnimatePresence>
        {showExitModal && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center px-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowExitModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white w-full max-w-sm p-8 rounded-[32px] shadow-2xl text-center border border-slate-100">
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6"><X size={32} /></div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Batalkan Proses?</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-8">Yakin ingin keluar dari proses verifikasi?</p>
              <div className="flex flex-col gap-3">
                <button onClick={() => setShowExitModal(false)} className="w-full py-4 bg-[#263C92] text-white rounded-2xl font-bold text-sm shadow-lg hover:bg-[#1e2f75] transition-colors">Lanjutkan</button>
                <button onClick={() => (window.location.href = "/")} className="w-full py-4 bg-rose-50 text-rose-600 rounded-2xl font-bold text-sm hover:bg-rose-100 transition-colors">Ya, Batalkan</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* HEADER & STEPPER */}
      <header className="bg-white border-b border-slate-100 px-6 pt-4 pb-4 shrink-0 z-20">
        <div className="flex justify-between items-center mb-4">
          <button onClick={() => setShowExitModal(true)} className="p-2 bg-slate-50 rounded-xl text-slate-400"><X size={18} /></button>
          <span className="text-[10px] font-black text-[#263C92] uppercase tracking-[0.2em] bg-blue-50 px-3 py-1 rounded-full">Step {currentStep} / 4</span>
          <div className="w-10" />
        </div>

        <div className="flex items-center justify-between max-w-xs mx-auto">
          {steps.map((s) => (
            <div key={s.id} className="flex flex-col items-center gap-1.5">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-500 ${currentStep >= s.id ? "bg-[#263C92] text-white shadow-lg" : "bg-slate-100 text-slate-300"}`}>
                {currentStep > s.id ? <CheckCircle2 size={14} /> : s.icon}
              </div>
              <span className={`text-[8px] font-black uppercase tracking-tighter ${currentStep >= s.id ? "text-[#263C92]" : "text-slate-300"}`}>{s.title}</span>
            </div>
          ))}
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto px-6 py-8 no-scrollbar">
        <div className="max-w-sm mx-auto w-full h-full flex flex-col justify-start">
          <AnimatePresence mode="wait">

            {/* ══════════════════ STEP 1: SCAN KTM ══════════════════ */}
            {currentStep === 1 && (
              <motion.div key="scan-ktm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
                <div className="text-center mb-8">
                  <h2 className="text-xl font-black text-slate-900 leading-tight">Scan KTM Digital</h2>
                  <p className="text-xs text-slate-400 mt-1 font-medium">Arahkan KTM ke kamera lalu tekan tombol scan</p>
                </div>

                {/* Camera Preview */}
                <div className="relative w-full max-w-[320px] aspect-[1.58/1] shadow-2xl ring-8 ring-white bg-slate-900 overflow-hidden rounded-[32px] transition-all duration-500">
                  <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover ${facingMode === "user" ? "scale-x-[-1]" : ""}`} />
                  <div className="absolute inset-0 flex items-center justify-center p-8">
                    <div className="w-full h-full border-2 border-dashed border-white/30 relative rounded-2xl">
                      {!isLoading && (
                        <motion.div animate={{ top: ["0%", "100%", "0%"] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="absolute left-0 right-0 h-0.5 bg-emerald-400 shadow-[0_0_15px_#10b981]" />
                      )}
                    </div>
                  </div>
                  <button onClick={toggleCamera} className="absolute bottom-4 right-4 p-3 bg-white/20 backdrop-blur-xl rounded-2xl text-white border border-white/20 active:scale-90 transition-transform">
                    <RefreshCcw size={18} />
                  </button>
                </div>

                {/* Error Banner */}
                {error && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 w-full bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3">
                    <AlertCircle size={18} className="text-rose-500 shrink-0 mt-0.5" />
                    <p className="text-xs font-bold text-rose-600 leading-relaxed">{error}</p>
                  </motion.div>
                )}

                {/* Scan Button */}
                <button
                  onClick={handleScanKTM}
                  disabled={isLoading}
                  className={`mt-8 w-full max-w-[320px] py-5 rounded-[24px] font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${isLoading
                    ? "bg-slate-200 text-slate-400 cursor-wait"
                    : "bg-[#263C92] text-white shadow-xl shadow-blue-900/20 active:scale-95"
                    }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <Camera size={16} />
                      Scan KTM
                    </>
                  )}
                </button>
              </motion.div>
            )}

            {/* ══════════════════ STEP 2: FACE VERIFY ══════════════════ */}
            {currentStep === 2 && (
              <motion.div key="face-verify" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
                <div className="text-center mb-4">
                  <h2 className="text-xl font-black text-slate-900 leading-tight">
                    {scanData?.action_required === "face_enroll" ? "Daftarkan Wajah" : "Verifikasi Wajah"}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 font-medium">
                    {scanData?.action_required === "face_enroll"
                      ? "Wajah belum terdaftar. Hadapkan wajah ke kamera."
                      : "Pastikan wajah terlihat jelas di dalam bingkai"}
                  </p>
                </div>

                {/* Info Banner */}
                {scanData && (
                  <div className="w-full max-w-[300px] bg-blue-50 border border-blue-100 rounded-2xl p-3 mb-6 flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#263C92] rounded-xl flex items-center justify-center shrink-0">
                      <CheckCircle2 size={14} className="text-white" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-[#263C92] uppercase tracking-wider">KTM Terdeteksi</p>
                      <p className="text-xs font-bold text-slate-700">{scanData.db_nama} • {scanData.nim}</p>
                    </div>
                  </div>
                )}

                {/* Camera Preview - Portrait shape */}
                <div className="relative w-full max-w-[260px] aspect-[3/4] shadow-2xl ring-8 ring-white bg-slate-900 overflow-hidden rounded-[60px] transition-all duration-500">
                  <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover ${facingMode === "user" ? "scale-x-[-1]" : ""}`} />
                  <div className="absolute inset-0 flex items-center justify-center p-8">
                    <div className="w-full h-full border-2 border-dashed border-white/30 relative rounded-[80px]">
                      {!isLoading && (
                        <motion.div animate={{ top: ["0%", "100%", "0%"] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="absolute left-0 right-0 h-0.5 bg-emerald-400 shadow-[0_0_15px_#10b981]" />
                      )}
                    </div>
                  </div>
                  <button onClick={toggleCamera} className="absolute bottom-4 right-4 p-3 bg-white/20 backdrop-blur-xl rounded-2xl text-white border border-white/20 active:scale-90 transition-transform">
                    <RefreshCcw size={18} />
                  </button>
                </div>

                {/* Error Banner */}
                {error && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 w-full bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3">
                    <AlertCircle size={18} className="text-rose-500 shrink-0 mt-0.5" />
                    <p className="text-xs font-bold text-rose-600 leading-relaxed">{error}</p>
                  </motion.div>
                )}

                {/* Face Action Button */}
                <button
                  onClick={handleFaceAction}
                  disabled={isLoading}
                  className={`mt-8 w-full max-w-[300px] py-5 rounded-[24px] font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${isLoading
                    ? "bg-slate-200 text-slate-400 cursor-wait"
                    : "bg-[#263C92] text-white shadow-xl shadow-blue-900/20 active:scale-95"
                    }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      {scanData?.action_required === "face_enroll" ? "Mendaftarkan..." : "Memverifikasi..."}
                    </>
                  ) : (
                    <>
                      <ScanFace size={16} />
                      {scanData?.action_required === "face_enroll" ? "Daftarkan Wajah" : "Verifikasi Wajah"}
                    </>
                  )}
                </button>
              </motion.div>
            )}

            {/* ══════════════════ STEP 3: SYARAT & KETENTUAN ══════════════════ */}
            {currentStep === 3 && (
              <motion.div key="terms" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-7 rounded-[40px] border border-slate-100 shadow-sm w-full">
                <div className="text-center mb-8">
                  <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Syarat & Ketentuan</h2>
                  <p className="text-[10px] font-bold text-[#263C92] uppercase tracking-[0.2em]">Penggunaan Laboratorium</p>
                </div>

                <div className="space-y-4 mb-8">
                  {[
                    { title: "Kebersihan", desc: "Dilarang membawa makanan & minuman ke dalam lab.", color: "bg-blue-50/50 text-blue-700" },
                    { title: "Tanggung Jawab", desc: "Dilarang merusak atau memindahkan fasilitas lab.", color: "bg-slate-50 text-slate-600" },
                    { title: "Sanksi", desc: "Pelanggaran berakibat pemblokiran akses KTM.", color: "bg-rose-50/50 text-rose-700" },
                  ].map((item, i) => (
                    <div key={i} className={`p-4 rounded-2xl ${item.color}`}>
                      <h4 className="text-[9px] font-black uppercase mb-1 tracking-wider opacity-60">{item.title}</h4>
                      <p className="text-[12px] font-bold leading-tight">{item.desc}</p>
                    </div>
                  ))}
                </div>

                <label className="flex items-start gap-4 p-5 bg-slate-50 rounded-[24px] cursor-pointer mb-8 border border-slate-100">
                  <input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} className="mt-1 w-5 h-5 rounded-lg text-[#263C92] border-slate-200 focus:ring-0" />
                  <span className="text-[11px] font-bold text-slate-500 leading-snug">Saya menyetujui seluruh aturan dan bersedia menerima sanksi.</span>
                </label>

                <button disabled={!acceptedTerms} onClick={nextStep} className={`w-full py-5 rounded-[24px] font-black text-xs uppercase tracking-widest transition-all ${acceptedTerms ? "bg-[#263C92] text-white shadow-xl shadow-blue-900/20 active:scale-95" : "bg-slate-100 text-slate-300"}`}>Konfirmasi & Akses</button>
              </motion.div>
            )}

            {/* ══════════════════ STEP 4: SUCCESS ══════════════════ */}
            {currentStep === 4 && (
              <motion.div key="success" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full pb-10">
                <div className="bg-white rounded-[48px] overflow-hidden shadow-2xl border border-slate-100">
                  <div className="bg-[#263C92] p-10 text-center text-white relative">
                    <div className="w-20 h-20 bg-white/10 rounded-[32px] mx-auto mb-5 flex items-center justify-center border border-white/20">
                      <ScanFace size={44} strokeWidth={1.5} />
                    </div>
                    <h4 className="text-2xl font-black tracking-tight">Akses Berhasil</h4>
                    <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/40 mt-1">Identity Verified</p>
                  </div>

                  <div className="p-10 space-y-8">
                    <div>
                      <p className="text-[10px] font-black text-[#263C92] uppercase tracking-[0.2em] mb-1.5">Mahasiswa</p>
                      <h3 className="text-xl font-black text-slate-800 leading-none">
                        {scanData?.db_nama || scanData?.nama || "—"}
                      </h3>
                      <p className="text-xs text-slate-400 font-bold mt-2">
                        {scanData?.nim || "—"}
                        {checkinData?.similarity != null && ` • Kecocokan ${Math.round(checkinData.similarity * 100)}%`}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-y-8 pt-6 border-t border-slate-50">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest"><MapPin size={12} /> Ruangan</div>
                        <p className="text-sm font-black text-slate-700">Lab Multimedia 1</p>
                      </div>
                      <div className="space-y-1.5 text-right">
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest justify-end"><Clock size={12} /> Check-in</div>
                        <p className="text-sm font-black text-slate-700">
                          {checkinData?.waktu_masuk || formattedTime}
                        </p>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest"><CalendarDays size={12} /> Tanggal</div>
                        <p className="text-sm font-black text-slate-700">{formattedDate}</p>
                      </div>
                      <div className="space-y-1.5 text-right">
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest justify-end"><ShieldCheck size={12} /> Status</div>
                        <p className="text-[11px] font-black text-emerald-500 uppercase tracking-wider">
                          {checkinData?.face_status === "enrolled" ? "Terdaftar & Aktif" : "Akses Aktif"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <button onClick={() => (window.location.href = "/")} className="w-full mt-8 py-5 bg-slate-900 text-white rounded-[28px] font-black text-xs uppercase tracking-[0.3em] shadow-2xl active:scale-95 transition-all">Selesai & Keluar</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default ScanLabPage;