#!/usr/bin/env python3
"""Проверка контраста WCAG для лендинга «Аркан».

Проверяются не все комбинации токенов подряд, а пары «текст на фоне», которые
реально встречаются в вёрстке (site/index.html, privacy/, soon/). Порог:
4.5:1 для текста, 3:1 для нетекстовых индикаторов.

Запуск:
    python3 tools/contrast-check.py
Разовый расчёт пары:
    python3 tools/contrast-check.py '#35784F' '#FBFAF8'
"""
import re
import sys
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
CSS = ROOT / "site/assets/css/tokens/colors.css"


# --------------------------------------------------------------------- цвет ---
def srgb_to_lin(c):
    c /= 255
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def luminance(rgb):
    r, g, b = (srgb_to_lin(x) for x in rgb)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def ratio(fg, bg):
    l1, l2 = luminance(fg), luminance(bg)
    if l1 < l2:
        l1, l2 = l2, l1
    return (l1 + 0.05) / (l2 + 0.05)


def parse_hex(s):
    s = s.strip().lstrip("#")
    if len(s) == 3:
        s = "".join(ch * 2 for ch in s)
    return tuple(int(s[i:i + 2], 16) for i in (0, 2, 4))


def parse_rgba(s):
    nums = re.findall(r"[\d.]+", s)
    return tuple(float(x) for x in nums[:3]), (float(nums[3]) if len(nums) > 3 else 1.0)


def flatten(rgb, alpha, bg):
    return tuple(rgb[i] * alpha + bg[i] * (1 - alpha) for i in range(3))


# ------------------------------------------------------------------ разбор css ---
def load_themes():
    text = re.sub(r"/\*.*?\*/", "", CSS.read_text(encoding="utf-8"), flags=re.S)
    blocks = {}
    for m in re.finditer(r"([^{}]+)\{([^{}]*)\}", text):
        decls = dict(re.findall(r"(--[\w-]+)\s*:\s*([^;]+);", m.group(2)))
        for sel in (x.strip() for x in m.group(1).split(",")):
            blocks.setdefault(sel, {}).update(decls)
    base = blocks.get(":root", {})
    return {
        "dark": {**base, **blocks.get('[data-theme="dark"]', {})},
        "light": {**base, **blocks.get('[data-theme="light"]', {})},
    }


THEMES = load_themes()


def resolve(theme, value, depth=0):
    """Развернуть значение или имя токена до литерала цвета."""
    if depth > 10:
        return None
    value = value.strip()
    if value.startswith("--"):
        v = THEMES[theme].get(value)
        return resolve(theme, v, depth + 1) if v else None
    m = re.fullmatch(r"var\(\s*(--[\w-]+)\s*\)", value)
    if m:
        return resolve(theme, m.group(1), depth + 1)
    return value


def rgb_on(theme, token, bg_rgb):
    """Цвет токена, положенный на уже вычисленный фон (учитывает альфу)."""
    v = resolve(theme, token)
    if v is None:
        return None
    if v.startswith("#"):
        return parse_hex(v)
    if v.startswith("rgb"):
        rgb, a = parse_rgba(v)
        return flatten(rgb, a, bg_rgb)
    if v.startswith("linear-gradient"):
        # Градиент разворачивается в отдельные варианты фона в bg_variants —
        # здесь берём первую остановку только как запасной путь.
        stops = gradient_stops(v)
        return stops[0] if stops else None
    return None


def gradient_stops(value):
    """Все цветовые остановки градиента: проверять надо каждую, а не крайнюю."""
    return [parse_hex(h) for h in re.findall(r"#[0-9A-Fa-f]{6}", value)]


