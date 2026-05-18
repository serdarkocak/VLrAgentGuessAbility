import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AGENTS } from '../data/agents.js';
import { getAgentImage } from '../lib/valorantApi.js';

function AgentCard({ agentId, selected, correct, wrong, onSelect, disabled }) {
  const [portrait, setPortrait] = useState(null);
  const agent = AGENTS[agentId];

  useEffect(() => {
    let cancelled = false;
    getAgentImage(agentId).then((data) => {
      if (!cancelled) setPortrait(data?.fullPortrait ?? null);
    });
    return () => { cancelled = true; };
  }, [agentId]);

  const borderClass = correct
    ? 'border-green-500 shadow-glow-green scale-[1.04]'
    : wrong
    ? 'border-valorant-red opacity-60'
    : selected
    ? 'agent-card selected'
    : 'agent-card';

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
        <div className="flex h-full w-full items-center justify-center bg-valorant-gray/80">
          <span className="font-valorant text-3xl text-valorant-red">{agent.name.charAt(0)}</span>
        </div>
      )}

      {/* Name overlay */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent pb-1.5 pt-4">
        <p className="text-center font-valorant text-sm leading-none text-white drop-shadow">
          {agent.name}
        </p>
      </div>

      {/* Selected highlight ring */}
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

export default function AgentGrid({ agentIds, selectedAgent, correctAgent, onSelect, disabled }) {
  const cols =
    agentIds.length <= 4
      ? 'grid-cols-4'
      : agentIds.length <= 6
      ? 'grid-cols-3 sm:grid-cols-6'
      : agentIds.length <= 8
      ? 'grid-cols-4'
      : 'grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7';

  return (
    <div className={`grid gap-2 ${cols}`}>
      {agentIds.map((id) => (
        <AgentCard
          key={id}
          agentId={id}
          selected={selectedAgent === id}
          correct={correctAgent === id}
          wrong={disabled && selectedAgent === id && correctAgent && selectedAgent !== correctAgent}
          onSelect={onSelect}
          disabled={disabled}
        />
      ))}
    </div>
  );
}
