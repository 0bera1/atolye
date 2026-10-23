import { useId, useState, type DragEvent } from 'react'
import { formatBytes, LARGE_FILE_BYTES } from '../lib/format'
import type { ToolMeta } from '../tools/registry'
import { Icon } from './Icon'
import styles from './Workbench.module.css'

export function Workbench({ tool }: { tool: ToolMeta }) {
  const [files, setFiles] = useState<File[]>([])
  const [over, setOver] = useState(false)
  const inputId = useId()

  function add(list: FileList | null) {
    if (!list) return
    const incoming = Array.from(list)
    setFiles((prev) => (tool.multiple ? [...prev, ...incoming] : incoming.slice(0, 1)))
  }

  function onDrop(e: DragEvent) {
    e.preventDefault()
    setOver(false)
    add(e.dataTransfer.files)
  }

  const large = files.some((f) => f.size > LARGE_FILE_BYTES)

  return (
    <section className={styles.bench} aria-labelledby={`${inputId}-t`}>
      <p className={`${styles.label} mono`}>Tezgâh</p>
      <h2 id={`${inputId}-t`} className={styles.title}>
        {tool.name}
      </h2>

      <label
        htmlFor={inputId}
        className={`${styles.drop} ${over ? styles.over : ''}`}
        onDragOver={(e) => {
          e.preventDefault()
          setOver(true)
        }}
        onDragLeave={() => setOver(false)}
        onDrop={onDrop}
      >
        <input
          id={inputId}
          type="file"
          className="sr-only"
          accept={tool.accept}
          multiple={tool.multiple}
          onChange={(e) => {
            add(e.target.files)
            e.target.value = ''
          }}
        />
        <Icon name="upload" size={28} />
        <span className={styles.dropMain}>Dosya seç ya da buraya bırak</span>
        <span className={styles.dropSub}>
          {tool.multiple ? 'Birden çok dosya seçebilirsin.' : 'Tek dosya.'}
        </span>
      </label>

      {files.length > 0 && (
        <ul className={styles.list} aria-label="Seçilen dosyalar">
          {files.map((f, i) => (
            <li key={`${f.name}-${i}`} className={styles.item}>
              <Icon name="file" size={18} />
              <span className={styles.fname}>{f.name}</span>
              <span className={`${styles.size} mono`}>{formatBytes(f.size)}</span>
              <button
                type="button"
                className={styles.remove}
                aria-label={`${f.name} dosyasını kaldır`}
                onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}
              >
                <Icon name="close" size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {large && (
        <p className={styles.warn} role="status">
          Bu dosya büyük. İşlem cihazının belleğini zorlayabilir; tarayıcı yavaşlarsa daha küçük bir
          dosyayla dene.
        </p>
      )}

      <button type="button" className="btn btn-primary" disabled style={{ width: '100%' }}>
        İşlemi başlat
      </button>
      <div aria-live="polite" className={styles.live}>
        Bu araç henüz hazır değil.
      </div>

      <p className={styles.note}>
        <Icon name="lock" size={16} />
        Dosya tarayıcından çıkmaz.
      </p>
    </section>
  )
}
