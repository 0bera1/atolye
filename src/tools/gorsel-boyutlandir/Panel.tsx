import { useEffect, useState } from 'react'
import { JobControls } from '../../components/JobControls'
import { baseName, downloadBlob } from '../../lib/download'
import { formatBytes } from '../../lib/format'
import {
  fitHeight,
  fitWidth,
  loadBitmap,
  MIME_EXT,
  renderBlob,
  type ImageMime,
} from '../../lib/image'
import { useJob } from '../../lib/useJob'
import styles from '../panel.module.css'
import type { PanelProps } from '../types'

type Preset = 'ozel' | 'profil' | 'kapak'

const PRESETS: Record<Exclude<Preset, 'ozel'>, { label: string; w: number; h: number }> = {
  profil: { label: 'Profil 400×400', w: 400, h: 400 },
  kapak: { label: 'Kapak 1500×500', w: 1500, h: 500 },
}

interface Result {
  blob: Blob
  name: string
  url: string
  w: number
  h: number
  before: number
}

function pickMime(file: File): ImageMime {
  return file.type === 'image/jpeg' || file.type === 'image/webp' ? file.type : 'image/png'
}

export default function Panel({ files }: PanelProps) {
  const file = files[0]
  const [src, setSrc] = useState<{ w: number; h: number } | null>(null)
  const [w, setW] = useState(0)
  const [h, setH] = useState(0)
  const [lock, setLock] = useState(true)
  const [preset, setPreset] = useState<Preset>('ozel')
  const [quality, setQuality] = useState(85)
  const [loadError, setLoadError] = useState('')
  const job = useJob<Result>()

  useEffect(() => {
    let alive = true
    void (async () => {
      if (!file) {
        if (alive) setSrc(null)
        return
      }
      try {
        const bmp = await loadBitmap(file)
        if (!alive) return
        setSrc({ w: bmp.width, h: bmp.height })
        setW(bmp.width)
        setH(bmp.height)
        setPreset('ozel')
        setLoadError('')
        bmp.close()
      } catch {
        if (alive) {
          setSrc(null)
          setLoadError('Bu görsel açılamadı. Desteklenmeyen ya da bozuk bir dosya olabilir.')
        }
      }
    })()
    return () => {
      alive = false
    }
  }, [file])

  useEffect(() => {
    const url = job.result?.url
    return () => {
      if (url) URL.revokeObjectURL(url)
    }
  }, [job.result?.url])

  function changeW(v: number) {
    setPreset('ozel')
    setW(v)
    if (lock && src && v > 0) setH(fitHeight(src.w, src.h, v))
  }
  function changeH(v: number) {
    setPreset('ozel')
    setH(v)
    if (lock && src && v > 0) setW(fitWidth(src.w, src.h, v))
  }
  function choosePreset(p: Preset) {
    setPreset(p)
    if (p === 'ozel') return
    setW(PRESETS[p].w)
    setH(PRESETS[p].h)
  }

  function start() {
    if (!file || !src) return
    void job.run(async () => {
      const mime = pickMime(file)
      const bmp = await loadBitmap(file)
      try {
        const blob = await renderBlob(bmp, w, h, mime, quality / 100, preset !== 'ozel')
        const name = `${baseName(file.name)}-${w}x${h}.${MIME_EXT[mime]}`
        downloadBlob(blob, name)
        return { blob, name, url: URL.createObjectURL(blob), w, h, before: file.size }
      } finally {
        bmp.close()
      }
    })
  }

  const valid = !!src && w > 0 && h > 0 && w <= 16000 && h <= 16000
  const lossy = file && pickMime(file) !== 'image/png'

  return (
    <div className={styles.panel}>
      {loadError && <p role="alert">{loadError}</p>}
      {src && (
        <p className={`${styles.hint} mono`}>
          Orijinal: {src.w} × {src.h}
        </p>
      )}

      <fieldset className={styles.choices}>
        <legend className={styles.legend}>Hazır ölçüler</legend>
        <label className={styles.choice}>
          <input
            type="radio"
            name="boyut-hazir"
            checked={preset === 'ozel'}
            onChange={() => choosePreset('ozel')}
          />
          <span>Özel</span>
        </label>
        {(Object.keys(PRESETS) as Exclude<Preset, 'ozel'>[]).map((k) => (
          <label key={k} className={styles.choice}>
            <input
              type="radio"
              name="boyut-hazir"
              checked={preset === k}
              onChange={() => choosePreset(k)}
            />
            <span>{PRESETS[k].label}</span>
          </label>
        ))}
      </fieldset>
      {preset !== 'ozel' && <p className={styles.hint}>Görsel bu ölçüye ortalanarak kırpılır.</p>}

      <div className={styles.inline}>
        <div className={styles.row}>
          <label htmlFor="boyut-w">Genişlik (px)</label>
          <input
            id="boyut-w"
            className="field"
            type="number"
            min={1}
            max={16000}
            value={w || ''}
            onChange={(e) => changeW(Number(e.target.value))}
          />
        </div>
        <div className={styles.row}>
          <label htmlFor="boyut-h">Yükseklik (px)</label>
          <input
            id="boyut-h"
            className="field"
            type="number"
            min={1}
            max={16000}
            value={h || ''}
            onChange={(e) => changeH(Number(e.target.value))}
          />
        </div>
      </div>

      <label className={styles.inline} style={{ minHeight: 'var(--tap)' }}>
        <input
          type="checkbox"
          checked={lock}
          onChange={(e) => setLock(e.target.checked)}
          style={{ flex: '0 0 22px', width: 22, height: 22 }}
        />
        <span>Oranı kilitle</span>
      </label>

      {lossy && (
        <div className={styles.row}>
          <label htmlFor="boyut-kalite">Kalite: %{quality}</label>
          <input
            id="boyut-kalite"
            type="range"
            min={10}
            max={100}
            value={quality}
            onChange={(e) => setQuality(Number(e.target.value))}
          />
        </div>
      )}

      <JobControls
        {...job}
        startLabel="Boyutlandır"
        disabled={!valid}
        onStart={start}
        onCancel={job.cancel}
      >
        {job.result && (
          <div className={styles.result}>
            <img
              className={styles.preview}
              src={job.result.url}
              alt="Boyutlandırılmış görsel önizlemesi"
            />
            <div className={`${styles.stats} mono`}>
              <span>
                {job.result.w} × {job.result.h}
              </span>
              <span>{formatBytes(job.result.before)}</span>
              <span>→ {formatBytes(job.result.blob.size)}</span>
            </div>
            <button
              type="button"
              className="btn"
              onClick={() => downloadBlob(job.result!.blob, job.result!.name)}
            >
              Yeniden indir
            </button>
          </div>
        )}
      </JobControls>
    </div>
  )
}
