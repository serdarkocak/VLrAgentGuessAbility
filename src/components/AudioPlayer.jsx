import { motion } from 'framer-motion';
import { useLanguage } from '../i18n/LanguageContext.jsx';

const BARS = 20;

export default function AudioPlayer({ onPlay, onReplay, isPlaying, hasPlayed, disabled }) {
  const { t } = useLanguage();

  return (
    <div className="flex items-center gap-4">
      <motion.button
        type="button"
        onClick={hasPlayed ? onReplay : onPlay}
        disabled={disabled}
        className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-valorant-red bg-valorant-red/10 transition hover:bg-valorant-red/25 disabled:opacity-40"
        whileTap={{ scale: 0.9 }}
        aria-label={hasPlayed ? t('audio.replay') : t('audio.play')}
      >
        <span className="ml-0.5 text-2xl text-valorant-red">{isPlaying ? '⏸' : '▶'}</span>
        {isPlaying && (
          <motion.span
            className="absolute inset-0 rounded-full border-2 border-valorant-red/60"
            animate={{ scale: [1, 1.35, 1], opacity: [0.8, 0, 0.8] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
          />
        )}
      </motion.button>

      <div className="flex h-10 flex-1 items-end gap-[3px]" aria-hidden>
        {Array.from({ length: BARS }).map((_, i) => (
          <motion.span
            key={i}
            className="flex-1 rounded-full bg-valorant-red/80"
            animate={
              isPlaying
                ? {
                    height: ['6px', `${16 + Math.sin(i * 0.8) * 14}px`, '6px'],
                    transition: { repeat: Infinity, duration: 0.6 + i * 0.03, ease: 'easeInOut' },
                  }
                : { height: hasPlayed ? '4px' : '2px' }
            }
          />
        ))}
      </div>

      {!hasPlayed && !isPlaying && (
        <span className="shrink-0 text-xs uppercase tracking-wider text-white/40">
          {t('game.listen')}
        </span>
      )}
    </div>
  );
}
