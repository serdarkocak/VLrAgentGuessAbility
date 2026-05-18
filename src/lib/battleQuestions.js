import { AGENT_IDS } from '../data/agents.js';
import { QUESTION_POOL } from '../data/abilities.js';
import { BATTLE_AGENT_CHOICES, BATTLE_TOTAL_ROUNDS } from './battleConstants.js';

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function buildBattleQuestionList() {
  return shuffle(QUESTION_POOL).slice(0, BATTLE_TOTAL_ROUNDS);
}

export function getQuestionByKey(key) {
  return QUESTION_POOL.find((q) => q.key === key) ?? null;
}

export function pickBattleAgentChoices(correctAgentId) {
  const others = AGENT_IDS.filter((id) => id !== correctAgentId);
  const wrong = shuffle(others).slice(0, BATTLE_AGENT_CHOICES - 1);
  return shuffle([correctAgentId, ...wrong]);
}

export function isBattleAnswerCorrect(question, agentId, slot) {
  return question.agentId === agentId && question.slot === slot;
}
