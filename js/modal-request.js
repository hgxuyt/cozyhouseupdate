/**
 * Модальное окно заявки: выбор срока аренды и автоматический расчёт стоимости.
 */
(function() {
  'use strict';

  function formatPrice(n) {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₽';
  }

  function getApartmentById(id) {
    var data = window.APARTMENTS_DATA;
    if (!data) return null;
    for (var i = 0; i < data.length; i++) {
      if (String(data[i].id) === String(id)) return data[i];
    }
    return null;
  }

  function updateTotal() {
    var idEl = document.getElementById('modal-apartment-id');
    var apartment = idEl ? getApartmentById(idEl.value) : null;
    if (!apartment) return;
    var totalEl = document.getElementById('modal-total');
    var daysBlock = document.getElementById('modal-period-days-block');
    var monthsBlock = document.getElementById('modal-period-months-block');
    if (!totalEl) return;
    var total = 0;
    if (apartment.type === 'daily' && daysBlock && daysBlock.style.display !== 'none') {
      var daysSelect = document.getElementById('modal-period-days');
      var days = daysSelect ? parseInt(daysSelect.value, 10) : 1;
      total = (apartment.priceNight || 0) * days;
    } else if (apartment.type === 'long' && monthsBlock && monthsBlock.style.display !== 'none') {
      var monthsSelect = document.getElementById('modal-period-months');
      var months = monthsSelect ? parseInt(monthsSelect.value, 10) : 1;
      total = (apartment.priceMonth || 0) * months;
    }
    totalEl.textContent = formatPrice(total);
  }

  window.initRequestModal = function(apartmentId, apartmentTitle) {
    var periodBlock = document.getElementById('modal-period-block');
    var daysBlock = document.getElementById('modal-period-days-block');
    var monthsBlock = document.getElementById('modal-period-months-block');
    var pricePerEl = document.getElementById('modal-price-per');
    var totalEl = document.getElementById('modal-total');
    var apartmentIdInput = document.getElementById('modal-apartment-id');
    if (apartmentIdInput) apartmentIdInput.value = apartmentId || '';

    if (!periodBlock) return;

    if (!apartmentId) {
      periodBlock.style.display = 'none';
      return;
    }

    var apartment = getApartmentById(apartmentId);
    if (!apartment) {
      periodBlock.style.display = 'none';
      return;
    }

    periodBlock.style.display = 'block';

    if (apartment.type === 'daily') {
      if (daysBlock) daysBlock.style.display = 'block';
      if (monthsBlock) monthsBlock.style.display = 'none';
      if (pricePerEl) pricePerEl.textContent = formatPrice(apartment.priceNight || 0) + ' / ночь';
      var daysSelect = document.getElementById('modal-period-days');
      if (daysSelect) {
        daysSelect.innerHTML = '';
        for (var d = 1; d <= 31; d++) {
          var opt = document.createElement('option');
          opt.value = d;
          opt.textContent = d + ' ' + (d === 1 ? 'ночь' : d < 5 ? 'ночи' : 'ночей');
          daysSelect.appendChild(opt);
        }
        daysSelect.addEventListener('change', updateTotal);
        updateTotal();
      }
    } else {
      if (daysBlock) daysBlock.style.display = 'none';
      if (monthsBlock) monthsBlock.style.display = 'block';
      if (pricePerEl) pricePerEl.textContent = formatPrice(apartment.priceMonth || 0) + ' / месяц';
      var monthsSelect = document.getElementById('modal-period-months');
      if (monthsSelect) {
        monthsSelect.innerHTML = '';
        for (var m = 1; m <= 12; m++) {
          var optM = document.createElement('option');
          optM.value = m;
          optM.textContent = m + ' ' + (m === 1 ? 'месяц' : m < 5 ? 'месяца' : 'месяцев');
          monthsSelect.appendChild(optM);
        }
        monthsSelect.addEventListener('change', updateTotal);
        updateTotal();
      }
    }
  };

  window.getRequestModalPeriodPayload = function() {
    var idEl = document.getElementById('modal-apartment-id');
    var apartmentId = idEl ? idEl.value : '';
    if (!apartmentId) return {};
    var apartment = getApartmentById(apartmentId);
    if (!apartment) return {};
    var totalEl = document.getElementById('modal-total');
    var totalText = totalEl ? totalEl.textContent : '';
    var periodText = '';
    if (apartment.type === 'daily') {
      var ds = document.getElementById('modal-period-days');
      var days = ds ? parseInt(ds.value, 10) : 0;
      periodText = days + ' ' + (days === 1 ? 'ночь' : days < 5 ? 'ночи' : 'ночей');
    } else {
      var ms = document.getElementById('modal-period-months');
      var months = ms ? parseInt(ms.value, 10) : 0;
      periodText = months + ' ' + (months === 1 ? 'месяц' : months < 5 ? 'месяца' : 'месяцев');
    }
    return { rentPeriod: periodText, totalPrice: totalText };
  };
})();
