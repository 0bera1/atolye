import { useState } from 'react'
import { JobControls } from '../../components/JobControls'
import { baseName, downloadBlob } from '../../lib/download'
import { describeError, throwIfAborted, yieldToUi } from '../../lib/errors'
import { formatBytes } from '../../lib/format'
import { useJob } from '../../lib/useJob'
import styles from '../panel.module.css'
import type { PanelProps } from '../types'

type Level = 'hafif' | 'dengeli' | 'guclu'

// scale: render resolution relative to 72 dpi page size; quality: JPEG quality.
const LEVELS: Record<Level, { label: string; scale: number; quality: number }> = {
  hafif: { label: 'Hafif', scale: 2, quality: 0.85 },
  dengeli: { label: 'Dengeli', scale: 1.5, quality: 0.7 },
  guclu: { label: 'Güçlü', scale: 1, quality: 0.5 },
}

interface Result {
  before: number
  after: number
  kept: boolean
  blob: Blob
  name: string
}

export default function Panel({ files }: PanelProps) {
  const [level, setLevel] = useState<Level>('dengeli')
  const job = useJob<Result>()
  const file = files[0]

  function start() {
    void job.run(async ({ signal, setProgress }) => {
      const [pdfjs, { default: workerUrl }, { PDFDocument }] = await Promise.all([
        import('pdfjs-dist'),
        import('pdfjs-dist/build/pdf.worker.min.mjs?url'),
        import('pdf-lib'),
      ])
      pdfjs.GlobalWorkerOptions.workerSrc = workerUrl
      const { scale, quality } = LEVELS[level]
      const data = new Uint8Array(await file.arrayBuffer())
      let doc
      try {
        doc = await pdfjs.getDocument({ data: data.slice() }).promise
      } catch (e) {
        throw new Error(describeError(e, file.name), { cause: e })
      }
      const out = await PDFDocument.create()
      const canvas = document.createElement('canvas')
      try {
        for (let i = 1; i <= doc.numPages; i++) {
          throwIfAborted(signal)
          setProgress((i - 1) / doc.numPages, `Sayfa ${i} / ${doc.numPages}`)
          await yieldToUi()
          const page = await doc.getPage(i)
          const base = page.getViewport({ scale: 1 })
          const vp = page.getViewport({ scale })
          canvas.width = Math.ceil(vp.width)
          canvas.height = Math.ceil(vp.height)
          const ctx = canvas.getContext('2d')!
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
          await page.render({ canvasContext: ctx, canvas, viewport: vp }).promise
          const blob: Blob = await new Promise((res, rej) =>
            canvas.toBlob(
              (b) => (b ? res(b) : rej(new Error('encode failed'))),
              'image/jpeg',
              quality,
            ),
          )
          const img = await out.embedJpg(new Uint8Array(await blob.arrayBuffer()))
          const p = out.addPage([base.width, base.height])
          p.drawImage(img, { x: 0, y: 0, width: base.width, height: base.height })
          page.cleanup()
        }
      } finally {
        void doc.loadingTask.destroy()
      }
      throwIfAborted(signal)
      setProgress(1, 'Kaydediliyor…')
      const compressed = new Blob([(await out.save()) as BlobPart], { type: 'application/pdf' })
      const kept = compressed.size >= file.size
      const blob = kept ? file : compressed
      const name = `${baseName(file.name)}-sikistirilmis.pdf`
      if (!kept) downloadBlob(blob, name)
      return { before: file.size, after: compressed.size, kept, blob, name }
    })
  }

  return (
    <div className={styles.panel}>
      <fieldset className={styles.choices}>
        <legend className={styles.legend}>Sıkıştırma düzeyi</legend>
        {(Object.keys(LEVELS) as Level[]).map((k) => (
          <label key={k} className={styles.choice}>
            <input
              type="radio"
              name="sikistir-duzey"
              checked={level === k}
              onChange={() => setLevel(k)}
            />
            <span>{LEVELS[k].label}</span>
          </label>
        ))}
      </fieldset>
      <p className={styles.hint}>
        Sayfalar görsele çevrilerek yeniden paketlenir; metin seçilebilirliği kaybolur.
      </p>

      <JobControls
        {...job}
        startLabel="PDF’i sıkıştır"
        disabled={!file}
        onStart={start}
        onCancel={job.cancel}
      >
        {job.result && (
          <div className={styles.result}>
            <div className={`${styles.stats} mono`}>
              <span>Önce: {formatBytes(job.result.before)}</span>
              <span>Sonra: {formatBytes(job.result.after)}</span>
            </div>
            {job.result.kept ? (
              <span>
                Sıkıştırılmış dosya orijinalden büyük çıktı, bu yüzden orijinal korundu. Daha güçlü
                bir düzey deneyebilirsin.
              </span>
            ) : (
              <span>%{Math.round((1 - job.result.after / job.result.before) * 100)} küçüldü.</span>
            )}
            {!job.result.kept && (
              <button
                type="button"
                className="btn"
                onClick={() => downloadBlob(job.result!.blob, job.result!.name)}
              >
                Yeniden indir
              </button>
            )}
          </div>
        )}
      </JobControls>
    </div>
  )
}
