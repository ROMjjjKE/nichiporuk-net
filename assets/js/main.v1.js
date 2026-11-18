/* Ничипорук: меню, аккордеон, разбор симптома, план покрытия, калькулятор точек, заявка */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };

  /* меню */
  var drawer = $('drawer'), burger = $('burger'), closeBtn = $('drawerClose'), lastFocus = null;
  function openD() {
    lastFocus = document.activeElement;
    drawer.setAttribute('data-open', 'true');
    document.body.classList.add('is-locked');
    if (burger) burger.setAttribute('aria-expanded', 'true');
    var f = drawer.querySelector('a,button'); if (f) f.focus();
  }
  function closeD() {
    if (!drawer) return;
    drawer.setAttribute('data-open', 'false');
    document.body.classList.remove('is-locked');
    if (burger) burger.setAttribute('aria-expanded', 'false');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  if (burger) burger.addEventListener('click', openD);
  if (closeBtn) closeBtn.addEventListener('click', closeD);
  if (drawer) {
    drawer.addEventListener('click', function (e) { if (e.target === drawer) closeD(); });
    document.addEventListener('keydown', function (e) {
      if (drawer.getAttribute('data-open') !== 'true') return;
      if (e.key === 'Escape') { closeD(); return; }
      if (e.key === 'Tab') {
        var f = drawer.querySelectorAll('a,button');
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 1099 && drawer.getAttribute('data-open') === 'true') closeD();
    });
  }

  /* аккордеон */
  document.querySelectorAll('.faq__q').forEach(function (b) {
    b.addEventListener('click', function () {
      var it = b.parentElement, open = it.getAttribute('data-open') === 'true';
      document.querySelectorAll('.faq__i').forEach(function (x) { x.setAttribute('data-open', 'false'); });
      it.setAttribute('data-open', open ? 'false' : 'true');
    });
  });

  /* разбор симптома */
  var SYM = {
    far: { t: 'Дальняя комната без сигнала', cause: 'Роутер стоит в прихожей или за несущей стеной, диапазон 2,4 ГГц забит соседями, мощность выставлена неверно.',
      fix: ['Замер уровня сигнала по комнатам', 'Перенос роутера в точку с прямой видимостью', 'Вторая точка mesh или провод в дальнюю комнату', 'Настройка каналов и ширины канала 5 ГГц'] },
    video: { t: 'Интернет есть, видео тормозит', cause: 'Часто дело не в провайдере: старый роутер с портом 100 Мбит, слабый сигнал или перегруженный канал.',
      fix: ['Проверка реальной скорости по кабелю и по Wi-Fi', 'Замена/настройка роутера под тариф', 'Разделение 2,4 и 5 ГГц по устройствам', 'Кабель для ТВ и стационарных устройств'] },
    wires: { t: 'Провода по полу, ТВ некуда включить', cause: 'Сеть прокладывали после ремонта и «как получилось»: нет интернет-розеток, модему не хватает питания.',
      fix: ['Прокладка кабеля по плинтусу или в кабель-канале', 'Установка и расключение интернет-розеток', 'Розетки за ТВ: питание и сеть', 'Скрытая трасса до места модема'] },
    mesh: { t: 'Купил mesh, лучше не стало', cause: 'Узлы стоят слишком далеко друг от друга, за бетоном или на полу, и соединяются по воздуху через два перекрытия.',
      fix: ['Расстановка узлов по уровню сигнала', 'Соединение узлов кабелем (wired backhaul)', 'Отключение лишних точек и «умного» roaming', 'Проверка, что клиенты переключаются между узлами'] },
    tvwifi: { t: 'Телевизор не подключается к Wi-Fi', cause: 'Слабый сигнал в зоне ТВ, устаревшая прошивка или несовместимый стандарт шифрования.',
      fix: ['Настройка Smart TV и обновление прошивки', 'Кабель вместо Wi-Fi для стабильного 4K', 'Настройка IPTV и приложения', 'Проверка пульта и «умных» функций'] },
    cam: { t: 'Нужна камера или умный дом', cause: 'В точке установки нет ни питания, ни сети, а Wi-Fi там не добивает.',
      fix: ['Подготовка трассы и питания', 'Камера по PoE или Wi-Fi с усилением', 'Настройка записи и удалённого доступа', 'Умные устройства: свет, розетки, датчики'] }
  };
  var diag = $('diag');
  if (diag) {
    var out = $('diagOut');
    function draw(key) {
      var s = SYM[key];
      out.innerHTML = '<span class="mono">Что происходит</span><h3>' + s.t + '</h3><p>' + s.cause + '</p>' +
        '<span class="mono" style="margin-top:4px">Что делаю</span><ul class="list">' +
        s.fix.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul>' +
        '<a class="btn mt18" href="https://wa.me/375297960275?text=' + encodeURIComponent('Здравствуйте! Проблема: ' + s.t + '.') + '" target="_blank" rel="noopener">Обсудить в WhatsApp</a>';
    }
    diag.querySelectorAll('button').forEach(function (b) {
      b.addEventListener('click', function () {
        diag.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
        b.setAttribute('aria-pressed', 'true');
        draw(b.getAttribute('data-s'));
      });
    });
    var first = diag.querySelector('button');
    if (first) { first.setAttribute('aria-pressed', 'true'); draw(first.getAttribute('data-s')); }
  }

  /* план покрытия */
  var planOut = $('planOut'), planGrid = document.querySelector('.plan__grid');
  if (planOut && planGrid) {
    var ROOM = {
      living: { n: 'Кухня-гостиная', lvl: 4, d: 'Роутер здесь или рядом: сигнал уверенный, 4K по Wi-Fi работает без буферизации.', r: 'Оставляем как есть, ТВ можно подключить кабелем для стабильности.' },
      bedroom: { n: 'Спальня', lvl: 2, d: 'Одна несущая стена и зеркальный шкаф: 5 ГГц почти не проходит, 2,4 ГГц даёт 1–2 палки.', r: 'Вторая точка mesh за стеной или кабель в спальню с розеткой RJ-45.' },
      kids: { n: 'Детская', lvl: 3, d: 'Сигнал есть, но вечером падает: соседние сети на 2,4 ГГц забивают канал.', r: 'Перевод устройств на 5 ГГц, настройка канала, при необходимости — точка mesh.' },
      office: { n: 'Кабинет', lvl: 3, d: 'Работает, но для звонков и больших файлов нужен ровный канал.', r: 'Кабель до рабочего места: 1 Гбит/с вместо Wi-Fi.' },
      bath: { n: 'Санузел', lvl: 2, d: 'Плитка и вентканал гасят сигнал, вода и металл добавляют потерь.', r: 'Не критично для телефона, но музыка и «умная» колонка потребуют точки рядом.' },
      loggia: { n: 'Лоджия и балкон', lvl: 1, d: 'Двойное остекление и несущая стена: сигнала почти нет.', r: 'Точка mesh у окна или уличная точка, если нужен Wi-Fi на балконе.' }
    };
    function room(key) {
      var r = ROOM[key];
      planOut.innerHTML = '<h3>' + r.n + ' · ' + r.lvl + ' из 4</h3><p>' + r.d + '</p>' +
        '<p style="color:#0A7D52"><b>Решение:</b> ' + r.r + '</p>';
      planGrid.querySelectorAll('.plan__room').forEach(function (b) {
        b.setAttribute('aria-pressed', b.getAttribute('data-room') === key ? 'true' : 'false');
      });
    }
    planGrid.querySelectorAll('.plan__room').forEach(function (b) {
      b.addEventListener('click', function () { room(b.getAttribute('data-room')); });
    });
    var def = planGrid.querySelector('.plan__room');
    if (def) room(def.getAttribute('data-room'));
  }

  /* калькулятор точек Wi-Fi */
  var calc = $('calcOut');
  if (calc && $('cArea')) {
    function num() {
      var area = +$('cArea').value, walls = $('cWalls').value, floors = +$('cFloor').value,
        devices = +$('cDev').value, tv = $('cTv').value === 'yes';
      var pts = 1;
      if (area > 60) pts = 2;
      if (area > 100) pts = 3;
      if (area > 150) pts = 4;
      if (walls === 'concrete') pts += 1;
      if (walls === 'brick') pts += (area > 100 ? 1 : 0);
      if (floors > 1) pts += (floors - 1);
      if (devices > 20) pts += 1;
      if (tv && area > 100) pts += 1;
      pts = Math.max(1, Math.min(5, pts));
      var type = pts === 1 ? 'Один роутер' : (pts === 2 ? 'Роутер + 1 точка mesh' : 'Mesh-система из ' + pts + ' точек');
      var cable = pts >= 3 || tv;
      var works = [];
      works.push(pts === 1 ? 'Настройка роутера и каналов' : 'Расстановка ' + pts + ' точек по уровню сигнала');
      if (cable) works.push('Кабель между точками — узлы работают по проводу, а не по воздуху');
      if (tv) works.push('Отдельный кабель для ТВ и IPTV: 4K без буферизации');
      if (walls === 'concrete') works.push('Учёт несущих стен: точки ставим по разные стороны');
      if (floors > 1) works.push('Проверка перекрытий между этажами');
      works.push('Замер уровня сигнала до и после');
      return { pts: pts, type: type, works: works, cable: cable };
    }
    function render() {
      var r = num();
      calc.innerHTML = '<span class="mono">Ориентир по оборудованию</span>' +
        '<div class="calc__num">' + r.pts + ' <span>' + (r.pts === 1 ? 'точка' : (r.pts < 5 ? 'точки' : 'точек')) + '</span></div>' +
        '<h3>' + r.type + '</h3>' +
        '<ul class="calc__list">' + r.works.map(function (w) { return '<li>' + w + '</li>'; }).join('') + '</ul>' +
        (r.cable ? '<div class="note"><b>Провод важнее мощности:</b> если точки можно соединить кабелем — соединение будет стабильнее любых «усилителей».</div>' : '') +
        '<a class="btn" href="https://wa.me/375297960275?text=' + encodeURIComponent('Здравствуйте! Расчёт покрытия: ' + $('cArea').selectedOptions[0].textContent + ', ' + $('cWalls').selectedOptions[0].textContent + ', этажей: ' + $('cFloor').selectedOptions[0].textContent + '. Ориентир — ' + r.type + '.') + '" target="_blank" rel="noopener">Проверить на месте</a>';
    }
    ['cArea', 'cWalls', 'cFloor', 'cDev', 'cTv'].forEach(function (id) { $(id).addEventListener('change', render); });
    render();
  }

  /* чек-лист */
  var chk = $('remCheck'), chkOut = $('remOut');
  if (chk && chkOut) {
    var boxes = chk.querySelectorAll('input');
    function upd() {
      var on = [];
      boxes.forEach(function (b) { if (b.checked) on.push(b.value); });
      chkOut.innerHTML = '<span class="mono">Учтено</span><h3>' + on.length + ' из ' + boxes.length + '</h3>' +
        '<p style="color:#2C3039;font-size:15px">' + (on.length === boxes.length
          ? 'Всё продумано. Такой объект ведём без переделок: сначала трассы, потом отделка.'
          : 'Отметьте, что уже решено. По остальному подскажу на замере, пока стены открыты.') + '</p>' +
        (on.length ? '<div class="card__tags">' + on.map(function (t) { return '<span class="tag">' + t + '</span>'; }).join('') + '</div>' : '') +
        '<a class="btn" href="https://wa.me/375297960275?text=' + encodeURIComponent('Здравствуйте! Разводка сети на этапе ремонта. Учтено: ' + (on.join(', ') || 'пока ничего')) + '" target="_blank" rel="noopener">Обсудить разводку</a>';
    }
    boxes.forEach(function (b) { b.addEventListener('change', upd); });
    upd();
  }

  /* форма */
  var form = $('reqForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var g = function (id) { var el = $(id); return el && el.value ? el.value.trim() : ''; };
      if (!g('fName')) { $('fName').focus(); return; }
      if (!g('fTel')) { $('fTel').focus(); return; }
      var text = 'Заявка с сайта\nИмя: ' + g('fName') + '\nТелефон: ' + g('fTel') + '\nРабота: ' + g('fWhat') +
        (g('fMsg') ? '\nДетали: ' + g('fMsg') : '');
      window.open('https://wa.me/375297960275?text=' + encodeURIComponent(text), '_blank', 'noopener');
    });
  }
})();
