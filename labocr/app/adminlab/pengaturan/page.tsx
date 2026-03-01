"use client";

import { useState } from "react";
import { 
  UserIcon, 
  CameraIcon, 
  LockClosedIcon, 
  EnvelopeIcon, 
  PhoneIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  ArrowLeftOnRectangleIcon
} from "@heroicons/react/24/outline";

export default function PengaturanProfil() {
  const [profile, setProfile] = useState({
    nama: "Admin Sekolah Vokasi",
    email: "admin.sv@apps.ipb.ac.id",
    noTelp: "081234567890",
    foto: null
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSave = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert("Profil berhasil diperbarui!");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 pb-12 antialiased">
      
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm px-6 md:px-10 py-5">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Judul dengan Aksen Pink */}
          <div className="flex items-center gap-4 self-start md:self-center">
            <span className="w-1.5 h-10 bg-[#E40082] rounded-full shrink-0"></span>
            <div>
              <h1 className="text-2xl font-bold text-[#263C92] tracking-tight">Pengaturan Akun</h1>
              <p className="text-slate-500 text-sm font-medium">Kelola informasi profil dan keamanan</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 mt-8">
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
          
          {/* BAGIAN FOTO PROFILE */}
          <div className="p-8 border-b border-slate-100 bg-slate-50/30">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="relative group">
                <div className="h-32 w-32 rounded-[2.5rem] bg-slate-200 border-4 border-white shadow-md overflow-hidden flex items-center justify-center transition-transform group-hover:scale-105 duration-300">
                  {profile.foto ? (
                    <img src={profile.foto} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <UserIcon className="h-16 w-16 text-slate-400" />
                  )}
                </div>
                <button className="absolute bottom-0 right-0 bg-[#263C92] text-white p-2.5 rounded-xl shadow-lg hover:bg-[#E40082] hover:scale-110 active:scale-95 transition-all">
                  <CameraIcon className="h-5 w-5" />
                </button>
              </div>
              
              <div className="text-center md:text-left">
                <h3 className="text-lg font-bold text-slate-800">Foto Profil</h3>
                <p className="text-sm text-slate-500 mb-4 font-medium">PNG, JPG atau GIF. Maksimal 2MB.</p>
                <div className="flex gap-2 justify-center md:justify-start">
                  <button className="text-xs font-bold bg-white border border-slate-200 px-5 py-2.5 rounded-xl hover:bg-slate-50 shadow-sm transition-colors">Ganti Foto</button>
                  <button className="text-xs font-bold text-red-500 px-5 py-2.5 rounded-xl hover:bg-red-50 transition-colors">Hapus</button>
                </div>
              </div>
            </div>
          </div>

          {/* FORMULIR INPUT */}
          <div className="p-8 space-y-8">
            
            {/* Informasi Dasar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                  <input 
                    type="text" 
                    value={profile.nama}
                    onChange={(e) => setProfile({...profile, nama: e.target.value})}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 ring-[#263C92]/10 focus:border-[#263C92] outline-none transition-all font-medium"
                    placeholder="Masukkan nama lengkap"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email Institusi</label>
                <div className="relative">
                  <EnvelopeIcon className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                  <input 
                    type="email" 
                    value={profile.email}
                    onChange={(e) => setProfile({...profile, email: e.target.value})}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 ring-[#263C92]/10 focus:border-[#263C92] outline-none transition-all font-medium"
                    placeholder="email@apps.ipb.ac.id"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nomor Telepon</label>
                <div className="relative">
                  <PhoneIcon className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                  <input 
                    type="text" 
                    value={profile.noTelp}
                    onChange={(e) => setProfile({...profile, noTelp: e.target.value})}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 ring-[#263C92]/10 focus:border-[#263C92] outline-none transition-all font-medium"
                    placeholder="08xxx"
                  />
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Bagian Password */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <LockClosedIcon className="h-5 w-5 text-[#E40082]" /> Keamanan Akun
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Password Baru</label>
                  <input 
                    type="password" 
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 ring-[#263C92]/10 focus:border-[#263C92] outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Konfirmasi Password</label>
                  <input 
                    type="password" 
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 ring-[#263C92]/10 focus:border-[#263C92] outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            {/* Tombol Simpan */}
            <div className="pt-6 flex flex-col sm:row-reverse sm:flex-row-reverse gap-4">
              <button 
                onClick={handleSave}
                disabled={isLoading}
                className="flex-[2] bg-[#263C92] hover:bg-[#1a2b6d] text-white py-4 rounded-2xl font-bold text-sm uppercase tracking-widest shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <ArrowPathIcon className="h-5 w-5 animate-spin" /> Menyimpan...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-5 w-5" /> Simpan Perubahan
                  </>
                )}
              </button>
              <button className="flex-1 px-8 py-4 border-2 border-slate-100 text-slate-400 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-slate-50 transition-all">
                Batal
              </button>
            </div>

          </div>
        </div>

        {/* INFO TAMBAHAN */}
        <div className="mt-8 p-6 bg-blue-50/50 rounded-[2.5rem] border border-blue-100 flex items-start gap-4">
          <div className="bg-blue-500 p-2.5 rounded-2xl text-white shadow-sm shrink-0">
            <LockClosedIcon className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-blue-900">Privasi & Keamanan</h4>
            <p className="text-xs text-blue-700/80 mt-1 leading-relaxed font-medium">
              Demi keamanan, sistem akan meminta login ulang setelah Anda mengganti password. Gunakan kombinasi huruf, angka, dan simbol untuk keamanan maksimal.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}