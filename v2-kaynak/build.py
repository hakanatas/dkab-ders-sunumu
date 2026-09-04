#!/usr/bin/env python3
"""Orijinal sunumdan v2 (modern + etkileşimli) sürümü üretir. Orijinal dosyaya dokunmaz."""
import pathlib, re, sys

PROJE = pathlib.Path(__file__).resolve().parent.parent
SP = pathlib.Path(__file__).resolve().parent
KAYNAK = PROJE / 'DKAB_Sunum_Final_82.html'
HEDEF = PROJE / 'DKAB_Sunum_v2.html'

src = KAYNAK.read_text(encoding='utf-8')
tema = (SP / 'tema.css').read_text(encoding='utf-8')
ana = (SP / 'ana.html').read_text(encoding='utf-8')
nav = (SP / 'nav.html').read_text(encoding='utf-8')
ekstra = (SP / 'ekstra.html').read_text(encoding='utf-8')
js = (SP / 'v2.js').read_text(encoding='utf-8')

def once(s, eski, yeni):
    assert s.count(eski) >= 1, f'bulunamadı: {eski[:60]!r}'
    return s.replace(eski, yeni, 1)

# 1) Yazı tipleri ve başlık
src = once(src,
    '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">',
    '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
    '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap" rel="stylesheet">')
src = once(src, '<title>DKAB 5-8 Sınıf Sunumu</title>', '<title>DKAB Etkileşimli Ders Sunumu</title>')

# 2) Tema
src = once(src, '</head>', '<style id="tema-v2">\n' + tema + '\n</style>\n</head>')

# 3) Ana ekran
i = src.index('<div id="ana-ekran">'); j = src.index('<button id="geri-btn"')
src = src[:i] + ana + src[j:]

# 4) Gezinme çubuğu (+ ilerleme çubuğu)
i = src.index('<div id="progress">'); j = src.index('<div id="stage">')
src = src[:i] + nav + src[j:]

# 5) Yinelenen ikinci #hmenu bloğunu kaldır
k1 = src.index('<div id="hmenu">'); k2 = src.index('<div id="hmenu">', k1 + 10)
end = src.index('<div id="sube-modal"', k2)
src = src[:k2] + src[end:]

# 6) Ana betikten sonra yinelenen modalleri kaldır; ek arayüz + v2 betiğini ekle
idx = src.index('</script>\n<div id="sube-modal"') + len('</script>\n')
son = src.rindex('</body>')
src = src[:idx] + ekstra + '\n<script id="v2-js">\n' + js + '\n</script>\n' + src[son:]

# Denetimler
for tid in ['sube-modal', 'ogr-modal', 'klasor-modal', 'arama-modal', 'sayfa-modal', 'ayar-modal', 'hmenu', 'navbar', 'ana-ekran', 'konu-cekmece', 'gsayim', 'secici-modal', 'duz-modal', 'da-overlay', 'metin-arac']:
    n = src.count(f'id="{tid}"')
    assert n == 1, f'{tid}: {n} adet'
assert src.count('<div class="slide') == 401, src.count('<div class="slide')
HEDEF.write_text(src, encoding='utf-8')
print(f'yazıldı: {HEDEF} ({len(src)/1e6:.2f} MB)')
