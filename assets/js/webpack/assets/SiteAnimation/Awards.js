import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';

export default class Awards {
  constructor() {
    this.slider = null;
  }
  init() {
    this.parent = document.querySelector('.js-awards');
    if (!this.parent) return;

    this.sliderInit();
  }

  sliderInit() {
    this.slider = new Swiper('.js-awards .swiper', {
      modules: [Navigation, Pagination],
      slidesPerView: 'auto',
      spaceBetween: 4,
      breakpoints: {
        768: {
          spaceBetween: 12,
        },
      },
      navigation: {
        nextEl: '.awards__next',
        prevEl: '.awards__prev',
      },
      pagination: {
        el: '.awards__pagination',
        clickable: true,
      },
    });
  }

  destroy() {
    if (this.slider) {
      this.slider.destroy();
      this.slider = null;
    }
  }
}
