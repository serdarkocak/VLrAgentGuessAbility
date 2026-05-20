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
  } = useGameLogic({ mode, difficulty });

  const { play, replay, playSlow, stop, unload, isPlaying } = useAudio();
  const [hintMessages, setHintMessages] = useState([]);
  const [hasPlayedCurrent, setHasPlayedCurrent] = useState(false);
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
    unload();
  }, [questionIndex, currentQuestion?.key, unload]);

  /* ── Auto-submit when both agent + ability selected ─────────── */
  useEffect(() => {
    if (selectedAgent && selectedAbility && hasPlayedCurrent && !feedback) {
      submitAnswer(selectedAgent, selectedAbility);
    }
  }, [selectedAgent, selectedAbility, hasPlayedCurrent, feedback, submitAnswer]);

  /* ── Audio handlers ──────────────────────────────────────────── */
  const handlePlay = useCallback(() => {
    if (!currentQuestion) return;
    play(currentQuestion.soundPath);
    setHasPlayedCurrent(true);
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

        {/* Audio + hints */}
        <div className="card-panel flex flex-col gap-3 p-4">
          <AudioPlayer
            onPlay={handlePlay}
            onReplay={() => replay()}
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

        {/* Agent grid */}
        <AgentGrid
          agentIds={agentChoices}
          selectedAgent={selectedAgent}
          correctAgent={correctAgent}
          onSelect={setSelectedAgent}
          disabled={!!feedback}
        />

        {/* Ability buttons — icons appear after agent is selected */}
        <AbilitySelector
          selectedSlot={selectedAbility}
          correctSlot={correctSlot}
          agentIdForIcons={feedback ? correctAgent : selectedAgent}
          onSelect={setSelectedAbility}
          disabled={!!feedback}
        />
      </motion.div>
    </>
  );
}
