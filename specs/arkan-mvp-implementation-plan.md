# План реализации: MVP «Аркан» (этап 1, Sber500 x Disrupt)

# Блок 1. Для человека

## 1. Коротко

Собрать MVP «Аркан» по `SOLUTION.md`: backend-монолит FastAPI (API + бот +
напоминания), Postgres/Redis/Qdrant, RAG-пайплайн по экспертной базе с проверкой
каждой генерации, фронт из дизайн-системы (один бандл для Mini App и веба),
серверная аналитика и Grafana. Все 22 фазы выполняет агент без человека, без
ключей и без сервера: разработка и проверки — локально в Docker Compose. Всё,
что требует человека (волны базы, живой DeepSeek, модели, ручной смоук в
Telegram, деплой на сервер в РФ, лендинг, запуск), вынесено в операционные
шаги §9.2.

## 2. Что будет сделано

- неделя 1 (фазы 1–6): каркас, схема БД, сессии и события, движок колоды,
  валидатор экспертной базы, машина раскладов без генерации;
- неделя 2 (фазы 7–11): LLM-адаптер, классификация, отказы и кризис; RAG;
  толкование с судьёй; итог и история; golden-set классификатора;
- неделя 3 (фазы 12–15): Telegram-вход и привязка, профиль, карта дня со
  сверкой, бот с напоминаниями через туннель;
- неделя 4 (фазы 16–22): шеринг и антифрод, метрики и Grafana, фронт (3 фазы),
  нагрузочный сценарий и runbook, деплой-заготовки.

## 3. Что мы не делаем

NG-1..7 из `SOLUTION.md`. Плюс: деплой в фазах (он операционный, О-8);
четвёртая тема раскладов до ответа эксперта (ASM-7); правки `design-system/`,
`deck/`, `landing/` в фазах; e2e-фреймворк, фронтовый тест-раннер.

## 4. Риски

- Площадка решена (DEC-1, D20): сервер в РФ, Telegram через туннель на
  fornex-de; бот зависит от туннеля (R11). Размер сервера — по замеру О-4.
- База от эксперта опоздает — фазы работают на фикстуре; для живого ingest есть
  `MAJOR_ONLY`.
- Живая латентность и память проверяются только операционно (О-4, О-6): в фазах
  нет моделей и LLM.

## 5. Как проверить

```bash
make lint && make typecheck && make test
make fe-check        # с фазы 18
make deploy-check    # с фазы 22
```

Команды и пороги — §10 блока 2; операционные прогоны — §9.2.

## 6. Готовность

**Статус**: `READY_FOR_BUILD`

---

# Блок 2. Для агента

## 1. Метаданные

- **План**: `specs/arkan-mvp-implementation-plan.md`
- **Источник**: `SOLUTION.md` (статус `READY_FOR_PLANF3`, решения D1–D20, риски
  R1–R11), `docs/expert-brief.md`, `docs/metrics.md`, `design-system/GUIDE.md`
- **Статус плана**: `READY_FOR_BUILD`
- **Дата**: 17.09.2026
- **Режим**: minimal diff compiler — архитектуру не выбираем; при конфликте с
  `SOLUTION.md` прав `SOLUTION.md`, фаза останавливается
- **CURRENT_STATE.md**: отсутствует (согласовано, Q6)
- **Исполнение**: фазы строго по порядку; статусы `[]` → `[wip]` → `[x]` / `[f]`
- **Все команды** выполняются из корня рабочего дерева

## 2. Приоритет источников

1. `SOLUTION.md` — архитектура, API §9.5, схема §9.4, отказы §9.6, операции §10,
   жизненные циклы §11, решения §13.
2. `docs/metrics.md` — формулы метрик.
3. `docs/expert-brief.md` — схема листов экспертной базы.
4. `design-system/GUIDE.md` — тон, длины, анимация раскрытия.
5. Этот план — порядок, файлы, проверки.
6. Стиль кода, заданный фазой 1.

## 3. Авторитетные требования

`SOLUTION.md` §3: REQ-1..21, NFR-1..7, CON-1..7, NG-1..7. План требований не
добавляет. Решения, которые нельзя нарушать: D1 (LLM за OpenAI-совместимым
адаптером), D2 (уточняющие вопросы из базы), D3 (колода — чистая функция сида),
D4 (веб — анонимная сессия), D5 (одно напоминание, opt-out), D7 (судья;
стоп-паттерны — сигнал; реранкер в проверке не участвует), D9 (голый Bot API),
D11 (несколько незакрытых раскладов), D12 (в YAML только `status=ready`,
`MAJOR_ONLY`), D13 (кризис-проверка каждого свободного текста), D14 (смысл
карты — точная выборка по `card_id`), D15 (отклик в сверке), D16 (CSP
app-домена), D17 (итог и утро под судьёй, шаблонные fallback), D18
(`SPREADS_PER_DAY`), D19 (cookie `SameSite=None; Partitioned` + JSON/Origin),
D20 (сервер в РФ, Telegram через `TELEGRAM_PROXY`), D21 (закрытый перечень кодов ошибок). Порядок расклада и
идемпотентность событий — `SOLUTION.md` §10 и §9.5.

## 4. Контракт минимальности

| Категория | Бюджет | Превышение | Обоснование |
|-----------|--------|-----------|-------------|
| Runtime-зависимости backend | 0 по умолчанию | да, только: fastapi, uvicorn, pydantic, pydantic-settings, sqlalchemy, alembic, asyncpg, redis, qdrant-client, openai, httpx[socks], onnxruntime, tokenizers, numpy, prometheus-client, pyyaml | SOLUTION §5.2 + роли settings, YAML базы, векторов, SOCKS (D20) |
| Dev-зависимости backend | минимум | pytest, pytest-asyncio, hypothesis, ruff, mypy, types-PyYAML | проверки SOLUTION §15 |
| Зависимости frontend | минимум | react@18, react-dom@18, vite, @vitejs/plugin-react, typescript, @types/react@18, @types/react-dom@18, lucide-static@0.451.0 | CON-1, SOLUTION §9.7 |
| Новое persistent state | только SOLUTION §9.4 | PG, Redis, Qdrant | суть продукта |
| Подсистемы | 0 | бот и напоминания — asyncio-задачи в api | SOLUTION §9.2 |
| Глобальные абстракции | 2 | LLM-адаптер, платформенный адаптер фронта | CON-4, REQ-13 |
| Доки | только контракты и эксплуатация | этот план; `README.md` раздел «Запуск»; `docs/runbook.md` | NFR-7, R8, R11: restore, деплой, туннель |

Отклонено: pgvector, TEI и отдельный сервис моделей, JWT, aiogram,
APScheduler, кэш толкований, авто-деплой, Alertmanager (SOLUTION §5.3);
playwright, respx, vitest, react-router, redux, CSS-in-JS; отдельный mock-сервис
LLM; воркер ingest; интерфейс эмбеддера с переключателем в проде; порт
классификатора; второй compose-файл; shellcheck; grep текстов в бандле;
`*_clean`-копия каждой вьюхи; персистентный idle-флаг.

## 5. Бюджет файлов

| Файл / каталог | Новый/существующий | Зачем | Требование | Можно избежать? |
|----------------|-------------------|-------|------------|-----------------|
| `Makefile` | новый | единые команды проверки | §10 | нет |
| `backend/pyproject.toml`, `backend/uv.lock`, `backend/Dockerfile`, `backend/.dockerignore` | новые | зависимости, образ api | CON-1 | нет |
| `backend/app/**` | новый | монолит: api, auth, engine, expert, spread, pipeline, rag, llm, daily, bot, events, metrics | REQ-1..20 | нет |
| `backend/migrations/**`, `backend/alembic.ini` | новые | схема §9.4, вьюхи метрик | CON-1, REQ-16 | нет |
| `backend/expert_base/**` | новый | YAML базы (из фикстуры до поставки), промпты, стоп-паттерны | CON-5, D7, D13 | нет |
| `backend/tools/**` | новый | validate_base, ingest, download_models, mem_report, golden_live | CON-5, REQ-6, О-шаги | нет |
| `backend/tests/**` | новый | проверки SOLUTION §15 | все | нет |
| `frontend/**` | новый | один бандл Mini App + веб | REQ-13, REQ-19 | нет |
| `infra/compose.yml`, `infra/env.example`, `infra/env.test`, `infra/env.compose.test`, `infra/prometheus.yml`, `infra/postgres-init/**` | новые | единый стек (dev и prod через переменные), тестовая конфигурация без секретов | CON-1 | нет |
| `infra/grafana/**` | новый | 2 дашборда + provisioning | NFR-6, REQ-16 | нет |
| `infra/k6/spread.js` | новый | нагрузочный сценарий | NFR-1, ASM-6 | нет |
| `infra/deploy/**` | новый | nginx-конфиг app-домена, backup.sh, deploy.sh | NFR-7, D16 | нет |
| `.github/workflows/ci.yml` | новый | CI | NFR-6 | нет |
| `README.md` | существующий | только раздел «Запуск» (фаза 21) | SOLUTION §5.2 | нет |
| `docs/runbook.md` | новый | эксплуатация, деплой, restore, туннель | NFR-7, R8, R11 | нет |
| `.gitignore` | существующий | локальные отчёты | — | нет |
| `design-system/**`, `landing/**`, `deck/**`, остальное `docs/**` | существующие | только чтение в фазах | SOLUTION §12 | — |

**Estimated LOC net: ~8650**

Правило подсчёта LOC для стоп-правила ×2 (для всего плана и для фаз): считаются
код, тесты, конфиги и скрипты. **Не считаются**: lock-файлы (`uv.lock`,
`package-lock.json`), JSON дашбордов Grafana, данные фикстур и базы
(`backend/tests/fixtures/**`, `backend/tests/golden/*.csv`,
`backend/expert_base/*.yaml`).

