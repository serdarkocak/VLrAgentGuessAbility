import { useCallback, useEffect, useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext.jsx';
import { useAudio } from '../../hooks/useAudio.js';
import AudioPlayer from '../AudioPlayer.jsx';
import AgentGrid from '../AgentGrid.jsx';
import AbilitySelector from '../AbilitySelector.jsx';

const EMPTY_PICK = { key: null, agent: null, ability: null, played: false };

export default function BattleQuestion({
  questionIndex,
  totalRounds,
  currentQuestion,
  agentChoices,
  scores,
  playerName,
  hasSubmitted,
  onSubmit,
}) {
  const { t } = useLanguage();
  const { play, replay, isPlaying } = useAudio();
  const questionKey = currentQuestion?.key ?? null;
  const roundId = questionKey ? `${questionIndex}:${questionKey}` : null;
  const [pick, setPick] = useState(EMPTY_PICK);

  // Reset picks when round changes
  useEffect(() => {
    setPick({ key: questionKey, agent: null, ability: null, played: false });
  }, [roundId, questionKey]);

  // Auto-play on every new round (Strict Mode safe: cancelled flag, no ref guard)
  useEffect(() => {
    if (!currentQuestion?.soundPath || !roundId) return;

    let cancelled = false;
    const soundPath = currentQuestion.soundPath;

    const timerId = window.setTimeout(() => {
      if (cancelled) return;
      play(soundPath);
      setPick((p) => (p.key === questionKey ? { ...p, played: true } : p));
    }, 100);

    return () => {
      cancelled = true;
      window.clearTimeout(timerId);
    };
  }, [roundId, currentQuestion?.soundPath, play, questionKey]);

  const handlePlay = useCallback(() => {
    if (!currentQuestion) return;
    play(currentQuestion.soundPath);
    setPick((p) => (p.key === questionKey ? { ...p, played: true } : p));
  }, [currentQuestion, play, questionKey]);

  const selectAgent = useCallback(
    (id) => {
      setPick((p) => (p.key === questionKey ? { ...p, agent: id } : p));
    },
    [questionKey],
  );

  const selectAbility = useCallback(
    (slot) => {
      setPick((p) => (p.key === questionKey ? { ...p, ability: slot } : p));
    },
    [questionKey],
  );

  useEffect(() => {
    if (
      pick.key === questionKey &&
      pick.agent &&
      pick.ability &&
      pick.played &&
      !hasSubmitted
    ) {
      onSubmit(pick.agent, pick.ability);
    }
  }, [pick, questionKey, hasSubmitted, onSubmit]);

  const matched = pick.key === questionKey;
  const selectedAgent = matched ? pick.agent : null;
  const selectedAbility = matched ? pick.ability : null;
  const hasPlayed = matched && pick.played;

  const sortedScores = Object.entries(scores)
    .map(([name, score]) => ({ name, score }))
    .sort((a, b) => b.score - a.score);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="font-valorant text-xl text-valorant-red">
          {t('battle.round', { current: questionIndex + 1, total: totalRounds })}
        </span>
        <span className="text-sm text-white/50">{t('battle.raceHint')}</span>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {sortedScores.map((s) => (
          <div
            key={s.name}
            className={`shrink-0 rounded-sm border px-2 py-1 text-xs ${
              s.name === playerName
                ? 'border-valorant-red bg-valorant-red/10'
                : 'border-white/10'
            }`}
          >
            <span className="text-white/60">{s.name}</span>{' '}
            <span className="font-valorant text-white">{s.score}</span>
          </div>
        ))}
      </div>

      <div className="card-panel p-4">
        <AudioPlayer
          onPlay={handlePlay}
          onReplay={() => replay()}
          isPlaying={isPlaying}
          hasPlayed={hasPlayed}
          disabled={!currentQuestion || hasSubmitted}
        />
      </div>

      {hasSubmitted ? (
        <p className="text-center text-sm text-valorant-red/80">{t('battle.submitted')}</p>
      ) : (
        <p className="text-center text-sm text-white/40">{t('battle.listenFirst')}</p>
      )}

      <AgentGrid
        agentIds={agentChoices}
        selectedAgent={selectedAgent}
        onSelect={selectAgent}
        disabled={hasSubmitted || !hasPlayed}
      />

      <AbilitySelector
        selectedSlot={selectedAbility}
        agentIdForIcons={selectedAgent}
        onSelect={selectAbility}
        disabled={hasSubmitted || !hasPlayed}
      />
    </div>
  );
}
