/* coursenameadd.js - shows course name in calendar view without touching index.html */

function getCourseName(code) {
  if (!code) return code;
  if (code.includes("—")) return code;

  const cleanCode = code.trim();
  const upperCode = cleanCode.toUpperCase().replace(/\s+/g, " ");

  if (typeof COURSE_DATA === "undefined") return code;

  let name = COURSE_DATA[cleanCode] || COURSE_DATA[upperCode];

  if (name) {
    return `${cleanCode} — ${name}`;
  }
  return code;
}

function applyCourseNames() {
  if (typeof COURSE_DATA === "undefined") return;

  document.querySelectorAll(".course h2").forEach(h2 => {
    const text = h2.textContent;
    const newText = getCourseName(text);
    if (newText!== text) {
      h2.textContent = newText;
    }
  });

  document.querySelectorAll(".selected-card h3").forEach(h3 => {
    const text = h3.textContent;
    const newText = getCourseName(text);
    if (newText!== text) {
      h3.textContent = newText;
    }
  });
}

// --- OVERRIDE calendar view to show course name ---
function applyCourseNameToCalendar() {
  // save original if not saved yet
  if (!window._originalRenderDailyScheduleSummary && typeof window.renderDailyScheduleSummary === 'function') {
    window._originalRenderDailyScheduleSummary = window.renderDailyScheduleSummary;
  }

  window.renderDailyScheduleSummary = function () {
    const summaryContainer = document.getElementById("daily-schedule-summary");
    if (!summaryContainer) return;
    const BODY_H = 380;
    const DAY_CAL_ORDER = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayBlocks = {};

    for (let key in selected) {
      const entry = selected[key];
      const fullName = getCourseName(key); // "CSE 2301 — Data Structures"
      const timeSlots = Array.isArray(entry.time)? entry.time : [entry.time];
      const classDays = extractDays(entry);
      for (let day of classDays) {
        if (!dayBlocks[day]) dayBlocks[day] = [];
        timeSlots.forEach(slot => {
          const r = parseTimeRange(slot);
          if (r &&!isNaN(r[0]) &&!isNaN(r[1])) {
            dayBlocks[day].push({
              start: r[0],
              end: r[1],
              label: key,
              fullName: fullName,
              section: entry.section
            });
          }
        });
      }
    }

    const activeDays = DAY_CAL_ORDER.filter(d => dayBlocks[d]);
    if (!activeDays.length) {
      summaryContainer.innerHTML = '';
      summaryContainer.style.display = 'none';
      return;
    }

    let gMin = Infinity, gMax = -Infinity;
    activeDays.forEach(d => dayBlocks[d].forEach(b => {
      if (b.start < gMin) gMin = b.start;
      if (b.end > gMax) gMax = b.end;
    }));
    gMin = Math.floor((gMin - 30) / 60) * 60;
    gMax = Math.ceil((gMax + 30) / 60) * 60;
    const totalMin = gMax - gMin;

    const fmtT = m => {
      let hh = Math.floor(m / 60), mm = m % 60, ap = hh >= 12? 'pm' : 'am';
      if (hh > 12) hh -= 12;
      if (hh === 0) hh = 12;
      return String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0') + ' ' + ap;
    };

    const PALETTE = ['#b14323', '#2f6b4f', '#2557a7', '#7c3fa8', '#b07a00', '#c0394b', '#1a7a7a', '#8a4b08'];
    const ALL_KEYS = Object.keys(selected);
    const colorOf = k => PALETTE[ALL_KEYS.indexOf(k) % PALETTE.length] || PALETTE[0];
    const toY = m => ((m - gMin) / totalMin * BODY_H).toFixed(1);
    const toH = (s, e) => (Math.max(4, e - s) / totalMin * BODY_H).toFixed(1);

    const ticks = [];
    for (let m = gMin; m <= gMax; m += 60) ticks.push(m);
    const gutterHtml = ticks.map(m => '<div class="cal-hour-label" style="top:' + toY(m) + 'px">' + fmtT(m) + '</div>').join('');

    const colsHtml = activeDays.map(day => {
      const gridlines = ticks.map(m => '<div class="cal-gridline" style="top:' + toY(m) + 'px"></div>').join('');
      const blocks = dayBlocks[day].slice().sort((a, b) => a.start - b.start).map(b => {
        return '<div class="cal-block" style="top:' + toY(b.start) + 'px;height:' + toH(b.start, b.end) + 'px;background:' + colorOf(b.label) + '" title="' + b.fullName + ' §' + b.section + '">' +
          '<span class="cal-block-name" style="white-space:normal; line-height:1.15; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden;">' + b.fullName + '</span>' +
          '<span class="cal-block-time">' + fmtT(b.start) + '–' + fmtT(b.end) + '</span></div>';
      }).join('');
      return '<div class="cal-col"><div class="cal-col-head">' + day + '</div><div class="cal-col-body" style="height:' + BODY_H + 'px">' + gridlines + blocks + '</div></div>';
    }).join('');

    const legendHtml = ALL_KEYS.map(k => {
      const full = getCourseName(k);
      return '<span class="cal-legend-item"><span class="cal-legend-dot" style="background:' + colorOf(k) + '"></span>' + full + '</span>';
    }).join('');

    summaryContainer.innerHTML =
      '<div class="cal-section-header">' +
      '<span class="cal-section-title"><i class="fas fa-calendar-week"></i> Daily Schedule</span>' +
      '<button class="icon-action-btn" id="cal-download-btn" title="Download calendar"><i class="fas fa-download"></i></button>' +
      '</div>' +
      '<div id="cal-capture-area">' +
      '<div class="cal-wrap" style="--cal-day-count:' + activeDays.length + '">' +
      '<div class="cal-inner">' +
      '<div class="cal-gutter"><div class="cal-gutter-spacer"></div><div class="cal-gutter-body" style="height:' + BODY_H + 'px">' + gutterHtml + '</div></div>' +
      '<div class="cal-columns">' + colsHtml + '</div>' +
      '</div>' +
      '<div class="cal-legend">' + legendHtml + '</div>' +
      '</div>' +
      '</div>';
    summaryContainer.style.display = 'block';
    const calDlBtn = document.getElementById('cal-download-btn');
    if (calDlBtn) calDlBtn.onclick = () => { if (window.downloadCal) window.downloadCal(); };
  };
}

// try to override as soon as possible
function tryOverrideCalendar() {
  if (typeof window.renderDailyScheduleSummary === 'function' && typeof window.parseTimeRange === 'function') {
    applyCourseNameToCalendar();
    // re-render if already has data
    if (typeof selected!== 'undefined' && Object.keys(selected).length > 0) {
      window.renderDailyScheduleSummary();
    }
    return true;
  }
  return false;
}

// Keep trying until index.html defines the function
if (!tryOverrideCalendar()) {
  const interval = setInterval(() => {
    if (tryOverrideCalendar()) clearInterval(interval);
  }, 200);
}

const observer = new MutationObserver(() => {
  applyCourseNames();
});

if (document.body) {
  observer.observe(document.body, { childList: true, subtree: true });
} else {
  document.addEventListener("DOMContentLoaded", () => {
    observer.observe(document.body, { childList: true, subtree: true });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  applyCourseNames();
  tryOverrideCalendar();
});

applyCourseNames();
