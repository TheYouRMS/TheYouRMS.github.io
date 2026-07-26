(function () {
  "use strict";

  var isSubmitting = false;
  var autoCloseTimer = null;

  function ensureSubscribeModal() {
    if (document.getElementById("yourms-subscribe-modal")) return;

    var modal = document.createElement("div");
    modal.id = "yourms-subscribe-modal";
    modal.innerHTML =
      '<div class="ym-overlay" id="ym-overlay"></div>' +
      '<div class="ym-panel" role="dialog" aria-modal="true" aria-labelledby="ym-title">' +
      '  <button class="ym-close" id="ym-close" aria-label="Close">&times;</button>' +
      '  <h3 id="ym-title">YouRMS Email Updates</h3>' +
      '  <p class="ym-sub">Get announcements and update notices from YouRMS.</p>' +
      '  <form id="ym-form" action="https://docs.google.com/forms/d/e/1FAIpQLScVSVvjt1XLpR9r3gURQTxG2QQR1gMukvgpvgSn6Uo9MbYeeQ/formResponse" method="POST" target="ym-hidden-target">' +
      '    <label for="ym-email">Email</label>' +
      '    <input id="ym-email" type="email" name="entry.1210370499" placeholder="Enter your email address" required />' +
      '    <button type="submit">Subscribe</button>' +
      '  </form>' +
      '  <p class="ym-success" id="ym-success" aria-live="polite">Thank you. You are subscribed successfully.</p>' +
      '  <iframe name="ym-hidden-target" id="ym-hidden-target" style="display:none"></iframe>' +
      '</div>';

    document.body.appendChild(modal);

    var closeBtn = document.getElementById("ym-close");
    var overlay = document.getElementById("ym-overlay");
    var form = document.getElementById("ym-form");
    var iframe = document.getElementById("ym-hidden-target");

    function closeModal() {
      if (autoCloseTimer) {
        clearTimeout(autoCloseTimer);
        autoCloseTimer = null;
      }
      modal.classList.remove("open");
      setTimeout(function () {
        if (!modal.classList.contains("open")) {
          modal.style.display = "none";
        }
      }, 250);
    }

    closeBtn.addEventListener("click", closeModal);
    overlay.addEventListener("click", closeModal);

    form.addEventListener("submit", function () {
      isSubmitting = true;
      document.getElementById("ym-success").classList.remove("show");
      if (autoCloseTimer) {
        clearTimeout(autoCloseTimer);
        autoCloseTimer = null;
      }
    });

    iframe.addEventListener("load", function () {
      if (isSubmitting) {
        isSubmitting = false;
        document.getElementById("ym-success").classList.add("show");
        form.reset();

        autoCloseTimer = setTimeout(function () {
          closeModal();
        }, 2000);
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal.classList.contains("open")) {
        closeModal();
      }
    });
  }

  function openSubscribePopup(event) {
    if (event) event.preventDefault();
    ensureSubscribeModal();

    var modal = document.getElementById("yourms-subscribe-modal");
    modal.style.display = "block";
    requestAnimationFrame(function () {
      modal.classList.add("open");
    });
  }

  function injectUpdateBanner() {
    if (!document.body || document.getElementById("yourms-update-banner")) return;

    var banner = document.createElement("div");
    banner.id = "yourms-update-banner";
    banner.innerHTML =
      '<div class="yourms-banner-inner">' +
      '<div class="yourms-banner-text">' +
      '<strong>Last updated: July 26, 2026 at 3:13 PM. </strong> Get update on E-mail <a href="subscribe.html" id="yourms-subscribe-link">Subscribe</a>' +
      '</div>' +
      "</div>";

    var style = document.createElement("style");
    style.textContent =
      "#yourms-update-banner{background:#ffffff;color:#111827;padding:4px 10px;text-align:center;position:relative;z-index:5;width:100%;min-height:0;border-bottom:1px solid #e5e7eb;}" +
      "#yourms-nav-divider{margin:0;border:0;border-top:1px solid #e5e7eb;}" +
      "#yourms-update-banner .yourms-banner-inner{display:flex;flex-direction:column;gap:2px;align-items:center;justify-content:center;}" +
      "#yourms-update-banner .yourms-banner-text{width:100%;font-size:.8rem;line-height:1.2;color:#16a34a;}" +
      "#yourms-update-banner .yourms-banner-note{font-size:.75rem;opacity:.96;white-space:nowrap;}" +
      "#yourms-subscribe-link{color:#0077cc;font-weight:700;text-decoration:underline;text-underline-offset:2px;}" +
      "#yourms-subscribe-link:hover{color:#005fa3;}" +
      "body.swal2-shown #yourms-update-banner,body.swal2-shown #yourms-nav-divider{display:none!important;}" +
      "#yourms-subscribe-modal{display:none;position:fixed;inset:0;z-index:2000;}" +
      "#yourms-subscribe-modal .ym-overlay{position:absolute;inset:0;background:rgba(10,16,32,0.45);opacity:0;transition:opacity .25s ease;}" +
      "#yourms-subscribe-modal .ym-panel{position:relative;max-width:460px;margin:8vh auto 0;background:#fff;border-radius:14px;padding:22px 20px;box-shadow:0 20px 40px rgba(0,0,0,.25);transform:translateY(14px) scale(.98);opacity:0;transition:transform .25s ease,opacity .25s ease;}" +
      "#yourms-subscribe-modal.open .ym-overlay{opacity:1;}" +
      "#yourms-subscribe-modal.open .ym-panel{opacity:1;transform:translateY(0) scale(1);}" +
      "#yourms-subscribe-modal h3{margin:0 0 6px;color:#0077cc;font-size:1.35rem;}" +
      "#yourms-subscribe-modal .ym-sub{margin:0 0 14px;color:#475569;font-size:.95rem;}" +
      "#yourms-subscribe-modal label{display:block;margin:0 0 6px;font-weight:600;color:#334155;}" +
      "#yourms-subscribe-modal input{width:100%;padding:10px 12px;border:1px solid #cfeaf8;border-radius:8px;background:#f8fdff;outline:none;}" +
      "#yourms-subscribe-modal input:focus{border-color:#00aeef;background:#fff;}" +
      "#yourms-subscribe-modal button[type='submit']{margin-top:12px;width:100%;border:none;border-radius:8px;padding:10px 12px;background:#00aeef;color:#fff;font-weight:700;cursor:pointer;}" +
      "#yourms-subscribe-modal button[type='submit']:hover{background:#0077cc;}" +
      "#yourms-subscribe-modal .ym-close{position:absolute;right:10px;top:8px;border:none;background:transparent;font-size:1.6rem;line-height:1;color:#64748b;cursor:pointer;}" +
      "#yourms-subscribe-modal .ym-success{display:none;margin-top:12px;padding:10px 12px;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:8px;color:#065f46;font-weight:600;}" +
      "#yourms-subscribe-modal .ym-success.show{display:block;}";

    document.head.appendChild(style);
    var nav = document.querySelector("nav, .navbar");
    var divider = document.createElement("hr");
    divider.id = "yourms-nav-divider";
    if (nav && nav.parentNode) {
      if (nav.nextSibling) {
        nav.parentNode.insertBefore(divider, nav.nextSibling);
        nav.parentNode.insertBefore(banner, divider.nextSibling);
      } else {
        nav.parentNode.appendChild(divider);
        nav.parentNode.appendChild(banner);
      }
    } else {
      document.body.insertBefore(divider, document.body.firstChild);
      document.body.insertBefore(banner, document.body.firstChild);
    }

    var link = document.getElementById("yourms-subscribe-link");
    if (link) {
      link.addEventListener("click", openSubscribePopup);
    }

    ensureSubscribeModal();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectUpdateBanner);
  } else {
    injectUpdateBanner();
  }
})();
