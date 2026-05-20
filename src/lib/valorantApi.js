import { AGENTS } from '../data/agents.js';
import { MANUAL_AGENT_ASSETS } from '../data/manualAgentAssets.js';

const API_BASE = 'https://valorant-api.com/v1';
const cache = new Map();

/** Local id -> API displayName overrides */
const API_NAME_MAP = {
  kayo: 'KAY/O',
};

function normalizeName(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export async function fetchAgentsMetadata() {
  if (cache.has('all')) return cache.get('all');

  try {
    const res = await fetch(`${API_BASE}/agents?isPlayableCharacter=true`);
    if (!res.ok) throw new Error('API failed');
    const json = await res.json();
    const byNorm = {};
    for (const agent of json.data) {
      byNorm[normalizeName(agent.displayName)] = agent;
    }
    cache.set('all', byNorm);
    return byNorm;
  } catch {
    cache.set('all', {});
    return {};
  }
}

export async function getAgentImage(agentId) {
  if (cache.has(`img:${agentId}`)) return cache.get(`img:${agentId}`);

  const local = AGENTS[agentId];
  if (!local) return null;

  const manual = MANUAL_AGENT_ASSETS[agentId];
  if (manual) {
    const result = {
      displayName: local.name,
      fullPortrait: manual.portrait,
      role: local.role,
      background: null,
    };
    cache.set(`img:${agentId}`, result);
    return result;
  }

  const byNorm = await fetchAgentsMetadata();
  const lookupName = API_NAME_MAP[agentId] ?? local.apiName ?? local.name;
  const apiAgent = byNorm[normalizeName(lookupName)];

  const result = apiAgent
    ? {
        displayName: apiAgent.displayName,
        fullPortrait: apiAgent.fullPortrait ?? apiAgent.displayIcon,
        role: apiAgent.role?.displayName ?? local.role,
        background: apiAgent.background,
      }
    : buildPlaceholder(agentId, local.name);

  cache.set(`img:${agentId}`, result);
  return result;
}

function buildPlaceholder(agentId, name) {
  const colors = ['#FF4655', '#0F1923', '#1C2B3A', '#ECE8E1'];
  const hash = agentId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const bg = colors[hash % colors.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500">
    <rect fill="${bg}" width="400" height="500"/>
    <text x="200" y="260" text-anchor="middle" fill="#ECE8E1" font-family="sans-serif" font-size="48" font-weight="bold">${name.charAt(0)}</text>
  </svg>`;
  return {
    displayName: name,
    fullPortrait: `data:image/svg+xml,${encodeURIComponent(svg)}`,
    role: AGENTS[agentId]?.role ?? 'Unknown',
    background: null,
    isPlaceholder: true,
  };
}

export async function preloadAgentImages(agentIds) {
  await Promise.all(agentIds.map((id) => getAgentImage(id)));
}

/** valorant-api.com ability slot → local slot key */
const API_SLOT_TO_KEY = {
  Grenade: 'c',
  Ability1: 'q',
  Ability2: 'e',
  Ultimate: 'x',
};

export async function getAgentAbilityIcons(agentId) {
  if (cache.has(`abilities:${agentId}`)) return cache.get(`abilities:${agentId}`);

  const local = AGENTS[agentId];
  if (!local) return null;

  const manual = MANUAL_AGENT_ASSETS[agentId];
  if (manual?.abilities) {
    cache.set(`abilities:${agentId}`, manual.abilities);
    return manual.abilities;
  }

  const byNorm = await fetchAgentsMetadata();
  const lookupName = API_NAME_MAP[agentId] ?? local.apiName ?? local.name;
  const apiAgent = byNorm[normalizeName(lookupName)];

  if (!apiAgent?.abilities) {
    cache.set(`abilities:${agentId}`, null);
    return null;
  }

  const icons = {};
  for (const ability of apiAgent.abilities) {
    const key = API_SLOT_TO_KEY[ability.slot];
    if (!key) continue;
    icons[key] = {
      icon: ability.displayIcon ?? null,
      name: ability.displayName ?? key.toUpperCase(),
    };
  }

  cache.set(`abilities:${agentId}`, icons);
  return icons;
}
