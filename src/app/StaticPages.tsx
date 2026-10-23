import { Link } from 'react-router-dom'
import { Seo } from '../components/Seo'
import styles from './Pages.module.css'

export function Privacy() {
  return (
    <div className={`container ${styles.page} ${styles.prose}`}>
      <Seo
        title="Gizlilik - Atölye"
        description="Atölye dosyalarını sunucuya göndermez. Neyin cihazında kaldığını ve hangi küçük indirmelerin yapıldığını açıkça anlatıyoruz."
        path="/gizlilik"
      />
      <h1>Gizlilik</h1>
      <p>
        Atölye’de sunucu, hesap ve izleyici yoktur. Seçtiğin dosyalar tarayıcının belleğinde işlenir
        ve hiçbir ağ isteğine konu olmaz.
      </p>
      <h2>Neler indirilir?</h2>
      <p>
        Siteyi açarken uygulamanın kendi dosyaları, yazı tipleri ve kullandığın araca ait kodlar
        indirilir. Metin tanıma (OCR) aracı ilk kullanımda Türkçe ve İngilizce dil verisini, arka
        plan silme aracı model dosyalarını indirir ve tarayıcıda önbelleğe alır. Bu indirmeler
        dosyanın içeriğini ya da adını taşımaz.
      </p>
      <h2>Neler saklanır?</h2>
      <p>
        Yalnızca tema tercihin tarayıcının yerel depolamasında tutulur. Dosyaların hiçbir yere
        kaydedilmez.
      </p>
      <p>
        <Link to="/araclar">Araçlara dön</Link>
      </p>
    </div>
  )
}

export function About() {
  return (
    <div className={`container ${styles.page} ${styles.prose}`}>
      <Seo
        title="Hakkında - Atölye"
        description="Atölye, PDF, görsel ve ses dosyaları için tamamen tarayıcıda çalışan, ücretsiz bir araç atölyesidir."
        path="/hakkinda"
      />
      <h1>Hakkında</h1>
      <p>
        Atölye, sık gereken dosya işlerini cihazında bitirmen için hazırlanmış bir araç
        koleksiyonudur. Her araç bir çekmecedir: aç, işini gör, kapat. Dosyan yüklenmediği için
        beklemek, hesap açmak ya da güvenmek zorunda kalmazsın.
      </p>
      <p>
        <Link to="/araclar">Araçlara göz at</Link>
      </p>
    </div>
  )
}
