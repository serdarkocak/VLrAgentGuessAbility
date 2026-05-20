import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AGENTS } from '../data/agents.js';
import { HINT_COST } from '../data/abilities.js';
import { saveScore } from '../lib/scores.js';
import ShareCard from '../components/ShareCard.jsx';
import { useLanguage } from '../i18n/LanguageContext.jsx';

export default function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state;
  const { t, tMode, tDifficulty, tSlot, dateLocale } = useLanguage();

  const [nickname, setNickname] = useState(() => localStorage.getItem('vq-nickname') || '');
  const [saved, setSaved] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  if (!state) {
    return (
      <div className="text-center">
        <p className="text-white/60">{t('result.notFound')}</p>
        <Link to="/" className="btn-primary mt-4 inline-block">
          {t('nav.home')}
        </Link>
      </div>
    );
  }

  const { score, correct, total, mode, difficulty, history = [], hintsUsed = 0, timedBonus = 0 } =
    state;
  const hintPenalty = hintsUsed * HINT_COST;
  const finalScore = score + (timedBonus || 0);
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

  const handleSave = async () => {
    if (!nickname.trim()) return;
    localStorage.setItem('vq-nickname', nickname.trim());
    const result = await saveScore({
      nickname: nickname.trim(),
      mode,
      difficulty,
      score: finalScore,
      correct,
      total,
    });
    setSaved(true);
    setSaveStatus(result.source);
  };

  const sourceLabel =
    saveStatus === 'supabase' ? t('result.sourceGlobal') : t('result.sourceLocal');

  return (
    <motion.div
      className="mx-auto max-w-2xl space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <section className="card-panel p-8 text-center">
        <p className="text-sm uppercase tracking-widest text-white/50">{t('result.roundEnd')}</p>
        <h1 className="mt-2 font-valorant text-6xl text-valorant-red">{finalScore}</h1>
        <p className="mt-2 text-lg text-white/70">
          {t('result.correctCount', { correct, total, accuracy })}
        </p>
        <p className="mt-1 text-sm text-white/40">
          {tMode(mode)} · {tDifficulty(difficulty)}
          {hintPenalty > 0 && (
            <>
              {' · '}
              {t('result.hintPenalty', { n: hintPenalty })}
            </>
          )}
          {timedBonus > 0 && t('result.timeBonus', { n: timedBonus })}
        </p>
      </section>

      {!saved ? (
        <div className="card-panel p-6">
          <h2 className="mb-3 font-valorant text-xl">{t('result.saveScore')}</h2>
          <input
            type="text"
            maxLength={20}
            placeholder={t('result.nicknamePlaceholder')}
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="w-full rounded-sm border border-white/20 bg-valorant-dark px-4 py-3 text-white placeholder:text-white/30 focus:border-valorant-red focus:outline-none"
          />
          <button
            type="button"
            onClick={handleSave}
            disabled={!nickname.trim()}
            className="btn-primary mt-4 w-full"
          >
            {t('result.saveToLeaderboard')}
          </button>
        </div>
      ) : (
        <p className="text-center text-green-400">
          {t('result.scoreSaved', { source: sourceLabel })}
        </p>
      )}

      <ShareCard
        score={finalScore}
        correct={correct}
        total={total}
        mode={mode}
        difficulty={difficulty}
        nickname={nickname}
      />

      {history.length > 0 && (
        <section className="card-panel p-6">
          <h2 className="mb-4 font-valorant text-xl text-valorant-red">{t('result.questionDetails')}</h2>
          <ul className="space-y-2 text-sm">
            {history.map((h, i) => {
              const agent = AGENTS[h.question.agentId];
              return (
                <li
                  key={i}
                  className={`flex justify-between border-b border-white/5 py-2 ${
                    h.bothCorrect ? 'text-green-400' : 'text-white/60'
                  }`}
                >
                  <span>
                    {i + 1}. {agent?.name} — {tSlot(h.question.slot)}
                  </span>
                  <span>{h.bothCorrect ? `+${h.points}` : '✗'}</span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <div className="flex flex-wrap justify-center gap-4">
        <button
          type="button"
          onClick={() => navigate(`/play?mode=${mode}&difficulty=${difficulty}`)}
          className="btn-primary"
        >
          {t('result.playAgain')}
        </button>
        <Link to="/leaderboard" className="btn-secondary">
          {t('nav.leaderboard')}
        </Link>
        <Link to="/" className="btn-secondary">
          {t('nav.home')}
        </Link>
      </div>
    </motion.div>
  );
}
