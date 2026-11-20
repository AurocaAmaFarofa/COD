import { useEffect, useRef } from 'react'

// Fundo fractal glass em WebGL. Cada coluna vertical é uma fatia de vidro com
// deslocamento próprio e borda serrilhada; faixas de luz diagonais atravessam as fatias.
// Se o navegador não tiver WebGL, o canvas fica vazio e o fundo CSS aparece.
const VERTEX = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`

const FRAGMENT = `
precision mediump float;
uniform vec2 uRes;
uniform float uTempo;
uniform float uPasso;

float hash(float n) { return fract(sin(n) * 43758.5453); }

float ruido(float x) {
  float i = floor(x);
  float f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(hash(i), hash(i + 1.0), f);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;

  // Fatias verticais: cada uma recebe um deslocamento que muda devagar.
  // A largura de cada fatia é fixa em pixels: ao diminuir a tela, as listras não se espremem.
  float coluna = floor(gl_FragCoord.x / uPasso);
  float local = fract(gl_FragCoord.x / uPasso);
  float deslocamento = ruido(coluna * 0.87 + uTempo * 0.85) * 0.5
    + ruido(coluna * 0.09 - uTempo * 0.1) * 0.5;

  // Perfil serrilhado dentro de cada fatia (a borda de vidro).
  float serra = pow(local, 2.6);

  // Faixas diagonais de luz que sobem para a direita, com ondulação.
  float y = uv.y + deslocamento * 0.28 + 0.07 * sin(uv.x * 3.2 + uTempo * 0.3) - 0.42 * uv.x;
  float faixa1 = exp(-pow((y - 0.42) * 5.5, 2.0));
  float faixa2 = exp(-pow((y - 0.66) * 6.5, 2.0)) * 0.55;
  float faixa3 = exp(-pow((y - 0.2) * 7.5, 2.0)) * 0.6;
  float campo = faixa1 + faixa2 + faixa3;

  float vidro = campo * (0.2 + 0.8 * serra);

  // Paleta: azul-marinho profundo, azul vivo e branco gelado nas faixas mais claras.
  // Paleta do site: #112D4E (fundo), #3F72AF (azul principal) e #DBE2EF (realces).
  vec3 fundo = vec3(1.000, 1.0, 1.0);
  vec3 azul = vec3(0.247, 0.447, 0.686);
  vec3 gelo = vec3(1.959, 1.986, 1.937);
  vec3 cor = mix(fundo, azul, clamp(vidro, 0.0, 1.0));
  cor = mix(cor, gelo, pow(clamp(vidro - 0.72, 0.0, 1.0), 1.4));

  // Onde não há vidro o pixel fica transparente, e a imagem de fundo aparece.
  float a = clamp(vidro * 1.1, 0.0, 1.0);
  gl_FragColor = vec4(cor * a, a);
}
`

function criarPrograma(gl) {
  function compilar(tipo, fonte) {
    const shader = gl.createShader(tipo)
    gl.shaderSource(shader, fonte)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
      throw new Error(gl.getShaderInfoLog(shader))
    return shader
  }
  const programa = gl.createProgram()
  gl.attachShader(programa, compilar(gl.VERTEX_SHADER, VERTEX))
  gl.attachShader(programa, compilar(gl.FRAGMENT_SHADER, FRAGMENT))
  gl.linkProgram(programa)
  if (!gl.getProgramParameter(programa, gl.LINK_STATUS))
    throw new Error(gl.getProgramInfoLog(programa))
  return programa
}

// Com `animado` falso, desenha um único quadro parado.
export default function FractalGlass({ animado = true }) {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    const gl = canvas.getContext('webgl', { antialias: false, alpha: true, premultipliedAlpha: true })
    if (!gl) return undefined

    let programa
    try {
      programa = criarPrograma(gl)
    } catch {
      return undefined
    }
    gl.useProgram(programa)

    // Triângulo que cobre a tela inteira.
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW
    )
    const aPos = gl.getAttribLocation(programa, 'aPos')
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    const uRes = gl.getUniformLocation(programa, 'uRes')
    const uTempo = gl.getUniformLocation(programa, 'uTempo')
    const uPasso = gl.getUniformLocation(programa, 'uPasso')

    // Renderiza com metade da resolução: o efeito é suave e o custo cai bastante.
    const escala = 0.5
    // Largura de uma fatia em pixels de tela (44px) convertida para a resolução do canvas.
    const passoCss = 35
    const passo = passoCss * escala
    let quadro = 0
    let ultimo = 0
    const inicio = performance.now()

    function ajustarTamanho() {
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * escala))
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * escala))
      gl.viewport(0, 0, canvas.width, canvas.height)
    }

    function desenhar(tempo) {
      gl.uniform2f(uRes, canvas.width, canvas.height)
      gl.uniform1f(uTempo, tempo)
      gl.uniform1f(uPasso, passo)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }

    function laco(agora) {
      if (agora - ultimo >= 1000 / 30) {
        ultimo = agora
        desenhar((agora - inicio) / 1000)
      }
      quadro = requestAnimationFrame(laco)
    }

    ajustarTamanho()
    desenhar(0)
    // Quem pediu menos movimento no sistema operacional recebe o fundo parado.
    const animar = animado && !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (animar) quadro = requestAnimationFrame(laco)

    // Aba em segundo plano: para de desenhar e retoma quando ela volta a aparecer.
    const aoMudarVisibilidade = () => {
      cancelAnimationFrame(quadro)
      if (animar && !document.hidden) quadro = requestAnimationFrame(laco)
    }
    document.addEventListener('visibilitychange', aoMudarVisibilidade)

    const aoRedimensionar = () => {
      ajustarTamanho()
      desenhar(animar ? (performance.now() - inicio) / 1000 : 0)
    }
    window.addEventListener('resize', aoRedimensionar)
    return () => {
      cancelAnimationFrame(quadro)
      window.removeEventListener('resize', aoRedimensionar)
      document.removeEventListener('visibilitychange', aoMudarVisibilidade)
      gl.deleteProgram(programa)
      gl.deleteBuffer(buffer)
    }
  }, [animado])

  return <canvas ref={ref} aria-hidden="true" className="fractal-canvas" />
}
