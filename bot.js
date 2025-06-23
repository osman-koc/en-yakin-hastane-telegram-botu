// import 'dotenv/config';
// import TelegramBot from 'node-telegram-bot-api';
// import { getCityAndDistrictFromLocation } from './api/openstreetmap-api.js';
// import { appendUsageDataToGoogleSheets } from './api/my-api.js';
// import { findHospitalsFromDb } from './api/find-hospital.js';
// import queryString from 'query-string';

// const token = process.env.TELEGRAM_BOT_TOKEN;
// const bot = new TelegramBot(token, { polling: true });

// const handleError = async (error, chatId) => {
//     if (error.code === 'ETELEGRAM' && error.response && error.response.statusCode === 429) {
//         const retryAfter = error.response.parameters.retry_after;
//         console.log(`429 Too Many Requests. Retry after ${retryAfter} seconds.`);
//         await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
//     } else if (error.code === 'ETELEGRAM' && error.response && error.response.statusCode === 502) {
//         console.log('502 Bad Gateway. Retrying in 5 seconds.');
//         await new Promise(resolve => setTimeout(resolve, 5000));
//     } else {
//         console.error('Error:', error);
//         if (chatId) {
//             await bot.sendMessage(chatId, 'Bir hata oluştu, lütfen tekrar deneyin.');
//         }
//     }
// };

// bot.on('message', async (msg) => {
//     try {
//         const chatId = msg.chat.id;
//         const messageText = msg.text;
//         const toLowerMessage = messageText?.toLowerCase();

//         var responseMsg = '';

//         if (msg && msg.location) {
//             await bot.sendMessage(chatId, 'Konum bilgisi sorgulanıyor.');
//             let locationSuccess = false;

//             const latitude = msg.location.latitude;
//             const longitude = msg.location.longitude;

//             try {
//                 const { country_code, city, district } = await getCityAndDistrictFromLocation(latitude, longitude);
//                 if (!country_code || country_code.toLowerCase() !== 'tr') {
//                     locationSuccess = true;
//                     responseMsg = 'Konumunuz Türkiye dışındaki bir ülke olarak tespit edildi. Servisimiz şu an için yalnızca Türkiye içerisindeki hastaneler için hizmet vermektedir. İlginiz için teşekkür ederiz.';
//                 }
//                 else if (city && district) {
//                     console.log(`-> Request for: ${city} / ${district}`);

//                     locationSuccess = true;

//                     const userLocation = {
//                         latitude: msg.location.latitude,
//                         longitude: msg.location.longitude
//                     };

//                     const nearestHospitals = await findHospitalsFromDb(city, district, userLocation);

//                     if (nearestHospitals && nearestHospitals.length > 0) {
//                         await bot.sendMessage(chatId, 'Size en yakın hastaneler listeleniyor.');

//                         await new Promise(resolve => setTimeout(resolve, 200));
//                         const initialHospitals = nearestHospitals.slice(0, 5);

//                         for (let i = 0; i < initialHospitals.length; i++) {
//                             const hospital = initialHospitals[i];
//                             var hospitalItemMsg = `Hastane adı: ${hospital.name}\nTip: ${hospital.type}\nAdres: ${hospital.address}\n`;

//                             if (hospital.googleMapsUrl === undefined || hospital.googleMapsUrl === null || hospital.googleMapsUrl.length < 10) {
//                                 const addressQuery = queryString.stringify({ query: hospital.address });
//                                 hospital.googleMapsUrl = `${process.env.GOOGLE_MAPS_URI}&${addressQuery}`;
//                             }

//                             hospitalItemMsg += `<a href="${hospital.googleMapsUrl}">Haritada göster</a>`;
//                             await bot.sendMessage(chatId, hospitalItemMsg, { parse_mode: 'HTML' });
//                             if (i < initialHospitals.length - 1) {
//                                 await new Promise(resolve => setTimeout(resolve, 500));
//                             }
//                         }
//                         if (nearestHospitals.length > 5) {
//                             await bot.sendMessage(chatId, `${city}/${district} için toplam ${nearestHospitals.length} hastane bulundu. Diğer hastaneleri görmek için "Daha Fazla Göster" butonuna tıklayın.`, {
//                                 reply_markup: {
//                                     inline_keyboard: [[{ text: 'Daha Fazla Göster', callback_data: 'show_more_hospitals' }]]
//                                 }
//                             });
//                             // Save remaining hospitals in a session variable or a temporary storage
//                             bot.context = { remainingHospitals: nearestHospitals.slice(5) };
//                         }
//                     } else {
//                         responseMsg = 'Yakınınızda hastane bulunamadı veya konum bilgisinde bir hata var.';
//                     }

