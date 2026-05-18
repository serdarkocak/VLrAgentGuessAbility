import { motion } from 'framer-motion';

export default function CountdownBar({ seconds, totalSeconds }) {
  const progress = totalSeconds > 0 ? seconds / totalSeconds : 0;
  const urgent = seconds <= 10;

  return (
    <div className="flex items-center gap-3">
      <span className={`font-valorant text-xl tabular-nums ${urgent ? 'text-valorant-red' : 'text-white/70'}`}>
        {seconds}s
      </span>
      <div className="flex-1 overflow-hidden rounded-full bg-white/10 h-1.5">
        <motion.div
          className={`h-full rounded-full ${urgent ? 'bg-valorant-red' : 'bg-valorant-red/70'}`}
          initial={false}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>
    </div>
  );
}
