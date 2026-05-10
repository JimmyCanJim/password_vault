type Props = {
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
  variant?: "walking" | "facing" | "small";
};

// Simple line-art elephant silhouettes. Decorative only.
export function ElephantSilhouette({
  size = 80,
  color = "currentColor",
  className,
  style,
  variant = "walking",
}: Props) {
  const common = {
    width: size,
    height: size,
    fill: "none",
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    className,
    style,
  };

  if (variant === "facing") {
    return (
      <svg viewBox="0 0 100 100" {...common}>
        {/* head */}
        <path d="M30 38 Q30 22 50 22 Q70 22 70 38 L70 60 Q70 72 60 76 L40 76 Q30 72 30 60 Z" />
        {/* ears */}
        <path d="M30 38 Q14 36 12 52 Q12 66 26 64" />
        <path d="M70 38 Q86 36 88 52 Q88 66 74 64" />
        {/* trunk */}
        <path d="M50 56 Q46 70 50 80 Q56 86 50 92" />
        {/* tusks */}
        <path d="M44 70 Q40 80 42 88" />
        <path d="M56 70 Q60 80 58 88" />
        {/* eyes */}
        <circle cx="42" cy="46" r="1.4" fill={color} stroke="none" />
        <circle cx="58" cy="46" r="1.4" fill={color} stroke="none" />
      </svg>
    );
  }

  if (variant === "small") {
    return (
      <svg viewBox="0 0 100 60" width={size} height={(size * 60) / 100} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className} style={style}>
        <path d="M20 42 Q20 22 38 22 Q56 22 56 36 L74 36 Q86 36 86 46 L86 52 L80 52 L78 48 L72 48 L70 52 L40 52 L38 48 L32 48 L30 52 L24 52 Q20 52 20 48 Z" />
        <path d="M56 36 Q60 30 66 32" />
        <circle cx="30" cy="34" r="1.5" fill={color} stroke="none" />
      </svg>
    );
  }

  // walking — side profile
  const w = size;
  const h = (size * 80) / 120;
  return (
    <svg viewBox="0 0 120 80" {...common} width={w} height={h}>
      {/* body */}
      <path d="M22 50 Q22 28 50 26 Q78 26 86 38 L100 38 Q112 38 112 50 L112 60 L102 60 L100 56 L94 56 L92 60 L52 60 L50 56 L42 56 L40 60 L30 60 Q22 60 22 56 Z" />
      {/* trunk curl */}
      <path d="M86 38 Q98 30 102 36 Q100 42 96 40" />
      {/* ear */}
      <path d="M40 32 Q34 30 32 38 Q32 46 38 46" />
      {/* tail */}
      <path d="M22 44 Q14 46 14 54" />
      {/* tusk */}
      <path d="M88 44 Q92 50 90 54" />
      {/* eye */}
      <circle cx="46" cy="38" r="1.6" fill={color} stroke="none" />
    </svg>
  );
}
