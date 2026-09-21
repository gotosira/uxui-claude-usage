import { useEffect, useRef, useState } from 'react'
import { formatCompact, formatUsd } from '../data/aggregate'

interface AnimatedNumberProps {
  value: number
  format?: 'number' | 'usd' | 'compact'
  className?: string
}

export function AnimatedNumber({ value, format = 'number', className }: AnimatedNumberProps) {
  const [display, setDisplay] = useState(value)
  const prev = useRef(value)
  const raf = useRef(0)

  useEffect(() => {
    const from = prev.current
    const to = value
    const start = performance.now()
    const duration = 600

    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(from + (to - from) * eased)
      if (t < 1) raf.current = requestAnimationFrame(tick)
      else prev.current = to
    }

    cancelAnimationFrame(raf.current)
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [value])

  let text: string
  if (format === 'usd') text = formatUsd(display)
  else if (format === 'compact') text = formatCompact(Math.round(display))
  else text = Math.round(display).toLocaleString()

  return <span className={className}>{text}</span>
}