```
Runtime preconditions (для фаз):
- docker daemon запущен — check: `docker info >/dev/null`
- python 3.12 и uv — check: `python3.12 --version && uv --version`
- node ≥ 20 и npm (фазы 18–22) — check: `node --version && npm --version`
- openssl (фаза 22) — check: `openssl version`
- доступ к PyPI, npm registry, Docker Hub — check: `curl -sSf -o /dev/null --max-time 10 https://pypi.org/simple/ && curl -sSf -o /dev/null --max-time 10 https://registry.npmjs.org/ && docker pull -q hello-world >/dev/null`
- порты 127.0.0.1:55432, 56379, 56333, 58000, 53000, 59090 свободны или заняты стеком arkan-dev — check: `make deps-up` (с фазы 1)
Не нужны фазам (только §9.2): ключ DeepSeek, HuggingFace и модели, токен бота, сервер, туннель.
```

## 6. Трассировка требований

| Требование | Фазы | Проверка |
|------------|------|----------|
| REQ-1 | 6 | 9 и 501 символ → 422, 10 и 500 → 201 |
| REQ-2, ASM-7 | 5, 6, 7, 11 | тема → свой `spread_id` из YAML; `other` → `choice`; golden-set |
| REQ-3 | 7, 11 | 4 типа отказа → текст из YAML, событие `refusal_shown` |
| REQ-4, D13 | 7, 9, 10, 14 | кризис в вопросе, свободном ответе, сверке; LLM недоступна + паттерн → кризис; `abandoned` → 409 на reveal/summary |
| REQ-5, NFR-3 | 4, 6 | hypothesis: воспроизводимость, без повторов; карты в PG до первого LLM-вызова |
| REQ-6, D7, D14, D17 | 8, 9, 10, 14 | непроверенное не показывается; fallback-тексты; выборка только своей карты; RAG/модели недоступны → fallback |
| REQ-7, D2 | 5, 9 | `ask_1/ask_2` по сиду, пустой `ask_2` → `ask_1`; чипы; свободный ответ |
| REQ-8 | 9 | сообщения позиции N содержат ответы 1..N-1 (критерий SOLUTION: проверка промпта) |
| REQ-9, REQ-10, D11 | 10, 12, 14 | итог в истории; resume; несколько незакрытых; профиль в классификации, толковании, утре |
| REQ-11, D15 | 14 | одна карта в сутки; сверка однократна; отклик или `closing` |
| REQ-12, REQ-18 | 2, 3, 12, 13 | без согласия user не создаётся (оба входа); DELETE: каскад, события и сессии отвязаны |
| REQ-13, D19 | 3, 12, 18 | cookie-атрибуты; не-JSON и чужой Origin → 403; один бандл |
| REQ-14 | 12 | две сессии → один user_id; конфликт → отказ |
| REQ-15 | 16, 19 | ссылка с `public_ref`; событие `shared`; вход по ref → `first_source` |
| REQ-16 | 3, 17 | события; SQL-вьюхи против ручного расчёта сценария |
| REQ-17 | 16, 17 | 3 флага в `fraud_flags` + idle во вьюхе; clean-срез исключает |
| REQ-19, D16 | 18, 19, 20, 22 | компоненты импортируются; CSP в nginx-конфиге |
| REQ-20, D5, D20, R11 | 2, 13, 15 | opt-out по умолчанию; тумблер; фиктивные часы; прокси; сетевые сбои |
| REQ-21 | §9.2 О-9 | операционный отчёт |
| NFR-1 | 21, §9.2 О-6 | сценарий k6 (в фазе — смоук), живой прогон с моделями |
| NFR-2, D18 | 6, 7, 17 | `llm_calls` на каждый вызов; 429; дашборд стоимости |
| NFR-4 | 18 | токены как есть; `prefers-reduced-motion` в CSS бандла |
| NFR-5 | 9, 10 | таймаут → позиция нераскрыта; повтор генерирует заново |
| NFR-6 | 1, 17 | `/metrics` и Prometheus — неделя 1; дашборды — фаза 17 (критерий SOLUTION) |
| NFR-7, R8 | 22, §9.2 О-8 | backup → `pg_restore --list` локально; restore и crontab на сервере |
| CON-4 | 7 | смена модели — только переменные окружения |
| CON-5, D12 | 5, 6, 8 | валидатор; ingest только `ready`; `MAJOR_ONLY` |
| CON-6 | 12 | initData HMAC |
| R10 | 6 | 6-й расклад за сутки → 429 |

## 7. Семантика операций

Источник истины — `SOLUTION.md` §10, §9.5, §9.6 (с поправками D16–D20). План
уточняет исполнимые детали:

- мутации (`POST/PATCH/DELETE`) принимают только `application/json` и `Origin`,
  равный `APP_ORIGIN` (в тестах `https://testserver`), иначе 403 (D19);
- формат ошибок: `{"error": "<code>", "message": "<текст в тоне GUIDE>"}`; коды — закрытый перечень SOLUTION §9.5 (D21): `unauthorized`, `forbidden`, `not_found`, `conflict`, `validation`, `rate_limited`, `llm_unavailable`, плюс `http_error` — catch-all для ответов фреймворка без предметного кода; новый код вводится только правкой §9.5;
- форма позиции в ответах: у каждой позиции всегда есть `position_number`, `position_name` и булев `revealed`; у раскрытых (`revealed: true`) добавляется `card_id`, а также `interpretation`, `verify_status`, вопрос и варианты — они присутствуют в объекте и равны `null`, пока соответствующая фаза их не заполняет (толкование и `verify_status` — фаза 9, вопрос и варианты — фаза 9). Флаг карту не раскрывает, поэтому запрет «только номер и название» им не нарушается;
- 404 — чужой или несуществующий ресурс; 409 — нарушение порядка или статуса
  (reveal не первой нераскрытой позиции или при неотвеченной предыдущей; answer
  не в своём окне; reveal/summary расклада не в статусе `active`; сверка без
  карты); 429 — лимит D18; 503 — LLM недоступна там, где fallback не предусмотрен;
- порядок расклада: reveal 1 → answer 1 → reveal 2 → … → reveal N → answer N →
  summary; answer позиции N допускается до итога;
- идемпотентный повтор (reveal, summary, draw, checkin, consent) событие не пишет;
- строки `llm_calls` пишутся в отдельной короткой транзакции и переживают откат
  запроса.

Расхождение с `SOLUTION.md` → стоп, `BLOCKED_FOR_SOLUTION_AMENDMENT`.

## 8. Жизненный цикл состояния

Источник истины — `SOLUTION.md` §11. Исполнимые уточнения:

- сутки МСК — только через `backend/app/msk.py` (`msk_now()`, `msk_today()`),
  в тестах подменяются через этот модуль;
- тестовая БД `arkan_test` пересоздаётся фикстурой pytest на сессию;
- Qdrant-коллекция в тестах — `expert_base_test`, удаляется фикстурой;
- модели ONNX — в `MODELS_DIR` (по умолчанию `${HOME}/.cache/arkan-models`),
  в репозиторий не попадают; в compose монтируются в api только для чтения;
  отсутствие моделей не мешает старту api (загрузка ленивая, отказ →
  `RagUnavailable` → fallback по §9.6).

## 9. Фазы

### 9.1 Фазы для агента

Каждая фаза самодостаточна. Внешняя сеть — только PyPI, npm, Docker Hub. LLM,
Telegram, эмбеддер и реранкер в тестах — подделки через точки подмены, заданные
фазами 7, 8 и 15. Тесты запускаются с `infra/env.test` (`MAJOR_ONLY=true`,
`LLM_FAKE=false`, `BOT_ENABLED=false`).

### Фаза 1 `[]` — Скелет backend, compose, CI (неделя 1)

**Цель**: `make deps-up`, `make lint`, `make typecheck`, `make test`, `make smoke` работают; CI повторяет lint/typecheck/test.

**Разрешённые файлы**: `Makefile`, `backend/pyproject.toml`, `backend/uv.lock`, `backend/Dockerfile`, `backend/.dockerignore`, `backend/app/__init__.py`, `backend/app/main.py`, `backend/app/config.py`, `backend/app/db.py`, `backend/app/msk.py`, `backend/tests/__init__.py`, `backend/tests/conftest.py`, `backend/tests/test_health.py`, `backend/tests/test_config.py`, `backend/tests/test_msk.py`, `infra/compose.yml`, `infra/env.example`, `infra/env.test`, `infra/env.compose.test`, `infra/prometheus.yml`, `.github/workflows/ci.yml`, `.gitignore`

**Запрещено**: эндпоинты кроме `/healthz` и `/metrics`; alembic; бизнес-логика; зависимости вне §4.

**Задачи**:
1. `backend/pyproject.toml` (uv, python 3.12): зависимости из §4; ruff (line-length 100); mypy strict для `app/`; pytest `asyncio_mode=auto`.
2. `app/config.py` (pydantic-settings) — полный список переменных всего плана, чтобы поздние фазы их не добавляли: `ENV`, `APP_ORIGIN`, `DATABASE_URL`, `DB_POOL_SIZE` (20), `DB_MAX_OVERFLOW` (20), `REDIS_URL`, `QDRANT_URL`, `QDRANT_COLLECTION`, `DAILY_SECRET`, `SPREADS_PER_DAY` (5), `MAJOR_ONLY` (false), `LLM_BASE_URL`, `LLM_API_KEY`, `LLM_MODEL`, `LLM_THINKING` (false), `LLM_TIMEOUT_S` (30), `LLM_PRICE_IN_PER_M`, `LLM_PRICE_OUT_PER_M`, `LLM_FAKE` (false), `LLM_FAKE_DELAY_MS` (0), `MODELS_DIR`, `RERANKER_ENABLED` (true), `BOT_ENABLED` (false), `BOT_TOKEN`, `BOT_USERNAME`, `MINI_APP_URL`, `TELEGRAM_API_BASE` (`https://api.telegram.org`), `TELEGRAM_PROXY` (пусто), `FRAUD_SIGNUPS_PER_SOURCE_HOUR` (20), `FRAUD_MIN_INTERVAL_MS` (1500). Проверка: `ENV=prod` и `LLM_FAKE=true` → ошибка старта.
3. `app/main.py` — FastAPI с lifespan; `/healthz` → `{"status":"ok"}`; `/metrics` (prometheus-client).
4. `app/db.py` — async engine (`pool_size`, `max_overflow` из конфига) и sessionmaker.
5. `app/msk.py` — `msk_now()`, `msk_today()` (Europe/Moscow).
6. `backend/Dockerfile` — python:3.12-slim, `pip install uv` (образ uv с ghcr.io недоступен агенту), `uv sync --frozen` по lock, `uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 1`.
7. `infra/compose.yml` (единственный compose-файл; `name: arkan-dev`): postgres:16, redis:7, qdrant/qdrant:v1.18.2 (healthcheck `bash -c ':> /dev/tcp/127.0.0.1/6333'`), api (build `../backend`, `env_file: ${API_ENV_FILE:-env.compose.test}`, порт `${API_BIND:-127.0.0.1:58000}:8000`, том `${MODELS_DIR:-${HOME}/.cache/arkan-models}:/models:ro`), prometheus (`127.0.0.1:59090`), grafana (`127.0.0.1:53000`); api, prometheus, grafana — профиль `full`; у всех `restart: unless-stopped` и healthcheck; порты зависимостей `127.0.0.1:55432/56379/56333`; пароли из переменных с тестовыми значениями по умолчанию.
8. `infra/env.test` — для тестов на хосте (`DATABASE_URL` на `127.0.0.1:55432/arkan_test`, `REDIS_URL=redis://127.0.0.1:56379/1`, `QDRANT_COLLECTION=expert_base_test`, `APP_ORIGIN=https://testserver`, `MAJOR_ONLY=true`, фиктивные ключи); `infra/env.compose.test` — для api в контейнере (`postgres:5432`, `redis:6379`, `qdrant:6333`, `MODELS_DIR=/models`, `LLM_FAKE=true`, `ENV=test`, `APP_ORIGIN=https://app.test`, `MAJOR_ONLY=true`); `infra/env.example` — шаблон прод-переменных без значений с комментариями.
9. `infra/prometheus.yml` — scrape `api:8000/metrics`.
10. `Makefile` (все цели завершаются; утилита `timeout` не используется — на macOS её нет): `deps-up` (`docker compose -f infra/compose.yml up -d --wait --wait-timeout 180 postgres redis qdrant`), `deps-down`, `up` (профиль full, `--build --wait --wait-timeout 600`), `down`, `lint` (`uv run --project backend ruff check backend` + `ruff format --check backend`), `typecheck` (`uv run --project backend mypy --config-file backend/pyproject.toml backend/app`), `test` (`deps-up`, затем `uv run --project backend --env-file infra/env.test pytest backend/tests`), `smoke` (`up`, затем `curl -sf --max-time 5 http://127.0.0.1:58000/healthz` и `/metrics` содержит `python_info`, затем `down` в любом исходе).
11. `.github/workflows/ci.yml`: push/PR, `timeout-minutes: 20`; job backend с services postgres/redis/qdrant, опубликованными на те же порты (`55432:5432` и т.д.); шаги lint, typecheck, pytest.
12. Тесты: healthz 200; metrics содержит `python_info`; `msk_today()` в 20:59:59 и 21:00:00 UTC — разные даты; `ENV=prod` + `LLM_FAKE=true` → ошибка конфигурации.

