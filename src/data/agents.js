export const ROLES = {
  DUELIST: 'Duelist',
  CONTROLLER: 'Controller',
  SENTINEL: 'Sentinel',
  INITIATOR: 'Initiator',
  UNKNOWN: 'Unknown',
};

/** @type {Record<string, { id: string, name: string, role: string, apiName?: string }>} */
export const AGENTS = {
  astra: { id: 'astra', name: 'Astra', role: ROLES.CONTROLLER },
  breach: { id: 'breach', name: 'Breach', role: ROLES.INITIATOR },
  brimstone: { id: 'brimstone', name: 'Brimstone', role: ROLES.CONTROLLER },
  chamber: { id: 'chamber', name: 'Chamber', role: ROLES.SENTINEL },
  clove: { id: 'clove', name: 'Clove', role: ROLES.CONTROLLER },
  cypher: { id: 'cypher', name: 'Cypher', role: ROLES.SENTINEL },
  deadlock: { id: 'deadlock', name: 'Deadlock', role: ROLES.SENTINEL },
  fade: { id: 'fade', name: 'Fade', role: ROLES.INITIATOR },
  gekko: { id: 'gekko', name: 'Gekko', role: ROLES.INITIATOR },
  harbor: { id: 'harbor', name: 'Harbor', role: ROLES.CONTROLLER },
  iso: { id: 'iso', name: 'Iso', role: ROLES.DUELIST },
  jett: { id: 'jett', name: 'Jett', role: ROLES.DUELIST },
  kayo: { id: 'kayo', name: 'KAY/O', role: ROLES.INITIATOR, apiName: 'KAY/O' },
  killjoy: { id: 'killjoy', name: 'Killjoy', role: ROLES.SENTINEL },
  miks: { id: 'miks', name: 'Miks', role: ROLES.CONTROLLER },
  neon: { id: 'neon', name: 'Neon', role: ROLES.DUELIST },
  omen: { id: 'omen', name: 'Omen', role: ROLES.CONTROLLER },
  phoenix: { id: 'phoenix', name: 'Phoenix', role: ROLES.DUELIST },
  raze: { id: 'raze', name: 'Raze', role: ROLES.DUELIST },
  reyna: { id: 'reyna', name: 'Reyna', role: ROLES.DUELIST },
  sage: { id: 'sage', name: 'Sage', role: ROLES.SENTINEL },
  skye: { id: 'skye', name: 'Skye', role: ROLES.INITIATOR },
  sova: { id: 'sova', name: 'Sova', role: ROLES.INITIATOR },
  tejo: { id: 'tejo', name: 'Tejo', role: ROLES.INITIATOR },
  veto: { id: 'veto', name: 'Veto', role: ROLES.SENTINEL },
  viper: { id: 'viper', name: 'Viper', role: ROLES.CONTROLLER },
  vyse: { id: 'vyse', name: 'Vyse', role: ROLES.SENTINEL },
  waylay: { id: 'waylay', name: 'Waylay', role: ROLES.DUELIST },
  yoru: { id: 'yoru', name: 'Yoru', role: ROLES.DUELIST },
};

export const AGENT_IDS = Object.keys(AGENTS);

export const ABILITY_SLOTS = ['c', 'q', 'e', 'x'];

export const SLOT_LABELS = {
  q: 'Sinyal (Q)',
  e: 'Yetenek (E)',
  c: 'Temel (C)',
  x: 'Ulti (X)',
};

export function getAgent(id) {
  return AGENTS[id] ?? null;
}

export function getAgentsByRole(role) {
  return AGENT_IDS.filter((id) => AGENTS[id].role === role).map((id) => AGENTS[id]);
}
