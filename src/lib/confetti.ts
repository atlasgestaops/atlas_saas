/**
 * Utilitário de comemoração de tarefas com efeito de confete premium nativo.
 * Sem dependências externas, usando Canvas 2D e requestAnimationFrame.
 */

interface ConfettiParticle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  rotation: number
  rotationSpeed: number
  gravity: number
  opacity: number
  shape: 'circle' | 'square' | 'triangle'
}

export function triggerConfetti(
  clientX?: number, 
  clientY?: number, 
  options?: { goldOnly?: boolean; particleCount?: number }
) {
  if (typeof window === 'undefined') return

  const canvas = document.createElement('canvas')
  canvas.style.position = 'fixed'
  canvas.style.top = '0'
  canvas.style.left = '0'
  canvas.style.width = '100%'
  canvas.style.height = '100%'
  canvas.style.pointerEvents = 'none'
  canvas.style.zIndex = '99999'
  document.body.appendChild(canvas)

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    document.body.removeChild(canvas)
    return
  }

  let width = (canvas.width = window.innerWidth)
  let height = (canvas.height = window.innerHeight)

  const handleResize = () => {
    width = canvas.width = window.innerWidth
    height = canvas.height = window.innerHeight
  }
  window.addEventListener('resize', handleResize)

  // Coordenadas iniciais do confete (padrão: centro da tela)
  const startX = clientX !== undefined ? clientX : width / 2
  const startY = clientY !== undefined ? clientY : height / 2

  // Paletas de cores
  const defaultColors = [
    '#3b82f6', // azul
    '#60a5fa', // azul claro
    '#10b981', // esmeralda
    '#34d399', // verde claro
    '#f59e0b', // âmbar
    '#fbbf24', // amarelo
    '#ef4444', // vermelho
    '#f87171', // vermelho claro
    '#8b5cf6', // violeta
    '#a78bfa', // violeta claro
    '#ec4899', // rosa
    '#f472b6', // rosa claro
  ]

  const goldColors = [
    '#d97706', // amber-600
    '#f59e0b', // amber-500
    '#fbbf24', // amber-400
    '#fef08a', // yellow-200
    '#ca8a04', // yellow-600
    '#eab308', // yellow-500
    '#ffd700', // gold
    '#ffdf00', // gold light
    '#b45309', // amber-800
  ]

  const colors = options?.goldOnly ? goldColors : defaultColors
  const shapes: ('circle' | 'square' | 'triangle')[] = ['circle', 'square', 'triangle']
  const particles: ConfettiParticle[] = []

  const count = options?.particleCount || (options?.goldOnly ? 130 : 70)

  // Criar partículas para a explosão
  for (let i = 0; i < count; i++) {
    // Ângulo de dispersão radial (se for dourado, dispersa mais horizontalmente também)
    const angle = options?.goldOnly
      ? Math.random() * Math.PI * 2 // Círculo completo 360
      : Math.random() * Math.PI * 1.3 + Math.PI * 1.35 // Direcionado para cima
    
    const speed = options?.goldOnly
      ? Math.random() * 12 + 6 // Explosão maior
      : Math.random() * 8 + 6

    particles.push({
      x: startX,
      y: startY,
      vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 3,
      vy: Math.sin(angle) * speed - (options?.goldOnly ? Math.random() * 4 : Math.random() * 2 + 1),
      size: Math.random() * (options?.goldOnly ? 8 : 6) + 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      gravity: options?.goldOnly ? 0.22 : 0.35, // gravidade menor para flutuar no dourado
      opacity: 1,
      shape: shapes[Math.floor(Math.random() * shapes.length)],
    })
  }

  function animate() {
    ctx!.clearRect(0, 0, width, height)

    let active = false

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i]
      if (p.opacity <= 0) continue

      // Atualizar física
      p.x += p.vx
      p.y += p.vy
      p.vy += p.gravity
      p.vx *= 0.98 // resistência do ar sutil
      p.rotation += p.rotationSpeed
      p.opacity -= 0.015 // fade out

      if (p.opacity > 0) {
        active = true
        ctx!.save()
        ctx!.translate(p.x, p.y)
        ctx!.rotate((p.rotation * Math.PI) / 180)
        ctx!.fillStyle = p.color
        ctx!.globalAlpha = p.opacity

        // Desenhar forma geométrica
        ctx!.beginPath()
        if (p.shape === 'circle') {
          ctx!.arc(0, 0, p.size / 2, 0, Math.PI * 2)
          ctx!.fill()
        } else if (p.shape === 'square') {
          ctx!.fillRect(-p.size / 2, -p.size / 2, p.size, p.size)
        } else if (p.shape === 'triangle') {
          ctx!.moveTo(0, -p.size / 2)
          ctx!.lineTo(p.size / 2, p.size / 2)
          ctx!.lineTo(-p.size / 2, p.size / 2)
          ctx!.closePath()
          ctx!.fill()
        }
        ctx!.restore()
      }
    }

    if (active) {
      requestAnimationFrame(animate)
    } else {
      window.removeEventListener('resize', handleResize)
      if (canvas.parentNode) {
        document.body.removeChild(canvas)
      }
    }
  }

  animate()
}
