import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import { isSupabaseConfigured } from '../lib/supabase.js';
import { unlockAudioPlayback } from '../hooks/useAudio.js';

const MODE_IDS = ['classic', 'timed', 'daily'];
const MODE_ICONS = { classic: '◆', timed: '◷', daily: '◉' };
const DIFF_IDS = ['easy', 'medium', 'hard'];
const DIFF_ICONS = { easy: '✓', medium: '◧', hard: '◈' };

export default function Home() {
  const navigate = useNavigate();
  const { t, tMode, tModeDesc, tDifficulty, tDifficultyDesc } = useLanguage();
  const [mode, setMode] = useState('classic');
  const [difficulty, setDifficulty] = useState('medium');

  return (
    <motion.div
      className="mx-auto flex max-w-lg flex-col gap-7"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* ── HERO ───────────────────────────────────────────── */}
      <motion.section
        className="card-panel-glow relative overflow-hidden px-6 py-10 text-center"
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <div className="pointer-events-none absolute -top-16 left-1/2 h-40 w-72 -translate-x-1/2 rounded-full bg-valorant-red/20 blur-3xl" />
        <div className="pointer-events-none absolute -top-10 right-10 h-32 w-32 rounded-full bg-neon-purple/15 blur-3xl" />
        <motion.h1
          className="relative font-valorant text-5xl leading-none text-white text-glow-white sm:text-6xl"
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          {t('home.title1')}
        </motion.h1>
        <motion.p
          className="relative mt-2 font-valorant text-3xl text-glow-red sm:text-4xl"
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.08 }}
        >
          {t('home.title2')}
        </motion.p>
        <p className="relative mt-4 text-sm text-white/55">{t('home.subtitle')}</p>
      </motion.section>

      {/* ── MODE ───────────────────────────────────────────── */}
      <section>
        <p className="mb-3 text-center text-xs uppercase tracking-[0.4em] text-white/45">
          {t('home.mode')}
        </p>
        <div className="grid grid-cols-3 gap-3">
          {MODE_IDS.map((id) => {
            const active = mode === id;
            return (
              <motion.button
                key={id}
                type="button"
                onClick={() => setMode(id)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                className={`group relative flex flex-col items-center gap-1.5 overflow-hidden rounded-2xl border px-3 py-4 backdrop-blur-xl transition ${
                  active
                    ? 'border-valorant-red/70 bg-valorant-red/[0.12] shadow-glow'
                    : 'border-white/10 bg-white/[0.04] hover:border-white/25 hover:bg-white/[0.06]'
                }`}
              >
                {active && (
                  <span className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-valorant-red to-transparent" />
                )}
                <span
                  className={`text-2xl ${
                    active ? 'text-valorant-red' : 'text-white/70'
                  }`}
                >
                  {MODE_ICONS[id]}
                </span>
                <span className="font-valorant text-lg leading-none">{tMode(id)}</span>
                <span className="text-[11px] leading-tight text-white/45">{tModeDesc(id)}</span>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* ── DIFFICULTY ─────────────────────────────────────── */}
      <section>
        <p className="mb-3 text-center text-xs uppercase tracking-[0.4em] text-white/45">
          {t('home.difficulty')}
        </p>
        <div className="grid grid-cols-3 gap-3">
          {DIFF_IDS.map((id) => {
            const active = difficulty === id;
            return (
              <motion.button
                key={id}
                type="button"
                onClick={() => setDifficulty(id)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                className={`group relative flex flex-col items-center gap-1.5 overflow-hidden rounded-2xl border px-3 py-4 backdrop-blur-xl transition ${
                  active
                    ? 'border-valorant-red/70 bg-valorant-red/[0.12] shadow-glow'
                    : 'border-white/10 bg-white/[0.04] hover:border-white/25 hover:bg-white/[0.06]'
                }`}
              >
                {active && (
                  <span className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-valorant-red to-transparent" />
                )}
                <span
                  className={`text-xl ${
                    active ? 'text-valorant-red' : 'text-white/70'
                  }`}
                >
                  {DIFF_ICONS[id]}
                </span>
                <span className="font-valorant text-lg leading-none">{tDifficulty(id)}</span>
                <span className="text-[11px] leading-tight text-white/45">
                  {tDifficultyDesc(id)}
                </span>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* ── PRIMARY CTA ────────────────────────────────────── */}
      <motion.button
        type="button"
        onClick={() => {
          unlockAudioPlayback();
          navigate(`/play?mode=${mode}&difficulty=${difficulty}`);
        }}
        className="btn-primary w-full py-4 text-xl"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {t('home.play')}
      </motion.button>

      {/* ── BATTLE BUTTON (glass) ──────────────────────────── */}
      <div className="w-full flex flex-col gap-2">
        <motion.button
          type="button"
          onClick={() => isSupabaseConfigured && navigate('/battle')}
          disabled={!isSupabaseConfigured}
          title={!isSupabaseConfigured ? t('battle.supabaseRequired') : undefined}
          whileHover={isSupabaseConfigured ? { scale: 1.01 } : {}}
          whileTap={isSupabaseConfigured ? { scale: 0.98 } : {}}
          className={`flex w-full items-center justify-center gap-2 rounded-2xl border py-4 text-xl font-valorant tracking-wider backdrop-blur-xl transition ${
            isSupabaseConfigured
              ? 'border-neon-purple/40 bg-white/[0.04] text-white hover:border-neon-purple/70 hover:bg-neon-purple/10 hover:shadow-glow-purple'
              : 'cursor-not-allowed border-white/10 bg-white/[0.02] text-white/30'
          }`}
        >
          <span className="text-2xl">⚔</span> {t('battle.title')}
        </motion.button>
        {isSupabaseConfigured ? (
          <p className="text-center text-xs text-neon-purple/70 tracking-wider font-semibold">
            👥 {t('battle.subtitle')}
          </p>
        ) : (
          <p className="text-center text-[11px] text-white/30 tracking-wider">
            🔒 {t('battle.supabaseRequired')}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={() => navigate('/leaderboard')}
        className="text-center text-sm text-white/45 underline decoration-white/15 underline-offset-4 transition hover:text-valorant-red hover:decoration-valorant-red/60"
      >
        {t('home.viewLeaderboard')}
      </button>
    </motion.div>
  );
}
