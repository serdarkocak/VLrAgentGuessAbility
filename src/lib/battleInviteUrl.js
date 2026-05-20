/**
 * Absolute invite URL for a battle room. Respects Vite `BASE_URL` (subpath deploys).
 * @param {string} roomCode
 * @returns {string}
 */
export function getBattleInviteLink(roomCode) {
  const code = String(roomCode ?? '')
    .trim()
    .toUpperCase();
  if (!code || typeof window === 'undefined') return '';
  const base = window.location.origin + (import.meta.env.BASE_URL || '/');
  return new URL(`battle/join/${code}`, base).href;
}
