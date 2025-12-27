import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateTrackingId(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BLD-${dateStr}-${randomStr}`;
}

export function formatDate(date: Date | string, locale: string = "bn-BD"): string {
  const d = new Date(date);
  return d.toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateTime(date: Date | string, locale: string = "bn-BD"): string {
  const d = new Date(date);
  return d.toLocaleString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRelativeTime(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "এইমাত্র";
  if (diffMins < 60) return `${diffMins} মিনিট আগে`;
  if (diffHours < 24) return `${diffHours} ঘণ্টা আগে`;
  if (diffDays < 7) return `${diffDays} দিন আগে`;
  return formatDate(date);
}

export function getUrgencyLevel(
  neededBy: Date | string
): "critical" | "urgent" | "normal" {
  const needed = new Date(neededBy);
  const now = new Date();
  const diffHours = (needed.getTime() - now.getTime()) / 3600000;

  if (diffHours <= 6) return "critical";
  if (diffHours <= 24) return "urgent";
  return "normal";
}

export function getUrgencyLabel(level: "critical" | "urgent" | "normal"): string {
  switch (level) {
    case "critical":
      return "জরুরি";
    case "urgent":
      return "জরুরি প্রয়োজন";
    case "normal":
      return "সাধারণ";
  }
}

export function getBloodGroupLabel(group: string): string {
  const labels: Record<string, string> = {
    "A+": "এ পজিটিভ (A+)",
    "A-": "এ নেগেটিভ (A-)",
    "B+": "বি পজিটিভ (B+)",
    "B-": "বি নেগেটিভ (B-)",
    "AB+": "এবি পজিটিভ (AB+)",
    "AB-": "এবি নেগেটিভ (AB-)",
    "O+": "ও পজিটিভ (O+)",
    "O-": "ও নেগেটিভ (O-)",
  };
  return labels[group] || group;
}

export function getCompatibleBloodGroups(bloodGroup: string): string[] {
  const compatibility: Record<string, string[]> = {
    "A+": ["A+", "A-", "O+", "O-"],
    "A-": ["A-", "O-"],
    "B+": ["B+", "B-", "O+", "O-"],
    "B-": ["B-", "O-"],
    "AB+": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    "AB-": ["A-", "B-", "AB-", "O-"],
    "O+": ["O+", "O-"],
    "O-": ["O-"],
  };
  return compatibility[bloodGroup] || [];
}

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} মিটার`;
  }
  return `${km.toFixed(1)} কি.মি.`;
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    submitted: "জমা হয়েছে",
    approved: "অনুমোদিত",
    volunteer_assigned: "স্বেচ্ছাসেবক নিযুক্ত",
    donor_assigned: "দাতা নিযুক্ত",
    donor_confirmed: "দাতা নিশ্চিত",
    in_progress: "চলমান",
    completed: "সম্পন্ন",
    cancelled: "বাতিল",
  };
  return labels[status] || status;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    submitted: "bg-yellow-500",
    approved: "bg-blue-500",
    volunteer_assigned: "bg-indigo-500",
    donor_assigned: "bg-purple-500",
    donor_confirmed: "bg-teal-500",
    in_progress: "bg-orange-500",
    completed: "bg-green-500",
    cancelled: "bg-gray-500",
  };
  return colors[status] || "bg-gray-500";
}


