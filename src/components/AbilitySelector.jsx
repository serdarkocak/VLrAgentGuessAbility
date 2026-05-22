import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ABILITY_SLOTS } from '../data/agents.js';
import { getAgentAbilityIcons } from '../lib/valorantApi.js';
import { useLanguage } from '../i18n/LanguageContext.jsx';

function GenericSlotIcon({ slot, className }) {
  const colors = { c: '#4ade80', q: '#60a5fa', e: '#fbbf24', x: '#ff4655' };
  const color = colors[slot] ?? '#ff4655';

  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <polygon
        points="24,4 44,14 44,34 24,44 4,34 4,14"
        fill="none"
        stroke={color}
        strokeWidth="2"
        opacity="0.7"
      />
      <text
        x="24"
        y="28"
        textAnchor="middle"
        fill={color}
        fontSize="16"
        fontWeight="bold"
        fontFamily="Impact, sans-serif"
      >
        {slot.toUpperCase()}
      </text>
    </svg>
  );
}

function AbilitySlotButton({
  slot,
  ability,
  isSelected,
  isCorrect,
  isWrong,
  isEliminated,
  isWrongFirstAttempt,
  disabled,
  onSelect,
  tSlotShort,
}) {
  const hasIcon = Boolean(ability?.icon);

  return (
    <motion.button
      type="button"
      disabled={disabled || isEliminated || isWrongFirstAttempt}
      onClick={() => onSelect(slot)}
      title={ability?.name ?? tSlotShort(slot)}
      className={`slot-btn relative overflow-hidden ${isSelected ? 'selected' : ''} ${
        isCorrect ? '!border-green-500 !bg-green-500/20' : ''
      } ${isWrong ? '!border-valorant-red/60 !opacity-60' : ''} ${
        isEliminated ? '!opacity-20 pointer-events-none border-white/5 bg-transparent' : ''
      } ${
        isWrongFirstAttempt ? '!border-valorant-red !bg-valorant-red/15 !opacity-50 cursor-not-allowed shadow-[0_0_14px_rgba(255,70,85,0.35)]' : ''
      }`}
      whileTap={disabled || isEliminated || isWrongFirstAttempt ? {} : { scale: 0.94 }}
    >
      <div className="relative flex h-10 w-10 items-center justify-center">
        {hasIcon ? (
          <img
            src={ability.icon}
            alt={ability.name}
            className={`h-10 w-10 object-contain drop-shadow-md ${
              isCorrect ? 'brightness-125' : isSelected ? 'brightness-110' : 'opacity-90'
            }`}
            draggable={false}
          />
        ) : (
          <GenericSlotIcon slot={slot} className="h-10 w-10" />
        )}
        <span
          className={`absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-sm text-[9px] font-bold leading-none ${
            isCorrect
              ? 'bg-green-500 text-white'
              : isSelected
              ? 'bg-valorant-red text-white'
              : 'border border-white/20 bg-valorant-dark/90 text-white/70'
          }`}
        >
          {slot.toUpperCase()}
        </span>
      </div>
      <span
        className={`max-w-full truncate px-1 text-center text-[10px] font-semibold uppercase leading-tight tracking-wide ${
          isCorrect ? 'text-green-400' : isSelected ? 'text-valorant-red' : 'text-white/50'
        }`}
      >
        {ability?.name ?? tSlotShort(slot)}
      </span>
      {isCorrect && <span className="absolute right-1 top-1 text-xs text-green-400">✓</span>}
      
      {/* Visual elimination overlay */}
      {isEliminated && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <span className="text-lg font-bold text-valorant-red drop-shadow">✕</span>
        </div>
      )}
    </motion.button>
  );
}

export default function AbilitySelector({
  selectedSlot,
  correctSlot,
  eliminatedSlots = [],
  firstAttemptSlot,
  agentIdForIcons,
  onSelect,
  disabled,
}) {
  const { tSlotShort } = useLanguage();
  const [abilityIcons, setAbilityIcons] = useState(null);

  useEffect(() => {
    if (!agentIdForIcons) {
      setAbilityIcons(null);
      return;
    }
    let cancelled = false;
    getAgentAbilityIcons(agentIdForIcons).then((data) => {
      if (!cancelled) setAbilityIcons(data);
    });
    return () => { cancelled = true; };
  }, [agentIdForIcons]);

  return (
    <motion.div className="grid grid-cols-4 gap-2" layout key={agentIdForIcons ?? 'generic'}>
      {ABILITY_SLOTS.map((slot) => (
        <AbilitySlotButton
          key={slot}
          slot={slot}
          ability={abilityIcons?.[slot] ?? null}
          isSelected={selectedSlot === slot}
          isCorrect={correctSlot === slot}
          isWrong={disabled && selectedSlot === slot && correctSlot && selectedSlot !== correctSlot}
          isEliminated={eliminatedSlots.includes(slot)}
          isWrongFirstAttempt={firstAttemptSlot === slot}
          disabled={disabled}
          onSelect={onSelect}
          tSlotShort={tSlotShort}
        />
      ))}
    </motion.div>
  );
}
