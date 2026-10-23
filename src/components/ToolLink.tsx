import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { ToolMeta } from '../tools/registry'

export function toolPath(tool: ToolMeta): string {
  return `/araclar/${tool.slug}`
}

// Tools flagged fullReload need their own document so their stricter/looser CSP applies.
export function ToolLink({
  tool,
  className,
  children,
}: {
  tool: ToolMeta
  className?: string
  children: ReactNode
}) {
  return (
    <Link to={toolPath(tool)} className={className} reloadDocument={tool.fullReload}>
      {children}
    </Link>
  )
}