**Проверка фазы**: `make lint && make typecheck && make test` → exit 0; `make smoke` → exit 0; `make down` → exit 0.

**Фокус верификатора**: зависимости по §4; `--workers 1`; все порты на 127.0.0.1; один compose-файл.

**Критерий выхода**: команды зелёные; `uv run --project backend python -c "import yaml; yaml.safe_load(open('.github/workflows/ci.yml'))"` → exit 0.

**Оценка**: ~300 LOC net

### Фаза 2 `[]` — Модели и миграции (неделя 1)

**Цель**: схема `SOLUTION.md` §9.4 создаётся Alembic-миграцией и откатывается.

**Разрешённые файлы**: `backend/app/models/**`, `backend/alembic.ini`, `backend/migrations/**`, `backend/tests/conftest.py`, `backend/tests/test_models.py`, `Makefile`

**Запрещено**: таблицы и поля вне §9.4; индексы кроме FK, уникальных (`users.telegram_id`, `users.public_ref`, PK `daily_cards(user_id,date)`, PK `spread_positions(spread_id,position_number)`) и `(user_id, created_at)` у `events` и `llm_calls`.

**Задачи**:
1. SQLAlchemy 2 модели ровно по §9.4: `users` (`push_enabled` по умолчанию true), `sessions`, `spreads` (включая `summary_status`), `spread_positions`, `daily_cards` (`checkin_variant`, `checkin_answer`, `checkin_reply`), `events` (тип включает `crisis_shown`), `llm_calls` (шаг включает `checkin`), `fraud_flags`.
2. Внешние ключи: `spreads`, `daily_cards`, `llm_calls`, `fraud_flags` → `users ON DELETE CASCADE`; `spread_positions` → `spreads ON DELETE CASCADE`; `sessions.user_id` и `events.user_id` → `ON DELETE SET NULL`; `events.session_id` — без FK.
3. Первая ревизия Alembic; цель `make db-create` (создаёт БД из `DATABASE_URL`, если её нет: `CREATE DATABASE` через `docker compose exec -T postgres psql`, идемпотентно); `make migrate` = `db-create`, затем `uv run --project backend --env-file infra/env.test alembic -c backend/alembic.ini upgrade head`.
4. Порядок в `make up` (SOLUTION §9.8 «миграция до старта нового кода»): `deps-up` → `docker compose … build api` → `docker compose … run --rm api alembic upgrade head` → `docker compose … --profile full up -d --wait` (api стартует уже на актуальной схеме).
5. conftest: БД `arkan_test` — создать → `upgrade head` → отдать → удалить.
6. Значения перечислений, не заданные в §9.4, фиксируются здесь: `llm_calls.status` — `ok|error`; `fraud_flags.flag` — только флаги, которые действительно хранятся (`signup_burst|fast_requests|duplicate_question`); `idle` не хранится (он вычисляется вьюхой `v_flagged_users` в фазе 17).
7. `llm_calls.tokens_in`, `tokens_out`, `cost_usd` — `NOT NULL` без значения по умолчанию: пропущенная запись должна падать, а не превращаться в ноль.

**Проверка фазы**: `make test` → exit 0 (в том числе на машине, где БД `arkan_test` ещё нет); тесты: создание каждой сущности; дубль `telegram_id` → IntegrityError; удаление user удаляет его расклады, позиции и дневные карты, оставляет события (`user_id=NULL`) и сессию (`user_id=NULL`); `downgrade base` → `upgrade head` без ошибок; вставка `llm_calls` без токенов → ошибка (нет значений по умолчанию); `make smoke` → exit 0 (api стартовал после миграции).

**Фокус верификатора**: поля один-в-один с §9.4; каскады по §11.

**Критерий выхода**: миграция накатывается и откатывается; `alembic revision --autogenerate` на накатанной схеме даёт пустой diff (модели и миграция совпадают).

**Оценка**: ~800 LOC net (каркас Alembic ~140, автогенерированная миграция на 8 таблиц ~200, модели ~250, тесты и фикстуры ~230; поправка 18.09 — прежние ~350 не учитывали каркас и генерацию)

### Фаза 3 `[]` — Сессии, согласие, события, CSRF (неделя 1)

**Цель**: гость получает сессию до согласия; согласие создаёт user; события append-only; мутации защищены (D19).

**Разрешённые файлы**: `backend/app/auth/__init__.py`, `backend/app/auth/sessions.py`, `backend/app/api/__init__.py`, `backend/app/api/deps.py`, `backend/app/api/routes_auth.py`, `backend/app/api/routes_events.py`, `backend/app/api/errors.py`, `backend/app/events/__init__.py`, `backend/app/events/writer.py`, `backend/app/main.py`, `backend/tests/conftest.py`, `backend/tests/test_auth_sessions.py`, `backend/tests/test_events.py`

**Запрещено**: user без `consent_at`; UPDATE/DELETE событий; сессии для `/healthz` и `/metrics`.

**Задачи**:
1. `sessions.py`: middleware (кроме `/healthz`, `/metrics`) — нет валидной cookie → строка `sessions` (user_id=NULL) и заголовок `Set-Cookie: arkan_sid=<id>; HttpOnly; Secure; SameSite=None; Partitioned; Max-Age=15552000; Path=/`, собранный вручную (параметр `partitioned` в Starlette требует Python 3.14); `last_seen` обновляется.
2. `deps.py`: `current_session`, `current_user` (401 без user), `require_json_same_origin` (мутация без `application/json` или с `Origin` ≠ `APP_ORIGIN` → 403).
3. `POST /auth/anonymous` → 200 (идемпотентно); `POST /auth/consent` → user с `public_ref` (8 символов base32), `consent_at`, привязка к сессии; повтор — тот же user, без события.
4. `writer.py`: `write_event(type, session_id, user_id, layer, payload)` — только INSERT.
5. `POST /events` — только `app_open|push_opened` с `source`; источник гостя хранится в payload; при согласии первый непустой источник сессии записывается в `users.first_source`; у существующего user `first_source` не перезаписывается.
6. `errors.py`: формат §7.
7. conftest: ASGI-клиент с `base_url="https://testserver"` и заголовком `Origin: https://testserver`.

**Проверка фазы**: `make test` → exit 0; тесты: (1) первый запрос → `Set-Cookie` с `Secure`, `SameSite=None`, `Partitioned`, строка в `sessions`; (2) второй запрос с cookie — та же сессия; (3) `/healthz` не создаёт сессию; (4) `app_open` гостя → событие с `user_id=NULL`; (5) consent → user и сессия связаны, источник перенесён; (6) повторный consent → тот же user, событий не прибавилось; (7) второй `app_open` с другим источником не меняет `first_source`; (8) `POST /events` с `card_revealed` → 422; (9) `text/plain` → 403; (10) чужой `Origin` → 403.

**Фокус верификатора**: атрибуты cookie; нет пути создать user без согласия.

**Критерий выхода**: воронка шага 1 наблюдаема до согласия.

**Оценка**: ~350 LOC net

### Фаза 4 `[]` — Движок колоды (неделя 1)

**Цель**: чистые детерминированные функции D3.

**Разрешённые файлы**: `backend/app/engine/__init__.py`, `backend/app/engine/deck.py`, `backend/app/engine/cards.py`, `backend/tests/test_deck.py`

**Запрещено**: БД, сеть, время и глобальное состояние в `engine/`.

**Задачи**:
1. `cards.py`: 78 `card_id` в порядке `docs/expert-brief.md` §8 (22 старших, затем wands, cups, swords, pentacles × ace…king), `is_major`.
2. `deck.py`: `new_seed() -> bytes` (32 байта `secrets`); `draw(seed, n, major_only) -> list[str]` — Fisher–Yates по потоку `HMAC-SHA256(seed, counter.to_bytes(8,"big"))` с отбраковкой смещения; `daily_seed(secret, user_id, date) -> bytes` = HMAC(secret, f"{user_id}:{date.isoformat()}"); `ask_variant(seed, position) -> 1|2`.

**Проверка фазы**: `make test` → exit 0; hypothesis: (1) детерминизм `draw`; (2) без повторов для n∈[1,78]; (3) `major_only` → только старшие, n>22 → ValueError; (4) `daily_seed` различается по дате и user; (5) сид `bytes(32)` → зафиксированный список из 3 карт (регрессия формата); (6) на 20 000 сидов каждая из 78 карт встречается первой.

**Фокус верификатора**: нет смещения по модулю; чистота модуля.

**Критерий выхода**: свойства зелёные.

**Оценка**: ~200 LOC net

### Фаза 5 `[]` — Экспертная база: валидатор, YAML, загрузчик (неделя 1)

**Цель**: CSV из Google Sheets → построчный отчёт → YAML; приложение читает YAML.

**Разрешённые файлы**: `backend/tools/__init__.py`, `backend/tools/validate_base.py`, `backend/app/expert/__init__.py`, `backend/app/expert/base.py`, `backend/expert_base/**`, `backend/tests/fixtures/expert_csv/**`, `backend/tests/test_validate_base.py`, `backend/tests/test_expert_base.py`, `Makefile`

**Запрещено**: автоправки строк; строки со `status≠ready` в YAML; схема, отличная от `docs/expert-brief.md` §4.

**Задачи**:
1. Фикстура CSV (тексты помечены «ТЕСТОВЫЕ ДАННЫЕ», кроме взятых из брифа и UI-кита): `cards` — все 22 старших аркана (Башня, Жрица, Звезда — из брифа и `design-system/ui_kits/arkan-miniapp/data.js`, остальные — короткие шаблонные тексты, проходящие валидатор); `spreads` — три расклада, по одному на категорию (`three_threads`/choice из брифа, по 3 позиции у остальных); `positions` — у позиций 2 и 3 `three_threads` нет `ask_2` (как в брифе); `refusals` — 5 типов; `crisis_resources` — 2 строки; `checkin_texts` — 2 строки с `options` и `closing`; одна строка `draft`.
2. `validate_base.py <csv_dir> <out_dir>`: колонки и обязательность; предложения ≤ 25 слов и длины полей по брифу; формат `;`; чипы 1–4 слова; заполненный `ask_2` без `ask_2_options` → ошибка; `positions_count` = число позиций; `spread_id` и `card_id` существуют (`engine/cards.py`); стоп-слова предсказаний → предупреждение; только `status=ready`; отчёт `строка: код: сообщение`; exit 1 при ошибках.
3. `expert_base/` — YAML из фикстуры; `rules.md` (заглушка до `interpretation_rules.md` эксперта); `stop_patterns.yaml` (кризис: 10–20 выражений; предсказания: слова из брифа §5).
4. `app/expert/base.py`: загрузка YAML; расклады индексируются по `spread_id`, отдельный индекс «тема → расклад» строится при загрузке и падает с ошибкой, если на тему пришло больше одного расклада (иначе второй молча теряется; важно для ASM-7); `get_card`, `get_spread_for_category` (неизвестная категория → `choice`, комментарий ASM-7), `get_refusal`, `get_crisis_resources`, `get_checkin_text(variant)`, `position_question(position, variant)` (пустой `ask_2` → `ask_1` с его вариантами).
5. Слова-предсказания и кризисные паттерны живут только в `expert_base/stop_patterns.yaml`; валидатор читает их оттуда, своей копии списка не держит.
6. `make validate-base CSV=<dir> OUT=<dir>`.

