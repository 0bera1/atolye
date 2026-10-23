import { ToolLink } from '../components/ToolLink'
import { Icon } from '../components/Icon'
import { Seo } from '../components/Seo'
import { TOOLS } from '../tools/registry'
import styles from './Pages.module.css'

export function ToolsIndex() {
  return (
    <div className={`container ${styles.page}`}>
      <Seo
        title="Tüm araçlar - Atölye"
        description="Atölye’deki tüm PDF, görsel ve ses araçları. Hepsi tarayıcında çalışır, dosyaların cihazından çıkmaz."
        path="/araclar"
      />
      <h1>Tüm araçlar</h1>
      <ul className={styles.toolList}>
        {TOOLS.map((t) => (
          <li key={t.slug}>
            {t.status === 'ready' ? (
              <ToolLink tool={t} className={styles.toolRow}>
                <Icon name={t.icon} />
                <span>
                  <strong>{t.name}</strong>
                  <br />
                  <span className={styles.muted}>{t.short}</span>
                </span>
              </ToolLink>
            ) : (
              <div className={`${styles.toolRow} ${styles.soon}`}>
                <Icon name={t.icon} />
                <span>
                  <strong>{t.name}</strong> <span className="mono">Yakında</span>
                  <br />
                  <span className={styles.muted}>{t.short}</span>
                </span>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
