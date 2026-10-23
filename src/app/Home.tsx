import { useState } from 'react'
import { DrawerCard } from '../components/DrawerCard'
import { Seo } from '../components/Seo'
import { Workbench } from '../components/Workbench'
import { getTool, TOOLS } from '../tools/registry'
import styles from './Home.module.css'

export function Home() {
  const [slug, setSlug] = useState('pdf-birlestir')
  const tool = getTool(slug) ?? TOOLS[0]

  return (
    <>
      <Seo
        title="Atölye - PDF, görsel ve ses araçları, dosyan cihazından çıkmaz"
        description="PDF birleştir, böl, sıkıştır; görsel boyutlandır, dönüştür; arka plan sil; OCR; ses kes. Hepsi tarayıcında çalışır, dosyaların hiçbir yere gönderilmez."
        path="/"
      />
      <section className={`container ${styles.hero}`}>
        <h1>
          İşini cihazında bitir.
          <br />
          Dosyan hiçbir yere gitmesin.
        </h1>
        <p>
          PDF, görsel ve ses araçları tarayıcının içinde çalışır. Sunucu yok, yükleme yok, hesap
          yok.
        </p>
      </section>

      <div className={`container ${styles.layout}`}>
        <section aria-labelledby="cekmeceler">
          <h2 id="cekmeceler" className={styles.sectionTitle}>
            Çekmeceler
          </h2>
          <div className={styles.grid}>
            {TOOLS.map((t) => (
              <DrawerCard key={t.slug} tool={t} selected={t.slug === slug} onSelect={setSlug} />
            ))}
          </div>
        </section>
        <aside className={styles.side}>
          <Workbench key={tool.slug} tool={tool} />
        </aside>
      </div>
    </>
  )
}
