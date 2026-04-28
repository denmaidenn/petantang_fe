"use client";

import React, { useState, useEffect, useRef } from "react";
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
  CalendarDays
} from "lucide-react";

const ScanLabPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showExitModal, setShowExitModal] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const steps = [
    { id: 1, title: "KTM", icon: <QrCode className="w-3.5 h-3.5" /> },
    { id: 2, title: "Wajah", icon: <ScanFace className="w-3.5 h-3.5" /> },
    { id: 3, title: "S&K", icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 4, title: "Selesai", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  ];

  const startCamera = async () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    try {
      const constraints = { video: { facingMode: facingMode } };
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
    } catch (err) {
      console.error("Camera Error:", err);
    }
  };

  const toggleCamera = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  useEffect(() => {
    if (currentStep === 1 || currentStep === 2) {
      startCamera();
    } else {
      stream?.getTracks().forEach(track => track.stop());
    }
    return () => stream?.getTracks().forEach(track => track.stop());
  }, [currentStep, facingMode]);

  // Simulasi auto-next untuk scan (3.5 detik)
  useEffect(() => {
    if (currentStep === 1 || currentStep === 2) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  function nextStep(event: React.MouseEvent<HTMLButtonElement>): void {
    setCurrentStep(prev => prev + 1);
  }

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
                <button onClick={() => setShowExitModal(false)} className="w-full py-4 bg-[#263C92] text-white rounded-2xl font-bold text-sm shadow-lg">Lanjutkan</button>
                <button onClick={() => (window.location.href = "/")} className="w-full py-4 bg-slate-50 text-slate-400 rounded-2xl font-bold text-sm">Ya, Batalkan</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* HEADER & STEPPER (Dibuat lebih ringkas agar tidak makan tempat) */}
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

      {/* MAIN CONTENT AREA (Scrollable) */}
      <main className="flex-1 overflow-y-auto px-6 py-8 no-scrollbar">
        <div className="max-w-sm mx-auto w-full h-full flex flex-col justify-start italic-none">
          <AnimatePresence mode="wait">
            
            {/* SCANNING PHASE */}
            {(currentStep === 1 || currentStep === 2) && (
              <motion.div key="scan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
                <div className="text-center mb-8">
                  <h2 className="text-xl font-black text-slate-900 leading-tight">{currentStep === 1 ? "Scan KTM Digital" : "Verifikasi Wajah"}</h2>
                  <p className="text-xs text-slate-400 mt-1 font-medium">Posisikan pada area kotak tersedia</p>
                </div>
                
                <div className={`relative w-full shadow-2xl ring-8 ring-white bg-slate-900 overflow-hidden transition-all duration-500
                  ${currentStep === 2 ? "max-w-[260px] aspect-[3/4] rounded-[60px]" : "max-w-[320px] aspect-[1.58/1] rounded-[32px]"}`}>
                  
                  <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover ${facingMode === "user" ? "scale-x-[-1]" : ""}`} />
                  
                  {/* Overlay Scanner */}
                  <div className="absolute inset-0 flex items-center justify-center p-8">
                    <div className={`w-full h-full border-2 border-dashed border-white/30 relative ${currentStep === 2 ? 'rounded-[80px]' : 'rounded-2xl'}`}>
                        <motion.div animate={{ top: ["0%", "100%", "0%"] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="absolute left-0 right-0 h-0.5 bg-emerald-400 shadow-[0_0_15px_#10b981]" />
                    </div>
                  </div>

                  {/* Tombol Switch Kamera */}
                  <button onClick={toggleCamera} className="absolute bottom-4 right-4 p-3 bg-white/20 backdrop-blur-xl rounded-2xl text-white border border-white/20 active:scale-90 transition-transform">
                    <RefreshCcw size={18} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* S&K PHASE */}
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

            {/* SUCCESS PHASE */}
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
                        <h3 className="text-xl font-black text-slate-800 leading-none">Bagas Aditya Pratama</h3>
                        <p className="text-xs text-slate-400 font-bold mt-2">J3D121000 • Teknologi Digital</p>
                    </div>

                    <div className="grid grid-cols-2 gap-y-8 pt-6 border-t border-slate-50">
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest"><MapPin size={12} /> Ruangan</div>
                            <p className="text-sm font-black text-slate-700">Lab Multimedia 1</p>
                        </div>
                        <div className="space-y-1.5 text-right">
                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest justify-end"><Clock size={12} /> Waktu</div>
                            <p className="text-sm font-black text-slate-700">08:00 - 10:00</p>
                        </div>
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest"><CalendarDays size={12} /> Tanggal</div>
                            <p className="text-sm font-black text-slate-700">28 Feb 2026</p>
                        </div>
                        <div className="space-y-1.5 text-right">
                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest justify-end"><ShieldCheck size={12} /> Status</div>
                            <p className="text-[11px] font-black text-emerald-500 uppercase tracking-wider">Akses Aktif</p>
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