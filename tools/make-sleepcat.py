# 產生動態睡覺橘貓的 inline SVG（依 assets/logo/pixel-cat-sleep.svg 的像素拆成可動部位）
# 部位 class：zz-a（大 Z）、zz-b（小 z）、ear（右耳）、back-a／back-b（呼吸兩格）、eye-c（閉眼）、eye-o（睜眼，滑鼠移上時）
# 動畫 CSS 寫在 index.html 的 .sleepcat 區塊。用法：python3 tools/make-sleepcat.py > /tmp/cat.svg
import re, os
SRC = os.path.join(os.path.dirname(__file__), '..', 'assets', 'logo', 'pixel-cat-sleep.svg')
rects = [(int(x), int(y), c) for x, y, c in re.findall(r'<rect x="(\d+)" y="(\d+)" width="1" height="1" fill="(#[0-9a-f]+)"/>', open(SRC).read())]
OUT, BODY, FILL, EYE = '#3b2416', '#f28c28', '#f28c28', '#281c1e'
parts = {k: [] for k in ('zz-a', 'zz-b', 'ear', 'back-a', 'eye-c', 'base')}
for x, y, c in rects:
    if c == '#8fc7ff': parts['zz-a' if x >= 19 else 'zz-b'].append((x, y, c))
    elif 5 <= y <= 7 and 8 <= x <= 10: parts['ear'].append((x, y, c))
    elif y == 9 and 12 <= x <= 17: parts['back-a'].append((x, y, c))
    elif y == 11 and c == EYE: parts['eye-c'].append((x, y, c))
    else: parts['base'].append((x, y, c))
# 吸氣那一格：背部輪廓往上 1 像素，原位置補成身體色
back_b = [(x, 8, OUT) for x in range(12, 18)] + [(x, 9, FILL) for x in range(12, 18)] + [(18, 9, OUT)]
# 睜眼：每隻眼睛中間兩格深色
eye_o = [(3, 10, EYE), (3, 11, EYE), (9, 10, EYE), (9, 11, EYE), (2, 11, BODY), (4, 11, BODY), (8, 11, BODY), (10, 11, BODY)]
def g(cls, cells):
    return '<g class="%s">%s</g>' % (cls, ''.join('<rect x="%d" y="%d" width="1" height="1" fill="%s"/>' % c for c in cells))
svg = ('<svg class="sleepcat" viewBox="0 0 24 18" shape-rendering="crispEdges" role="img" aria-label="睡覺的橘貓">'
       + g('base', parts['base']) + g('ear', parts['ear']) + g('back-a', parts['back-a']) + g('back-b', back_b)
       + g('eye-c', parts['eye-c']) + g('eye-o', eye_o) + g('zz-b', parts['zz-b']) + g('zz-a', parts['zz-a']) + '</svg>')
print(svg)
