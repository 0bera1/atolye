import { useCallback, useRef, useState } from 'react'
import { CancelledError } from './errors'

export type JobStatus = 'idle' | 'running' | 'done' | 'error' | 'cancelled'

export interface JobContext {
  signal: AbortSignal
  setProgress: (value: number | null, label?: string) => void
}

// Runs one cancellable async job and exposes its progress and result.
export function useJob<R>() {
  const [status, setStatus] = useState<JobStatus>('idle')
  const [progress, setProgressState] = useState<number | null>(null)
  const [label, setLabel] = useState('')
  const [error, setError] = useState('')
  const [result, setResult] = useState<R | null>(null)
  const ctrl = useRef<AbortController | null>(null)

  const run = useCallback(async (fn: (ctx: JobContext) => Promise<R>) => {
    ctrl.current?.abort()
    const c = new AbortController()
    ctrl.current = c
    setStatus('running')
    setProgressState(0)
    setLabel('')
    setError('')
    setResult(null)
    try {
      const r = await fn({
        signal: c.signal,
        setProgress: (v, l) => {
          setProgressState(v)
          if (l !== undefined) setLabel(l)
        },
      })
      if (c.signal.aborted) throw new CancelledError()
      setResult(r)
      setStatus('done')
    } catch (e) {
      if (e instanceof CancelledError || c.signal.aborted) {
        setStatus('cancelled')
      } else {
        setError(e instanceof Error ? e.message : String(e))
        setStatus('error')
      }
    }
  }, [])

  const cancel = useCallback(() => ctrl.current?.abort(), [])
  const reset = useCallback(() => {
    ctrl.current?.abort()
    setStatus('idle')
    setResult(null)
    setError('')
  }, [])

  return { status, progress, label, error, result, run, cancel, reset }
}
