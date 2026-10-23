import { JobControls } from '../../components/JobControls'
import { downloadBlob } from '../../lib/download'
import { describeError, throwIfAborted, yieldToUi } from '../../lib/errors'
import { formatBytes } from '../../lib/format'
import { useJob } from '../../lib/useJob'
import styles from '../panel.module.css'
import type { PanelProps } from '../types'

interface Result {
  blob: Blob
  pages: number
}

export default function Panel({ files }: PanelProps) {
  const job = useJob<Result>()

  function start() {
    void job.run(async ({ signal, setProgress }) => {
      const { PDFDocument } = await import('pdf-lib')
      const out = await PDFDocument.create()
      let pages = 0
      for (let i = 0; i < files.length; i++) {
        throwIfAborted(signal)
        setProgress(i / files.length, `${files[i].name} ekleniyor…`)
        await yieldToUi()
        try {
          const src = await PDFDocument.load(await files[i].arrayBuffer())
          const copied = await out.copyPages(src, src.getPageIndices())
          copied.forEach((p) => out.addPage(p))
          pages += copied.length
        } catch (e) {
          throw new Error(describeError(e, files[i].name), { cause: e })
        }
      }
      throwIfAborted(signal)
      setProgress(1, 'Kaydediliyor…')
      const bytes = await out.save()
      const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' })
      downloadBlob(blob, 'birlestirilmis.pdf')
      return { blob, pages }
    })
  }

  return (
    <div className={styles.panel}>
      {files.length === 1 && <p className={styles.hint}>Birleştirmek için en az iki PDF seç.</p>}
      <JobControls
        {...job}
        startLabel="PDF’leri birleştir"
        disabled={files.length < 2}
        onStart={start}
        onCancel={job.cancel}
      >
        {job.result && (
          <div className={styles.result}>
            <span>
              Hazır: {job.result.pages} sayfa, {formatBytes(job.result.blob.size)}.
            </span>
            <button
              type="button"
              className="btn"
              onClick={() => downloadBlob(job.result!.blob, 'birlestirilmis.pdf')}
            >
              Yeniden indir
            </button>
          </div>
        )}
      </JobControls>
    </div>
  )
}
