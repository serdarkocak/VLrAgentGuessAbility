import { useCallback, useEffect, useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext.jsx';
import { useAudio } from '../../hooks/useAudio.js';
import AudioPlayer from '../AudioPlayer.jsx';
import AgentGrid from '../AgentGrid.jsx';
import AbilitySelector from '../AbilitySelector.jsx';

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
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [selectedAbility, setSelectedAbility] = useState(null);
  const [hasPlayed, setHasPlayed] = useState(false);

  useEffect(() => {
    setSelectedAgent(null);
    setSelectedAbility(null);
    setHasPlayed(false);
  }, [currentQuestion?.key]);

  const handlePlay = useCallback(() => {
    if (!currentQuestion) return;
    play(currentQuestion.soundPath);
    setHasPlayed(true);
  }, [currentQuestion, play]);

  useEffect(() => {
    if (selectedAgent && selectedAbility && hasPlayed && !hasSubmitted) {
      onSubmit(selectedAgent, selectedAbility);
    }
  }, [selectedAgent, selectedAbility, hasPlayed, hasSubmitted, onSubmit]);

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
        onSelect={setSelectedAgent}
        disabled={hasSubmitted || !hasPlayed}
      />

      <AbilitySelector
        selectedSlot={selectedAbility}
        agentIdForIcons={selectedAgent}
        onSelect={setSelectedAbility}
        disabled={hasSubmitted || !hasPlayed}
      />
    </div>
  );
}
