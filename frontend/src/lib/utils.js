import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value) {
  const num = Number(value || 0);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(num);
}

export function formatDate(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

// Turn an RTK Query error into a readable message.
// The backend returns { error, details } shapes.
export function getApiError(err, fallback = "Something went wrong") {
  const data = err?.data;
  if (!data) return err?.error || fallback;
  if (typeof data === "string") return data;
  if (data.error && data.details) {
    const detail =
      typeof data.details === "object"
        ? Object.entries(data.details)
            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
            .join("; ")
        : data.details;
    return `${data.error} (${detail})`;
  }
  return data.error || fallback;
}
