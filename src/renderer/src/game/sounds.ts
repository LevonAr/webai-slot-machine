let audioCtx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext()
  }
  return audioCtx
}

function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  gain = 0.15
): void {
  const ctx = getCtx()
  const osc = ctx.createOscillator()
  const vol = ctx.createGain()

  osc.type = type
  osc.frequency.setValueAtTime(frequency, ctx.currentTime)

  vol.gain.setValueAtTime(gain, ctx.currentTime)
  vol.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

  osc.connect(vol)
  vol.connect(ctx.destination)

  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + duration)
}

export function playSpinSound(): void {
  const ctx = getCtx()
  const now = ctx.currentTime
  for (let i = 0; i < 6; i++) {
    const osc = ctx.createOscillator()
    const vol = ctx.createGain()
    osc.type = 'square'
    osc.frequency.setValueAtTime(200 + i * 80, now + i * 0.05)
    vol.gain.setValueAtTime(0.06, now + i * 0.05)
    vol.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.08)
    osc.connect(vol)
    vol.connect(ctx.destination)
    osc.start(now + i * 0.05)
    osc.stop(now + i * 0.05 + 0.08)
  }
}

export function playReelStopSound(): void {
  playTone(300, 0.1, 'triangle', 0.1)
}

export function playWinSound(): void {
  const ctx = getCtx()
  const now = ctx.currentTime
  const notes = [523, 659, 784, 1047]
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator()
    const vol = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, now + i * 0.12)
    vol.gain.setValueAtTime(0.15, now + i * 0.12)
    vol.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.25)
    osc.connect(vol)
    vol.connect(ctx.destination)
    osc.start(now + i * 0.12)
    osc.stop(now + i * 0.12 + 0.25)
  })
}

export function playJackpotSound(): void {
  const ctx = getCtx()
  const now = ctx.currentTime
  const notes = [523, 659, 784, 1047, 784, 1047, 1319]
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator()
    const vol = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, now + i * 0.1)
    vol.gain.setValueAtTime(0.18, now + i * 0.1)
    vol.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.3)
    osc.connect(vol)
    vol.connect(ctx.destination)
    osc.start(now + i * 0.1)
    osc.stop(now + i * 0.1 + 0.3)
  })
}

export function playLoseSound(): void {
  playTone(180, 0.3, 'sawtooth', 0.08)
}
