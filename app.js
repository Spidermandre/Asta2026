/* Tecnica di base · Piano trimestrale — webapp per smartphone.
   Dati: data/plan.json (estratti dal PDF "Piano trimestrale di tecnica di base"). */
(function () {
  'use strict';

  // ---------- Contenuti fissi del documento ----------
  const CATS = [
    { id: 'pulcini', name: 'Pulcini', year: '2016', day: 'Lunedì' },
    { id: 'esordientiB', name: 'Esordienti B', year: '2015', day: 'Lunedì' },
    { id: 'esordientiA', name: 'Esordienti A', year: '2014', day: 'Martedì' },
    { id: 'giovanissimiB', name: 'Giovanissimi B', year: '2013', day: 'Martedì' }
  ];

  // Struttura fissa dei 20 minuti (dal documento, pag. 3)
  const PHASES = [
    { id: 'intro', name: 'Richiamo dell\'obiettivo', min: 1, ex: 0, hint: 'Una frase sola: devono sapere cosa stanno allenando.' },
    { id: 'ex1', name: 'Esercizio 1', min: 5, ex: 1, hint: 'Sollecitazione percettiva con la palla.' },
    { id: 'change1', name: 'Cambio di postazione', min: 1, ex: 0, hint: 'Il campo è già montato: si spostano solo i bambini.' },
    { id: 'ex2', name: 'Esercizio 2', min: 5, ex: 2, hint: 'Il gesto centrale della lezione.' },
    { id: 'change2', name: 'Cambio di postazione', min: 1, ex: 0, hint: 'Palloni pronti sulla terza postazione.' },
    { id: 'ex3', name: 'Esercizio 3', min: 5, ex: 3, hint: 'Rapidità e coordinazione con la palla.' },
    { id: 'end', name: 'Riepilogo e saluto', min: 2, ex: 0, hint: 'Una domanda ai bambini vale più di dieci correzioni.' }
  ];

  const KIT = [
    { item: 'Palloni misura 4', qty: 12, note: 'per Pulcini, Esordienti B ed Esordienti A' },
    { item: 'Palloni misura 4/5', qty: 12, note: 'per Giovanissimi B' },
    { item: 'Palle morbide di gomma', qty: 8, note: 'fase iniziale a piedi scalzi e lavoro di sensibilità' },
    { item: 'Cinesini piatti', qty: 32, note: '4 colori, 8 per colore: i comandi a colori sono usati spesso' },
    { item: 'Coni medi (30-40 cm)', qty: 18, note: 'serpentine, riferimenti per le finte, perimetri' },
    { item: 'Paletti', qty: 6, note: 'facoltativi, sostituibili con i coni' },
    { item: 'Porticine', qty: 10, note: 'o 20 coni: due cinesini a 1,5 m funzionano benissimo' },
    { item: 'Casacche', qty: 12, note: '2 colori: duelli e situazioni' },
    { item: 'Cerchi', qty: 8, note: 'zone individuali per il palleggio' },
    { item: 'Scala di coordinazione', qty: 1, note: 'facoltativa, sostituibile con 8 cinesini a 40 cm' },
    { item: 'Cronometro e taccuino', qty: 1, note: 'prove misurate delle settimane 1, 4, 10 e 12' }
  ];

  const RULES = [
    ['Elevato tempo di impegno motorio', 'Un pallone a testa ogni volta che è possibile, file di massimo tre bambini, spiegazioni brevi. Il numero di tocchi è il vero motore del miglioramento.'],
    ['Clima sereno', 'L\'errore fa parte dell\'apprendimento, soprattutto nel dribbling. Si corregge il gesto, non il bambino.'],
    ['Orientarsi al compito', 'Si valuta l\'impegno e l\'esecuzione, non il risultato della gara interna.'],
    ['Variabilità della pratica', 'Cambia palloni, distanze, superfici e ritmo. Le varianti indicate in ogni scheda servono esattamente a questo.'],
    ['Includere', 'Chi è indietro ha bisogno di più tempo, non di meno esercizi. Fagli fare la stessa cosa più lentamente, mai una cosa diversa in disparte.']
  ];

  const BAREFOOT = [
    'Controlla il terreno prima di iniziare, togliendo sassi e detriti.',
    'I primi minuti sempre a passo lento, per far adattare la pianta del piede.',
    'Nessuna esercitazione di contrasto o di duello a contatto a piedi scalzi.',
    'Chi ha ferite o non se la sente lavora con le scarpette: mai insistere.',
    'Dalla settimana 6-7, quando la temperatura scende, si passa progressivamente alle scarpette e al pallone regolamentare, mantenendo un esercizio scalzo per seduta finché possibile.'
  ];

  const TESTS = [
    { id: 'p1', name: 'P1 — Conduzione a serpentina', unit: 's', lowerBetter: true, desc: '6 cinesini a 1,5 m su 10 m, guida a serpentina e conclusione in porticina. Due tentativi, si registra il migliore. Penalità di 2 secondi per ogni cono saltato.' },
    { id: 'p2', name: 'P2 — Palleggi consecutivi', unit: 'n', lowerBetter: false, desc: 'Numero massimo di palleggi in 30 secondi, con un rimbalzo consentito per i Pulcini.' },
    { id: 'p3', name: 'P3 — Passaggi precisi', unit: '/10', lowerBetter: false, desc: 'Numero di passaggi che attraversano una porticina di 1,5 m da 8 m (10 m per i Giovanissimi B), su 10 tentativi.' },
    { id: 'p4', name: 'P4 — Conduzione e conclusione', unit: 'gol/5', lowerBetter: false, desc: '5 tentativi di conduzione su 10 m e conclusione in porticina; si conta il numero di gol.' }
  ];

  const GOALS = {
    pulcini: 'Conduce la palla con interno ed esterno alzando lo sguardo, la ferma di suola e riparte, passa e riceve di interno sulle corte distanze, calcia verso un bersaglio scegliendo la precisione invece della potenza e prova una finta nel duello senza paura di sbagliare.',
    esordientiB: 'Domina la palla con quattro superfici, esegue tre cambi di direzione diversi, riceve con il primo tocco orientato, trasmette con precisione su 8-10 m, fa alcuni palleggi consecutivi, conclude con entrambi i piedi e costruisce un dai-e-vai.',
    esordientiA: 'Esegue i gesti in movimento e a velocità sostenuta, riceve già orientato anche con un avversario alle spalle, dosa il peso del passaggio secondo la distanza, controlla una palla a mezza altezza, dispone di tre finte e mantiene la qualità tecnica nel 1 contro 1 e nel 2 contro 1.',
    giovanissimiB: 'Domina la palla ad alta frequenza anche con il piede debole, unisce cambio di direzione e cambio di ritmo, gioca a due tocchi sotto pressione, protegge la palla di spalle e sceglie fra girarsi, scaricare e servire il terzo uomo, conclude scegliendo la superficie in base alla distanza.'
  };

  // ---------- Stato ----------
  const LS = 'tecnica.';
  const load = (k, def) => { try { const v = localStorage.getItem(LS + k); return v === null ? def : JSON.parse(v); } catch (e) { return def; } };
  const save = (k, v) => { try { localStorage.setItem(LS + k, JSON.stringify(v)); } catch (e) { /* storage non disponibile */ } };

  const state = {
    plan: null,
    cat: load('cat', 'pulcini'),
    week: load('week', 1),
    tab: 'seduta'
  };

  const $ = (sel, root) => (root || document).querySelector(sel);
  const el = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pad = (n) => String(n).padStart(2, '0');
  const fmt = (sec) => `${pad(Math.floor(sec / 60))}:${pad(sec % 60)}`;

  function toast(msg, ms) {
    const t = $('#toast'); t.textContent = msg; t.hidden = false;
    clearTimeout(toast._t); toast._t = setTimeout(() => { t.hidden = true; }, ms || 1800);
  }

  const catOf = (id) => CATS.find(c => c.id === id);
  const session = () => state.plan.sessions.find(s => s.cat === state.cat && s.week === state.week);
  const week = () => state.plan.weeks.find(w => w.week === state.week);
  const blockNum = (w) => (w.block.match(/Blocco (\d)/) || [0, 1])[1];

  // ---------- Header ----------
  function renderHeader() {
    const cats = $('#cats'); cats.innerHTML = '';
    CATS.forEach(c => {
      const b = el(`<button class="${c.id === state.cat ? 'active' : ''}">${esc(c.name)}<small>${c.year} · ${c.day.slice(0, 3)}</small></button>`);
      b.onclick = () => { state.cat = c.id; save('cat', c.id); render(); };
      cats.appendChild(b);
    });
    const weeks = $('#weeks'); weeks.innerHTML = '';
    state.plan.weeks.forEach(w => {
      const b = el(`<button class="block${blockNum(w)} ${w.week === state.week ? 'active' : ''}">S${w.week}</button>`);
      b.onclick = () => { state.week = w.week; save('week', w.week); render(); };
      weeks.appendChild(b);
    });
    const act = $('.weeks .active'); if (act) act.scrollIntoView({ inline: 'center', block: 'nearest' });
  }

  // ---------- Vista: Seduta ----------
  function exerciseCard(ex, compact) {
    const c = el(`<div class="card excard">
      <div class="ex-head"><div><div class="ex-num">ESERCIZIO ${ex.n}</div><div class="ex-title">${esc(ex.title)}</div></div><div class="ex-min">${ex.minutes}'</div></div>
      <div class="diagram"><img loading="lazy" src="${esc(ex.img)}" alt="Diagramma: ${esc(ex.caption)}"></div>
      ${ex.caption ? `<div class="caption">${esc(ex.caption)}</div>` : ''}
      <p>${esc(ex.desc)}</p>
      <div class="sect beh"><div class="kicker blue">Comportamenti privilegiati</div><ul>${ex.behaviours.map(b => `<li>${esc(b)}</li>`).join('')}</ul></div>
      ${compact ? '' : `<div class="sect var"><div class="kicker">Varianti</div><div class="small">${esc(ex.variants)}</div></div>
      <div class="sect err"><div class="kicker red">Errore da correggere</div><div class="small">${esc(ex.error)}</div></div>`}
    </div>`);
    return c;
  }

  function viewSeduta(root) {
    const s = session(); const w = week(); const cat = catOf(state.cat);
    root.appendChild(el(`<div class="block-banner">
      <div class="kicker" style="color:#9fb0c8">Settimana ${w.week} di 12</div>
      <div class="title">${esc(w.block)}</div>
      <p>${esc(w.blockDesc)}</p>
    </div>`));

    const head = el(`<div class="card">
      <div class="row"><span class="chip cat-${s.cat}">${esc(s.catName)} ${s.year}</span><span class="chip day">${esc(s.day)}</span><span class="chip gray">20' × 2 turni</span></div>
      <h1 class="title mt8">${esc(s.title)}</h1>
      <div class="sub">${esc(s.ref)}</div>
      <p class="mt12"><span class="label">Obiettivo finale:</span> ${esc(s.objective)}</p>
      <p class="mt4 small"><span class="label">Fattore fisico-motorio:</span> ${esc(s.motor)}</p>
      <p class="mt4 small"><span class="label">Materiale:</span> ${esc(s.materials)}</p>
      ${w.note ? `<div class="note"><b>Nota della settimana.</b> ${esc(w.note)}</div>` : ''}
      <div class="structure">${PHASES.map(p => `<div class="${p.ex ? 'ex' : ''}">${p.min}'<span>${p.ex ? 'Es. ' + p.ex : (p.id === 'intro' ? 'Avvio' : p.id === 'end' ? 'Chiusura' : 'Cambio')}</span></div>`).join('')}</div>
      <button class="btn big mt12" id="go-timer">⏱️ Avvia la seduta con il timer</button>
    </div>`);
    head.querySelector('#go-timer').onclick = () => setTab('timer');
    root.appendChild(head);

    s.exercises.forEach(ex => root.appendChild(exerciseCard(ex, false)));

    root.appendChild(el(`<div class="card" style="border-left:5px solid var(--navy)">
      <div class="kicker">Per chiudere</div><p class="mt4">${esc(s.closing)}</p>
      <p class="mt8 small muted">Ricorda: la seduta va svolta due volte, una per ogni sottogruppo, senza modificare il campo. Scheda a pagina ${s.page} del PDF.</p>
    </div>`));
    if (cat) {
      root.appendChild(el(`<div class="card tight small muted">Traguardo di fine trimestre per ${esc(cat.name)}: ${esc(GOALS[cat.id])}</div>`));
    }
  }

  // ---------- Vista: Timer ----------
  const timer = {
    phase: 0, remaining: PHASES[0].min * 60, running: false, turno: 1, tick: null, lastTs: 0,
    sound: load('sound', true), vibrate: load('vibrate', true), key: null, wakeLock: null
  };

  let audioCtx = null;
  function beep(times, freq) {
    if (timer.sound) {
      try {
        audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        for (let i = 0; i < times; i++) {
          const o = audioCtx.createOscillator(); const g = audioCtx.createGain();
          o.type = 'square'; o.frequency.value = freq || 880;
          o.connect(g); g.connect(audioCtx.destination);
          const t = audioCtx.currentTime + i * 0.35;
          g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.4, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
          o.start(t); o.stop(t + 0.3);
        }
      } catch (e) { /* audio non disponibile */ }
    }
    if (timer.vibrate && navigator.vibrate) { try { navigator.vibrate(Array(times).fill([250, 120]).flat()); } catch (e) { /* ignore */ } }
  }

  async function wakeLock(on) {
    try {
      if (on && 'wakeLock' in navigator && !timer.wakeLock) {
        timer.wakeLock = await navigator.wakeLock.request('screen');
        timer.wakeLock.addEventListener('release', () => { timer.wakeLock = null; });
      } else if (!on && timer.wakeLock) { await timer.wakeLock.release(); timer.wakeLock = null; }
    } catch (e) { timer.wakeLock = null; }
  }
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && timer.running) wakeLock(true); });

  function timerResetIfSessionChanged() {
    const key = state.cat + ':' + state.week;
    if (timer.key !== key) { timer.key = key; timerReset(true); }
  }
  function timerReset(keepTurno) {
    timerStop(); timer.phase = 0; timer.remaining = PHASES[0].min * 60; if (!keepTurno) timer.turno = 1;
  }
  function timerStart() {
    if (timer.running) return;
    timer.running = true; timer.lastTs = Date.now(); wakeLock(true);
    try { audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)(); audioCtx.resume(); } catch (e) { /* ignore */ }
    timer.tick = setInterval(timerTick, 250);
    timerPaint();
  }
  function timerStop() {
    timer.running = false; clearInterval(timer.tick); timer.tick = null; wakeLock(false); timerPaint();
  }
  function timerTick() {
    const now = Date.now(); const elapsed = Math.floor((now - timer.lastTs) / 1000);
    if (elapsed <= 0) return;
    timer.lastTs += elapsed * 1000;
    timer.remaining -= elapsed;
    if (timer.remaining === 10 && PHASES[timer.phase].ex) beep(1, 660);
    if (timer.remaining <= 0) {
      if (timer.phase < PHASES.length - 1) {
        timer.phase += 1; timer.remaining += PHASES[timer.phase].min * 60;
        beep(PHASES[timer.phase].ex ? 2 : 1, 880);
        toast(PHASES[timer.phase].name);
      } else {
        timer.remaining = 0; timerStop(); beep(3, 1040);
        toast('Turno ' + timer.turno + ' completato');
      }
    }
    timerPaint();
  }
  function timerGoto(ph) {
    timer.phase = Math.max(0, Math.min(PHASES.length - 1, ph)); timer.remaining = PHASES[timer.phase].min * 60; timer.lastTs = Date.now(); timerPaint();
  }

  function timerPaint() {
    const root = $('#timer-view'); if (!root) return;
    const s = session(); const ph = PHASES[timer.phase]; const ex = ph.ex ? s.exercises[ph.ex - 1] : null;
    const total = PHASES.reduce((a, p) => a + p.min * 60, 0);
    const elapsedBefore = PHASES.slice(0, timer.phase).reduce((a, p) => a + p.min * 60, 0);
    const elapsed = elapsedBefore + (ph.min * 60 - timer.remaining);
    const done = !timer.running && timer.phase === PHASES.length - 1 && timer.remaining === 0;

    $('.timer-phase', root).textContent = ph.ex ? `Esercizio ${ph.ex} · ${ph.min}'` : `${ph.name} · ${ph.min}'`;
    $('.timer-phase', root).className = 'timer-phase' + (ph.ex ? ' ex' : '');
    $('.timer-name', root).textContent = ex ? ex.title : ph.hint;
    const clock = $('.timer-clock', root);
    clock.textContent = fmt(Math.max(0, timer.remaining));
    clock.className = 'timer-clock' + (done ? ' done' : (timer.remaining <= 10 ? ' warn' : ''));
    $('.progress > div', root).style.width = (100 * (ph.min * 60 - timer.remaining) / (ph.min * 60)) + '%';
    $('.timer-total', root).textContent = `Trascorsi ${fmt(elapsed)} di ${fmt(total)} · Turno ${timer.turno} di 2`;
    root.querySelectorAll('.phases div').forEach((d, i) => { d.className = (PHASES[i].ex ? 'ex ' : '') + (i < timer.phase ? 'done' : i === timer.phase ? 'cur' : ''); });

    const startBtn = $('#t-start', root);
    startBtn.textContent = timer.running ? '⏸ Pausa' : (done ? '✓ Fatto' : (elapsed > 0 ? '▶ Riprendi' : '▶ Avvia'));
    startBtn.className = 'btn big' + (timer.running ? ' secondary' : '');
    $('#t-prev', root).disabled = timer.phase === 0;
    $('#t-next', root).disabled = timer.phase === PHASES.length - 1;

    const exBox = $('.timer-ex', root);
    const key = ex ? ex.img : 'none-' + ph.id;
    if (exBox.dataset.key !== key) {
      exBox.dataset.key = key; exBox.innerHTML = '';
      if (ex) exBox.appendChild(exerciseCard(ex, true));
      else exBox.appendChild(el(`<div class="card tight"><div class="kicker">${esc(ph.name)}</div><p class="mt4">${esc(ph.hint)}</p>${ph.id === 'end' ? `<p class="mt8"><span class="label">Per chiudere:</span> ${esc(s.closing)}</p>` : ''}${ph.id === 'intro' ? `<p class="mt8"><span class="label">Obiettivo:</span> ${esc(s.objective)}</p>` : ''}</div>`));
      const next = PHASES[timer.phase + 1];
      if (next && next.ex) exBox.appendChild(el(`<div class="card tight small muted">Prossimo: <b>${esc(s.exercises[next.ex - 1].title)}</b> (${next.min}')</div>`));
      if (done) exBox.prepend(el(`<div class="card tight" style="background:var(--green-light);border-color:var(--green)"><b>Turno ${timer.turno} completato.</b> ${timer.turno === 1 ? 'Ora tocca al secondo sottogruppo: la stessa identica seduta, il campo non si tocca.' : 'Seduta conclusa per entrambi i sottogruppi.'}</div>`));
    }
    document.title = timer.running ? `${fmt(timer.remaining)} · ${ex ? ex.title : ph.name}` : 'Tecnica di base · Piano trimestrale';
  }

  function viewTimer(root) {
    timerResetIfSessionChanged();
    const s = session();
    const v = el(`<div id="timer-view">
      <div class="card timer-wrap">
        <div class="row" style="justify-content:center"><span class="chip cat-${s.cat}">${esc(s.catName)}</span><span class="chip gray">Settimana ${s.week}</span></div>
        <div class="title mt8" style="font-size:16px">${esc(s.title)}</div>
        <div class="turno"><button data-t="1" class="${timer.turno === 1 ? 'active' : ''}">Turno 1</button><button data-t="2" class="${timer.turno === 2 ? 'active' : ''}">Turno 2</button></div>
        <div class="timer-phase mt12"></div>
        <div class="timer-name"></div>
        <div class="timer-clock">00:00</div>
        <div class="progress"><div></div></div>
        <div class="phases">${PHASES.map(p => `<div class="${p.ex ? 'ex' : ''}"></div>`).join('')}</div>
        <div class="timer-total"></div>
        <div class="btn-row three">
          <button class="btn secondary" id="t-prev">◀</button>
          <button class="btn big" id="t-start">▶ Avvia</button>
          <button class="btn secondary" id="t-next">▶▶</button>
        </div>
        <div class="btn-row"><button class="btn ghost" id="t-reset">↺ Ricomincia</button><button class="btn ghost" id="t-second">Turno 2 ▶</button></div>
        <div class="opts">
          <label><input type="checkbox" id="t-sound" ${timer.sound ? 'checked' : ''}> Suono</label>
          <label><input type="checkbox" id="t-vib" ${timer.vibrate ? 'checked' : ''}> Vibrazione</label>
        </div>
      </div>
      <div class="timer-ex"></div>
    </div>`);
    root.appendChild(v);
    $('#t-start', v).onclick = () => {
      if (timer.running) timerStop();
      else { if (timer.phase === PHASES.length - 1 && timer.remaining === 0) timerReset(true); timerStart(); }
    };
    $('#t-prev', v).onclick = () => timerGoto(timer.phase - 1);
    $('#t-next', v).onclick = () => timerGoto(timer.phase + 1);
    $('#t-reset', v).onclick = () => { timerReset(true); timerPaint(); };
    $('#t-second', v).onclick = () => { timer.turno = 2; timerReset(true); v.querySelectorAll('.turno button').forEach(b => b.classList.toggle('active', b.dataset.t === '2')); timerPaint(); toast('Turno 2: stessa seduta, campo invariato'); };
    v.querySelectorAll('.turno button').forEach(b => b.onclick = () => { timer.turno = +b.dataset.t; v.querySelectorAll('.turno button').forEach(x => x.classList.toggle('active', x === b)); timerPaint(); });
    $('#t-sound', v).onchange = (e) => { timer.sound = e.target.checked; save('sound', timer.sound); if (timer.sound) beep(1, 880); };
    $('#t-vib', v).onchange = (e) => { timer.vibrate = e.target.checked; save('vibrate', timer.vibrate); };
    timerPaint();
  }

  // ---------- Vista: Materiale ----------
  function viewMateriale(root) {
    const w = week();
    const days = [['Lunedì', ['pulcini', 'esordientiB']], ['Martedì', ['esordientiA', 'giovanissimiB']]];
    const card = el(`<div class="card"><div class="kicker green">Da portare in campo · settimana ${w.week}</div></div>`);
    days.forEach(([day, ids]) => {
      card.appendChild(el(`<div class="label mt12">${day}</div>`));
      ids.forEach(id => {
        const c = catOf(id);
        card.appendChild(el(`<div class="mat-cat ${id === state.cat ? 'active' : ''}"><span class="chip cat-${id}">${esc(c.name)}</span><div class="small">${esc(w.materials[id] || '')}</div></div>`));
      });
    });
    if (w.note) card.appendChild(el(`<div class="note">${esc(w.note)}</div>`));
    root.appendChild(card);

    const s = session();
    root.appendChild(el(`<div class="card tight"><div class="kicker">Seduta selezionata · ${esc(s.catName)} · S${s.week}</div><p class="mt4 small">${esc(s.materials)}</p></div>`));

    const checked = load('kit', {});
    const kit = el(`<div class="card"><div class="row" style="justify-content:space-between"><div class="kicker green">Borsa del trimestre</div><button class="btn secondary" style="padding:6px 10px;font-size:13px" id="kit-clear">Azzera</button></div><p class="small muted mt4">Il set completo che copre tutte le 48 sedute. Spunta quello che hai già caricato.</p></div>`);
    KIT.forEach((k, i) => {
      const row = el(`<label class="check ${checked[i] ? 'done' : ''}"><input type="checkbox" ${checked[i] ? 'checked' : ''}><span class="txt">${esc(k.item)}<span class="note-s">${esc(k.note)}</span></span><span class="qty">${k.qty}</span></label>`);
      row.querySelector('input').onchange = (e) => { checked[i] = e.target.checked; save('kit', checked); row.classList.toggle('done', e.target.checked); };
      kit.appendChild(row);
    });
    kit.querySelector('#kit-clear').onclick = () => { save('kit', {}); render(); };
    root.appendChild(kit);

    root.appendChild(el(`<div class="card tight small"><b>Regola pratica di allestimento.</b> Arriva 10 minuti prima e monta contemporaneamente le tre postazioni della seduta: il quadrato centrale, la fila di coni sul lato lungo e le porticine sul fondo. Così i cambi fra un esercizio e l'altro costano 30 secondi invece di tre minuti. «Porticina» = due cinesini o due coni a 1,5 m.</div>`));
  }

  // ---------- Vista: Prove ----------
  const sw = { running: false, start: 0, acc: 0, tick: null };
  function viewProve(root) {
    const cat = catOf(state.cat);
    root.appendChild(el(`<div class="card"><div class="kicker green">Prove misurate</div><p class="small mt4">Settimane 1 e 12: le stesse quattro prove. Settimane 4 e 10: la stessa gara di precisione a bersagli. Conta la differenza fra le due rilevazioni, non il valore assoluto.</p>
      ${TESTS.map(t => `<div class="prova-def small"><b>${esc(t.name)}</b>: ${esc(t.desc)}</div>`).join('')}</div>`));

    // Cronometro rapido per la P1
    const swc = el(`<div class="card"><div class="kicker">Cronometro (per la P1)</div><div class="stopwatch"><div class="sw">00:00.0</div><button class="btn" id="sw-start">Start</button><button class="btn secondary" id="sw-reset">Reset</button></div></div>`);
    const swPaint = () => { const ms = sw.acc + (sw.running ? Date.now() - sw.start : 0); const t = Math.floor(ms / 100); $('.sw', swc).textContent = `${pad(Math.floor(t / 600))}:${pad(Math.floor((t % 600) / 10))}.${t % 10}`; $('#sw-start', swc).textContent = sw.running ? 'Stop' : (sw.acc ? 'Riprendi' : 'Start'); };
    $('#sw-start', swc).onclick = () => { if (sw.running) { sw.acc += Date.now() - sw.start; sw.running = false; clearInterval(sw.tick); } else { sw.running = true; sw.start = Date.now(); sw.tick = setInterval(swPaint, 100); } swPaint(); };
    $('#sw-reset', swc).onclick = () => { sw.running = false; clearInterval(sw.tick); sw.acc = 0; swPaint(); };
    swPaint(); root.appendChild(swc);

    // Griglia per categoria
    const key = 'grid.' + state.cat;
    const rows = load(key, []);
    const grid = el(`<div class="card"><div class="row" style="justify-content:space-between"><div class="kicker green">Griglia · ${esc(cat.name)} ${cat.year}</div></div>
      <div class="table-scroll mt8"><table class="grid"><thead><tr><th>Nome</th>${TESTS.map(t => `<th>${t.id.toUpperCase()} <span class="muted">s1 / s12</span></th>`).join('')}<th></th></tr></thead><tbody></tbody></table></div>
      <div class="add-row"><input id="new-name" placeholder="Nome bambino" autocomplete="off"><button class="btn" id="add">+ Aggiungi</button></div>
      <p class="small muted mt8">I dati restano su questo telefono. Non leggere mai i tempi ad alta voce davanti al gruppo.</p></div>`);
    const tbody = grid.querySelector('tbody');
    const persist = () => save(key, rows);
    const paintRows = () => {
      tbody.innerHTML = '';
      rows.forEach((r, i) => {
        const tr = document.createElement('tr');
        tr.appendChild(el(`<td><input class="name" value="${esc(r.name)}"></td>`));
        tr.querySelector('input').oninput = (e) => { r.name = e.target.value; persist(); };
        TESTS.forEach(t => {
          const a = r[t.id + '_1'] || '', b = r[t.id + '_12'] || '';
          let delta = '';
          if (a !== '' && b !== '' && !isNaN(+a) && !isNaN(+b)) { const d = +b - +a; const good = t.lowerBetter ? d <= 0 : d >= 0; delta = `<span class="delta ${good ? '' : 'neg'}">${d > 0 ? '+' : ''}${Math.round(d * 10) / 10}</span>`; }
          const td = el(`<td><div style="display:flex;gap:3px"><input inputmode="decimal" value="${esc(a)}" data-k="${t.id}_1"><input inputmode="decimal" value="${esc(b)}" data-k="${t.id}_12"></div>${delta}</td>`);
          td.querySelectorAll('input').forEach(inp => inp.onchange = (e) => { r[e.target.dataset.k] = e.target.value.replace(',', '.'); persist(); paintRows(); });
          tr.appendChild(td);
        });
        const del = el(`<td><button class="del" aria-label="Elimina">×</button></td>`);
        del.querySelector('button').onclick = () => { if (confirm(`Eliminare ${r.name || 'questa riga'}?`)) { rows.splice(i, 1); persist(); paintRows(); } };
        tr.appendChild(del); tbody.appendChild(tr);
      });
      if (!rows.length) tbody.appendChild(el(`<tr><td colspan="6" class="muted small" style="padding:10px 4px">Nessun nome ancora. Aggiungi i bambini del gruppo.</td></tr>`));
    };
    grid.querySelector('#add').onclick = () => { const inp = grid.querySelector('#new-name'); const n = inp.value.trim(); if (!n) return; rows.push({ name: n }); inp.value = ''; persist(); paintRows(); };
    grid.querySelector('#new-name').onkeydown = (e) => { if (e.key === 'Enter') grid.querySelector('#add').click(); };
    paintRows(); root.appendChild(grid);

    root.appendChild(el(`<div class="card tight small"><b>Come usare i risultati.</b> Usa il confronto in modo individuale: a ogni bambino, alla fine del trimestre, dedica trenta secondi per dirgli una cosa che è migliorata e una su cui lavorerà nel ciclo successivo.</div>`));
  }

  // ---------- Info (modale) ----------
  function openInfo() {
    const m = el(`<div class="modal"><div class="modal-box">
      <div class="modal-head"><div class="title">Il piano in breve</div><button class="close" aria-label="Chiudi">×</button></div>
      <div class="card"><div class="kicker green">Come funziona</div>
        <ul class="clean small"><li>Una seduta settimanale per categoria, ripetuta su due sottogruppi: 40' = 2 turni identici da 20'.</li>
        <li>Lunedì: Pulcini + Esordienti B. Martedì: Esordienti A + Giovanissimi B.</li>
        <li>Turno: 3 esercizi da 5' + 5' di gestione. Spazio circa 30 × 25 m. Gruppi di 8-12 bambini.</li>
        <li>Il campo si monta una volta sola; fra i due turni non si sposta nulla.</li></ul></div>
      <div class="card"><div class="kicker green">La struttura dei 20 minuti</div>
        <ul class="clean small">${PHASES.map(p => `<li><b>${p.min}'</b> ${esc(p.name)}${p.ex ? '' : ' — ' + esc(p.hint)}</li>`).join('')}</ul></div>
      <div class="card"><div class="kicker green">Cinque regole di conduzione</div>
        <ul class="clean small">${RULES.map(r => `<li><b>${esc(r[0])}.</b> ${esc(r[1])}</li>`).join('')}</ul></div>
      <div class="card"><div class="kicker green">Piedi scalzi e palloni morbidi</div>
        <ul class="clean small">${BAREFOOT.map(b => `<li>${esc(b)}</li>`).join('')}</ul>
        <p class="small muted mt8">Sempre su base volontaria. Se un bambino manifesta fastidio o dolore, si passa immediatamente alle scarpette.</p></div>
      <div class="card"><div class="kicker green">Traguardi di fine trimestre</div>
        ${CATS.map(c => `<p class="small mt8"><span class="chip cat-${c.id}">${esc(c.name)} ${c.year}</span><br>${esc(GOALS[c.id])}</p>`).join('')}</div>
      <div class="card"><div class="kicker green">Far evolvere gli esercizi</div>
        <ul class="clean small"><li><b>Riduci il tempo:</b> lo stesso gesto con due secondi in meno.</li><li><b>Riduci lo spazio:</b> un quadrato più stretto obbliga a tocchi più corti e testa alta.</li><li><b>Aggiungi una scelta:</b> due porticine invece di una, un colore chiamato all'ultimo, un avversario che decide da che lato pressare.</li></ul>
        <p class="small muted mt8">Gruppi oltre 12: sdoppia il percorso dell'esercizio 2 e riduci a 4' gli esercizi 1 e 3. Meno di 8: allunga a 6' gli esercizi 1 e 2.</p></div>
      <div class="card"><div class="kicker green">Fonti</div>
        <p class="small">Esercitazioni tratte dalle schede operative FIGC — Settore Giovanile e Scolastico (Guida Tecnica per le Scuole di Calcio, categorie Pulcini ed Esordienti), Metodologia CFT ed Eserciziario per l'Attività di Base. Descrizioni e disegni originali.</p>
        <a class="btn secondary mt12" style="width:100%" href="docs/Piano_trimestrale_tecnica_di_base.pdf" target="_blank" rel="noopener">📄 Apri il PDF completo</a></div>
    </div></div>`);
    m.querySelector('.close').onclick = () => m.remove();
    m.addEventListener('click', (e) => { if (e.target === m) m.remove(); });
    document.body.appendChild(m);
  }

  // ---------- Router ----------
  const VIEWS = { seduta: viewSeduta, timer: viewTimer, materiale: viewMateriale, prove: viewProve };
  function setTab(tab) { state.tab = tab; render(); window.scrollTo({ top: 0 }); }
  function render() {
    renderHeader();
    document.querySelectorAll('#tabs button').forEach(b => b.classList.toggle('active', b.dataset.tab === state.tab));
    const root = $('#view'); root.innerHTML = '';
    VIEWS[state.tab](root);
  }

  document.querySelectorAll('#tabs button').forEach(b => b.onclick = () => setTab(b.dataset.tab));
  $('#btn-info').onclick = openInfo;

  fetch('data/plan.json').then(r => r.json()).then(plan => {
    state.plan = plan;
    if (!plan.weeks.some(w => w.week === state.week)) state.week = 1;
    if (!CATS.some(c => c.id === state.cat)) state.cat = 'pulcini';
    render();
  }).catch(() => { $('#view').innerHTML = '<div class="card">Impossibile caricare i dati del piano (data/plan.json).</div>'; });

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => { /* http o browser senza supporto */ }); });
  }
})();
