/* Tecnica di base · Mese 1 — webapp per smartphone.
   Due schermate: scelta della seduta e seduta con timer per ogni esercizio.
   Dati: data/mese1.json (generato da tools/genera_dati.py). */
(function () {
  'use strict';

  var CATS = [
    { id: 'pulcini', name: 'Pulcini', year: '2016' },
    { id: 'esordientiB', name: 'Esordienti B', year: '2015' },
    { id: 'esordientiA', name: 'Esordienti A', year: '2014' },
    { id: 'giovanissimiB', name: 'Giovanissimi B', year: '2013' }
  ];

  var app = document.getElementById('app');
  var dati = null;
  var cat = leggi('cat') || 'pulcini';
  var timer = null;   // { ex, restanti, id, wake }

  function leggi(k) { try { return localStorage.getItem('tecnica.' + k); } catch (e) { return null; } }
  function scrivi(k, v) { try { localStorage.setItem('tecnica.' + k, v); } catch (e) { /* niente */ } }

  // Settimane già fatte, una voce per categoria e settimana: { "pulcini-1": true }
  function fatte() {
    try { return JSON.parse(leggi('fatte') || '{}'); } catch (e) { return {}; }
  }
  function eFatta(week) { return fatte()[cat + '-' + week] === true; }
  function segna(week, valore) {
    var f = fatte();
    if (valore) f[cat + '-' + week] = true; else delete f[cat + '-' + week];
    scrivi('fatte', JSON.stringify(f));
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function nodo(html) {
    var t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }
  function mmss(s) {
    return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
  }
  function avviso(msg) {
    var t = document.getElementById('toast');
    t.textContent = msg; t.hidden = false;
    clearTimeout(avviso._t);
    avviso._t = setTimeout(function () { t.hidden = true; }, 2600);
  }

  // ---------- Suono e vibrazione di fine esercizio ----------
  var audio = null;
  function segnale() {
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      if (audio.state === 'suspended') audio.resume();
      for (var i = 0; i < 3; i++) {
        var o = audio.createOscillator(), g = audio.createGain();
        o.type = 'square'; o.frequency.value = 880;
        o.connect(g); g.connect(audio.destination);
        var t = audio.currentTime + i * 0.35;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.4, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
        o.start(t); o.stop(t + 0.32);
      }
    } catch (e) { /* audio non disponibile */ }
    if (navigator.vibrate) { try { navigator.vibrate([300, 150, 300, 150, 300]); } catch (e) { /* niente */ } }
  }
  function sbloccaAudio() {
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      audio.resume();
    } catch (e) { /* niente */ }
  }

  // ---------- Schermo sempre acceso mentre il timer va ----------
  var wake = null;
  function tieniAcceso(on) {
    try {
      if (on && 'wakeLock' in navigator && !wake) {
        navigator.wakeLock.request('screen').then(function (w) {
          wake = w;
          w.addEventListener('release', function () { wake = null; });
        }).catch(function () { /* negato */ });
      } else if (!on && wake) { wake.release(); wake = null; }
    } catch (e) { wake = null; }
  }
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible' && timer) tieniAcceso(true);
  });

  // ---------- Timer di un esercizio ----------
  function fermaTimer() {
    if (!timer) return;
    clearInterval(timer.id);
    var t = timer; timer = null;
    tieniAcceso(false);
    disegnaTimer(t.card, t.ex, t.restanti, false);
    document.title = 'Tecnica di base · Mese 1';
  }

  function avviaTimer(card, ex) {
    fermaTimer();
    sbloccaAudio();
    var totale = ex.minutes * 60;
    var ripresa = parseInt(card.dataset.rest, 10);
    var restanti = ripresa > 0 ? ripresa : totale;
    var scadenza = Date.now() + restanti * 1000;
    timer = { card: card, ex: ex, restanti: restanti, id: 0 };
    tieniAcceso(true);
    timer.id = setInterval(function () {
      var r = Math.round((scadenza - Date.now()) / 1000);
      if (r < 0) r = 0;
      timer.restanti = r;
      disegnaTimer(card, ex, r, true);
      document.title = mmss(r) + ' · ' + ex.title;
      if (r === 0) {
        clearInterval(timer.id); timer = null;
        tieniAcceso(false);
        segnale();
        card.dataset.rest = '';
        card.classList.add('done');
        avviso('Fine: ' + ex.title);
        setTimeout(function () { disegnaTimer(card, ex, totale, false); }, 1500);
        document.title = 'Tecnica di base · Mese 1';
      }
    }, 250);
    disegnaTimer(card, ex, restanti, true);
  }

  function azzera(card, ex) {
    if (timer && timer.card === card) fermaTimer();
    card.dataset.rest = '';
    card.classList.remove('done');
    disegnaTimer(card, ex, ex.minutes * 60, false);
  }

  function disegnaTimer(card, ex, restanti, attivo) {
    var totale = ex.minutes * 60;
    var box = card.querySelector('.timer');
    box.className = 'timer' + (attivo ? ' run' : '') + (attivo && restanti <= 10 ? ' warn' : '');
    box.querySelector('.clock').textContent = mmss(restanti);
    box.querySelector('.bar > i').style.width = (100 * (totale - restanti) / totale) + '%';
    var b = box.querySelector('.play');
    b.className = 'play' + (attivo ? ' pause' : '');
    b.textContent = attivo ? '❚❚' : '▶';
    b.setAttribute('aria-label', attivo ? 'Metti in pausa' : 'Avvia ' + ex.minutes + ' minuti');
    // Niente da azzerare se il timer è intatto: il tasto resta spento.
    box.querySelector('.reset').disabled =
      !attivo && restanti === totale && !card.classList.contains('done');
  }

  // ---------- Schermata 1: scelta della seduta ----------
  function schermataElenco() {
    fermaTimer();
    var c = CATS.filter(function (x) { return x.id === cat; })[0];
    var v = nodo('<div>' +
      '<div class="hdr"><div class="wrap"><h1>Tecnica di base</h1>' +
      '<div class="sub">Mese 1 · quattro sedute da 20 minuti</div></div></div>' +
      '<div class="wrap">' +
      '<div class="section">Categoria</div><div class="pick"></div>' +
      '<div class="section due"><span>Scegli la seduta</span><span class="conta"></span></div>' +
      '<div class="lista"></div>' +
      '<a class="link" href="docs/Piano_trimestrale_tecnica_di_base.pdf" target="_blank" rel="noopener">Apri il piano completo in PDF</a>' +
      '</div></div>');

    var pick = v.querySelector('.pick');
    CATS.forEach(function (x) {
      var b = nodo('<button class="' + (x.id === cat ? 'on' : '') + '">' + esc(x.name) +
        '<span>' + x.year + '</span></button>');
      b.onclick = function () { cat = x.id; scrivi('cat', cat); schermataElenco(); };
      pick.appendChild(b);
    });

    var lista = v.querySelector('.lista');
    var conta = v.querySelector('.conta');
    function aggiornaConta() {
      var n = dati.weeks.filter(function (w) { return eFatta(w.week); }).length;
      conta.textContent = n ? n + ' di ' + dati.weeks.length + ' fatte' : '';
    }

    dati.weeks.forEach(function (w) {
      var s = seduta(w.week);
      if (!s) return;
      var riga = nodo('<div class="week">' +
        '<button class="open">' +
        '<span class="n">SETT<b>' + w.week + '</b></span>' +
        '<span class="txt"><b>' + esc(s.title) + '</b><span>' + esc(s.day) + ' · ' + esc(c.name) + '</span></span>' +
        '</button>' +
        '<button class="check"><span class="ring"></span></button>' +
        '</div>');
      var tasto = riga.querySelector('.check');

      function mostra() {
        var fatta = eFatta(w.week);
        riga.classList.toggle('done', fatta);
        tasto.innerHTML = fatta ? '✅' : '<span class="ring"></span>';
        tasto.setAttribute('aria-pressed', fatta ? 'true' : 'false');
        tasto.setAttribute('aria-label', (fatta ? 'Togli il segno dalla settimana ' : 'Segna come fatta la settimana ') + w.week);
      }
      tasto.onclick = function () {
        segna(w.week, !eFatta(w.week));
        mostra();
        aggiornaConta();
      };
      riga.querySelector('.open').onclick = function () { schermataSeduta(w.week); };

      mostra();
      lista.appendChild(riga);
    });
    aggiornaConta();

    app.replaceChildren(v);
    window.scrollTo(0, 0);
  }

  function seduta(week) {
    return dati.sessions.filter(function (s) { return s.cat === cat && s.week === week; })[0];
  }

  // ---------- Schermata 2: la seduta ----------
  function schermataSeduta(week) {
    fermaTimer();
    var s = seduta(week);
    var w = dati.weeks.filter(function (x) { return x.week === week; })[0];

    var v = nodo('<div>' +
      '<div class="hdr session"><div class="wrap">' +
      '<button class="back">‹ Tutte le sedute</button>' +
      '<h1>' + esc(s.title) + '</h1>' +
      '<div class="meta">Settimana ' + week + ' · ' + esc(s.catName) + ' ' + s.year + ' · ' + esc(s.day) + '</div>' +
      '</div></div>' +
      '<div class="wrap">' +
      '<div class="goal"><b>Obiettivo.</b> ' + esc(s.objective) +
      '<div class="kit">Materiale: ' + esc(s.materials) + '</div></div>' +
      (w && w.note ? '<div class="note">' + esc(w.note) + '</div>' : '') +
      '<div class="section">Tre esercizi da 5 minuti</div>' +
      '<div class="esercizi"></div>' +
      '<p class="tip">Finiti i tre esercizi, ripeti la stessa seduta con il secondo sottogruppo.<br>Il campo non si tocca.</p>' +
      '</div></div>');

    v.querySelector('.back').onclick = schermataElenco;
    var box = v.querySelector('.esercizi');
    s.exercises.forEach(function (ex) {
      var card = nodo('<div class="card">' +
        '<div class="head"><span class="badge">' + ex.n + '</span>' +
        '<h2>' + esc(ex.title) + '</h2></div>' +
        '<figure><img loading="lazy" src="' + esc(ex.img) +
        '" alt="Schema: ' + esc(ex.caption || ex.title) + '"></figure>' +
        '<p class="desc">' + esc(ex.desc) + '</p>' +
        '<div class="timer"><button class="play">▶</button>' +
        '<span class="clock"></span>' +
        '<button class="reset" aria-label="Azzera il timer">↺</button>' +
        '<span class="bar"><i></i></span></div>' +
        '</div>');
      card.querySelector('.play').onclick = function () {
        if (timer && timer.card === card) {
          card.dataset.rest = String(timer.restanti);   // pausa: riparte da qui
          fermaTimer();
        } else {
          avviaTimer(card, ex);
        }
      };
      card.querySelector('.reset').onclick = function () { azzera(card, ex); };
      disegnaTimer(card, ex, ex.minutes * 60, false);
      box.appendChild(card);
    });

    app.replaceChildren(v);
    window.scrollTo(0, 0);
  }

  // ---------- Avvio ----------
  fetch('data/mese1.json')
    .then(function (r) { return r.json(); })
    .then(function (d) { dati = d; schermataElenco(); })
    .catch(function () {
      app.innerHTML = '<div class="wrap"><p class="goal">Non riesco a caricare le sedute. ' +
        'Riapri l\'app quando sei di nuovo online.</p></div>';
    });

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () { /* non disponibile */ });
    });
  }
})();
