/* coursenameadd.js */

function getCourseName(code) {
  if (!code) return code;
  // Avoid double replacement
  if (code.includes("—")) return code;

  const cleanCode = code.trim();
  // Normalize: "cse  2305" -> "CSE 2305"
  const upperCode = cleanCode.toUpperCase().replace(/\s+/g, " ");

  if (typeof COURSE_DATA === "undefined") return code;

  // Try exact match first, then normalized upper
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
    if (newText !== text) {
      h2.textContent = newText;
    }
  });

  document.querySelectorAll(".selected-card h3").forEach(h3 => {
    const text = h3.textContent;
    const newText = getCourseName(text);
    if (newText !== text) {
      h3.textContent = newText;
    }
  });
}

const observer = new MutationObserver(() => {
  applyCourseNames();
});

if (document.body) {
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
} else {
    document.addEventListener("DOMContentLoaded", () => {
        observer.observe(document.body, {
          childList: true,
          subtree: true
        });
    });
}

document.addEventListener("DOMContentLoaded", applyCourseNames);
// Also try immediately in case DOM is ready
applyCourseNames();
