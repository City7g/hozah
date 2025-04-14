import SiteAnimation from '../modules/SiteAnimation';
import gsap from 'gsap';

export default new (class Marquee extends SiteAnimation {
  constructor() {
    super();
    this.container = null;
    this.items = [];
    this.clonedItems = [];
    this.timeline = null;
    this.resizeObserver = null;
    this.intersectionObserver = null;
    this.isIntersecting = false;
    this.isInitialized = false;
    this.lastScrollY = 0;
    this.scrollThreshold = 10;
    this.isHovered = false;
    this.animationSpeed = 50;
  }

  init() {
    if (this.isInitialized) return;

    super.init('Marquee');
    this.container = document.querySelector('.partners__list');

    if (!this.container) {
      return;
    }

    if (this.container.dataset.marqueeInit === 'true') {
      return;
    }

    this.items = Array.from(this.container.children);

    if (this.items.length === 0) {
      return;
    }

    this._setupInstance();
    this.container.dataset.marqueeInit = 'true';
    this.isInitialized = true;
  }

  _setupInstance() {
    this._cloneItems();
    this._applyInitialStyles();
    this._createAnimation();
    this._addEventListeners();
  }

  _cloneItems() {
    this.clonedItems.forEach((clone) => clone.remove());
    this.clonedItems = [];

    if (!this.container || this.items.length === 0) {
      return;
    }

    const containerWidth = this.container.offsetWidth;
    const originalSetWidth = this._calculateWidth();

    if (originalSetWidth <= 0) {
      console.warn(
        'PartnersMarquee: Original set width is zero or less. Cannot calculate clones.',
      );
      return;
    }

    const targetWidth = containerWidth * 2;
    let currentTotalWidth = originalSetWidth;

    while (currentTotalWidth < targetWidth) {
      this.items.forEach((item) => {
        const clone = item.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        this.container.appendChild(clone);
        this.clonedItems.push(clone);
      });
      currentTotalWidth += originalSetWidth;
    }
  }

  _applyInitialStyles() {
    gsap.set(this.container, { display: 'flex', flexWrap: 'nowrap' });
    gsap.set(Array.from(this.container.children), { flexShrink: 0 });
  }

  _calculateWidth() {
    gsap.set(this.container, { visibility: 'hidden', display: 'flex' });
    const totalWidth = this.items.reduce((acc, item) => {
      const style = window.getComputedStyle(item);
      const marginRight = parseFloat(style.marginRight) || 0;
      const marginLeft = parseFloat(style.marginLeft) || 0;
      return acc + item.offsetWidth + marginLeft + marginRight;
    }, 0);
    gsap.set(this.container, { visibility: '', display: '' });
    return totalWidth;
  }

  _createAnimation() {
    if (this.timeline) {
      this.timeline.kill();
    }

    const originalSetWidth = this._calculateWidth();
    if (originalSetWidth <= 0) {
      console.warn(
        'PartnersMarquee: Could not calculate original set width, animation skipped.',
      );
      return;
    }

    const duration = originalSetWidth / this.animationSpeed;

    this.timeline = gsap.timeline({ repeat: -1, paused: true });

    this.timeline.fromTo(
      this.container,
      { x: 0 },
      {
        x: -originalSetWidth,
        duration: duration,
        ease: 'none',
      },
    );
  }

  _addEventListeners() {
    this._boundHandleResize = this._debounce(
      this._handleResize.bind(this),
      250,
    );
    this._boundHandleScroll = this._debounce(
      this._handleScroll.bind(this),
      100,
    );
    this._boundHandleHover = this._handleHover.bind(this);

    this.container.addEventListener('mouseenter', this._boundHandleHover);
    this.container.addEventListener('mouseleave', this._boundHandleHover);
    this.container.addEventListener('touchstart', this._boundHandleHover);
    this.container.addEventListener('touchend', this._boundHandleHover);

    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          this.isIntersecting = entry.isIntersecting;
          if (entry.isIntersecting && !this.isHovered) {
            this._playAnimation();
          } else {
            this._pauseAnimation();
          }
        });
      },
      {
        threshold: 0.1,
      },
    );

    this.intersectionObserver.observe(this.container);

    this.resizeObserver = new ResizeObserver(this._boundHandleResize);
    this.resizeObserver.observe(this.container);

    window.addEventListener('scroll', this._boundHandleScroll);
  }

  _removeEventListeners() {
    if (this.container) {
      this.container.removeEventListener('mouseenter', this._boundHandleHover);
      this.container.removeEventListener('mouseleave', this._boundHandleHover);
      this.container.removeEventListener('touchstart', this._boundHandleHover);
      this.container.removeEventListener('touchend', this._boundHandleHover);
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      this.intersectionObserver = null;
    }
    window.removeEventListener('scroll', this._boundHandleScroll);
  }

  _pauseAnimation() {
    this.timeline?.pause();
  }

  _playAnimation() {
    this.timeline?.play();
  }

  _handleResize() {
    const wasPaused = this.timeline?.paused();
    const wasIntersecting = this.isIntersecting;

    this.timeline?.kill();
    this.timeline = null;

    this._cloneItems();

    this._applyInitialStyles();

    this._createAnimation();

    if (wasIntersecting && !wasPaused) {
      this.timeline?.play();
    } else {
      this.timeline?.pause();
    }
  }

  _handleScroll() {
    if (!this.container) return;

    const currentScrollY = window.scrollY;
    const isScrollingUp = currentScrollY < this.lastScrollY;
    const isScrolledEnough = currentScrollY >= this.scrollThreshold;

    if (isScrollingUp) {
      this.container.classList.add('--hide');
    } else {
      this.container.classList.remove('--hide');
    }

    if (isScrolledEnough) {
      this.container.classList.add('--mini');
    } else {
      this.container.classList.remove('--mini');
    }

    this.lastScrollY = currentScrollY;
  }

  _handleHover(event) {
    const isEnter = event.type === 'mouseenter' || event.type === 'touchstart';
    this.isHovered = isEnter;

    if (isEnter) {
      this.timeline?.pause();
    } else if (this.isIntersecting) {
      this.timeline?.play();
    }
  }

  _debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func.apply(this, args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  destroy(hardDestroy = false) {
    if (!this.isInitialized) return;

    this._removeEventListeners();

    if (this.timeline) {
      this.timeline.kill();
      this.timeline = null;
    }

    this.clonedItems.forEach((clone) => clone.remove());
    this.clonedItems = [];

    gsap.set(this.items, { clearProps: 'all' });

    if (this.container) {
      delete this.container.dataset.marqueeInit;
    }

    this.container = null;
    this.items = [];
    this.isInitialized = false;

    super.destroy(hardDestroy);
  }
})();
