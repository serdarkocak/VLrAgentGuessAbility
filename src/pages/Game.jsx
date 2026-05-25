import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameLogic } from '../hooks/useGameLogic.js';
import { useAudio } from '../hooks/useAudio.js';
import { useCountdown } from '../hooks/useCountdown.js';
import { TIMED_MODE_SECONDS } from '../data/abilities.js';
import AudioPlayer from '../components/AudioPlayer.jsx';
import AgentGrid from '../components/AgentGrid.jsx';
import AbilitySelector from '../components/AbilitySelector.jsx';
import HintPanel from '../components/HintPanel.jsx';
import CountdownBar from '../components/CountdownBar.jsx';
import ScoreBoard from '../components/ScoreBoard.jsx';
import ResultCard from '../components/ResultCard.jsx';
import { useLanguage } from '../i18n/LanguageContext.jsx';

export default function Game() {
  const { t, tRole } = useLanguage();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mode = searchParams.get('mode') || 'classic';
  const difficulty = searchParams.get('difficulty') || 'medium';

  const {
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
    history,
    isFinished,
    correctCount,
    agentChoices,
    applyHint,
    submitAnswer,
    nextQuestion,
    finishGame,

    // Jokers
    jokersUsed,
    activeJoker,
    eliminatedSlots,
    firstAttemptSlot,
    applyJoker,
  } = useGameLogic({ mode, difficulty });

  const { play, replay, playSlow, stop, unload, isPlaying } = useAudio();
  const [hintMessages, setHintMessages] = useState([]);
  const [hasPlayedCurrent, setHasPlayedCurrent] = useState(false);
  const [playCount, setPlayCount] = useState(0);
  const hasNavigatedRef = useRef(false);

  /* ── Timed mode countdown ────────────────────────────────────── */
  const handleTimedExpire = useCallback(() => finishGame(), [finishGame]);
  const countdown = useCountdown(TIMED_MODE_SECONDS, {
    onExpire: handleTimedExpire,
    autoStart: mode === 'timed',
  });

  /* ── Navigate to result when game ends ───────────────────────── */
  useEffect(() => {
    if (!isFinished || hasNavigatedRef.current) return;
    hasNavigatedRef.current = true;
    stop();
    navigate('/result', {
      state: {
        score,
        correct: correctCount,
        total: history.length,
        mode,
        difficulty,
        history,
        hintsUsed,
        timedBonus: mode === 'timed' ? countdown.seconds * 2 : 0,
      },
      replace: true,
    });
  }, [isFinished, score, correctCount, history, hintsUsed, mode, difficulty, navigate, stop, countdown.seconds]);

  /* ── Reset per question ──────────────────────────────────────── */
  useEffect(() => {
    setHasPlayedCurrent(false);
    setHintMessages([]);
    setPlayCount(0);
    unload();
  }, [questionIndex, currentQuestion?.key, unload]);

  /* ── Auto-play on every new question ── */
  useEffect(() => {
    if (!currentQuestion?.soundPath || isFinished || feedback) return;

    let cancelled = false;
    const soundPath = currentQuestion.soundPath;

    const timerId = window.setTimeout(() => {
      if (cancelled) return;
      play(soundPath);
      setHasPlayedCurrent(true);
      setPlayCount((c) => c + 1);
    }, 120);

    return () => {
      cancelled = true;
      window.clearTimeout(timerId);
    };
  }, [questionIndex, currentQuestion?.soundPath, play, isFinished, feedback]);

  /* ── Auto-submit when both agent + ability selected ─────────── */
  useEffect(() => {
    if (selectedAgent && selectedAbility && hasPlayedCurrent && !feedback) {
      const res = submitAnswer(selectedAgent, selectedAbility);
      if (res && res.secondChanceTriggered) {
        setSelectedAbility(null);
      }
    }
  }, [selectedAgent, selectedAbility, hasPlayedCurrent, feedback, submitAnswer, setSelectedAbility]);

  /* ── Audio handlers ──────────────────────────────────────────── */
  const handlePlay = useCallback(() => {
    if (!currentQuestion) return;
    play(currentQuestion.soundPath);
    setHasPlayedCurrent(true);
    setPlayCount((c) => c + 1);
  }, [currentQuestion, play]);

  /* ── Hint handler ────────────────────────────────────────────── */
  const handleHint = useCallback((hintType) => {
    const result = applyHint(hintType);
    if (!result) return;
    if (result.type === 'role')
      setHintMessages((m) => [...m, t('game.hintRole', { role: tRole(result.value) })]);
    else if (result.type === 'letter')
      setHintMessages((m) => [...m, t('game.hintLetter', { letter: result.value })]);
    else if (result.type === 'slow') {
      setHintMessages((m) => [...m, t('game.hintSlow')]);
      playSlow();
    }
  }, [applyHint, playSlow, t, tRole]);

  /* ── Continue after result ───────────────────────────────────── */
  const handleContinue = useCallback(() => {
    if ((mode === 'classic' || mode === 'daily') && lives <= 0) {
      finishGame();
      return;
    }
    nextQuestion();
  }, [mode, lives, finishGame, nextQuestion]);

  /* ── Display helpers ─────────────────────────────────────────── */
  const totalForDisplay =
    mode === 'timed' ? '∞' : mode === 'daily' ? questions.length : totalQuestions;

  const correctAgent = feedback
    ? (feedback.type === 'correct' ? feedback.entry?.question?.agentId : feedback.correctAgent)
    : null;
  const correctSlot = feedback
    ? (feedback.type === 'correct' ? feedback.entry?.question?.slot : feedback.correctSlot)
    : null;

  const showAlert = playCount >= 3 && hintsUsed === 0 && !feedback;

  if (!currentQuestion && !isFinished) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-valorant-red border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      {/* ── Result overlay ── */}
      <ResultCard feedback={feedback} onContinue={handleContinue} />

      {/* ── Main game layout ── */}
      <motion.div
        className="flex flex-col gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Header row: score + countdown */}
        <div className="flex flex-col gap-2">
          <ScoreBoard
            score={score}
            questionIndex={questionIndex}
            totalQuestions={totalForDisplay}
            lives={lives}
            mode={mode}
          />
          {mode === 'timed' && (
            <CountdownBar seconds={countdown.seconds} totalSeconds={TIMED_MODE_SECONDS} />
          )}
        </div>

        {/* Audio + Hints (combined card) */}
        <div className="card-panel flex flex-col gap-3 p-4">
          <AudioPlayer
            onPlay={handlePlay}
            onReplay={() => {
              replay();
              setPlayCount((c) => c + 1);
            }}
            isPlaying={isPlaying}
            hasPlayed={hasPlayedCurrent}
            disabled={!currentQuestion}
          />
          <HintPanel
            hintsUsed={hintsUsed}
            revealedHints={revealedHints}
            hintMessages={hintMessages}
            onHint={handleHint}
            disabled={!!feedback || !hasPlayedCurrent}
            showAlert={showAlert}
          />
        </div>

        {/* Instruction */}
        <AnimatePresence mode="wait">
          {!hasPlayedCurrent ? (
            <motion.p
              key="listen"
              className="text-center text-sm text-white/40 uppercase tracking-widest"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              {t('game.listenFirst')}
            </motion.p>
          ) : (
            <motion.p
              key="select"
              className="text-center text-sm text-valorant-red/80 uppercase tracking-widest"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              {!selectedAgent && !selectedAbility && t('game.selectBoth')}
              {selectedAgent && !selectedAbility && t('game.selectAbility')}
              {!selectedAgent && selectedAbility && t('game.selectAgent')}
              {selectedAgent && selectedAbility && '...'}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Agent grid (full width, no sidebar) */}
        <AgentGrid
          agentIds={agentChoices}
          selectedAgent={selectedAgent}
          correctAgent={correctAgent}
          onSelect={setSelectedAgent}
          disabled={!!feedback}
        />

        {/* Ability buttons with joker buttons flanking */}
        <div className="flex items-stretch gap-2">
          {/* %50 Joker — far left */}
          {hasPlayedCurrent && (
            <motion.button
              type="button"
              disabled={!!feedback || !hasPlayedCurrent || selectedAbility !== null || jokersUsed.fiftyFifty || !selectedAgent}
              onClick={() => applyJoker('fiftyFifty')}
              whileHover={jokersUsed.fiftyFifty || !selectedAgent ? {} : { scale: 1.05 }}
              whileTap={jokersUsed.fiftyFifty || !selectedAgent ? {} : { scale: 0.95 }}
              title={t('game.jokerFiftyFiftyDesc')}
              className={`relative flex flex-col items-center justify-center gap-1 rounded-lg border px-3 py-2 min-w-[60px] transition-all duration-200 ${jokersUsed.fiftyFifty
                  ? 'opacity-20 cursor-not-allowed border-white/5 bg-white/[0.01]'
                  : activeJoker === 'fiftyFifty'
                    ? 'border-yellow-400 bg-yellow-400/15 shadow-[0_0_12px_rgba(250,204,21,0.25)]'
                    : !selectedAgent
                      ? 'opacity-40 cursor-not-allowed border-yellow-500/10'
                      : 'border-yellow-500/25 bg-yellow-500/[0.03] hover:border-yellow-400/60 hover:bg-yellow-400/10 cursor-pointer'
                }`}
            >
              <span className="text-lg leading-none">🌓</span>
              <span className="font-valorant text-[11px] text-yellow-300 leading-tight">%50</span>
              {jokersUsed.fiftyFifty && (
                <span className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/60 text-xs font-bold text-white/40">
                  ❌
                </span>
              )}
            </motion.button>
          )}

          {/* Ability Selector — center, fills remaining space */}
          <div className="flex-1 min-w-0">
            <AbilitySelector
              selectedSlot={selectedAbility}
              correctSlot={correctSlot}
              eliminatedSlots={eliminatedSlots}
              firstAttemptSlot={firstAttemptSlot}
              agentIdForIcons={feedback ? correctAgent : selectedAgent}
              onSelect={setSelectedAbility}
              disabled={!!feedback}
            />
          </div>

          {/* 2x Joker — far right */}
          {hasPlayedCurrent && (
            <motion.button
              type="button"
              disabled={!!feedback || !hasPlayedCurrent || selectedAbility !== null || jokersUsed.doubleAnswer || !selectedAgent}
              onClick={() => applyJoker('doubleAnswer')}
              whileHover={jokersUsed.doubleAnswer || !selectedAgent ? {} : { scale: 1.05 }}
              whileTap={jokersUsed.doubleAnswer || !selectedAgent ? {} : { scale: 0.95 }}
              title={t('game.jokerDoubleAnswerDesc')}
              className={`relative flex flex-col items-center justify-center gap-1 rounded-lg border px-3 py-2 min-w-[60px] transition-all duration-200 ${jokersUsed.doubleAnswer
                  ? 'opacity-20 cursor-not-allowed border-white/5 bg-white/[0.01]'
                  : activeJoker === 'doubleAnswer'
                    ? 'border-yellow-400 bg-yellow-400/15 shadow-[0_0_12px_rgba(250,204,21,0.25)]'
                    : !selectedAgent
                      ? 'opacity-40 cursor-not-allowed border-yellow-500/10'
                      : 'border-yellow-500/25 bg-yellow-500/[0.03] hover:border-yellow-400/60 hover:bg-yellow-400/10 cursor-pointer'
                }`}
            >
              <span className="text-lg leading-none">🔄</span>
              <span className="font-valorant text-[11px] text-yellow-300 leading-tight">2x</span>
              {jokersUsed.doubleAnswer && (
                <span className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/60 text-xs font-bold text-white/40">
                  ❌
                </span>
              )}
            </motion.button>
          )}
        </div>
      </motion.div>
    </>
  );
}
