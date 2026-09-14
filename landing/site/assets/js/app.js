/* Аркан — лендинг. Весь клиентский стейт: тема и три карты в hero. */
(function () {
  "use strict";

  var root = document.documentElement;

  /* ---------------------------------------------------------------- тема --- */
  var THEME_KEY = "arkan-theme";
  var SURFACE = { dark: "#0A0B0F", light: "#FBFAF8" };

  function currentTheme() {
    return root.getAttribute("data-theme") === "light" ? "light" : "dark";
  }

  function syncThemeColor(theme) {
    // При явном выборе темы медиа-варианты <meta name="theme-color"> перестают
    // соответствовать странице — заменяем их одним безусловным тегом.
    var metas = document.querySelectorAll('meta[name="theme-color"]');
    for (var i = metas.length - 1; i > 0; i--) metas[i].remove();
    var meta = metas[0];
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "theme-color");
      document.head.appendChild(meta);
    }
    meta.removeAttribute("media");
    meta.setAttribute("content", SURFACE[theme]);
  }

  function storedTheme() {
    try { return localStorage.getItem(THEME_KEY); } catch (e) { return null; }
  }

  // explicit — тема выбрана пользователем (сейчас или в прошлый визит).
  // Пока выбора нет, media-варианты <meta name="theme-color"> трогать нельзя:
  // они единственное, что продолжает следовать системной схеме.
  function applyTheme(theme, explicit) {
    root.setAttribute("data-theme", theme);
    if (explicit) {
      syncThemeColor(theme);
      try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}
    }
    var next = theme === "dark" ? "Светлая тема" : "Тёмная тема";
    var toggles = document.querySelectorAll("[data-theme-toggle]");
    for (var i = 0; i < toggles.length; i++) {
      // Имя кнопки начинается с её видимого текста — WCAG 2.5.3 Label in Name.
      toggles[i].setAttribute("aria-label", next + ", переключить оформление");
      var label = toggles[i].querySelector("[data-theme-label]");
      if (label) label.textContent = next;
    }
  }

  applyTheme(currentTheme(), storedTheme() === "dark" || storedTheme() === "light");

  document.addEventListener("click", function (e) {
    var toggle = e.target.closest && e.target.closest("[data-theme-toggle]");
    if (!toggle) return;
    applyTheme(currentTheme() === "dark" ? "light" : "dark", true);
  });

  /* --------------------------------------------------------- карты hero --- */
  function revealDuration() {
    // Уважает prefers-reduced-motion: motion.css деградирует --dur-reveal до 1ms.
    var raw = getComputedStyle(root).getPropertyValue("--dur-reveal").trim();
    var ms = parseFloat(raw);
    if (!isFinite(ms)) return 760;
    return raw.indexOf("ms") === -1 && raw.indexOf("s") !== -1 ? ms * 1000 : ms;
  }

  var cards = Array.prototype.slice.call(document.querySelectorAll(".tarot[data-state]"));
  var hint = document.querySelector("[data-hero-hint]");
  var opened = 0;
  var revealable = 0;

  cards.forEach(function (card) {
    var btn = card.querySelector("[data-reveal]");
    if (!btn) return;   // карта-иллюстрация без кнопки в счёт не идёт
    revealable++;

    btn.addEventListener("click", function () {
      if (card.getAttribute("data-state") !== "back") return;

      card.setAttribute("data-state", "revealing");
      // Не disabled: браузер снял бы фокус с отключённой кнопки на body, и
      // клавиатурный пользователь после Enter потерял бы место в обходе.
      // Повторное срабатывание гасит проверка data-state выше.
      btn.setAttribute("aria-disabled", "true");
      btn.tabIndex = -1;

      // Имя раскрытой карты обязано начинаться с её видимого текста
      // (цифра и название на лицевой грани) — WCAG 2.5.3 Label in Name.
      var numeral = card.querySelector(".tarot__numeral");
      var title = card.querySelector(".tarot__title");
      var position = card.querySelector(".tarot__pos");
      var visible = [numeral, title].map(function (e) {
        return e ? e.textContent.trim() : "";
      }).filter(Boolean).join(" ");
      var pos = position ? position.textContent.trim() : "";
      btn.setAttribute("aria-label", pos ? visible + " — " + pos : visible);

      window.setTimeout(function () {
        card.setAttribute("data-state", "face");
      }, revealDuration());

      opened++;
      if (opened >= revealable && hint) {
        hint.textContent = "Дальше — уточняющий вопрос.";
      }
    });
  });
})();
