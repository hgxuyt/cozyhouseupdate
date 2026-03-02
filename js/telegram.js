// Функция для сохранения бронирования в базу данных
window.saveBookingToDatabase = function(data) {
  // Отправляем данные на сервер бота для сохранения в базу
  fetch('http://localhost:3000/api/save-booking', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      apartmentId: data.apartmentId || null,
      apartmentTitle: data.apartmentTitle || 'Не указано',
      phone: data.phone || 'Не указан',
      name: data.name || 'Не указано',
      rentPeriod: data.rentPeriod || 'Не указан',
      totalPrice: data.totalPrice || 'Не указана'
    })
  })
  .then(response => response.json())
  .then(result => {
    if (result.success) {
      console.log('Бронирование сохранено в базе данных');
    } else {
      console.error('Ошибка сохранения в базу:', result.error);
    }
  })
  .catch(error => {
    console.error('Ошибка сети при сохранении:', error);
  });
};

// Отправка данных в Telegram и сохранение в базу
window.sendToTelegram = function(data, onSuccess, onError) {
  const config = window.telegramConfig || {};
  
  if (!config.botToken || !config.chatId) {
    console.error('Telegram config not found');
    if (onError) onError('Конфигурация Telegram не настроена');
    return;
  }

  // Форматируем сообщение
  let message = '📋 *Новая заявка на аренду*\n\n';
  
  // Основные поля
  message += `*Имя:* ${data.name || 'Не указано'}\n`;
  message += `*Телефон:* ${data.phone || 'Не указан'}\n`;
  
  // Дополнительные поля
  if (data.apartmentTitle) {
    message += `*Квартира:* ${data.apartmentTitle}\n`;
  }
  
  if (data.rentPeriod) {
    message += `*Срок аренды:* ${data.rentPeriod}\n`;
  }
  
  if (data.totalPrice) {
    message += `*Сумма:* ${data.totalPrice} ₽\n`;
  }
  
  if (data.source) {
    message += `*Источник:* ${data.source}\n`;
  }
  
  message += `\n📅 *Время:* ${new Date().toLocaleString('ru-RU')}`;
  
  // Кодируем сообщение для URL
  const url = `${config.apiUrl}${config.botToken}/sendMessage`;
  
  // Отправляем запрос
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: config.chatId,
      text: message,
      parse_mode: 'Markdown'
    })
  })
  .then(response => response.json())
  .then(result => {
    if (result.ok) {
      console.log('Сообщение отправлено в Telegram');
      
      // Дополнительно сохраняем в базу данных через прямой запрос
      saveBookingToDatabase(data);
      
      if (onSuccess) onSuccess();
    } else {
      console.error('Ошибка Telegram:', result);
      if (onError) onError(result.description || 'Ошибка отправки');
    }
  })
  .catch(error => {
    console.error('Ошибка сети:', error);
    if (onError) onError('Ошибка сети при отправке');
  });
};