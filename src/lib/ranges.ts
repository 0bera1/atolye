export type RangeResult = { ok: true; pages: number[] } | { ok: false; error: string }

// Parses "1-3, 5, 8-10" into 0-based page indexes, keeping the written order.
export function parseRanges(input: string, pageCount: number): RangeResult {
  const text = input.trim()
  if (!text) return { ok: false, error: 'Sayfa aralığını yaz. Örnek: 1-3, 5, 8-10' }
  const pages: number[] = []
  for (const part of text.split(',')) {
    const p = part.trim()
    const m = /^(\d+)(?:\s*-\s*(\d+))?$/.exec(p)
    if (!m) return { ok: false, error: `“${p}” anlaşılamadı. Örnek: 1-3, 5, 8-10` }
    const from = Number(m[1])
    const to = m[2] ? Number(m[2]) : from
    if (from < 1 || to < 1 || from > pageCount || to > pageCount) {
      return { ok: false, error: `Sayfa numaraları 1 ile ${pageCount} arasında olmalı.` }
    }
    if (to < from) return { ok: false, error: `“${p}” aralığı ters yazılmış.` }
    for (let i = from; i <= to; i++) pages.push(i - 1)
  }
  return { ok: true, pages }
}
