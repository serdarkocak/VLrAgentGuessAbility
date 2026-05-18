import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getTopScores } from '../lib/scores.js';
import { isSupabaseConfigured } from '../lib/supabase.js';
import { useLanguage } from '../i18n/LanguageContext.jsx';

export default function Leaderboard() {
  const { t, tMode, tDifficulty, dateLocale } = useLanguage();
  const [scores, setScores] = useState([]);
  const [source, setSource] = useState('local');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTopScores(50).then(({ scores: data, source: src }) => {
      setScores(data);
      setSource(src);
      setLoading(false);
    });
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-valorant text-4xl text-valorant-red">{t('leaderboard.title')}</h1>
          <p className="mt-1 text-white/50">
            {source === 'supabase' ? t('leaderboard.global') : t('leaderboard.local')}
            {!isSupabaseConfigured && t('leaderboard.notConfigured')}
          </p>
        </div>
        <Link to="/" className="btn-primary">
          {t('leaderboard.play')}
        </Link>
      </div>

      <div className="card-panel overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-white/50">{t('leaderboard.loading')}</p>
        ) : scores.length === 0 ? (
          <p className="p-8 text-center text-white/50">{t('leaderboard.empty')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-widest text-white/50">
                  <th className="p-4">#</th>
                  <th className="p-4">{t('leaderboard.player')}</th>
                  <th className="p-4">{t('leaderboard.score')}</th>
                  <th className="p-4">{t('leaderboard.correct')}</th>
                  <th className="p-4">{t('leaderboard.mode')}</th>
                  <th className="p-4">{t('leaderboard.difficulty')}</th>
                  <th className="p-4 hidden sm:table-cell">{t('leaderboard.date')}</th>
                </tr>
              </thead>
              <tbody>
                {scores.map((row, i) => (
                  <motion.tr
                    key={row.id ?? `${row.nickname}-${row.created_at}-${i}`}
                    className="border-b border-white/5 hover:bg-white/5"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02 }}
                  >
                    <td className="p-4 font-valorant text-valorant-red">{i + 1}</td>
                    <td className="p-4 font-semibold">{row.nickname}</td>
                    <td className="p-4 font-valorant text-xl">{row.score}</td>
                    <td className="p-4">
                      {row.correct}/{row.total}
                    </td>
                    <td className="p-4">{tMode(row.mode)}</td>
                    <td className="p-4">{tDifficulty(row.difficulty)}</td>
                    <td className="hidden p-4 text-white/40 sm:table-cell">
                      {row.created_at
                        ? new Date(row.created_at).toLocaleDateString(dateLocale)
                        : '—'}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
}
