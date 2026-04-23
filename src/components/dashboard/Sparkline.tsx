// Minimal 14-point sparkline rendered as SVG. No chart lib — this keeps the
// dashboard bundle ~0kb heavier. Accessible via the `ariaLabel` prop since
// the glyph itself is decorative.
export default function Sparkline({
  data,
  stroke = "#e11d48",
  fill = "#fde8ee",
  height = 36,
  width = 120,
  ariaLabel,
}: {
  data: number[];
  stroke?: string;
  fill?: string;
  height?: number;
  width?: number;
  ariaLabel?: string;
}) {
  if (data.length === 0) return null;

  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const pad = 2;
  const innerH = height - pad * 2;
  const innerW = width - pad * 2;
  const step = data.length > 1 ? innerW / (data.length - 1) : 0;

  const points = data.map((v, i) => {
    const x = pad + i * step;
    const y = pad + innerH - ((v - min) / range) * innerH;
    return [x, y] as const;
  });

  const path = points.map(([x, y], i) => (i === 0 ? `M ${x},${y}` : `L ${x},${y}`)).join(" ");
  const area = `${path} L ${pad + innerW},${height - pad} L ${pad},${height - pad} Z`;
  const last = points[points.length - 1];

  return (
    <svg
      role={ariaLabel ? "img" : undefined}
      aria-label={ariaLabel}
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className="block"
    >
      <path d={area} fill={fill} />
      <path d={path} fill="none" stroke={stroke} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={last[0]} cy={last[1]} r={2.5} fill={stroke} />
    </svg>
  );
}
