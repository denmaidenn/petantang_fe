"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  LockClosedIcon,
  UserIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState({ username: "", password: "" });

  const apiBase =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const resp = await fetch(`${apiBase}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });

      if (!resp.ok) {
        const errJson = await resp.json().catch(() => ({}));

        // Ambil pesan error yang ramah teks
        let finalMessage = "Login gagal. Cek username/NIM & password.";

        if (errJson.detail) {
          // Jika detail berupa array (error 422), ambil msg dari elemen pertama
          if (Array.isArray(errJson.detail)) {
            finalMessage = errJson.detail[0].msg;
          } else {
            finalMessage = errJson.detail;
          }
        }

        setErrorMessage(finalMessage);
        setLoading(false);
        return;
      }

      const data = await resp.json();
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("user_role", data.role);
      localStorage.setItem("user_name", data.name || "");

      if (data.role === "admin") {
        router.push("/adminlab/dashboard");
      } else if (data.role === "mahasiswa") {
        router.push("/");
      } else {
        router.push("/");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Terjadi kesalahan server. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 antialiased relative">
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
          animation: revealText 1.8s cubic-bezier(0.22, 1, 0.36, 1) 0.8s
            forwards;
          opacity: 0;
        }
      `}</style>

      {/* BACKGROUND */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
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
              Silakan masuk ke akun admin atau mahasiswa.
            </p>
            {errorMessage && (
              <div className="mt-3 text-sm text-red-600 font-semibold">
                {errorMessage}
              </div>
            )}
          </div>

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
