import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function generateReferralCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(amount);
}
