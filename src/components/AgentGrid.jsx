import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AGENTS } from '../data/agents.js';
import { getAgentImage } from '../lib/valorantApi.js';
import { useLanguage } from '../i18n/LanguageContext.jsx';

const SEARCH_MIN_AGENTS = 8;

function AgentCard({ agentId, selected, correct, wrong, onSelect, disabled }) {
  const [portrait, setPortrait] = useState(null);
  const agent = AGENTS[agentId];

  useEffect(() => {
    let cancelled = false;
    getAgentImage(agentId).then((data) => {
      if (!cancelled) setPortrait(data?.fullPortrait ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [agentId]);

  return (
    <motion.button
      type="button"
      disabled={disabled}
      onClick={() => onSelect(agentId)}
      className={`agent-card ${correct ? 'border-green-500 shadow-glow-green !scale-[1.06]' : wrong ? 'border-valorant-red opacity-60' : ''} ${disabled ? 'cursor-default' : 'cursor-pointer'}`}
      whileTap={disabled ? {} : { scale: 0.96 }}
      layout
    >
      {portrait ? (
        <img
          src={portrait}
          alt={agent.name}
          className="h-full w-full object-cover object-top"
          loading="lazy"
        />
      ) : (
        <motion.div className="flex h-full w-full items-center justify-center bg-valorant-gray/80">
          <span className="font-valorant text-3xl text-valorant-red">{agent.name.charAt(0)}</span>
        </motion.div>
      )}

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent pb-1.5 pt-4">
        <p className="text-center font-valorant text-sm leading-none text-white drop-shadow">
          {agent.name}
        </p>
      </div>

      {selected && !correct && !wrong && (
        <motion.div
          layoutId="agent-ring"
          className="pointer-events-none absolute inset-0 rounded-sm border-2 border-valorant-red bg-valorant-red/15"
        />
      )}

      {correct && (
        <div className="absolute inset-0 flex items-center justify-center bg-green-500/20">
          <span className="text-3xl drop-shadow">✓</span>
        </div>
      )}
    </motion.button>
  );
}

function filterAgentIds(agentIds, query) {
  const q = query.trim().toLowerCase();
  if (!q) return agentIds;
  return agentIds.filter((id) => {
    const name = AGENTS[id]?.name ?? id;
    return name.toLowerCase().includes(q) || id.toLowerCase().includes(q);
  });
}

export default function AgentGrid({
  agentIds,
  selectedAgent,
  correctAgent,
  onSelect,
  disabled,
  showSearch,
}) {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const searchable = showSearch ?? agentIds.length >= SEARCH_MIN_AGENTS;

  const agentIdsKey = agentIds.join(',');
  useEffect(() => {
    setQuery('');
  }, [agentIdsKey]);

  const visibleIds = useMemo(
    () => (searchable ? filterAgentIds(agentIds, query) : agentIds),
    [agentIds, query, searchable],
  );

  const cols =
    visibleIds.length <= 4
      ? 'grid-cols-4'
      : visibleIds.length <= 6
        ? 'grid-cols-3 sm:grid-cols-6'
        : visibleIds.length <= 8
          ? 'grid-cols-4'
          : 'grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7';

  return (
    <div className="space-y-3">
      {searchable && (
        <div className="sticky top-0 z-20 -mx-1 bg-[#0a1420]/95 py-2 backdrop-blur-md">
          <div className="relative">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('game.searchAgent')}
              disabled={disabled}
              className="search-glow-init w-full rounded-md border border-white/20 bg-valorant-dark/90 py-3.5 pl-11 pr-10 text-base text-white placeholder:text-white/40 focus:border-valorant-red focus:outline-none focus:ring-1 focus:ring-valorant-red disabled:opacity-50 transition-all"
            />
            <span
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-white/40"
              aria-hidden
            >
              🔍
            </span>
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-sm text-white/50 hover:text-white"
                aria-label={t('game.clearSearch')}
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}

      {searchable && query && visibleIds.length === 0 && (
        <p className="text-center text-sm text-white/40">{t('game.noAgentMatch')}</p>
      )}

      <div className={`grid gap-2 ${cols}`}>
        {visibleIds.map((id) => (
          <AgentCard
            key={id}
            agentId={id}
            selected={selectedAgent === id}
            correct={correctAgent === id}
            wrong={
              disabled && selectedAgent === id && correctAgent && selectedAgent !== correctAgent
            }
            onSelect={onSelect}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
}
