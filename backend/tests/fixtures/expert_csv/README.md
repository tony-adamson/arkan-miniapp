# Фикстура экспертной базы: CSV-волна до поставки книги эксперта

Файлы — это то, что выгружается из Google Таблицы (`docs/expert-brief.md` §4):
`cards.csv`, `spreads.csv`, `positions.csv`, `refusals.csv`, `crisis_resources.csv`,
`checkin_texts.csv`. Прогон: `make validate-base CSV=backend/tests/fixtures/expert_csv
OUT=backend/expert_base`.

Правила фикстуры:

- `cards` — все 22 старших аркана, в колонке `status` значение `ready`;
- тексты Башни, Жрицы и Звезды взяты из `docs/expert-brief.md` §6 и
  `design-system/ui_kits/arkan-miniapp/data.js`; все остальные тексты помечены
  «ТЕСТОВЫЕ ДАННЫЕ» и ничего не утверждают о реальном продукте;
- строка `ace_of_wands` со `status=draft` показывает незаполненную волну: в YAML
  она не попадает (D12);
- у позиций 2 и 3 расклада `three_threads` нет `ask_2` — как в брифе §4.3.

Контакты служб помощи в `crisis_resources.csv` — выдуманные: реальный набор
подбирает и проверяет команда (brief §4.5).
