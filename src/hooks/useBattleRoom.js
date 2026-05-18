import { useCallback, useEffect, useRef, useState } from 'react';
import { generateId } from '../lib/id.js';
import {
  connectToRoom,
  createRoom,
  fetchRoom,
  updateRoomStatus,
} from '../lib/battleRoom.js';
import {
  buildBattleQuestionList,
  getQuestionByKey,
  isBattleAnswerCorrect,
  pickBattleAgentChoices,
} from '../lib/battleQuestions.js';
import {
  BATTLE_MAX_PLAYERS,
  BATTLE_MIN_PLAYERS,
  BATTLE_POINTS_WIN,
  BATTLE_POINTS_WRONG,
  BATTLE_ROUND_RESULT_MS,
  BATTLE_TOTAL_ROUNDS,
} from '../lib/battleConstants.js';

function getPlayerId() {
  const key = 'vq-battle-player-id';
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = generateId();
    sessionStorage.setItem(key, id);
  }
  return id;
}

export function useBattleRoom() {
  const [phase, setPhase] = useState('entry');
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState(
    () => localStorage.getItem('vq-nickname') || '',
  );
  const [isHost, setIsHost] = useState(false);
  const [players, setPlayers] = useState([]);
  const [scores, setScores] = useState({});
  const [questionIndex, setQuestionIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [agentChoices, setAgentChoices] = useState([]);
  const [roundResult, setRoundResult] = useState(null);
  const [finalScores, setFinalScores] = useState([]);
  const [error, setError] = useState(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const connRef = useRef(null);
  const playerIdRef = useRef(getPlayerId());
  const questionKeysRef = useRef([]);
  const scoresRef = useRef({});
  const roundLockedRef = useRef(false);
  const isHostRef = useRef(false);

  const syncScores = useCallback((next) => {
    scoresRef.current = next;
    setScores({ ...next });
  }, []);

  const initScores = useCallback((playerList) => {
    const next = {};
    for (const p of playerList) next[p.name] = 0;
    syncScores(next);
  }, [syncScores]);

  const broadcastQuestion = useCallback((index) => {
    const key = questionKeysRef.current[index];
    const q = getQuestionByKey(key);
    if (!q) return;
    const choices = pickBattleAgentChoices(q.agentId);
    setCurrentQuestion(q);
    setAgentChoices(choices);
    setQuestionIndex(index);
    setHasSubmitted(false);
    roundLockedRef.current = false;

    connRef.current?.broadcast('question', {
      index,
      key: q.key,
      agentId: q.agentId,
      slot: q.slot,
      soundPath: q.soundPath,
      choices,
    });
  }, []);

  const endGame = useCallback(() => {
    const list = Object.entries(scoresRef.current)
      .map(([name, score]) => ({ name, score }))
      .sort((a, b) => b.score - a.score);
    setFinalScores(list);
    setPhase('final');
    connRef.current?.broadcast('game_over', { final_scores: list });
    if (roomCode) updateRoomStatus(roomCode, 'finished');
  }, [roomCode]);

  const finishRound = useCallback(
    (winner, correctAgent, correctSlot, roundAnswers) => {
      roundLockedRef.current = true;
      const payload = {
        winner,
        correctAgent,
        correctSlot,
        scores: { ...scoresRef.current },
        roundAnswers,
        questionIndex,
      };
      setRoundResult(payload);
      setPhase('roundResult');
      connRef.current?.broadcast('round_result', payload);

      setTimeout(() => {
        setRoundResult(null);
        const next = questionIndex + 1;
        if (next >= BATTLE_TOTAL_ROUNDS) {
          endGame();
        } else {
          setPhase('playing');
          if (isHostRef.current) broadcastQuestion(next);
        }
      }, BATTLE_ROUND_RESULT_MS);
    },
    [questionIndex, endGame, broadcastQuestion],
  );

  const handleAnswerAsHost = useCallback(
    (payload) => {
      if (roundLockedRef.current) return;

      const q = getQuestionByKey(questionKeysRef.current[questionIndex]);
      if (!q) return;

      const correct = isBattleAnswerCorrect(q, payload.agentId, payload.slot);
      const name = payload.playerName;

      if (correct) {
        const next = { ...scoresRef.current };
        next[name] = (next[name] ?? 0) + BATTLE_POINTS_WIN;
        syncScores(next);
        finishRound(name, q.agentId, q.slot, [{ ...payload, correct: true }]);
      } else {
        const next = { ...scoresRef.current };
        next[name] = (next[name] ?? 0) + BATTLE_POINTS_WRONG;
        syncScores(next);
      }
    },
    [questionIndex, syncScores, finishRound],
  );

  const connect = useCallback(
    (code, name, host) => {
      isHostRef.current = host;
      setIsHost(host);
      setRoomCode(code);
      localStorage.setItem('vq-nickname', name);

      const handlers = {
        onPresenceSync: (list) => {
          setPlayers(list);
          const next = { ...scoresRef.current };
          for (const p of list) {
            if (next[p.name] === undefined) next[p.name] = 0;
          }
          if (Object.keys(next).length > 0) syncScores(next);
          else initScores(list);
        },
        onGameStarted: (payload) => {
          questionKeysRef.current = payload.question_keys ?? [];
          setPhase('playing');
          setQuestionIndex(0);
          if (!host) {
            syncScores(payload.scores ?? {});
          }
        },
        onQuestion: (payload) => {
          const q = getQuestionByKey(payload.key);
          setCurrentQuestion(q);
          setAgentChoices(payload.choices ?? []);
          setQuestionIndex(payload.index);
          setHasSubmitted(false);
          roundLockedRef.current = false;
          setPhase('playing');
        },
        onAnswerSubmitted: (payload) => {
          if (isHostRef.current) handleAnswerAsHost(payload);
        },
        onRoundResult: (payload) => {
          setRoundResult(payload);
          syncScores(payload.scores ?? {});
          setPhase('roundResult');
          setTimeout(() => {
            setRoundResult(null);
            const next = (payload.questionIndex ?? 0) + 1;
            if (next >= BATTLE_TOTAL_ROUNDS) {
              setPhase('final');
            } else {
              setPhase('playing');
            }
          }, BATTLE_ROUND_RESULT_MS);
        },
        onGameOver: (payload) => {
          setFinalScores(payload.final_scores ?? []);
          setPhase('final');
        },
        onHostChanged: (payload) => {
          const becameHost = payload.newHostId === playerIdRef.current;
          isHostRef.current = becameHost;
          setIsHost(becameHost);
        },
        onError: (err) => setError(err.message),
      };

      connRef.current = connectToRoom({
        code,
        playerId: playerIdRef.current,
        playerName: name,
        isHost: host,
        handlers,
      });

      setPhase('lobby');
    },
    [handleAnswerAsHost, initScores, syncScores],
  );

  const handleCreateRoom = useCallback(async () => {
    const name = playerName.trim();
    if (!name) return;
    setError(null);

    const { code, questionKeys, error: err } = await createRoom(name);
    if (err) {
      setError(err.message);
      return;
    }

    questionKeysRef.current = questionKeys;
    connect(code, name, true);
  }, [playerName, connect]);

  const handleJoinRoom = useCallback(
    async (codeInput) => {
      const name = playerName.trim();
      const code = codeInput.trim().toUpperCase();
      if (!name || code.length !== 4) return;
      setError(null);

      const { room, error: err } = await fetchRoom(code);
      if (err || !room) {
        setError(err?.message ?? 'Room not found');
        return;
      }
      if (room.status === 'finished') {
        setError('Room finished');
        return;
      }

      questionKeysRef.current = room.question_keys ?? [];
      connect(code, name, false);
    },
    [playerName, connect],
  );

  const startGame = useCallback(async () => {
    if (!isHostRef.current || players.length < BATTLE_MIN_PLAYERS) return;

    const keys =
      questionKeysRef.current.length > 0
        ? questionKeysRef.current
        : buildBattleQuestionList().map((q) => q.key);
    questionKeysRef.current = keys;

    initScores(players);
    await updateRoomStatus(roomCode, 'playing');

    connRef.current?.broadcast('game_started', {
      question_keys: keys,
      total_rounds: BATTLE_TOTAL_ROUNDS,
      scores: scoresRef.current,
    });

    setPhase('playing');
    broadcastQuestion(0);
  }, [players, roomCode, initScores, broadcastQuestion]);

  const submitAnswer = useCallback(
    (agentId, slot) => {
      if (hasSubmitted || roundLockedRef.current) return;

      setHasSubmitted(true);
      const payload = {
        playerId: playerIdRef.current,
        playerName: playerName.trim(),
        agentId,
        slot,
        ts: Date.now(),
        questionIndex,
      };

      connRef.current?.broadcast('answer_submitted', payload);

      if (isHostRef.current) {
        handleAnswerAsHost(payload);
      }
    },
    [hasSubmitted, playerName, questionIndex, handleAnswerAsHost],
  );

  const leaveRoom = useCallback(() => {
    connRef.current?.unsubscribe();
    connRef.current = null;
    setPhase('entry');
    setRoomCode('');
    setPlayers([]);
    syncScores({});
    setRoundResult(null);
    setFinalScores([]);
  }, [syncScores]);

  useEffect(() => {
    return () => connRef.current?.unsubscribe();
  }, []);

  useEffect(() => {
    if (!isHostRef.current || phase !== 'lobby' || players.length === 0) return;

    const hostPresent = players.some((p) => p.isHost);
    if (!hostPresent && players[0]) {
      const newHostId = players[0].id;
      isHostRef.current = newHostId === playerIdRef.current;
      setIsHost(isHostRef.current);
      connRef.current?.broadcast('host_changed', {
        newHostId,
        newHostName: players[0].name,
      });
      if (isHostRef.current) {
        connRef.current?.updatePresence({ isHost: true });
      }
    }
  }, [players, phase]);

  return {
    phase,
    roomCode,
    playerName,
    setPlayerName,
    isHost,
    players,
    scores,
    questionIndex,
    totalRounds: BATTLE_TOTAL_ROUNDS,
    currentQuestion,
    agentChoices,
    roundResult,
    finalScores,
    error,
    hasSubmitted,
    minPlayers: BATTLE_MIN_PLAYERS,
    maxPlayers: BATTLE_MAX_PLAYERS,
    handleCreateRoom,
    handleJoinRoom,
    startGame,
    submitAnswer,
    leaveRoom,
  };
}
