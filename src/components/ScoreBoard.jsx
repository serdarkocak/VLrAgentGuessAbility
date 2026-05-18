import { motion } from 'framer-motion';
import { useLanguage } from '../i18n/LanguageContext.jsx';

export default function ScoreBoard({ score, questionIndex, totalQuestions, lives, mode }) {
  const { t, tMode } = useLanguage();
  const showLives = mode === 'classic' || mode === 'daily';
  const showQ = mode !== 'timed';

  return (
    <div className="flex items-center gap-2 sm:gap-4">
      <span className="hidden rounded-sm bg-valorant-red px-2 py-0.5 font-valorant text-sm text-white sm:block">
        {tMode(mode)}
      </span>

      <div className="flex items-baseline gap-1">
        <span className="text-xs uppercase tracking-widest text-white/40">{t('game.score')}</span>
        <motion.span
          key={score}
          initial={{ scale: 1.4, color: '#FF4655' }}
          animate={{ scale: 1, color: '#ECE8E1' }}
          className="font-valorant text-2xl text-white"
        >
          {score}
        </motion.span>
      </div>

      {showQ && (
        <div className="flex items-baseline gap-1">
          <span className="text-xs uppercase tracking-widest text-white/40">{t('game.question')}</span>
          <span className="font-valorant text-xl text-white">
            {Math.min(questionIndex + 1, totalQuestions)}/{totalQuestions}
          </span>
        </div>
      )}

      {showLives && (
        <div className="ml-auto flex gap-0.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <motion.span
              key={i}
              animate={i >= lives ? { scale: [1.2, 0.8, 1] } : {}}
              className={`text-xl leading-none ${i < lives ? 'text-valorant-red' : 'text-white/15'}`}
            >
              ♥
            </motion.span>
          ))}
        </div>
      )}
    </div>
  );
}
