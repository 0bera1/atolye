import { Link } from 'react-router-dom'
import { Seo } from '../components/Seo'
import styles from './Pages.module.css'

export function NotFound() {
  return (
    <div className={`container ${styles.page}`}>
      <Seo
        title="Sayfa bulunamadı - Atölye"
        description="Aradığın sayfa bulunamadı."
        path="/404"
        noindex
      />
      <h1>Sayfa bulunamadı</h1>
      <p className={styles.lead}>Bu adreste bir çekmece yok.</p>
      <Link to="/" className="btn btn-primary">
        Ana sayfaya dön
      </Link>
    </div>
  )
}
