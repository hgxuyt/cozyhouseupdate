(function() {
  'use strict';

  var data = window.APARTMENTS_DATA || [];
  var grid = document.getElementById('catalog-grid');
  if (!grid) return;

  function renderCard(apt) {
    var badge = apt.type === 'daily' ? 'Посуточно' : 'Длительно';
    var badgeClass = apt.type === 'daily' ? 'card-badge' : 'card-badge card-badge-long';
    var meta = apt.cityName + ', ' + apt.meta;
    var priceSpan = apt.type === 'daily' ? '/ ночь' : '/ месяц';
    var card = document.createElement('div');
    card.className = 'card-wrapper animate-on-scroll';
    card.setAttribute('data-city', apt.city);
    card.setAttribute('data-type', apt.type);
    card.innerHTML =
      '<a href="apartment.html?id=' + apt.id + '" class="card-link">' +
        '<div class="card-image">' +
          '<img src="' + apt.image + '" alt="' + apt.title + '">' +
          '<span class="' + badgeClass + '">' + badge + '</span>' +
        '</div>' +
        '<div class="card-body">' +
          '<h3>' + apt.title + '</h3>' +
          '<p class="card-meta">' + meta + '</p>' +
          '<p class="card-price">' + apt.price + ' <span>' + priceSpan + '</span></p>' +
        '</div>' +
      '</a>' ;
    return card;
  }

  function render() {
    grid.innerHTML = '';
    data.forEach(function(apt) {
      grid.appendChild(renderCard(apt));
    });
    initRequestButtons();
    initScrollObserver();
  }

  function filterCards() {
    var cityActive = document.querySelector('#filter-city .filter-btn.active');
    var typeActive = document.querySelector('#filter-type .filter-btn.active');
    var cityFilter = cityActive ? cityActive.getAttribute('data-filter') : 'all';
    var typeFilter = typeActive ? typeActive.getAttribute('data-filter') : 'all';
    var cards = grid.querySelectorAll('.card-wrapper');
    cards.forEach(function(card) {
      var city = card.getAttribute('data-city');
      var type = card.getAttribute('data-type');
      var showCity = cityFilter === 'all' || city === cityFilter;
      var showType = typeFilter === 'all' || type === typeFilter;
      card.style.display = showCity && showType ? '' : 'none';
      if (showCity && showType) card.classList.add('visible');
    });
  }

  function initRequestButtons() {
    grid.querySelectorAll('.btn-request').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        var id = btn.getAttribute('data-id') || '';
        var title = btn.getAttribute('data-title') || '';
        openModal(id, title);
      });
    });
  }

  function openModal(apartmentId, apartmentTitle) {
    var overlay = document.getElementById('modal-overlay');
    var form = document.getElementById('modal-form');
    var titleInput = document.getElementById('modal-apartment-title');
    var infoEl = document.getElementById('modal-apartment-info');
    if (overlay) {
      if (titleInput) titleInput.value = apartmentTitle || '';
      if (infoEl) {
        infoEl.style.display = apartmentTitle ? 'block' : 'none';
        infoEl.textContent = apartmentTitle ? 'Квартира: ' + apartmentTitle : '';
      }
      if (form) form.reset();
      if (typeof window.initRequestModal === 'function') {
        window.initRequestModal(apartmentId, apartmentTitle);
      }
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeModal() {
    var overlay = document.getElementById('modal-overlay');
    if (overlay) {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-overlay').addEventListener('click', function(e) {
    if (e.target === this) closeModal();
  });

  document.getElementById('modal-form').addEventListener('submit', function(e) {
    e.preventDefault();
    var name = document.getElementById('modal-name').value.trim();
    var phone = document.getElementById('modal-phone').value.trim();
    var apartmentTitle = document.getElementById('modal-apartment-title').value.trim();
    var payload = { name: name, phone: phone, source: 'Модальное окно (карточка)' };
    if (apartmentTitle) payload.apartmentTitle = apartmentTitle;
    if (typeof window.getRequestModalPeriodPayload === 'function') {
      var periodData = window.getRequestModalPeriodPayload();
      if (periodData.rentPeriod) payload.rentPeriod = periodData.rentPeriod;
      if (periodData.totalPrice) payload.totalPrice = periodData.totalPrice;
    }
    if (typeof window.sendToTelegram === 'function') {
      window.sendToTelegram(payload, function() {
        closeModal();
        alert('Заявка отправлена! Мы перезвоним вам в ближайшее время.');
      }, function(err) {
        alert('Не удалось отправить заявку.\n\n' + (err || '') + '\n\nПозвоните нам: 8 800 555-35-35');
      });
    } else {
      closeModal();
      alert('Заявка принята! Для получения заявок в Telegram запустите сервер: npm start');
    }
  });

  document.querySelectorAll('#filter-city .filter-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('#filter-city .filter-btn').forEach(function(b) { b.classList.remove('active'); });
      this.classList.add('active');
      filterCards();
    });
  });
  document.querySelectorAll('#filter-type .filter-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('#filter-type .filter-btn').forEach(function(b) { b.classList.remove('active'); });
      this.classList.add('active');
      filterCards();
    });
  });

  function initScrollObserver() {
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { rootMargin: '0px 0px -60px 0px', threshold: 0.1 });
    grid.querySelectorAll('.card-wrapper').forEach(function(el) { observer.observe(el); });
  }

  var typeParam = new URLSearchParams(window.location.search).get('type');
  var cityParam = new URLSearchParams(window.location.search).get('city');
  if (typeParam === 'daily' || typeParam === 'long') {
    var typeBtn = document.querySelector('#filter-type .filter-btn[data-filter="' + typeParam + '"]');
    if (typeBtn) {
      document.querySelectorAll('#filter-type .filter-btn').forEach(function(b) { b.classList.remove('active'); });
      typeBtn.classList.add('active');
    }
  }
  if (cityParam && ['moscow', 'piter', 'sochi', 'mytishi', 'korolev'].indexOf(cityParam) !== -1) {
    var cityBtn = document.querySelector('#filter-city .filter-btn[data-filter="' + cityParam + '"]');
    if (cityBtn) {
      document.querySelectorAll('#filter-city .filter-btn').forEach(function(b) { b.classList.remove('active'); });
      cityBtn.classList.add('active');
    }
  }

  render();
  filterCards();
})();
