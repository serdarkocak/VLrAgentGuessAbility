import { useLanguage } from '../i18n/LanguageContext.jsx';

export default function LanguageSwitcher({ className = '' }) {
  const { locale, setLocale } = useLanguage();

  return (
    <div className={`flex overflow-hidden rounded-sm border border-white/15 ${className}`}>
      {['tr', 'en'].map((lang) => (
        <button
          key={lang}
          type="button"
          onClick={() => setLocale(lang)}
          className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider transition ${
            locale === lang
              ? 'bg-valorant-red text-white'
              : 'bg-transparent text-white/40 hover:text-white'
          }`}
          aria-label={lang === 'tr' ? 'Türkçe' : 'English'}
        >
          {lang}
        </button>
      ))}
    </div>
  );
}
