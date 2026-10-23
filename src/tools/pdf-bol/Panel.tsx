import { useState } from 'react'
import { JobControls } from '../../components/JobControls'
import { baseName, downloadBlob } from '../../lib/download'
import { describeError, throwIfAborted, yieldToUi } from '../../lib/errors'
import { formatBytes } from '../../lib/format'
import { parseRanges } from '../../lib/ranges'
import { useJob } from '../../lib/useJob'
import styles from '../panel.module.css'
import type { PanelProps } from '../types'

interface Result {
  blob: Blob
  name: string
  count: number
}

export default function Panel({ files }: PanelProps) {
  const [mode, setMode] = useState<'each' | 'range'>('each')
  const [range, setRange] = useState('')
  const [rangeError, setRangeError] = useState('')
  const job = useJob<Result>()
  const file = files[0]

  function start() {
    setRangeError('')
    void job.run(async ({ signal, setProgress }) => {
      const { PDFDocument } = await import('pdf-lib')
      let src
      try {
        src = await PDFDocument.load(await file.arrayBuffer())
      } catch (e) {
        throw new Error(describeError(e, file.name), { cause: e })
      }
      const total = src.getPageCount()
      const stem = baseName(file.name)

      if (mode === 'range') {
        const parsed = parseRanges(range, total)
        if (!parsed.ok) {
          setRangeError(parsed.error)
          throw new Error(parsed.error)
        }
        const out = await PDFDocument.create()
        const copied = await out.copyPages(src, parsed.pages)
        copied.forEach((p) => out.addPage(p))
        const blob = new Blob([(await out.save()) as BlobPart], { type: 'application/pdf' })
        const name = `${stem}-secilen.pdf`
        downloadBlob(blob, name)
        return { blob, name, count: parsed.pages.length }
      }

      const { default: JSZip } = await import('jszip')
      const zip = new JSZip()
      const pad = String(total).length
      for (let i = 0; i < total; i++) {
        throwIfAborted(signal)
        setProgress(i / total, `Sayfa ${i + 1} / ${total}`)
        await yieldToUi()
        const out = await PDFDocument.create()
        const [page] = await out.copyPages(src, [i])
        out.addPage(page)
        zip.file(`${stem}-${String(i + 1).padStart(pad, '0')}.pdf`, await out.save())
      }
      setProgress(1, 'Zip hazırlanıyor…')
      const blob = await zip.generateAsync({ type: 'blob' })
      const name = `${stem}-sayfalar.zip`
      downloadBlob(blob, name)
      return { blob, name, count: total }
    })
  }

  return (
    <div className={styles.panel}>
      <fieldset className={styles.choices}>
        <legend className="sr-only">Bölme yöntemi</legend>
        <label className={styles.choice}>
          <input
            type="radio"
            name="bol-mod"
            checked={mode === 'each'}
            onChange={() => setMode('each')}
          />
          <span>Her sayfa ayrı (zip)</span>
        </label>
        <label className={styles.choice}>
          <input
            type="radio"
            name="bol-mod"
            checked={mode === 'range'}
            onChange={() => setMode('range')}
          />
          <span>Sayfa aralığı</span>
        </label>
      </fieldset>

      {mode === 'range' && (
        <div className={styles.row}>
          <label htmlFor="bol-aralik">Sayfa aralığı</label>
          <input
            id="bol-aralik"
            className="field"
            placeholder="1-3, 5, 8-10"
            value={range}
            onChange={(e) => setRange(e.target.value)}
            aria-invalid={rangeError ? true : undefined}
            aria-describedby="bol-aralik-ipucu"
          />
          <span id="bol-aralik-ipucu" className={styles.hint}>
            Virgülle ayır. Tek sayfa ya da aralık yazabilirsin.
          </span>
        </div>
      )}

      <JobControls
        {...job}
        startLabel={mode === 'each' ? 'Sayfaları ayır' : 'Aralığı çıkar'}
        disabled={!file}
        onStart={start}
        onCancel={job.cancel}
      >
        {job.result && (
          <div className={styles.result}>
            <span>
              Hazır: {job.result.count} sayfa, {formatBytes(job.result.blob.size)}.
            </span>
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
