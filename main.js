const aboutTitle = document.querySelector(".about-fill-title");
const hero = document.querySelector(".hero");
const profileFlow = document.querySelector(".profile-flow");
const credentialBlocks = document.querySelectorAll(".credential-block");
const projectLightbox = document.querySelector("[data-project-lightbox]");
const lightboxImage = document.querySelector("[data-lightbox-image]");
const lightboxCaption = document.querySelector("[data-lightbox-caption]");
const lightboxClose = document.querySelector("[data-lightbox-close]");
const lightboxPrev = document.querySelector("[data-lightbox-prev]");
const lightboxNext = document.querySelector("[data-lightbox-next]");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

let activeGallery = [];
let activeGalleryIndex = 0;
let lightboxReturnTarget = null;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function setAboutFillPercent(percent) {
  if (!aboutTitle) return;

  const value = clamp(Math.round(percent), 0, 100);
  aboutTitle.style.setProperty("--about-fill", `${value}%`);
  aboutTitle.setAttribute("aria-valuenow", String(value));
}

function setAboutFillFromPointer(clientX) {
  if (!aboutTitle) return;

  const rect = aboutTitle.getBoundingClientRect();
  const progress = (clientX - rect.left) / rect.width;
  setAboutFillPercent(progress * 100);
}

if (aboutTitle) {
  aboutTitle.addEventListener("pointerdown", (event) => {
    aboutTitle.setPointerCapture(event.pointerId);
    setAboutFillFromPointer(event.clientX);
  });

  aboutTitle.addEventListener("pointermove", (event) => {
    if (!aboutTitle.hasPointerCapture(event.pointerId)) return;
    setAboutFillFromPointer(event.clientX);
  });

  aboutTitle.addEventListener("keydown", (event) => {
    const current = Number(aboutTitle.getAttribute("aria-valuenow")) || 0;
    const keySteps = {
      ArrowLeft: -5,
      ArrowDown: -5,
      ArrowRight: 5,
      ArrowUp: 5,
      PageDown: -20,
      PageUp: 20,
    };

    if (event.key === "Home") {
      event.preventDefault();
      setAboutFillPercent(0);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      setAboutFillPercent(100);
      return;
    }

    if (Object.prototype.hasOwnProperty.call(keySteps, event.key)) {
      event.preventDefault();
      setAboutFillPercent(current + keySteps[event.key]);
    }
  });
}

let techTapeFrame = 0;

function updateTechTape() {
  techTapeFrame = 0;

  if (!hero) return;

  const progress = clamp(window.scrollY / Math.max(hero.offsetHeight, 1), 0, 1);
  document.documentElement.style.setProperty("--tech-tape-shift", `${Math.round(progress * -260)}px`);
}

function requestTechTapeUpdate() {
  if (techTapeFrame) return;
  techTapeFrame = window.requestAnimationFrame(updateTechTape);
}

window.addEventListener("scroll", requestTechTapeUpdate, { passive: true });
window.addEventListener("resize", requestTechTapeUpdate);
updateTechTape();

function setupNegativeCursor(section, propertyPrefix) {
  if (!section) return;

  let frame = 0;
  let active = false;
  const target = { x: 0, y: 0 };
  const current = { x: 0, y: 0 };

  function setCursorProperty(name, value) {
    section.style.setProperty(`--${propertyPrefix}-${name}`, value);
  }

  function updateCursor() {
    current.x += (target.x - current.x) * 0.18;
    current.y += (target.y - current.y) * 0.18;

    setCursorProperty("x", `${Math.round(current.x)}px`);
    setCursorProperty("y", `${Math.round(current.y)}px`);

    const distance = Math.abs(target.x - current.x) + Math.abs(target.y - current.y);

    if (active || distance > 0.6) {
      frame = window.requestAnimationFrame(updateCursor);
      return;
    }

    frame = 0;
  }

  function requestCursorUpdate(event) {
    const rect = section.getBoundingClientRect();
    target.x = event.clientX - rect.left;
    target.y = event.clientY - rect.top;
    setCursorProperty("opacity", "1");

    if (frame) return;
    frame = window.requestAnimationFrame(updateCursor);
  }

  section.addEventListener("pointerenter", (event) => {
    const rect = section.getBoundingClientRect();
    target.x = event.clientX - rect.left;
    target.y = event.clientY - rect.top;
    current.x = target.x;
    current.y = target.y;
    active = true;
    setCursorProperty("opacity", "1");
    requestCursorUpdate(event);
  });

  section.addEventListener("pointermove", requestCursorUpdate);

  section.addEventListener("pointerleave", () => {
    active = false;
    setCursorProperty("opacity", "0");
  });
}

