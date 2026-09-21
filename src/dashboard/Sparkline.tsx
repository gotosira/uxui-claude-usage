interface SparklineProps {
  values: number[]
  color?: string
  className?: string
}

export function Sparkline({ values, color = 'var(--color-primary)', className = '' }: SparklineProps) {
  if (values.length < 2) return null
  const max = Math.max(...values.map((value) => Math.abs(value)), 1)

  return (
    <div className={`axio-spark ${className}`.trim()} aria-hidden="true">
      {values.map((value, index) => (
        <span
          key={index}
          style={{
            height: `${Math.max(12, (Math.abs(value) / max) * 100)}%`,
            background: color,
            opacity: 0.45 + (index / (values.length - 1)) * 0.55,
          }}
        />
      ))}
    </div>
  )
}
