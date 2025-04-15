import Splide from '@splidejs/splide';

export default class Impact {
  constructor() {
    this.slider = null;
  }
  init() {
    this.instances = document.querySelectorAll('.js-stories-slider');
    if (!this.instances.length) return;

    this.instances.forEach((instance) => {
      this.sliderInit(instance);
    });
  }

  sliderInit(instance) {
    console.log(instance);

    var splide = new Splide(instance.querySelector('.splide'), {
      type: 'loop',
      perPage: 1.5,
      // arrows: false,
      gap: '7.75rem',
      focus: 'center',
      pagination: false,
      breakpoints: {
        768: {
          perPage: 1,
          gap: '0.75rem',
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