**Проверка фазы**: `make test` → exit 0; тесты: чистая фикстура → exit 0, YAML совпадает с `expert_base/`; порчи (длинное предложение, дубль позиции, `ask_2` без вариантов, неизвестный `card_id`) → exit 1 и строка отчёта; `draft` не в YAML; «будет» → предупреждение, exit 0; неизвестная категория → `choice`; `position_question(<позиция 2 three_threads>, 2)` → `ask_1`.

**Фокус верификатора**: схема строго по брифу.

**Критерий выхода**: волны эксперта прогоняются одной командой.

**Оценка**: ~800 LOC net считаемых (валидатор шести листов ~480, загрузчик ~100, тесты ~200; фикстуры и YAML базы не считаются по правилу §5; поправка 18.09 — прежние ~350 не учитывали объём построчных правил)

### Фаза 6 `[]` — Машина раскладов без генерации (неделя 1)

**Цель**: `POST /spreads` создаёт расклад с предвытянутыми картами; ответы и история работают; лимит D18; `MAJOR_ONLY`.

**Разрешённые файлы**: `backend/app/spread/__init__.py`, `backend/app/spread/service.py`, `backend/app/api/routes_spreads.py`, `backend/app/redis.py`, `backend/app/main.py`, `backend/tests/conftest.py`, `backend/tests/factories.py`, `backend/tests/test_spreads.py`

**Запрещено**: вызовы LLM; отдача `card_id` нераскрытых позиций; изменение прежних раскладов; эндпоинты reveal и summary.

**Задачи**:
0. `app/redis.py` — общий async-клиент Redis (`get_redis()`), переиспользуется фазами 12, 13, 16; conftest: `FLUSHDB` тестовой базы Redis (`/1`) перед каждым тестом.
1. `service.create_spread(user, question, idempotency_key)`: лимит `SPREADS_PER_DAY` — подсчёт раскладов user за сутки МСК в PG (без Redis) → 429; `Idempotency-Key`: `SET NX key pending EX 600` → создание → значение = id; ключ с id → вернуть тот расклад; ключ `pending` → 409; Redis недоступен → идемпотентность пропускается, расклад создаётся (fail-open, §9.6); категория пока `choice` (одна строка, заменяется фазой 7); структура из базы; `new_seed` + `draw(seed, n, MAJOR_ONLY)`; позиции с `card_id`, `ask_variant`; событие `question_sent`.
2. `routes_spreads.py`: `POST /spreads` (10–500 символов), `GET /spreads` (по `created_at` убыв.; статус, вопрос, карты раскрытых позиций), `GET /spreads/{id}` (раскрытые позиции полностью; нераскрытые — только номер и название; `next_action`: `reveal <N>` | `answer <N>` | `summary` | `done`), `POST /spreads/{id}/answer {position, answer}` — окно ответа по §7, иначе 409; событие `clarifying_answer` при первом ответе позиции.
3. `tests/factories.py`: user с сессией; пометка позиции раскрытой напрямую в БД.

**Проверка фазы**: `make test` → exit 0; тесты: (1) позиции в PG равны `draw(seed, n, True)`; (2) тот же `Idempotency-Key` → тот же id, строк не прибавилось; (3) JSON `GET` не содержит `card_id` нераскрытых позиций; (4) answer нераскрытой → 409; (5) позиция 1 раскрыта фабрикой → answer 200, `next_action=reveal 2`; (6) повторный answer до раскрытия позиции 2 → перезапись, после (фабрикой) → 409; (7) чужой расклад → 404; (8) 6-й расклад за сутки → 429, в следующие сутки → 201; (9) второй расклад не меняет первый; (10) 9 и 501 символ → 422, 10 и 500 → 201; (11) Redis на неверном порту → расклад создаётся, 201.

**Фокус верификатора**: утечка будущих карт; сутки только через `msk.py`.

**Критерий выхода**: неделя 1 закрыта.

**Оценка**: ~400 LOC net

### Фаза 7 `[]` — LLM-адаптер, классификация, отказы, кризис (неделя 2)

**Цель**: классификатор за адаптером; отказы и кризис на первом вопросе и в свободных ответах.

**Разрешённые файлы**: `backend/app/llm/__init__.py`, `backend/app/llm/adapter.py`, `backend/app/llm/fake.py`, `backend/app/pipeline/__init__.py`, `backend/app/pipeline/classify.py`, `backend/app/pipeline/crisis.py`, `backend/app/spread/service.py`, `backend/app/api/routes_spreads.py`, `backend/app/main.py`, `backend/expert_base/prompts/classify.md`, `backend/tests/conftest.py`, `backend/tests/llm_mock.py`, `backend/tests/test_classify.py`, `backend/tests/test_crisis.py`

**Запрещено**: тексты отказов и кризиса из промпта; решение о кризисе по одному выражению при доступной LLM.

**Задачи**:
1. `adapter.py`: `complete_json(step, messages, user_id, spread_id)`; клиент `openai.AsyncOpenAI` (`LLM_BASE_URL`, `LLM_API_KEY`, `LLM_MODEL`, `LLM_THINKING`), таймаут `LLM_TIMEOUT_S`, одна повторная попытка; единственная точка подмены — `set_client(client)`; каждая попытка пишет `llm_calls` в отдельной короткой транзакции (step, model, токены, `cost_usd` по ценам из конфига, status); после двух неудач — `LlmUnavailable`.
2. `fake.py`: при `LLM_FAKE=true` через `set_client` ставится клиент с детерминированными ответами по шагу и задержкой `LLM_FAKE_DELAY_MS`.
3. `tests/llm_mock.py` и conftest: **autouse**-подделка через тот же `set_client` с ответами по умолчанию (classify → `choice`, crisis → `ok`, генерации → короткий текст, судья → `pass`), чтобы тесты фаз 3–6 и последующих не ходили в сеть; фикстура `llm_mock` переопределяет сценарий ответов и исключений по шагам и ведёт журнал отправленных сообщений.
4. `classify.py`: промпт `prompts/classify.md`; вход — вопрос, профиль (пусто до фазы 12), флаг совпадения кризисных паттернов; выход `relationships|work|choice|other|medical|psychotherapy|legal|financial|crisis`; `other` → `choice`.
5. `crisis.py`: `check_free_text(text) -> ok|crisis` — паттерны как сигнал в промпте; `LlmUnavailable` → `crisis`, если паттерн совпал, иначе `ok`.
6. `create_spread`: категория от классификатора; отказ → `{status:"refusal", type, text, follow_up}` + `refusal_shown` (без расклада); кризис → `{status:"crisis", text, resources}` + `crisis_shown`; `LlmUnavailable` → 503.
7. answer: текст, не совпадающий ни с одним чипом позиции, → `check_free_text`; `crisis` → расклад `abandoned`, `crisis_shown`, ответ `{status:"crisis",…}`; чип LLM не вызывает.

**Проверка фазы**: `make test` → exit 0; тесты: (1) три темы → три разных `spread_id` фикстуры, `other` → `choice`; (2) 4 отказа → тексты YAML, расклада нет; (3) кризис в вопросе → расклада нет; (4) LLM падает дважды → 503, 2 строки `llm_calls` со статусом ошибки сохранились; (5) кризисный свободный ответ → `abandoned`; (6) «умираю от смеха» при вердикте `ok` → принят; (7) LLM недоступна: с паттерном → кризис, без → принят; (8) чип → 0 вызовов; (9) подмена `LLM_MODEL`/`LLM_BASE_URL` в окружении меняет параметры клиента (CON-4); (10) `LLM_FAKE=true` → детерминированный ответ без сети.

**Фокус верификатора**: паттерн — только сигнал; одна точка подмены клиента.

**Критерий выхода**: границы продукта работают во всех текстах расклада.

**Оценка**: ~400 LOC net

### Фаза 8 `[]` — RAG: эмбеддинги, реранкер, хранилище, ingest (неделя 2)

**Цель**: коллекция в Qdrant; точная выборка по карте; семантика только внутри карты и по правилам.

**Разрешённые файлы**: `backend/app/rag/__init__.py`, `backend/app/rag/embed.py`, `backend/app/rag/rerank.py`, `backend/app/rag/store.py`, `backend/app/rag/retrieve.py`, `backend/tools/ingest.py`, `backend/tools/download_models.py`, `backend/tools/mem_report.py`, `backend/tests/conftest.py`, `backend/tests/fake_embedder.py`, `backend/tests/test_rag.py`, `Makefile`

**Запрещено**: поиск смысла карты без фильтра `card_id`; отдельный сервис моделей; скачивание моделей в тестах; переключатель эмбеддера в конфиге.

**Задачи**:
1. `embed.py`: класс ONNX-эмбеддера (BGE-M3 int8, onnxruntime + tokenizers, файлы из `MODELS_DIR`), ленивая загрузка при первом вызове; нет файлов или ошибка загрузки → `RagUnavailable`; модульные `get_embedder()` и `set_embedder()` для подмены в тестах.
2. `rerank.py`: ONNX bge-reranker-v2-m3 с той же ленивой загрузкой; `get_reranker()`/`set_reranker()`; `RERANKER_ENABLED=false` → порядок по скору эмбеддинга.
3. `tests/fake_embedder.py`: детерминированный хэш-эмбеддер (1024) и тождественный реранкер; **autouse**-фикстура conftest ставит оба через `set_embedder`/`set_reranker`; session-фикстура делает ingest `backend/expert_base` в `QDRANT_COLLECTION` (`expert_base_test`) и удаляет коллекцию в конце — её используют тесты фаз 9, 10, 14.
4. `store.py`: коллекция (`QDRANT_COLLECTION`), payload `card_id`, `topic`, `kind` (`card|position|rules|example`), `text`; полная перегрузка.
5. `retrieve.py`: `card_context(card_id, topic)` — чанки карты по фильтру; `semantic(query, card_id)` — top-10 внутри карты и `kind in (rules, example)`, реранк до top-4; любая ошибка Qdrant (недоступен, нет коллекции) или моделей → `RagUnavailable`.
6. `tools/ingest.py <yaml_dir>` — YAML → чанки → upsert; печатает число точек.
7. `tools/download_models.py` — HuggingFace (`gpahal/bge-m3-onnx-int8`, `Sophia-AI/bge-reranker-v2-m3-onnx`) в `MODELS_DIR`, таймаут соединения 10 с, 3 попытки, проверка размеров; в фазе не запускается.
8. `tools/mem_report.py` — загрузка моделей, 50 запросов, пиковый RSS с реранкером и без; в фазе не запускается.
9. Makefile: `ingest YAML=<dir>`, `models`, `mem-report`.

**Проверка фазы**: `make test` → exit 0; тесты (хэш-эмбеддер): (1) ingest фикстуры → число точек равно расчёту из YAML; (2) `card_context("tower","choice")` — только `tower`; (3) `semantic(…, "tower")` не возвращает чужих карт; (4) `RERANKER_ENABLED=false` работает; (5) повторный ingest не удваивает точки; (6) Qdrant на неверном порту → `RagUnavailable`; (7) реальный эмбеддер (без подмены) с пустым `MODELS_DIR` → `RagUnavailable`; (8) `semantic()` с фейками возвращает непустой результат (путь без fallback доступен тестам фазы 9); (9) несуществующая коллекция → `RagUnavailable`.

