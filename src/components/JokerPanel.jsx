import { motion } from 'framer-motion';
import { useLanguage } from '../i18n/LanguageContext.jsx';

export default function JokerPanel({
  jokersUsed,
  activeJoker,
  onUseJoker,
  disabled,
  selectedAgent,
}) {
  const { t } = useLanguage();
  const needAgent = !selectedAgent;

  const handleJokerClick = (jokerType) => {
    if (disabled || needAgent) return;
    onUseJoker(jokerType);
  };

  return (
    <div className="card-panel flex flex-col gap-3 p-4 border border-yellow-500/30 bg-yellow-500/[0.02]">
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <h3 className="font-valorant text-base text-yellow-400 flex items-center gap-2">
          <span>🃏</span> {t('game.jokers')}
        </h3>
        <span className="text-[10px] text-yellow-400/50 uppercase tracking-widest font-medium">
          {t('game.jokerPenaltyNote', { n: 70 })}
        </span>
      </div>

      {/* Two Jokers Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* 50/50 Joker */}
        <motion.button
          type="button"
          disabled={disabled || jokersUsed.fiftyFifty || needAgent}
          onClick={() => handleJokerClick('fiftyFifty')}
          whileHover={disabled || jokersUsed.fiftyFifty || needAgent ? {} : { scale: 1.01 }}
          whileTap={disabled || jokersUsed.fiftyFifty || needAgent ? {} : { scale: 0.98 }}
          className={`relative flex flex-col items-center justify-center gap-1 rounded-lg border p-3 transition-all duration-200 ${
            jokersUsed.fiftyFifty
              ? 'opacity-20 cursor-not-allowed border-white/5 bg-white/[0.01]'
              : activeJoker === 'fiftyFifty'
              ? 'border-yellow-400 bg-yellow-400/15 shadow-[0_0_12px_rgba(250,204,21,0.2)]'
              : needAgent
              ? 'opacity-40 cursor-not-allowed border-yellow-500/10'
              : 'border-yellow-500/20 bg-yellow-500/[0.02] hover:border-yellow-400/60 hover:bg-yellow-400/10 cursor-pointer'
          }`}
        >
          <span className="text-xl">🌓</span>
          <span className="font-valorant text-xs text-yellow-300">{t('game.jokerFiftyFifty')}</span>
          <span className="text-[9px] text-yellow-200/50 text-center max-w-[200px]">
            {t('game.jokerFiftyFiftyDesc')}
          </span>
          {needAgent && !jokersUsed.fiftyFifty && (
            <span className="text-[9px] text-valorant-red/70 font-semibold mt-1">
              {t('game.jokerNeedAgent')}
            </span>
          )}
          {jokersUsed.fiftyFifty && (
            <span className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/60 text-xs font-bold text-white/40">
              ❌ Used
            </span>
          )}
        </motion.button>

        {/* 2x Answer Joker */}
        <motion.button
          type="button"
          disabled={disabled || jokersUsed.doubleAnswer || needAgent}
          onClick={() => handleJokerClick('doubleAnswer')}
          whileHover={disabled || jokersUsed.doubleAnswer || needAgent ? {} : { scale: 1.01 }}
          whileTap={disabled || jokersUsed.doubleAnswer || needAgent ? {} : { scale: 0.98 }}
          className={`relative flex flex-col items-center justify-center gap-1 rounded-lg border p-3 transition-all duration-200 ${
            jokersUsed.doubleAnswer
              ? 'opacity-20 cursor-not-allowed border-white/5 bg-white/[0.01]'
              : activeJoker === 'doubleAnswer'
              ? 'border-yellow-400 bg-yellow-400/15 shadow-[0_0_12px_rgba(250,204,21,0.2)]'
              : needAgent
              ? 'opacity-40 cursor-not-allowed border-yellow-500/10'
              : 'border-yellow-500/20 bg-yellow-500/[0.02] hover:border-yellow-400/60 hover:bg-yellow-400/10 cursor-pointer'
          }`}
        >
          <span className="text-xl">🔄</span>
          <span className="font-valorant text-xs text-yellow-300">{t('game.jokerDoubleAnswer')}</span>
          <span className="text-[9px] text-yellow-200/50 text-center max-w-[200px]">
            {t('game.jokerDoubleAnswerDesc')}
          </span>
          {needAgent && !jokersUsed.doubleAnswer && (
            <span className="text-[9px] text-valorant-red/70 font-semibold mt-1">
              {t('game.jokerNeedAgent')}
            </span>
          )}
          {jokersUsed.doubleAnswer && (
            <span className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/60 text-xs font-bold text-white/40">
              ❌ Used
            </span>
          )}
        </motion.button>
      </div>
    </div>
  );
}