# --------------------------------------------------------------- пары вёрстки ---
# (описание, токен текста, токен фона, порог)
PAIRS = [
    ("h1 / заголовки секций",            "--text-primary",   "--surface",          4.5),
    ("лиды, ссылки в шапке и футере",    "--text-secondary", "--surface",          4.5),
    ("caption: подписи, год, позиции",   "--text-tertiary",  "--surface",          4.5),
    ("кнопка-ссылка «Как это работает»", "--accent",         "--surface",          4.5),
    ("кикер hero «ИИ-таролог в диалоге»","--accent-2",       "--surface",          4.5),
    ("римские цифры I/II/III",           "--accent",         "--surface-elevated", 4.5),
    ("заголовки карточек",               "--text-primary",   "--surface-elevated", 4.5),
    ("тексты карточек, реплика Аркана",  "--text-secondary", "--surface-elevated", 4.5),
    ("даты и подписи в карточках",       "--text-tertiary",  "--surface-elevated", 4.5),
    ("названия карт в истории",          "--text-secondary", "--surface-inset",    4.5),
    ("подпись на кнопке CTA",            "--text-on-accent", "--accent",           4.5),
    ("текст выбранного чипа",            "--accent",         "--accent-muted",     4.5),
    ("реплика пользователя",             "--text-primary",   "--accent-muted",     4.5),
    ("статус «Сегодня»",                 "--accent-2",       "--accent-2-muted",   4.5),
    ("статус «Не завершён»",             "--warning",        "--warning-muted",    4.5),
    # Подписи под картами hero лежат на декоративном свечении, а не на голом фоне.
    ("подпись позиции под картой",       "--text-secondary", "--accent-muted",     4.5),
    ("подпись «Нажмите на карту»",       "--text-tertiary",  "--surface",          4.5),
    ("имя на лицевой стороне карты",     "--card-face-ink",  "--card-face",        4.5),
    ("обводка фокуса",                   "--border-focus",   "--surface",          3.0),
]

# Полупрозрачные фоны лежат на этих подложках — проверяем на худшей из них.
UNDERLAY = {
    "--accent-muted": ["--surface", "--surface-elevated"],
    "--accent-2-muted": ["--surface-elevated"],
    "--warning-muted": ["--surface-elevated"],
}


def bg_variants(theme, token):
    """Варианты фона: сплошной — один, полупрозрачный — по подложкам,
    градиент — по каждой остановке (какая из них худшая, зависит от цвета текста)."""
    if token in UNDERLAY:
        out = []
        for under in UNDERLAY[token]:
            base = rgb_on(theme, under, (255, 255, 255))
            out.append((f"{token} на {under}", rgb_on(theme, token, base)))
        return out
    raw = resolve(theme, token)
    if raw and raw.startswith("linear-gradient"):
        stops = gradient_stops(raw)
        return [(f"{token} остановка {i + 1}/{len(stops)}", rgb) for i, rgb in enumerate(stops)]
    return [(token, rgb_on(theme, token, (255, 255, 255)))]


def run():
    bad = []          # пары, не дотянувшие до порога
    unresolved = []   # пары, которые вообще не удалось посчитать
    checked = 0
    for theme in ("dark", "light"):
        print(f"\n=== тема: {theme} ===")
        for desc, fg_tok, bg_tok, need in PAIRS:
            for bg_label, bg in bg_variants(theme, bg_tok):
                fg = rgb_on(theme, fg_tok, bg) if bg is not None else None
                if fg is None or bg is None:
                    # Токен переименован, удалён или опечатан. Это отказ проверки,
                    # а не «пара в порядке»: молча пропустить — значит выдать
                    # зелёный результат, ничего не проверив.
                    unresolved.append((theme, desc, fg_tok, bg_label))
                    print(f"  ??  НЕ ВЫЧИСЛЕНО {desc}  [{fg_tok} на {bg_label}]")
                    continue
                checked += 1
                r = ratio(fg, bg)
                ok = r >= need
                if not ok:
                    bad.append((theme, desc, fg_tok, bg_label, r, need))
                print(f"  {'ok ' if ok else 'FAIL'} {r:5.2f}:1 (нужно {need})  {desc}"
                      f"  [{fg_tok} на {bg_label}]")
    print()
    if unresolved:
        print(f"НЕ ВЫЧИСЛЕНО: {len(unresolved)} — проверка недостоверна")
        for theme, desc, fg, bg in unresolved:
            print(f"  {theme}: {desc} — не удалось развернуть {fg} или {bg}")
    if bad:
        print(f"НЕ ПРОШЛИ: {len(bad)}")
        for theme, desc, fg, bg, r, need in bad:
            print(f"  {theme}: {desc} — {fg} на {bg} = {r:.2f} < {need}")
    if bad or unresolved:
        return 1
    if not checked:
        print("Не выполнено ни одного сравнения — проверять нечего.")
        return 1
    print(f"Все {checked} сравнений ({len(PAIRS)} пар вёрстки × 2 темы, "
          f"полупрозрачные фоны — на каждой подложке) проходят порог.")
    return 0


if __name__ == "__main__":
    if len(sys.argv) > 2:
        print(f"{ratio(parse_hex(sys.argv[1]), parse_hex(sys.argv[2])):.3f}")
        sys.exit(0)
    sys.exit(run())
