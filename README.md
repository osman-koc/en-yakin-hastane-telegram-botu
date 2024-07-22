
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

- Node.js
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
MY_API_URI=YOUR_GOOGLE_SHEETS_API_URI (optional)
```

### Çalıştırma

Telegram botunu başlatmak için aşağıdaki komutu kullanın:

```bash
npm start
```

## Kullanım

Bot, aşağıdaki komutları ve mesajları tanır:

- `/start`: Botu başlatmak için kullanılır.
- `/help`: Botun nasıl kullanılacağını açıklar.
- `/developer`: Geliştirici hakkında bilgi verir.
- `/contact`: Hata veya öneri bildirmek için iletişim bilgilerini sağlar.
- `Konum Gönderme`: Kullanıcı mevcut konumunu bota gönderdiğinde, bot en yakın hastaneleri listeler.

### Konum Bilgisi Gönderme

Bot, kullanıcıdan konum bilgisi aldığında, konumun Türkiye içinde olup olmadığını kontrol eder. Eğer konum Türkiye dışındaysa, kullanıcıya yalnızca Türkiye içindeki hastaneler için hizmet verildiğini belirten bir mesaj gönderir. Türkiye içindeki konumlar için, en yakın hastaneleri listeler ve kullanıcıya gönderir.

### Hata Yönetimi

Bot, Telegram API'si ile ilgili hataları ve diğer genel hataları ele almak için `handleError` fonksiyonunu kullanır. Bu fonksiyon, hata durumunda uygun mesajları gönderir ve belirli hatalar için yeniden deneme mekanizması uygular.

## Geliştirme

Bot ile ilgili geliştirme yaparken aşağıdaki dosyalar önemlidir:

- `bot.js`: Botun ana dosyasıdır.
- `api/openstreetmap-api.js`: OpenStreetMap API'si ile etkileşim sağlar.
- `api/find-hospital.js`: JSON veritabanından hastane verilerini arar.
- `api/my-api.js`: Özel geliştirilen bir servis ile iletişimi sağlar. Burada kullanım verilerini toplayan bir metot mevcut. Opsiyoneldir, kendi servisinizi oluşturup bu dosyayı entegre edebilirsiniz.

## Katkıda Bulunma

Katkıda bulunmak isterseniz, lütfen bir pull request açın veya proje üzerinde çalışmadan önce bir issue oluşturun. Büyük değişiklikler için lütfen önce neyi değiştirmek istediğinizi tartışmak için bir issue açın.

## Bağlantılar

- [Proje Ana Sayfası](https://github.com/osman-koc/en-yakin-hastane-telegram-botu)
- [Sorun Bildir](https://github.com/osman-koc/en-yakin-hastane-telegram-botu/issues)
