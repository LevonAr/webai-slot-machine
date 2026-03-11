import { useEffect, useRef, useState } from 'react'

interface CoinDisplayProps {
  balance: number
}

export default function CoinDisplay({ balance }: CoinDisplayProps): JSX.Element {
  const [display, setDisplay] = useState(balance)
  const prevRef = useRef(balance)
  const targetRef = useRef(balance)
  const animRef = useRef<ReturnType<typeof requestAnimationFrame> | null>(null)

  useEffect(() => {
    const start = prevRef.current
    const end = balance
    targetRef.current = end

    if (start === end) return undefined

    const duration = 400
    const startTime = performance.now()

    function animate(now: number): void {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(start + (end - start) * eased)
      setDisplay(current)

      if (progress < 1 && targetRef.current === end) {
        animRef.current = requestAnimationFrame(animate)
      } else {
        setDisplay(targetRef.current)
        prevRef.current = targetRef.current
      }
    }

    animRef.current = requestAnimationFrame(animate)
    return (): void => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [balance])

  return (
    <div className="coin-display">
      <span className="coin-display__label">Balance:</span>
      <span className="coin-display__value">{display}</span>
      <span className="coin-display__icon">🟡</span>
    </div>
  )
}
