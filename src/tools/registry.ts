export type ToolStatus = 'ready' | 'soon'

export interface ToolMeta {
  slug: string
  // The tool's library builds code at runtime and needs a looser CSP on its own
  // page (see scripts/csp-hash.mjs), so links to it must load a fresh document.
  fullReload?: boolean
  name: string
  short: string
  icon: string
  status: ToolStatus
  accept: string
  multiple: boolean
  seoTitle: string
  seoDescription: string
  steps: [string, string, string]
  faq: { q: string; a: string }[]
  related: string[]
}

const NO_UPLOAD =
  'Hayır. İşlem tarayıcının içinde, cihazının belleğinde yapılır. Dosyan hiçbir sunucuya yüklenmez.'

export const TOOLS: ToolMeta[] = [
  {
    slug: 'pdf-birlestir',
    name: 'PDF birleştir',
    short: 'Birden çok PDF’i sıralayıp tek dosyada topla.',
    icon: 'merge',
    status: 'ready',
    accept: 'application/pdf,.pdf',
    multiple: true,
    seoTitle: 'PDF birleştir - ücretsiz, yüklemeden, çevrimdışı',
    seoDescription:
      'PDF dosyalarını tarayıcında birleştir. Dosyaların sunucuya yüklenmez, internet bağlantısı olmadan da çalışır.',
    steps: [
      'PDF dosyalarını seç ya da alana bırak.',
      'Sürükleyerek ya da okları kullanarak sırayı düzenle.',
      'Birleştir’e bas ve tek PDF’i indir.',
    ],
    faq: [
      { q: 'Dosyalarım sunucuya yükleniyor mu?', a: NO_UPLOAD },
      {
        q: 'Kaç dosya birleştirebilirim?',
        a: 'Sabit bir sınır yok; sınırı cihazının belleği belirler. Çok büyük dosyalarda tarayıcı yavaşlayabilir.',
      },
      {
        q: 'Parolalı PDF’ler çalışır mı?',
        a: 'Hayır. Parolalı dosyaları önce parolasını kaldırarak kaydetmen gerekir.',
      },
    ],
    related: ['pdf-bol', 'pdf-sikistir'],
  },
  {
    slug: 'pdf-bol',
    name: 'PDF böl',
    short: 'Sayfaları ayır ya da bir aralığı yeni PDF yap.',
    icon: 'split',
    status: 'ready',
    accept: 'application/pdf,.pdf',
    multiple: false,
    seoTitle: 'PDF böl, sayfa ayır - ücretsiz, yüklemeden, çevrimdışı',
    seoDescription:
      'PDF’i sayfalara ayır ya da “1-3, 5, 8-10” gibi aralıklarla yeni PDF çıkar. Her şey tarayıcında olur, dosya yüklenmez.',
    steps: [
      'Bir PDF seç.',
      'Her sayfayı ayrı dosya yap ya da sayfa aralığını yaz.',
      'Sonucu PDF ya da zip olarak indir.',
    ],
    faq: [
      { q: 'Dosyam yükleniyor mu?', a: NO_UPLOAD },
      {
        q: 'Aralığı nasıl yazarım?',
        a: 'Virgülle ayır: “1-3, 5, 8-10”. Tek sayfa ya da aralık yazabilirsin.',
      },
      {
        q: 'Çok sayfalı çıktı nasıl iniyor?',
        a: 'Her sayfa ayrı dosya olacaksa tek bir zip dosyası olarak iner.',
      },
    ],
    related: ['pdf-birlestir', 'pdf-sikistir'],
  },
  {
    slug: 'pdf-sikistir',
    name: 'PDF sıkıştır',
    short: 'Dosya boyutunu küçült; önce ve sonra boyutu gör.',
    icon: 'compress',
    status: 'ready',
    accept: 'application/pdf,.pdf',
    multiple: false,
    seoTitle: 'PDF sıkıştır - ücretsiz, yüklemeden, çevrimdışı',
    seoDescription:
      'PDF boyutunu tarayıcında küçült. Hafif, Dengeli ve Güçlü seçenekleri var; dosyan cihazından çıkmaz.',
    steps: [
      'Bir PDF seç.',
      'Hafif, Dengeli ya da Güçlü sıkıştırmayı seç.',
      'Önce/sonra boyutuna bak ve indir.',
    ],
    faq: [
      { q: 'Dosyam yükleniyor mu?', a: NO_UPLOAD },
      {
        q: 'Metin seçilebilir kalır mı?',
        a: 'Hayır. Sayfalar görsele çevrilerek yeniden paketlenir, bu yüzden metin seçilemez hale gelir.',
      },
      {
        q: 'Dosya büyürse ne olur?',
        a: 'Sonuç orijinalden büyükse orijinal dosya korunur ve bu sana söylenir.',
      },
    ],
    related: ['pdf-birlestir', 'pdf-bol'],
  },
  {
    slug: 'gorsel-boyutlandir',
    name: 'Görsel boyutlandır',
    short: 'Genişlik, yükseklik ve kaliteyi ayarla.',
    icon: 'resize',
    status: 'ready',
    accept: 'image/*',
    multiple: false,
    seoTitle: 'Görsel boyutlandır - ücretsiz, yüklemeden, çevrimdışı',
    seoDescription:
      'Fotoğrafı istediğin ölçüye getir; oran kilidi, hazır ölçüler ve kalite ayarı. Görselin cihazından çıkmaz.',
    steps: [
      'Bir görsel seç.',
      'Ölçüyü yaz ya da hazır ölçülerden birini seç.',
      'Kaliteyi ayarla ve indir.',
    ],
    faq: [
      { q: 'Görselim yükleniyor mu?', a: NO_UPLOAD },
      {
        q: 'Hangi biçimler destekleniyor?',
        a: 'Tarayıcının açabildiği biçimler: genellikle PNG, JPG, WebP ve GIF.',
      },
      {
        q: 'Oran kilidi ne işe yarar?',
        a: 'Genişliği değiştirince yüksekliği orana göre kendisi ayarlar.',
      },
    ],
    related: ['gorsel-donustur', 'arka-plan-sil'],
  },
  {
    slug: 'gorsel-donustur',
    name: 'Görsel dönüştür',
    short: 'PNG, JPG ve WebP arasında toplu dönüştür.',
    icon: 'convert',
    status: 'ready',
    accept: 'image/*',
    multiple: true,
    seoTitle: 'Görsel dönüştür PNG JPG WebP - ücretsiz, yüklemeden',
    seoDescription:
      'Görselleri PNG, JPG ya da WebP’ye toplu olarak dönüştür, zip olarak indir. Dosyalar cihazından çıkmaz.',
    steps: [
      'Bir ya da birden çok görsel seç.',
      'Hedef biçimi seç.',
      'Dönüştür’e bas; çoklu sonuç zip olarak iner.',
    ],
    faq: [
      { q: 'Görsellerim yükleniyor mu?', a: NO_UPLOAD },
      {
        q: 'PNG’den JPG’ye çevirince saydamlık ne olur?',
        a: 'JPG saydamlığı desteklemez; saydam alanlar beyaz olur.',
      },
      { q: 'Toplu dönüştürmede sınır var mı?', a: 'Sabit sınır yok; cihazının belleği belirler.' },
    ],
    related: ['gorsel-boyutlandir', 'arka-plan-sil'],
  },
  {
    slug: 'arka-plan-sil',
    fullReload: true,
    name: 'Arka plan sil',
    short: 'Fotoğrafın arka planını kaldır, şeffaf PNG al.',
    icon: 'cutout',
    status: 'ready',
    accept: 'image/*',
    multiple: false,
    seoTitle: 'Arka plan sil - ücretsiz, yüklemeden, çevrimdışı',
    seoDescription:
      'Fotoğrafın arka planını cihazında sil, şeffaf PNG olarak indir. Model uygulamayla birlikte gelir, görsel yüklenmez.',
    steps: [
      'Bir fotoğraf seç.',
      'Model ilk kullanımda yüklenir; ilerlemeyi izle.',
      'Şeffaf PNG’yi indir.',
    ],
    faq: [
      { q: 'Fotoğrafım yükleniyor mu?', a: NO_UPLOAD },
      {
        q: 'Neden ilk açılış yavaş?',
        a: 'Yapay zekâ modeli büyük bir dosyadır. Bir kez yüklenir, sonra önbellekten gelir.',
      },
      { q: 'Çevrimdışı çalışır mı?', a: 'Model bir kez yüklendikten sonra evet.' },
    ],
    related: ['gorsel-boyutlandir', 'gorsel-donustur'],
  },
  {
    slug: 'metin-cikar-ocr',
    name: 'Metin çıkar (OCR)',
    short: 'Görseldeki yazıyı Türkçe ya da İngilizce oku.',
    icon: 'text',
    status: 'ready',
    accept: 'image/*',
    multiple: false,
    seoTitle: 'Görselden metin çıkar OCR - ücretsiz, yüklemeden',
    seoDescription:
      'Görseldeki yazıyı Türkçe ve İngilizce olarak tarayıcında oku; kopyala ya da .txt indir. Görsel yüklenmez.',
    steps: [
      'Metin içeren bir görsel seç.',
      'Dili seç ve başlat.',
      'Metni kopyala ya da .txt olarak indir.',
    ],
    faq: [
      {
        q: 'Görselim yükleniyor mu?',
        a: 'Hayır. Yalnızca dil verisi ilk kullanımda indirilir; bu indirme dosyanı içermez.',
      },
      {
        q: 'Sonuç ne kadar doğru?',
        a: 'Net, düz ve yüksek çözünürlüklü görsellerde daha iyidir. El yazısında zayıftır.',
      },
      { q: 'Çevrimdışı çalışır mı?', a: 'Dil verisi bir kez indirildikten sonra evet.' },
    ],
    related: ['gorsel-boyutlandir', 'pdf-birlestir'],
  },
  {
    slug: 'ses-kes',
    name: 'Ses kes',
    short: 'Dalga formunda aralık seç, önizle, WAV indir.',
    icon: 'audio',
    status: 'ready',
    accept: 'audio/*',
    multiple: false,
    seoTitle: 'Ses kes - ücretsiz, yüklemeden, çevrimdışı',
    seoDescription:
      'Ses dosyasını dalga formu üzerinde kes, önizle ve WAV olarak indir. Ses dosyan cihazından çıkmaz.',
    steps: [
      'Bir ses dosyası seç.',
      'Dalga formunda başlangıç ve bitişi ayarla, önizle.',
      'WAV olarak indir.',
    ],
    faq: [
      { q: 'Ses dosyam yükleniyor mu?', a: NO_UPLOAD },
      {
        q: 'Hangi biçimler açılır?',
        a: 'Tarayıcının çözebildiği biçimler: genellikle MP3, WAV, M4A ve OGG.',
      },
      { q: 'Çıktı hangi biçimde?', a: 'WAV. Dosya kayıpsızdır ama büyük olabilir.' },
    ],
    related: ['pdf-birlestir', 'gorsel-donustur'],
  },
  {
    slug: 'pdf-imzala',
    name: 'PDF imzala',
    short: 'İmzanı PDF’e yerleştir.',
    icon: 'sign',
    status: 'soon',
    accept: 'application/pdf,.pdf',
    multiple: false,
    seoTitle: 'PDF imzala',
    seoDescription: 'Yakında.',
    steps: ['', '', ''],
    faq: [],
    related: [],
  },
  {
    slug: 'resimden-pdf',
    name: 'Resimden PDF',
    short: 'Görselleri tek bir PDF’e çevir.',
    icon: 'imagepdf',
    status: 'soon',
    accept: 'image/*',
    multiple: true,
    seoTitle: 'Resimden PDF',
    seoDescription: 'Yakında.',
    steps: ['', '', ''],
    faq: [],
    related: [],
  },
  {
    slug: 'qr-kod-uret',
    name: 'QR kod üret',
    short: 'Metin ya da bağlantıdan QR kod oluştur.',
    icon: 'qr',
    status: 'soon',
    accept: '',
    multiple: false,
    seoTitle: 'QR kod üret',
    seoDescription: 'Yakında.',
    steps: ['', '', ''],
    faq: [],
    related: [],
  },
  {
    slug: 'json-bicimlendir',
    name: 'JSON biçimlendir',
    short: 'JSON’u düzenle, doğrula ve sadeleştir.',
    icon: 'json',
    status: 'soon',
    accept: '',
    multiple: false,
    seoTitle: 'JSON biçimlendir',
    seoDescription: 'Yakında.',
    steps: ['', '', ''],
    faq: [],
    related: [],
  },
]

export const READY_TOOLS = TOOLS.filter((t) => t.status === 'ready')

export function getTool(slug: string): ToolMeta | undefined {
  return TOOLS.find((t) => t.slug === slug)
}
