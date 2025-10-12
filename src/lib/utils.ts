import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatMetricNumber(
  value: number | null | undefined,
  options: Intl.NumberFormatOptions = {}
): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "N/A";
  }

  let minimumFractionDigits =
    options.minimumFractionDigits ?? (value % 1 !== 0 ? 1 : 0);
  let maximumFractionDigits =
    options.maximumFractionDigits ?? Math.max(minimumFractionDigits, 1);

  if (maximumFractionDigits < minimumFractionDigits) {
    if (options.maximumFractionDigits !== undefined) {
      minimumFractionDigits = maximumFractionDigits;
    } else {
      maximumFractionDigits = minimumFractionDigits;
    }
  }

  const formatter = new Intl.NumberFormat("en-US", {
    ...options,
    minimumFractionDigits,
    maximumFractionDigits,
  });

  return formatter.format(value);
}
