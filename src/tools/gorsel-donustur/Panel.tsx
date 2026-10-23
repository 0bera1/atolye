import { useState } from 'react'
import { JobControls } from '../../components/JobControls'
import { baseName, downloadBlob } from '../../lib/download'
import { throwIfAborted, yieldToUi } from '../../lib/errors'
import { formatBytes } from '../../lib/format'
import { loadBitmap, MIME_EXT, renderBlob, type ImageMime } from '../../lib/image'
import { useJob } from '../../lib/useJob'
import styles from '../panel.module.css'
import type { PanelProps } from '../types'

const FORMATS: { mime: ImageMime; label: string }[] = [
  { mime: 'image/png', label: 'PNG' },
  { mime: 'image/jpeg', label: 'JPG' },
  { mime: 'image/webp', label: 'WebP' },
]

interface Result {
  blob: Blob
  name: string
  done: number
  failed: string[]
}

export default function Panel({ files }: PanelProps) {
  const [mime, setMime] = useState<ImageMime>('image/webp')
  const [quality, setQuality] = useState(90)
  const job = useJob<Result>()

  function start() {
    void job.run(async ({ signal, setProgress }) => {
      const converted: { name: string; blob: Blob }[] = []
      const failed: string[] = []
      const used = new Set<string>()
      for (let i = 0; i < files.length; i++) {
        throwIfAborted(signal)
        setProgress(i / files.length, `${files[i].name} dönüştürülüyor…`)
        await yieldToUi()
        try {
          const bmp = await loadBitmap(files[i])
          try {
            const blob = await renderBlob(bmp, bmp.width, bmp.height, mime, quality / 100)
            let name = `${baseName(files[i].name)}.${MIME_EXT[mime]}`
            for (let n = 2; used.has(name); n++) {
              name = `${baseName(files[i].name)}-${n}.${MIME_EXT[mime]}`
            }
            used.add(name)
            converted.push({ name, blob })
          } finally {
            bmp.close()
          }
        } catch {
          failed.push(files[i].name)
        }
      }
      if (converted.length === 0) {
        throw new Error('Hiçbir görsel dönüştürülemedi. Desteklenen bir görsel biçimi seç.')
      }
      let blob: Blob
      let name: string
      if (converted.length === 1) {
        blob = converted[0].blob
        name = converted[0].name
      } else {
        const { default: JSZip } = await import('jszip')
        const zip = new JSZip()
        converted.forEach((c) => zip.file(c.name, c.blob))
        setProgress(1, 'Zip hazırlanıyor…')
        blob = await zip.generateAsync({ type: 'blob' })
        name = 'donusturulmus-gorseller.zip'
      }
      downloadBlob(blob, name)
      return { blob, name, done: converted.length, failed }
    })
  }

  return (
    <div className={styles.panel}>
      <fieldset className={styles.choices}>
        <legend className={styles.legend}>Hedef biçim</legend>
        {FORMATS.map((f) => (
          <label key={f.mime} className={styles.choice}>
            <input
              type="radio"
              name="donustur-bicim"
              checked={mime === f.mime}
              onChange={() => setMime(f.mime)}
            />
            <span>{f.label}</span>
          </label>
        ))}
      </fieldset>

      {mime !== 'image/png' && (
        <div className={styles.row}>
          <label htmlFor="donustur-kalite">Kalite: %{quality}</label>
          <input
            id="donustur-kalite"
            type="range"
            min={10}
            max={100}
            value={quality}
            onChange={(e) => setQuality(Number(e.target.value))}
          />
        </div>
      )}
      {mime === 'image/jpeg' && (
        <p className={styles.hint}>JPG saydamlığı desteklemez; saydam alanlar beyaz olur.</p>
      )}

      <JobControls
        {...job}
        startLabel="Dönüştür"
        disabled={files.length === 0}
        onStart={start}
        onCancel={job.cancel}
      >
        {job.result && (
          <div className={styles.result}>
            <span>
              {job.result.done} görsel dönüştürüldü, {formatBytes(job.result.blob.size)}.
            </span>
            {job.result.failed.length > 0 && (
              <span role="alert">Açılamayanlar: {job.result.failed.join(', ')}</span>
            )}
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
