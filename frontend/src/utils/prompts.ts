import type { PromptRecord, UiLanguage } from '../types';

export type PromptLanguage = 'zh_hant' | 'zh_hans' | 'en';
export type PromptCopyLanguage = PromptLanguage | 'origin';

export const PROMPT_LANGUAGE_LABELS: Record<PromptLanguage, string> = {
  zh_hant: '繁中',
  zh_hans: '簡中',
  en: 'English',
};

export const PROMPT_COPY_LANGUAGE_LABELS: Record<UiLanguage, Record<PromptCopyLanguage, string>> = {
  zh_hant: { origin: '原文', en: '英文', zh_hant: '繁中', zh_hans: '簡中' },
  zh_hans: { origin: '原文', en: '英文', zh_hant: '繁中', zh_hans: '简中' },
  en: { origin: 'Origin', en: 'English', zh_hant: 'zh-Hant', zh_hans: 'zh-Hans' },
};

export function getPromptCopyLanguageLabel(language: PromptCopyLanguage, uiLanguage: UiLanguage): string {
  return PROMPT_COPY_LANGUAGE_LABELS[uiLanguage]?.[language] || PROMPT_COPY_LANGUAGE_LABELS.en[language];
}

export const DEFAULT_PROMPT_LANGUAGE: PromptCopyLanguage = 'origin';

// Legacy imports sometimes store an original Chinese or Japanese prompt in
// the English slot. Keep the stored key stable; only correct its visible badge.
export function originalPromptScript(prompt?: Pick<PromptRecord, 'language' | 'text' | 'is_original'>): 'zh' | 'ja' | undefined {
  if (!prompt?.is_original || prompt.language !== 'en') return undefined;
  const letters = (prompt.text.match(/\p{L}/gu) || []).length;
  const han = (prompt.text.match(/\p{Script=Han}/gu) || []).length;
  const kana = (prompt.text.match(/[\p{Script=Hiragana}\p{Script=Katakana}]/gu) || []).length;
  if (letters < 24) return undefined;
  if (kana >= 8 && (han + kana) / letters >= 0.5) return 'ja';
  if (han >= 24 && kana < 8 && han / letters >= 0.5) return 'zh';
  return undefined;
}

export function normalizePromptLanguage(value?: string | null): PromptCopyLanguage {
  if (value === 'origin' || value === 'zh_hant' || value === 'zh_hans' || value === 'en') return value;
  return DEFAULT_PROMPT_LANGUAGE;
}

export function resolveOriginalPrompt<T extends Pick<PromptRecord, 'language' | 'text' | 'is_original'>>(
  prompts: T[] | undefined,
): T | undefined {
  const usable = (prompts || []).filter(prompt => prompt.text.trim().length > 0);
  return usable.find(prompt => prompt.is_original) || usable.find(prompt => prompt.language === 'en') || usable[0];
}

export function resolvePromptText(
  prompts: Array<Pick<PromptRecord, 'language' | 'text' | 'is_original'>> | undefined,
  preferredLanguage: PromptCopyLanguage,
  fallbackTitle = '',
): string {
  const usable = (prompts || []).filter(prompt => prompt.text.trim().length > 0);
  if (preferredLanguage === 'origin') return resolveOriginalPrompt(usable)?.text || fallbackTitle;
  const preferred = usable.find(prompt => prompt.language === preferredLanguage);
  const english = usable.find(prompt => prompt.language === 'en');
  const original = resolveOriginalPrompt(usable);
  const anyPrompt = usable[0];
  return preferred?.text || english?.text || original?.text || anyPrompt?.text || fallbackTitle;
}