//                     try {
//                         if (process.env.MY_API_URI) {
//                             const rowData = {
//                                 date: new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' }),
//                                 chatId,
//                                 city,
//                                 district
//                             };
//                             await appendUsageDataToGoogleSheets(rowData);
//                         }
//                     } catch (error) { }
//                 }
//             } catch (error) {
//                 console.error('Hata oluştu:', error);
//                 responseMsg = 'Servislerde oluşan bir hatadan dolayı şu anda isteğinize yanıt alamadım. Konumu doğru gönderdiğinizden eminseniz tekrar deneyebilirsiniz.';
//             }

//             if (!locationSuccess) {
//                 responseMsg = 'Konum bilgisi alınamadı. Lütfen daha sonra tekrar deneyin.';
//             }
//         } else if (toLowerMessage === '/start' || toLowerMessage.includes('merhaba') || toLowerMessage.includes('selam')) {
//             responseMsg = 'Hoş geldiniz!\n\nKonumunuzu bota gönderin ve size en yakın olan hastaneleri bulup göndersin.\n\nNot: Bilgileriniz hiçbir yerde kayıt edilmemektedir.';
//         } else if (toLowerMessage === '/yardim' || toLowerMessage === '/help') {
//             responseMsg = 'Bu bot konumunuza göre size en yakın hastane bilgilerini bulup göndermeye yarar. Bunun için mevcut konumunuzu bota göndermeniz yeterli. Kişisel verileriniz hiçbir yerde kayıt edilmemektedir.'
//         } else if (toLowerMessage === '/developer') {
//             responseMsg = 'Bu bot [Osman Koç](https://osmankoc.dev/) tarafından geliştirilmiştir.\n\nEğer bir sorun yaşıyorsanız veya öneriniz varsa info@osmankoc.dev adresine mail olarak iletebilirsiniz.';
//         } else if (toLowerMessage === '/contact') {
//             responseMsg = 'Bir hata veya öneri bildirmek isterseniz info@osmankoc.dev adresine mail gönderebilirsiniz. Şimdiden teşekkürler!'
//         } else if (toLowerMessage === 'ping') {
//             responseMsg = 'pong';
//         } else if (toLowerMessage === 'test') {
//             responseMsg = 'Sensin test :)';
//         } else if (toLowerMessage.includes('naber') || toLowerMessage.includes('nasılsın')) {
//             responseMsg = 'Size yardımcı olmakla meşgulüm. Ben bir chat botu değil, size yakın olan hastaneleri bulup iletmekle görevliyim. Bu nedenle bu tarz sorularınıza yanıt veremeyebilirim. İlginiz için teşekkür ederim.';
//         }

//         if (responseMsg !== '') {
//             await bot.sendMessage(chatId, responseMsg, { parse_mode: 'HTML' });
//         }
//     } catch (error) {
//         await handleError(error, msg.chat.id);
//     }
// });

// bot.on('callback_query', async (callbackQuery) => {
//     const chatId = callbackQuery.message.chat.id;
//     const data = callbackQuery.data;

//     if (data === 'show_more_hospitals' && bot.context && bot.context.remainingHospitals) {
//         const remainingHospitals = bot.context.remainingHospitals;
//         bot.context.remainingHospitals = remainingHospitals.slice(5);

//         for (let i = 0; i < Math.min(5, remainingHospitals.length); i++) {
//             const hospital = remainingHospitals[i];
//             var hospitalItemMsg = `Hastane adı: ${hospital.name}\nTip: ${hospital.type}\nAdres: ${hospital.address}\n`;

//             if (hospital.googleMapsUrl === undefined || hospital.googleMapsUrl === null || hospital.googleMapsUrl.length < 10) {
//                 const addressQuery = queryString.stringify({ query: hospital.address });
//                 hospital.googleMapsUrl = `${process.env.GOOGLE_MAPS_URI}&${addressQuery}`;
//             }

//             hospitalItemMsg += `<a href="${hospital.googleMapsUrl}">Haritada göster</a>`;
//             await bot.sendMessage(chatId, hospitalItemMsg, { parse_mode: 'HTML' });
//             if (i < Math.min(5, remainingHospitals.length) - 1) {
//                 await new Promise(resolve => setTimeout(resolve, 500));
//             }
//         }

//         if (bot.context.remainingHospitals.length > 0) {
//             await bot.sendMessage(chatId, 'Daha fazla hastane görmek için tekrar "Daha Fazla Göster" butonuna tıklayın.', {
//                 reply_markup: {
//                     inline_keyboard: [[{ text: 'Daha Fazla Göster', callback_data: 'show_more_hospitals' }]]
//                 }
//             });
//         } else {
//             bot.context = {};
//         }
//     }
// });
