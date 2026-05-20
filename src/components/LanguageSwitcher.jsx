import { useLanguage } from '../i18n/LanguageContext.jsx';

export default function LanguageSwitcher({ className = '' }) {
  const { locale, setLocale } = useLanguage();

  return (
    <div
      className={`flex overflow-hidden rounded-xl border border-white/15 bg-white/[0.04] backdrop-blur-md ${className}`}
    >
      {['tr', 'en'].map((lang) => (
        <button
          key={lang}
          type="button"
          onClick={() => setLocale(lang)}
          className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider transition ${
            locale === lang
              ? 'bg-gradient-to-b from-valorant-red to-[#d6306f] text-white shadow-glow-soft'
              : 'bg-transparent text-white/50 hover:text-white'
          }`}
          aria-label={lang === 'tr' ? 'Türkçe' : 'English'}
        >
          {lang}
        </button>
      ))}
    </div>
  );
}
