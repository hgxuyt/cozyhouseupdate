// Логика для выбора срока аренды и расчета цены
window.initRequestModal = function(apartmentId, apartmentTitle) {
  // Получаем данные о квартире
  const apartment = window.apartmentsData ? window.apartmentsData.find(a => a.id === apartmentId) : null;
  
  if (!apartment) {
    console.warn('Квартира не найдена, используем данные по умолчанию');
    return;
  }
  
  const pricePerNight = apartment.price || 3500;
  const isDaily = apartment.rentalType === 'daily' || !apartment.rentalType;
  const isMonthly = apartment.rentalType === 'monthly';
  
  // Устанавливаем цену за ночь/месяц
  document.getElementById('modal-price-per').textContent = isDaily 
    ? `${pricePerNight} ₽ / ночь` 
    : `${pricePerNight} ₽ / месяц`;
  
  // Показываем соответствующий блок
  const daysBlock = document.getElementById('modal-period-days-block');
  const monthsBlock = document.getElementById('modal-period-months-block');
  
  if (isDaily) {
    daysBlock.style.display = 'block';
    monthsBlock.style.display = 'none';
    populateDaysSelect(pricePerNight);
  } else if (isMonthly) {
    daysBlock.style.display = 'none';
    monthsBlock.style.display = 'block';
    populateMonthsSelect(pricePerNight);
  }
  
  // Обработчик изменения срока
  const daysSelect = document.getElementById('modal-period-days');
  const monthsSelect = document.getElementById('modal-period-months');
  
  if (daysSelect) {
    daysSelect.addEventListener('change', function() {
      calculateTotal(pricePerNight, this.value, 'days');
    });
  }
  
  if (monthsSelect) {
    monthsSelect.addEventListener('change', function() {
      calculateTotal(pricePerNight, this.value, 'months');
    });
  }
  
  // Инициализируем расчет
  const initialPeriod = isDaily ? '1' : '1';
  calculateTotal(pricePerNight, initialPeriod, isDaily ? 'days' : 'months');
};

// Заполняем варианты дней
function populateDaysSelect(pricePerNight) {
  const select = document.getElementById('modal-period-days');
  select.innerHTML = '';
  
  const options = [
    { value: '1', text: '1 ночь' },
    { value: '2', text: '2 ночи' },
    { value: '3', text: '3 ночи' },
    { value: '4', text: '4 ночи' },
    { value: '5', text: '5 ночей' },
    { value: '6', text: '6 ночей' },
    { value: '7', text: '1 неделя' },
    { value: '14', text: '2 недели' },
    { value: '30', text: '1 месяц' }
  ];
  
  options.forEach(option => {
    const optionEl = document.createElement('option');
    optionEl.value = option.value;
    optionEl.textContent = option.text;
    select.appendChild(optionEl);
  });
}

// Заполняем варианты месяцев
function populateMonthsSelect(pricePerMonth) {
  const select = document.getElementById('modal-period-months');
  select.innerHTML = '';
  
  for (let i = 1; i <= 12; i++) {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = i === 1 ? '1 месяц' : `${i} месяцев`;
    select.appendChild(option);
  }
}

// Расчет общей стоимости
function calculateTotal(pricePerUnit, period, unitType) {
  const periodNum = parseInt(period) || 1;
  let total = 0;
  let periodText = '';
  
  if (unitType === 'days') {
    total = pricePerUnit * periodNum;
    periodText = periodNum === 1 ? '1 ночь' : 
                 periodNum < 5 ? `${periodNum} ночи` : 
                 `${periodNum} ночей`;
  } else if (unitType === 'months') {
    total = pricePerUnit * periodNum;
    periodText = periodNum === 1 ? '1 месяц' : 
                 periodNum < 5 ? `${periodNum} месяца` : 
                 `${periodNum} месяцев`;
  }
  
  // Обновляем итоговую сумму
  document.getElementById('modal-total').textContent = `${total.toLocaleString('ru-RU')} ₽`;
  
  // Сохраняем данные для отправки
  window.currentRentalData = {
    pricePerUnit: pricePerUnit,
    period: periodNum,
    unitType: unitType,
    total: total,
    periodText: periodText
  };
}

// Функция для получения данных о периоде аренды
window.getRequestModalPeriodPayload = function() {
  if (!window.currentRentalData) {
    return { rentPeriod: 'Не указан', totalPrice: 'Не рассчитано' };
  }
  
  const data = window.currentRentalData;
  return {
    rentPeriod: data.periodText,
    totalPrice: `${data.total.toLocaleString('ru-RU')} ₽`,
    pricePerUnit: data.pricePerUnit,
    period: data.period
  };
};