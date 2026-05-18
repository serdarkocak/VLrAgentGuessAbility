import { AGENT_IDS, ABILITY_SLOTS } from './agents.js';

/**
 * Ses dosyası olmayan kombinasyonlar (AbilitySounds klasörüne göre).
 */
const MISSING_SOUNDS = new Set([
  'clove_x',
  'cypher_x',
  'reyna_c',
]);

/**
 * Tüm geçerli soru havuzu: { agentId, slot, soundPath }
 */
function buildQuestionPool() {
  const pool = [];
  for (const agentId of AGENT_IDS) {
    for (const slot of ABILITY_SLOTS) {
      const key = `${agentId}_${slot}`;
      if (MISSING_SOUNDS.has(key)) continue;
      pool.push({
        agentId,
        slot,
        soundPath: `/sounds/${agentId}_${slot}.mp3`,
        key,
      });
    }
  }
  return pool;
}

export const QUESTION_POOL = buildQuestionPool();

export function getSoundPath(agentId, slot) {
  const key = `${agentId}_${slot}`;
  if (MISSING_SOUNDS.has(key)) return null;
  return `/sounds/${agentId}_${slot}.mp3`;
}

export function hasSound(agentId, slot) {
  return !MISSING_SOUNDS.has(`${agentId}_${slot}`);
}

export const TOTAL_QUESTIONS_CLASSIC = 10;
export const TIMED_MODE_SECONDS = 60;
export const HINT_COST = 30;
export const SCORE_AGENT = 50;
export const SCORE_ABILITY = 50;
export const SCORE_BOTH_BONUS = 120;