**Фокус верификатора**: фильтр карты во всех путях; модели не скачиваются.

**Критерий выхода**: слой готов к пайплайну.

**Оценка**: ~400 LOC net

### Фаза 9 `[]` — Толкование: генерация, судья, fallback, reveal (неделя 2)

**Цель**: `POST /spreads/{id}/reveal` по REQ-6, D7, D14, NFR-5.

**Разрешённые файлы**: `backend/app/pipeline/interpret.py`, `backend/app/pipeline/judge.py`, `backend/app/pipeline/generate_checked.py`, `backend/app/spread/service.py`, `backend/app/api/routes_spreads.py`, `backend/expert_base/prompts/interpret.md`, `backend/expert_base/prompts/judge.md`, `backend/tests/test_reveal.py`

**Запрещено**: показ текста без вердикта `pass`; третья генерация; реранкер в проверке.

**Задачи**:
1. `generate_checked(step, build_messages, check_context, fallback_text)` — общий цикл (фазы 10 и 14): генерация → судья → при провале одна перегенерация → при повторном провале `fallback_text`; судья недоступен или невалидный JSON = провал; `LlmUnavailable` генерации — пробрасывается; результат `(text, passed|fallback)`.
2. `judge.py`: вход — текст, чанки карты, `not_to_say`, совпавшие стоп-паттерны предсказаний; выход `{verdict, reason}`.
3. `interpret.py`: сообщения — правила тона (GUIDE, `expert_base/rules.md`), `card_context`, `semantic`, вопрос, позиция, ответы 1..N-1, профиль (пусто до фазы 12); 2–4 предложения; `RagUnavailable` → сразу fallback без генерации.
4. reveal: расклад не `active` → 409; позиция не первая нераскрытая или предыдущая не отвечена → 409; `SELECT … FOR UPDATE` строки позиции; уже раскрыта → сохранённое без LLM и без события; fallback = `meaning_<тема>` карты; запись `interpretation`, `verify_status`, `revealed_at`; событие `card_revealed` (payload `verify_status`); `LlmUnavailable` → 503, позиция нераскрыта; ответ содержит `position_question(position, ask_variant)` и варианты.

**Проверка фазы**: `make test` → exit 0; тесты (`llm_mock`, хэш-эмбеддер): (1) pass → `passed`; (2) fail → реген → pass; (3) fail, fail → fallback из YAML, `verify_status=fallback`; (4) судья кидает таймаут → текст генерации не отдан; (5) повторный reveal → тот же текст, 0 новых `llm_calls`, 0 новых событий; (6) два одновременных reveal (`asyncio.gather`) → одна генерация, одинаковые ответы; (7) генерация падает дважды → 503, `revealed_at IS NULL`; следующий вызов генерирует; (8) сообщения позиции 2 содержат ответ позиции 1; (9) `RagUnavailable` → fallback без вызова генерации; (10) reveal 2 до answer 1 → 409; (11) `abandoned` → 409; (12) позиция 2 `three_threads` с `ask_variant=2` → вопрос `ask_1`.

**Фокус верификатора**: ни один путь не отдаёт непроверенный текст.

**Критерий выхода**: карта раскрывается с проверенным толкованием.

**Оценка**: ~400 LOC net

### Фаза 10 `[]` — Итог, история, продолжение (неделя 2)

**Цель**: `POST /spreads/{id}/summary` по D17; resume по D11.

**Разрешённые файлы**: `backend/app/pipeline/summary.py`, `backend/app/spread/service.py`, `backend/app/api/routes_spreads.py`, `backend/expert_base/prompts/summary.md`, `backend/tests/test_summary.py`

**Запрещено**: итог при нераскрытых позициях; новые fallback-контракты.

**Задачи**:
1. `summary.py` через `generate_checked`; fallback-шаблон: для каждой позиции «<название позиции> — <карта>» и её сохранённое толкование.
2. summary: `SELECT … FOR UPDATE` строки `spreads`; итог есть → вернуть его без LLM и события; расклад не `active` → 409; не все позиции раскрыты → 409; запись `summary`, `summary_status`, `status=completed`, `completed_at`; событие `summary_viewed`; `LlmUnavailable` → 503, ничего не сохранено.

**Проверка фазы**: `make test` → exit 0; тесты: (1) полный флоу через API: вопрос → reveal 1 → answer 1 → reveal 2 → answer 2 → reveal 3 → answer 3 → summary → `completed`; (2) повторный summary → без LLM и без события; (3) двойной провал судьи → шаблон с тремя названиями позиций, `summary_status=fallback`; (4) LLM недоступна → 503, статус `active`; (5) два незакрытых расклада в истории, `GET` второго даёт верный `next_action`; (6) summary до раскрытия всех → 409; (7) summary `abandoned` → 409; (8) два одновременных summary → одна генерация, одно событие `summary_viewed`.

**Фокус верификатора**: итог не показывает непроверенного текста.

**Критерий выхода**: сквозной сценарий большого расклада зелёный.

**Оценка**: ~300 LOC net

### Фаза 11 `[]` — Golden-set классификатора (неделя 2)

**Цель**: размеченный набор и воспроизводимая проверка маршрутизации классификации.

**Разрешённые файлы**: `backend/tests/golden/classification.csv`, `backend/tests/test_golden.py`, `backend/tools/golden_live.py`, `Makefile`, `.gitignore`

**Запрещено**: реальная LLM в `make test`.

**Задачи**:
1. `classification.csv`: `text`, `point` (`question|answer|checkin`), `expected`; ≥ 36 строк: по 5 на тему, 4 вне тем, по 3 на отказ, 6 кризисных (по 2 на точку), 3 ложных срабатывания паттернов; шапка «разметка команды, требует подтверждения эксперта».
2. `test_golden.py`: для каждой строки сообщения собираются и содержат текст и флаг паттерна; при ответе мока = `expected` маршрут правильный (структура / отказ / кризис / принят); CSV содержит ≥ 36 строк и все классы.
3. `tools/golden_live.py`: прогон против LLM из `.env`, таймаут 30 с на вызов, отчёт в `infra/golden-report.local.md`; exit 1 при точности < 0.9 по любому классу или любом пропущенном кризисе; в фазе не запускается.
4. `make golden-live`; `.gitignore`: `infra/*.local.md`.

**Проверка фазы**: `make test` → exit 0.

**Фокус верификатора**: живой вызов недостижим из `make test`.

**Критерий выхода**: golden-set готов к О-3.

**Оценка**: ~200 LOC net

### Фаза 12 `[]` — Telegram-вход, привязка, профиль (неделя 3)

**Цель**: REQ-14; REQ-18 для Telegram; профиль в контексте (REQ-10).

**Разрешённые файлы**: `backend/app/auth/telegram.py`, `backend/app/auth/linking.py`, `backend/app/api/routes_auth.py`, `backend/app/spread/profile.py`, `backend/app/pipeline/classify.py`, `backend/app/pipeline/interpret.py`, `backend/app/spread/service.py`, `backend/tests/test_telegram_auth.py`, `backend/tests/test_linking.py`, `backend/tests/test_profile_context.py`

**Запрещено**: user без `consent: true`; хранение initData.

**Задачи**:
1. `telegram.py`: `secret = HMAC_SHA256(key=b"WebAppData", msg=bot_token)`; `hash = HMAC_SHA256(secret, data_check_string)`; `hmac.compare_digest`; `auth_date` не старше 24 ч.
2. `POST /auth/telegram {init_data, consent}`: невалидно → 401; user с этим `telegram_id` есть → привязать сессию; нет и `consent≠true` → 403; иначе создать user с `telegram_id` и перенести первый непустой источник сессии в `first_source` (как в фазе 3).
3. `linking.py` (логика; маршруты — в `routes_auth.py`): `POST /auth/link/code` (веб-user; код 8 символов в Redis, TTL 24 ч, новый заменяет старый; ответ `{code, url: "https://t.me/<BOT_USERNAME>?start=link_<code>"}`); `GET /auth/link/status` (`linked` true/false); `consume(code, telegram_id)` для бота: код одноразовый; `telegram_id` у другого user → отказ без изменений; успех → `telegram_id` закреплён за веб-user.
4. `profile.py`: строка из вопросов, итогов и ответов последних 3 раскладов (без `telegram_id`, `first_source`, `public_ref`); передаётся в `classify` и `interpret` (утро — фаза 14).

**Проверка фазы**: `make test` → exit 0; тесты: (1) initData, подписанный тестовым токеном → 200; подделанный → 401; `auth_date` 25 ч → 401; (2) новый Telegram-user без согласия → 403, user не создан; (3) код → consume → вход в Mini App тем же Telegram → сессия указывает на веб-user; события обеих сессий — один `user_id`; (4) код истёк/использован → отказ; (5) конфликт `telegram_id` → отказ, данные не изменились; (6) ответ `link/code` содержит `url` с `BOT_USERNAME`; (6a) гость с `app_open` источника `ref:<id>` входит через Telegram → `first_source=ref:<id>`; (7) сообщения классификации и толкования содержат итог прошлого расклада и не содержат `telegram_id`.

**Фокус верификатора**: постоянное время сравнения; согласие на обоих входах.

**Критерий выхода**: обе точки входа ведут к одной учётке.

**Оценка**: ~350 LOC net

### Фаза 13 `[]` — Профиль: чтение, настройки, удаление (неделя 3)

**Цель**: `GET /profile`, `PATCH /profile/settings`, `DELETE /profile` по REQ-12, REQ-18, §11.

**Разрешённые файлы**: `backend/app/api/routes_profile.py`, `backend/app/main.py`, `backend/tests/test_profile_api.py`

**Запрещено**: удаление событий и сессий; настройки кроме `push_enabled`.

**Задачи**:
1. `GET /profile` → `{public_ref, consent_at, push_enabled, telegram_linked}`.
2. `PATCH /profile/settings {push_enabled}`.
3. `DELETE /profile` → удаление user (каскады фазы 2 отвязывают события и сессии), удаление Redis-ключей user (коды привязки, счётчики по user) → 204; сессия остаётся гостевой.

**Проверка фазы**: `make test` → exit 0; тесты: (1) профиль гостя → 401; (2) по умолчанию `push_enabled=true`, переключение сохраняется; (3) после DELETE нет строк user в `users`, `spreads`, `spread_positions`, `daily_cards`, `llm_calls`, `fraud_flags`; события на месте с `user_id=NULL`; Redis-ключей user нет; следующий запрос с той же cookie — гость (401 на профиль).

**Фокус верификатора**: полнота удаления ПДн.

**Критерий выхода**: удаление соответствует §11.

**Оценка**: ~200 LOC net

### Фаза 14 `[]` — Карта дня: вытягивание, утро, сверка (неделя 3)

**Цель**: REQ-11, D15, D17 для ежедневного слоя.

**Разрешённые файлы**: `backend/app/daily/__init__.py`, `backend/app/daily/service.py`, `backend/app/api/routes_daily.py`, `backend/app/main.py`, `backend/expert_base/prompts/morning.md`, `backend/expert_base/prompts/checkin.md`, `backend/tests/test_daily.py`

**Запрещено**: вторая карта за сутки; LLM при повторной сверке; изменение карты дня при кризисе.

