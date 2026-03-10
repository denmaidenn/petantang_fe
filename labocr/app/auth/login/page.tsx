"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  LockClosedIcon,
  UserIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { adminLogin, type ApiError } from "@/lib/api";

import Swal from "sweetalert2";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const data = await adminLogin(formData.username, formData.password);
      localStorage.setItem("admin_jwt_token", data.access_token);

      await Swal.fire({
        icon: "success",
        title: "Login Berhasil",
        text: "Selamat datang di Dashboard Admin",
        timer: 1500,
        showConfirmButton: false
      });

      router.push("/adminlab/dashboard");
    } catch (error) {
      const apiErr = error as ApiError;
      setErrorMsg(apiErr.detail || "Username atau password salah.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 antialiased relative">

      {/* TOMBOL KEMBALI */}
      <Link
        href="/"
        className="absolute top-6 left-6 md:top-10 md:left-10 flex items-center gap-2 text-slate-500 hover:text-[#263C92] transition-colors py-2 px-4 rounded-xl hover:bg-slate-100 font-medium text-sm"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        <span>Kembali ke Beranda</span>
      </Link>

      {/* ANIMASI KHUSUS TEKS SAJA */}
      <style jsx>{`
        @keyframes revealText {
          0% {
            transform: translateX(-40px);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .animate-text {
          animation: revealText 1.8s cubic-bezier(0.22, 1, 0.36, 1)
            0.8s forwards;
          opacity: 0;
        }
      `}</style>

      {/* BACKGROUND */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#263C92]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#E40082]/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-[520px] flex flex-col items-center">

        {/* ===== HEADER ===== */}
        <div className="flex items-center gap-5 mb-10 w-fit mx-auto relative">

          {/* LOGO (DIAM) */}
          <Image
            src="/images/logosvipb.png"
            alt="Logo SV IPB"
            width={70}
            height={70}
            className="object-contain"
            priority
          />

          {/* GARIS PINK (DIAM) */}
          <div className="w-1.5 h-16 bg-[#E40082] rounded-full shrink-0 shadow-sm"></div>

          {/* TEKS (ANIMASI SAJA) */}
          <div className="animate-text">
            <h1 className="text-[14px] font-bold text-[#263C92] leading-tight uppercase tracking-tight">
              Sistem Informasi
              <br />
              Manajemen Laboratorium
            </h1>

            <div className="flex items-center gap-2 mt-1">
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">
                Sekolah Vokasi
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                IPB University
              </span>
            </div>
          </div>
        </div>

        {/* ===== LOGIN CARD (TIDAK DIANIMASI) ===== */}
        <div className="w-full bg-white p-7 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100">

          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">
              Selamat Datang
            </h2>
            <p className="text-[12px] text-slate-500 mt-1">
              Silakan masuk ke akun petugas.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-[12px] font-medium px-4 py-2.5 rounded-xl">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">

            {/* USERNAME */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-600 ml-1 uppercase tracking-wider">
                Nama Pengguna
              </label>
              <div className="relative">
                <UserIcon className="h-5 w-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[14px] focus:ring-2 ring-[#263C92]/5 focus:border-[#263C92] outline-none transition-all"
                  placeholder="Username"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-600 ml-1 uppercase tracking-wider">
                Kata Sandi
              </label>
              <div className="relative">
                <LockClosedIcon className="h-5 w-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[14px] focus:ring-2 ring-[#263C92]/5 focus:border-[#263C92] outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#263C92] hover:bg-[#1e2f75] text-white py-3 rounded-xl font-bold text-[12px] uppercase tracking-widest shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Login</span>
                  <ArrowRightIcon className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}