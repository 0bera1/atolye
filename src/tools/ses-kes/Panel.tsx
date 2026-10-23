import { useCallback, useEffect, useRef, useState } from 'react'
import { baseName, downloadBlob } from '../../lib/download'
import { formatBytes } from '../../lib/format'
import { encodeWav } from '../../lib/wav'
import styles from '../panel.module.css'
import type { PanelProps } from '../types'
import wave from './wave.module.css'

function fmt(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec - m * 60
  return `${m}:${s.toFixed(2).padStart(5, '0')}`
}

export default function Panel({ files }: PanelProps) {
  const file = files[0]
  const [buffer, setBuffer] = useState<AudioBuffer | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [start, setStart] = useState(0)
  const [end, setEnd] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [done, setDone] = useState<{ size: number } | null>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const ctxRef = useRef<AudioContext | null>(null)
  const source = useRef<AudioBufferSourceNode | null>(null)
  const drag = useRef<'start' | 'end' | null>(null)

  const stop = useCallback(() => {
    try {
      source.current?.stop()
    } catch {
      // already stopped
    }
    source.current = null
    setPlaying(false)
  }, [])

  useEffect(() => {
    let alive = true
    void (async () => {
      stop()
      setDone(null)
      if (!file) {
        if (alive) setBuffer(null)
        return
      }
      if (alive) {
        setLoading(true)
        setError('')
      }
      try {
        const AC = window.AudioContext
        ctxRef.current ??= new AC()
        const buf = await ctxRef.current.decodeAudioData(await file.arrayBuffer())
        if (!alive) return
        setBuffer(buf)
        setStart(0)
        setEnd(buf.duration)
      } catch {
        if (alive) {
          setBuffer(null)
          setError('Bu ses dosyası çözülemedi. Desteklenmeyen ya da bozuk bir dosya olabilir.')
        }
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [file, stop])

  useEffect(() => () => stop(), [stop])

  // Draw waveform and selection.
  useEffect(() => {
    const c = canvas.current
    if (!c || !buffer) return
    const dpr = window.devicePixelRatio || 1
    const w = c.clientWidth
    const h = c.clientHeight
    c.width = w * dpr
    c.height = h * dpr
    const g = c.getContext('2d')!
    g.scale(dpr, dpr)
    const css = getComputedStyle(document.documentElement)
    const accent = css.getPropertyValue('--accent').trim()
    const line = css.getPropertyValue('--line').trim()
    const soft = css.getPropertyValue('--soft').trim()
    g.clearRect(0, 0, w, h)
    g.fillStyle = soft
    g.fillRect(0, 0, w, h)
    const data = buffer.getChannelData(0)
    const step = Math.max(1, Math.floor(data.length / w))
    g.fillStyle = line
    const x1 = (start / buffer.duration) * w
    const x2 = (end / buffer.duration) * w
    for (let x = 0; x < w; x++) {
      let min = 1
      let max = -1
      for (let i = 0; i < step; i++) {
        const v = data[x * step + i] ?? 0
        if (v < min) min = v
        if (v > max) max = v
      }
      g.fillStyle = x >= x1 && x <= x2 ? accent : line
      const y1 = ((1 - max) / 2) * h
      const y2 = ((1 - min) / 2) * h
      g.fillRect(x, y1, 1, Math.max(1, y2 - y1))
    }
    g.fillStyle = accent
    g.fillRect(x1 - 1, 0, 3, h)
    g.fillRect(x2 - 1, 0, 3, h)
  }, [buffer, start, end])

  function timeAt(clientX: number): number {
    const r = canvas.current!.getBoundingClientRect()
    const t = ((clientX - r.left) / r.width) * buffer!.duration
    return Math.min(buffer!.duration, Math.max(0, t))
  }

  function onPointerDown(e: React.PointerEvent) {
    if (!buffer) return
    const t = timeAt(e.clientX)
    drag.current = Math.abs(t - start) <= Math.abs(t - end) ? 'start' : 'end'
    ;(e.target as Element).setPointerCapture(e.pointerId)
    onPointerMove(e)
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!buffer || !drag.current) return
    const t = timeAt(e.clientX)
    if (drag.current === 'start') setStart(Math.min(t, end - 0.05))
    else setEnd(Math.max(t, start + 0.05))
    setDone(null)
  }

  function play() {
    if (!buffer || !ctxRef.current) return
    stop()
    const ctx = ctxRef.current
    void ctx.resume()
    const src = ctx.createBufferSource()
    src.buffer = buffer
    src.connect(ctx.destination)
    src.onended = () => {
      if (source.current === src) {
        source.current = null
        setPlaying(false)
      }
    }
    src.start(0, start, end - start)
    source.current = src
    setPlaying(true)
  }

  function save() {
    if (!buffer) return
    const from = Math.floor(start * buffer.sampleRate)
    const to = Math.max(from + 1, Math.floor(end * buffer.sampleRate))
    const channels = Array.from({ length: buffer.numberOfChannels }, (_, i) =>
      buffer.getChannelData(i).slice(from, to),
    )
    const blob = encodeWav(channels, buffer.sampleRate)
    downloadBlob(blob, `${baseName(file.name)}-kesilmis.wav`)
    setDone({ size: blob.size })
  }

  return (
    <div className={styles.panel}>
      {loading && <p role="status">Ses çözülüyor…</p>}
      {error && <p role="alert">{error}</p>}
      {buffer && (
        <>
          <canvas
            ref={canvas}
            className={wave.canvas}
            role="img"
            aria-label="Ses dalga formu. Başlangıç ve bitiş noktasını sürükleyerek seç."
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={() => (drag.current = null)}
            onPointerCancel={() => (drag.current = null)}
          />
          <div className={styles.row}>
            <label htmlFor="ses-bas">Başlangıç: {fmt(start)}</label>
            <input
              id="ses-bas"
              type="range"
              min={0}
              max={buffer.duration}
              step={0.01}
              value={start}
              onChange={(e) => {
                setStart(Math.min(Number(e.target.value), end - 0.05))
                setDone(null)
              }}
            />
          </div>
          <div className={styles.row}>
            <label htmlFor="ses-bit">Bitiş: {fmt(end)}</label>
            <input
              id="ses-bit"
              type="range"
              min={0}
              max={buffer.duration}
              step={0.01}
              value={end}
              onChange={(e) => {
                setEnd(Math.max(Number(e.target.value), start + 0.05))
                setDone(null)
              }}
            />
          </div>
          <p className={`${styles.hint} mono`}>
            Seçili süre: {fmt(end - start)} / {fmt(buffer.duration)}
          </p>
          <div className={styles.inline}>
            <button
              type="button"
              className="btn"
              onClick={playing ? stop : play}
              aria-pressed={playing}
            >
              {playing ? 'Durdur' : 'Önizle'}
            </button>
            <button type="button" className="btn btn-primary" onClick={save}>
              WAV indir
            </button>
          </div>
          <div aria-live="polite" className={styles.hint}>
            {done && `Hazır: ${formatBytes(done.size)}.`}
          </div>
        </>
      )}
      {!buffer && !loading && !error && (
        <p className={styles.hint}>Başlamak için bir ses dosyası seç.</p>
      )}
    </div>
  )
}
