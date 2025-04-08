class AnimatedElementsObserver {
  constructor() {
    this.elements = [];
    this.intersectionObservers = new Map();
  }

  init() {
    this.elements = document.querySelectorAll('[data-animated="false"]');
    this.elements.forEach((element) => {
      const rootMargin = this.getRootMargin(element);
      const intersectionObserver = new IntersectionObserver(
        (entries) => this.handleIntersection(entries),
        { threshold: 0.01, rootMargin },
      );
      intersectionObserver.observe(element);
      this.intersectionObservers.set(element, intersectionObserver);
    });
  }

  destroy() {
    this.intersectionObservers.forEach((intersectionObserver) => {
      intersectionObserver.disconnect();
    });
    this.intersectionObservers.clear();
    this.elements = [];
  }

  checkSvgAnimation(elem) {
    try {
      const anim = Array.from(
        elem.querySelectorAll('animate[data-svg-animate="false"]'),
      );
      if (anim.length) {
        anim.forEach((item) => {
          item.beginElement();
        });
      }
    } catch (e) {
      console.log(e);
    }
  }

  getRootMargin(element) {
    const marginTop = element.getAttribute('data-animated-margin-top');
    const marginBottom = element.getAttribute('data-animated-margin-bottom');
    if (marginTop || marginBottom) {
      return `${marginTop || '0px'} 0px ${marginBottom || '0px'} 0px`;
    }
    return '0px';
  }

  handleIntersection(entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const element = entry.target;
        element.setAttribute('data-animated', 'true');
        this.checkSvgAnimation(element);
        const intersectionObserver = this.intersectionObservers.get(element);
        intersectionObserver.unobserve(element);
      }
    });
  }
}

const ANIME_ELEMENTS_OBSERVER = new AnimatedElementsObserver();