setupNegativeCursor(profileFlow, "profile-cursor");

function renderProjectLightbox() {
  if (!lightboxImage || !lightboxCaption || !activeGallery.length) return;

  const currentImage = activeGallery[activeGalleryIndex];
  lightboxImage.src = currentImage.currentSrc || currentImage.src;
  lightboxImage.alt = currentImage.alt || "프로젝트 이미지";
  lightboxCaption.textContent = currentImage.alt || "";

  const hasMultipleImages = activeGallery.length > 1;
  if (lightboxPrev) lightboxPrev.disabled = !hasMultipleImages;
  if (lightboxNext) lightboxNext.disabled = !hasMultipleImages;
}

function openProjectLightbox(image) {
  if (!projectLightbox) return;

  const preview = image.closest(".project-preview");
  activeGallery = preview ? Array.from(preview.querySelectorAll("img")) : [image];
  activeGalleryIndex = Math.max(0, activeGallery.indexOf(image));
  lightboxReturnTarget = image;

  renderProjectLightbox();
  projectLightbox.hidden = false;
  document.body.classList.add("is-lightbox-open");
  lightboxClose?.focus();
}

function closeProjectLightbox() {
  if (!projectLightbox || projectLightbox.hidden) return;

  projectLightbox.hidden = true;
  document.body.classList.remove("is-lightbox-open");
  lightboxImage?.removeAttribute("src");
  lightboxReturnTarget?.focus?.();
}

function moveProjectLightbox(direction) {
  if (!activeGallery.length) return;

  activeGalleryIndex = (activeGalleryIndex + direction + activeGallery.length) % activeGallery.length;
  renderProjectLightbox();
}

document.querySelectorAll(".project-preview img").forEach((image) => {
  image.addEventListener("click", () => openProjectLightbox(image));
});

lightboxClose?.addEventListener("click", closeProjectLightbox);
lightboxPrev?.addEventListener("click", () => moveProjectLightbox(-1));
lightboxNext?.addEventListener("click", () => moveProjectLightbox(1));

projectLightbox?.addEventListener("click", (event) => {
  if (event.target === projectLightbox) {
    closeProjectLightbox();
  }
});

window.addEventListener("keydown", (event) => {
  if (!projectLightbox || projectLightbox.hidden) return;

  if (event.key === "Escape") {
    closeProjectLightbox();
    return;
  }

  if (event.key === "ArrowLeft") {
    moveProjectLightbox(-1);
    return;
  }

  if (event.key === "ArrowRight") {
    moveProjectLightbox(1);
  }
});

if (credentialBlocks.length) {
  if (prefersReducedMotion.matches || !("IntersectionObserver" in window)) {
    credentialBlocks.forEach((block) => block.classList.add("is-visible"));
  } else {
    const credentialObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          credentialObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.22 }
    );

    credentialBlocks.forEach((block) => credentialObserver.observe(block));
  }
}

function syncReducedMotionPreference() {
  document.querySelectorAll("video").forEach((video) => {
    if (prefersReducedMotion.matches) {
      video.pause();
      return;
    }

    video.play().catch(() => {});
  });
}

syncReducedMotionPreference();

if (typeof prefersReducedMotion.addEventListener === "function") {
  prefersReducedMotion.addEventListener("change", syncReducedMotionPreference);
} else {
  prefersReducedMotion.addListener(syncReducedMotionPreference);
}
