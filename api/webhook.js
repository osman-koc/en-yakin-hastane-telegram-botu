import 'dotenv/config';
import { getCityAndDistrictFromLocation } from '../services/openstreetmap-api.js';
import { appendUsageDataToGoogleSheets } from '../services/my-api.js';
import { findHospitalsFromDb } from '../services/find-hospital.js';
import queryString from 'query-string';

const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

async function sendMessage(chatId, text, options = {}) {
  const payload = {
    chat_id: chatId,
    text,
    ...options,
  };
  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

// Geçici context için bellek içi obje (serverless ortamda kalıcı değildir)
const botContext = {};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }
  const body = req.body;
  try {
    if (body.message) {
      const msg = body.message;
      const chatId = msg.chat.id;
      const messageText = msg.text;
      const toLowerMessage = messageText?.toLowerCase();
      var responseMsg = '';
      if (msg && msg.location) {
        await sendMessage(chatId, 'Konum bilgisi sorgulanıyor.');
        let locationSuccess = false;
        const latitude = msg.location.latitude;
        const longitude = msg.location.longitude;
        try {
          const { country_code, city, district } = await getCityAndDistrictFromLocation(latitude, longitude);
          if (!country_code || country_code.toLowerCase() !== 'tr') {
            locationSuccess = true;
            responseMsg = 'Konumunuz Türkiye dışındaki bir ülke olarak tespit edildi. Servisimiz şu an için yalnızca Türkiye içerisindeki hastaneler için hizmet vermektedir. İlginiz için teşekkür ederiz.';
          }
          else if (city && district) {
            console.log(`-> Request for: ${city} / ${district}`);
            locationSuccess = true;
            const userLocation = { latitude, longitude };
            const nearestHospitals = await findHospitalsFromDb(city, district, userLocation);
            if (nearestHospitals && nearestHospitals.length > 0) {
              await sendMessage(chatId, 'Size en yakın hastaneler listeleniyor.');
              await new Promise(resolve => setTimeout(resolve, 200));
              const initialHospitals = nearestHospitals.slice(0, 5);
              for (let i = 0; i < initialHospitals.length; i++) {
                const hospital = initialHospitals[i];
                var hospitalItemMsg = `Hastane adı: ${hospital.name}\nTip: ${hospital.type}\nAdres: ${hospital.address}\n`;
                if (!hospital.googleMapsUrl || hospital.googleMapsUrl.length < 10) {
                  const addressQuery = queryString.stringify({ query: hospital.address });
                  hospital.googleMapsUrl = `${process.env.GOOGLE_MAPS_URI}&${addressQuery}`;
                }
                hospitalItemMsg += `<a href="${hospital.googleMapsUrl}">Haritada göster</a>`;
                await sendMessage(chatId, hospitalItemMsg, { parse_mode: 'HTML' });
                if (i < initialHospitals.length - 1) {
                  await new Promise(resolve => setTimeout(resolve, 500));
                }
              }
              if (nearestHospitals.length > 5) {
                await sendMessage(chatId, `${city}/${district} için toplam ${nearestHospitals.length} hastane bulundu. Diğer hastaneleri görmek için "Daha Fazla Göster" butonuna tıklayın.`, {
                  reply_markup: {
                    inline_keyboard: [[{ text: 'Daha Fazla Göster', callback_data: 'show_more_hospitals' }]]
                  }
                });
                botContext[chatId] = {
                  remainingHospitals: nearestHospitals.slice(5),
                  timestamp: Date.now()
                };
              }
            } else {
              responseMsg = 'Yakınınızda hastane bulunamadı veya konum bilgisinde bir hata var.';
            }
            try {
              if (process.env.MY_API_URI) {
                const rowData = {
                  date: new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' }),
                  chatId,
                  city,
                  district
                };
                await appendUsageDataToGoogleSheets(rowData);
              }
            } catch (error) { }
          }
        } catch (error) {
          console.error('Hata oluştu:', error);
          responseMsg = 'Servislerde oluşan bir hatadan dolayı şu anda isteğinize yanıt alamadım. Konumu doğru gönderdiğinizden eminseniz tekrar deneyebilirsiniz.';
        }
        if (!locationSuccess) {
          responseMsg = 'Konum bilgisi alınamadı. Lütfen daha sonra tekrar deneyin.';
        }
      } else if (toLowerMessage === '/start' || toLowerMessage.includes('merhaba') || toLowerMessage.includes('selam')) {
        responseMsg = 'Hoş geldiniz!\n\nKonumunuzu bota gönderin ve size en yakın olan hastaneleri bulup göndersin.\n\nNot: Bilgileriniz hiçbir yerde kayıt edilmemektedir.';
      } else if (toLowerMessage === '/yardim' || toLowerMessage === '/help') {
        responseMsg = 'Bu bot konumunuza göre size en yakın hastane bilgilerini bulup göndermeye yarar. Bunun için mevcut konumunuzu bota göndermeniz yeterli. Kişisel verileriniz hiçbir yerde kayıt edilmemektedir.'
      } else if (toLowerMessage === '/developer') {
        responseMsg = 'Bu bot [Osman Koç](https://osmankoc.dev/) tarafından geliştirilmiştir.\n\nEğer bir sorun yaşıyorsanız veya öneriniz varsa info@osmankoc.dev adresine mail olarak iletebilirsiniz.';
      } else if (toLowerMessage === '/contact') {
        responseMsg = 'Bir hata veya öneri bildirmek isterseniz info@osmankoc.dev adresine mail gönderebilirsiniz. Şimdiden teşekkürler!'
      } else if (toLowerMessage === 'ping') {
        responseMsg = 'pong';
      } else if (toLowerMessage === 'test') {
        responseMsg = 'Sensin test :)';
      } else if (toLowerMessage.includes('naber') || toLowerMessage.includes('nasılsın')) {
        responseMsg = 'Size yardımcı olmakla meşgulüm. Ben bir chat botu değil, size yakın olan hastaneleri bulup iletmekle görevliyim. Bu nedenle bu tarz sorularınıza yanıt veremeyebilirim. İlginiz için teşekkür ederim.';
      }
      if (responseMsg !== '') {
        await sendMessage(chatId, responseMsg, { parse_mode: 'HTML' });
      }
    } else if (body.callback_query) {
      const callbackQuery = body.callback_query;
      const chatId = callbackQuery.message.chat.id;
      const data = callbackQuery.data;
      if (data === 'show_more_hospitals' && botContext[chatId] && botContext[chatId].remainingHospitals) {
        const now = Date.now();
        const ctx = botContext[chatId];
        if (!ctx.timestamp || now - ctx.timestamp > 60 * 60 * 1000) { // 1 saat
          delete botContext[chatId];
          await sendMessage(chatId, 'Geçici bellek temizlendi. Lütfen konumunuzu tekrar gönderin.');
          res.status(200).send('OK');
          return;
        }
        const remainingHospitals = ctx.remainingHospitals;
        botContext[chatId].remainingHospitals = remainingHospitals.slice(5);
        botContext[chatId].timestamp = now;
        for (let i = 0; i < Math.min(5, remainingHospitals.length); i++) {
          const hospital = remainingHospitals[i];
          var hospitalItemMsg = `Hastane adı: ${hospital.name}\nTip: ${hospital.type}\nAdres: ${hospital.address}\n`;
          if (!hospital.googleMapsUrl || hospital.googleMapsUrl.length < 10) {
            const addressQuery = queryString.stringify({ query: hospital.address });
            hospital.googleMapsUrl = `${process.env.GOOGLE_MAPS_URI}&${addressQuery}`;
          }
          hospitalItemMsg += `<a href="${hospital.googleMapsUrl}">Haritada göster</a>`;
          await sendMessage(chatId, hospitalItemMsg, { parse_mode: 'HTML' });
          if (i < Math.min(5, remainingHospitals.length) - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
        if (botContext[chatId].remainingHospitals.length > 0) {
          await sendMessage(chatId, 'Daha fazla hastane görmek için tekrar "Daha Fazla Göster" butonuna tıklayın.', {
            reply_markup: {
              inline_keyboard: [[{ text: 'Daha Fazla Göster', callback_data: 'show_more_hospitals' }]]
            }
          });
        } else {
          delete botContext[chatId];
        }
        res.status(200).send('OK');
        return;
      }
    }
    res.status(200).send('OK');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}
