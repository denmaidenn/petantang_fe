"use client";

import { useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import type { Notification } from "@/lib/api";

function formatRelativeTimeId(createdAt: string): string {
  try {
    const d = new Date(createdAt);
    const diffSec = Math.floor((Date.now() - d.getTime()) / 1000);
    if (diffSec < 45) return "Baru saja";
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)} menit lalu`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} jam lalu`;
    if (diffSec < 604800) return `${Math.floor(diffSec / 86400)} hari lalu`;
    return d.toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  } catch {
    return createdAt;
  }
}

function typeLabelId(type: Notification["type"]): string {
  switch (type) {
    case "booking_request":
      return "Permintaan masuk lab (perlu tindakan di Dashboard)";
    case "admin_action_approve":
      return "Riwayat tindakan: menyetujui peminjaman";
    case "admin_action_reject":
      return "Riwayat tindakan: menolak peminjaman";
    case "booking_pending":
      return "Menunggu keputusan admin";
    case "booking_approved":
      return "Peminjaman disetujui";
    case "booking_rejected":
      return "Peminjaman ditolak";
    default:
      return String(type);
  }
}

function formatDataValue(v: unknown): string {
  if (v === null || v === undefined) return "—";
  if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") return String(v);
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}

export function NotificationDetailModal({
  notification,
  onClose,
  onOpenRelatedPage,
  defaultRelatedHref,
  relatedButtonLabel,
}: {
  notification: Notification | null;
  onClose: () => void;
  onOpenRelatedPage: (href: string) => void;
  defaultRelatedHref: string;
  relatedButtonLabel: string;
}) {
  useEffect(() => {
    if (!notification) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [notification, onClose]);

  if (!notification) return null;

  const data = (notification.data ?? {}) as Record<string, unknown>;
  const hrefRaw = typeof data.href === "string" ? data.href : null;
  const effectiveHref = hrefRaw ?? defaultRelatedHref;
  const pidRaw = data.peminjaman_id;
  const peminjamanId =
    typeof pidRaw === "number"
      ? pidRaw
      : typeof pidRaw === "string" && pidRaw.trim() !== ""
        ? Number(pidRaw)
        : null;
  const peminjamanDisplay = peminjamanId !== null && !Number.isNaN(peminjamanId) ? String(peminjamanId) : null;

  const extraRows = Object.entries(data).filter(
    ([key]) => key !== "href" && key !== "peminjaman_id"
  );

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px]"
        aria-label="Tutup"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="notif-detail-title"
        className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="flex items-start justify-between gap-3 px-4 py-3 border-b border-slate-100 bg-slate-50/80">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Detail notifikasi</p>
            <h2 id="notif-detail-title" className="text-sm font-bold text-slate-900 mt-0.5 leading-snug">
              {notification.title}
            </h2>
            <p className="text-[10px] text-slate-500 mt-1 leading-snug">{typeLabelId(notification.type)}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 p-1.5 rounded-lg text-slate-500 hover:bg-slate-200/80 hover:text-slate-800 transition-colors"
            aria-label="Tutup dialog"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="px-4 py-3 max-h-[min(60vh,420px)] overflow-y-auto space-y-3 text-left">
          <p className="text-[13px] text-slate-700 leading-relaxed">{notification.message}</p>

          <dl className="grid gap-2 text-[11px]">
            {notification.lab ? (
              <div className="flex gap-2 justify-between border-b border-slate-100 pb-2">
                <dt className="text-slate-500 font-semibold shrink-0">Laboratorium</dt>
                <dd className="text-slate-900 font-bold text-right">{notification.lab}</dd>
              </div>
            ) : null}
            {peminjamanDisplay ? (
              <div className="flex gap-2 justify-between border-b border-slate-100 pb-2">
                <dt className="text-slate-500 font-semibold shrink-0">ID peminjaman</dt>
                <dd className="text-slate-900 font-mono font-bold text-right">{peminjamanDisplay}</dd>
              </div>
            ) : null}
            <div className="flex gap-2 justify-between border-b border-slate-100 pb-2">
              <dt className="text-slate-500 font-semibold shrink-0">Status</dt>
              <dd className="text-slate-900 font-bold text-right">
                {notification.status === "pending" ? "Belum dibaca" : "Selesai / dibaca"}
              </dd>
            </div>
            <div className="flex gap-2 justify-between border-b border-slate-100 pb-2">
              <dt className="text-slate-500 font-semibold shrink-0">Waktu</dt>
              <dd className="text-right">
                <span className="text-slate-800 font-semibold block">{formatRelativeTimeId(notification.created_at)}</span>
                <span className="text-[10px] text-slate-400">{new Date(notification.created_at).toLocaleString("id-ID")}</span>
              </dd>
            </div>
            <div className="flex gap-2 justify-between">
              <dt className="text-slate-500 font-semibold shrink-0">ID notifikasi</dt>
              <dd className="text-slate-900 font-mono font-bold text-right">#{notification.id}</dd>
            </div>
          </dl>

          {extraRows.length > 0 ? (
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-2">Data tambahan</p>
              <dl className="space-y-1.5">
                {extraRows.map(([key, val]) => (
                  <div key={key} className="flex gap-2 justify-between text-[10px]">
                    <dt className="text-slate-500 font-medium shrink-0">{key}</dt>
                    <dd className="text-slate-800 text-right break-all font-mono">{formatDataValue(val)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}

          {hrefRaw ? (
            <p className="text-[10px] text-slate-400 leading-snug">
              Tautan terkait: <span className="font-mono text-slate-600">{hrefRaw}</span>
            </p>
          ) : (
            <p className="text-[10px] text-slate-400 leading-snug">
              Halaman terkait memakai default: <span className="font-mono text-slate-600">{defaultRelatedHref}</span>
            </p>
          )}
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-2 p-4 border-t border-slate-100 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={() => {
              onOpenRelatedPage(effectiveHref);
              onClose();
            }}
            className="flex-1 py-2.5 rounded-xl bg-[#263C92] text-white text-xs font-bold hover:bg-[#1a2b6d] transition-colors"
          >
            {relatedButtonLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
