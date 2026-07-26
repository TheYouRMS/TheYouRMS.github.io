(function () {
  "use strict"; 






  

  //
  // ================== CONFIG ==================
  //
  const MIN_CHARS = 1;
  const MAX_RESULTS = 12;
  const HIGHLIGHT_TAG = "strong";

  //
  // ================== INTERNAL STATE ==================
  //
  let courseMap = { ...COURSE_DATA };
  window.__swalCourseMap = courseMap;
  window.__setSwalCourseMap = m => {
    courseMap = { ...m };
    window.__swalCourseMap = courseMap;
  };

  //
  // ================== UTILITIES ==================
  //
  const escapeHtml = txt =>
    String(txt).replace(/[&<>"']/g, ch => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[ch]);

  function findMatches(q) {
    if (!q || q.length < MIN_CHARS) return [];

    const needle = q.toUpperCase();
    const results = [];

    for (const [code, name] of Object.entries(courseMap)) {
      const cu = code.toUpperCase();
      const nu = (name || "").toUpperCase();

      if (cu.includes(needle) || nu.includes(needle)) {
        results.push({ code, name: name || "", cu, nu });
      }
    }

    results.sort((a, b) => {
      const aP = a.cu.startsWith(needle) ? 0 : a.nu.startsWith(needle) ? 1 : 2;
      const bP = b.cu.startsWith(needle) ? 0 : b.nu.startsWith(needle) ? 1 : 2;
      return aP !== bP ? aP - bP : a.cu.localeCompare(b.cu);
    });

    return results.slice(0, MAX_RESULTS);
  }

  //
  // ================== SUGGESTION BOX ==================
  //
  function createSuggestionBox(container) {
    let box = container.querySelector(".swal2-autosuggest-box");
    if (box) return box;

    box = document.createElement("div");
    box.className = "swal2-autosuggest-box";

    Object.assign(box.style, {
      boxSizing: "border-box",
      width: "100%",
      maxHeight: "220px",
      overflowY: "auto",
      background: "#fff",
      border: "1px solid rgba(0,0,0,0.12)",
      borderRadius: "6px",
      marginTop: "6px",
      boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
      fontSize: "14px",
      zIndex: 20000,
      display: "none"
    });

    container.appendChild(box);
    return box;
  }

  function renderSuggestions(box, matches, input) {
    box.innerHTML = "";
    if (!matches.length) {
      box.style.display = "none";
      return;
    }

    matches.forEach((m, idx) => {
      const row = document.createElement("div");
      row.className = "swal2-autosuggest-row";

      Object.assign(row.style, {
        padding: "8px 10px",
        cursor: "pointer",
        borderBottom: "1px solid rgba(0,0,0,0.04)",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis"
      });

      const codeHtml = `<${HIGHLIGHT_TAG}>${escapeHtml(m.code)}</${HIGHLIGHT_TAG}>`;
      row.innerHTML = `${codeHtml} <span style="color:#555; margin-left:8px;">${escapeHtml(m.name)}</span>`;

      row.addEventListener("mousedown", ev => {
        ev.preventDefault();
        input.value = m.code;
        hideBox(box);
      });

      row.addEventListener("mouseenter", () => setFocusedRow(box, idx));

      box.appendChild(row);
    });

    box.style.display = "block";
    box.dataset.focused = "-1";
  }

  function hideBox(box) {
    if (!box) return;
    box.style.display = "none";
    box.dataset.focused = "-1";
  }

  function setFocusedRow(box, index) {
    const rows = box.querySelectorAll(".swal2-autosuggest-row");
    rows.forEach((r, i) => {
      r.style.background = i === index ? "rgba(0,123,255,0.06)" : "";
    });
    box.dataset.focused = String(index);
  }

  function getFocusedRowIndex(box) {
    return Number(box.dataset.focused || -1);
  }

  //
  // ================== ATTACH TO SWAL INPUT ==================
  //
  function attachToInput(input) {
    if (!input || input.dataset.__swalAutosuggestAttached) return;
    input.dataset.__swalAutosuggestAttached = "1";

    let container;
    try {
      container = Swal && Swal.getHtmlContainer ? Swal.getHtmlContainer() : null;
    } catch {
      container = null;
    }
    if (!container) container = input.parentElement || document.body;

    const box = createSuggestionBox(container);
    let lastMatches = [];

    function onInput() {
      const q = input.value.trim();
      if (!q) return hideBox(box);

      lastMatches = findMatches(q);
      renderSuggestions(box, lastMatches, input);
    }

    function onKeyDown(ev) {
      if (box.style.display === "none") return;

      const rows = box.querySelectorAll(".swal2-autosuggest-row");
      if (!rows.length) return;

      const fi = getFocusedRowIndex(box);

      if (ev.key === "ArrowDown") {
        ev.preventDefault();
        const n = fi + 1 >= rows.length ? 0 : fi + 1;
        setFocusedRow(box, n);
      }

      else if (ev.key === "ArrowUp") {
        ev.preventDefault();
        const p = fi - 1 < 0 ? rows.length - 1 : fi - 1;
        setFocusedRow(box, p);
      }

      else if (ev.key === "Enter" && fi >= 0 && lastMatches[fi]) {
        ev.preventDefault();
        input.value = lastMatches[fi].code;
        hideBox(box);
      }

      else if (ev.key === "Escape") {
        hideBox(box);
      }
    }

    input.addEventListener("input", onInput);
    input.addEventListener("keydown", onKeyDown);

    input.addEventListener("blur", () => {
      setTimeout(() => hideBox(box), 120);
    });

    const mo = new MutationObserver(() => {
      const visible =
        (window.Swal && Swal.isVisible && Swal.isVisible()) ||
        document.querySelector(".swal2-container .swal2-popup");

      if (!visible || !document.body.contains(input)) {
        input.removeEventListener("input", onInput);
        input.removeEventListener("keydown", onKeyDown);
        hideBox(box);
        mo.disconnect();
      }
    });

    mo.observe(document.body, { childList: true, subtree: true });
  }

  //
  // ================== SWAL INPUT WATCHER ==================
  //
  function tryAttachExistingSwalInput() {
    try {
      if (window.Swal && Swal.getInput) {
        const input = Swal.getInput();
        if (input && input.tagName === "INPUT") attachToInput(input);
        return;
      }

      const fallback = document.querySelector(".swal2-container .swal2-input");
      if (fallback) attachToInput(fallback);
    } catch {}
  }

  function watchForSwalInputs() {
    setTimeout(tryAttachExistingSwalInput, 50);

    const obs = new MutationObserver(tryAttachExistingSwalInput);
    obs.observe(document.body, { childList: true, subtree: true });

    let tries = 0;
    const interval = setInterval(() => {
      tryAttachExistingSwalInput();
      tries++;
      if (tries > 80) clearInterval(interval);
    }, 100);
  }

  //
  // ================== INIT ==================
  //
  window.__swalAddCourse = (code, name) => {
    courseMap[code] = name;
    window.__swalCourseMap = courseMap;
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", watchForSwalInputs);
  } else {
    watchForSwalInputs();
  }
})();