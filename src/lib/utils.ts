import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { REGION_MAP } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseRevenue(
  rev: string | null,
): { low: number; high: number; mid: number } | null {
  if (!rev || rev === "TBD" || rev === "—") return null;

  const cleaned = rev.replace(/[,$]/g, "");
  const numbers: number[] = [];

  const matches = cleaned.match(/[\d.]+\s*[MmKk]?/g);
  if (!matches) return null;

  for (const m of matches) {
    const trimmed = m.trim();
    let num = parseFloat(trimmed);
    if (isNaN(num)) continue;
    if (/[Mm]/.test(trimmed)) num *= 1_000_000;
    else if (/[Kk]/.test(trimmed)) num *= 1_000;
    else if (num < 1000) num *= 1_000_000; // bare number like "5" → $5M
    numbers.push(num);
  }

  if (numbers.length === 0) return null;
  if (numbers.length === 1) {
    const val = numbers[0]!;
    return { low: val, high: val, mid: val };
  }
  const low = Math.min(...numbers);
  const high = Math.max(...numbers);
  return { low, high, mid: (low + high) / 2 };
}

export function formatRevenue(amount: number): string {
  if (amount >= 1_000_000_000) return `$${(amount / 1_000_000_000).toFixed(1)}B`;
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(0)}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
  return `$${amount}`;
}

export function timeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(months / 12);
  return `${years}y ago`;
}

export function inferRegion(location: string): string | null {
  if (!location) return null;
  const lower = location.toLowerCase();
  if (lower.includes("canada") || lower.includes("international"))
    return "International";

  // Match 2-letter state abbreviation at end of string or after comma
  const stateMatch = /,\s*([A-Z]{2})\s*$/.exec(location);
  if (stateMatch?.[1]) {
    return REGION_MAP[stateMatch[1]] ?? null;
  }

  // Also try matching "N. Canton, OH" pattern
  const altMatch = /\b([A-Z]{2})\s*$/.exec(location);
  if (altMatch?.[1]) {
    return REGION_MAP[altMatch[1]] ?? null;
  }

  return null;
}

export function inferRevenueBracket(rev: string): string {
  const parsed = parseRevenue(rev);
  if (!parsed) return "TBD";

  const mid = parsed.mid;
  if (mid < 1_000_000) return "<$1M";
  if (mid < 3_000_000) return "$1M-$3M";
  if (mid < 5_000_000) return "$3M-$5M";
  if (mid < 10_000_000) return "$5M-$10M";
  if (mid < 25_000_000) return "$10M-$25M";
  if (mid < 50_000_000) return "$25M-$50M";
  if (mid < 100_000_000) return "$50M-$100M";
  return "$100M+";
}

export function daysBetween(d1: Date, d2: Date): number {
  const diff = Math.abs(d1.getTime() - d2.getTime());
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatFullDateTime(date: Date): string {
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
