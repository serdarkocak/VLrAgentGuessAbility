import { supabase, isSupabaseConfigured } from './supabase.js';
import { generateId } from './id.js';

const LS_KEY = 'valorant-quiz-scores';

function readLocalScores() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeLocalScores(scores) {
  localStorage.setItem(LS_KEY, JSON.stringify(scores.slice(0, 100)));
}

export async function saveScore({ nickname, mode, difficulty, score, correct, total }) {
  const entry = {
    nickname: nickname.slice(0, 20),
    mode,
    difficulty,
    score,
    correct,
    total,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('scores').insert(entry);
    if (!error) return { ok: true, source: 'supabase' };
  }

  const local = readLocalScores();
  local.push({ ...entry, id: generateId() });
  local.sort((a, b) => b.score - a.score);
  writeLocalScores(local);
  return { ok: true, source: 'local' };
}

export async function getTopScores(limit = 50) {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('scores')
      .select('*')
      .order('score', { ascending: false })
      .limit(limit);

    if (!error && data) {
      return { scores: data, source: 'supabase' };
    }
  }

  const local = readLocalScores()
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
  return { scores: local, source: 'local' };
}
