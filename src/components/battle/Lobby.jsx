import { useLanguage } from '../../i18n/LanguageContext.jsx';

export default function Lobby({
  roomCode,
  players,
  isHost,
  minPlayers,
  maxPlayers,
  syncing = false,
  onStart,
  onLeave,
}) {
  const { t } = useLanguage();
  const canStart = isHost && players.length >= minPlayers;

  const copyCode = () => {
    navigator.clipboard?.writeText(roomCode);
  };

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="card-panel p-6 text-center">
        <p className="text-xs uppercase tracking-widest text-white/40">{t('battle.roomCode')}</p>
        <div className="mt-2 flex items-center justify-center gap-3">
          <span className="font-valorant text-5xl tracking-[0.3em] text-valorant-red">{roomCode}</span>
          <button
            type="button"
            onClick={copyCode}
            className="rounded-sm border border-white/20 px-3 py-1 text-sm hover:border-valorant-red"
          >
            {t('battle.copy')}
          </button>
        </div>
        <p className="mt-2 text-sm text-white/50">{t('battle.shareCode')}</p>
      </div>

      <div className="card-panel p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-valorant text-xl text-valorant-red">{t('battle.players')}</h2>
          <span className="text-sm text-white/50">
            {players.length}/{maxPlayers}
          </span>
        </div>
        <ul className="space-y-2">
          {players.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between rounded-sm border border-white/10 bg-valorant-dark/50 px-3 py-2"
            >
              <span className="font-semibold">{p.name}</span>
              {p.isHost && (
                <span className="text-xs uppercase tracking-wider text-valorant-red">
                  {t('battle.host')}
                </span>
              )}
            </li>
          ))}
        </ul>
        {players.length < minPlayers && (
          <p className="mt-3 text-center text-sm text-yellow-400/80">
            {t('battle.waitingPlayers', { n: minPlayers })}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {isHost && (
          <button type="button" className="btn-primary w-full" disabled={!canStart} onClick={onStart}>
            {t('battle.startGame')}
          </button>
        )}
        {!isHost && (
          <p className="text-center text-sm text-white/50">
            {syncing ? t('battle.syncing') : t('battle.waitingHost')}
          </p>
        )}
        <button type="button" className="btn-secondary w-full" onClick={onLeave}>
          {t('battle.leave')}
        </button>
      </div>
    </div>
  );
}
