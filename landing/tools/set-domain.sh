#!/bin/sh
# Подставить реальный домен вместо плейсхолдеров.
#
#   site/**/*.{html,xml,txt}   arkan.example -> <домен>   (правится на месте)
#   deploy/nginx.conf.example  ARKAN_DOMAIN  -> <домен>   (пишется в deploy/nginx.conf,
#                                                          шаблон остаётся нетронутым)
#
# Использование: tools/set-domain.sh arkan.ru
set -eu

if [ $# -ne 1 ]; then
    echo "нужен ровно один аргумент: $0 arkan.ru" >&2
    exit 1
fi

DOMAIN="$1"

# Домен идёт в sed-выражение и в конфиг nginx — пускаем только то, что доменом и является.
if ! printf '%s' "$DOMAIN" | grep -Eq '^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)+$'; then
    echo "не похоже на домен: $DOMAIN" >&2
    exit 1
fi

ROOT=$(cd "$(dirname "$0")/.." && pwd)

# Замену делаем внутри find -exec: подстановка $(find ...) разбила бы пути
# с пробелами. sed -i несовместим между BSD (macOS) и GNU (Linux) — у BSD
# суффикс обязателен, у GNU приклеивается к флагу, — поэтому пишем во
# временный файл: так работает и там, и там.
count=$(find "$ROOT/site" -type f \( -name '*.html' -o -name '*.xml' -o -name '*.txt' \) \
    -exec sh -c '
        domain=$1; shift
        for file do
            grep -q "arkan\.example" "$file" || continue
            tmp="$file.tmp.$$"
            sed "s/arkan\.example/$domain/g" "$file" > "$tmp" && mv "$tmp" "$file"
            echo "$file"
        done
    ' sh "$DOMAIN" {} + | wc -l | tr -d ' ')

TEMPLATE="$ROOT/deploy/nginx.conf.example"
CONF="$ROOT/deploy/nginx.conf"
sed "s/ARKAN_DOMAIN/$DOMAIN/g" "$TEMPLATE" > "$CONF"

echo "домен: $DOMAIN"
echo "  файлов сайта обновлено: $count"
echo "  конфиг nginx: ${CONF#"$ROOT"/} (шаблон .example не тронут, можно запускать повторно)"

remaining=$(grep -rl 'arkan\.example' "$ROOT/site" 2>/dev/null | wc -l | tr -d ' ')
if [ "$remaining" != "0" ]; then
    echo "ВНИМАНИЕ: плейсхолдер остался в $remaining файле(ах):" >&2
    grep -rl 'arkan\.example' "$ROOT/site" >&2
    exit 1
fi
echo "  плейсхолдеров не осталось"
