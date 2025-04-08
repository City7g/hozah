import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';

class SwiperSlider {
  constructor() {
    this.loadedStyle = false;
    this.styleCDN =
      'https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.css';
    this.sliders = [];
  }
  loadStyle() {
    try {
      const isLoaded =
        document.querySelector(
          `link[rel="stylesheet"][href="${this.styleCDN}"]`,
        ) || null;
      if (isLoaded) {
        this.loadedStyle = true;
      } else {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = this.styleCDN;
        link.id = 'swiperSliderStyle';
        document.head.append(link);
        this.loadedStyle = true;
      }
    } catch (e) {
      console.log(e);
    }
  }
  getOptions(elem) {
    const parent = elem.closest('[data-swiper-parent="true"]');
    const space = parent.dataset.swiperSpace;
    const type = elem.dataset.swiperType;
    switch (type) {
      case 'testimonial':
        return {
          grabCursor: true,
          slidesPerView: 'auto',
          spaceBetween: 16,
          modules: [Navigation, Pagination],
          pagination: {
            el: parent.querySelector('.swiper-pagination'),
          },
          navigation: {
            nextEl: parent.querySelector('.swiper-button-next'),
            prevEl: parent.querySelector('.swiper-button-prev'),
          },
          breakpoints: {
            541: {
              spaceBetween: space ?? 32,
            },
          },
          on: {
            init: function () {
              console.log(this, 'swiper initialized');
              parent.classList.add('initialized');
            },
            slideChange: function () {
              elem.classList.remove('lastSlide');
            },
            reachEnd: function () {
              elem.classList.add('lastSlide');
            },
          },
        };
    }
  }
  initialize = (elem) => {
    if (!elem) return null;
    let options = this.getOptions(elem);
    return new Swiper(elem, options);
  };

  init() {
    this.sliders =
      Array.from(
        document.querySelectorAll(
          window.device.mobile() ? '.swiper' : '.swiper:not(.no-slider)',
        ),
      ) || [];
    if (!this.sliders.length) return null;
    this.loadStyle();
    this.sliders = this.sliders
      .map((elem) => this.initialize(elem))
      .filter((swiper) => swiper);
  }

  destroy() {
    if (this.sliders.length) {
      console.log('sliders destroyed');
      this.sliders.forEach((swiper) => {
        swiper.destroy();
      });
      this.sliders = [];
    }
  }
}

const SWIPERSlider = new SwiperSlider();
SWIPERSlider.init();
if (LOADED_SCRIPTS_PACK) LOADED_SCRIPTS_PACK.push(SWIPERSlider);
