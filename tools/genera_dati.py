"""Genera data/mese1.json e i diagrammi in img/ a partire dal PDF del piano.

Uso:  python3 tools/genera_dati.py docs/Piano_trimestrale_tecnica_di_base.pdf
Richiede: pip install pymupdf pillow
"""
import json, os, re, sys

import pymupdf
from PIL import Image

PDF = sys.argv[1] if len(sys.argv) > 1 else 'docs/Piano_trimestrale_tecnica_di_base.pdf'
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG = os.path.join(ROOT, 'img')
OUT = os.path.join(ROOT, 'data', 'mese1.json')
SETTIMANE = range(1, 5)          # solo il primo mese
CATS = {'PULCINI': 'pulcini', 'ESORDIENTI B': 'esordientiB',
        'ESORDIENTI A': 'esordientiA', 'GIOVANISSIMI B': 'giovanissimiB'}
NOMI = {'pulcini': 'Pulcini', 'esordientiB': 'Esordienti B',
        'esordientiA': 'Esordienti A', 'giovanissimiB': 'Giovanissimi B'}


def spans(page, minsize=6):
    out = []
    for b in page.get_text('dict')['blocks']:
        for l in b.get('lines', []):
            for s in l['spans']:
                t = s['text'].strip()
                if t and s['size'] >= minsize:
                    out.append(dict(size=round(s['size'], 1), bold='Bold' in s['font'],
                                    color=f"{s['color']:06x}", x=s['bbox'][0],
                                    y=s['bbox'][1], t=t))
    out.sort(key=lambda s: (round(s['y']), s['x']))
    return out


def join(lines):
    return re.sub(r'\s+', ' ', ' '.join(lines)).strip()


def accorcia(testo, minlen=110, maxlen=260, hardmax=320):
    """Riduce la descrizione a poche frasi intere."""
    frasi = re.split(r'(?<=\.)\s+', testo)
    out = ''
    for f in frasi:
        if out and len(out) >= minlen and not out.rstrip().endswith((':', ';')):
            break
        cand = (out + ' ' + f).strip()
        if out and len(cand) > maxlen and len(out) >= minlen:
            break
        out = cand
    if len(out) > hardmax:
        taglio = max(out.rfind(', ', 0, hardmax), out.rfind('; ', 0, hardmax))
        if taglio > minlen:
            out = out[:taglio]
    return out.strip().rstrip(',;:')


