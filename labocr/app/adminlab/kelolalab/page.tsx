"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  PlusIcon, PencilSquareIcon, BuildingOfficeIcon,
  ClockIcon, XMarkIcon, TrashIcon, UserIcon,
  CheckBadgeIcon, UsersIcon, ExclamationTriangleIcon,
  ComputerDesktopIcon, WrenchScrewdriverIcon,
  ListBulletIcon, PlusCircleIcon, CalendarDaysIcon,
  FireIcon, TagIcon, ShieldExclamationIcon, CheckIcon,
  DocumentTextIcon, InformationCircleIcon,
  ArrowTopRightOnSquareIcon // Ikon baru untuk button laporan
} from "@heroicons/react/24/outline";
import { getLabs, createLab, updateLab, deleteLab, type Lab as ApiLab, type ApiError } from "@/lib/api";

import Swal from "sweetalert2";

// --- Types ---
type LabStatus = "Tersedia" | "Digunakan" | "Maintenance" | "Pending";

interface Peminjam {
  nama: string; nim: string; prodi: string; kelas: string; jamMasuk: string;
}

interface LaporanBlokir {
  nim: string; nama: string; lab: string; alasan: string; tanggal: string;
}

interface Lab {
  id: number;
  name: string;
  location: string;
  capacity: number;
  opStart: string;
  opEnd: string;
  useStart: string;
  useEnd: string;
  equipment: string[];
  statusOverride?: string | null;
  created_at?: string;
  // UI-only
  days?: string;
  currentBorrower?: Peminjam;
}

