import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useBattleRoom } from '../hooks/useBattleRoom.js';
import { unlockAudioPlayback } from '../hooks/useAudio.js';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import { isSupabaseConfigured } from '../lib/supabase.js';
import { normalizeRoomCode } from '../lib/roomCode.js';
import Lobby from '../components/battle/Lobby.jsx';
import BattleQuestion from '../components/battle/BattleQuestion.jsx';
import RoundResult from '../components/battle/RoundResult.jsx';
import FinalScoreboard from '../components/battle/FinalScoreboard.jsx';

export default function BattleRoom() {
  const { t } = useLanguage();
  const battle = useBattleRoom();
  const [joinCode, setJoinCode] = useState('');

  const createRoom = () => {
    unlockAudioPlayback();
    battle.handleCreateRoom();
  };

  const joinRoom = () => {
    unlockAudioPlayback();
    battle.handleJoinRoom(joinCode);
  };

  const startGame = () => {
    unlockAudioPlayback();
    battle.startGame();
  };

  if (!isSupabaseConfigured) {
    return (
      <div className="mx-auto max-w-md text-center">
        <p className="text-white/60">{t('battle.supabaseRequired')}</p>
        <Link to="/" className="btn-primary mt-4 inline-block">
          {t('nav.home')}
        </Link>
      </div>
    );
  }

  if (battle.phase === 'entry') {
    return (
      <motion.div
        className="mx-auto max-w-md space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-center">
          <h1 className="font-valorant text-4xl text-valorant-red">{t('battle.title')}</h1>
          <p className="mt-2 text-sm text-white/50">{t('battle.subtitle')}</p>
        </div>

        <div className="card-panel space-y-4 p-4">
          <label className="block text-sm text-white/50">{t('battle.nickname')}</label>
          <input
            type="text"
            maxLength={20}
            value={battle.playerName}
            onChange={(e) => battle.setPlayerName(e.target.value)}
            placeholder={t('result.nicknamePlaceholder')}
            className="w-full rounded-sm border border-white/20 bg-valorant-dark px-4 py-3 text-white focus:border-valorant-red focus:outline-none"
          />
        </div>

        <button
          type="button"
          className="btn-primary w-full"
          disabled={!battle.playerName.trim()}
          onClick={createRoom}
        >
          {t('battle.createRoom')}
        </button>

        <div className="card-panel space-y-3 p-4">
          <label className="block text-sm text-white/50">{t('battle.joinCode')}</label>
          <input
            type="text"
            maxLength={4}
            value={joinCode}
            onChange={(e) => setJoinCode(normalizeRoomCode(e.target.value))}
            placeholder="ABCD"
            className="w-full rounded-sm border border-white/20 bg-valorant-dark px-4 py-3 text-center font-valorant text-2xl tracking-[0.3em] uppercase focus:border-valorant-red focus:outline-none"
          />
          <button
            type="button"
            className="btn-secondary w-full"
            disabled={joinCode.length !== 4 || !battle.playerName.trim()}
            onClick={joinRoom}
          >
            {t('battle.joinRoom')}
          </button>
        </div>

        {battle.error && (
          <p className="text-center text-sm text-valorant-red">
            {battle.error === 'expired' || battle.error === 'notFound'
              ? t(`battle.${battle.error}`)
              : battle.error}
          </p>
        )}

        <Link to="/" className="block text-center text-sm text-white/40 hover:text-white">
          {t('nav.home')}
        </Link>
      </motion.div>
    );
  }

  if (battle.phase === 'lobby') {
    return (
      <Lobby
        roomCode={battle.roomCode}
        players={battle.players}
        isHost={battle.isHost}
        minPlayers={battle.minPlayers}
        maxPlayers={battle.maxPlayers}
        syncing={battle.isSyncing}
        onStart={startGame}
        onLeave={battle.leaveRoom}
      />
    );
  }

  if (battle.phase === 'final') {
    return <FinalScoreboard scores={battle.finalScores} onLeave={battle.leaveRoom} />;
  }

  return (
    <div className="relative">
      {(battle.phase === 'playing' || battle.phase === 'roundResult') && battle.currentQuestion && (
        <BattleQuestion
          questionIndex={battle.questionIndex}
          totalRounds={battle.totalRounds}
          currentQuestion={battle.currentQuestion}
          agentChoices={battle.agentChoices}
          scores={battle.scores}
          playerName={battle.playerName.trim()}
          hasSubmitted={battle.hasSubmitted}
          onSubmit={battle.submitAnswer}
        />
      )}

      {battle.phase === 'roundResult' && <RoundResult result={battle.roundResult} />}
    </div>
  );
}
