import { useEffect, useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { api } from '../api/client';
import type { GenerationProviderStatus, TitleSuggestionProvider } from '../types';
import type { TranslationKey, Translator } from '../utils/i18n';

const REWRITE_PROVIDERS: Array<{ value: TitleSuggestionProvider; label: string }> = [
  { value: 'openai_codex_oauth_native', label: 'ChatGPT / Codex OAuth' },
  { value: 'xai_grok_oauth', label: 'Grok OAuth' },
];

const PRESETS: Array<{ labelKey: TranslationKey; instruction: string }> = [
  {
    labelKey: 'rewritePromptPresetModeration',
    instruction:
      'Pass upstream content moderation. Replace any wording that reads as voyeuristic, non-consensual, undressed or otherwise sexualised with clearly staged, respectful, fully clothed, consensual equivalents of the same scene. Keep every person explicitly an adult.',
  },
  {
    labelKey: 'rewritePromptPresetCinematic',
    instruction: 'Make it cinematic: 35mm film look, volumetric light, fine grain, realistic skin texture, shallow depth of field, editorial colour grading.',
  },
  {
    labelKey: 'rewritePromptPresetOriental',
    instruction: 'Add refined oriental aesthetics: richer costume detail, elegant fabric rendering, delicate hair strands, soft atmospheric depth.',
  },
  {
    labelKey: 'rewritePromptPresetNeon',
    instruction: 'Move it to a cyberpunk neon night scene: wet reflective streets, neon signage bokeh, strong rim light, moody contrast.',
  },
];

export interface PromptRewriteDialogProps {
  providers: GenerationProviderStatus[];
  initialPrompt: string;
  t: Translator;
  onApply: (rewritten: string) => void;
  onClose: () => void;
}

export function PromptRewriteDialog({ providers, initialPrompt, t, onApply, onClose }: PromptRewriteDialogProps) {
  const [provider, setProvider] = useState<TitleSuggestionProvider>(() => {
    const firstReady = REWRITE_PROVIDERS.find(
      candidate => {
        const status = providers.find(entry => entry.provider === candidate.value);
        return Boolean(status && (status.can_generate ?? (status.available && status.authenticated && status.configured)));
      },
    );
    return firstReady?.value ?? REWRITE_PROVIDERS[0].value;
  });
  const [instruction, setInstruction] = useState('');
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const sourcePrompt = initialPrompt.trim();

  const run = async () => {
    if (!sourcePrompt) {
      setError(t('rewritePromptEmpty'));
      return;
    }
    setRunning(true);
    setError('');
    try {
      const response = await api.rewritePrompt(provider, {
        prompt_text: sourcePrompt,
        custom_instruction: instruction.trim() || null,
      });
      setResult(response.rewritten_prompt);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t('rewritePromptFailed'));
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="rewrite-dialog-overlay" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="rewrite-dialog" role="dialog" aria-modal="true" aria-label={t('rewritePromptTitle')}>
        <header className="rewrite-dialog-head">
          <h2><Sparkles size={17} strokeWidth={2.2} aria-hidden="true" />{t('rewritePromptTitle')}</h2>
          <button type="button" className="rewrite-dialog-close" onClick={onClose} aria-label={t('close')}><X size={18} strokeWidth={2.25} /></button>
        </header>

        <div className="rewrite-dialog-body">
          <fieldset className="rewrite-dialog-field">
            <legend>{t('rewritePromptProvider')}</legend>
            <div className="rewrite-dialog-providers">
              {REWRITE_PROVIDERS.map(candidate => {
                const status = providers.find(entry => entry.provider === candidate.value);
                const ready = Boolean(status && (status.can_generate ?? (status.available && status.authenticated && status.configured)));
                return (
                  <label key={candidate.value} className={`rewrite-dialog-provider${ready ? '' : ' is-unavailable'}`}>
                    <input
                      type="radio"
                      name="rewrite-provider"
                      value={candidate.value}
                      checked={provider === candidate.value}
                      disabled={!ready}
                      onChange={() => setProvider(candidate.value)}
                    />
                    <span>{candidate.label}{ready ? '' : ` · ${t('providerStateUnavailable')}`}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div className="rewrite-dialog-field">
            <span className="rewrite-dialog-legend">{t('rewritePromptPresets')}</span>
            <div className="rewrite-dialog-presets">
              {PRESETS.map(preset => (
                <button key={preset.labelKey} type="button" className="rewrite-dialog-preset" onClick={() => setInstruction(preset.instruction)}>
                  {t(preset.labelKey)}
                </button>
              ))}
            </div>
          </div>

          <label className="rewrite-dialog-field">
            <span className="rewrite-dialog-legend">{t('rewritePromptInstruction')}</span>
            <input
              type="text"
              className="rewrite-dialog-input"
              value={instruction}
              placeholder={t('rewritePromptInstructionPlaceholder')}
              onChange={event => setInstruction(event.currentTarget.value)}
            />
          </label>

          <div className="rewrite-dialog-field">
            <span className="rewrite-dialog-legend">{t('rewritePromptOriginal')}</span>
            <p className="rewrite-dialog-source">{sourcePrompt || '—'}</p>
          </div>

          {result && (
            <div className="rewrite-dialog-field">
              <span className="rewrite-dialog-legend">{t('rewritePromptResult')}</span>
              <p className="rewrite-dialog-result" role="status">{result}</p>
            </div>
          )}
          {error && <p className="rewrite-dialog-error" role="alert">{error}</p>}
        </div>

        <footer className="rewrite-dialog-foot">
          <button type="button" className="secondary" onClick={onClose}>{t('close')}</button>
          <button type="button" className="primary" onClick={run} disabled={running || !sourcePrompt}>
            {running ? t('rewritePromptRunning') : result ? t('rewritePromptRerun') : t('rewritePromptRun')}
          </button>
          {result && (
            <button type="button" className="primary" onClick={() => { onApply(result); onClose(); }}>
              {t('rewritePromptApply')}
            </button>
          )}
        </footer>
      </section>
    </div>
  );
}
