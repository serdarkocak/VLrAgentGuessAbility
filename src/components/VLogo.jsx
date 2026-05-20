/**
 * Valorant-style "V" mark — uses /public/valoranticon.png.
 * Drop-shadow filter adds a soft Valorant-red + warm glow.
 */
export default function VLogo({ size = 36, className = '', glow = true }) {
  const filter = glow
    ? 'drop-shadow(0 0 6px rgba(255, 70, 85, 0.45)) drop-shadow(0 0 14px rgba(255, 140, 90, 0.25))'
    : undefined;

  return (
    <img
      src="/valoranticon.png"
      width={size}
      height={size}
      alt=""
      aria-hidden="true"
      draggable={false}
      className={`block object-contain ${className}`}
      style={{ filter }}
    />
  );
}
