import SiteAnimation from '../modules/SiteAnimation';
import { Power2 } from 'gsap';

export default new (class CustomFade extends SiteAnimation {
  constructor() {
    super();
    this.destroyOnInit = false;
    this.classList = ['.customFade, .cookiePolicy .column.right .content > *'];
  }
  init(classList = []) {
    super.init('CustomFade');
    if (this.isWpAdmin) return;
    this.observer = new IntersectionObserver(this.observerCallback.bind(this));
    this.setTween([...this.classList, ...classList].join(', '));
    this.styleFileLoadedFunc = this.setTween.bind(
      this,
      [...this.classList, ...classList].join(', '),
    );
    window.addEventListener('styleFileLoaded', this.styleFileLoadedFunc, {
      passive: true,
    });
  }
  observerCallback(entries) {
    entries.forEach(({ target: element, isIntersecting }) => {
      if (isIntersecting && !element.classList.contains('show')) {
        const delay = element.dataset.delay
          ? parseFloat(element.dataset.delay) / 1000
          : 0;
        this.observer.unobserve(element);
        gsap.to(element, {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: Power2.easeOut,
          clearProps: 'all',
          delay: delay,
          onComplete: () => {
            element.classList.add('show');
          },
        });
      }
    });
  }
  setTween(tag) {
    this.elemsList = [...document.querySelectorAll(tag)];
    this.elemsList
      .filter((el) => {
        return (
          !el.classList.contains('init') &&
          !el.classList.contains('waitInit') &&
          (el.closest('.styleBoxes[data-style-loaded="true"]') ||
            el.closest('.wrapper[data-style-loaded="true"]') ||
            el.closest('.pageHeroScreen') ||
            !el.closest('.styleBoxes'))
        );
      })
      .filter((el) => {
        if (el.closest('.cookiePolicyHeroScreen')) return true;
        if (el.closest('.pageHeroScreen') && isTablet) return false;
        return true;
      })
      .forEach((element) => {
        if (!this.hasPreloader() || window.preloaderSuccess) {
          element.classList.add('waitInit');
          setTimeout(() => this.createTrigger(element), 500);
        }
      });
  }
  hidePreloaderEvent({ detail: { delay = 0 } } = {}) {
    setTimeout(() => {
      this.elemsList
        .filter((el) => {
          return (
            !el.classList.contains('init') &&
            !el.classList.contains('waitInit') &&
            (el.closest('.styleBoxes[data-style-loaded="true"]') ||
              el.closest('.wrapper[data-style-loaded="true"]') ||
              !el.closest('.styleBoxes'))
          );
        })
        .forEach((element) => {
          element.classList.add('waitInit');
          this.createTrigger(element);
        });
    }, 500);
  }
  createTrigger(element) {
    if (element.classList.contains('init')) return;
    // console.log('createTrigger', element);
    element.classList.add('init');
    this.observer.observe(element);

    gsap.set(element, { opacity: 0, y: 70 });
    // const delay = element.dataset.delay ? parseFloat(element.dataset.delay) / 1000 : 0
    // this.getTimeline({
    //     scrollTrigger: {
    //         trigger: element,
    //         start: 'top bottom',
    //         once: true,
    //         // markers: true,

    //     },
    // }).fromTo(element, { opacity: 0, y: 70 }, {
    //     opacity: 1, y: 0,
    //     duration: 1,
    //     ease: Power2.easeOut,
    //     clearProps: 'all',
    //     delay: delay,
    //     onStart: () => {
    //         if (element.classList.contains('numberCounter')) {
    //             initCouner(element)
    //         }
    //     },
    //     onComplete: () => {
    //         element.classList.add('show')
    //     }
    // })
  }
  destroy(hardDestroy = false) {
    if (this.observer) this.observer.disconnect(), (this.observer = null);
    super.destroy(hardDestroy, () => {
      this.elemsList.forEach((element) => {
        element.classList.remove('init');
        element.classList.remove('waitInit');
        element.classList.remove('show');
        element.removeAttribute('style');
      });
    });
  }
})();
