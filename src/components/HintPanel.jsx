import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../i18n/LanguageContext.jsx';

const HINT_IDS = ['role', 'letter', 'slow'];

export default function HintPanel({ hintsUsed, revealedHints, hintMessages, onHint, disabled, showAlert }) {
  const { t } = useLanguage();

  return (
    <div className={`flex flex-col gap-2 rounded-lg transition-all duration-300 ${
      showAlert ? 'hint-alert-glow border border-valorant-red/50 bg-valorant-red/[0.06] p-2.5' : 'p-0'
    }`}>
      {/* Header + buttons row */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-bold uppercase tracking-widest text-white/60">
          💡 {t('game.hint')}
        </span>
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
                className={`rounded-md border px-2.5 py-1 text-xs font-semibold uppercase tracking-wider transition ${
                  used
                    ? 'border-green-500/40 bg-green-500/10 text-green-400'
                    : canUse
                    ? 'border-white/20 text-white/70 hover:border-valorant-red hover:bg-valorant-red/10 hover:text-white'
                    : 'cursor-not-allowed border-white/10 text-white/20'
                }`}
              >
                {t(`game.hints.${id}`)}
              </button>
            );
          })}
        </div>
        {hintsUsed > 0 && (
          <span className="ml-auto text-xs font-semibold text-valorant-red/70">
            {t('game.hintPoints', { n: hintsUsed * 30 })}
          </span>
        )}
      </div>

      {/* Alert text */}
      {showAlert && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[11px] text-valorant-red/80 font-medium"
        >
          {t('game.hintAlert')} {t('game.hintAlertDesc')}
        </motion.p>
      )}

      {/* Hint Messages */}
      <AnimatePresence>
        {hintMessages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, height: 0, y: -4 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            className="rounded-md border border-yellow-500/30 bg-yellow-500/10 px-3 py-1.5 text-sm text-yellow-300"
          >
            {msg}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
