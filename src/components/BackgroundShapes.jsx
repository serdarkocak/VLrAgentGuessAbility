/**
 * Decorative floating geometric shapes for glassmorphism background.
 * Valorant-inspired palette: deep navy base with red + purple/blue glow accents.
 */
export default function BackgroundShapes() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      aria-hidden="true"
    >
      {/* Large soft color blobs — Valorant red + purple + blue */}
      <div className="absolute -left-32 top-10 h-96 w-96 rounded-full bg-valorant-red/15 blur-3xl" />
      <div className="absolute -right-24 top-1/3 h-[28rem] w-[28rem] rounded-full bg-neon-purple/18 blur-3xl" />
      <div className="absolute bottom-0 left-1/4 h-[32rem] w-[32rem] rounded-full bg-neon-blue/12 blur-3xl" />
      <div className="absolute -bottom-24 right-0 h-[26rem] w-[26rem] rounded-full bg-valorant-red/12 blur-3xl" />

      {/* Floating geometric shapes */}
      <div className="absolute left-[6%] top-[18%] h-14 w-14 rotate-12 rounded-xl border border-white/15 bg-white/5 backdrop-blur-md animate-float-slow" />
      <div className="absolute left-[12%] top-[55%] h-10 w-10 rounded-lg border border-valorant-red/25 bg-white/[0.03] backdrop-blur-sm animate-float-medium" />
      <div className="absolute left-[3%] bottom-[18%] h-20 w-20 rotate-45 rounded-2xl border border-white/10 bg-white/[0.03] animate-float-slow" />

      <div className="absolute right-[8%] top-[12%] h-24 w-24 rounded-full border border-neon-blue/25 animate-float-medium" />
      <div className="absolute right-[14%] top-[45%] h-12 w-12 -rotate-12 rounded-xl border border-white/15 bg-white/[0.04] backdrop-blur-md animate-float-fast" />
      <div className="absolute right-[5%] bottom-[22%] h-16 w-16 rounded-full border-2 border-valorant-red/25 animate-pulse-glow" />

      {/* Triangles via clip-path */}
      <div
        className="absolute left-[20%] top-[8%] h-10 w-10 border border-white/15 bg-white/[0.04] backdrop-blur-sm animate-float-fast"
        style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }}
      />
      <div
        className="absolute right-[22%] bottom-[10%] h-12 w-12 -rotate-12 border border-valorant-red/30 bg-valorant-red/[0.06] backdrop-blur-sm animate-float-medium"
        style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }}
      />

      {/* Tiny accent dots */}
      <div className="absolute left-[40%] top-[6%] h-2 w-2 rounded-full bg-valorant-red/80 shadow-glow-soft" />
      <div className="absolute right-[35%] top-[28%] h-1.5 w-1.5 rounded-full bg-white/60" />
      <div className="absolute left-[28%] bottom-[12%] h-2 w-2 rounded-full bg-neon-purple/80" />
      <div className="absolute right-[40%] bottom-[28%] h-1.5 w-1.5 rounded-full bg-neon-blue/70" />

      {/* Faint grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.045]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(236, 232, 225, 0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(236, 232, 225, 0.6) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      {/* Subtle vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 50%, rgba(10, 20, 32, 0.55) 100%)',
        }}
      />
    </div>
  );
}
