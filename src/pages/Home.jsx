import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import { isSupabaseConfigured } from '../lib/supabase.js';

const MODE_IDS = ['classic', 'timed', 'daily'];
const MODE_ICONS = { classic: '🎯', timed: '⏱', daily: '📅' };
const DIFF_IDS = ['easy', 'medium', 'hard'];
const DIFF_ICONS = { easy: '🟢', medium: '🟡', hard: '🔴' };

export default function Home() {
  const navigate = useNavigate();
  const { t, tMode, tModeDesc, tDifficulty, tDifficultyDesc } = useLanguage();
  const [mode, setMode] = useState('classic');
  const [difficulty, setDifficulty] = useState('medium');

  return (
    <motion.div
      className="mx-auto flex max-w-lg flex-col gap-8"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="text-center">
        <motion.h1
          className="font-valorant text-6xl leading-none text-white sm:text-7xl"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          {t('home.title1')}
        </motion.h1>
        <motion.p
          className="mt-1 font-valorant text-3xl text-valorant-red sm:text-4xl"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {t('home.title2')}
        </motion.p>
        <p className="mt-3 text-sm text-white/40">{t('home.subtitle')}</p>
      </div>

      <section>
        <p className="mb-2 text-xs uppercase tracking-widest text-white/40">{t('home.mode')}</p>
        <div className="grid grid-cols-3 gap-2">
          {MODE_IDS.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setMode(id)}
              className={`flex flex-col items-center gap-1 rounded-sm border-2 py-4 transition ${
                mode === id
                  ? 'border-valorant-red bg-valorant-red/10 shadow-glow'
                  : 'border-white/10 bg-valorant-gray/40 hover:border-white/30'
              }`}
            >
              <span className="text-2xl">{MODE_ICONS[id]}</span>
              <span className="font-valorant text-lg leading-none">{tMode(id)}</span>
              <span className="text-[11px] text-white/40">{tModeDesc(id)}</span>
            </button>
          ))}
        </div>
      </section>

      <section>
        <p className="mb-2 text-xs uppercase tracking-widest text-white/40">{t('home.difficulty')}</p>
        <div className="grid grid-cols-3 gap-2">
          {DIFF_IDS.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setDifficulty(id)}
              className={`flex flex-col items-center gap-1 rounded-sm border-2 py-3 transition ${
                difficulty === id
                  ? 'border-valorant-red bg-valorant-red/10 shadow-glow'
                  : 'border-white/10 bg-valorant-gray/40 hover:border-white/30'
              }`}
            >
              <span className="text-xl">{DIFF_ICONS[id]}</span>
              <span className="font-valorant text-lg leading-none">{tDifficulty(id)}</span>
              <span className="text-[11px] text-white/40">{tDifficultyDesc(id)}</span>
            </button>
          ))}
        </div>
      </section>

      <motion.button
        type="button"
        onClick={() => navigate(`/play?mode=${mode}&difficulty=${difficulty}`)}
        className="btn-primary w-full py-4 text-xl"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {t('home.play')}
      </motion.button>

      <button
        type="button"
        onClick={() => isSupabaseConfigured && navigate('/battle')}
        disabled={!isSupabaseConfigured}
        title={!isSupabaseConfigured ? t('battle.supabaseRequired') : undefined}
        className={`w-full rounded-sm border-2 py-4 text-xl font-valorant tracking-wider transition ${
          isSupabaseConfigured
            ? 'border-valorant-red/60 text-valorant-red hover:border-valorant-red hover:bg-valorant-red/10'
            : 'cursor-not-allowed border-white/10 text-white/30'
        }`}
      >
        ⚔ {t('battle.title')}
      </button>

      <button
        type="button"
        onClick={() => navigate('/leaderboard')}
        className="text-center text-sm text-white/40 transition hover:text-white/70"
      >
        {t('home.viewLeaderboard')}
      </button>
    </motion.div>
  );
}
