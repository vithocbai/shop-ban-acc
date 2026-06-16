import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number | string): string {
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(numericPrice)) return "0đ";
  
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(numericPrice);
}

export function formatDate(dateStr?: string | Date | null, fallback = "—"): string {
  if (!dateStr) return fallback;
  try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return fallback;
      return format(d, "dd/MM/yyyy HH:mm:ss");
  } catch {
      return fallback;
  }
}
