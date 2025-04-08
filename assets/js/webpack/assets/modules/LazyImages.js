import { gsap } from 'gsap';
import LazyLoad from 'lazyload';

export default new (class LazyImages {
  async init() {
    this.webpSupport = await this.testWebP();
    window.webpSupport = this.webpSupport;
    this.lazyObj = null;
    this.initLazy();
  }
  async initLazy(selector = 'img.lazy:not(.init), .lazyWebp:not(.init)') {
    this.replaceSrcOnInit(selector);

    const lazyElements = [...document.querySelectorAll(selector)].filter(
      (el) => {
        return (
          el.closest('.wrapper[data-style-loaded="true"]') ||
          el.closest('.styleBoxes[data-style-loaded="true"]') ||
          el.closest('.styleBoxes[data-style-loaded="true"]') ||
          el.closest('footer[data-style-loaded="true"]') ||
          el.closest('[data-animated="true"]') ||
          el.closest('.pageHeroScreen') ||
          el.closest('.editor-styles-wrapper') ||
          el.closest('.big-gallery-modal') ||
          el.closest('#preloader') ||
          el.classList.contains('important')
        );
      },
    );

    this.lazyObj = new LazyLoad(lazyElements, {
      root: null,
      rootMargin: '1500px 1000px 1500px 1000px',
      // rootMargin: '0px 0px 0px 0px',
      threshold: 0,
    });

    this.lazyObj.images.forEach((element) => {
      element.classList.add('init');
      if (element.tagName === 'DIV') {
        this.onload(element);
      } else {
        element.onload = () => this.onload(element);
      }
    });

    if (!this.styleFileLoadedFunc) {
      this.styleFileLoadedFunc = this.initLazy.bind(this, undefined);
      window.addEventListener('styleFileLoaded', this.styleFileLoadedFunc, {
        passive: true,
      });
    }
  }
  onload(element) {
    if (element.closest('.sequence')) {
      // element.classList.add('show');
      element.style.opacity = 1;
      element.style.visibility = 'visible';
    } else {
      gsap.to(element, {
        opacity: 1,
        visibility: 'visible',
        duration: 0.25,
        clearProps: 'all',
        onComplete: () => {
          element.classList.add('show');
        },
      });
    }
  }
  replaceSrcOnInit(selector) {
    document.body.classList.add(this.webpSupport ? 'hasWebp' : 'noWebp');
    const lazyWebpSwiperElements = [
      ...document.querySelectorAll(
        '.swiper-wrapper .swiper-lazy.webp:not(.init)',
      ),
    ];
    lazyWebpSwiperElements.forEach((element) => {
      this.changeImgSrc(this.webpSupport, element, true);
    });

    const lazyWebpElements = [...document.querySelectorAll(selector)];
    lazyWebpElements.forEach((element) => {
      if (this.webpSupport && element.getAttribute('data-webp')) {
        this.changeImgSrc(this.webpSupport, element);
      }
      element.setAttribute(
        'data-src',
        element.getAttribute(
          this.isRetinaDisplay() && element.getAttribute('data-retina')
            ? 'data-retina'
            : 'data-src',
        ),
      );
      element.classList.add('srcChanged');
    });
  }
  isRetinaDisplay() {
    if (window.matchMedia) {
      const mq = window.matchMedia(
        'only screen and (min--moz-device-pixel-ratio: 1.3), only screen and (-o-min-device-pixel-ratio: 2.6/2), only screen and (-webkit-min-device-pixel-ratio: 1.3), only screen  and (min-device-pixel-ratio: 1.3), only screen and (min-resolution: 1.3dppx)',
      );
      return (mq && mq.matches) || window.devicePixelRatio > 1;
    }
  }
  async testWebP() {
    if (window.noWebp) return false;
    if (navigator.userAgent.includes('Chrome-Lighthouse')) return true;
    return new Promise((resolve) => {
      const webP = new Image();
      webP.onload = webP.onerror = function () {
        return resolve(webP.height === 2);
      };
      webP.src =
        'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    });
  }
  changeImgSrc(
    support = webpSupport,
    element,
    replace = false,
    setSRC = false,
  ) {
    // element.classList.add('init');
    element.setAttribute('used-webp', true);
    element.setAttribute('data-src-default', element.getAttribute('data-src'));
    if (support) {
      if (
        element.hasAttribute('data-webp') &&
        element.getAttribute('data-webp').length > 0
      ) {
        element.setAttribute('data-src', element.getAttribute('data-webp'));
      }
      if (
        element.hasAttribute('data-webp-retina') &&
        element.getAttribute('data-webp-retina').length > 0
      ) {
        element.setAttribute(
          'data-retina',
          element.getAttribute('data-webp-retina'),
        );
      }
    }

    if (replace && this.isRetinaDisplay()) {
      if (
        support &&
        element.hasAttribute('data-webp-retina') &&
        element.getAttribute('data-webp-retina').length > 0
      ) {
        element.setAttribute(
          'data-src',
          element.getAttribute('data-webp-retina'),
        );
      } else if (
        element.hasAttribute('data-retina') &&
        element.getAttribute('data-retina').length > 0
      ) {
        element.setAttribute('data-src', element.getAttribute('data-retina'));
      }
    }

    if (setSRC) {
      element.setAttribute(
        'src',
        element.getAttribute(
          this.isRetinaDisplay() && element.getAttribute('data-retina')
            ? 'data-retina'
            : 'data-src',
        ),
      );
    }
  }
  destroy() {
    if (this.lazyObj) {
      this.lazyObj.destroy();
      this.lazyObj = null;
    }
  }
})();
