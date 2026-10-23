import { Icon } from './Icon'
import styles from './ThemeToggle.module.css'

function effectiveTheme(): 'light' | 'dark' {
  const attr = document.documentElement.getAttribute('data-theme')
  if (attr === 'light' || attr === 'dark') return attr
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

// The icon is chosen by CSS from the active theme, so server-rendered markup
// and the first client render are identical.
export function ThemeToggle() {
  function toggle() {
    const next = effectiveTheme() === 'dark' ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', next)
    try {
      localStorage.setItem('atolye-theme', next)
    } catch {
      // storage unavailable: the choice only lasts for this visit
    }
  }

  return (
    <button
      type="button"
      className={`btn ${styles.toggle}`}
      onClick={toggle}
      aria-label="Aydınlık ve karanlık tema arasında geçiş yap"
      title="Tema değiştir"
    >
      <span className={styles.sun}>
        <Icon name="sun" />
      </span>
      <span className={styles.moon}>
        <Icon name="moon" />
      </span>
    </button>
  )
}
