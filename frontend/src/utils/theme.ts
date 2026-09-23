import type { ThemeMode } from '../types';

export const THEME_STORAGE_KEY = 'image-prompt-library.theme.v1';
export const DEFAULT_THEME: ThemeMode = 'system';

export function normalizeTheme(value: string | null | undefined): ThemeMode {
  return value === 'light' || value === 'dark' ? value : DEFAULT_THEME;
}

export function loadTheme(): ThemeMode {
  if (typeof window === 'undefined') return DEFAULT_THEME;
  try { return normalizeTheme(window.localStorage.getItem(THEME_STORAGE_KEY)); }
  catch { return DEFAULT_THEME; }
}

export function applyTheme(mode: ThemeMode) {
  const dark = mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.setAttribute('content', dark ? '#1b1a19' : '#f3f2ed');
}

export function applyStoredTheme() {
  if (typeof document !== 'undefined') applyTheme(loadTheme());
}