export default function KelolaLabFinal() {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeGedung, setActiveGedung] = useState("Gedung Delta");
  const [showOnlyUsed, setShowOnlyUsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [labs, setLabs] = useState<Lab[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [laporanBlokir, setLaporanBlokir] = useState<LaporanBlokir[]>([]);
  const [selectedLab, setSelectedLab] = useState<Lab | null>(null);
  const [isModalFormOpen, setIsModalFormOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isBlokirModalOpen, setIsBlokirModalOpen] = useState(false);
  const [labToEdit, setLabToEdit] = useState<Lab | null>(null);
  const [labToDelete, setLabToDelete] = useState<number | null>(null);

  const [modalType, setModalType] = useState<"detail" | "checkout">("detail");
  const [checklist, setChecklist] = useState({ clean: false, gear: false, noDamage: false });

  const [formData, setFormData] = useState({
    name: "", location: "Gedung Delta", capacity: 0, days: "Senin",
    opStart: "07:00", opEnd: "18:00", useStart: "08:00", useEnd: "11:00"
  });
  const [isCustomLocation, setIsCustomLocation] = useState(false);
  const [customLocation, setCustomLocation] = useState("");
  const [tempEquipment, setTempEquipment] = useState<string[]>([]);
  const [newItemName, setNewItemName] = useState("");

  // Fetch lab data from backend
  useEffect(() => {
    const loadLabs = async () => {
      const token = localStorage.getItem("admin_jwt_token");
      if (!token) {
        router.replace("/auth/login");
        return;
      }

      setIsLoading(true);
      setFetchError(null);

      try {
        const labsFromApi = await getLabs(token);
        // Map API shape into UI shape; keep existing frontend-only fields as default
        setLabs(
          labsFromApi.map((lab) => ({
            ...lab,
            days: "Senin, Selasa, Rabu, Kamis, Jumat",
            currentBorrower: undefined,
          })),
        );
        if (labsFromApi.length > 0) {
          setActiveGedung(labsFromApi[0].location);
        }
      } catch (err) {
        const apiErr = err as ApiError;
        setFetchError(apiErr.detail || "Gagal memuat data laboratorium.");
      } finally {
        setIsLoading(false);
      }
    };

    loadLabs();
  }, [router]);

  // Logic untuk mendapatkan nama bulan saat ini
  const currentMonthName = useMemo(() => {
    return currentTime.toLocaleString('id-ID', { month: 'long' });
  }, [currentTime]);

  const historyGedung = useMemo(() => {
    const set = new Set<string>(labs.map(l => l.location).filter(Boolean));
    if (activeGedung) set.add(activeGedung);
    return Array.from(set);
  }, [labs, activeGedung]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const processedLabs = useMemo(() => {
    return labs.map(lab => {
      let status: LabStatus = "Tersedia";
      if (lab.statusOverride === "Maintenance") status = "Maintenance";
      else if (lab.currentBorrower) status = "Digunakan";
      return { ...lab, status };
    });
  }, [labs]);

  const filteredLabs = useMemo(() => {
    const base = showOnlyUsed
      ? processedLabs.filter(l => l.status === "Digunakan")
      : processedLabs.filter(l => l.location === activeGedung);

    if (!searchQuery.trim()) return base;
    const q = searchQuery.trim().toLowerCase();
    return base.filter(lab => lab.name.toLowerCase().includes(q) || lab.location.toLowerCase().includes(q));
  }, [processedLabs, activeGedung, showOnlyUsed, searchQuery]);

  const handleSaveLab = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem("admin_jwt_token");
    if (!token) {
      router.replace("/auth/login");
      return;
    }

    const payload = {
      name: formData.name,
      location: formData.location,
      capacity: formData.capacity,
      opStart: formData.opStart,
      opEnd: formData.opEnd,
      useStart: formData.useStart,
      useEnd: formData.useEnd,
      equipment: tempEquipment,
      statusOverride: labToEdit?.statusOverride || undefined,
    };

    try {
      if (labToEdit) {
        const updated = await updateLab(labToEdit.id, payload, token);
        setLabs((prev) => prev.map((l) => (l.id === updated.id ? { ...l, ...updated } : l)));
        Swal.fire({ icon: "success", title: "Berhasil", text: "Data lab berhasil diperbarui!" });
      } else {
        const created = await createLab(payload, token);
        setLabs((prev) => [...prev, { ...created, days: "Senin, Selasa, Rabu, Kamis, Jumat" }]);
        Swal.fire({ icon: "success", title: "Berhasil", text: "Lab baru berhasil ditambahkan!" });
      }
      setIsModalFormOpen(false);
    } catch (err) {
      const apiErr = err as ApiError;
      Swal.fire({ icon: "error", title: "Oops...", text: apiErr.detail || "Gagal menyimpan data lab." });
    }
  };

  const handleToggleMaintenance = async (lab: Lab) => {
    const token = localStorage.getItem("admin_jwt_token");
    if (!token) {
      router.replace("/auth/login");
      return;
    }

    const newStatus = lab.statusOverride === "Maintenance" ? undefined : "Maintenance";
    try {
      const updated = await updateLab(lab.id, {
        name: lab.name,
        location: lab.location,
        capacity: lab.capacity,
        opStart: lab.opStart,
        opEnd: lab.opEnd,
        useStart: lab.useStart,
        useEnd: lab.useEnd,
        equipment: lab.equipment,
        statusOverride: newStatus,
      }, token);
      setLabs((prev) => prev.map((l) => (l.id === updated.id ? { ...l, ...updated } : l)));
      Swal.fire({ icon: "success", title: "Berhasil", text: "Status maintenance lab berhasil diubah!", timer: 1500 });
    } catch (err) {
      const apiErr = err as ApiError;
      Swal.fire({ icon: "error", title: "Oops...", text: apiErr.detail || "Gagal mengubah status lab." });
    }
  };

  const handleDeleteLab = async () => {
    if (!labToDelete) return;
    const token = localStorage.getItem("admin_jwt_token");
    if (!token) {
      router.replace("/auth/login");
      return;
    }

    try {
      await deleteLab(labToDelete!, token);
      setLabs((prev) => prev.filter((l) => l.id !== labToDelete));
      Swal.fire({ icon: "success", title: "Terhapus!", text: "Data lab telah dihapus.", timer: 1500 });
    } catch (err) {
      const apiErr = err as ApiError;
      Swal.fire({ icon: "error", title: "Oops...", text: apiErr.detail || "Gagal menghapus lab." });
    } finally {
      setIsDeleteModalOpen(false);
      setLabToDelete(null);
    }
  };

  const handleAddEquipment = () => {
    if (newItemName.trim()) {
      setTempEquipment([...tempEquipment, newItemName.trim()]);
      setNewItemName("");
    }
  };

  const handleRemoveEquipment = (index: number) => {
    setTempEquipment(tempEquipment.filter((_, i) => i !== index));
  };

  const handleAction = (type: "normal" | "block") => {
    if (!selectedLab) return;
    if (type === "block" && selectedLab.currentBorrower) {
      setLaporanBlokir(prev => [...prev, {
        nim: selectedLab.currentBorrower!.nim,
        nama: selectedLab.currentBorrower!.nama,
        lab: selectedLab.name,
        alasan: "Melanggar Prosedur Checklist",
        tanggal: new Date().toLocaleString('id-ID')
      }]);
      Swal.fire({ icon: "warning", title: "Perhatian", text: `KTM ${selectedLab.currentBorrower.nim} DIBLOKIR!` });
    } else {
      Swal.fire({ icon: "success", title: "Checkout Berhasil", text: `Checkout ${selectedLab.name} Berhasil.` });
    }
    setLabs(prev => prev.map(l => l.id === selectedLab.id ? { ...l, currentBorrower: undefined } : l));
    setSelectedLab(null);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 leading-tight">
      {fetchError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 text-sm text-center">
          {fetchError}
        </div>
      )}
      {isLoading && (
        <div className="bg-white border-b border-slate-200 px-6 py-4 text-sm text-slate-600 text-center">
          Memuat data laboratorium...
        </div>
      )}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="w-1.5 h-10 bg-[#E40082] rounded-full"></span>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Kelola Laboratorium</h1>
              <p className="text-slate-500 text-sm font-normal">Sistem Manajemen Lab & Monitoring</p>
            </div>
          </div>
          <div className="flex gap-3">
            {laporanBlokir.length > 0 && (
              <button
                onClick={() => setIsBlokirModalOpen(true)}
                className="flex items-center gap-2 bg-red-50 px-4 py-2 rounded-xl border border-red-100 text-red-600 text-xs font-bold animate-pulse hover:bg-red-100 transition-colors"
              >
                <ShieldExclamationIcon className="h-4 w-4" /> {laporanBlokir.length} KTM Terblokir
              </button>
            )}
            <button
              onClick={() => {
                setLabToEdit(null);
                setFormData({ name: "", location: activeGedung, capacity: 0, days: "Senin", opStart: "07:00", opEnd: "18:00", useStart: "08:00", useEnd: "11:00" });
                setIsCustomLocation(false);
                setCustomLocation("");
                setTempEquipment([]);
                setIsModalFormOpen(true);
              }}
              className="bg-[#263C92] text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-semibold text-sm hover:opacity-90">

              <PlusIcon className="h-5 w-5 stroke-[2]" /> Input Lab
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-4">
        {/* TABS */}
        <div className="mb-4 flex flex-col gap-3">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button onClick={() => { setShowOnlyUsed(true); setActiveGedung(""); }} className={`px-5 py-1.5 rounded-lg font-semibold text-xs uppercase flex items-center gap-2 border-2 ${showOnlyUsed ? "bg-orange-500 border-orange-500 text-white shadow-lg" : "bg-white border-slate-100 text-slate-400"}`}>
              <FireIcon className="h-4 w-4" /> Used Today
            </button>
            <div className="h-6 w-[1px] bg-slate-200 my-auto mx-2"></div>
            {Array.from(new Set(labs.map(l => l.location))).map((gedung) => (
              <button key={gedung} onClick={() => { setShowOnlyUsed(false); setActiveGedung(gedung); }} className={`px-5 py-1.5 rounded-lg font-semibold text-xs uppercase border-2 ${!showOnlyUsed && activeGedung === gedung ? "bg-[#E40082] border-[#E40082] text-white" : "bg-white border-slate-100 text-slate-400"}`}>
                {gedung}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari lab atau lokasi..."
              className="w-full max-w-md p-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E40082]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="px-4 py-2 bg-slate-100 text-slate-500 rounded-xl text-xs font-bold hover:bg-slate-200"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredLabs.map((lab) => (
            <div key={lab.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col transition-all">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-xl text-[#263C92]">{lab.name}</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{lab.location}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${lab.status === 'Tersedia' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : lab.status === 'Digunakan' ? 'bg-blue-50 text-blue-600 border-blue-100' : lab.status === 'Maintenance' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>{lab.status}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4 bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                <div className="space-y-1">
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Operasional</p>
                  <p className="text-xs font-bold text-slate-700">{lab.opStart}-{lab.opEnd}</p>
                </div>
                <div className="space-y-1 border-l border-slate-200 pl-3">
                  {lab.status === "Digunakan" ? (
                    <>
                      <p className="text-[9px] font-bold text-[#E40082] uppercase">Waktu Sesi</p>
                      <p className="text-xs font-bold text-slate-700">{lab.useStart}-{lab.useEnd}</p>
                    </>
                  ) : (
                    <>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Kapasitas PC</p>
                      <p className="text-xs font-bold text-slate-700">{lab.capacity} Unit PC</p>
                    </>
                  )}
                </div>
              </div>

              <div className="mb-6 flex flex-wrap gap-1.5">
                {lab.equipment.map((e, i) => (
                  <span key={i} className="px-2.5 py-1 bg-white border border-slate-100 rounded-lg text-[10px] font-semibold text-slate-500">{e}</span>
                ))}
              </div>

              <div className="flex gap-2 mt-auto pt-4 border-t border-slate-50">
                <button onClick={() => handleToggleMaintenance(lab)} className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase border flex items-center justify-center gap-2 ${lab.status === 'Maintenance' ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white text-slate-400 hover:text-red-500'}`}>
                  <WrenchScrewdriverIcon className="h-3.5 w-3.5" /> Maintenance
                </button>
                <button onClick={() => { setSelectedLab(lab); setModalType("detail"); }} className="bg-slate-100 text-slate-600 px-4 py-2 rounded-xl text-[10px] font-bold uppercase hover:bg-slate-200">Detail</button>
                <button
                  onClick={() => {
                    setLabToEdit(lab);
                    setFormData({ ...lab, days: lab.days || "Senin", useStart: lab.useStart || "08:00", useEnd: lab.useEnd || "11:00" });
                    setTempEquipment(lab.equipment);

                    const isCustom = !historyGedung.includes(lab.location);
                    setIsCustomLocation(isCustom);
                    setCustomLocation(isCustom ? lab.location : "");

                    setIsModalFormOpen(true);
                  }}
                  className="p-2 border border-slate-200 rounded-xl text-slate-400 hover:text-[#263C92]">
                  <PencilSquareIcon className="h-5 w-5" />
                </button>
                <button onClick={() => { setLabToDelete(lab.id); setIsDeleteModalOpen(true); }} className="p-2 border border-slate-200 rounded-xl text-slate-400 hover:text-red-500"><TrashIcon className="h-5 w-5" /></button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* --- FORM INPUT/EDIT MODAL --- */}
      {isModalFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
            <div className="bg-[#263C92] p-6 text-white flex justify-between items-center shrink-0">
              <h2 className="text-xl font-bold">{labToEdit ? 'Edit Lab' : 'Input Lab Baru'}</h2>
              <button onClick={() => setIsModalFormOpen(false)}><XMarkIcon className="h-6 w-6" /></button>
            </div>
            <form onSubmit={handleSaveLab} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Nama Lab</label>
                <input type="text" required className="w-full p-3 bg-slate-50 border rounded-xl mt-1 outline-none focus:border-[#263C92]" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Gedung</label>
                <div className="relative">
                  <select
                    value={isCustomLocation ? "__custom__" : formData.location}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "__custom__") {
                        setIsCustomLocation(true);
                        setCustomLocation("");
                        setFormData({ ...formData, location: "" });
                      } else {
                        setIsCustomLocation(false);
                        setCustomLocation("");
                        setFormData({ ...formData, location: val });
                      }
                    }}
                    className="w-full p-3 bg-slate-50 border rounded-xl mt-1 outline-none focus:border-[#263C92] appearance-none"
                    required
                  >
                    <option value="" disabled>Pilih gedung</option>
                    {historyGedung.map((g, idx) => (
                      <option key={idx} value={g}>{g}</option>
                    ))}
                    <option value="__custom__">+ Tambah gedung baru...</option>
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">▾</span>
                </div>

                {isCustomLocation && (
                  <input
                    type="text"
                    placeholder="Masukkan nama gedung"
                    className="w-full p-3 bg-slate-50 border rounded-xl mt-3 outline-none focus:border-[#263C92]"
                    value={customLocation}
                    onChange={(e) => {
                      setCustomLocation(e.target.value);
                      setFormData({ ...formData, location: e.target.value });
                    }}
                    required
                  />
                )}
              </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Kapasitas PC</label>
                  <input type="number" className="w-full p-3 bg-slate-50 border rounded-xl mt-1 outline-none" value={formData.capacity} onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Jam Buka</label>
                  <input type="time" className="w-full p-3 bg-slate-50 border rounded-xl mt-1" value={formData.opStart} onChange={(e) => setFormData({ ...formData, opStart: e.target.value })} />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Jam Tutup</label>
                  <input type="time" className="w-full p-3 bg-slate-50 border rounded-xl mt-1" value={formData.opEnd} onChange={(e) => setFormData({ ...formData, opEnd: e.target.value })} />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Inventaris Alat</label>
                <div className="flex gap-2 mt-1 mb-3">
                  <input
                    type="text"
                    placeholder="Contoh: Switch HP, PC Core i7..."
                    className="flex-1 p-3 bg-slate-50 border rounded-xl outline-none text-sm"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddEquipment(); } }}
                  />
                  <button
                    type="button"
                    onClick={handleAddEquipment}
                    className="bg-slate-100 text-[#263C92] px-4 rounded-xl hover:bg-[#263C92] hover:text-white transition-colors"
                  >
                    <PlusIcon className="h-6 w-6 stroke-[3]" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {tempEquipment.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 bg-blue-50 text-[#263C92] px-3 py-1.5 rounded-lg border border-blue-100 text-xs font-bold">
                      {item}
                      <button type="button" onClick={() => handleRemoveEquipment(index)}>
                        <XMarkIcon className="h-4 w-4 text-blue-400 hover:text-red-500" />
                      </button>
                    </div>
                  ))}
                  {tempEquipment.length === 0 && (
                    <p className="text-[10px] text-slate-400 italic">Belum ada inventaris ditambahkan.</p>
                  )}
                </div>
              </div>

              <button type="submit" className="w-full bg-[#E40082] text-white p-4 rounded-xl font-bold uppercase tracking-wider hover:opacity-90 sticky bottom-0">Simpan Perubahan</button>
            </form>
          </div>
        </div>
      )}

      {/* --- DASHBOARD STYLE MODAL (DETAIL & CHECKOUT) --- */}
      {selectedLab && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden">
            <div className={`p-5 text-white text-center ${modalType === 'detail' ? 'bg-[#263C92]' : 'bg-[#E40082]'}`}>
              <h2 className="font-bold text-base">{modalType === "detail" ? "Detail Peminjam" : "Checkout Checklist"}</h2>
              <p className="text-xs font-medium opacity-80 uppercase tracking-widest mt-1">{selectedLab.name}</p>
            </div>

            <div className="p-6">
              {modalType === "detail" ? (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-2xl space-y-3 border border-slate-100">
                    {selectedLab.currentBorrower ? (
                      <>
                        <div className="flex justify-between border-b border-slate-200 pb-2"><span className="text-xs font-bold text-slate-400 uppercase">Nama</span><span className="text-xs font-bold text-slate-800">{selectedLab.currentBorrower.nama}</span></div>
                        <div className="flex justify-between border-b border-slate-200 pb-2"><span className="text-xs font-bold text-slate-400 uppercase">NIM</span><span className="text-xs font-bold text-slate-800">{selectedLab.currentBorrower.nim}</span></div>
                        <div className="flex justify-between border-b border-slate-200 pb-2"><span className="text-xs font-bold text-slate-400 uppercase">Prodi</span><span className="text-xs font-bold text-slate-800">{selectedLab.currentBorrower.prodi}</span></div>
                        <div className="flex justify-between border-b border-slate-200 pb-2"><span className="text-xs font-bold text-slate-400 uppercase">Kelas</span><span className="text-xs font-bold text-slate-800">{selectedLab.currentBorrower.kelas}</span></div>
                        <div className="flex justify-between"><span className="text-xs font-bold text-slate-400 uppercase">Mulai</span><span className="text-xs font-bold text-[#E40082]">{selectedLab.currentBorrower.jamMasuk}</span></div>
                      </>
                    ) : (
                      <p className="text-center text-sm text-slate-400 italic py-4">Tidak ada peminjaman aktif.</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setSelectedLab(null)} className="flex-1 py-3 bg-slate-100 text-slate-500 rounded-xl font-bold text-xs uppercase">Tutup</button>
                    {selectedLab.currentBorrower && (
                      <button onClick={() => setModalType("checkout")} className="flex-1 py-3 bg-[#263C92] text-white rounded-xl font-bold text-xs uppercase">Checkout</button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-red-50 border border-red-100 p-3 rounded-xl flex gap-3">
                    <ShieldExclamationIcon className="h-5 w-5 text-red-500 shrink-0" />
                    <p className="text-xs font-bold text-red-600 leading-snug">Kelalaian checklist akan mengakibatkan pemblokiran KTM otomatis.</p>
                  </div>
                  <div className="space-y-2">
                    {[
                      { key: 'clean', label: 'Meja & Lantai Bersih' },
                      { key: 'gear', label: 'PC Sudah Mati' },
                      { key: 'noDamage', label: 'Barang Lengkap' }
                    ].map((item) => (
                      <label key={item.key} className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-xl cursor-pointer border border-slate-100">
                        <input type="checkbox" className="w-4 h-4 text-[#E40082]" checked={(checklist as any)[item.key]} onChange={(e) => setChecklist({ ...checklist, [item.key]: e.target.checked })} />
                        <span className="text-sm font-medium text-slate-700">{item.label}</span>
                      </label>
                    ))}
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleAction(checklist.clean && checklist.gear && checklist.noDamage ? "normal" : "block")}
                      className={`w-full py-3.5 rounded-xl text-white font-bold text-xs uppercase ${checklist.clean && checklist.gear && checklist.noDamage ? 'bg-[#263C92]' : 'bg-red-600'}`}
                    >
                      {checklist.clean && checklist.gear && checklist.noDamage ? "Selesaikan" : "Blokir & Selesaikan"}
                    </button>
                    <button onClick={() => setModalType("detail")} className="w-full py-2 text-xs font-bold text-slate-400 uppercase">Kembali</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- CONFIRM DELETE MODAL --- */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-xs w-full text-center shadow-2xl">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrashIcon className="h-8 w-8" />
            </div>
            <h3 className="font-bold text-lg mb-2">Hapus Lab?</h3>
            <p className="text-slate-500 text-sm mb-6">Data ini akan dihapus permanen dari sistem.</p>
            <div className="flex gap-3">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3 text-slate-400 font-bold text-xs">BATAL</button>
              <button onClick={handleDeleteLab} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold text-xs uppercase">HAPUS</button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL DAFTAR KTM TERBLOKIR --- */}
      {isBlokirModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            <div className="bg-red-600 p-6 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <ShieldExclamationIcon className="h-7 w-7" />
                <div>
                  <h2 className="text-xl font-bold">Daftar KTM Terblokir</h2>
                  <p className="text-xs text-red-100 italic">Bulan: {currentMonthName} 2026</p>
                </div>
              </div>
              <button onClick={() => setIsBlokirModalOpen(false)} className="hover:rotate-90 transition-transform">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto">
              <div className="flex justify-between items-center mb-4 px-2">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Menampilkan 10 Daftar Terbaru</span>
                <button
                  onClick={() => alert('Membuka Halaman Laporan Lengkap...')}
                  className="flex items-center gap-1.5 text-[#263C92] text-[10px] font-bold uppercase hover:underline"
                >
                  <DocumentTextIcon className="h-3.5 w-3.5" /> Lihat Daftar Full di Laporan
                </button>
              </div>

              {laporanBlokir.length > 0 ? (
                <div className="space-y-3">
                  {/* LIMIT 10 DATA */}
                  {laporanBlokir.slice(0, 10).map((item, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs italic">
                          #{idx + 1}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800">{item.nama}</h4>
                          <p className="text-xs font-bold text-[#E40082]">{item.nim}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:flex gap-4 text-[10px] font-bold uppercase">
                        <div className="space-y-1">
                          <p className="text-slate-400">Lokasi Lab</p>
                          <p className="text-slate-700">{item.lab}</p>
                        </div>
                        <div className="space-y-1 border-l border-slate-200 pl-4">
                          <p className="text-slate-400">Waktu</p>
                          <p className="text-slate-700">{item.tanggal}</p>
                        </div>
                      </div>
                      <div className="bg-red-50 px-3 py-2 rounded-lg border border-red-100">
                        <p className="text-[10px] font-bold text-red-600 uppercase mb-0.5">Alasan</p>
                        <p className="text-xs text-red-800 italic">{item.alasan}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <CheckBadgeIcon className="h-16 w-16 text-emerald-100 mx-auto mb-4" />
                  <p className="text-slate-400 font-medium italic text-sm">Belum ada KTM yang terblokir di bulan {currentMonthName}.</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
              <p className="text-[10px] text-slate-400 font-medium italic">* Data otomatis terarsip setiap pergantian bulan.</p>
              <button
                onClick={() => setIsBlokirModalOpen(false)}
                className="px-6 py-2 bg-slate-200 text-slate-600 rounded-xl font-bold text-xs uppercase hover:bg-slate-300"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}