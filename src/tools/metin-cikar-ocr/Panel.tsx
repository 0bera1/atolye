import { useState } from 'react'
import { JobControls } from '../../components/JobControls'
import { baseName, downloadBlob } from '../../lib/download'
import { CancelledError } from '../../lib/errors'
import { useJob } from '../../lib/useJob'
import styles from '../panel.module.css'
import type { PanelProps } from '../types'

type Lang = 'tur' | 'eng' | 'tur+eng'

const LANGS: { id: Lang; label: string }[] = [
  { id: 'tur', label: 'Türkçe' },
  { id: 'eng', label: 'İngilizce' },
  { id: 'tur+eng', label: 'Türkçe + İngilizce' },
]

export default function Panel({ files }: PanelProps) {
  const file = files[0]
  const [lang, setLang] = useState<Lang>('tur')
  const [copied, setCopied] = useState(false)
  const job = useJob<string>()

  function start() {
    setCopied(false)
    void job.run(async ({ signal, setProgress }) => {
      setProgress(null, 'OCR motoru hazırlanıyor…')
      const { createWorker } = await import('tesseract.js')
      // Engine and language data are served from this origin (public/tesseract).
      const base = new URL(`${import.meta.env.BASE_URL}tesseract/`, location.origin).href
      const worker = await createWorker(lang.split('+'), 1, {
        workerPath: `${base}worker.min.js`,
        corePath: base,
        langPath: `${base}langs`,
        workerBlobURL: false,
        logger: (m: { status: string; progress: number }) => {
          if (m.status === 'recognizing text') setProgress(m.progress, 'Metin okunuyor…')
          else if (m.status.includes('loading')) setProgress(null, 'Dil verisi yükleniyor…')
        },
      })
      const onAbort = () => void worker.terminate()
      signal.addEventListener('abort', onAbort)
      try {
        const { data } = await worker.recognize(file)
        if (signal.aborted) throw new CancelledError()
        return data.text.trim()
      } finally {
        signal.removeEventListener('abort', onAbort)
        await worker.terminate()
      }
    })
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(job.result ?? '')
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className={styles.panel}>
      <fieldset className={styles.choices}>
        <legend className={styles.legend}>Dil</legend>
        {LANGS.map((l) => (
          <label key={l.id} className={styles.choice}>
            <input
              type="radio"
              name="ocr-dil"
              checked={lang === l.id}
              onChange={() => setLang(l.id)}
            />
            <span>{l.label}</span>
          </label>
        ))}
      </fieldset>
      <p className={styles.hint}>
        Dil verisi ilk kullanımda bu sitenin kendi sunucusundan indirilir ve önbelleğe alınır. Bu
        indirme görselini içermez.
      </p>
      <JobControls
        {...job}
        startLabel="Metni çıkar"
        disabled={!file}
        onStart={start}
        onCancel={job.cancel}
      >
        {job.result !== null && (
          <div className={styles.result}>
            {job.result === '' ? (
              <span>Görselde okunabilir metin bulunamadı.</span>
            ) : (
              <>
                <label htmlFor="ocr-sonuc" className="sr-only">
                  Çıkarılan metin
                </label>
                <textarea
                  id="ocr-sonuc"
                  className={`field ${styles.text}`}
                  readOnly
                  value={job.result}
                />
                <div className={styles.inline}>
                  <button type="button" className="btn" onClick={() => void copy()}>
                    {copied ? 'Kopyalandı' : 'Kopyala'}
                  </button>
                  <button
                    type="button"
                    className="btn"
                    onClick={() =>
                      downloadBlob(
                        new Blob([job.result ?? ''], { type: 'text/plain;charset=utf-8' }),
                        `${baseName(file.name)}.txt`,
                      )
                    }
                  >
                    .txt indir
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </JobControls>
    </div>
  )
}
