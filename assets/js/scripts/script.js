function fadeIn(element, duration = 250) {
  element.style.opacity = 0;
  element.style.display = 'block';

  let startTime = null;

  function animationStep(timestamp) {
    if (!startTime) startTime = timestamp;

    const elapsed = timestamp - startTime;
    const progress = elapsed / duration;

    element.style.opacity = progress >= 1 ? 1 : progress;

    if (progress < 1) {
      window.requestAnimationFrame(animationStep);
    }
  }

  window.requestAnimationFrame(animationStep);
}

function fadeOut(element, duration = 250) {
  let startTime = null;
  let startOpacity = parseFloat(window.getComputedStyle(element).opacity);

  function animationStep(timestamp) {
    if (!startTime) startTime = timestamp;

    const elapsed = timestamp - startTime;
    const progress = elapsed / duration;

    element.style.opacity = startOpacity * (1 - progress);

    if (progress < 1) {
      window.requestAnimationFrame(animationStep);
    } else {
      element.style.display = 'none';
    }
  }

  window.requestAnimationFrame(animationStep);
}

function rnd(min, max) {
  var rand = min - 0.5 + Math.random() * (max - min + 1);
  rand = Math.round(rand);
  return rand;
}

function animateFromTo(elem, time, from, to, delay = 0) {
  gsap.fromTo(elem, { ...from, duration: time }, to).delay(delay);
}

window.addEventListener('load', function () {
  document.body.classList.add('init');
});

class ActiveLink {
  constructor() {
    this.activeLinks = [];
  }
  init() {
    const links = Array.from(document.querySelectorAll('a')) || [];
    const currentURL = window.location.href;
    links.forEach((link) => {
      const linkURL = link.href;
      if (linkURL === currentURL) {
        link.classList.add('current-route');
        this.activeLinks.push(link);
      }
    });
  }
  destroy() {
    if (this.activeLinks.length) {
      this.activeLinks.forEach((link) => {
        link.classList.remove('current-route');
      });
      this.activeLinks = [];
    }
  }
}
const ACTIVE_LINK = new ActiveLink();
ACTIVE_LINK.init();

OBSERVER_LOADERS.push(ACTIVE_LINK);
//
