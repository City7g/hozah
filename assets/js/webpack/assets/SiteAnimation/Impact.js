import Splide from '@splidejs/splide';
import Glide from '@glidejs/glide';

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
    // this.slider = new Swiper('.js-impact-slider .swiper', {
    //   modules: [Navigation],
    //   centeredSlides: true,
    //   loop: true,
    //   slidesPerView: 2.5,
    //   spaceBetween: 20,
    //   breakpoints: {
    //     320: {
    //       slidesPerView: 1,
    //     },
    //     1101: {
    //       slidesPerView: 2.5,
    //     },
    //   },
    //   navigation: {
    //     nextEl: '.js-impact-slider .slider-btns__item--next',
    //     prevEl: '.js-impact-slider .slider-btns__item--prev',
    //   },
    // });
    var splide = new Splide('.js-impact-slider .splide', {
      type: 'loop',
      perPage: 2.5,
      // arrows: false,
      gap: '1.25rem',
      focus: 'center',
      pagination: false,
      breakpoints: {
        1100: {
          perPage: 2,
          gap: '.75rem',
          focus: 0,
        },
        768: {
          perPage: 1,
        },
      },
    });

    splide.mount();
    this.slider = splide;

    // var glide = new Glide('.js-impact-slider .glide', {
    //   type: 'carousel',
    //   // startAt: 0,
    //   perView: 3,
    //   breakpoints: {
    //     768: {
    //       perPage: 2,
    //     },
    //     1101: {
    //       perPage: 3,
    //     },
    //   },
    // });

    // glide.mount();
  }

  destroy() {
    if (this.slider) {
      this.slider.destroy();
      this.slider = null;
    }
  }
}
