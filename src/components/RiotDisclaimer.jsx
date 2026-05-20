import { useLanguage } from '../i18n/LanguageContext.jsx';

const RIOT_LEGAL_URL = 'https://www.riotgames.com/en/legal#gamefancontent';

export default function RiotDisclaimer({ className = '', compact = false }) {
  const { t } = useLanguage();

  return (
    <p className={`text-white/40 ${compact ? 'text-[11px] leading-snug' : 'text-xs leading-relaxed'} ${className}`}>
      {t('legal.riotDisclaimer')}{' '}
      <a
        href={RIOT_LEGAL_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="text-white/50 underline decoration-white/20 underline-offset-2 transition hover:text-valorant-red"
      >
        {t('legal.riotPolicyLink')}
      </a>
    </p>
  );
}
