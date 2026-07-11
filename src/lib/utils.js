import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind class names.
 * @param  {...any} inputs
 * @returns {string}
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as Indonesian Rupiah.
 * @param {number} value
 * @returns {string}
 */
export function formatRupiah(value) {
  const n = Number(value) || 0;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

/**
 * Format a unix-seconds timestamp as a readable Indonesian date-time.
 * @param {number|null|undefined} seconds
 * @param {boolean} [withTime=true]
 * @returns {string}
 */
export function formatDate(seconds, withTime = true) {
  if (!seconds) return "-";
  const date = new Date(seconds * 1000);
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    ...(withTime ? { timeStyle: "short" } : {}),
  }).format(date);
}

/**
 * Convert a datetime-local input value to unix seconds.
 * @param {string} value
 * @returns {number|null}
 */
export function toUnixSeconds(value) {
  if (!value) return null;
  const ms = new Date(value).getTime();
  if (Number.isNaN(ms)) return null;
  return Math.floor(ms / 1000);
}

/** Current unix seconds. @returns {number} */
export function nowSeconds() {
  return Math.floor(Date.now() / 1000);
}

/**
 * Compute total price for a service + weight, honouring the minimum weight.
 * @param {{pricePerKg:number, minWeight:number}} service
 * @param {number} weight
 * @returns {number}
 */
export function calculatePrice(service, weight) {
  if (!service) return 0;
  const effectiveWeight = Math.max(Number(weight) || 0, service.minWeight || 0);
  return Math.round(effectiveWeight * service.pricePerKg);
}

/**
 * Build an order number: LDR-YYYYMMDD-XXX.
 * @param {number} sequence 1-based sequence for the day
 * @param {Date} [date]
 * @returns {string}
 */
export function buildOrderNumber(sequence, date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const seq = String(sequence).padStart(3, "0");
  return `LDR-${y}${m}${d}-${seq}`;
}

/** YYYYMMDD for today (local). @param {Date} [date] @returns {string} */
export function dateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

/**
 * Human-readable status label (Indonesian).
 * @type {Record<string,string>}
 */
export const STATUS_LABELS = {
  pending: "Menunggu",
  received: "Diterima",
  washing: "Dicuci",
  drying: "Dikeringkan",
  ironing: "Disetrika",
  ready: "Siap Diambil",
  delivered: "Selesai",
};

/** Ordered status flow. @type {string[]} */
export const STATUS_FLOW = [
  "pending",
  "received",
  "washing",
  "drying",
  "ironing",
  "ready",
  "delivered",
];

/**
 * Tailwind classes per status (badge background + text).
 * @type {Record<string,string>}
 */
export const STATUS_STYLES = {
  pending: "bg-gray-100 text-gray-700 ring-gray-500/20",
  received: "bg-blue-100 text-blue-700 ring-blue-500/20",
  washing: "bg-sky-100 text-sky-700 ring-sky-500/20",
  drying: "bg-violet-100 text-violet-700 ring-violet-500/20",
  ironing: "bg-amber-100 text-amber-700 ring-amber-500/20",
  ready: "bg-emerald-100 text-emerald-700 ring-emerald-500/20",
  delivered: "bg-green-100 text-green-700 ring-green-500/20",
};
