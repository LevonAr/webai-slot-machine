export interface Player {
  player_id: number
  name: string
  created_at: string
  highest_balance: number
  total_spins: number
}

export interface LeaderboardEntry {
  name: string
  highest_balance: number
  total_spins: number
}

export interface SlotApi {
  getOrCreatePlayer: (playerName: string) => Promise<Player>
  startGame: (playerId: number, startingBalance: number) => Promise<{ gameId: number }>
  endGame: (gameId: number, endingBalance: number) => Promise<unknown>
  recordSpin: (
    gameId: number,
    symbols: string,
    betAmount: number,
    winAmount: number
  ) => Promise<{ spinId: number }>
  getLeaderboard: () => Promise<LeaderboardEntry[]>
}

declare global {
  interface Window {
    api: SlotApi
  }
}
