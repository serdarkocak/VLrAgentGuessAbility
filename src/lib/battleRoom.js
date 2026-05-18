import { supabase } from './supabase.js';
import { generateRoomCode } from './roomCode.js';
import { buildBattleQuestionList } from './battleQuestions.js';
import { BATTLE_TOTAL_ROUNDS } from './battleConstants.js';

function channelName(code) {
  return `room:${code}`;
}

export async function createRoom(hostName) {
  if (!supabase) return { error: new Error('Supabase not configured') };

  const questions = buildBattleQuestionList();
  const questionKeys = questions.map((q) => q.key);

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = generateRoomCode();
    const { error } = await supabase.from('rooms').insert({
      code,
      host_name: hostName,
      status: 'waiting',
      question_keys: questionKeys,
      total_rounds: BATTLE_TOTAL_ROUNDS,
    });

    if (!error) return { code, questionKeys, error: null };
    if (error.code !== '23505') return { error };
  }

  return { error: new Error('Could not create room') };
}

export async function fetchRoom(code) {
  if (!supabase) return { room: null, error: new Error('Supabase not configured') };

  const { data, error } = await supabase.from('rooms').select('*').eq('code', code).single();
  return { room: data, error };
}

export async function updateRoomStatus(code, status) {
  if (!supabase) return { error: new Error('Supabase not configured') };
  return supabase.from('rooms').update({ status }).eq('code', code);
}

export function connectToRoom({ code, playerId, playerName, isHost, handlers }) {
  if (!supabase) {
    handlers.onError?.(new Error('Supabase not configured'));
    return () => {};
  }

  const channel = supabase.channel(channelName(code), {
    config: {
      presence: { key: playerId },
      broadcast: { self: true, ack: false },
    },
  });

  const broadcast = (event, payload) => {
    channel.send({ type: 'broadcast', event, payload });
  };

  channel
    .on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      const players = Object.entries(state).map(([key, presences]) => {
        const p = presences[0] ?? {};
        return {
          id: key,
          name: p.name ?? 'Player',
          isHost: Boolean(p.isHost),
          joinedAt: p.joinedAt ?? 0,
        };
      });
      players.sort((a, b) => a.joinedAt - b.joinedAt);
      handlers.onPresenceSync?.(players);
    })
    .on('presence', { event: 'join' }, ({ newPresences }) => {
      handlers.onPresenceJoin?.(newPresences);
    })
    .on('presence', { event: 'leave' }, ({ leftPresences }) => {
      handlers.onPresenceLeave?.(leftPresences);
    })
    .on('broadcast', { event: 'host_changed' }, ({ payload }) => {
      handlers.onHostChanged?.(payload);
    })
    .on('broadcast', { event: 'game_started' }, ({ payload }) => {
      handlers.onGameStarted?.(payload);
    })
    .on('broadcast', { event: 'question' }, ({ payload }) => {
      handlers.onQuestion?.(payload);
    })
    .on('broadcast', { event: 'answer_submitted' }, ({ payload }) => {
      handlers.onAnswerSubmitted?.(payload);
    })
    .on('broadcast', { event: 'round_result' }, ({ payload }) => {
      handlers.onRoundResult?.(payload);
    })
    .on('broadcast', { event: 'game_over' }, ({ payload }) => {
      handlers.onGameOver?.(payload);
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          name: playerName,
          isHost,
          joinedAt: Date.now(),
        });
        handlers.onSubscribed?.();
      }
      if (status === 'CHANNEL_ERROR') {
        handlers.onError?.(new Error('Channel error'));
      }
    });

  return {
    broadcast,
    unsubscribe: () => {
      supabase.removeChannel(channel);
    },
    updatePresence: async (patch) => {
      await channel.track({
        name: playerName,
        isHost,
        joinedAt: Date.now(),
        ...patch,
      });
    },
  };
}
