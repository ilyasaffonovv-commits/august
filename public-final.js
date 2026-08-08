(() => {
  "use strict";

  const NAV_WORDS = [
    {
      match: ["продукт", "product"],
      label: "Продукт"
    },
    {
      match: ["возможности", "capabilities", "features"],
      label: "Возможности"
    },
    {
      match: ["roadmap"],
      label: "Roadmap"
    },
    {
      match: ["контакты", "contacts", "contact"],
      label: "Контакты"
    }
  ];

  let toastTimer = 0;

  const textOf = (node) =>
    (node?.textContent || "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();

  const showToast = (text) => {
    let toast = document.getElementById("august-final-toast");

    if (!toast) {
      toast = document.createElement("div");
      toast.id = "august-final-toast";
      document.body.appendChild(toast);
    }

    toast.textContent = text;
    toast.classList.add("show");

    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(
      () => toast.classList.remove("show"),
      1500
    );
  };

  const installAmbient = () => {
    if (document.getElementById("august-final-ambient")) return;

    const ambient = document.createElement("div");
    ambient.id = "august-final-ambient";
    ambient.setAttribute("aria-hidden", "true");
    document.body.prepend(ambient);

    if (!window.matchMedia("(pointer: fine)").matches) return;

    let raf = 0;
    let latest = null;

    window.addEventListener(
      "pointermove",
      (event) => {
        latest = event;

        if (raf) return;

        raf = requestAnimationFrame(() => {
          if (latest) {
            ambient.style.setProperty(
              "--august-final-x",
              latest.clientX + "px"
            );
            ambient.style.setProperty(
              "--august-final-y",
              latest.clientY + "px"
            );
          }

          raf = 0;
        });
      },
      { passive: true }
    );
  };

  const installIntroFinalState = () => {
    const splash = document.getElementById("august-boot-intro-v1");

    if (!splash) return;

    const systems = splash.querySelector(".august-boot-systems");

    if (
      systems &&
      !splash.querySelector(".august-boot-ready")
    ) {
      const ready = document.createElement("div");
      ready.className = "august-boot-ready";
      ready.innerHTML =
        "<span></span><b>READY · ENTERING COMMAND CENTER</b>";
      systems.insertAdjacentElement("afterend", ready);
    }
  };

  const getNavTargets = () => {
    const candidates = Array.from(
      document.querySelectorAll(
        "header a[href], nav a[href], a[href^='#']"
      )
    );

    const seen = new Set();
    const items = [];

    for (const spec of NAV_WORDS) {
      const anchor = candidates.find((node) => {
        const text = textOf(node);
        return spec.match.some(
          (word) => text.includes(word)
        );
      });

      if (!anchor) continue;

      const href = anchor.getAttribute("href");

      if (!href || seen.has(href)) continue;

      seen.add(href);

      items.push({
        label: spec.label,
        href
      });
    }

    return items;
  };

  const closeDeck = () => {
    const deck = document.getElementById("august-final-deck");

    if (!deck) return;

    deck.classList.remove("open");
    deck.setAttribute("aria-hidden", "true");
    document.documentElement.style.overflow = "";
  };

  const openDeck = () => {
    const deck = document.getElementById("august-final-deck");

    if (!deck) return;

    deck.classList.add("open");
    deck.setAttribute("aria-hidden", "false");
    document.documentElement.style.overflow = "hidden";

    const close = deck.querySelector(
      "#august-final-deck-close"
    );

    window.setTimeout(
      () => close?.focus(),
      60
    );
  };

  const addAction = (
    grid,
    index,
    label,
    href,
    handler
  ) => {
    const node = href
      ? document.createElement("a")
      : document.createElement("button");

    node.className = "august-final-action";

    if (href) {
      node.href = href;
    } else {
      node.type = "button";
    }

    node.innerHTML = `
      <span class="august-final-action-main">
        <span class="august-final-action-index">${String(index).padStart(2, "0")}</span>
        <span class="august-final-action-label">${label}</span>
      </span>
      <span class="august-final-action-arrow">↗</span>
    `;

    if (handler) {
      node.addEventListener(
        "click",
        handler
      );
    }

    if (href) {
      node.addEventListener(
        "click",
        () => closeDeck()
      );
    }

    grid.appendChild(node);
  };

  const installDeck = () => {
    if (document.getElementById("august-final-launcher")) {
      return;
    }

    const launcher = document.createElement("button");
    launcher.id = "august-final-launcher";
    launcher.type = "button";
    launcher.innerHTML =
      '<span class="mark">A</span><span>Explore</span>';

    const deck = document.createElement("div");
    deck.id = "august-final-deck";
    deck.setAttribute("aria-hidden", "true");

    deck.innerHTML = `
      <div
        class="august-final-deck-card"
        role="dialog"
        aria-modal="true"
        aria-label="AUGUST navigation"
      >
        <div class="august-final-deck-head">
          <div class="august-final-deck-title">
            <strong>AUGUST / Quick Access</strong>
            <span>Public interface navigation</span>
          </div>

          <button
            id="august-final-deck-close"
            type="button"
            aria-label="Close"
          >×</button>
        </div>

        <div
          class="august-final-deck-grid"
          id="august-final-deck-grid"
        ></div>

        <div class="august-final-deck-foot">
          <span>Internal navigation only</span>
          <span>ESC · CLOSE</span>
        </div>
      </div>
    `;

    document.body.appendChild(launcher);
    document.body.appendChild(deck);

    const grid = deck.querySelector(
      "#august-final-deck-grid"
    );

    let index = 1;

    for (const item of getNavTargets()) {
      addAction(
        grid,
        index++,
        item.label,
        item.href,
        null
      );
    }

    addAction(
      grid,
      index++,
      "Наверх",
      null,
      () => {
        closeDeck();
        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });
      }
    );

    addAction(
      grid,
      index++,
      "Скопировать ссылку",
      null,
      async () => {
        try {
          await navigator.clipboard.writeText(
            window.location.href
          );
          showToast("LINK COPIED");
        } catch {
          const temp = document.createElement("textarea");
          temp.value = window.location.href;
          temp.style.position = "fixed";
          temp.style.opacity = "0";
          document.body.appendChild(temp);
          temp.focus();
          temp.select();
          document.execCommand("copy");
          temp.remove();
          showToast("LINK COPIED");
        }
      }
    );

    if (navigator.share) {
      addAction(
        grid,
        index++,
        "Поделиться",
        null,
        async () => {
          try {
            await navigator.share({
              title: document.title,
              url: window.location.href
            });
          } catch {
            // User canceled or browser rejected; no UI error needed.
          }
        }
      );
    }

    launcher.addEventListener(
      "click",
      openDeck
    );

    deck.querySelector(
      "#august-final-deck-close"
    )?.addEventListener(
      "click",
      closeDeck
    );

    deck.addEventListener(
      "click",
      (event) => {
        if (event.target === deck) {
          closeDeck();
        }
      }
    );

    document.addEventListener(
      "keydown",
      (event) => {
        if (event.key === "Escape") {
          closeDeck();
        }
      }
    );
  };

  const installReveal = () => {
    const candidates = Array.from(
      document.querySelectorAll(
        "main section, main article"
      )
    ).filter(
      (node) =>
        !node.closest("#august-boot-intro-v1")
    );

    if (!("IntersectionObserver" in window)) {
      candidates.forEach(
        (node) =>
          node.classList.add(
            "august-final-visible"
          )
      );
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(
          (entry) => {
            if (!entry.isIntersecting) return;

            entry.target.classList.add(
              "august-final-visible"
            );
            observer.unobserve(entry.target);
          }
        );
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -5% 0px"
      }
    );

    candidates.forEach(
      (node) => {
        node.classList.add(
          "august-final-reveal"
        );
        observer.observe(node);
      }
    );
  };

  const installActiveNav = () => {
    const links = Array.from(
      document.querySelectorAll(
        'header a[href^="#"], nav a[href^="#"]'
      )
    );

    if (
      links.length === 0 ||
      !("IntersectionObserver" in window)
    ) {
      return;
    }

    const sections = [];

    for (const link of links) {
      const href = link.getAttribute("href");

      if (
        !href ||
        href === "#" ||
        !href.startsWith("#")
      ) {
        continue;
      }

      let target = null;

      try {
        target = document.querySelector(href);
      } catch {
        target = null;
      }

      if (!target) continue;

      sections.push({
        target,
        link
      });
    }

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter(
            (entry) => entry.isIntersecting
          )
          .sort(
            (a, b) =>
              b.intersectionRatio -
              a.intersectionRatio
          );

        if (!visible.length) return;

        const active = sections.find(
          (item) =>
            item.target === visible[0].target
        );

        if (!active) return;

        links.forEach(
          (link) =>
            link.classList.remove(
              "august-final-active-link"
            )
        );

        active.link.classList.add(
          "august-final-active-link"
        );
      },
      {
        threshold: [0.25, 0.5, 0.75],
        rootMargin: "-15% 0px -60% 0px"
      }
    );

    sections.forEach(
      (item) => observer.observe(item.target)
    );
  };

  const boot = () => {
    document.documentElement.dataset.augustFinal =
      "premium-v3";

    installAmbient();
    installIntroFinalState();
    installDeck();
    installReveal();
    installActiveNav();
  };

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      boot,
      { once: true }
    );
  } else {
    boot();
  }
})();

