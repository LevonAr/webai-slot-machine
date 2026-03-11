import { useEffect, useRef, useState } from 'react'
import type { SlotSymbol } from '../game/slotEngine'
import { SYMBOLS } from '../game/slotEngine'

interface SlotReelProps {
  symbol: SlotSymbol
  spinning: boolean
  stopDelay: number
  isWinning: boolean
}

export default function SlotReel({
  symbol,
  spinning,
  stopDelay,
  isWinning
}: SlotReelProps): JSX.Element {
  const [displaySymbol, setDisplaySymbol] = useState<SlotSymbol>(symbol)
  const [animating, setAnimating] = useState(false)
  const [landed, setLanded] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (spinning) {
      setAnimating(true)
      setLanded(false)
      let idx = 0
      intervalRef.current = setInterval(() => {
        setDisplaySymbol(SYMBOLS[idx % SYMBOLS.length])
        idx++
      }, 80)

      timeoutRef.current = setTimeout(() => {
        if (intervalRef.current) clearInterval(intervalRef.current)
        intervalRef.current = null
        timeoutRef.current = null
        setDisplaySymbol(symbol)
        setAnimating(false)
        setLanded(true)
        setTimeout(() => setLanded(false), 400)
      }, stopDelay)
    } else if (animating) {
      // spinning was turned off externally before our stop timeout fired -- force-settle
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      intervalRef.current = null
      timeoutRef.current = null
      setDisplaySymbol(symbol)
      setAnimating(false)
    }

    return (): void => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [spinning, stopDelay, symbol, animating])

  const reelClass = [
    'slot-reel',
    animating ? 'slot-reel--spinning' : '',
    landed ? 'slot-reel--landed' : '',
    isWinning && !animating ? 'slot-reel--winning' : ''
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={reelClass}>
      <div className="slot-reel__symbol">{displaySymbol}</div>
    </div>
  )
}
