"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ClockIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
  ArchiveBoxIcon,
  ArrowPathIcon,
  MapPinIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";
import {
  getJadwal,
  createJadwal,
  updateJadwal,
  deleteJadwal,
  archiveJadwal,
  type Schedule,
  type ApiError,
} from "@/lib/api";

import Swal from "sweetalert2";

const INITIAL_DATA: Schedule[] = [];

const DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const PRODI_LIST = [
  "Informatika",
  "Sistem Informasi",
  "Teknik Komputer",
  "Akuntansi",
  "Manajemen",
];

export default function JadwalAdminCalendarPage() {
  const router = useRouter();
  const [jadwal, setJadwal] = useState<Schedule[]>(INITIAL_DATA);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterProdi, setFilterProdi] = useState("Semua Prodi");
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const loadJadwal = async () => {
    const token = localStorage.getItem("admin_jwt_token");
    if (!token) {
      router.replace("/auth/login");
      return;
    }

    setIsLoading(true);
    setFetchError(null);

    try {
      const data = await getJadwal(token);
      setJadwal(data);
    } catch (err) {
      const apiErr = err as ApiError;
      setFetchError(apiErr.detail || "Gagal memuat jadwal.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadJadwal();
  }, [router]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [currentData, setCurrentData] = useState<any>(null);
  const [idToDelete, setIdToDelete] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    mataKuliah: "",
    kelas: "",
    prodi: "Informatika",
    lab: "",
    gedung: "",
    hari: "Senin",
    jamMulai: "08:00",
    jamSelesai: "10:00",
    tipeSemester: "Genap",
    tahunAjaran: "2025/2026",
  });

  const headerInfo = useMemo(() => {
    const activeData = jadwal.filter((item) => !item.isArchived);
    if (activeData.length === 0) return "Belum Ada Semester Aktif";
    const lastEntry = activeData[activeData.length - 1];
    return `Semester ${lastEntry.tipeSemester} ${lastEntry.tahunAjaran}`;
  }, [jadwal]);

  // Logika Filter
  const filteredJadwal = useMemo(() => {
    return jadwal.filter((item) => {
      const isActive = !item.isArchived;
      const matchesSearch =
        item.mataKuliah.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.kelas.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesProdi =
        filterProdi === "Semua Prodi" || item.prodi === filterProdi;
      return isActive && matchesSearch && matchesProdi;
    });
  }, [jadwal, searchQuery, filterProdi]);

  // Handlers
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem("admin_jwt_token");
    if (!token) {
      router.replace("/auth/login");
      return;
    }

    try {
      if (currentData) {
        const updated = await updateJadwal(currentData.id, formData, token);
        setJadwal((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        Swal.fire({ icon: "success", title: "Berhasil", text: "Jadwal berhasil diperbarui!", timer: 1500 });
      } else {
        const created = await createJadwal(formData, token);
        setJadwal((prev) => [...prev, created]);
        Swal.fire({ icon: "success", title: "Berhasil", text: "Jadwal baru berhasil ditambahkan!", timer: 1500 });
      }
      setIsModalOpen(false);
    } catch (err) {
      const apiErr = err as ApiError;
      Swal.fire({ icon: "error", title: "Oops...", text: apiErr.detail || "Gagal menyimpan jadwal." });
    }
  };

  const openEditModal = (item: any) => {
    setCurrentData(item);
    setFormData(item);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setCurrentData(null);
    setFormData({
      mataKuliah: "",
      kelas: "",
      prodi: "Informatika",
      lab: "",
      gedung: "",
      hari: "Senin",
      jamMulai: "08:00",
      jamSelesai: "10:00",
      tipeSemester: "Genap",
      tahunAjaran: "2025/2026",
    });
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm px-6 md:px-12 py-5 mb-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="w-1.5 h-10 bg-[#E40082] rounded-full"></span>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Kelola Jadwal Laboratorium
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-sm text-slate-500 font-medium">
                  Sekolah Vokasi IPB
                </p>
                <span className="text-slate-300">•</span>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">
                  {headerInfo}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsArchiveModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-amber-600 hover:bg-amber-50 border border-amber-200 rounded-lg text-xs font-bold uppercase transition-all"
            >
              <ArrowPathIcon className="h-4 w-4" /> Reset Semester
            </button>
            <button
              onClick={openAddModal}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-blue-100 uppercase"
            >
              <PlusIcon className="h-4 w-4" /> Tambah Jadwal
            </button>
          </div>
        </div>
      </header>

      {fetchError && (
        <div className="max-w-7xl mx-auto px-6 mb-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
            {fetchError}
          </div>
        </div>
      )}

      {isLoading && (
        <div className="max-w-7xl mx-auto px-6 mb-4">
          <div className="bg-white border border-slate-200 text-slate-600 px-6 py-4 rounded-lg">
            Memuat jadwal...
          </div>
        </div>
      )}

      <main className="px-6 max-w-[1600px] mx-auto">
        {/* SEARCH & FILTER */}
        <div className="mb-6 flex flex-wrap gap-4 items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="relative flex-1 min-w-[300px]">
            <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari Mata Kuliah..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 transition-all"
            />
          </div>
          <select
            value={filterProdi}
            onChange={(e) => setFilterProdi(e.target.value)}
            className="text-sm font-medium bg-white border border-slate-200 rounded-lg px-4 py-2 outline-none cursor-pointer hover:bg-slate-50"
          >
            <option>Semua Prodi</option>
            {PRODI_LIST.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* CALENDAR GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {DAYS.map((hari) => (
            <div key={hari} className="flex flex-col min-h-[500px]">
              <div className="bg-[#E40082] text-white py-3 px-4 rounded-t-xl text-center shadow-sm">
                <span className="text-sm font-bold uppercase tracking-widest">
                  {hari}
                </span>
              </div>

              <div className="flex-1 bg-white border-x border-b border-slate-200 rounded-b-xl p-3 space-y-3 shadow-sm overflow-y-auto">
                {filteredJadwal.filter((item) => item.hari === hari).length >
                  0 ? (
                  filteredJadwal
                    .filter((item) => item.hari === hari)
                    .map((item) => (
                      <div
                        key={item.id}
                        className="group relative bg-slate-50 border border-slate-100 rounded-lg p-3 hover:border-blue-300 hover:bg-blue-50/30 transition-all"
                      >
                        {/* ADMIN ACTIONS ON HOVER */}
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-1 bg-white border border-slate-200 text-blue-600 rounded shadow-sm hover:bg-blue-600 hover:text-white transition-all"
                          >
                            <PencilSquareIcon className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setIdToDelete(item.id);
                              setIsDeleteModalOpen(true);
                            }}
                            className="p-1 bg-white border border-slate-200 text-red-600 rounded shadow-sm hover:bg-red-600 hover:text-white transition-all"
                          >
                            <TrashIcon className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-600 mb-1">
                          <ClockIcon className="h-3 w-3" />
                          {item.jamMulai} - {item.jamSelesai}
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 uppercase leading-tight pr-8">
                          {item.mataKuliah}
                        </h4>
                        <p className="text-[10px] text-slate-500 mt-1 font-medium">
                          {item.kelas}
                        </p>

                        <div className="mt-3 pt-2 border-t border-slate-200/60 space-y-1">
                          <div className="flex items-center gap-1 text-[10px] text-slate-600">
                            <MapPinIcon className="h-3 w-3 text-[#E40082]" />
                            <span className="font-semibold">{item.lab}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-slate-600">
                            <AcademicCapIcon className="h-3 w-3 text-slate-400" />
                            <span>{item.prodi}</span>
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="h-20 flex items-center justify-center border-2 border-dashed border-slate-100 rounded-lg">
                    <span className="text-[10px] text-slate-300 font-medium italic">
                      Tidak ada jadwal
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* --- MODALS (Tetap Menggunakan Logika Anda) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="font-bold text-slate-800 text-sm uppercase">
                {currentData ? "Ubah Jadwal" : "Tambah Jadwal"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">
                    Nama Mata Kuliah
                  </label>
                  <input
                    required
                    value={formData.mataKuliah}
                    onChange={(e) =>
                      setFormData({ ...formData, mataKuliah: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">
                    Prodi
                  </label>
                  <select
                    value={formData.prodi}
                    onChange={(e) =>
                      setFormData({ ...formData, prodi: e.target.value })
                    }
                    className="w-full px-2 py-2 border border-slate-200 rounded-lg text-sm bg-white outline-none"
                  >
                    {PRODI_LIST.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">
                    Kelas
                  </label>
                  <input
                    required
                    value={formData.kelas}
                    onChange={(e) =>
                      setFormData({ ...formData, kelas: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none"
                    placeholder="INF-P1"
                  />
                </div>
                <div className="space-y-1 text-slate-900">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">
                    Hari
                  </label>
                  <select
                    value={formData.hari}
                    onChange={(e) =>
                      setFormData({ ...formData, hari: e.target.value })
                    }
                    className="w-full px-2 py-2 border border-slate-200 rounded-lg text-sm bg-white outline-none"
                  >
                    {DAYS.map((h) => (
                      <option key={h}>{h}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">
                    Lab
                  </label>
                  <input
                    required
                    value={formData.lab}
                    onChange={(e) =>
                      setFormData({ ...formData, lab: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">
                    Jam Mulai
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.jamMulai}
                    onChange={(e) =>
                      setFormData({ ...formData, jamMulai: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">
                    Jam Selesai
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.jamSelesai}
                    onChange={(e) =>
                      setFormData({ ...formData, jamSelesai: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none"
                  />
                </div>
              </div>
              <div className="pt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-400 uppercase hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold uppercase hover:bg-blue-700 transition-all"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL RESET & DELETE TETAP SAMA SEPERTI KODE AWAL ANDA */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-xs w-full p-6 text-center shadow-xl border border-slate-100">
            <div className="mx-auto w-10 h-10 bg-red-50 rounded-full flex items-center justify-center mb-3 text-red-600">
              <TrashIcon className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 uppercase">
              Hapus Jadwal?
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-6">
              Data akan dihapus permanen.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-2 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-400 uppercase"
              >
                Batal
              </button>
              <button
                onClick={async () => {
                  const token = localStorage.getItem("admin_jwt_token");
                  if (!token) {
                    router.replace("/auth/login");
                    return;
                  }

                  try {
                    if (idToDelete !== null) {
                      await deleteJadwal(idToDelete, token);
                      setJadwal((prev) => prev.filter((j) => j.id !== idToDelete));
                      Swal.fire({ icon: "success", title: "Terhapus!", text: "Jadwal telah dihapus.", timer: 1500 });
                    }
                  } catch (err) {
                    const apiErr = err as ApiError;
                    Swal.fire({ icon: "error", title: "Oops...", text: apiErr.detail || "Gagal menghapus jadwal." });
                  } finally {
                    setIsDeleteModalOpen(false);
                  }
                }}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg text-[10px] font-bold uppercase"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {isArchiveModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-8 text-center shadow-xl">
            <div className="mx-auto w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mb-4 text-amber-600">
              <ArchiveBoxIcon className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 uppercase">
              Reset Semester?
            </h3>
            <p className="text-sm text-slate-500 mt-2 mb-6 leading-relaxed">
              Data saat ini akan diarsipkan dan Anda dapat mulai mengisi jadwal
              baru.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setIsArchiveModalOpen(false)}
                className="flex-1 py-2 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-400 uppercase"
              >
                Batal
              </button>
              <button
                onClick={async () => {
                  const token = localStorage.getItem("admin_jwt_token");
                  if (!token) {
                    router.replace("/auth/login");
                    return;
                  }

                  try {
                    await archiveJadwal(token);
                    await loadJadwal();
                    Swal.fire({ icon: "success", title: "Semester Direset!", text: "Semua jadwal telah diarsipkan.", timer: 1500 });
                  } catch (err) {
                    const apiErr = err as ApiError;
                    Swal.fire({ icon: "error", title: "Oops...", text: apiErr.detail || "Gagal mengarsipkan jadwal." });
                  } finally {
                    setIsArchiveModalOpen(false);
                  }
                }}
                className="flex-1 py-2 bg-amber-600 text-white rounded-lg text-[10px] font-bold uppercase"
              >
                Arsip Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
