import { Link, NavLink, Outlet } from 'react-router-dom'
import { ThemeToggle } from './ThemeToggle'
import styles from './Layout.module.css'

export function Layout() {
  return (
    <>
      <a href="#icerik" className={styles.skip}>
        İçeriğe geç
      </a>
      <header className={styles.header}>
        <div className={`container ${styles.bar}`}>
          <Link to="/" className={styles.brand}>
            <span className={styles.mark} aria-hidden="true" />
            Atölye
          </Link>
          <nav aria-label="Ana gezinme" className={styles.nav}>
            <NavLink to="/araclar">Araçlar</NavLink>
            <NavLink to="/gizlilik">Gizlilik</NavLink>
            <NavLink to="/hakkinda">Hakkında</NavLink>
          </nav>
          <ThemeToggle />
        </div>
      </header>
      <main id="icerik">
        <Outlet />
      </main>
      <footer className={styles.footer}>
        <div className="container">
          <p>Dosyaların cihazından çıkmaz. Sunucu yok, hesap yok, izleyici yok.</p>
        </div>
      </footer>
    </>
  )
}
