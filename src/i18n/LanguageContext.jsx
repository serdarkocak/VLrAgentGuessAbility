import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { translations, DEFAULT_LOCALE, LOCALES } from './translations.js';

const STORAGE_KEY = 'vq-locale';

const LanguageContext = createContext(null);

function getNested(obj, path) {
  return path.split('.').reduce((acc, key) => acc?.[key], obj);
}

function interpolate(str, params = {}) {
  if (!str || typeof str !== 'string') return str;
  return str.replace(/\{\{(\w+)\}\}/g, (_, key) =>
    params[key] !== undefined ? String(params[key]) : `{{${key}}}`,
  );
}

export function LanguageProvider({ children }) {
  const [locale, setLocaleState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return LOCALES.includes(saved) ? saved : DEFAULT_LOCALE;
  });

  const setLocale = useCallback((next) => {
    if (!LOCALES.includes(next)) return;
    setLocaleState(next);
    localStorage.setItem(STORAGE_KEY, next);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const t = useCallback(
    (key, params) => {
      const value = getNested(translations[locale], key) ?? getNested(translations[DEFAULT_LOCALE], key) ?? key;
      return interpolate(value, params);
    },
    [locale],
  );

  const tMode = useCallback((mode) => t(`modes.${mode}`), [t]);
  const tModeDesc = useCallback((mode) => t(`modes.${mode}Desc`), [t]);
  const tDifficulty = useCallback((d) => t(`difficulties.${d}`), [t]);
  const tDifficultyDesc = useCallback((d) => t(`difficulties.${d}Desc`), [t]);
  const tSlot = useCallback((slot) => t(`slots.${slot}`), [t]);
  const tSlotShort = useCallback((slot) => t(`slots.${slot}Short`), [t]);
  const tRole = useCallback((role) => t(`roles.${role}`) || role, [t]);

  const dateLocale = locale === 'tr' ? 'tr-TR' : 'en-US';

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
      tMode,
      tModeDesc,
      tDifficulty,
      tDifficultyDesc,
      tSlot,
      tSlotShort,
      tRole,
      dateLocale,
    }),
    [locale, setLocale, t, tMode, tModeDesc, tDifficulty, tDifficultyDesc, tSlot, tSlotShort, tRole, dateLocale],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
