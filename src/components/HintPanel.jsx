import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../i18n/LanguageContext.jsx';

const HINT_IDS = ['role', 'letter', 'slow'];

export default function HintPanel({ hintsUsed, revealedHints, hintMessages, onHint, disabled }) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="text-xs uppercase tracking-widest text-white/30">{t('game.hint')}</span>
        <div className="flex gap-1.5">
          {HINT_IDS.map((id) => {
            const used = revealedHints.includes(id);
            const canUse = !disabled && !used && hintsUsed < 3;
            return (
              <button
                key={id}
                type="button"
                disabled={!canUse}
                onClick={() => onHint(id)}
                className={`rounded-sm border px-2.5 py-1 text-xs font-semibold uppercase tracking-wider transition ${
                  used
                    ? 'border-green-500/40 bg-green-500/10 text-green-400'
                    : canUse
                    ? 'border-white/20 text-white/60 hover:border-valorant-red hover:text-valorant-red'
                    : 'cursor-not-allowed border-white/10 text-white/20'
                }`}
              >
                {t(`game.hints.${id}`)}
              </button>
            );
          })}
        </div>
        {hintsUsed > 0 && (
          <span className="ml-auto text-xs text-white/30">
            {t('game.hintPoints', { n: hintsUsed * 30 })}
          </span>
        )}
      </div>

      <AnimatePresence>
        {hintMessages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, height: 0, y: -4 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            className="rounded-sm border border-yellow-500/30 bg-yellow-500/10 px-3 py-1.5 text-sm text-yellow-300"
          >
            {msg}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
