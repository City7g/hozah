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
      on: {
        slideChange: () => {
          this.checkSlidePosition();
          this.slider.updateProgress();
        },
        init: () => {
          this.checkSlidePosition();
        },
      },
    });
  }

  checkSlidePosition() {
    if (!this.slider) return;

    const isFirst = this.slider.isBeginning;
    const isLast = this.slider.isEnd;

    if (isFirst) {
      document.querySelector('.awards__left').classList.add('hide');
    } else {
      document.querySelector('.awards__left').classList.remove('hide');
    }

    if (isLast) {
      document.querySelector('.awards__right').classList.add('hide');
    } else {
      document.querySelector('.awards__right').classList.remove('hide');
    }
  }

  destroy() {
    if (this.slider) {
      this.slider.destroy();
      this.slider = null;
    }
  }
}
