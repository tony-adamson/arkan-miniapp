#!/usr/bin/env python3
"""Сборка одного CSS-бандла из токенов ДС и стилей страницы (P2-9).

Исходники остаются раздельными в site/assets/css/, в продакшн уходит
site/assets/css/arkan.css. Минификация консервативная: комментарии и лишние
пробелы, без перестановки правил и без трогания значений.
Запуск:  python3 tools/build-css.py
Проверка (для гейта перед деплоем): python3 tools/build-css.py --check
"""
import re, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
CSS = ROOT / "site/assets/css"
# Порядок как в styles.css дизайн-системы; app.css последним.
ORDER = ["tokens/fonts.css", "tokens/colors.css", "tokens/typography.css",
         "tokens/spacing.css", "tokens/radii.css", "tokens/elevation.css",
         "tokens/motion.css", "tokens/base.css", "app.css"]
OUT = CSS / "arkan.css"

# Строковые литералы и содержимое url() выносим из-под регулярок: там пробелы
# значимы, а последовательность /* внутри пути — часть пути, а не комментарий.
_STRING = re.compile(r""""(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'""")
_URL = re.compile(r"url\(\s*[^)\s'\"]*\s*\)", re.I)
_SENTINEL = "\x00%d\x00"


def _protect(css):
    """Заменить строки и url(...) на плейсхолдеры, вернуть (css, список кусков)."""
    chunks = []

    def take(m):
        chunks.append(m.group(0))
        return _SENTINEL % (len(chunks) - 1)

    css = _STRING.sub(take, css)   # сначала строки: url("...") уже защищён внутри
    css = _URL.sub(take, css)      # затем url() без кавычек
    return css, chunks


def _restore(css, chunks):
    # В обратном порядке: url("...") сохранён позже вложенной в него строки,
    # и при восстановлении должен раскрыться раньше неё.
    for i in range(len(chunks) - 1, -1, -1):
        css = css.replace(_SENTINEL % i, chunks[i])
    return css


def minify(css):
    css, chunks = _protect(css)
    css = re.sub(r"/\*.*?\*/", "", css, flags=re.S)      # комментарии
    css = re.sub(r"\s+", " ", css)                        # схлопнуть пробелы
    css = re.sub(r"\s*([{};])\s*", r"\1", css)            # вокруг скобок и ;
    css = css.replace(";}", "}")
    return _restore(css.strip(), chunks)

def render():
    raw = "".join((CSS / n).read_text(encoding="utf-8") + "\n" for n in ORDER)
    return raw, "/* Аркан — собранный бандл. Не править руками: см. tools/build-css.py */\n" + minify(raw) + "\n"


def main(check=False):
    raw, out = render()
    if check:
        # Гейт перед деплоем: бандл — единственный CSS, который грузит прод,
        # и правка исходника без пересборки уехала бы незамеченной.
        current = OUT.read_text(encoding="utf-8") if OUT.exists() else None
        if current == out:
            print(f"{OUT.relative_to(ROOT)}: актуален")
            return 0
        print(f"{OUT.relative_to(ROOT)}: УСТАРЕЛ — исходники изменились без пересборки."
              f" Запустить: python3 tools/build-css.py", file=sys.stderr)
        return 1
    OUT.write_text(out, encoding="utf-8")
    print(f"{OUT.relative_to(ROOT)}: {len(raw)} -> {len(out)} байт "
          f"({100 - round(len(out) / len(raw) * 100)}% меньше), файлов: {len(ORDER)}")
    return 0


if __name__ == "__main__":
    sys.exit(main(check="--check" in sys.argv[1:]))
