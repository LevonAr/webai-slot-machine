interface FeedbackBannerProps {
  message: string
  lastWin: number
  phase: string
}

export default function FeedbackBanner({
  message,
  lastWin,
  phase
}: FeedbackBannerProps): JSX.Element {
  const isWin = lastWin > 0
  const isJackpot = lastWin >= 100
  const isResult = phase === 'result'

  const className = [
    'feedback-banner',
    isResult ? 'feedback-banner--visible' : '',
    isResult && isJackpot ? 'feedback-banner--jackpot' : '',
    isResult && isWin && !isJackpot ? 'feedback-banner--win' : '',
    isResult && !isWin ? 'feedback-banner--lose' : ''
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={className}>
      <div className="feedback-banner__message">{message}</div>
      {isResult && isWin && <div className="feedback-banner__amount">+{lastWin} coins</div>}
    </div>
  )
}