/* AUGUST_MOBILE_FIRST_SCREEN_FIX_V1 */
(() => {
  "use strict";

  const mobile = window.matchMedia("(max-width: 780px)");

  const visibleText = (node) =>
    (node?.textContent || "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();

  const findHero = () => {
    const main = document.querySelector("main");
    if (!main) return null;

    const direct = Array.from(main.children);

    const byText = direct.find((node) => {
      const text = visibleText(node);
      return (
        text.includes("august command center") ||
        text.includes("локальный интеллектуальный агент") ||
        text.includes("local system online")
      );
    });

    if (byText) return byText;

    const firstSection = main.querySelector(":scope > section");
    if (firstSection) return firstSection;

    return direct[0] || null;
  };

  const apply = () => {
    if (!mobile.matches) return;

    const main = document.querySelector("main");
    const hero = findHero();

    if (!main || !hero) return;

    main.classList.add("august-mobile-main-fix");
    hero.classList.add("august-mobile-first-screen-fix");

    hero.style.setProperty("min-height", "auto", "important");
    hero.style.setProperty("height", "auto", "important");
    hero.style.setProperty("margin-top", "0", "important");
    hero.style.setProperty("padding-top", "20px", "important");
    hero.style.setProperty("padding-bottom", "34px", "important");
    hero.style.setProperty("justify-content", "flex-start", "important");

    const descendants = hero.querySelectorAll("*");
    const viewport = Math.max(
      window.innerHeight || 0,
      document.documentElement.clientHeight || 0
    );

    for (const node of descendants) {
      const style = getComputedStyle(node);

      if (style.marginTop === "auto") {
        node.style.setProperty("margin-top", "0", "important");
      }

      const minHeight = parseFloat(style.minHeight);

      if (
        Number.isFinite(minHeight) &&
        viewport > 0 &&
        minHeight > viewport * 1.05
      ) {
        node.style.setProperty("min-height", "auto", "important");
      }
    }
  };

  const boot = () => {
    apply();

    let timer = 0;

    const observer = new MutationObserver(() => {
      window.clearTimeout(timer);
      timer = window.setTimeout(apply, 80);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    window.addEventListener(
      "resize",
      apply,
      { passive: true }
    );
  };

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      boot,
      { once: true }
    );
  } else {
    boot();
  }
})();