**Задачи**:
1. `GET /daily` → `state` (`none|drawn|checked`), карта, тексты, id последнего незакрытого расклада.
2. `POST /daily/draw`: `daily_seed(DAILY_SECRET, user_id, msk_today())` → `draw(seed, 1, MAJOR_ONLY)`; в одной транзакции: `INSERT … ON CONFLICT DO NOTHING` → `SELECT … FOR UPDATE` строки → `morning_text` уже есть → вернуть без LLM и без события; иначе утренний текст через `generate_checked` (контекст — последний незакрытый расклад и профиль); fallback и `LlmUnavailable` → `meaning_daily`; событие `daily_drawn`.
3. `POST /daily/checkin {answer}`: `SELECT … FOR UPDATE` строки дня; карты нет → 409; уже сверено → сохранённый отклик без LLM и события; вариант текста детерминированно по дате; свободный ответ → `check_free_text` → `crisis` → `{status:"crisis",…}`, `crisis_shown`, сверка не сохраняется; иначе отклик через `generate_checked`, fallback и `LlmUnavailable` → `closing`; запись `checkin_variant`, `checkin_answer`, `checkin_reply`, `checked_at`; событие `daily_checkin`.

**Проверка фазы**: `make test` → exit 0; тесты: (1) два draw → одна карта, один вызов шага `daily`, одно событие; (2) два одновременных draw → оба 200, одна строка, одинаковый непустой `morning_text`, один вызов шага `daily`; (3) 20:59:59 и 21:00:00 UTC → разные сутки; (4) двойной провал судьи утром → `meaning_daily`; (5) сверка → отклик сохранён; повтор → 0 новых вызовов; две одновременные сверки → один вызов шага `checkin`; (6) провал судьи → `closing`; (7) кризисный ответ → кризисный экран, `checked_at IS NULL`, карта та же; (8) сверка без карты → 409; (9) сообщения утра содержат итог последнего расклада.

**Фокус верификатора**: сутки только через `msk.py`; гонки закрыты.

**Критерий выхода**: ежедневный слой работает.

**Оценка**: ~400 LOC net

### Фаза 15 `[]` — Бот: поллинг, /start, напоминания (неделя 3)

**Цель**: бот и напоминания в процессе api (REQ-20, D5, D9, D20).

**Разрешённые файлы**: `backend/app/bot/__init__.py`, `backend/app/bot/api.py`, `backend/app/bot/poller.py`, `backend/app/bot/reminders.py`, `backend/app/main.py`, `backend/tests/test_bot.py`, `backend/tests/test_reminders.py`

**Запрещено**: aiogram; задачи без `BOT_ENABLED=true`; отправка вне 19:00–23:00 МСК.

**Задачи**:
1. `api.py`: httpx-клиент к `TELEGRAM_API_BASE` через `TELEGRAM_PROXY` (D20; пусто — напрямую; SOCKS через `httpx[socks]`), таймаут 30 с; точка подмены транспорта для тестов; 429 → ожидание `retry_after`, не более 3 попыток; сетевые ошибки → `BotNetworkError`.
2. `poller.py`: `getUpdates` (`timeout=25`, `offset`); `BotNetworkError` → пауза 5 с, цикл продолжается; `/start link_<code>` → `linking.consume` и ответ; `/start <другое>` → кнопка `web_app` на `MINI_APP_URL` с `startapp=<payload>`; прочие сообщения — одна фраза в тоне GUIDE с той же кнопкой.
3. `reminders.py`: цикл раз в 60 с; окно 19:00–23:00 МСК; выборка `push_enabled AND telegram_id IS NOT NULL AND (last_reminder_date IS NULL OR last_reminder_date < msk_today())` без сверки сегодня; для каждого: транзакция → `SELECT … FOR UPDATE SKIP LOCKED` → `sendMessage` (кнопка с `startapp=push`) → `last_reminder_date = msk_today()` → commit; ошибка отправки → откат, повтор на следующем цикле; 403 → `push_enabled=false`.
4. `main.py`: запуск и остановка задач в lifespan при `BOT_ENABLED=true`.

**Проверка фазы**: `make test` → exit 0; тесты (фиктивные часы через `msk.py`, `httpx.MockTransport`): (1) 19:00 → отправка, отметка даты; (2) новый экземпляр цикла в 19:30 → нет повтора; (3) отправка падает в 19:00 → уходит в 19:01; (4) цикл стартует в 21:10 → отправка; (5) транспорт кидает `ConnectError` 3 цикла (туннель лежит, R11) → задачи живы, после восстановления отправка в тот же день; (6) 23:01 → нет отправки; (7) opt-out и сверившийся не получают; (8) 403 → `push_enabled=false`; (9) `/start link_<code>` вызывает consume; `/start ref_x` → кнопка с `startapp=ref_x`; (10) 429 с `retry_after=1` → повтор, не более 3; (11) `TELEGRAM_PROXY=socks5://127.0.0.1:1080` → клиент создан с прокси (без сетевого вызова); (12) `BOT_ENABLED=false` → задач нет.

**Фокус верификатора**: одна отправка в сутки при любом порядке сбоев.

**Критерий выхода**: критическая неделя закрыта.

**Оценка**: ~400 LOC net

### Фаза 16 `[]` — Шеринг и антифрод (неделя 4)

**Цель**: REQ-15, REQ-17 (Redis-флаги).

**Разрешённые файлы**: `backend/app/api/routes_spreads.py`, `backend/app/api/routes_auth.py`, `backend/app/api/routes_events.py`, `backend/app/events/antifraud.py`, `backend/app/spread/service.py`, `backend/app/main.py`, `backend/tests/test_share.py`, `backend/tests/test_antifraud.py`

**Запрещено**: ограничение доступа по флагам; сторонняя аналитика.

**Задачи**:
1. `POST /spreads/{id}/share`: расклад не `completed` → 409; ответ `{url: "<MINI_APP_URL>?startapp=ref_<public_ref>", web_url: "<APP_ORIGIN>/?ref=<public_ref>"}`; событие `shared` (каждый вызов).
2. Нормализация источника в `POST /events`: `ref_<x>` / `?ref=<x>` → `ref:<x>`.
3. `antifraud.py` (Redis, TTL-окна): всплеск регистраций из источника (хук в consent и в создании Telegram-user; порог `FRAUD_SIGNUPS_PER_SOURCE_HOUR`); нечеловеческая скорость (интервал между обращениями < `FRAUD_MIN_INTERVAL_MS` 5 раз за 10 мин; хук в create_spread, answer, reveal); одинаковые нормализованные вопросы от ≥ 3 разных user за сутки; флаг пишется в `fraud_flags` один раз на тип; Redis недоступен → проверка пропускается.

**Проверка фазы**: `make test` → exit 0; тесты: (1) share → `shared` с ref; незавершённый → 409; (2) вход по ref → `first_source=ref:<id>`; (3) каждый из 3 флагов ставится на синтетике; (4) повтор не дублирует; (5) Redis на неверном порту → `POST /spreads` работает, флагов нет.

**Фокус верификатора**: fail-open Redis; флаги не влияют на доступ.

**Критерий выхода**: атрибуция и разметка готовы к метрикам.

**Оценка**: ~250 LOC net

### Фаза 17 `[]` — Метрики: SQL-вьюхи, Prometheus, Grafana (неделя 4)

**Цель**: метрики `docs/metrics.md` считаются из PG; дашборды провижнятся (REQ-16, REQ-17, NFR-2, NFR-6).

**Разрешённые файлы**: `backend/migrations/versions/**`, `backend/app/metrics/__init__.py`, `backend/app/metrics/prom.py`, `backend/app/llm/adapter.py`, `backend/app/pipeline/generate_checked.py`, `backend/app/main.py`, `backend/tests/test_metrics_views.py`, `infra/grafana/**`, `infra/postgres-init/**`, `infra/compose.yml`, `infra/prometheus.yml`, `infra/env.example`, `infra/env.compose.test`

**Запрещено**: цифры этапа в Python вместо SQL; больше двух дашбордов.

**Задачи**:
1. Миграция вьюх: `v_requests` (обращения по metrics.md, со слоем), `v_flagged_users` (`fraud_flags` ∪ пользователи без единого обращения после первого `app_open` — idle-флаг без хранения), `v_dau` (колонка `clean`), `v_requests_per_dau` (всего и по слоям, `clean`), `v_sessions` (разрыв > 30 мин), `v_funnel_first_spread` (7 шагов, конверсии, медианное время), `v_retention` (классический и rolling D1/D7/D30; разрез `has_open_spread` на дату когорты; `clean`), `v_llm_cost` (на DAU и на расклад, по шагам); `GRANT SELECT` роли `grafana_ro`, только если она существует.
2. `infra/postgres-init/10-grafana-ro.sh` — создаёт `grafana_ro` с паролем из `GRAFANA_DB_PASSWORD` при первой инициализации тома; переменная в compose, `env.example`, `env.compose.test`.
3. `prom.py`: гистограмма HTTP (метка маршрута), счётчики LLM-вызовов по шагу и статусу, токенов, fallback по шагу, 5xx; подключение в адаптер и `generate_checked`.
4. Grafana provisioning: источники PG (`grafana_ro`) и Prometheus; дашборды «Продукт» (DAU, обращения/DAU по слоям, воронка, retention, стоимость/DAU; переменная все/очищенные) и «Инфра» (p95 reveal, 5xx, LLM-стоимость, fallback-rate).

**Проверка фазы**: `make test` → exit 0; тест вьюх на сценарии 4 пользователей за 8 дней (есть две сессии одного пользователя с разрывом > 30 мин, возврат на 7-й день, строки `llm_calls` с известной стоимостью), заданном таблицей в тесте: ожидаемые DAU по дням, обращения/DAU по слоям, число и длина сессий, шаги воронки, D1 и D7, стоимость на DAU и на расклад по шагам выписаны числами вручную; помеченный и idle-пользователь не входят в `clean`; имена вьюх из JSON дашбордов существуют в БД; `make up` → `curl -sf --max-time 5 http://127.0.0.1:53000/api/health` → exit 0; `make down`.

**Фокус верификатора**: формулы один-в-один с metrics.md (обращение, сессия, D*N* «ровно на N-й день»).

**Критерий выхода**: цифры этапа считаются серверно.

**Оценка**: ~650 LOC net (миграция с 8 вьюхами — сгенерированного кода нет, но SQL объёмный; поправка 18.09)

### Фаза 18 `[]` — Фронт: каркас, адаптеры, дизайн-система (неделя 4)

**Цель**: один бандл для браузера и Telegram; компоненты и токены импортируются из `design-system/` без копий.

**Разрешённые файлы**: `frontend/**`, `Makefile`, `.github/workflows/ci.yml`

**Запрещено**: правки `design-system/**`, `landing/**`; react-router, redux, CSS-in-JS; внешние загрузки кроме `https://telegram.org/js/telegram-web-app.js`.

