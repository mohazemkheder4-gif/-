import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getArabicDayName(dateStr: string) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const targetDate = new Date(dateStr);
  targetDate.setHours(0, 0, 0, 0);
  
  const diffTime = targetDate.getTime() - now.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  const dayName = new Intl.DateTimeFormat('ar-EG', { weekday: 'long' }).format(date);
  
  if (diffDays === 0) return `اليوم (${dayName})`;
  if (diffDays === 1) return `غداً (${dayName})`;
  if (diffDays > 1 && diffDays < 8) return `يوم ${dayName} المقبل`;
  if (diffDays < 0) {
    if (diffDays === -1) return `أمس (${dayName})`;
    return `يوم ${dayName}`;
  }
  
  return `يوم ${dayName}`;
}

export function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
}
