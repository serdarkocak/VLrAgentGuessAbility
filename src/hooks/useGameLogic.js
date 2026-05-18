import { useCallback, useMemo, useState } from 'react';
import { AGENT_IDS, AGENTS, getAgent } from '../data/agents.js';
import {
  QUESTION_POOL,
  TOTAL_QUESTIONS_CLASSIC,
  TIMED_MODE_SECONDS,
  HINT_COST,
  SCORE_AGENT,
  SCORE_ABILITY,
  SCORE_BOTH_BONUS,
} from '../data/abilities.js';
import { pickDailyQuestions } from '../lib/dailySeed.js';

const DIFFICULTY_OPTIONS = {
  easy: 4,
  medium: 8,
  hard: AGENT_IDS.length,
};

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pickAgentChoices(correctId, difficulty) {
  const count = DIFFICULTY_OPTIONS[difficulty] ?? DIFFICULTY_OPTIONS.hard;
  const others = AGENT_IDS.filter((id) => id !== correctId);
  const shuffled = shuffle(others);
  const wrong = shuffled.slice(0, count - 1);
  return shuffle([correctId, ...wrong]);
}

export function useGameLogic({ mode, difficulty }) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [revealedHints, setRevealedHints] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [selectedAbility, setSelectedAbility] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [history, setHistory] = useState([]);
  const [isFinished, setIsFinished] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const questions = useMemo(() => {
    if (mode === 'daily') return pickDailyQuestions(QUESTION_POOL, TOTAL_QUESTIONS_CLASSIC);
    if (mode === 'timed') return shuffle(QUESTION_POOL);
    return shuffle(QUESTION_POOL).slice(0, TOTAL_QUESTIONS_CLASSIC);
  }, [mode]);

  const currentQuestion =
    mode === 'timed' && questions.length > 0
      ? questions[questionIndex % questions.length]
      : (questions[questionIndex] ?? null);

  const totalQuestions =
    mode === 'timed' ? null : mode === 'daily' ? questions.length : TOTAL_QUESTIONS_CLASSIC;

  const agentChoices = useMemo(() => {
    if (!currentQuestion) return [];
    return pickAgentChoices(currentQuestion.agentId, difficulty);
  }, [currentQuestion, difficulty]);

  const applyHint = useCallback(
    (hintType) => {
      if (!currentQuestion || revealedHints.includes(hintType)) return null;
      if (hintsUsed >= 3) return null;

      setHintsUsed((h) => h + 1);
      setRevealedHints((prev) => [...prev, hintType]);
      setScore((s) => Math.max(0, s - HINT_COST));

      const agent = getAgent(currentQuestion.agentId);
      if (hintType === 'role') return { type: 'role', value: agent?.role };
      if (hintType === 'letter') return { type: 'letter', value: agent?.name?.charAt(0) };
      if (hintType === 'slow') return { type: 'slow' };
      return null;
    },
    [currentQuestion, revealedHints, hintsUsed],
  );

  const submitAnswer = useCallback(
    (agentId, slot) => {
      if (!currentQuestion || feedback) return null;

      const agentCorrect = agentId === currentQuestion.agentId;
      const abilityCorrect = slot === currentQuestion.slot;
      const bothCorrect = agentCorrect && abilityCorrect;

      let points = 0;
      if (agentCorrect) points += SCORE_AGENT;
      if (abilityCorrect) points += SCORE_ABILITY;
      if (bothCorrect) points += SCORE_BOTH_BONUS;

      const entry = {
        question: currentQuestion,
        guessedAgent: agentId,
        guessedSlot: slot,
        agentCorrect,
        abilityCorrect,
        bothCorrect,
        points,
      };

      setHistory((h) => [...h, entry]);

      if (bothCorrect) {
        setCorrectCount((c) => c + 1);
        setScore((s) => s + points);
        setFeedback({ type: 'correct', entry });
      } else {
        if (mode === 'classic' || mode === 'daily') setLives((l) => l - 1);
        setFeedback({
          type: 'wrong',
          entry,
          correctAgent: currentQuestion.agentId,
          correctSlot: currentQuestion.slot,
        });
      }

      return entry;
    },
    [currentQuestion, feedback, mode],
  );

  const nextQuestion = useCallback(() => {
    setFeedback(null);
    setSelectedAgent(null);
    setSelectedAbility(null);
    setRevealedHints([]);

    if (mode === 'timed') {
      setQuestionIndex((i) => i + 1);
      return true;
    }

    const nextIdx = questionIndex + 1;
    if (nextIdx >= questions.length) {
      setIsFinished(true);
      return false;
    }

    setQuestionIndex(nextIdx);
    return true;
  }, [questionIndex, questions.length, mode]);

  const finishGame = useCallback(() => {
    setIsFinished(true);
  }, []);

  const reset = useCallback(() => {
    setQuestionIndex(0);
    setScore(0);
    setLives(3);
    setHintsUsed(0);
    setRevealedHints([]);
    setSelectedAgent(null);
    setSelectedAbility(null);
    setFeedback(null);
    setHistory([]);
    setIsFinished(false);
    setCorrectCount(0);
  }, []);

  return {
    questions,
    currentQuestion,
    questionIndex,
    totalQuestions,
    score,
    lives,
    hintsUsed,
    revealedHints,
    selectedAgent,
    selectedAbility,
    setSelectedAgent,
    setSelectedAbility,
    feedback,
    setFeedback,
    history,
    isFinished,
    correctCount,
    agentChoices,
    applyHint,
    submitAnswer,
    nextQuestion,
    finishGame,
    reset,
    TIMED_MODE_SECONDS,
  };
}
