import type { ToolMeta } from '../tools/registry'
import { Icon } from './Icon'
import styles from './DrawerCard.module.css'

interface Props {
  tool: ToolMeta
  selected: boolean
  onSelect: (slug: string) => void
}

export function DrawerCard({ tool, selected, onSelect }: Props) {
  const soon = tool.status === 'soon'
  return (
    <button
      type="button"
      className={`${styles.card} ${selected ? styles.selected : ''}`}
      aria-pressed={selected}
      disabled={soon}
      onClick={() => onSelect(tool.slug)}
    >
      <span className={styles.handle} aria-hidden="true" />
      <span className={styles.icon}>
        <Icon name={tool.icon} />
      </span>
      <span className={styles.name}>{tool.name}</span>
      <span className={styles.short}>{tool.short}</span>
      {soon && <span className={`${styles.badge} mono`}>Yakında</span>}
    </button>
  )
}
