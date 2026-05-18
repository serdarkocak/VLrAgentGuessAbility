import { useLanguage } from '../i18n/LanguageContext.jsx';

export default function ShareCard({ score, correct, total, mode, difficulty }) {
  const { t, tMode, tDifficulty } = useLanguage();

  const text = t('result.shareText', {
    score,
    correct,
    total,
    mode: tMode(mode),
    difficulty: tDifficulty(difficulty),
  });

  const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;

  const copyScore = () => {
    navigator.clipboard?.writeText(text);
  };

  return (
    <div className="card-panel flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 className="font-valorant text-xl text-valorant-red">{t('result.shareTitle')}</h3>
        <p className="mt-1 text-sm text-white/60">{t('result.shareDesc')}</p>
      </div>
      <div className="flex gap-3">
        <a href={shareUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">
          {t('result.shareOnX')}
        </a>
        <button type="button" onClick={copyScore} className="btn-secondary">
          {t('result.copy')}
        </button>
      </div>
    </div>
  );
}
