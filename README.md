# Tecnica di base · Piano trimestrale (webapp)

Webapp per smartphone che rende fruibile in campo il documento
[Piano trimestrale di tecnica di base](docs/Piano_trimestrale_tecnica_di_base.pdf):
12 settimane, 48 sedute, 144 esercizi per Pulcini 2016, Esordienti B 2015,
Esordienti A 2014 e Giovanissimi B 2013.

## Cosa fa

- **Seduta**: scegli categoria e settimana, leggi obiettivo, materiale, i tre
  esercizi con diagramma, comportamenti privilegiati, varianti ed errore da correggere.
- **Timer**: guida i 20 minuti della seduta (1' avvio, 5' esercizio 1, 1' cambio,
  5' esercizio 2, 1' cambio, 5' esercizio 3, 2' chiusura) con suono e vibrazione ai
  cambi, schermo sempre acceso e gestione dei due turni per sottogruppo.
- **Materiale**: cosa portare in campo lunedì e martedì per la settimana scelta,
  più la checklist della borsa del trimestre.
- **Prove**: descrizione delle quattro prove misurate, cronometro e griglia di
  valutazione per categoria (settimana 1 vs settimana 12), salvata sul telefono.
- **Info** (pulsante «i»): struttura, regole di conduzione, piedi scalzi,
  traguardi di fine trimestre e link al PDF completo.

Funziona offline dopo la prima apertura (service worker) e si può aggiungere
alla schermata Home come app.

## Come pubblicarla

L'app è statica: basta servire la cartella del repository.

- **GitHub Pages**: Settings → Pages → Source «Deploy from a branch», branch e
  cartella `/ (root)`. L'app sarà su `https://<utente>.github.io/<repo>/`.
- **In locale**: `python3 -m http.server 8080` nella cartella del repo, poi apri
  `http://localhost:8080` dal telefono sulla stessa rete.

## Struttura

```
index.html      pagina unica
app.js          logica (viste, timer, griglia)
style.css       stile mobile-first
data/plan.json  48 sedute e 144 esercizi estratti dal PDF
img/            diagrammi degli esercizi (ritagliati dal PDF)
docs/           il PDF originale
manifest.json   installazione come app
sw.js           uso offline
```

I dati in `data/plan.json` e le immagini in `img/` sono generati automaticamente
dal PDF; per aggiornarli basta rigenerare il file a partire da una nuova versione
del documento.
