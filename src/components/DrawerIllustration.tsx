import styles from './DrawerIllustration.module.css'

// Decorative cabinet: three drawers, the middle one pulled open with sheets inside.
export function DrawerIllustration() {
  return (
    <svg className={styles.svg} viewBox="0 0 340 300" aria-hidden="true" focusable="false">
      <rect className={styles.body} x="20" y="14" width="300" height="272" rx="26" />
      <g className={styles.drawer}>
        <rect x="40" y="34" width="260" height="62" rx="18" />
        <rect className={styles.handle} x="140" y="60" width="60" height="7" rx="3.5" />
      </g>
      <g className={styles.sheets}>
        <rect x="74" y="100" width="92" height="64" rx="8" transform="rotate(-6 120 132)" />
        <rect x="150" y="96" width="96" height="68" rx="8" transform="rotate(4 198 130)" />
      </g>
      <g className={styles.open}>
        <rect x="40" y="130" width="260" height="70" rx="18" />
        <rect className={styles.openHandle} x="140" y="158" width="60" height="7" rx="3.5" />
        <rect className={styles.openLine} x="62" y="178" width="70" height="5" rx="2.5" />
      </g>
      <g className={styles.drawer}>
        <rect x="40" y="214" width="260" height="56" rx="18" />
        <rect className={styles.handle} x="140" y="236" width="60" height="7" rx="3.5" />
      </g>
    </svg>
  )
}
