import { Head } from 'vite-react-ssg'

const SITE_URL = (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, '') ?? ''
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '')

interface SeoProps {
  title: string
  description: string
  path: string
  app?: { name: string; category: string }
}

export function Seo({ title, description, path, app }: SeoProps) {
  const url = `${SITE_URL}${BASE}${path}`
  const jsonLd = app
    ? JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: app.name,
        description,
        url,
        applicationCategory: app.category,
        operatingSystem: 'Web tarayıcısı',
        inLanguage: 'tr',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'TRY' },
      })
    : null

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:locale" content="tr_TR" />
      <meta property="og:site_name" content="Atölye" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      {SITE_URL && <meta property="og:url" content={url} />}
      {SITE_URL && <link rel="canonical" href={url} />}
      <meta name="twitter:card" content="summary" />
      {jsonLd && <script type="application/ld+json">{jsonLd}</script>}
    </Head>
  )
}
