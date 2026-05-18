import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../i18n/LanguageContext.jsx';

export default function FinalScoreboard({ scores, onLeave }) {
  const { t } = useLanguage();

  return (
    <motion.div
      className="mx-auto max-w-md space-y-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="card-panel p-8 text-center">
        <p className="text-sm uppercase tracking-widest text-white/50">{t('battle.gameOver')}</p>
        <h1 className="mt-2 font-valorant text-4xl text-valorant-red">{t('battle.finalScores')}</h1>
      </div>

      <ul className="card-panel divide-y divide-white/10">
        {scores.map((s, i) => (
          <li key={s.name} className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <span
                className={`font-valorant text-2xl ${
                  i === 0 ? 'text-valorant-red' : 'text-white/40'
                }`}
              >
                #{i + 1}
              </span>
              <span className={`font-semibold ${i === 0 ? 'text-green-400' : 'text-white'}`}>
                {s.name}
              </span>
            </div>
            <span className="font-valorant text-2xl">{s.score}</span>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-3">
        <button type="button" className="btn-primary w-full" onClick={onLeave}>
          {t('battle.backToMenu')}
        </button>
        <Link to="/" className="btn-secondary w-full text-center">
          {t('nav.home')}
        </Link>
      </div>
    </motion.div>
  );
}
