import { Link, useParams } from 'react-router-dom'
import { Seo } from '../components/Seo'
import { Workbench } from '../components/Workbench'
import { getTool } from '../tools/registry'
import { NotFound } from './NotFound'
import styles from './Pages.module.css'

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
      <h1>{tool.seoTitle.split(' - ')[0]}</h1>
      <p className={styles.lead}>{tool.short}</p>

      <div className={styles.toolWrap}>
        <Workbench tool={tool} />
      </div>

      <section className={styles.block} aria-labelledby="nasil">
        <h2 id="nasil">Nasıl çalışır?</h2>
        <ol className={styles.steps}>
          {tool.steps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
      </section>

      <section className={styles.block} aria-labelledby="gizlilik-notu">
        <h2 id="gizlilik-notu">Dosyan sunucuya gitmez</h2>
        <p>
          Bu araç tarayıcının içinde çalışır. Seçtiğin dosya cihazının belleğinde işlenir ve ağ
          üzerinden hiçbir yere gönderilmez. Ayrıntılar için <Link to="/gizlilik">gizlilik</Link>{' '}
          sayfasına bak.
        </p>
      </section>

      <section className={styles.block} aria-labelledby="sss">
        <h2 id="sss">Sık sorulanlar</h2>
        {tool.faq.map((f) => (
          <details key={f.q} className={styles.faq}>
            <summary>{f.q}</summary>
            <p>{f.a}</p>
          </details>
        ))}
      </section>

      <section className={styles.block} aria-labelledby="ilgili">
        <h2 id="ilgili">İlgili araçlar</h2>
        <ul className={styles.related}>
          {tool.related.map((r) => {
            const rt = getTool(r)
            return rt ? (
              <li key={r}>
                <Link to={`/araclar/${rt.slug}`} className="btn">
                  {rt.name}
                </Link>
              </li>
            ) : null
          })}
        </ul>
      </section>
    </div>
  )
}
