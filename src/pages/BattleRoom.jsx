import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
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
  const { roomCode: inviteRoomCode } = useParams();
  const battle = useBattleRoom();
  const [joinCode, setJoinCode] = useState('');

  const isInviteFlow = Boolean(inviteRoomCode?.trim());
  const normalizedInviteCode = useMemo(() => {
    const raw = inviteRoomCode?.trim();
    return raw ? normalizeRoomCode(raw) : '';
  }, [inviteRoomCode]);
  const inviteCodeReady = normalizedInviteCode.length === 4;

  useEffect(() => {
    if (battle.phase !== 'entry') return;
    if (isInviteFlow) {
      setJoinCode(normalizedInviteCode);
    } else {
      setJoinCode('');
    }
  }, [inviteRoomCode, battle.phase, isInviteFlow, normalizedInviteCode]);

  const createRoom = () => {
    unlockAudioPlayback();
    battle.handleCreateRoom();
  };

  const joinRoom = () => {
    unlockAudioPlayback();
    const code =
      isInviteFlow && inviteCodeReady ? normalizedInviteCode : joinCode;
    battle.handleJoinRoom(code);
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
    if (isInviteFlow) {
      return (
        <motion.div
          className="mx-auto max-w-md space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-center">
            <h1 className="font-valorant text-4xl text-valorant-red">{t('battle.title')}</h1>
            <p className="mt-2 text-sm text-white/60">{t('battle.inviteJoinSubtitle')}</p>
            {inviteCodeReady ? (
              <>
                <p className="mt-3 text-xs uppercase tracking-widest text-white/40">{t('battle.joinCode')}</p>
                <p className="mt-1 font-valorant text-2xl tracking-[0.25em] text-valorant-red">
                  {normalizedInviteCode}
                </p>
              </>
            ) : (
              <p className="mt-3 text-sm text-valorant-red">{t('battle.inviteInvalidCode')}</p>
            )}
          </div>

          <div className="card-panel space-y-4 p-4">
            <label className="block text-sm text-white/50">{t('battle.nickname')}</label>
            <input
              type="text"
              maxLength={20}
              value={battle.playerName}
              onChange={(e) => battle.setPlayerName(e.target.value)}
              onKeyDown={(e) => {
                if (
                  e.key === 'Enter' &&
                  inviteCodeReady &&
                  battle.playerName.trim()
                ) {
                  e.preventDefault();
                  joinRoom();
                }
              }}
              placeholder={t('result.nicknamePlaceholder')}
              className="w-full rounded-sm border border-white/20 bg-valorant-dark px-4 py-3 text-white focus:border-valorant-red focus:outline-none"
              autoFocus
            />
          </div>

          <button
            type="button"
            className="btn-primary w-full"
            disabled={!inviteCodeReady || !battle.playerName.trim()}
            onClick={joinRoom}
          >
            {t('battle.joinInviteCta')}
          </button>

          <Link
            to="/battle"
            className="block text-center text-sm text-white/45 underline decoration-white/25 underline-offset-2 hover:text-white"
          >
            {t('battle.createRoomInstead')}
          </Link>

          {battle.error && (
            <p className="text-center text-sm text-valorant-red">
              {battle.error === 'expired' ||
              battle.error === 'notFound' ||
              battle.error === 'roomFull'
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
          {joinCode.length > 0 && !battle.playerName.trim() && (
            <p className="text-center text-xs text-yellow-400/90 animate-pulse font-medium py-1">
              ⚠️ {t('battle.enterNicknameFirst')}
            </p>
          )}
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
            {battle.error === 'expired' ||
            battle.error === 'notFound' ||
            battle.error === 'roomFull'
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
