import { Link, useParams } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { Seo } from '../components/Seo'
import { ToolLink } from '../components/ToolLink'
import { Workbench } from '../components/Workbench'
import { getTool } from '../tools/registry'
import { NotFound } from './NotFound'
import styles from './ToolPage.module.css'

export function ToolPage() {
  const { slug = '' } = useParams()
  const tool = getTool(slug)
  if (!tool || tool.status !== 'ready') return <NotFound />

  return (
    <div className={`container ${styles.page}`}>
      <Seo
        title={tool.seoTitle}
        description={tool.seoDescription}
        path={`/araclar/${tool.slug}`}
        app={{ name: tool.name, category: 'UtilitiesApplication' }}
      />

      <nav aria-label="Konum" className={styles.crumbs}>
        <Link to="/araclar">Araçlar</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{tool.name}</span>
      </nav>

      <header className={styles.head}>
        <span className={styles.badge}>
          <Icon name={tool.icon} size={26} />
        </span>
        <div>
          <h1>{tool.seoTitle.split(' - ')[0]}</h1>
          <p className={styles.lead}>{tool.short}</p>
        </div>
      </header>

      <div className={styles.layout}>
        <aside className={styles.bench}>
          <Workbench tool={tool} />
        </aside>

        <div className={styles.info}>
          <section aria-labelledby="nasil">
            <h2 id="nasil">Nasıl çalışır?</h2>
            <ol className={styles.steps}>
              {tool.steps.map((s, i) => (
                <li key={s}>
                  <span className={`${styles.num} mono`}>{i + 1}</span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="gizlilik-notu" className={styles.privacy}>
            <span className={styles.privacyIcon}>
              <Icon name="lock" size={22} />
            </span>
            <div>
              <h2 id="gizlilik-notu">Dosyan sunucuya gitmez</h2>
              <p>
                Bu araç tarayıcının içinde çalışır. Seçtiğin dosya cihazının belleğinde işlenir ve
                ağ üzerinden hiçbir yere gönderilmez. Ayrıntılar için{' '}
                <Link to="/gizlilik">gizlilik</Link> sayfasına bak.
              </p>
            </div>
          </section>

          <section aria-labelledby="sss">
            <h2 id="sss">Sık sorulanlar</h2>
            <div className={styles.faqList}>
              {tool.faq.map((f) => (
                <details key={f.q} className={styles.faq}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </section>

          <section aria-labelledby="ilgili">
            <h2 id="ilgili">İlgili araçlar</h2>
            <ul className={styles.related}>
              {tool.related.map((r) => {
                const rt = getTool(r)
                return rt ? (
                  <li key={r}>
                    <ToolLink tool={rt} className="btn">
                      <Icon name={rt.icon} size={18} />
                      {rt.name}
                    </ToolLink>
                  </li>
                ) : null
              })}
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}
