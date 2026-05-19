import { useCallback, useEffect, useRef, useState } from 'react';
import { generateId } from '../lib/id.js';
import {
  cleanupStaleRooms,
  connectToRoom,
  createRoom,
  fetchRoom,
  updateRoomStatus,
  updateRoomState,
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
  ROOM_IDLE_MS,
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
  const [isSyncing, setIsSyncing] = useState(false);

  const connRef = useRef(null);
  const playerIdRef = useRef(getPlayerId());
  const questionKeysRef = useRef([]);
  const scoresRef = useRef({});
  const playersRef = useRef([]);
  const roundPlayerIdsRef = useRef(new Set());
  const answeredPlayerIdsRef = useRef(new Set());
  const roundAnswersRef = useRef([]);
  const roundLockedRef = useRef(false);
  const isHostRef = useRef(false);
  const phaseRef = useRef('entry');
  const roomCodeRef = useRef('');
  const lastQuestionPayloadRef = useRef(null);
  const lastRoundResultRef = useRef(null);
  const pendingRejoinRef = useRef(false);
  const questionIndexRef = useRef(0);

  const persistRoomState = useCallback((patch) => {
    if (!roomCodeRef.current) return;
    updateRoomState(roomCodeRef.current, {
      ...patch,
      last_activity_at: new Date().toISOString(),
    });
  }, []);

  const applyQuestionPayload = useCallback((payload) => {
    if (!payload) return;
    const q = getQuestionByKey(payload.key);
    setCurrentQuestion(q);
    setAgentChoices(payload.choices ?? []);
    setQuestionIndex(payload.index);
    questionIndexRef.current = payload.index;
    setHasSubmitted(false);
    answeredPlayerIdsRef.current = new Set();
    roundAnswersRef.current = [];
    roundLockedRef.current = false;
    lastQuestionPayloadRef.current = payload;
    roundPlayerIdsRef.current = new Set(playersRef.current.map((p) => p.id));
    setPhase('playing');
    phaseRef.current = 'playing';
  }, []);

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
    questionIndexRef.current = index;
    setHasSubmitted(false);
    roundPlayerIdsRef.current = new Set(playersRef.current.map((p) => p.id));
    answeredPlayerIdsRef.current = new Set();
    roundAnswersRef.current = [];
    roundLockedRef.current = false;

    const payload = {
      index,
      key: q.key,
      agentId: q.agentId,
      slot: q.slot,
      soundPath: q.soundPath,
      choices,
    };
    lastQuestionPayloadRef.current = payload;
    connRef.current?.broadcast('question', payload);
    persistRoomState({
      current_index: index,
      current_question: payload,
      battle_scores: scoresRef.current,
    });
  }, [persistRoomState]);

  const endGame = useCallback(() => {
    const list = Object.entries(scoresRef.current)
      .map(([name, score]) => ({ name, score }))
      .sort((a, b) => b.score - a.score);
    setFinalScores(list);
    setPhase('final');
    connRef.current?.broadcast('game_over', { final_scores: list });
    if (roomCodeRef.current) {
      updateRoomStatus(roomCodeRef.current, 'finished');
      persistRoomState({ current_question: null });
    }
  }, [persistRoomState]);

  const finishRound = useCallback(
    (winner, correctAgent, correctSlot, roundAnswers) => {
      const idx = questionIndexRef.current;
      roundLockedRef.current = true;
      const payload = {
        winner,
        correctAgent,
        correctSlot,
        scores: { ...scoresRef.current },
        roundAnswers,
        questionIndex: idx,
      };
      setRoundResult(payload);
      lastRoundResultRef.current = payload;
      setPhase('roundResult');
      phaseRef.current = 'roundResult';
      connRef.current?.broadcast('round_result', payload);
      persistRoomState({
        current_index: idx,
        battle_scores: scoresRef.current,
      });

      setTimeout(() => {
        setRoundResult(null);
        const next = idx + 1;
        if (next >= BATTLE_TOTAL_ROUNDS) {
          endGame();
        } else {
          setPhase('playing');
          if (isHostRef.current) broadcastQuestion(next);
        }
      }, BATTLE_ROUND_RESULT_MS);
    },
    [endGame, broadcastQuestion, persistRoomState],
  );

  const sendStateSync = useCallback(() => {
    if (!isHostRef.current) return;
    connRef.current?.broadcast('state_sync', {
      question_keys: questionKeysRef.current,
      scores: { ...scoresRef.current },
      questionIndex: questionIndexRef.current,
      question: lastQuestionPayloadRef.current,
      phase: phaseRef.current,
      roundResult: phaseRef.current === 'roundResult' ? lastRoundResultRef.current : null,
    });
  }, []);

  const applyStateSync = useCallback(
    (payload) => {
      questionKeysRef.current = payload.question_keys ?? questionKeysRef.current;
      syncScores(payload.scores ?? {});
      if (payload.phase === 'roundResult' && payload.roundResult) {
        setRoundResult(payload.roundResult);
        lastRoundResultRef.current = payload.roundResult;
        setPhase('roundResult');
        phaseRef.current = 'roundResult';
        return;
      }
      if (payload.question) {
        applyQuestionPayload(payload.question);
      } else if (payload.questionIndex != null) {
        setQuestionIndex(payload.questionIndex);
        questionIndexRef.current = payload.questionIndex;
        setPhase('playing');
        phaseRef.current = 'playing';
      }
    },
    [syncScores, applyQuestionPayload],
  );

  useEffect(() => {
    questionIndexRef.current = questionIndex;
  }, [questionIndex]);

  const handleAnswerAsHost = useCallback(
    (payload) => {
      const idx = questionIndexRef.current;
      if (roundLockedRef.current) return;
      if (payload.questionIndex !== idx) return;
      if (answeredPlayerIdsRef.current.has(payload.playerId)) return;

      const q = getQuestionByKey(questionKeysRef.current[idx]);
      if (!q) return;

      const correct = isBattleAnswerCorrect(q, payload.agentId, payload.slot);
      const name = payload.playerName;
      const answer = { ...payload, correct };

      answeredPlayerIdsRef.current.add(payload.playerId);
      roundAnswersRef.current = [...roundAnswersRef.current, answer];

      if (correct) {
        const next = { ...scoresRef.current };
        next[name] = (next[name] ?? 0) + BATTLE_POINTS_WIN;
        syncScores(next);
        finishRound(name, q.agentId, q.slot, roundAnswersRef.current);
      } else {
        const next = { ...scoresRef.current };
        next[name] = (next[name] ?? 0) + BATTLE_POINTS_WRONG;
        syncScores(next);

        const activePlayerIds = playersRef.current
          .map((p) => p.id)
          .filter((id) => roundPlayerIdsRef.current.has(id));
        const allActivePlayersAnswered =
          activePlayerIds.length > 0 &&
          activePlayerIds.every((id) => answeredPlayerIdsRef.current.has(id));

        if (allActivePlayersAnswered) {
          finishRound(null, q.agentId, q.slot, roundAnswersRef.current);
        }
      }
    },
    [syncScores, finishRound],
  );

  const handleAnswerAsHostRef = useRef(handleAnswerAsHost);
  useEffect(() => {
    handleAnswerAsHostRef.current = handleAnswerAsHost;
  }, [handleAnswerAsHost]);

  const connect = useCallback(
    (code, name, host, { rejoin = false, room = null } = {}) => {
      isHostRef.current = host;
      setIsHost(host);
      setRoomCode(code);
      roomCodeRef.current = code;
      pendingRejoinRef.current = rejoin;
      localStorage.setItem('vq-nickname', name);

      if (rejoin && room) {
        setIsSyncing(true);
        questionKeysRef.current = room.question_keys ?? [];
        if (room.battle_scores && Object.keys(room.battle_scores).length > 0) {
          syncScores(room.battle_scores);
        }
        if (room.current_question) {
          applyQuestionPayload(room.current_question);
          setIsSyncing(false);
        }
      }

      const handlers = {
        onPresenceJoin: () => {
          if (isHostRef.current && phaseRef.current !== 'lobby' && phaseRef.current !== 'entry') {
            sendStateSync();
          }
        },
        onPresenceSync: (list) => {
          playersRef.current = list;
          setPlayers(list);

          if (
            list.length === 0 &&
            roomCodeRef.current &&
            phaseRef.current !== 'final' &&
            phaseRef.current !== 'entry'
          ) {
            void updateRoomState(roomCodeRef.current, {
              status: 'abandoned',
              current_question: null,
              last_activity_at: new Date().toISOString(),
            });
          }

          const next = { ...scoresRef.current };
          for (const p of list) {
            if (next[p.name] === undefined) next[p.name] = 0;
          }
          if (Object.keys(next).length > 0) syncScores(next);
          else if (list.length > 0) initScores(list);
        },
        onSubscribed: () => {
          if (pendingRejoinRef.current && !host) {
            connRef.current?.broadcast('request_sync', {
              playerId: playerIdRef.current,
            });
          }
          pendingRejoinRef.current = false;
        },
        onGameStarted: (payload) => {
          questionKeysRef.current = payload.question_keys ?? [];
          setPhase('playing');
          phaseRef.current = 'playing';
          setQuestionIndex(0);
          if (!host) {
            syncScores(payload.scores ?? {});
          }
        },
        onQuestion: (payload) => {
          applyQuestionPayload(payload);
        },
        onRequestSync: () => {
          if (isHostRef.current) sendStateSync();
        },
        onStateSync: (payload) => {
          if (!isHostRef.current) {
            applyStateSync(payload);
            setIsSyncing(false);
          }
        },
        onAnswerSubmitted: (payload) => {
          if (isHostRef.current) handleAnswerAsHostRef.current?.(payload);
        },
        onRoundResult: (payload) => {
          setRoundResult(payload);
          lastRoundResultRef.current = payload;
          syncScores(payload.scores ?? {});
          setPhase('roundResult');
          phaseRef.current = 'roundResult';
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
          phaseRef.current = 'final';
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

      setPhase(rejoin && room?.current_question ? 'playing' : 'lobby');
      phaseRef.current = rejoin && room?.current_question ? 'playing' : 'lobby';
    },
    [sendStateSync, applyStateSync, applyQuestionPayload, initScores, syncScores],
  );

  const handleCreateRoom = useCallback(async () => {
    const name = playerName.trim();
    if (!name) return;
    setError(null);

    void cleanupStaleRooms();

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

      void cleanupStaleRooms();

      const { room, error: err } = await fetchRoom(code);
      if (err || !room) {
        setError(err?.message ?? 'notFound');
        return;
      }
      if (room.status === 'finished' || room.status === 'abandoned') {
        setError('expired');
        return;
      }

      const ageMs =
        Date.now() - new Date(room.last_activity_at ?? room.created_at).getTime();
      if (ageMs > ROOM_IDLE_MS) {
        setError('expired');
        return;
      }

      const isRejoin = room.status === 'playing';
      questionKeysRef.current = room.question_keys ?? [];
      connect(code, name, false, { rejoin: isRejoin, room });
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

    setPhase('playing');
    phaseRef.current = 'playing';

    connRef.current?.broadcast('game_started', {
      question_keys: keys,
      total_rounds: BATTLE_TOTAL_ROUNDS,
      scores: scoresRef.current,
    });

    broadcastQuestion(0);

    void updateRoomStatus(roomCode, 'playing');
    persistRoomState({
      status: 'playing',
      battle_scores: scoresRef.current,
      current_index: 0,
    });
  }, [players, roomCode, initScores, broadcastQuestion, persistRoomState]);

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
    roomCodeRef.current = '';
    setPlayers([]);
    syncScores({});
    setRoundResult(null);
    setFinalScores([]);
    setIsSyncing(false);
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
    isSyncing,
    minPlayers: BATTLE_MIN_PLAYERS,
    maxPlayers: BATTLE_MAX_PLAYERS,
    handleCreateRoom,
    handleJoinRoom,
    startGame,
    submitAnswer,
    leaveRoom,
  };
}
