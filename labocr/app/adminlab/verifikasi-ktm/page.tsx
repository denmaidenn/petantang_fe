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
  ExclamationCircleIcon
} from "@heroicons/react/24/outline";

// Dummy Data Awal
const INITIAL_QUEUE = [
  { 
    id: "1", nim: "A24200123", name: "Ahmad Rizki", prodi: "Teknik Informatika", kelas: "TI-4A", timeScan: "08:30:12", photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmad",
    targetLab: "Lab Jaringan 01", targetTime: "08:00 - 10:30", isScheduleMatch: true, mlScore: 98.5,
    mlDetails: { faceMatch: "99%", ocrNim: "Match", status: "Secure" }
  },
  { 
    id: "2", nim: "A24200456", name: "Siti Aminah", prodi: "Sistem Informasi", kelas: "SI-2C", timeScan: "08:32:45", photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Siti",
    targetLab: "Lab Multimedia", targetTime: "13:00 - 15:30", isScheduleMatch: false, mlScore: 45.2,
    mlDetails: { faceMatch: "42%", ocrNim: "Match", status: "Suspicious" }
  }
];

export default function VerifikasiIdentitasKTM() {
  const [activeTab, setActiveTab] = useState<"antrean" | "berhasil" | "gagal">("antrean");
  const [queue, setQueue] = useState(INITIAL_QUEUE);
  const [selectedMhs, setSelectedMhs] = useState<any>(null);
  const [showPopup, setShowPopup] = useState<{show: boolean, type: 'success' | 'fail'}>({show: false, type: 'success'});
  
  const [listBerhasil, setListBerhasil] = useState<any[]>([]);
  const [listGagal, setListGagal] = useState<any[]>([]);

  // Reset detail saat pindah tab agar tidak terjadi "data nyangkut"
  useEffect(() => {
    setSelectedMhs(null);
  }, [activeTab]);

  const handleAction = (isApproved: boolean) => {
    if (!selectedMhs) return;

    const dataFinal = { ...selectedMhs, timeVerify: new Date().toLocaleTimeString() };

    if (isApproved) {
      setListBerhasil([dataFinal, ...listBerhasil]);
      setShowPopup({ show: true, type: 'success' });
    } else {
      setListGagal([dataFinal, ...listGagal]);
      setShowPopup({ show: true, type: 'fail' });
    }

    setQueue(prev => prev.filter(m => m.id !== selectedMhs.id));
    setSelectedMhs(null);

    setTimeout(() => setShowPopup({ show: false, type: 'success' }), 2000);
  };

  return (
    <div className="h-screen bg-slate-50 flex flex-col text-slate-900 overflow-hidden">
      
      {/* POPUP NOTIFIKASI */}
      {showPopup.show && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-2 duration-300">
          <div className={`px-4 py-2 rounded-lg shadow-lg border flex items-center gap-2 ${
            showPopup.type === 'success' ? 'bg-emerald-600 border-emerald-500' : 'bg-red-600 border-red-500'
          }`}>
            {showPopup.type === 'success' ? <CheckCircleIcon className="h-4 w-4 text-white" /> : <XCircleIcon className="h-4 w-4 text-white" />}
            <p className="text-white font-medium text-[11px]">
              {showPopup.type === 'success' ? "Verifikasi Berhasil: Data masuk arsip peminjaman" : "Verifikasi Gagal: Data masuk folder tinjauan"}
            </p>
          </div>
        </div>
      )}

      {/* HEADER SECTION - DISERAGAMKAN DENGAN KELOLA LAB */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-3 bg-white p-5 border-b border-slate-200 shadow-sm z-10">
        <div className="flex items-center gap-4 self-start md:self-center">
          {/* Garis Pink Sesuai Gambar */}
          <div className="w-1.5 h-10 bg-[#E40082] rounded-full" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-none">Verifikasi Identitas KTM & Jadwal Semester</h1>
            <p className="text-sm text-slate-500 font-medium mt-1">OCR Technology • Status: Connected to Database</p>
          </div>
        </div>
        
        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl gap-1 border border-slate-200">
          <button onClick={() => setActiveTab('antrean')} className={`px-4 py-2 rounded-lg text-[11px] font-bold transition-all flex items-center gap-2 ${activeTab === 'antrean' ? 'bg-white shadow-md text-blue-700' : 'text-slate-500 hover:bg-slate-200'}`}>
            ANTREAN LIVE <span className={`px-1.5 py-0.5 rounded-md text-[9px] ${activeTab === 'antrean' ? 'bg-blue-50' : 'bg-slate-200'}`}>({queue.length})</span>
          </button>
          <button onClick={() => setActiveTab('berhasil')} className={`px-4 py-2 rounded-lg text-[11px] font-bold transition-all flex items-center gap-2 ${activeTab === 'berhasil' ? 'bg-white shadow-md text-emerald-700' : 'text-slate-500 hover:bg-slate-200'}`}>
            BERHASIL <span className={`px-1.5 py-0.5 rounded-md text-[9px] ${activeTab === 'berhasil' ? 'bg-emerald-50' : 'bg-slate-200'}`}>({listBerhasil.length})</span>
          </button>
          <button onClick={() => setActiveTab('gagal')} className={`px-4 py-2 rounded-lg text-[11px] font-bold transition-all flex items-center gap-2 ${activeTab === 'gagal' ? 'bg-white shadow-md text-red-700' : 'text-slate-500 hover:bg-slate-200'}`}>
            GAGAL/TINJAU <span className={`px-1.5 py-0.5 rounded-md text-[9px] ${activeTab === 'gagal' ? 'bg-red-50' : 'bg-slate-200'}`}>({listGagal.length})</span>
          </button>
        </div>
      </div>

      {/* MAIN CONTENT - Diberi padding-top sedikit karena header sudah sticky/fixed di atas */}
      <div className="flex-1 flex gap-3 p-4 overflow-hidden">
        
        {/* SIDEBAR LIST (KIRI) */}
        <div className="w-72 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-3 bg-slate-50 border-b text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
            {activeTab === 'antrean' ? "Feed Scan Terbaru" : activeTab === 'berhasil' ? "Arsip Sukses" : "Arsip Penolakan"}
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {(activeTab === 'antrean' ? queue : activeTab === 'berhasil' ? listBerhasil : listGagal).map((mhs) => (
              <button 
                key={mhs.id} 
                onClick={() => setSelectedMhs(mhs)} 
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  selectedMhs?.id === mhs.id ? 'bg-[#263C92]/5 border-[#263C92]/20 ring-1 ring-[#263C92]/10' : 'border-transparent hover:bg-slate-50'
                }`}
              >
                <img src={mhs.photo} className="h-9 w-9 rounded-lg bg-slate-100 object-cover shadow-sm" />
                <div className="text-left overflow-hidden flex-1">
                  <p className="text-[12px] font-bold text-slate-800 truncate">{mhs.name}</p>
                  <p className="text-[10px] text-slate-400 font-bold tracking-tight">{mhs.nim}</p>
                </div>
              </button>
            ))}
            {(activeTab === 'antrean' ? queue : activeTab === 'berhasil' ? listBerhasil : listGagal).length === 0 && (
              <div className="py-20 text-center opacity-30 text-[10px] font-black uppercase tracking-widest italic">Folder Kosong</div>
            )}
          </div>
        </div>

        {/* DETAIL PANEL (KANAN) */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          {selectedMhs ? (
            <div className="flex-1 flex flex-col overflow-y-auto p-8 animate-in fade-in duration-300">
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Visual Analysis (ML Report) */}
                <div className="lg:col-span-4 space-y-4">
                  <div className="relative group">
                    <img src={selectedMhs.photo} className="w-full aspect-square rounded-[2rem] object-cover border-4 border-slate-50 shadow-md" />
                    <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur-md rounded-lg text-[10px] font-black border border-slate-200 shadow-sm uppercase tracking-wider">KTM SCAN</div>
                  </div>
                  
                  <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-xl">
                    <div className="flex items-center gap-2 mb-4">
                      <CpuChipIcon className="h-4 w-4 text-blue-400" />
                      <span className="text-[10px] font-black uppercase text-blue-400 tracking-[0.2em]">AI Analysis Result</span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between border-b border-slate-800 pb-2 text-[11px]">
                        <span className="text-slate-400 font-medium">Kecocokan Wajah</span>
                        <span className={`font-black ${selectedMhs.mlScore > 80 ? 'text-emerald-400' : 'text-red-400'}`}>{selectedMhs.mlDetails.faceMatch}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-800 pb-2 text-[11px]">
                        <span className="text-slate-400 font-medium">Validasi OCR NIM</span>
                        <span className="font-black text-emerald-400">{selectedMhs.mlDetails.ocrNim}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400 font-medium">Security Status</span>
                        <span className={`font-black uppercase tracking-widest ${selectedMhs.mlScore > 80 ? 'text-emerald-400' : 'text-amber-400'}`}>{selectedMhs.mlDetails.status}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Identity & Schedule Data */}
                <div className="lg:col-span-8 space-y-6 pt-2">
                  <div className="pb-6 border-b border-slate-100">
                    <h2 className="text-3xl font-black text-slate-900 leading-tight tracking-tight">{selectedMhs.name}</h2>
                    <div className="flex items-center gap-3 mt-2">
                      <p className="px-2 py-1 bg-blue-50 text-blue-700 text-[11px] font-black rounded-md uppercase tracking-wider">{selectedMhs.nim}</p>
                      <span className="text-slate-300">•</span>
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Kelas {selectedMhs.kelas}</p>
                    </div>
                    <p className="text-sm text-slate-400 font-medium mt-2">{selectedMhs.prodi}</p>
                  </div>

                  {/* Grid Lab Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] mb-2 flex items-center gap-2"><MapPinIcon className="h-3 w-3" /> Lab Tujuan</p>
                      <p className="text-sm font-black text-slate-800">{selectedMhs.targetLab}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] mb-2 flex items-center gap-2"><ClockIcon className="h-3 w-3" /> Jam Kuliah</p>
                      <p className="text-sm font-black text-slate-800">{selectedMhs.targetTime}</p>
                    </div>
                  </div>

                  {/* Schedule Check Banner */}
                  <div className={`p-5 rounded-[1.5rem] flex items-start gap-4 border-2 ${selectedMhs.isScheduleMatch ? 'bg-emerald-50 border-emerald-100 text-emerald-900' : 'bg-red-50 border-red-100 text-red-900'}`}>
                    <div className={`p-2 rounded-xl ${selectedMhs.isScheduleMatch ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                      {selectedMhs.isScheduleMatch ? <ShieldCheckIcon className="h-5 w-5" /> : <ExclamationCircleIcon className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest">{selectedMhs.isScheduleMatch ? 'Jadwal Terverifikasi' : 'Peringatan Jadwal'}</p>
                      <p className="text-[12px] opacity-75 font-bold mt-1 leading-relaxed">
                        {selectedMhs.isScheduleMatch 
                          ? 'Sistem mengonfirmasi mahasiswa memiliki jadwal aktif di laboratorium ini sesuai database semester.' 
                          : 'Mahasiswa tidak terdaftar pada jam praktikum sekarang. Harap lakukan pengecekan manual.'}
                      </p>
                    </div>
                  </div>

                  {/* ACTION BUTTONS */}
                  {activeTab === 'antrean' && (
                    <div className="pt-6 flex gap-4">
                      <button onClick={() => handleAction(false)} className="flex-1 py-4 border-2 border-red-100 text-red-600 rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] hover:bg-red-50 transition-all">
                        TOLAK AKSES
                      </button>
                      <button onClick={() => handleAction(true)} className="flex-[2] py-4 bg-[#263C92] text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-lg shadow-blue-900/20 hover:bg-[#1a2b6d] transition-all">
                        IZINKAN & BUKA PINTU
                      </button>
                    </div>
                  )}

                  {activeTab === 'gagal' && (
                    <button 
                      onClick={() => {
                        setQueue([...queue, selectedMhs]);
                        setListGagal(listGagal.filter(m => m.id !== selectedMhs.id));
                      }} 
                      className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.1em] flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-lg"
                    >
                      <ArrowPathIcon className="h-4 w-4" /> Kembalikan ke Antrean Live
                    </button>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-10 text-center">
              <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mb-5 border-2 border-dashed border-slate-200">
                 <FolderOpenIcon className="h-8 w-8 text-slate-200" />
              </div>
              <p className="text-xs font-black tracking-[0.3em] uppercase opacity-30">Pilih Record</p>
              <p className="max-w-[240px] text-[11px] font-bold opacity-30 mt-3 leading-relaxed">Silakan pilih salah satu data dari sidebar untuk memulai proses verifikasi.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}