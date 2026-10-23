import { useEffect } from 'react'
import { JobControls } from '../../components/JobControls'
import { baseName, downloadBlob } from '../../lib/download'
import { formatBytes } from '../../lib/format'
import { useJob } from '../../lib/useJob'
import styles from '../panel.module.css'
import type { PanelProps } from '../types'

interface Result {
  blob: Blob
  name: string
  url: string
}

export default function Panel({ files }: PanelProps) {
  const file = files[0]
  const job = useJob<Result>()

  useEffect(() => {
    const url = job.result?.url
    return () => {
      if (url) URL.revokeObjectURL(url)
    }
  }, [job.result?.url])

  function start() {
    void job.run(async ({ signal, setProgress }) => {
      setProgress(null, 'Model hazırlanıyor…')
      const { removeBackground } = await import('@imgly/background-removal')
      // Model and runtime files are served from this origin (public/models).
      const publicPath = new URL(`${import.meta.env.BASE_URL}models/`, location.origin).href
      const blob = await removeBackground(file, {
        publicPath,
        model: 'small',
        output: { format: 'image/png' },
        progress: (key, current, total) => {
          if (total > 0) {
            const loading = key.startsWith('fetch')
            setProgress(current / total, loading ? 'Model yükleniyor…' : 'Arka plan siliniyor…')
          }
        },
      })
      // The library cannot be interrupted midway; a cancelled run is discarded here.
      if (signal.aborted) throw new Error('cancelled')
      const name = `${baseName(file.name)}-seffaf.png`
      downloadBlob(blob, name)
      return { blob, name, url: URL.createObjectURL(blob) }
    })
  }

  return (
    <div className={styles.panel}>
      <p className={styles.hint}>
        Bu araç yapay zekâ modeli kullanır; model yaklaşık 45 MB’tır ve yalnızca bu araç açılınca
        yüklenir. İlk kullanımdan sonra önbellekten gelir. Büyük görsellerde işlem birkaç saniye
        sürebilir.
      </p>
      <JobControls
        {...job}
        startLabel="Arka planı sil"
        disabled={!file}
        onStart={start}
        onCancel={job.cancel}
      >
        {job.result && (
          <div className={styles.result}>
            <img className={styles.preview} src={job.result.url} alt="Arka planı silinmiş görsel" />
            <span>Şeffaf PNG hazır, {formatBytes(job.result.blob.size)}.</span>
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
