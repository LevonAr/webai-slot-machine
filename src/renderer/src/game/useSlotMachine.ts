import { useReducer, useCallback, useEffect, useRef } from 'react'
import {
  SlotSymbol,
  INITIAL_BALANCE,
  SPIN_COST,
  spinAllReels,
  evaluateSpin,
  getResultMessage
} from './slotEngine'
import {
  playSpinSound,
  playReelStopSound,
  playWinSound,
  playJackpotSound,
  playLoseSound
} from './sounds'
export interface GameState {
  phase: 'loading' | 'idle' | 'spinning' | 'result' | 'gameOver'
  balance: number
  reels: [SlotSymbol, SlotSymbol, SlotSymbol]
  lastWin: number
  message: string
  gameId: number | null
  playerId: number | null
  playerName: string
  totalSpins: number
  totalWon: number
  autoSpinRemaining: number
}

type Action =
  | { type: 'INIT_GAME'; playerId: number; gameId: number; playerName: string }
  | { type: 'START_SPIN' }
  | {
      type: 'FINISH_SPIN'
      reels: [SlotSymbol, SlotSymbol, SlotSymbol]
      winAmount: number
      message: string
    }
  | { type: 'SHOW_RESULT' }
  | { type: 'GAME_OVER' }
  | { type: 'RESTART'; gameId: number }
  | { type: 'SET_AUTO_SPIN'; count: number }
  | { type: 'DECREMENT_AUTO_SPIN' }

const initialState: GameState = {
  phase: 'loading',
  balance: INITIAL_BALANCE,
  reels: ['🍒', '🍋', '🍊'],
  lastWin: 0,
  message: 'Press SPIN to play!',
  gameId: null,
  playerId: null,
  playerName: '',
  totalSpins: 0,
  totalWon: 0,
  autoSpinRemaining: 0
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'INIT_GAME':
      return {
        ...state,
        phase: 'idle',
        playerId: action.playerId,
        gameId: action.gameId,
        playerName: action.playerName
      }

    case 'START_SPIN':
      return {
        ...state,
        phase: 'spinning',
        balance: state.balance - SPIN_COST,
        lastWin: 0,
        message: 'Spinning...'
      }

    case 'FINISH_SPIN':
      return {
        ...state,
        phase: 'result',
        reels: action.reels,
        lastWin: action.winAmount,
        balance: state.balance + action.winAmount,
        message: action.message,
        totalSpins: state.totalSpins + 1,
        totalWon: state.totalWon + action.winAmount
      }

    case 'SHOW_RESULT': {
      const canSpin = state.balance >= SPIN_COST
      return {
        ...state,
        phase: canSpin ? 'idle' : 'gameOver'
      }
    }

    case 'GAME_OVER':
      return {
        ...state,
        phase: 'gameOver',
        message: 'Game Over! You ran out of coins.',
        autoSpinRemaining: 0
      }

    case 'RESTART':
      return {
        ...initialState,
        phase: 'idle',
        playerId: state.playerId,
        playerName: state.playerName,
        gameId: action.gameId
      }

    case 'SET_AUTO_SPIN':
      return { ...state, autoSpinRemaining: action.count }

    case 'DECREMENT_AUTO_SPIN':
      return { ...state, autoSpinRemaining: Math.max(0, state.autoSpinRemaining - 1) }

    default:
      return state
  }
}

const REEL_STOP_DELAYS = [800, 1200, 1600]

interface SlotMachineHook {
  state: GameState
  spin: () => Promise<void>
  restart: () => Promise<void>
  setAutoSpin: (count: number) => void
  cancelAutoSpin: () => void
  reelStopDelays: number[]
}

