/**
 * Smart-Lab SV IPB — API Service Layer
 * Centralized API calls to the ScanKTM backend (FastAPI).
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ─── Types ───────────────────────────────────────────────

export interface ScanResult {
  nim_final: string | null;
  nama: string | null;
  nim_ocr: string | null;
  nim_qr: string | null;
  db_verified: boolean;
  db_nama: string | null;
  action_required: "face_enroll" | "face_verify" | null;
  detections: Array<{
    class_name: string;
    confidence: number;
    bbox: number[];
  }>;
  processing_time_ms: number;
}

export interface FaceResponse {
  status: string;
  nim?: string;
  nama?: string;
  similarity?: number;
  message?: string;
  checkin?: {
    success: boolean;
    message: string;
    waktu_masuk?: string;
  };
  processing_time_ms: number;
}

export class ApiError extends Error {
  public status: number;
  public detail: string;

  constructor(detail: string, status: number) {
    super(detail);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
    // Maintain stack trace in V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
}

interface FetchOptions extends RequestInit {
  timeoutMs?: number;
  token?: string | null;
}

/**
 * Universal fetcher with built-in AbortController and standard Error Parsing.
 */
async function fetchAPI<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { timeoutMs = 15000, token, headers, ...config } = options;

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  const requestHeaders = new Headers(headers);
  if (token) {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...config,
      headers: requestHeaders,
      signal: controller.signal,
    });

    clearTimeout(id);

    if (!res.ok) {
      let errDetail = `Error ${res.status}`;
      try {
        const errorData = await res.json();
        if (errorData.detail) errDetail = typeof errorData.detail === 'string'
          ? errorData.detail
          : JSON.stringify(errorData.detail);
      } catch (e) {
        // Fallback if parsing fails (e.g., 502 Bad Gateway HTML response)
      }
      throw new ApiError(errDetail, res.status);
    }

    return (await res.json()) as T;
  } catch (error: any) {
    clearTimeout(id);
    if (error.name === "AbortError") {
      throw new ApiError("Koneksi lambat. Request time out.", 408);
    }
    if (error instanceof ApiError) throw error;

    // Generic Network Error
    throw new ApiError(error.message || "Gagal menghubungi server.", 0);
  }
}

// ─── Helpers ─────────────────────────────────────────────

/**
 * Capture a single frame from a <video> element as base64 JPEG.
 * Returns the raw base64 string (no data URI prefix).
 */
export function captureFrameAsBase64(
  videoElement: HTMLVideoElement,
  quality: number = 0.85
): string {
  const canvas = document.createElement("canvas");
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Cannot get canvas context");
  ctx.drawImage(videoElement, 0, 0);
  const dataUrl = canvas.toDataURL("image/jpeg", quality);
  return dataUrl.split(",")[1]; // strip "data:image/jpeg;base64,"
}

/**
 * Capture a single frame from a <video> element as a Blob.
 */
export function captureFrameAsBlob(
  videoElement: HTMLVideoElement,
  quality: number = 0.85
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return reject(new Error("Cannot get canvas context"));
    ctx.drawImage(videoElement, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Canvas toBlob failed"));
      },
      "image/jpeg",
      quality
    );
  });
}

// ─── API Functions ───────────────────────────────────────

/**
 * Check if the backend is alive and ML pipeline is ready.
 */
export function checkHealth(): Promise<{ status: string; pipeline_ready: boolean; }> {
  return fetchAPI<{ status: string; pipeline_ready: boolean; }>("/health", { timeoutMs: 5000 });
}

/**
 * Scan a KTM image. Sends the image as multipart form data.
 */
export function scanKTM(imageBlob: Blob): Promise<ScanResult> {
  const formData = new FormData();
  formData.append("file", imageBlob, "ktm.jpg");
  return fetchAPI<ScanResult>("/api/scan", { method: "POST", body: formData });
}

/**
 * Enroll a new face (first time registration).
 */
export function enrollFace(nim: string, nama: string, imageBase64: string): Promise<FaceResponse> {
  return fetchAPI<FaceResponse>("/api/face/enroll", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nim, nama, image_base64: imageBase64 }),
  });
}

/**
 * Verify a face for daily attendance.
 */
export function verifyFace(nim: string, imageBase64: string): Promise<FaceResponse> {
  return fetchAPI<FaceResponse>("/api/face/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nim, image_base64: imageBase64 }),
  });
}

/**
 * Check out a student from the lab.
 */
export function checkout(nim: string, token: string): Promise<{ success: boolean; message: string }> {
  return fetchAPI<{ success: boolean; message: string }>(`/api/checkout/${nim}`, {
    method: "POST",
    token
  });
}

// ─── Admin API Functions ─────────────────────────────────

/**
 * [ADMIN] Login to get JWT access token
 */
export function adminLogin(username: string, password: string): Promise<{ access_token: string, token_type: string }> {
  const formData = new URLSearchParams();
  formData.append('username', username);
  formData.append('password', password);

  return fetchAPI<{ access_token: string, token_type: string }>("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formData.toString()
  });
}

export interface Peminjaman {
  id: number;
  nim: string;
  nama: string;
  lab: string;
  waktu_masuk: string;
  waktu_keluar: string | null;
  status: "aktif" | "selesai" | "menunggu" | "ditolak";
}

export interface LabStatusResponse {
  active_count: number;
  pending_count: number;
  peminjaman: Peminjaman[];
  peminjaman_pending: Peminjaman[];
}

/**
 * [ADMIN] Setujui mahasiswa untuk masuk lab.
 */
export function approvePeminjaman(pid: number, token: string): Promise<{ success: boolean; message: string }> {
  return fetchAPI<{ success: boolean; message: string }>(`/api/peminjaman/${pid}/approve`, {
    method: "POST",
    token
  });
}

/**
 * [ADMIN] Tolak mahasiswa masuk lab.
 */
export function rejectPeminjaman(pid: number, token: string): Promise<{ success: boolean; message: string }> {
  return fetchAPI<{ success: boolean; message: string }>(`/api/peminjaman/${pid}/reject`, {
    method: "POST",
    token
  });
}

/**
 * [ADMIN] Get active lab peminjaman.
 */
export function getLabStatus(token: string): Promise<LabStatusResponse> {
  return fetchAPI<LabStatusResponse>("/api/status", { token });
}

/**
 * [ADMIN] Reset/delete face encoding for a student.
 */
export function resetFace(nim: string, token: string): Promise<{ status: string; message: string }> {
  return fetchAPI<{ status: string; message: string }>(`/api/face/${nim}`, {
    method: "DELETE",
    token
  });
}

// ─── Error Message Helper ────────────────────────────────

/**
 * Convert API error status to a user-friendly Indonesian message.
 */
export function getErrorMessage(error: ApiError): string {
  switch (error.status) {
    case 400:
      return "Format gambar tidak valid. Coba foto ulang.";
    case 403:
      return "Wajah tidak cocok dengan data yang terdaftar.";
    case 404:
      return "Data mahasiswa tidak ditemukan di sistem.";
    case 409:
      return "Wajah sudah terdaftar sebelumnya / sedang aktif.";
    case 413:
      return "Ukuran gambar terlalu besar (maks 10MB).";
    case 422:
      return "Wajah tidak terdeteksi. Pastikan wajah terlihat jelas.";
    case 503:
      return "Server sedang memuat model AI. Tunggu beberapa saat...";
    default:
      return error.detail || "Terjadi kesalahan pada server.";
  }
}

