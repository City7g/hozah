import SiteAnimation from '../modules/SiteAnimation';

export default new (class Header extends SiteAnimation {
  constructor() {
    super();
    this.isOpen = false;
    this.lastScrollTop = 0;
    this.scrollThreshold = 10;
    this.isWork = false;
  }

  init() {
    this.header = document.querySelector('.header');
    this.burger = document.querySelector('.header .burger');

    if (!this.header) return;
    this.addListener(this.burger, 'click', this.toggleMenu.bind(this));
    if (this.isWork) return;
    this.addListener(window, 'scroll', this.handleScroll.bind(this));

    this.isWork = true;

    // if (isTablet) {
    //   console.log(this.header.querySelector('.header__list'));

    //   this.header.querySelector('.header__list')?.classList.add('allow-scroll');
    //   this.header
    //     .querySelector('.header__list')
    //     ?.setAttribute('data-lenis-prevent', '');
    // }
  }

  toggleMenu() {
    if (this.isOpen) {
      this.header.classList.remove('--open');
      HoldScrollPage(false);
    } else {
      this.header.classList.add('--open');
      HoldScrollPage(true);
    }
    this.isOpen = !this.isOpen;
  }

  closeMenu() {
    this.isOpen = false;
    this.header.classList.remove('--open');
    HoldScrollPage(false);
  }

  handleScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > this.scrollThreshold) {
      this.header.classList.add('--mini');
    } else {
      this.header.classList.remove('--mini');
    }

    if (scrollTop > this.lastScrollTop) {
      this.header.classList.add('--hide');
    } else {
      this.header.classList.remove('--hide');
    }

    if (scrollTop > this.lastScrollTop) {
      document.body.classList.add('scrolling-down');
      document.body.classList.remove('scrolling-up');
    } else {
      document.body.classList.remove('scrolling-down');
      document.body.classList.add('scrolling-up');
    }

    this.lastScrollTop = scrollTop;
  }

  destroy() {}
})();