export function useSlotMachine(): SlotMachineHook {
  const [state, dispatch] = useReducer(reducer, initialState)
  const autoSpinRef = useRef(0)
  const spinningRef = useRef(false)

  useEffect(() => {
    autoSpinRef.current = state.autoSpinRemaining
  }, [state.autoSpinRemaining])

  useEffect(() => {
    let cancelled = false
    async function init(): Promise<void> {
      if (!window.api) {
        if (!cancelled) {
          dispatch({ type: 'INIT_GAME', playerId: 0, gameId: 0, playerName: 'Player 1' })
        }
        return
      }
      try {
        const player = await window.api.getOrCreatePlayer('Player 1')
        const { gameId } = await window.api.startGame(player.player_id, INITIAL_BALANCE)
        if (!cancelled) {
          dispatch({
            type: 'INIT_GAME',
            playerId: player.player_id,
            gameId: Number(gameId),
            playerName: player.name
          })
        }
      } catch (err) {
        console.error('Failed to initialize game:', err)
        if (!cancelled) {
          dispatch({ type: 'INIT_GAME', playerId: 0, gameId: 0, playerName: 'Player 1' })
        }
      }
    }
    init()
    return (): void => {
      cancelled = true
    }
  }, [])

  const spin = useCallback(async (): Promise<void> => {
    if (spinningRef.current) return
    if (state.balance < SPIN_COST || state.phase === 'spinning' || state.phase === 'loading') return

    spinningRef.current = true
    dispatch({ type: 'START_SPIN' })
    playSpinSound()

    const reels = spinAllReels()
    const winAmount = evaluateSpin(reels)
    const message = getResultMessage(winAmount, reels)

    await new Promise<void>((resolve) => {
      setTimeout(() => {
        playReelStopSound()
      }, REEL_STOP_DELAYS[0])

      setTimeout(() => {
        playReelStopSound()
      }, REEL_STOP_DELAYS[1])

      setTimeout(() => {
        playReelStopSound()
      }, REEL_STOP_DELAYS[2])

      // Dispatch after a buffer so each SlotReel's own stop timeout fires first
      setTimeout(() => {
        dispatch({ type: 'FINISH_SPIN', reels, winAmount, message })

        if (winAmount >= 100) {
          playJackpotSound()
        } else if (winAmount > 0) {
          playWinSound()
        } else {
          playLoseSound()
        }

        resolve()
      }, REEL_STOP_DELAYS[2] + 100)
    })

    if (state.gameId && window.api) {
      try {
        await window.api.recordSpin(state.gameId, reels.join(','), SPIN_COST, winAmount)
      } catch (err) {
        console.error('Failed to record spin:', err)
      }
    }

    setTimeout(() => {
      spinningRef.current = false
      dispatch({ type: 'SHOW_RESULT' })
    }, 1200)
  }, [state.balance, state.phase, state.gameId])

  useEffect(() => {
    if (state.phase === 'idle' && autoSpinRef.current > 0 && state.balance >= SPIN_COST) {
      dispatch({ type: 'DECREMENT_AUTO_SPIN' })
      const timer = setTimeout(() => {
        spin()
      }, 600)
      return (): void => {
        clearTimeout(timer)
      }
    }
    return undefined
  }, [state.phase, spin, state.balance])

  const restart = useCallback(async () => {
    if (state.gameId && window.api) {
      try {
        await window.api.endGame(state.gameId, state.balance)
      } catch (err) {
        console.error('Failed to end game:', err)
      }
    }

    if (state.playerId != null && window.api) {
      try {
        const { gameId } = await window.api.startGame(state.playerId, INITIAL_BALANCE)
        dispatch({ type: 'RESTART', gameId: Number(gameId) })
      } catch (err) {
        console.error('Failed to restart game:', err)
        dispatch({ type: 'RESTART', gameId: 0 })
      }
    } else {
      dispatch({ type: 'RESTART', gameId: 0 })
    }
  }, [state.gameId, state.balance, state.playerId])

  const setAutoSpin = useCallback(
    (count: number) => {
      dispatch({ type: 'SET_AUTO_SPIN', count })
      if (count > 0) {
        dispatch({ type: 'DECREMENT_AUTO_SPIN' })
        setTimeout(() => spin(), 300)
      }
    },
    [spin]
  )

  const cancelAutoSpin = useCallback(() => {
    dispatch({ type: 'SET_AUTO_SPIN', count: 0 })
  }, [])

  return {
    state,
    spin,
    restart,
    setAutoSpin,
    cancelAutoSpin,
    reelStopDelays: REEL_STOP_DELAYS
  }
}