**Задачи**:
1. Vite + React 18 + TypeScript; зависимости из §4; `package-lock.json`.
2. `vite.config.ts`: алиас `@ds` → `../design-system`; алиасы `react`, `react-dom`, `react/jsx-runtime` → `frontend/node_modules/...`; `resolve.dedupe`; `server.fs.allow` на корень репозитория; `publicDir` по умолчанию (`public/`).
3. `tsconfig.json`: `allowJs`, `checkJs: false`, `skipLibCheck: true`, `jsx: react-jsx`, `paths` для `@ds/*`, `react`, `react/*`, `react-dom` → `node_modules`; `include` — `src` и `../design-system/components/**/*.d.ts`.
4. `scripts/copy-assets.mjs` (до `vite build` и dev): `landing/site/assets/fonts/*.woff2` → `public/assets/fonts/`; svg из списка `src/icons.ts` из `node_modules/lucide-static/icons/` → `public/assets/icons/`; `public/assets/` в `.gitignore` фронта.
5. `src/main.tsx` импортирует `@ds/styles.css`; `data-theme="dark"` по умолчанию.
6. `src/adapters/`: интерфейс `Platform` (`kind`, `initData`, `startParam`, `haptic`, `share(url, text)`, `ready()`); `TelegramAdapter` (`window.Telegram.WebApp`), `WebAdapter` (`?ref=`, `utm_source`, `navigator.share` → clipboard); выбор по наличию `initData`.
7. `src/api/client.ts`: базовый путь `/api` (nginx срезает префикс; в dev — `server.proxy` Vite `/api` → `http://127.0.0.1:58000` с `rewrite`), fetch с `credentials: "include"`, `Content-Type: application/json`, `Idempotency-Key` по запросу, разбор ошибок §7.
8. `src/Icon.tsx` — маска из `/assets/icons/<name>.svg`.
9. `index.html`: `telegram-web-app.js`, `#root`.
10. `src/App.tsx`: навигация состоянием (онбординг, вопрос, расклад, итог, история, карта дня, профиль); пока — оболочка `Shell` с онбординг-заглушкой.
11. `scripts/check-bundle.mjs`: в `dist/` нет `unpkg.com`, `jsdelivr`, `cdnjs`; есть шрифты и используемые иконки; CSS содержит `prefers-reduced-motion`.
12. Makefile: `fe-check` (`npm ci --prefix frontend`, `copy-assets`, `tsc --noEmit`, `vite build`, `check-bundle`); CI — job фронта.

**Проверка фазы**: `make fe-check` → exit 0.

**Фокус верификатора**: нет копий компонентов и токенов; нет CDN.

**Критерий выхода**: бандл один, адаптеров два.

**Оценка**: ~350 LOC net

### Фаза 19 `[]` — Экраны: онбординг, вопрос, расклад, итог (неделя 4)

**Цель**: главный сценарий UI-кита на живом API.

**Разрешённые файлы**: `frontend/src/**`

**Запрещено**: изменение тайминга раскрытия (GUIDE ≈ 2.7 с); тексты интерфейса не из GUIDE, UI-кита или API.

**Задачи**:
1. Порт `Onboarding`, `AskQuestion`, `Reading`, `Summary`, `Shell` из `design-system/ui_kits/arkan-miniapp/` в TSX: `window.DesignSystem_…` → импорты `@ds/components/...`; `window.ARKAN_*` → данные API.
2. Старт: `POST /events` `app_open` с источником (`startParam` / `?ref=` / `utm_source`); `startapp=push` → `push_opened`.
3. Онбординг: 3 шага + согласие → веб `POST /auth/consent`, Telegram `POST /auth/telegram {init_data, consent: true}`; вернувшийся Telegram-user без экрана согласия.
4. Вопрос: 10–500 символов; `refusal`/`crisis` → экраны с текстами и контактами из ответа; 429 → текст из API.
5. Расклад: по `next_action` — reveal (RitualLoader, если ответ дольше анимации), толкование, `QuickReplies` + свободный ответ → answer; `crisis` → кризисный экран; 503 → `ErrorState` с текстом GUIDE и повтором.
6. Итог: summary; «Поделиться» → `share` → адаптер.

**Проверка фазы**: `make fe-check` → exit 0; `make test` → exit 0.

**Фокус верификатора**: все статусы ответов `POST /spreads`, reveal, answer, summary обработаны; анимация не переписана.

**Критерий выхода**: сценарий собирается; ручной смоук — О-5.

**Оценка**: ~400 LOC net

### Фаза 20 `[]` — Экраны: история, карта дня, профиль (неделя 4)

**Цель**: остальные экраны UI-кита.

**Разрешённые файлы**: `frontend/src/**`

**Запрещено**: правки backend.

**Задачи**:
1. `History`: `GET /spreads`; незакрытые — продолжение по `next_action`.
2. `CardOfDay`: draw, утренний текст, сверка (вариант, чипы, свободный ответ), отклик; `crisis` → кризисный экран; ссылка на последний незакрытый расклад.
3. `Profile`: тема (`localStorage` в try/catch), тумблер напоминаний (`PATCH /profile/settings`, виден при `telegram_linked`), привязка Telegram для веба (`POST /auth/link/code` → `url` из ответа), удаление через `Modal` → `DELETE /profile` → онбординг.

**Проверка фазы**: `make fe-check` → exit 0.

**Фокус верификатора**: удаление только после подтверждения; тема не наследует Telegram.

**Критерий выхода**: 7 экранов UI-кита покрыты.

**Оценка**: ~350 LOC net

### Фаза 21 `[]` — Нагрузочный сценарий и runbook (неделя 4)

**Цель**: воспроизводимый нагрузочный сценарий и эксплуатационная документация.

**Разрешённые файлы**: `infra/k6/spread.js`, `Makefile`, `docs/runbook.md`, `README.md`

**Запрещено**: реальная LLM; локальная установка k6.

**Задачи**:
1. `spread.js`: на VU — `POST /auth/anonymous` → cookie `arkan_sid` из `Set-Cookie` передаётся вручную в заголовке `Cookie` (Secure-cookie по http k6 не отправляет); все мутации с `Origin: ${APP_ORIGIN}` и JSON; `app_open` → consent → spreads → reveal 1 → answer 1 → reveal 2; параметры `RATE` и `DURATION`; пороги: p95 `reveal` < 6000 мс, ошибки < 1%.
2. Makefile: `load-smoke` — `make up` (фейковая LLM; без моделей reveal идёт по fallback-пути), `docker run --rm --network arkan-dev_default -v $(PWD)/infra/k6:/k6 grafana/k6:0.54.0 run -e BASE_URL=http://api:8000 -e APP_ORIGIN=https://app.test -e RATE=1 -e DURATION=30s /k6/spread.js` (длительность ограничена самим сценарием), `make down`; `load` — то же с `RATE=15 DURATION=5m` для О-6, отчёт в `infra/load-report.local.md`.
3. `docs/runbook.md`: переменные окружения; первый запуск; `make models`, `make ingest`, `make golden-live`, `make mem-report`; приём волн базы; деплой на сервер в РФ (D20): Docker, nginx, файрвол, выбор O4/O5 по О-4, `API_ENV_FILE`, `TELEGRAM_PROXY` на SOCKS-туннель fornex-de и проверка `curl --socks5-hostname …`, туннель под systemd, монитор туннеля в Uptime Kuma (R11); бэкап (crontab-строка `backup.sh`), restore, откат (alembic downgrade или restore); чек-лист ручного смоука О-5 (браузер, мобильный Telegram, Telegram Web).
4. `README.md`: раздел «Запуск» — три команды и ссылка на runbook.

**Проверка фазы**: `make load-smoke` → exit 0; `make test` → exit 0.

**Фокус верификатора**: нагрузка не может пойти в реальную LLM.

**Критерий выхода**: сценарий воспроизводим; runbook покрывает деплой, туннель и restore.

**Оценка**: ~250 LOC net

### Фаза 22 `[]` — Деплой-заготовки (неделя 4)

**Цель**: артефакты деплоя, проверенные локально, без обращения к серверам.

**Разрешённые файлы**: `infra/deploy/**`, `infra/env.example`, `Makefile`

**Запрещено**: ssh, scp и обращения к серверам в проверке; секреты в файлах; второй compose-файл.

**Задачи**:
1. `infra/deploy/nginx-app.conf.example`: `server` для `app.arkana.hoapps.dev`; статика из симлинк-релиза; `location = /api/metrics { return 404; }` и `location = /metrics { return 404; }`; `/api/` → `127.0.0.1:58000/` (префикс срезается); все `add_header` на уровне `server`: HSTS, CSP по D16, `X-Content-Type-Options`, `Referrer-Policy`; без `X-Frame-Options`, вместо него `frame-ancestors`.
2. `infra/deploy/backup.sh`: `docker compose -f infra/compose.yml exec -T postgres pg_dump -Fc` → файл с датой; при непустом `BACKUP_REMOTE` — `scp -o ConnectTimeout=10 -o ServerAliveInterval=15 -o ServerAliveCountMax=4`, до 3 попыток; хранение 14 дней; ненулевой код при ошибке.
3. `infra/deploy/deploy.sh <tag>` (выполняется на Linux-сервере): `make env-check`; `backup.sh`; `git fetch --tags && git checkout <tag>`; `timeout 600 docker compose … build api`; `docker compose … run --rm api alembic upgrade head`; `docker compose … --profile full up -d --wait --wait-timeout 600`; смоук `/healthz`; при ошибке — стоп и ссылка на раздел отката runbook, без автоповторов.
4. Makefile: `env-check` (обязательные переменные `.env` непусты, `LLM_FAKE` не `true`; exit 1 иначе; путь к файлу параметром `ENV_FILE`); `deploy-check`: `bash -n` скриптов; самоподписанный сертификат `openssl` во временный каталог → `docker run --rm nginx:1.27 nginx -t` с конфигом; grep: конфиг содержит `location = /api/metrics`, `style-src 'self' 'unsafe-inline'`, `script-src 'self' https://telegram.org`, `frame-ancestors` и не содержит `X-Frame-Options`; `make deps-up` → `backup.sh` с пустым `BACKUP_REMOTE` → `pg_restore --list` полученного дампа через `docker compose … exec -T postgres` → exit 0; `env-check` на копии `infra/env.example` с фиктивными значениями → 0, с пустыми → 1.
5. `infra/env.example`: `API_ENV_FILE`, `API_BIND`, `BACKUP_REMOTE`, `GRAFANA_ADMIN_PASSWORD` с комментариями.

**Проверка фазы**: `make deploy-check` → exit 0.

**Фокус верификатора**: CSP только нужное; метрики закрыты по обоим путям; таймауты у внешних вызовов; миграция до старта нового кода.

**Критерий выхода**: к деплою не хватает только размера сервера (О-4) и шага О-8.

**Оценка**: ~250 LOC net

## 9.2 Операционные шаги (человек, не фазы)

Выполняются Антоном и Анастасией; агент конвейера их не выполняет.

| ID | Шаг | Когда | Команда / действие | Условие прохождения |
|----|-----|-------|--------------------|---------------------|
| О-1 | Запустить Docker Desktop на машине сборки | до фазы 1 | `docker info` | exit 0 |
| О-2 | Принимать волны базы | с 21.09 | `make validate-base CSV=… OUT=backend/expert_base` → отчёт эксперту; `make ingest YAML=backend/expert_base`; `MAJOR_ONLY` по готовности младших | exit 0 |
| О-3 | Живой прогон классификатора | после фазы 11 и после ответа по ASM-7 | `.env` с ключом DeepSeek; `make golden-live` | точность ≥ 0.9 по классам, 0 пропущенных кризисов |
| О-4 | Замер памяти, выбор размера сервера | после фазы 8 | `make models && make mem-report` | число и выбор O4/O5 записаны в SOLUTION §6 (DEC-1) |
| О-5 | Ручной смоук UI | после фаз 19–20 | чек-лист runbook | все пункты отмечены |
| О-6 | Живая латентность | после О-3 и О-4 | 20 раскрытий с DeepSeek → p95 в `LLM_FAKE_DELAY_MS`; `make load` с моделями в `MODELS_DIR` | p95 reveal ≤ 6 с, ошибки < 1% |
| О-7 | Ревью 50 толкований экспертом | 22–28.09 | критерии `interpretation_rules.md` | журнал оценок |
| О-8 | Деплой на сервер в РФ (D20) | до 12.10 | runbook; Docker, nginx, файрвол; туннель fornex-de под systemd и монитор; `.env` с `TELEGRAM_PROXY`; `deploy.sh <tag>`; сертификат; DNS; crontab `backup.sh`; restore на сервере | `/healthz` 200 снаружи; `/metrics` и `/api/metrics` 404; бот отвечает на `/start`; restore прогнан |
| О-9 | Лендинг и запуск | 12–15.10 | CTA; privacy: раздел 6 — DeepSeek, КНР (R9), раздел 7 сверить с фактом; деплой лендинга с сохранением `deck/` в релизе; отчёт метрик к 16.10, D7 к 22.10 | privacy соответствует факту; метрики в Grafana |

