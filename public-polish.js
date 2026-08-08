(() => {
  "use strict";

  const boot = () => {
    document.documentElement.dataset.augustPublic = "v1";

    const revealTargets = Array.from(
      document.querySelectorAll("main > section, main > article, main > div")
    ).slice(0, 24);

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              entry.target.classList.add("august-public-visible");
              observer.unobserve(entry.target);
            }
          }
        },
        { threshold: 0.08, rootMargin: "0px 0px -5% 0px" }
      );

      revealTargets.forEach((element, index) => {
        element.classList.add("august-public-reveal");
        element.style.transitionDelay = Math.min(index * 45, 180) + "ms";
        observer.observe(element);
      });
    }

    if (window.matchMedia("(pointer: fine) and (min-width: 900px)").matches) {
      const glow = document.createElement("div");
      glow.id = "august-public-cursor-glow";
      glow.setAttribute("aria-hidden", "true");
      document.body.appendChild(glow);

      let raf = 0;
      let lastX = 0;
      let lastY = 0;

      const paint = () => {
        glow.style.left = lastX + "px";
        glow.style.top = lastY + "px";
        raf = 0;
      };

      window.addEventListener(
        "pointermove",
        (event) => {
          lastX = event.clientX;
          lastY = event.clientY;
          document.body.classList.add("august-pointer-active");
          if (!raf) raf = requestAnimationFrame(paint);
        },
        { passive: true }
      );

      document.documentElement.addEventListener(
        "mouseleave",
        () => document.body.classList.remove("august-pointer-active")
      );
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
