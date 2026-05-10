type Props = { size?: number; className?: string; spin?: boolean };

export function EnsoCircle({ size = 220, className, spin = false }: Props) {
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={`${className ?? ""} ${spin ? "enso-spin" : ""}`}
      aria-hidden
    >
      <defs>
        <filter id="ink" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" />
          <feDisplacementMap in="SourceGraphic" scale="2.5" />
        </filter>
      </defs>
      <g filter="url(#ink)">
        <circle
          cx="100"
          cy="100"
          r="78"
          fill="none"
          stroke="var(--ink)"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray="470 30"
          strokeDashoffset="-10"
          opacity="0.92"
        />
      </g>
    </svg>
  );
}
