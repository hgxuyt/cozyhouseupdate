(function() {
  'use strict';

  var params = new URLSearchParams(window.location.search);
  var id = params.get('id') || '1';
  var data = null;
  var list = window.APARTMENTS_DATA;

  if (list && list.length) {
    for (var i = 0; i < list.length; i++) {
      if (String(list[i].id) === String(id)) {
        data = list[i];
        break;
      }
    }
  }

  if (!data) {
    var fallback = {
      id: 1,
      title: 'Студия в центре, вид на парк',
      meta: 'Москва, Арбат · до 2 гостей · Посуточно',
      price: 'от 3 500 ₽',
      priceUnit: '/ ночь',
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&h=675&fit=crop',
      description: 'Уютная студия с панорамным видом на парк. Полностью оборудованная кухня, современная мебель, кондиционер и быстрый Wi‑Fi.',
      amenities: ['Wi‑Fi', 'Кондиционер', 'Кухня', 'Стиральная машина', 'Телевизор', 'Утюг']
    };
    data = fallback;
  }

  var titleEl = document.getElementById('apartment-title');
  var metaEl = document.getElementById('apartment-meta');
  var priceEl = document.getElementById('apartment-price');
  var imageEl = document.getElementById('apartment-image');
  var descEl = document.getElementById('apartment-description');
  var amenitiesEl = document.getElementById('apartment-amenities');

  var metaStr = (data.cityName || '') ? (data.cityName + ', ' + data.meta) : data.meta;
  if (data.type) metaStr += ' · ' + (data.type === 'daily' ? 'Посуточно' : 'Длительно');

  if (titleEl) titleEl.textContent = data.title;
  if (metaEl) metaEl.textContent = metaStr;
  if (priceEl) priceEl.innerHTML = data.price + ' <span>' + data.priceUnit + '</span>';
  if (imageEl) {
    imageEl.src = data.image;
    imageEl.alt = data.title;
  }

  // ----- Галерея фотографий квартиры с анимацией -----
  (function initApartmentGallery() {
    if (!imageEl) return;

    var prevBtn = document.getElementById('gallery-prev');
    var nextBtn = document.getElementById('gallery-next');
    var indicator = document.getElementById('gallery-indicator');

    // Собираем список фотографий из apartments-data.js
    var images = [];
    if (Array.isArray(data.images)) {
      data.images.forEach(function(src) {
        if (src && String(src).trim() !== '') images.push(src);
      });
    }
    if (!images.length && data.image && String(data.image).trim() !== '') {
      images.push(data.image);
    }
    if (!images.length && imageEl.src) {
      images.push(imageEl.src);
    }
    if (!images.length) return;

    var currentIndex = 0;

    function updateUi() {
      if (indicator) {
        if (images.length > 1) {
          indicator.textContent = (currentIndex + 1) + ' / ' + images.length;
          indicator.style.display = 'block';
        } else {
          indicator.style.display = 'none';
        }
      }
      if (prevBtn) prevBtn.style.display = images.length > 1 ? 'flex' : 'none';
      if (nextBtn) nextBtn.style.display = images.length > 1 ? 'flex' : 'none';
    }

    function showImage(index, withAnimation) {
      if (!images[index]) return;
      var nextSrc = images[index];

      // Первый показ — без анимации, просто подменяем src
      if (!withAnimation) {
        imageEl.src = nextSrc;
        imageEl.alt = data.title + ' - фото ' + (index + 1);
        imageEl.style.opacity = '1';
        updateUi();
        return;
      }

      // Плавное затухание за счёт transition: opacity в CSS
      imageEl.style.opacity = '0';

      var preloader = new Image();
      preloader.onload = function() {
        imageEl.src = nextSrc;
        imageEl.alt = data.title + ' - фото ' + (index + 1);
        requestAnimationFrame(function() {
          imageEl.style.opacity = '1';
        });
        updateUi();
      };
      preloader.src = nextSrc;
    }

    // Инициализация: показываем первый кадр без анимации
    showImage(0, false);

    function goPrev() {
      currentIndex = (currentIndex - 1 + images.length) % images.length;
      showImage(currentIndex, true);
    }

    function goNext() {
      currentIndex = (currentIndex + 1) % images.length;
      showImage(currentIndex, true);
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', function() {
        if (images.length > 1) goPrev();
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', function() {
        if (images.length > 1) goNext();
      });
    }

    // Перелистывание с клавиатуры
    document.addEventListener('keydown', function(e) {
      if (images.length <= 1) return;
      if (e.key === 'ArrowLeft') {
        goPrev();
      } else if (e.key === 'ArrowRight') {
        goNext();
      }
    });

    updateUi();
  })();

  if (descEl) descEl.innerHTML = '<p>' + (data.description || '') + '</p>';
  if (amenitiesEl && data.amenities && data.amenities.length) {
    amenitiesEl.innerHTML = data.amenities.map(function(a) {
      return '<span class="amenity">' + a + '</span>';
    }).join('');
  }

  document.title = data.title + ' — Уютный Дом';

  var sidebar = document.querySelector('.apartment-sidebar');
  if (sidebar) {
    var btnCall = sidebar.querySelector('a[href^="tel:"]');
    if (btnCall) btnCall.setAttribute('href', 'tel:88005553535');
  }
})();
