# Tecnica di base · Mese 1 (webapp)

Webapp per smartphone che porta in campo il primo mese del
[Piano trimestrale di tecnica di base](docs/Piano_trimestrale_tecnica_di_base.pdf):
4 settimane, 16 sedute, 48 esercizi per Pulcini 2016, Esordienti B 2015,
Esordienti A 2014 e Giovanissimi B 2013.

## Come si usa

Due sole schermate, nessun menu.

1. **Scegli la seduta.** Tocchi la categoria, poi la settimana.
2. **Fai la seduta.** Vedi i tre esercizi in fila. Ogni esercizio mostra lo
   schema, due righe di descrizione e il suo timer da 5 minuti. Tocchi play e
   parte. A fine tempo suona e vibra, e l'esercizio resta segnato come fatto.
3. **Segna la settimana.** Nell'elenco, il cerchio a destra di ogni settimana
   la marca come fatta con una spunta verde. Toccandolo di nuovo il segno si
   toglie. Il conteggio vale per la categoria scelta e resta salvato sul telefono.

Il timer tiene lo schermo acceso mentre va, si mette in pausa e riprende da dove
era. Il tasto ↺ accanto al conto alla rovescia lo riporta a 5 minuti, anche
mentre sta scorrendo, e toglie il segno di esercizio concluso; resta spento
finché non c'è nulla da azzerare. Un esercizio alla volta: avviarne uno ferma il
precedente.

L'app funziona offline dopo la prima apertura e si può aggiungere alla schermata
Home come una normale app.

## Come pubblicarla

È un sito statico, basta servire la cartella del repository.

- **GitHub Pages**: Settings → Pages → Source «Deploy from a branch», branch
  predefinito e cartella `/ (root)`. L'app sarà su
  `https://<utente>.github.io/<repo>/`.
- **In locale**: `python3 -m http.server 8080` nella cartella del repo, poi apri
  `http://localhost:8080` dal telefono sulla stessa rete.

## Struttura

```
index.html         pagina unica
app.js             logica: due schermate e il timer di ogni esercizio
style.css          stile mobile-first
data/mese1.json    16 sedute e 48 esercizi del primo mese
img/               schemi degli esercizi, ritagliati dal PDF
docs/              il PDF del piano completo
tools/genera_dati.py  rigenera data/ e img/ dal PDF
tools/genera_icone.py rigenera le icone dell'app
manifest.json      installazione come app
sw.js              uso offline
```

## L'icona dell'app

L'icona è la scritta ASTA su uno sfondo in gradiente dal blu all'arancio,
generata da `tools/genera_icone.py`.

Per usare il logo vero della società al posto della scritta, salva il logo come
`assets/logo-asta.png` (PNG con sfondo trasparente, quadrato o quasi) e rilancia:

```bash
pip install pillow
python3 tools/genera_icone.py
```

Le icone sono a pieno campo e senza trasparenze, come richiesto dalle app
installabili: gli angoli li arrotonda il sistema operativo.

L'interfaccia usa gli stessi colori: blu per la struttura, arancio per il
pulsante di avvio e per il timer in corsa.

## Rigenerare i dati

I contenuti non si scrivono a mano: si estraggono dal PDF.

```bash
pip install pymupdf pillow
python3 tools/genera_dati.py docs/Piano_trimestrale_tecnica_di_base.pdf
```

Lo script ritaglia gli schemi dal PDF e porta il fondo verde del riquadro
sull'azzurro dell'app. I colori dei disegni (coni, casacche, frecce) restano
quelli originali.

Per aggiungere i mesi successivi basta cambiare `SETTIMANE` in cima allo script
(per esempio `range(1, 9)` per i primi due mesi) e rilanciarlo.
