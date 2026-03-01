"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ScanFace,
  QrCode,
  FileText,
  Clock,
  UserCheck,
  CheckCircle2,
  ShieldCheck,
  X,
  RefreshCcw,
  ChevronRight
} from "lucide-react";

export default function ScanLabPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [showExitModal, setShowExitModal] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const sessions = [
    { id: 1, lab: "Lab Multimedia 1", gedung: "CA", jam: "08:00 - 10:00", prodi: "Teknologi Digital", status: "tersedia" },
    { id: 2, lab: "Lab Jaringan", gedung: "CB", jam: "10:00 - 12:00", prodi: "Teknologi Digital", status: "tersedia" },
  ];

  const steps = [
    { id: 1, title: "Wajah", icon: <ScanFace className="w-4 h-4" /> },
    { id: 2, title: "KTM", icon: <QrCode className="w-4 h-4" /> },
    { id: 3, title: "S&K", icon: <FileText className="w-4 h-4" /> },
    { id: 4, title: "Sesi", icon: <Clock className="w-4 h-4" /> },
    { id: 5, title: "Validasi", icon: <UserCheck className="w-4 h-4" /> },
    { id: 6, title: "Selesai", icon: <CheckCircle2 className="w-4 h-4" /> },
  ];

  const startCamera = async () => {
    if (stream) stopCamera();
    try {
      const constraints = { video: { facingMode } };
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
    } catch (err) { console.error("Camera Error:", err); }
  };

  const stopCamera = () => { stream?.getTracks().forEach((track) => track.stop()); };
  const toggleCamera = () => { setFacingMode((prev) => (prev === "user" ? "environment" : "user")); };

  useEffect(() => {
    if (currentStep === 1 || currentStep === 2) {
      startCamera();
      const timer = setTimeout(() => { nextStep(); }, 3500);
      return () => { clearTimeout(timer); stopCamera(); };
    }
  }, [currentStep, facingMode]);

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 6));

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
              <p className="text-sm text-slate-500 leading-relaxed mb-8">Data verifikasi Anda tidak akan disimpan. Yakin ingin keluar?</p>
              <div className="flex flex-col gap-3">
                <button onClick={() => setShowExitModal(false)} className="w-full py-4 bg-[#263C92] text-white rounded-2xl font-bold text-sm shadow-lg active:scale-[0.98]">Lanjutkan Proses</button>
                <button onClick={() => (window.location.href = "/labvoks")} className="w-full py-4 bg-slate-50 text-slate-400 rounded-2xl font-bold text-sm hover:text-rose-500 transition-colors">Ya, Batalkan</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* HEADER */}
      <div className="flex justify-between items-center px-6 py-4 shrink-0">
        <button onClick={() => setShowExitModal(true)} className="p-2 bg-white border border-slate-100 rounded-xl shadow-sm hover:bg-slate-50 transition-colors"><X size={20} className="text-slate-400" /></button>
        <span className="text-[10px] font-bold text-[#263C92] tracking-widest uppercase bg-blue-50 px-3 py-1 rounded-full">Step {currentStep} of 6</span>
        <div className="w-10" />
      </div>

      <main className="flex-1 flex flex-col px-6 pb-6 overflow-hidden max-w-2xl mx-auto w-full">
        
        {/* STEPPER */}
        <div className="flex items-center justify-between mb-8 gap-1 px-1 shrink-0 overflow-x-auto no-scrollbar">
          {steps.map((s) => (
            <div key={s.id} className="flex flex-col items-center gap-2 min-w-[50px]">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${currentStep >= s.id ? "bg-[#263C92] text-white shadow-md shadow-blue-200" : "bg-white border border-slate-200 text-slate-300"}`}>
                {currentStep > s.id ? <CheckCircle2 size={16} /> : s.icon}
              </div>
              <span className={`text-[9px] font-bold uppercase transition-colors ${currentStep >= s.id ? "text-[#263C92]" : "text-slate-400"}`}>{s.title}</span>
            </div>
          ))}
        </div>

        <div className="flex-1 flex flex-col justify-center overflow-y-auto no-scrollbar">
          <AnimatePresence mode="wait">
            
            {/* STEP 1 & 2: SCANNER */}
            {(currentStep === 1 || currentStep === 2) && (
              <motion.div key="scan" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-6">
                <div className="text-center">
                  <h2 className="text-xl font-bold text-slate-900 mb-2">{currentStep === 1 ? "Verifikasi Biometrik" : "Scan KTM Digital"}</h2>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-[#263C92] rounded-full">
                    <span className="text-[10px] font-bold uppercase tracking-widest animate-pulse">Sistem ML Mendeteksi...</span>
                  </div>
                </div>
                
                <div className={`relative w-full transition-all duration-500 shadow-2xl ring-4 ring-white bg-slate-900 overflow-hidden
                  ${currentStep === 1 ? "max-w-[280px] aspect-[3/4] rounded-[60px]" : "max-w-[340px] aspect-[1.58/1] rounded-3xl"}`}>
                  
                  <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover ${facingMode === "user" ? "scale-x-[-1]" : ""}`} />
                  
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-6 md:p-10">
                    <div className={`w-full h-full border-2 border-dashed transition-all duration-500 relative
                      ${currentStep === 1 ? 'rounded-[80px] border-white/50' : 'rounded-2xl border-emerald-400/70'}`}>
                      
                      <motion.div 
                          animate={{ top: ["0%", "100%", "0%"] }} 
                          transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }} 
                          className={`absolute left-0 right-0 h-1 ${currentStep === 1 ? 'bg-[#263C92] shadow-[0_0_20px_#263C92]' : 'bg-emerald-400 shadow-[0_0_20px_#10b981]'}`} 
                      />
                    </div>
                  </div>
                  
                  <button onClick={toggleCamera} className="absolute bottom-4 right-4 p-3 bg-white/10 backdrop-blur-md rounded-xl text-white border border-white/20 hover:bg-white/20"><RefreshCcw size={16} /></button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: S&K (CARD TERTUTUP/COMPACT DENGAN ISI CODE 1) */}
            {currentStep === 3 && (
              <motion.div key="terms" className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm max-w-md mx-auto w-full">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2 bg-blue-50 text-[#263C92] rounded-xl"><ShieldCheck size={20} /></div>
                  <h2 className="text-lg font-bold">Peraturan & Sanksi</h2>
                </div>
                
                <div className="space-y-3 mb-6">
                  {[
                    { title: "Kebersihan", desc: "Dilarang keras membawa makanan & minuman ke dalam laboratorium.", color: "border-blue-100 bg-blue-50/30 text-blue-800" },
                    { title: "Tanggung Jawab", desc: "Dilarang merusak, mengubah, atau menghilangkan fasilitas laboratorium.", color: "border-slate-100 bg-slate-50/50 text-slate-700" },
                    { title: "Sanksi Berat", desc: "Pelanggaran berakibat pemblokiran KTM permanen pada sistem Labvoks.", color: "border-red-100 bg-red-50/50 text-red-700" },
                  ].map((item, i) => (
                    <div key={i} className={`p-3 rounded-2xl border ${item.color}`}>
                      <h4 className="text-[9px] font-bold uppercase mb-0.5 tracking-wider opacity-70">{item.title}</h4>
                      <p className="text-[12px] font-medium leading-snug">{item.desc}</p>
                    </div>
                  ))}
                </div>

                <label className="flex items-start gap-3 p-4 bg-slate-50/80 rounded-2xl cursor-pointer mb-6 border border-slate-100">
                  <input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} className="mt-0.5 w-4 h-4 rounded text-[#263C92]" />
                  <span className="text-[11px] font-semibold text-slate-600 leading-tight">Saya menyetujui seluruh aturan di atas dan bersedia menerima sanksi jika melanggar.</span>
                </label>

                <button disabled={!acceptedTerms} onClick={nextStep} className={`w-full py-4 rounded-2xl font-bold text-sm transition-all ${acceptedTerms ? "bg-[#263C92] text-white shadow-lg shadow-blue-900/10 active:scale-95" : "bg-slate-100 text-slate-300"}`}>Konfirmasi & Lanjutkan</button>
              </motion.div>
            )}

            {/* STEP 4: SESI */}
            {currentStep === 4 && (
              <motion.div key="session" className="max-w-xl mx-auto w-full space-y-6">
                <div className="text-center"><h2 className="text-xl font-bold text-slate-900">Pilih Sesi Penggunaan</h2></div>
                <div className="grid gap-4">
                  {sessions.map((sesi) => (
                    <button key={sesi.id} onClick={nextStep} className="group bg-white border border-slate-100 p-5 rounded-[24px] hover:border-[#263C92] transition-all flex flex-col gap-3 shadow-sm text-left active:scale-[0.98]">
                      <div className="flex justify-between w-full items-center">
                        <span className="bg-[#263C92]/5 text-[#263C92] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">{sesi.gedung}</span>
                        <span className="text-emerald-600 text-[9px] font-bold uppercase tracking-widest">{sesi.status}</span>
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-800 leading-tight">{sesi.lab}</h3>
                        <p className="text-xs text-slate-500 mt-1">{sesi.prodi}</p>
                      </div>
                      <div className="pt-3 border-t border-slate-50 flex items-center gap-2 text-[#263C92] font-bold text-sm">
                        <Clock size={14} className="text-[#E40082]" /> {sesi.jam}
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 5: VALIDASI */}
            {currentStep === 5 && (
              <motion.div key="validasi" className="text-center py-10 flex flex-col items-center">
                <div className="relative w-16 h-16 mb-6">
                  <div className="absolute inset-0 border-4 border-slate-100 rounded-full" />
                  <div className="absolute inset-0 border-4 border-t-[#263C92] rounded-full animate-spin" />
                </div>
                <h2 className="text-lg font-bold uppercase tracking-widest text-slate-800">Sinkronisasi Data ML</h2>
                <button onClick={nextStep} className="text-[10px] text-slate-300 font-bold uppercase mt-12 hover:text-[#263C92] transition-colors tracking-widest">[ Skip Validation ]</button>
              </motion.div>
            )}

            {/* STEP 6: HASIL */}
            {currentStep === 6 && (
              <motion.div key="success" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-sm mx-auto w-full">
                <div className="bg-[#263C92] rounded-[32px] overflow-hidden shadow-2xl text-white">
                  <div className="bg-[#E40082] py-2 text-center text-[10px] font-black uppercase tracking-[0.3em]">
                    Akses Berhasil
                  </div>
                  <div className="p-7">
                    <div className="flex items-center gap-4 pb-6 border-b border-white/10">
                      <div className="w-12 h-12 rounded-[18px] bg-white/10 flex items-center justify-center border border-white/20">
                        <ScanFace size={24} />
                      </div>
                      <div>
                        <h4 className="text-base font-bold">Bagas Aditya Pratama</h4>
                        <p className="text-[10px] opacity-60 font-medium">J3D121000 • Teknologi Digital</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="space-y-3">
                        <div>
                          <p className="text-[8px] opacity-40 uppercase font-bold tracking-widest mb-1">Ruangan</p>
                          <p className="text-[11px] font-bold">Lab Multimedia 1</p>
                        </div>
                        <div>
                          <p className="text-[8px] opacity-40 uppercase font-bold tracking-widest mb-1">Status</p>
                          <span className="text-white text-[10px] font-black">DIGUNAKAN</span>
                        </div>
                      </div>
                      <div className="space-y-3 text-right">
                        <div>
                          <p className="text-[8px] opacity-40 uppercase font-bold tracking-widest mb-1">Jam Penggunaan</p>
                          <p className="text-[11px] font-bold">08:00 - 10:00</p>
                        </div>
                        <div>
                          <p className="text-[8px] opacity-40 uppercase font-bold tracking-widest mb-1">Tanggal</p>
                          <p className="text-[11px] font-bold">28 Feb 2026</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => (window.location.href = "/labvoks")} 
                  className="w-full mt-8 py-4 bg-slate-900 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                >
                  Selesai & Keluar
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}