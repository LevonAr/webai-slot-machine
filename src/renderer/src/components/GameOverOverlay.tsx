interface GameOverOverlayProps {
  visible: boolean
  totalSpins: number
  totalWon: number
  onRestart: () => void
}

export default function GameOverOverlay({
  visible,
  totalSpins,
  totalWon,
  onRestart
}: GameOverOverlayProps): JSX.Element | null {
  if (!visible) return null

  return (
    <div className="game-over-overlay">
      <div className="game-over-overlay__card">
        <h2 className="game-over-overlay__title">Game Over</h2>
        <p className="game-over-overlay__subtitle">You ran out of coins!</p>
        <div className="game-over-overlay__stats">
          <div className="game-over-overlay__stat">
            <span className="game-over-overlay__stat-value">{totalSpins}</span>
            <span className="game-over-overlay__stat-label">Total Spins</span>
          </div>
          <div className="game-over-overlay__stat">
            <span className="game-over-overlay__stat-value">{totalWon}</span>
            <span className="game-over-overlay__stat-label">Coins Won</span>
          </div>
        </div>
        <button className="game-over-overlay__button" onClick={onRestart}>
          Play Again
        </button>
      </div>
    </div>
  )
}
