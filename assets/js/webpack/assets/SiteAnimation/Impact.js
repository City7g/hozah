import Splide from '@splidejs/splide';
import Swiper from 'swiper';
import { Navigation } from 'swiper/modules';

export default class Impact {
  constructor() {
    this.slider = null;
  }
  init() {
    this.parent = document.querySelector('.js-impact-slider');
    if (!this.parent) return;

    this.sliderInit();
  }

  sliderInit() {
    this.slider = new Swiper('.js-impact-slider .swiper', {
      modules: [Navigation],
      centeredSlides: true,
      loop: true,
      slidesPerView: 2.5,
      spaceBetween: 20,
      breakpoints: {
        320: {
          slidesPerView: 1,
        },
        1101: {
          slidesPerView: 2.5,
        },
      },
      navigation: {
        nextEl: '.js-impact-slider .slider-btns__item--next',
        prevEl: '.js-impact-slider .slider-btns__item--prev',
      },
    });
    // console.log(splide);
    // var splide = new Splide('.splide', {
    //   type: 'loop',
    //   perPage: 3,
    //   focus: 'center',
    // });
    // console.log(splide);
    // splide.mount();
  }

  destroy() {
    if (this.slider) {
      this.slider.destroy();
      this.slider = null;
    }
  }
}
