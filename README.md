# Atölye

PDF, görsel, ses ve metin araçlarını **tamamen tarayıcıda** çalıştıran bir araç atölyesi.

> Dosyan hiçbir yere gitmez, işlem cihazında biter.

Sunucu yok, arka uç yok, harici API yok. Seçilen dosyalar hiçbir ağ isteğine konu olmaz. Arayüz Türkçedir.

## Durum

| Alan                                                           | Durum                                          |
| -------------------------------------------------------------- | ---------------------------------------------- |
| 8 araç (aşağıda)                                               | Çalışıyor, uçtan uca testlerle doğrulandı      |
| Aydınlık / karanlık tema, mobil düzen                          | Çalışıyor                                      |
| Her rota için statik HTML (ön-render), SEO etiketleri, JSON-LD | Çalışıyor                                      |
| PWA ve çevrimdışı çalışma                                      | **Henüz yapılmadı**                            |
| Lighthouse ölçümü                                              | **Henüz yapılmadı**                            |
| Cloudflare Pages dağıtımı, atolye.beraekimci.com.tr            | Yayında                                        |
| PDF imzala, Resimden PDF, QR kod üret, JSON biçimlendir        | Sonraki aşama ("Yakında" kartı olarak görünür) |

## Araçlar

| Araç               | Ne yapar                                                                                        |
| ------------------ | ----------------------------------------------------------------------------------------------- |
| PDF birleştir      | Birden çok PDF'i sürükleyerek ya da okla sıralayıp tek dosyada toplar                           |
| PDF böl            | Her sayfayı ayrı dosya (zip) yapar ya da `1-3, 5, 8-10` gibi aralığı çıkarır                    |
| PDF sıkıştır       | Sayfaları JPEG olarak yeniden paketler (Hafif / Dengeli / Güçlü). Sonuç büyürse orijinali korur |
| Görsel boyutlandır | Genişlik/yükseklik, oran kilidi, hazır ölçüler, kalite                                          |
| Görsel dönüştür    | PNG / JPG / WebP arası toplu dönüştürme, zip çıktı                                              |
| Arka plan sil      | Şeffaf PNG çıktısı, kendi origin'imizden sunulan model                                          |
| Metin çıkar (OCR)  | Türkçe ve İngilizce, kopyala veya `.txt` indir                                                  |
| Ses kes            | Dalga formunda aralık seç, önizle, WAV indir                                                    |

## Kullanılan teknolojiler

### Uygulama

| Teknoloji                      | Sürüm | Kullanım                          | Lisans     |
| ------------------------------ | ----- | --------------------------------- | ---------- |
| React                          | 18.3  | Arayüz                            | MIT        |
| TypeScript (strict)            | 6.0   | Tip güvenliği                     | Apache-2.0 |
| Vite                           | 8.3   | Geliştirme sunucusu ve derleme    | MIT        |
| react-router-dom               | 6.30  | Yönlendirme                       | MIT        |
| vite-react-ssg                 | 0.9   | Her rota için statik HTML üretimi | MIT        |
| CSS değişkenleri + CSS Modules | -     | Stil (Tailwind kullanılmıyor)     | -          |

### Dosya işleme (hepsi tarayıcıda, ihtiyaç anında yüklenir)

| Kütüphane                          | Sürüm | Kullanım                                          | Lisans                            |
| ---------------------------------- | ----- | ------------------------------------------------- | --------------------------------- |
| pdf-lib                            | 1.17  | PDF birleştirme, bölme, yeniden paketleme         | MIT                               |
| pdfjs-dist                         | 6.4   | PDF sayfalarını çizme (sıkıştırma)                | Apache-2.0                        |
| tesseract.js                       | 7.0   | OCR (Türkçe + İngilizce)                          | Apache-2.0                        |
| @tesseract.js-data/eng, tur        | 1.0   | OCR dil verisi                                    | MIT                               |
| @imgly/background-removal (+ data) | 1.4.5 | Arka plan silme                                   | **AGPL-3.0** (aşağıdaki nota bak) |
| jszip                              | 3.10  | Çoklu çıktıyı zip yapma                           | MIT veya GPL-3.0+                 |
| Canvas API / OffscreenCanvas       | -     | Görsel boyutlandırma ve dönüştürme                | tarayıcı                          |
| Web Audio API                      | -     | Ses çözme, önizleme (WAV kodlayıcı kendi kodumuz) | tarayıcı                          |

`qrcode` ve `vite-plugin-pwa` kuruludur ama henüz kullanılmıyor (QR aracı ve PWA aşamaları için).

### Yazı tipleri (kendi origin'imizden, Google'a istek yok)

