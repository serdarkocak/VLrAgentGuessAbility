import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AGENTS } from '../data/agents.js';
import { getAgentImage } from '../lib/valorantApi.js';
import { useLanguage } from '../i18n/LanguageContext.jsx';

const AUTO_ADVANCE_MS_CORRECT = 1200;
const AUTO_ADVANCE_MS_WRONG = 2200;

export default function ResultCard({ feedback, onContinue }) {
  const { t, tSlot } = useLanguage();
  const [portrait, setPortrait] = useState(null);
  const timerRef = useRef(null);

  const isCorrect = feedback?.type === 'correct';
  const agentId = isCorrect ? feedback?.entry?.question?.agentId : feedback?.correctAgent;
  const slot = isCorrect ? feedback?.entry?.question?.slot : feedback?.correctSlot;
  const agent = agentId ? AGENTS[agentId] : null;
  const points = feedback?.entry?.points ?? 0;

  useEffect(() => {
    if (!feedback || !agentId) return;
    getAgentImage(agentId).then((d) => setPortrait(d?.fullPortrait ?? null));
  }, [feedback, agentId]);

  useEffect(() => {
    if (!feedback) return;
    const delay = isCorrect ? AUTO_ADVANCE_MS_CORRECT : AUTO_ADVANCE_MS_WRONG;
    timerRef.current = setTimeout(onContinue, delay);
    return () => clearTimeout(timerRef.current);
  }, [feedback, isCorrect, onContinue]);

  return (
    <AnimatePresence>
      {feedback && (
        <motion.div
          key="overlay"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            clearTimeout(timerRef.current);
            onContinue();
          }}
        >
          <motion.div
            className={`absolute inset-0 ${isCorrect ? 'bg-green-900/50' : 'bg-red-900/60'}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />

          <motion.div
            className={`relative z-10 w-full max-w-sm overflow-hidden rounded-sm border-2 ${
              isCorrect ? 'border-green-500' : 'border-valorant-red'
            } bg-valorant-dark shadow-2xl`}
            initial={{ scale: 0.85, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <div className={`h-1.5 w-full ${isCorrect ? 'bg-green-500' : 'bg-valorant-red'}`} />

            <div className="flex gap-4 p-5">
              {portrait && (
                <img
                  src={portrait}
                  alt={agent?.name}
                  className="h-28 w-20 shrink-0 rounded-sm object-cover object-top"
                />
              )}

              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <p
                    className={`font-valorant text-4xl leading-none ${
                      isCorrect ? 'text-green-400' : 'text-valorant-red'
                    }`}
                  >
                    {isCorrect ? t('result.correct') : t('result.wrong')}
                  </p>

                  {isCorrect ? (
                    <p className="mt-1 text-lg font-semibold text-green-400">
                      {t('result.points', { n: points })}
                    </p>
                  ) : (
                    <div className="mt-2 space-y-0.5">
                      <p className="text-sm text-white/60">{t('result.correctAnswer')}</p>
                      <p className="font-semibold text-white">
                        {agent?.name}{' '}
                        <span className="text-valorant-red">— {tSlot(slot)}</span>
                      </p>
                      {feedback.entry && (
                        <p className="text-xs text-white/40">
                          {t('result.yourGuess', {
                            agent: AGENTS[feedback.entry.guessedAgent]?.name ?? '?',
                            slot: feedback.entry.guessedSlot?.toUpperCase() ?? '?',
                          })}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <p className="mt-3 text-xs text-white/30">{t('result.tapContinue')}</p>
              </div>
            </div>

            <motion.div
              className={`h-0.5 ${isCorrect ? 'bg-green-500/60' : 'bg-valorant-red/60'}`}
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{
                duration: (isCorrect ? AUTO_ADVANCE_MS_CORRECT : AUTO_ADVANCE_MS_WRONG) / 1000,
                ease: 'linear',
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
