/**
 * Utilitário de comemoração com feedback auditivo premium nativo.
 * Gera sons sintéticos via Web Audio API do navegador em tempo real (sem arquivos de áudio externos).
 */

export function playPopSound() {
  if (typeof window === 'undefined') return

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContextClass) return

    const audioCtx = new AudioContextClass()
    const osc = audioCtx.createOscillator()
    const gainNode = audioCtx.createGain()

    osc.type = 'sine'
    // Freqüência ascendente curta e agradável (efeito "plip/pop")
    osc.frequency.setValueAtTime(400, audioCtx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(750, audioCtx.currentTime + 0.08)

    // Ganho (volume) com envelope curto
    gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.09)

    osc.connect(gainNode)
    gainNode.connect(audioCtx.destination)

    osc.start()
    osc.stop(audioCtx.currentTime + 0.1)
  } catch (error) {
    console.warn('Erro ao reproduzir som pop:', error)
  }
}

export function playVictorySound() {
  if (typeof window === 'undefined') return

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContextClass) return

    const audioCtx = new AudioContextClass()
    const now = audioCtx.currentTime

    // Acorde/Arpejo ascendente de vitória (Dó maior: C4 -> E4 -> G4 -> C5)
    const notes = [261.63, 329.63, 392.00, 523.25]
    
    notes.forEach((freq, idx) => {
      const osc = audioCtx.createOscillator()
      const gainNode = audioCtx.createGain()

      osc.type = 'triangle' // som mais suave e retrô que sine
      osc.frequency.setValueAtTime(freq, now + idx * 0.07) // arpejo curto

      // Envelope de volume para cada nota do arpejo
      const noteStart = now + idx * 0.07
      const noteDuration = 0.4 - idx * 0.05

      gainNode.gain.setValueAtTime(0.001, now)
      gainNode.gain.linearRampToValueAtTime(0.08, noteStart + 0.02)
      gainNode.gain.exponentialRampToValueAtTime(0.001, noteStart + noteDuration)

      osc.connect(gainNode)
      gainNode.connect(audioCtx.destination)

      osc.start(noteStart)
      osc.stop(noteStart + noteDuration + 0.05)
    })
  } catch (error) {
    console.warn('Erro ao reproduzir som de vitória:', error)
  }
}