Sora (başlıklar), Hanken Grotesk (gövde), DM Mono (etiketler ve sayılar). Üçü de SIL Open Font License 1.1 ile lisanslıdır. `woff2` dosyaları `public/fonts` altındadır; Türkçe karakterler için latin-ext alt kümesi de dahildir.

### Test ve kalite

| Araç                       | Kullanım                     | Lisans     |
| -------------------------- | ---------------------------- | ---------- |
| Vitest                     | Birim testleri               | MIT        |
| Playwright                 | Tarayıcıda uçtan uca testler | Apache-2.0 |
| ESLint + typescript-eslint | Lint                         | MIT        |
| Prettier                   | Biçimlendirme                | MIT        |

## Kurulum

Gereksinimler: Node.js 20 veya üstü, npm.

```bash
git clone https://github.com/0bera1/atolye.git
cd atolye
npm install
npx playwright install chromium   # yalnızca uçtan uca testler için
```

OCR motoru, dil verisi ve arka plan silme modeli depoda tutulmaz. `npm run dev` ve `npm run build` öncesinde `scripts/copy-assets.mjs` bunları `node_modules` içinden `public/tesseract` ve `public/models` altına kopyalar (yaklaşık 110 MB, git'e girmez).

## Geliştirme

```bash
npm run dev       # http://localhost:5173
npm run build     # tip denetimi + statik HTML üretimi + CSP karmaları
npm run preview   # derlenmiş siteyi http://localhost:4173 üzerinde sun
npm run lint
npm run format
```

Dizin yapısı:

```
src/app/          sayfalar (ana sayfa, araç sayfası, gizlilik, hakkında)
src/components/   ortak bileşenler (düzen, çekmece kartı, tezgâh, ilerleme)
src/tools/<slug>/ her aracın arayüzü (Panel.tsx); kayıt: registry.ts, panels.ts
src/lib/          dosya işleme yardımcıları ve testleri (aralık, WAV, görsel, hata)
src/styles/       tasarım token'ları ve genel stil
public/fonts/     self-host yazı tipleri
scripts/          copy-assets.mjs, csp-hash.mjs
e2e/              Playwright testleri
```

Yeni araç eklemek için `src/tools/registry.ts` içine kaydı ekle, `src/tools/<slug>/Panel.tsx` yaz ve `src/tools/panels.ts` içine bağla.

## Test

```bash
npm test             # Vitest birim testleri
npm run test:e2e     # Playwright (önce build alır, preview sunucusunu kendisi açar)
E2E_BASE=http://localhost:5173 npm run test:e2e   # çalışan dev sunucusuna karşı
```

Uçtan uca testler her araca gerçek bir örnek dosya yükler, indirilen çıktıyı doğrular (sayfa sayısı, boyutlar, zip içeriği, WAV süresi, OCR metni) ve ağ isteklerini dinler: başka bir origin'e istek ya da gövde taşıyan istek varsa test başarısız olur.

## Gizlilik ilkesi

- Seçilen dosyalar `fetch`, XHR ya da WebSocket ile taşınmaz; analitik olaylarına dosya adı veya içerik konmaz. Üçüncü taraf analitik ve izleyici yoktur.
- Tek ağ trafiği sitenin kendi dosyalarıdır. OCR dil verisi ve arka plan modeli de **kendi origin'imizden** ilk kullanımda indirilir ve tarayıcıda önbelleğe alınır. Bu indirmeler dosya verisi içermez.
- Yalnızca tema tercihi `localStorage`'a yazılır; erişilemezse sessizce yutulur.
- İçerik Güvenlik Politikası (CSP) her sayfada `meta` etiketiyle uygulanır: `connect-src 'self' blob: data:`, harici script yok. `blob:` ve `data:` yalnızca tarayıcı içi yerel veri içindir. Satır içi betikler derleme sonrası `scripts/csp-hash.mjs` ile sha256 karmasına bağlanır, `unsafe-inline` kullanılmaz.

## Dağıtım

Canlı adres: **https://atolye.beraekimci.com.tr**

Site, Cloudflare Pages üzerinde (`atolye` projesi) doğrudan yükleme ile yayındadır. Alan adı Cloudflare DNS'te `atolye` CNAME kaydıyla Pages projesine bağlıdır (`atolye-f42.pages.dev`).

```bash
# CLOUDFLARE_API_TOKEN (Pages düzenleme yetkili) ve CLOUDFLARE_ACCOUNT_ID ortam değişkenleri tanımlı olmalı
npm run deploy      # build + wrangler pages deploy dist
```

Token ve hesap kimliği depoya yazılmaz.

- `public/_headers`: güvenlik başlıkları (`nosniff`, `Referrer-Policy: no-referrer`, `Permissions-Policy`, `X-Frame-Options`) ve değişmeyen dosyalar için uzun süreli önbellek.
- `.env.production`: `VITE_SITE_URL`, canonical ve Open Graph adresleri için site kökü. `VITE_BASE` varsayılanı `/` olduğu için alt yola dağıtımda ayrıca verilir.
- `public/404.html` derlemede üretilir; bilinmeyen adreslerde gösterilir ve `noindex` taşır.
- `.github/workflows/ci.yml`: her push'ta lint, birim testleri ve derleme. Dağıtım otomatik değildir.

### Cloudflare'in otomatik analitik betiği

`beraekimci.com.tr` bölgesinde Cloudflare Web Analytics otomatik kurulumu açıktır ve tüm alt alan adlarının HTML'ine `static.cloudflareinsights.com/beacon.min.js` ekler. Atölye'nin CSP'si bu betiği engeller; tarayıcıdan çıkmaz ve dosya verisiyle ilgisi yoktur, ancak tarayıcı konsolunda bir CSP hatası görünür. Kalıcı çözüm Cloudflare panelinde bu alt alan adı için otomatik kurulumu kapatmaktır (bölgedeki diğer siteleri de etkilediği için yapılmadı). Uçtan uca testler bu engellenen isteği ayrı kaydeder.

## Kararlar

- **Dağıtım Cloudflare Pages.** İlk plan GitHub Pages idi; mevcut token'larla Pages etkinleştirilemediği ve alan adındaki diğer siteler zaten Cloudflare Pages kullandığı için Cloudflare Pages seçildi. Bu sayede gerçek yanıt başlıkları (`_headers`) da kullanılabiliyor.

- **React 18 ve react-router-dom 6.** `vite-react-ssg` react-router-dom 7 ile çakıştı; spesifikasyondaki React 18 ile uyumlu olması için bu sürümlere sabitlendi. `npm audit` router 6 için iki orta seviye uyarı verir (açık yönlendirme, SSR hidrasyon); düzeltmesi yoktur, kullanıcı girdisiyle yönlendirme yapılmadığı için etkisizdir.
- **ESLint.** Vite şablonu oxlint getiriyordu; istenen ESLint ile değiştirildi.
- **Arka plan silme 1.4.5.** Model verisi npm'de yalnızca 1.4.5'e kadar yayımlanıyor; 1.7 sürümü verisini harici CDN'den çeker. Üçüncü taraf CDN yasak olduğu için kütüphane de 1.4.5'e sabitlendi ve veri kendi origin'imizden sunuluyor. Küçük (`small`) model kullanılır.
- **Arka plan silme sayfasında `unsafe-eval`.** Modelin çalışma zamanı kütüphanesi (ndarray) çalışırken işlev üretir. Yalnızca bu sayfanın CSP'sine `'unsafe-eval'` eklenir, diğer sayfalar katı kalır. Bu yüzden bu araca giden bağlantılar sayfayı yeniden yükler.
- **Dev sunucusunda CSP yok.** Vite geliştirme sunucusu satır içi betik enjekte eder; CSP yalnızca üretim derlemesine uygulanır.
- **Ses çıktısı.** Tarayıcı sesi kendi örnekleme hızında (genelde 48 kHz) çözer; WAV bu hızda yazılır. MP3 çıktı henüz yok.
- **Ağır işler.** PDF ve görsel işleri ana iş parçacığında, adımlar arasında arayüze nefes aldırarak çalışır; ilerleme ve iptal vardır. pdf.js kendi worker'ını, tesseract.js kendi worker'ını kullanır. Ayrı bir Web Worker'a taşıma yapılmadı. Arka plan silme iptal edilince sonuç atılır, ancak kütüphane işlemi yarıda kesemez.
- **Dosya boyutu.** Yapay sınır yoktur; 100 MB üstünde bellek uyarısı gösterilir.

## Bilinen sınırlamalar

- PDF sıkıştırma sayfaları görsele çevirir; metin seçilebilirliği kaybolur.
- Parolalı PDF'ler desteklenmez (Türkçe hata mesajı gösterilir).
- Testler yalnızca Chromium'da koşturuldu; Safari ve Firefox denenmedi.
- Lighthouse skorları ve çevrimdışı çalışma henüz doğrulanmadı.

## Lisans notu

`@imgly/background-removal` ve model verisi **GNU AGPL-3.0** ile lisanslıdır. Bu kütüphaneyi içeren bir siteyi kullanıcılara sunmak, AGPL kapsamında siteyle birlikte çalışan kaynak kodun kullanıcılara sunulmasını gerektirebilir. Bu depo herkese açıktır, ancak henüz bir `LICENSE` dosyası eklenmemiştir; proje lisansı seçilmeden önce bu kütüphanenin gerekleri (AGPL uyumu ya da ticari lisans ya da başka bir arka plan silme çözümü) değerlendirilmelidir.
