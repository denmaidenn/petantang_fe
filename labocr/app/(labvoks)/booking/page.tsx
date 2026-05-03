"use client";

import React from "react";
import { motion } from "framer-motion";
import { Coffee, Sparkles, ArrowLeft } from "lucide-react";

const BookingPage = () => {
  return (
    <div className="fixed inset-0 z-[9999] bg-[#F8FAFC] flex flex-col items-center justify-center font-sans text-slate-800 antialiased p-8">
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center relative z-10 w-full max-w-sm"
      >
        <div className="relative inline-block mb-8">
          <div className="w-20 h-20 bg-white rounded-3xl shadow-xl shadow-blue-900/5 flex items-center justify-center text-[#263C92] border border-slate-100">
            <Coffee size={32} strokeWidth={1.5} />
          </div>
          <Sparkles className="absolute -top-2 -right-2 text-amber-400 animate-pulse" size={20} />
        </div>

        <h1 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Halaman Booking</h1>
        <p className="text-sm text-slate-500 italic mb-8">JUJUURRR, alurnya belom tau gimana eheh. fokus ke yang biasa dlu aja kalo ngga, yang ini nyusul</p>
        
        <div className="mb-12">
          <span className="text-[10px] font-bold text-[#263C92] uppercase tracking-[0.2em] bg-blue-50 px-4 py-2 rounded-full border border-blue-100/50">
            Pemberitahuan Sementara
          </span>
        </div>

        {/* TOMBOL KEMBALI YANG KELIHATAN JELAS */}
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => window.history.back()}
          className="w-full flex items-center justify-center gap-3 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold text-[11px] uppercase tracking-widest shadow-sm hover:bg-slate-50 hover:border-slate-300 hover:text-[#263C92] transition-all group"
        >
          <ArrowLeft size={16} className="text-slate-400 group-hover:text-[#263C92] transition-colors" />
          Kembali ke Beranda
        </motion.button>

      </motion.div>

      {/* Dekorasi BG */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[100px] opacity-50 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-50 rounded-full blur-[100px] opacity-50 pointer-events-none" />
    </div>
  );
};

export default BookingPage;