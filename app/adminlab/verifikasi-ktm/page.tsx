"use client";

import { useState, useEffect } from "react";
import {
  CheckCircleIcon,
  XCircleIcon,
  CpuChipIcon,
  ClockIcon,
  MapPinIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  FolderOpenIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";

// Dummy Data Tetap Sama
const INITIAL_QUEUE = [
  {
    id: "1",
    nim: "A24200123",
    name: "Ahmad Rizki",
    prodi: "Teknik Informatika",
    kelas: "TI-4A",
    timeScan: "08:30:12",
    photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmad",
    targetLab: "Lab Jaringan 01",
    targetTime: "08:00 - 10:30",
    isScheduleMatch: true,
    mlScore: 98.5,
    mlDetails: { faceMatch: "99%", ocrNim: "Match", status: "Secure" },
  },
  {
    id: "2",
    nim: "A24200456",
    name: "Siti Aminah",
    prodi: "Sistem Informasi",
    kelas: "SI-2C",
    timeScan: "08:32:45",
    photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Siti",
    targetLab: "Lab Multimedia",
    targetTime: "13:00 - 15:30",
    isScheduleMatch: false,
    mlScore: 45.2,
    mlDetails: { faceMatch: "42%", ocrNim: "Match", status: "Suspicious" },
  },
];

export default function VerifikasiIdentitasKTM() {
  const [activeTab, setActiveTab] = useState<"antrean" | "berhasil" | "gagal">(
    "antrean",
  );
  const [queue, setQueue] = useState(INITIAL_QUEUE);
  const [selectedMhs, setSelectedMhs] = useState<any>(null);
  const [showPopup, setShowPopup] = useState<{
    show: boolean;
    type: "success" | "fail";
  }>({ show: false, type: "success" });

  const [listBerhasil, setListBerhasil] = useState<any[]>([]);
  const [listGagal, setListGagal] = useState<any[]>([]);

  useEffect(() => {
    setSelectedMhs(null);
  }, [activeTab]);

  const handleAction = (isApproved: boolean) => {
    if (!selectedMhs) return;
    const dataFinal = {
      ...selectedMhs,
      timeVerify: new Date().toLocaleTimeString(),
    };
    if (isApproved) {
      setListBerhasil([dataFinal, ...listBerhasil]);
      setShowPopup({ show: true, type: "success" });
    } else {
      setListGagal([dataFinal, ...listGagal]);
      setShowPopup({ show: true, type: "fail" });
    }
    setQueue((prev) => prev.filter((m) => m.id !== selectedMhs.id));
    setSelectedMhs(null);
    setTimeout(() => setShowPopup({ show: false, type: "success" }), 2000);
  };

  return (
    <div className="h-screen bg-slate-50 flex flex-col text-slate-900 overflow-hidden font-sans">
      {/* POPUP NOTIFIKASI */}
      {showPopup.show && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-2 duration-300">
          <div
            className={`px-4 py-2 rounded-lg shadow-lg border flex items-center gap-2 ${
              showPopup.type === "success"
                ? "bg-emerald-600 border-emerald-500"
                : "bg-red-600 border-red-500"
            }`}
          >
            {showPopup.type === "success" ? (
              <CheckCircleIcon className="h-4 w-4 text-white" />
            ) : (
              <XCircleIcon className="h-4 w-4 text-white" />
            )}
            <p className="text-white font-medium text-[11px]">
              {showPopup.type === "success"
                ? "Verifikasi Berhasil"
                : "Verifikasi Gagal"}
            </p>
          </div>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-3 bg-white p-5 border-b border-slate-200 shadow-sm z-10">
        <div className="flex items-center gap-4 self-start md:self-center">
          <div className="w-1.5 h-10 bg-[#E40082] rounded-full" />
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none">
              Verifikasi Identitas KTM
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-1.5">
              OCR Technology • Status: Connected
            </p>
          </div>
        </div>

        {/* Tab Switcher - Adjusted Weight */}
        <div className="flex bg-slate-100 p-1 rounded-xl gap-1 border border-slate-200">
          {[
            {
              id: "antrean",
              label: "ANTREAN LIVE",
              count: queue.length,
              color: "text-blue-700",
              bg: "bg-blue-50",
            },
            {
              id: "berhasil",
              label: "BERHASIL",
              count: listBerhasil.length,
              color: "text-emerald-700",
              bg: "bg-emerald-50",
            },
            {
              id: "gagal",
              label: "GAGAL/TINJAU",
              count: listGagal.length,
              color: "text-red-700",
              bg: "bg-red-50",
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg text-[10px] font-semibold transition-all flex items-center gap-2 ${activeTab === tab.id ? `bg-white shadow-sm ${tab.color}` : "text-slate-500 hover:bg-slate-200"}`}
            >
              {tab.label}{" "}
              <span
                className={`px-1.5 py-0.5 rounded-md text-[9px] ${activeTab === tab.id ? tab.bg : "bg-slate-200"}`}
              >
                ({tab.count})
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex gap-3 p-4 overflow-hidden">
        {/* SIDEBAR LIST */}
        <div className="w-72 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-3 bg-slate-50 border-b text-[9px] font-bold text-slate-400 uppercase tracking-[0.1em]">
            {activeTab === "antrean"
              ? "Feed Scan Terbaru"
              : activeTab === "berhasil"
                ? "Arsip Sukses"
                : "Arsip Penolakan"}
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {(activeTab === "antrean"
              ? queue
              : activeTab === "berhasil"
                ? listBerhasil
                : listGagal
            ).map((mhs) => (
              <button
                key={mhs.id}
                onClick={() => setSelectedMhs(mhs)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  selectedMhs?.id === mhs.id
                    ? "bg-[#263C92]/5 border-[#263C92]/20 shadow-sm"
                    : "border-transparent hover:bg-slate-50"
                }`}
              >
                <img
                  src={mhs.photo}
                  className="h-9 w-9 rounded-lg bg-slate-100 object-cover"
                />
                <div className="text-left overflow-hidden flex-1">
                  <p className="text-[12px] font-semibold text-slate-800 truncate">
                    {mhs.name}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium tracking-tight">
                    {mhs.nim}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* DETAIL PANEL */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          {selectedMhs ? (
            <div className="flex-1 flex flex-col overflow-y-auto p-8 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Visual Analysis */}
                <div className="lg:col-span-4 space-y-4">
                  <div className="relative group">
                    <img
                      src={selectedMhs.photo}
                      className="w-full aspect-square rounded-3xl object-cover border border-slate-100 shadow-sm"
                    />
                    <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur-md rounded-lg text-[9px] font-bold border border-slate-200 shadow-sm uppercase tracking-wider">
                      KTM SCAN
                    </div>
                  </div>

                  <div className="bg-slate-900 rounded-2xl p-5 text-white">
                    <div className="flex items-center gap-2 mb-4">
                      <CpuChipIcon className="h-3.5 w-3.5 text-blue-400" />
                      <span className="text-[9px] font-bold uppercase text-blue-400 tracking-[0.1em]">
                        AI Analysis
                      </span>
                    </div>
                    <div className="space-y-3">
                      {[
                        {
                          label: "Kecocokan Wajah",
                          value: selectedMhs.mlDetails.faceMatch,
                          score: selectedMhs.mlScore,
                        },
                        {
                          label: "Validasi OCR NIM",
                          value: selectedMhs.mlDetails.ocrNim,
                          score: 100,
                        },
                        {
                          label: "Security Status",
                          value: selectedMhs.mlDetails.status,
                          score: selectedMhs.mlScore,
                        },
                      ].map((item, idx) => (
                        <div
                          key={idx}
                          className={`flex justify-between ${idx !== 2 ? "border-b border-slate-800 pb-2" : ""} text-[11px]`}
                        >
                          <span className="text-slate-400 font-normal">
                            {item.label}
                          </span>
                          <span
                            className={`font-semibold ${item.score > 80 ? "text-emerald-400" : "text-amber-400"}`}
                          >
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Identity Data */}
                <div className="lg:col-span-8 space-y-6">
                  <div className="pb-6 border-b border-slate-100">
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                      {selectedMhs.name}
                    </h2>
                    <div className="flex items-center gap-3 mt-2">
                      <p className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded text-center uppercase tracking-wider">
                        {selectedMhs.nim}
                      </p>
                      <span className="text-slate-300">•</span>
                      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
                        Kelas {selectedMhs.kelas}
                      </p>
                    </div>
                    <p className="text-sm text-slate-500 font-medium mt-2">
                      {selectedMhs.prodi}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-2">
                        <MapPinIcon className="h-3 w-3" /> Lab Tujuan
                      </p>
                      <p className="text-sm font-semibold text-slate-800">
                        {selectedMhs.targetLab}
                      </p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-2">
                        <ClockIcon className="h-3 w-3" /> Jam Kuliah
                      </p>
                      <p className="text-sm font-semibold text-slate-800">
                        {selectedMhs.targetTime}
                      </p>
                    </div>
                  </div>

                  {/* Schedule Check Banner */}
                  <div
                    className={`p-5 rounded-2xl flex items-start gap-4 border ${selectedMhs.isScheduleMatch ? "bg-emerald-50 border-emerald-100 text-emerald-900" : "bg-red-50 border-red-100 text-red-900"}`}
                  >
                    <div
                      className={`p-1.5 rounded-lg ${selectedMhs.isScheduleMatch ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`}
                    >
                      {selectedMhs.isScheduleMatch ? (
                        <ShieldCheckIcon className="h-4 w-4" />
                      ) : (
                        <ExclamationCircleIcon className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider">
                        {selectedMhs.isScheduleMatch
                          ? "Jadwal Terverifikasi"
                          : "Peringatan Jadwal"}
                      </p>
                      <p className="text-[11px] opacity-80 font-medium mt-1 leading-relaxed">
                        {selectedMhs.isScheduleMatch
                          ? "Sesuai dengan database semester aktif."
                          : "Mahasiswa tidak terdaftar pada jam praktikum sekarang."}
                      </p>
                    </div>
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="pt-6 flex gap-3">
                    {activeTab === "antrean" && (
                      <>
                        <button
                          onClick={() => handleAction(false)}
                          className="flex-1 py-3.5 border border-red-200 text-red-600 rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-red-50 transition-all"
                        >
                          TOLAK AKSES
                        </button>
                        <button
                          onClick={() => handleAction(true)}
                          className="flex-[2] py-3.5 bg-[#263C92] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-md hover:bg-[#1a2b6d] transition-all"
                        >
                          IZINKAN & BUKA PINTU
                        </button>
                      </>
                    )}

                    {/* Tombol "Kembalikan ke Antrean" sudah dihapus dari sini */}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-10 text-center">
              <FolderOpenIcon className="h-10 w-10 text-slate-100 mb-4" />
              <p className="text-[10px] font-bold tracking-widest uppercase opacity-40">
                Pilih Record
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