def azzurra(img):
    """Porta il fondo verde del riquadro sull'azzurro, in tinta con l'app.

    Tocca solo i verdi chiari e slavati dello sfondo: frecce, coni e casacche
    verdi dei disegni sono saturi e restano come sono. Sui grigi non cambia nulla.
    """
    fuori = []
    for r, g, b in img.getdata():
        chiaro = min(r, g, b) >= 140 and max(r, g, b) - min(r, g, b) <= 45
        fuori.append((b, (r + b) // 2, g) if chiaro and g >= r and g >= b else (r, g, b))
    out = Image.new('RGB', img.size)
    out.putdata(fuori)
    return out


def leggi_settimana(page, dati):
    ss = spans(page)
    num = int(re.sub(r'\D', '', ss[0]['t'].split('D I')[0]))
    if num not in SETTIMANE:
        return
    w = {'week': num,
         'block': join([s['t'] for s in ss if s['size'] == 16.0]),
         'materials': {}}
    cur, buf = None, []
    for s in ss:
        if s['size'] == 8.2 and s['bold'] and s['t'].endswith(':'):
            if cur:
                w['materials'][cur] = join(buf)
            cur, buf = CATS[s['t'][:-1].upper()], []
        elif s['size'] == 8.2 and not s['bold'] and cur:
            buf.append(s['t'])
        elif cur and s['size'] != 8.2:
            w['materials'][cur] = join(buf)
            cur, buf = None, []
    if cur:
        w['materials'][cur] = join(buf)
    note, on = [], False
    for s in ss:
        if s['t'].startswith('Ricorda:'):
            break
        if s['size'] == 9.0 and s['color'] in ('14213d', '23303f'):
            if s['t'].startswith('Nota della settimana'):
                on = True
                continue
            if s['bold'] and s['color'] == '14213d':
                on = True
            if on:
                note.append(s['t'])
    w['note'] = join(note).replace(' :', ':').replace(' ,', ',')
    dati['weeks'].append(w)


def leggi_seduta(page, dati):
    ss = spans(page)
    hdr = [s for s in ss if s['color'] == 'ffffff' and s['size'] == 7.8][0]['t']
    m = re.match(r'(.+?) · (\d{4}) · (\w+) · SETTIMANA (\d+)', hdr)
    settimana = int(m.group(4))
    if settimana not in SETTIMANE:
        return
    cat = CATS[m.group(1)]
    S = {'cat': cat, 'catName': NOMI[cat], 'year': m.group(2),
         'day': m.group(3).capitalize(), 'week': settimana,
         'title': join([s['t'] for s in ss if s['size'] == 12.5])}

    campi, cur = {}, None
    for s in ss:
        if s['size'] == 7.8 and s['color'] == 'ffffff':
            continue
        if s['size'] == 7.8 and s['bold'] and s['color'] == '14213d':
            cur = s['t'].rstrip(':')
            campi[cur] = []
        elif s['size'] == 7.8 and cur and s['color'] == '23303f':
            campi[cur].append(s['t'])
        elif s['size'] != 7.8:
            cur = None
    S['objective'] = join(campi.get('Obiettivo finale della seduta', []))
    S['materials'] = join(campi.get('Materiale', [])).split('|')[0].strip()

    titoli = [s for s in ss if s['size'] == 9.0 and s['bold'] and re.match(r'\d\. ', s['t'])]
    fondo = [s for s in ss if s['t'].startswith('Per chiudere')][0]['y']
    S['exercises'] = []
    for i, e in enumerate(titoli):
        y0 = e['y']
        y1 = titoli[i + 1]['y'] if i + 1 < len(titoli) else fondo
        n, titolo = e['t'].split('. ', 1)
        col = [s for s in ss if y0 < s['y'] < y1 and 225 < s['x'] < 530]
        desc = []
        for s in col:
            if s['bold'] and s['color'] == '2f7fbf':
                break
            desc.append(s['t'])
        didascalia = []
        for b in page.get_text('dict')['blocks']:
            for l in b.get('lines', []):
                for s in l['spans']:
                    if (s['bbox'][0] < 225 and y0 + 10 < s['bbox'][1] < y1
                            and s['size'] < 6 and 'Oblique' in s['font']):
                        didascalia.append(s['text'])
        box = [d['rect'] for d in page.get_drawings()
               if d['rect'].x0 < 50 and d['rect'].x1 < 230
               and d['rect'].width > 150 and y0 < d['rect'].y0 < y1]
        clip = box[0] if box else pymupdf.Rect(40, y0 + 12, 224, min(y1 - 6, fondo - 6))
        nome = f'{cat}-w{settimana:02d}-e{n}.png'
        pix = page.get_pixmap(matrix=pymupdf.Matrix(2.2, 2.2), clip=clip, alpha=False)
        azzurra(Image.frombytes('RGB', (pix.width, pix.height), pix.samples))\
            .save(os.path.join(IMG, nome))
        S['exercises'].append({'n': int(n), 'title': titolo.strip(), 'minutes': 5,
                               'caption': join(didascalia),
                               'desc': accorcia(join(desc)), 'img': 'img/' + nome})
    dati['sessions'].append(S)


def main():
    os.makedirs(IMG, exist_ok=True)
    doc = pymupdf.open(PDF)
    dati = {'month': 1, 'weeks': [], 'sessions': []}
    for page in doc:
        ss = spans(page)
        if not ss:
            continue
        if ss[0]['t'].startswith('S E T T I M A N A'):
            leggi_settimana(page, dati)
        elif any(s['size'] == 12.5 for s in ss):
            leggi_seduta(page, dati)
    dati['weeks'].sort(key=lambda w: w['week'])
    ordine = list(NOMI)
    dati['sessions'].sort(key=lambda s: (s['week'], ordine.index(s['cat'])))
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    json.dump(dati, open(OUT, 'w'), ensure_ascii=False, indent=1)
    print(f"{len(dati['weeks'])} settimane, {len(dati['sessions'])} sedute, "
          f"{sum(len(s['exercises']) for s in dati['sessions'])} esercizi")


if __name__ == '__main__':
    main()
