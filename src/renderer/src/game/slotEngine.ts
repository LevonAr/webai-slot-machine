export const SYMBOLS = ['🍒', '🍋', '🍊', '🍇', '🍉', '7️⃣'] as const
export type SlotSymbol = (typeof SYMBOLS)[number]

export const INITIAL_BALANCE = 100
export const SPIN_COST = 10

const SYMBOL_WEIGHTS: Record<SlotSymbol, number> = {
  '🍒': 25,
  '🍋': 25,
  '🍊': 20,
  '🍇': 15,
  '🍉': 10,
  '7️⃣': 5
}

const WEIGHT_TOTAL = Object.values(SYMBOL_WEIGHTS).reduce((a, b) => a + b, 0)

export function spinReel(): SlotSymbol {
  let roll = Math.random() * WEIGHT_TOTAL
  for (const symbol of SYMBOLS) {
    roll -= SYMBOL_WEIGHTS[symbol]
    if (roll <= 0) return symbol
  }
  return SYMBOLS[0]
}

export function spinAllReels(): [SlotSymbol, SlotSymbol, SlotSymbol] {
  return [spinReel(), spinReel(), spinReel()]
}

const TRIPLE_PAYOUTS: Record<SlotSymbol, number> = {
  '7️⃣': 100,
  '🍉': 50,
  '🍇': 40,
  '🍊': 30,
  '🍋': 20,
  '🍒': 15
}

export function evaluateSpin(reels: [SlotSymbol, SlotSymbol, SlotSymbol]): number {
  const [a, b, c] = reels

  if (a === b && b === c) {
    return TRIPLE_PAYOUTS[a]
  }

  const counts = new Map<SlotSymbol, number>()
  for (const s of reels) {
    counts.set(s, (counts.get(s) || 0) + 1)
  }

  for (const [symbol, count] of counts) {
    if (count === 2) {
      if (symbol === '7️⃣') return 25
      return 5
    }
  }

  return 0
}

export function getResultMessage(
  winAmount: number,
  reels: [SlotSymbol, SlotSymbol, SlotSymbol]
): string {
  if (winAmount >= 100) return 'JACKPOT! 🎰'
  if (winAmount >= 40) return 'Big Win!'
  if (winAmount > 0) return `You won ${winAmount} coins!`

  const allDifferent = new Set(reels).size === 3
  if (allDifferent) return 'No match — better luck next spin!'
  return 'So close! Try again!'
}

export const ALL_SYMBOLS_FOR_ANIMATION: SlotSymbol[] = [...SYMBOLS, ...SYMBOLS, ...SYMBOLS]
