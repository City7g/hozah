import SiteAnimation from '../modules/SiteAnimation';

export default new (class Ecosystem extends SiteAnimation {
  init() {
    if (this.isWpAdmin) return;
    super.init('Ecosystem');
    this.styleBoxes = document.getElementById('wrapper');

    this.instances = [
      ...document.querySelectorAll('.js-ecosystem:not(.init)'),
    ].map((stackParent) => {
      return {
        parent: stackParent,
      };
    });

    this.instances.forEach((instance) => {
      this.initAnimation(instance);
    });

    if (this.isWpAdmin || this.styleBoxes.dataset.styleLoaded === 'true') {
      this.instances.forEach((instance) => this.initAnimation(instance));
    } else {
      this.styleFileLoadedFunc = this.styleFileLoaded.bind(this);
      window.addEventListener('styleFileLoaded', this.styleFileLoadedFunc, {
        passive: true,
      });
    }
  }

  initAnimation(instance) {
    if (instance.parent.classList.contains('init')) return;

    instance.parent.classList.add('init');

    instance.sliderInstance = new Swiper(
      instance.parent.querySelector('.swiper'),
      {
        modules: [Pagination, EffectFade],
        slidesPerView: 1,
        effect: window.innerWidth < 1100 ? 'slide' : 'fade',
        fadeEffect: {
          crossFade: true,
        },
        breakpoints: {
          768: {
            slidesPerView: 2,
          },
          1100: {
            slidesPerView: 1,
            speed: 1000,
            allowTouchMove: false,
          },
        },
        pagination: {
          el: instance.parent.querySelector('.swiper-pagination'),
          clickable: true,
          enabled: true,
          breakpoints: {
            1100: {
              enabled: false,
            },
          },
        },
      },
    );

    const cardClients = document.querySelectorAll('.card-client');

    cardClients.forEach((card, index) => {
      this.addListener(card, 'click', () => {
        const headerHeight = document.querySelector('header').offsetHeight;
        window.scrollToPos(
          instance.parent.getBoundingClientRect().top +
            scrollY -
            headerHeight -
            20,
          0.6,
        );
        const prevIndex = instance.sliderInstance.realIndex;
        instance.sliderInstance.slideTo(index);
        const nextIndex = instance.sliderInstance.realIndex;

        cardClients[prevIndex].dataset.order =
          cardClients[nextIndex].dataset.order;
        cardClients[nextIndex].dataset.order = 0;
        cardClients[prevIndex].classList.add(
          `order-${cardClients[prevIndex].dataset.order}`,
        );
        cardClients[nextIndex].classList.add(
          `order-${cardClients[nextIndex].dataset.order}`,
        );
        cardClients[prevIndex].classList.remove('hide');
        cardClients[nextIndex].classList.add('hide');
      });
    });
  }
  styleFileLoaded() {
    if (this.styleBoxes.dataset.styleLoaded === 'true') {
      this.instances.forEach((instance) => this.initAnimation(instance));
    }
  }
  // resizeEvent() {
  //   return false;
  // }
  destroy(hardDestroy = false) {
    this.instances.forEach((instance) => {
      instance.parent.classList.remove('init');
    });
    super.destroy(hardDestroy);
  }
})();
