interface SpinButtonProps {
  onClick: () => void
  disabled: boolean
  spinning: boolean
  cost: number
}

export default function SpinButton({
  onClick,
  disabled,
  spinning,
  cost
}: SpinButtonProps): JSX.Element {
  return (
    <button
      className={`spin-button ${spinning ? 'spin-button--spinning' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      {spinning ? (
        <span className="spin-button__loader" />
      ) : (
        <>
          SPIN
          <span className="spin-button__cost">-{cost} 🟡</span>
        </>
      )}
    </button>
  )
}
