import { useState } from 'react'
import { DrawerCard } from '../components/DrawerCard'
import { DrawerIllustration } from '../components/DrawerIllustration'
import { Icon } from '../components/Icon'
import { Seo } from '../components/Seo'
import { Workbench } from '../components/Workbench'
import { getTool, GROUPS, TOOLS } from '../tools/registry'
import styles from './Home.module.css'

const TRUST = [
  { icon: 'lock', text: 'Dosya cihazında kalır' },
  { icon: 'check', text: 'Hesap gerekmez' },
  { icon: 'offline', text: 'Sunucu yok, izleyici yok' },
]

export function Home() {
  const [slug, setSlug] = useState('pdf-birlestir')
  const tool = getTool(slug) ?? TOOLS[0]

  function select(next: string) {
    const t = getTool(next)
    if (t?.fullReload) {
      window.location.assign(`${import.meta.env.BASE_URL}araclar/${t.slug}/`)
      return
    }
    setSlug(next)
  }

  return (
    <>
      <Seo
        title="Atölye - PDF, görsel ve ses araçları, dosyan cihazından çıkmaz"
        description="PDF birleştir, böl, sıkıştır; görsel boyutlandır, dönüştür; arka plan sil; OCR; ses kes. Hepsi tarayıcında çalışır, dosyaların hiçbir yere gönderilmez."
        path="/"
      />
      <section className={`container ${styles.hero}`}>
        <div className={styles.heroText}>
          <p className={`${styles.eyebrow} mono`}>Tarayıcıda çalışan araç atölyesi</p>
          <h1>
            İşini cihazında bitir.
            <br />
            <span className={styles.accent}>Dosyan hiçbir yere gitmesin.</span>
          </h1>
          <p className={styles.lead}>
            PDF, görsel ve ses araçları tarayıcının içinde çalışır. Sunucu yok, yükleme yok, hesap
            yok. Çekmeceyi aç, işini gör, kapat.
          </p>
          <ul className={styles.trust}>
            {TRUST.map((t) => (
              <li key={t.text}>
                <Icon name={t.icon} size={18} />
                {t.text}
              </li>
            ))}
          </ul>
        </div>
        <div className={styles.art}>
          <DrawerIllustration />
        </div>
      </section>

      <div className={`container ${styles.layout}`}>
        <section aria-labelledby="cekmeceler" className={styles.drawers}>
          <h2 id="cekmeceler" className="sr-only">
            Çekmeceler
          </h2>
          {GROUPS.map((g) => (
            <div key={g.id} className={styles.group}>
              <h3 className={`${styles.groupTitle} mono`}>{g.label}</h3>
              <div className={styles.grid}>
                {g.slugs.map((s) => {
                  const t = getTool(s)
                  return t ? (
                    <DrawerCard key={s} tool={t} selected={s === slug} onSelect={select} />
                  ) : null
                })}
              </div>
            </div>
          ))}
        </section>
        <aside className={styles.side}>
          <Workbench key={tool.slug} tool={tool} />
        </aside>
      </div>
    </>
  )
}
