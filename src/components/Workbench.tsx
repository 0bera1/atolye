import { Suspense, useId, useState, type DragEvent } from 'react'
import { formatBytes, LARGE_FILE_BYTES } from '../lib/format'
import { PANELS } from '../tools/panels'
import type { ToolMeta } from '../tools/registry'
import { Icon } from './Icon'
import styles from './Workbench.module.css'

export function Workbench({ tool }: { tool: ToolMeta }) {
  const [files, setFiles] = useState<File[]>([])
  const [over, setOver] = useState(false)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const inputId = useId()
  const Panel = PANELS[tool.slug]

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

  function move(from: number, to: number) {
    if (to < 0 || to >= files.length || from === to) return
    setFiles((prev) => {
      const next = [...prev]
      const [item] = next.splice(from, 1)
      next.splice(to, 0, item)
      return next
    })
  }

  const large = files.some((f) => f.size > LARGE_FILE_BYTES)
  const sortable = tool.multiple && files.length > 1

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
            <li
              key={`${f.name}-${f.size}-${i}`}
              className={`${styles.item} ${dragIndex === i ? styles.dragging : ''}`}
              draggable={sortable}
              onDragStart={() => setDragIndex(i)}
              onDragEnd={() => setDragIndex(null)}
              onDragOver={(e) => {
                if (dragIndex !== null) e.preventDefault()
              }}
              onDrop={(e) => {
                if (dragIndex === null) return
                e.preventDefault()
                e.stopPropagation()
                move(dragIndex, i)
                setDragIndex(null)
              }}
            >
              <Icon name="file" size={18} />
              <span className={styles.fname}>{f.name}</span>
              <span className={`${styles.size} mono`}>{formatBytes(f.size)}</span>
              {sortable && (
                <>
                  <button
                    type="button"
                    className={styles.iconBtn}
                    aria-label={`${f.name} dosyasını yukarı taşı`}
                    disabled={i === 0}
                    onClick={() => move(i, i - 1)}
                  >
                    <Icon name="up" size={16} />
                  </button>
                  <button
                    type="button"
                    className={styles.iconBtn}
                    aria-label={`${f.name} dosyasını aşağı taşı`}
                    disabled={i === files.length - 1}
                    onClick={() => move(i, i + 1)}
                  >
                    <Icon name="down" size={16} />
                  </button>
                </>
              )}
              <button
                type="button"
                className={styles.iconBtn}
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

      {Panel ? (
        <Suspense fallback={<p className={styles.live}>Araç yükleniyor…</p>}>
          <Panel files={files} />
        </Suspense>
      ) : (
        <p className={styles.live}>Bu araç henüz hazır değil.</p>
      )}

      <p className={styles.note}>
        <Icon name="lock" size={16} />
        Dosya tarayıcından çıkmaz.
      </p>
    </section>
  )
}
