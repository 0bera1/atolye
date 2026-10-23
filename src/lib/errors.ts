export class CancelledError extends Error {
  constructor() {
    super('cancelled')
    this.name = 'CancelledError'
  }
}

export function throwIfAborted(signal: AbortSignal) {
  if (signal.aborted) throw new CancelledError()
}

// Lets the browser paint progress and handle input between heavy steps.
export function yieldToUi(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

export function describeError(err: unknown, fileName?: string): string {
  const name = fileName ? `“${fileName}”: ` : ''
  const text = err instanceof Error ? `${err.name} ${err.message}` : String(err)
  if (/encrypt|password/i.test(text)) {
    return `${name}Bu PDF parolalı. Önce parolasını kaldırıp yeniden kaydetmen gerekir.`
  }
  if (/invalid pdf|failed to parse|no pdf header|invalidpdf|bad xref/i.test(text)) {
    return `${name}Bu dosya bozuk görünüyor ya da geçerli bir PDF değil.`
  }
  if (/memory|allocation|out of/i.test(text)) {
    return `${name}Bellek yetmedi. Daha küçük bir dosyayla dene.`
  }
  return `${name}Dosya işlenemedi. Desteklenen bir biçim olduğundan emin ol.`
}
