import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLanguage } from '../i18n/LanguageContext.jsx';

/**
 * Button that copies `value` to the clipboard and briefly swaps its label
 * for an animated check + "Copied" indicator.
 *
 * Falls back to a synchronous `execCommand('copy')` when the async Clipboard
 * API is unavailable (insecure context, older browsers).
 */
export default function CopyButton({
  value,
  children,
  className = '',
  copiedLabel,
  resetMs = 1600,
  disabled = false,
  ariaLabel,
}) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const timerRef = useRef(null);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  const handleCopy = useCallback(async () => {
    const text = String(value ?? '');
    if (!text) return;

    let ok = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        ok = true;
      }
    } catch {
      ok = false;
    }

    if (!ok && typeof document !== 'undefined') {
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        ok = document.execCommand('copy');
        document.body.removeChild(ta);
      } catch {
        ok = false;
      }
    }

    if (!ok) return;

    setCopied(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopied(false), resetMs);
  }, [value, resetMs]);

  const label = copiedLabel ?? t('common.copied');

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={disabled}
      aria-live="polite"
      aria-label={ariaLabel}
      data-copied={copied || undefined}
      className={`relative inline-flex items-center justify-center gap-2 overflow-hidden transition-colors ${
        copied ? 'border-valorant-red text-valorant-red' : ''
      } ${className}`}
    >
      <span aria-hidden={copied} className={copied ? 'invisible' : 'inline-flex items-center gap-2'}>
        {children}
      </span>

      <AnimatePresence>
        {copied && (
          <motion.span
            key="copied"
            className="absolute inset-0 inline-flex items-center justify-center gap-2"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            <motion.svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ scale: 0.6, rotate: -8 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 380, damping: 18 }}
              aria-hidden="true"
            >
              <motion.path
                d="M4 12.5l5 5L20 6.5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.32, ease: 'easeOut', delay: 0.05 }}
              />
            </motion.svg>
            <span className="font-semibold">{label}</span>
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
