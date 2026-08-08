(() => {
  "use strict";

  const CARD_SELECTOR = [
    "main article",
    "main [class*='card']",
    "main [class*='panel']",
    "main [class*='tile']"
  ].join(",");

  const installScrollProgress = () => {
    if (document.getElementById("august-v2-scroll-progress")) return;

    const wrap = document.createElement("div");
    wrap.id = "august-v2-scroll-progress";

    const bar = document.createElement("span");
    wrap.appendChild(bar);
    document.body.appendChild(wrap);

    let raf = 0;

    const update = () => {
      const doc = document.documentElement;
      const max = Math.max(1, doc.scrollHeight - window.innerHeight);
      const ratio = Math.max(0, Math.min(1, window.scrollY / max));
      bar.style.transform = `scaleX(${ratio})`;
      raf = 0;
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
  };

  const installLiveStatus = () => {
    if (document.getElementById("august-v2-live-status")) return;

    const node = document.createElement("div");
    node.id = "august-v2-live-status";
    node.setAttribute("aria-hidden", "true");
    node.innerHTML = `
      <span class="dot"></span>
      <span>AUGUST // PUBLIC INTERFACE · ONLINE</span>
    `;
    document.body.appendChild(node);
  };

  const installFooter = () => {
    if (document.getElementById("august-v2-footer")) return;

    const footer = document.createElement("footer");
    footer.id = "august-v2-footer";

    footer.innerHTML = `
      <div class="august-v2-footer-inner">
        <div class="august-v2-footer-brand">
          <span class="august-v2-footer-mark">A</span>
          <span>AUGUST © 2026</span>
        </div>

        <div class="august-v2-footer-meta">
          <span>BUILT BY ILYA SAFONOV</span>
          <span class="august-v2-footer-separator"></span>
          <span>LOCAL-FIRST AI SYSTEM</span>
          <span class="august-v2-footer-separator"></span>
          <span id="august-v2-clock">--:--:--</span>
        </div>
      </div>
    `;

    document.body.appendChild(footer);

    const clock = footer.querySelector("#august-v2-clock");

    const tick = () => {
      if (!clock) return;
      clock.textContent = new Intl.DateTimeFormat(
        undefined,
        {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false
        }
      ).format(new Date());
    };

    tick();
    window.setInterval(tick, 1000);
  };

  const installCardTilt = () => {
    if (!window.matchMedia("(pointer: fine) and (min-width: 900px)").matches) {
      return;
    }

    const bind = (card) => {
      if (!(card instanceof HTMLElement)) return;
      if (card.dataset.augustV2Tilt === "1") return;
      if (card.closest("#august-boot-intro-v1")) return;
      if (card.closest("#august-v2-footer")) return;

      card.dataset.augustV2Tilt = "1";
      card.classList.add("august-v2-card");

      let raf = 0;
      let lastEvent = null;

      const paint = () => {
        if (!lastEvent) {
          raf = 0;
          return;
        }

        const rect = card.getBoundingClientRect();

        if (rect.width < 80 || rect.height < 48) {
          raf = 0;
          return;
        }

        const px = (lastEvent.clientX - rect.left) / rect.width;
        const py = (lastEvent.clientY - rect.top) / rect.height;
        const rx = (0.5 - py) * 3.2;
        const ry = (px - 0.5) * 3.8;

        card.style.setProperty("--august-v2-pointer-x", `${px * 100}%`);
        card.style.setProperty("--august-v2-pointer-y", `${py * 100}%`);
        card.style.transform =
          `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-2px)`;

        raf = 0;
      };

      card.addEventListener(
        "pointermove",
        (event) => {
          lastEvent = event;
          if (!raf) raf = requestAnimationFrame(paint);
        },
        { passive: true }
      );

      card.addEventListener(
        "pointerleave",
        () => {
          lastEvent = null;
          card.style.transform = "";
          card.style.removeProperty("--august-v2-pointer-x");
          card.style.removeProperty("--august-v2-pointer-y");
        },
        { passive: true }
      );
    };

    document.querySelectorAll(CARD_SELECTOR).forEach(bind);

    const observer = new MutationObserver(() => {
      document.querySelectorAll(CARD_SELECTOR).forEach(bind);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  };

  const installRouteTransition = () => {
    let timer = 0;

    const pulse = () => {
      document.body.classList.remove("august-v2-route-shift");
      void document.body.offsetWidth;
      document.body.classList.add("august-v2-route-shift");

      window.clearTimeout(timer);
      timer = window.setTimeout(
        () => document.body.classList.remove("august-v2-route-shift"),
        300
      );
    };

    window.addEventListener("hashchange", pulse);

    document.addEventListener(
      "click",
      (event) => {
        const anchor = event.target.closest("a[href^='#']");
        if (anchor) pulse();
      },
      true
    );
  };

  const boot = () => {
    document.documentElement.dataset.augustPublicV2 = "premium";

    installScrollProgress();
    installLiveStatus();
    installFooter();
    installCardTilt();
    installRouteTransition();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
