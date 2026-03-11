import { useSlotMachine } from '../game/useSlotMachine'
import { SPIN_COST } from '../game/slotEngine'
import SlotReel from './SlotReel'
import CoinDisplay from './CoinDisplay'
import SpinButton from './SpinButton'
import FeedbackBanner from './FeedbackBanner'
import GameOverOverlay from './GameOverOverlay'

export default function SlotMachine(): JSX.Element {
  const { state, spin, restart, setAutoSpin, cancelAutoSpin, reelStopDelays } = useSlotMachine()

  const isSpinning = state.phase === 'spinning'
  const canSpin = state.balance >= SPIN_COST && !isSpinning && state.phase !== 'loading'
  const hasWin = state.lastWin > 0 && state.phase === 'result'

  if (state.phase === 'loading') {
    return (
      <div className="slot-machine">
        <div className="slot-machine__loading">Loading...</div>
      </div>
    )
  }

  return (
    <div className="slot-machine">
      <h1 className="slot-machine__title">Lucky Slots</h1>

      <CoinDisplay balance={state.balance} />

      <div className="slot-machine__cabinet">
        <div className="slot-machine__reels">
          {state.reels.map((symbol, i) => (
            <SlotReel
              key={i}
              symbol={symbol}
              spinning={isSpinning}
              stopDelay={reelStopDelays[i]}
              isWinning={hasWin}
            />
          ))}
        </div>
      </div>

      <FeedbackBanner message={state.message} lastWin={state.lastWin} phase={state.phase} />

      <div className="slot-machine__controls">
        <SpinButton onClick={spin} disabled={!canSpin} spinning={isSpinning} cost={SPIN_COST} />

        <div className="slot-machine__auto-spin">
          {state.autoSpinRemaining > 0 ? (
            <button className="auto-spin-button auto-spin-button--cancel" onClick={cancelAutoSpin}>
              Stop Auto ({state.autoSpinRemaining})
            </button>
          ) : (
            <div className="auto-spin-options">
              {[5, 10, 25].map((n) => (
                <button
                  key={n}
                  className="auto-spin-button"
                  disabled={!canSpin}
                  onClick={() => setAutoSpin(n)}
                >
                  Auto {n}
                </button>
              ))}
            </div>
          )}
        </div>

        {state.phase !== 'gameOver' && (
          <button className="restart-button" onClick={restart}>
            Restart Game
          </button>
        )}
      </div>

      <div className="slot-machine__info">
        <span>Spins: {state.totalSpins}</span>
        <span>Won: {state.totalWon} 🟡</span>
      </div>

      <GameOverOverlay
        visible={state.phase === 'gameOver'}
        totalSpins={state.totalSpins}
        totalWon={state.totalWon}
        onRestart={restart}
      />
    </div>
  )
}
