import SiteAnimation from '../modules/SiteAnimation';

export default new (class Header extends SiteAnimation {
  constructor() {
    super();
    this.slider = null;
    this.isOpen = false;
    this.lastScrollTop = 0;
    this.scrollThreshold = 10;
  }

  init() {
    this.header = document.querySelector('.header');
    this.burger = document.querySelector('.header .burger');

    if (!this.header) return;

    this.addListener(window, 'scroll', this.handleScroll.bind(this));
    this.addListener(this.burger, 'click', this.toggleMenu.bind(this));
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

    this.lastScrollTop = scrollTop;
  }

  destroy() {
    if (this.slider) {
      this.slider = null;
    }
    window.removeEventListener('scroll', this.handleScroll.bind(this));
  }
})();
