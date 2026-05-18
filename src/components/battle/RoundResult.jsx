import { motion } from 'framer-motion';
import { AGENTS } from '../../data/agents.js';
import { useLanguage } from '../../i18n/LanguageContext.jsx';

export default function RoundResult({ result }) {
  const { t, tSlot } = useLanguage();
  if (!result) return null;

  const agent = AGENTS[result.correctAgent];
  const hasWinner = Boolean(result.winner);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="absolute inset-0 bg-black/70" />
      <motion.div
        className="relative z-10 w-full max-w-sm rounded-sm border-2 border-valorant-red bg-valorant-dark p-6 shadow-2xl"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
      >
        {hasWinner ? (
          <>
            <p className="font-valorant text-3xl text-green-400">{t('battle.roundWon')}</p>
            <p className="mt-2 text-xl font-semibold text-white">{result.winner}</p>
            <p className="mt-1 text-valorant-red">+220</p>
          </>
        ) : (
          <p className="font-valorant text-3xl text-white/70">{t('battle.noWinner')}</p>
        )}

        <p className="mt-4 text-sm text-white/60">
          {t('result.correctAnswer')}{' '}
          <strong className="text-white">
            {agent?.name} — {tSlot(result.correctSlot)}
          </strong>
        </p>

        <ul className="mt-4 space-y-1 border-t border-white/10 pt-3 text-sm">
          {Object.entries(result.scores ?? {})
            .sort(([, a], [, b]) => b - a)
            .map(([name, score]) => (
              <li key={name} className="flex justify-between">
                <span className={name === result.winner ? 'text-green-400' : 'text-white/70'}>
                  {name}
                </span>
                <span className="font-valorant">{score}</span>
              </li>
            ))}
        </ul>
      </motion.div>
    </motion.div>
  );
}
