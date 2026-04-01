import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function resolveAssetUrl(value?: string | null) {
  if (!value) return '';
  if (/^(https?:)?\/\//i.test(value) || value.startsWith('data:') || value.startsWith('blob:')) return value;

  const apiBase ='https://job-finder-4cem.onrender.com/api';
  const serverBase = apiBase.replace(/\/api\/?$/, '');
  return `${serverBase}${value.startsWith('/') ? value : `/${value}`}`;
}
