"""Genera le icone dell'app: logo Asta su sfondo in gradiente da blu ad arancio.

Uso:  python3 tools/genera_icone.py
Richiede: pip install pillow

Se esiste il file assets/logo-asta.png (PNG con sfondo trasparente), viene usato
come logo al centro dell'icona. Altrimenti si disegna la scritta ASTA.
Per mettere il logo vero: salva il PNG in assets/logo-asta.png e rilancia lo script.
"""
import os

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOGO = os.path.join(ROOT, 'assets', 'logo-asta.png')
ICONS = os.path.join(ROOT, 'icons')
FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'

BLU = (19, 65, 206)        # blu in alto a sinistra
PONTE = (110, 56, 150)     # viola di passaggio: senza, il centro vira sul grigio
ARANCIO = (247, 148, 30)   # arancio in basso a destra
STRETTA = 2.2              # quanto è stretto il passaggio fra i due colori
MISURE = [192, 512]


def miscela(a, b, t):
    return tuple(a[i] + (b[i] - a[i]) * t for i in range(3))


def colore(t):
    """Gradiente a tre fermate, con i due colori pieni tenuti sugli angoli."""
    t = min(1.0, max(0.0, (t - 0.5) * STRETTA + 0.5))
    t = t * t * (3 - 2 * t)
    c = miscela(BLU, PONTE, t * 2) if t < 0.5 else miscela(PONTE, ARANCIO, (t - 0.5) * 2)
    return tuple(round(x) for x in c)


def sfondo(lato):
    """Gradiente diagonale, disegnato in piccolo e poi ingrandito."""
    passo = 64
    g = Image.new('RGB', (passo, passo))
    px = g.load()
    for y in range(passo):
        for x in range(passo):
            px[x, y] = colore((x + y) / (2 * (passo - 1)))
    return g.resize((lato, lato), Image.LANCZOS)


def ombra(base, disegno, sfoca):
    """Alone scuro dietro al logo: lo tiene leggibile sia sul blu sia sull'arancio."""
    alone = Image.new('RGBA', base.size, (0, 0, 0, 0))
    alone.paste((0, 0, 0, 110), (0, 0), disegno.split()[3])
    alone = alone.filter(ImageFilter.GaussianBlur(sfoca))
    base.alpha_composite(alone)
    base.alpha_composite(disegno)


def con_logo(lato):
    logo = Image.open(LOGO).convert('RGBA')
    largo = round(lato * 0.58)                       # dentro la zona sicura maskable
    alto = round(logo.height * largo / logo.width)
    if alto > largo:
        alto, largo = largo, round(logo.width * largo / logo.height)
    logo = logo.resize((largo, alto), Image.LANCZOS)
    strato = Image.new('RGBA', (lato, lato), (0, 0, 0, 0))
    strato.paste(logo, ((lato - largo) // 2, (lato - alto) // 2), logo)
    return strato


def con_scritta(lato):
    strato = Image.new('RGBA', (lato, lato), (0, 0, 0, 0))
    d = ImageDraw.Draw(strato)
    corpo = round(lato * 0.30)
    font = ImageFont.truetype(FONT, corpo)
    while d.textbbox((0, 0), 'ASTA', font=font)[2] > lato * 0.68 and corpo > 10:
        corpo -= 2
        font = ImageFont.truetype(FONT, corpo)
    x0, y0, x1, y1 = d.textbbox((0, 0), 'ASTA', font=font)
    d.text(((lato - (x1 - x0)) / 2 - x0, (lato - (y1 - y0)) / 2 - y0), 'ASTA',
           font=font, fill=(255, 255, 255, 255))
    return strato


def main():
    os.makedirs(ICONS, exist_ok=True)
    usa_logo = os.path.exists(LOGO)
    for lato in MISURE:
        # Sfondo a pieno campo, senza trasparenze: gli angoli li arrotonda il
        # sistema. Un PNG con angoli trasparenti su iOS diventa nero agli angoli.
        img = sfondo(lato).convert('RGBA')
        ombra(img, con_logo(lato) if usa_logo else con_scritta(lato), max(2, lato * 0.012))
        img.convert('RGB').save(os.path.join(ICONS, f'icon-{lato}.png'))
    print(('logo da assets/logo-asta.png' if usa_logo else 'scritta ASTA') +
          ' su gradiente blu-arancio: icone ' + ', '.join(str(m) for m in MISURE))


if __name__ == '__main__':
    main()