## 10. Команды проверки

| Команда | Что проверяет | Ожидание |
|---------|---------------|----------|
| `make lint` | ruff check + format --check | exit 0 |
| `make typecheck` | mypy backend | exit 0 |
| `make test` | pytest с `infra/env.test`, поднимает зависимости | exit 0 |
| `make smoke` | стек full, миграция, `/healthz`, `/metrics` | exit 0 |
| `make validate-base CSV=<dir> OUT=<dir>` | CSV эксперта | exit 0 / 1 с отчётом |
| `make ingest YAML=<dir>` | перегрузка Qdrant | exit 0 |
| `make fe-check` | tsc, vite build, проверки бандла | exit 0 |
| `make load-smoke` | сценарий k6 в docker, фейковая LLM | exit 0 |
| `make deploy-check` | nginx -t, bash -n, backup → pg_restore --list, env-check | exit 0 |
| `make golden-live`, `make models`, `make mem-report`, `make load`, `make env-check ENV_FILE=.env` | операционные | §9.2 |

Долгоживущие процессы (`make up`, dev-сервер Vite, бот) не являются командами приёмки; цели, которые их поднимают, ждут `--wait` и сами останавливают стек.

## 11. Условия останова

1. Нужна новая архитектура, контракт, fallback, поле или эндпоинт вне `SOLUTION.md` → стоп, `BLOCKED_FOR_SOLUTION_AMENDMENT` (кандидат: эксперт требует тему `general` — ASM-7).
2. Фаза превысила оценку ×2 по LOC (правило подсчёта — §5) или вышла за «Разрешённые файлы» → стоп, `git diff --stat`, вопрос.
3. План в целом превысил ~8650 LOC net ×2 → стоп.
4. Не выполнено предусловие §5 → стоп с его названием.
5. Проверка фазы требует ключей, моделей, сервера или сети кроме PyPI/npm/Docker Hub → стоп: это операционный шаг.
6. Тест нельзя сделать зелёным без ослабления утверждения → стоп, вопрос.

## 12. Политика верификатора

После каждой фазы — свежий read-only проход по «Фокусу верификатора», §3 и §7; только находки, исправляются только блокирующие. Фазы с I/O дополнительно проходят ops-review: 1 (compose, CI), 7 (LLM), 8 (Qdrant, модели), 9 и 14 (блокировки), 15 (Telegram, прокси, напоминания), 16 (Redis fail-open), 22 (деплой, бэкап). Перед О-8 — полная сверка с `SOLUTION.md` §15.

## 13. Формат финального отчёта

По фазе: статус, LOC net факт/оценка, команды и результат, находки верификатора и что исправлено. По плану: `git diff --stat`, статус ASM-2..7 и размера сервера (DEC-1), отметки операционных шагов §9.2, честный список непрогнанных проверок.

## 14. Поправки

**17.09.2026 — черновик GLM (planf3)**: 21 фаза, статус `READY_FOR_BUILD`, челленджеры inline, формат фаз не читается конвейером Linear.

**17.09.2026 — пересборка после ревью (Claude)**:

- формат фаз приведён к конвейеру Linear; ручные и серверные шаги вынесены в §9.2;
- закрыты пробелы трассировки: эндпоинты профиля, кризис в ответах расклада, `POST /auth/link/code`, лимит D18, `MAJOR_ONLY`;
- контракты черновика утверждены в `SOLUTION.md` (D16–D20) или убраны; частичные отказы и гонки описаны и покрыты тестами;
- валидатор базы — в неделе 1; hypothesis для колоды; фронт: разрешение React и типов вне корня, ассеты без CDN.

**17.09.2026 — челленджеры (opus, свежие контексты)**. Корректность: 25 находок (15 блокирующих), `GATE: FAIL`. Минимальность: 15 находок (3 блокирующих), `MINIMALITY: FAIL`. Принято всё, изменения:

- фикстура — 22 старших аркана и 3 расклада; тесты с `MAJOR_ONLY=true`; правило пустого `ask_2`;
- `uv run --env-file`; Dockerfile, порт api, `env.compose.test`; полный список переменных в фазе 1; healthcheck qdrant без curl;
- каскады: сессии и события отвязываются, не удаляются (поправка SOLUTION §9.4, §11);
- `https://testserver` в тестах; cookie вручную в k6; `Partitioned` собирается вручную;
- порядок reveal → answer → reveal и 409 для `abandoned` (поправка SOLUTION §10); идемпотентный повтор без события (поправка §9.5);
- `/api/metrics` закрыт; миграция до старта нового кода; pg-утилиты через `docker compose exec`; crontab в runbook;
- роль `grafana_ro` через init-скрипт тома, гранты условные; idle-флаг — во вьюхе; одна `v_flagged_users` вместо копий `*_clean`; разрез retention по незакрытому раскладу;
- lock-файлы, JSON дашбордов и данные исключены из подсчёта LOC;
- `SET NX` для идемпотентности; `ON CONFLICT` и `FOR UPDATE` в карте дня; `llm_calls` в отдельной транзакции; пул БД 20+20;
- профиль в утренней карте; `url` в ответе `link/code`; `push_enabled` по умолчанию true (поправка §9.4); NFR-6 и REQ-8 — поправки критериев в SOLUTION §3;
- убраны: `compose.prod.yml`, порт классификатора и 501-маршруты, переключатель эмбеддера (подделка — только в тестах), `rag-live`, shellcheck, grep текстов в бандле, `payload.base_version`, запись `backend/.models/` в `.gitignore`; нагрузка в фазе — смоук, полный прогон с моделями — О-6; `env-check` перенесён в фазу 22.

Отклонённых находок нет.

**17.09.2026 — гейт готовности (opus, свежий контекст)**: `RESULT: FAIL`, 12 находок (6 блокирующих). Принято всё:

- утилита `timeout` убрана из локальных целей (на macOS её нет): `--wait-timeout`, `curl --max-time`, `scp -o ConnectTimeout`, длительность k6 из сценария;
- autouse-подделки по умолчанию: LLM (фаза 7), эмбеддер и реранкер (`set_reranker`, фаза 8); ingest фикстуры в `expert_base_test` session-фикстурой;
- `app/redis.py` и `FLUSHDB` тестовой базы Redis `/1`; fail-open идемпотентности; лимит D18 — подсчёт в PG;
- перенос `first_source` при Telegram-входе и тест (REQ-15/17);
- `APP_ORIGIN` и `BASE_URL` для k6; базовый путь фронта `/api` и dev-proxy;
- grep директив D16 в `deploy-check`; блокировка summary и тест конкурентности; точная команда mypy; маршруты привязки в `routes_auth.py`.

Отклонённых находок нет.

**17.09.2026 — гейт готовности, раунд 2 (opus, свежий контекст)**: `RESULT: FAIL`, 8 находок (3 блокирующих, все однострочные). Принято всё: критерий выхода фазы 1 через `uv run`; `MAJOR_ONLY=true` в `env.compose.test`; любая ошибка Qdrant → `RagUnavailable` и тест; draw карты дня в одной транзакции и усиленный тест гонки; числовые ожидания сессий, D7 и стоимости; `pip install uv` в Dockerfile; `smoke` останавливает стек; SOLUTION §9.1 и §9.8 приведены к D20 и `deploy.sh`.

Все гейты раунда 2 кроме трёх перечисленных были PASS; блокирующие правки механические и сверены координатором поиском по тексту, третий раунд не запускался. Статус: `READY_FOR_BUILD`.

**18.09.2026 — поправка по итогам фазы 2 (верификация `FAIL reason=scope-x2`)**:

- оценка фазы 2 поднята с ~350 до ~800 LOC net: прежняя не учитывала каркас Alembic и автогенерированную миграцию на 8 таблиц. Код фазы проверен владельцем — лишнего нет, поэтому принят как есть, а не урезан. Оценка фазы 17 поднята с ~350 до ~650 по той же причине, итог плана — ~8200;
- закрыт пробел: `make db-create` (создание БД `arkan_test`, идемпотентно) — без него `make test` падал на чистой машине;
- закрыт пробел: в `make up` миграция выполняется до старта api (SOLUTION §9.8), прежняя формулировка запускала её после `up -d --wait`;
- зафиксированы значения перечислений `llm_calls.status` и `fraud_flags.flag` (без `idle` — он вычисляется вьюхой фазы 17) и запрет значений по умолчанию у токенов и стоимости.

**18.09.2026 — поправка по итогам фазы 5 (верификация `FAIL reason=scope-x2`)**: оценка фазы поднята с ~350 до ~800 считаемых LOC — валидатор шести листов с построчными правилами столько и занимает, лишнего кода в фазе нет (проверено владельцем). Итог плана — ~8650. Плюс два уточнения из находок: единственный источник слов-предсказаний — `stop_patterns.yaml` (валидатор не держит свою копию), расклады индексируются по `spread_id` с отдельным индексом по теме и ошибкой при двух раскладах на одну тему.

**18.09.2026 — поправка по итогам фазы 6**: перечень кодов ошибок API зафиксирован в SOLUTION §9.5 (D21) — `unauthorized|forbidden|not_found|conflict|validation|rate_limited|llm_unavailable`. Фаза 6 вынужденно вводила коды, которых не было ни в одном контракте: §7 плана описывал формат и HTTP-статусы, но не строки `error`. Коды, выбранные фазой, совпадают с перечнем и остаются в коде.

**18.09.2026 — поправка по итогам фазы 6 (вторая)**: в §7 описана форма позиции в ответах API — `position_number`, `position_name` и булев `revealed` всегда, остальные поля только у раскрытых. Фаза добавила `revealed` по своей инициативе; поле принято (карту оно не раскрывает), а пробел был в плане: форма ответа задана не была.

**18.09.2026 — поправка по итогам фазы 6 (третья)**: в перечень D21 добавлен `http_error` — catch-all для ответов фреймворка (405, 415, 500), предметные пути им не пользуются. Фазе 6 разрешена правка `backend/app/api/errors.py` (файл фазы 3) для замены `validation_error` на `validation`.

**18.09.2026 — поправка по итогам фазы 6 (четвёртая)**: в §7 уточнено, что `interpretation`, `verify_status`, вопрос и варианты присутствуют в объекте раскрытой позиции всегда, но равны `null` до фазы 9, которая их заполняет. Прежняя формулировка требовала их у любой раскрытой позиции, из-за чего верификатор валил фазу 6, где толкований ещё нет.
