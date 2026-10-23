import type { ReactNode } from 'react'
import type { JobStatus } from '../lib/useJob'
import styles from './JobControls.module.css'

interface Props {
  status: JobStatus
  progress: number | null
  label: string
  error: string
  startLabel: string
  disabled?: boolean
  onStart: () => void
  onCancel: () => void
  children?: ReactNode
}

export function JobControls({
  status,
  progress,
  label,
  error,
  startLabel,
  disabled,
  onStart,
  onCancel,
  children,
}: Props) {
  const running = status === 'running'
  const pct = progress == null ? null : Math.round(progress * 100)
  return (
    <div className={styles.wrap}>
      {running ? (
        <button type="button" className="btn" style={{ width: '100%' }} onClick={onCancel}>
          İptal et
        </button>
      ) : (
        <button
          type="button"
          className="btn btn-primary"
          style={{ width: '100%' }}
          disabled={disabled}
          onClick={onStart}
        >
          {startLabel}
        </button>
      )}

      {running && (
        <div className={styles.progress}>
          <div
            className={styles.track}
            role="progressbar"
            aria-label="İlerleme"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={pct ?? undefined}
          >
            <div
              className={`${styles.bar} ${pct == null ? styles.indeterminate : ''}`}
              style={pct == null ? undefined : { width: `${pct}%` }}
            />
          </div>
          <span className="mono">{pct == null ? '' : `%${pct}`}</span>
        </div>
      )}

      <div aria-live="polite" className={styles.live}>
        {running && label}
        {status === 'cancelled' && 'İşlem iptal edildi.'}
        {status === 'error' && <span className={styles.error}>{error}</span>}
        {status === 'done' && children}
      </div>
    </div>
  )
}
