
# En Yakın Hastane Telegram Botu

Bu proje, kullanıcıların konumlarına göre en yakın hastaneleri sorgulamalarına olanak tanıyan bir Telegram botudur. Bot, kullanıcıların mevcut konum bilgilerini alır ve yakınındaki hastaneleri listeler. Türkiye içerisindeki hastaneler için hizmet vermektedir.

Hastane verileri Sağlık Bakanlığı web sitesinden, hastanelerin konum bilgileri ise Google Maps'ten alınmıştır. Verilerde hata/eksiklik olması durumunda `./db/hospitals.json` altındaki verileri güncelleyen bir pull request oluşturabilirsiniz. Ayrıca bu verileri kendi projelerinizde de kaynak göstererek kullanabilirsiniz.

## Kullanım

Telegram hesabınız varsa kullanıcı arama kısmına `En Yakın Hastaneyi Bul` yazarak veya aşağıdaki linkten bota ulaşabilirsiniz:
https://t.me/EnYakinHastaneBot

<a href="https://t.me/EnYakinHastaneBot"><img src="./img/bot-logo.jpg" width="150" /></a>


## Başlangıç

Uygulamayı bilgisayarınızda çalıştırmak için bu adımları takip edebilirsiniz.

### Gereksinimler

- Node.js v20+
- npm (Node Package Manager)

### Kurulum

Proje dizinine gidin ve gerekli bağımlılıkları yüklemek için aşağıdaki komutu çalıştırın:

```bash
npm install
```

### Çevre Değişkenleri

Projenin düzgün çalışması için bir `.env` dosyasına ihtiyacınız var. Proje dizininde bir `.env` dosyası oluşturun ve aşağıdaki değişkenleri ekleyin:

```plaintext
TELEGRAM_BOT_TOKEN=YOUR_TELEGRAM_BOT_TOKEN
OPENSTREETMAP_URI=https://nominatim.openstreetmap.org/reverse
GOOGLE_MAPS_URI=https://www.google.com/maps/search/?api=1
MY_API_URI=YOUR_CUSTOM_API_URI   # opsiyonel
MY_API_KEY=YOUR_CUSTOM_API_KEY   # opsiyonel
```

### Çalıştırma

Telegram botunu başlatmak için aşağıdaki komutu kullanın:

```bash
npm start
```

### Docker ile Çalıştırma

Uygulamayı Docker üzerinde çalıştırmak için önce imajı derleyin, ardından çalıştırın:

```bash
docker build -t en-yakin-hastane-bot .
docker run -d --env-file .env en-yakin-hastane-bot
```

## Komutlar ve Özellikler

Bot, aşağıdaki komutları ve mesajları tanır:

- `/start`: Botu başlatmak için kullanılır.
- `/help`: Botun nasıl kullanılacağını açıklar.
- `/developer`: Geliştirici hakkında bilgi verir.
- `/contact`: Hata veya öneri bildirmek için iletişim bilgilerini sağlar.
- `Konum Gönderme`: Kullanıcı mevcut konumunu bota gönderdiğinde, bot en yakın hastaneleri listeler.

### Konum Bilgisi Gönderme

Bot, kullanıcıdan konum bilgisi aldığında, konumun Türkiye içinde olup olmadığını kontrol eder. Eğer konum Türkiye dışındaysa, kullanıcıya yalnızca Türkiye içindeki hastaneler için hizmet verildiğini belirten bir mesaj gönderir. Türkiye içindeki konumlar için en yakın hastaneleri önce ilçe bazında, bulunamazsa il bazında, o da bulunamazsa tüm Türkiye genelinde mesafeye göre sıralayarak listeler.

İlk 5 hastane doğrudan listelenir. Daha fazla hastane varsa **"Daha Fazla Göster"** butonu ile ek sonuçlar görüntülenebilir.

### Hata Yönetimi

Servis tarafında oluşan hatalar `services/logger.js` aracılığıyla loglanır. Konum alınamadığında veya OpenStreetMap API'sinde bir hata oluştuğunda kullanıcıya bilgilendirici bir mesaj gönderilir.

## Geliştirme

Bot ile ilgili geliştirme yaparken aşağıdaki dosyalar önemlidir:

- `bot.js`: Uygulamanın giriş noktasıdır; botu başlatır.
- `api/webhook.js`: [grammY](https://grammy.dev/) kütüphanesi ile Telegram bot mantığını içerir; mesaj ve callback handler'ları burada tanımlıdır.
- `services/find-hospital.js`: JSON veritabanından ilçe → il → ülke geneli sırasıyla hastane arar ve mesafeye göre sıralar.
- `services/openstreetmap-api.js`: Enlem/boylam koordinatlarından şehir ve ilçe bilgisi almak için OpenStreetMap Nominatim API'sini kullanır.
- `services/my-api.js`: Kullanım verilerini Google Sheets'e kaydetmek için opsiyonel özel servis entegrasyonunu sağlar.
- `services/logger.js`: Uygulama geneli loglama servisini sağlar.
- `db/hospitals.json`: Türkiye'deki hastanelerin isim, tip, adres ve konum bilgilerini içeren veri tabanı dosyasıdır.

## Katkıda Bulunma

Katkıda bulunmak isterseniz, lütfen bir pull request açın veya proje üzerinde çalışmadan önce bir issue oluşturun. Büyük değişiklikler için lütfen önce neyi değiştirmek istediğinizi tartışmak için bir issue açın.

Katkıda bulunanlar:
- Göktuğ Başaran [(@goktugbasaran)](https://github.com/goktugbasaran)

## Bağlantılar

- [Proje Ana Sayfası](https://github.com/osman-koc/en-yakin-hastane-telegram-botu)
- [Sorun Bildir](https://github.com/osman-koc/en-yakin-hastane-telegram-botu/issues)
