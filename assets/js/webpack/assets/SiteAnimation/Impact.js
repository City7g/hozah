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
  }

  destroy() {
    if (this.slider) {
      this.slider.destroy();
      this.slider = null;
    }
  }
}
