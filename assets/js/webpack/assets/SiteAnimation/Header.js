const vhCheck = require('vh-check');
import { HoldScrollPage } from '../utils/HoldScrollPage';
import SiteAnimation from '../modules/SiteAnimation';
import gsap, { Power1, Power2 } from 'gsap';
export default new (class Header extends SiteAnimation {
  constructor() {
    super();
    this.duration = 0.5;
    this._hidden = false;
    this._minimized = false;
  }

  get hidden() {
    return this._hidden;
  }
  get minimized() {
    return this._minimized;
  }

  set hidden(value) {
    if (this._hidden !== value) {
      this._hidden = value;
      this.onHiddenChange(value); // call a function when a value changes
    }
  }
  set minimized(value) {
    if (this._minimized !== value) {
      this._minimized = value;
      this.onMinimizedChange(value); // call a function when a value changes
    }
  }
  init() {
    this.isOpen = false;
    this.disabled = false;
    this.minimized = false;
    this.hidden = false;
    this.scrollTop = 0;
    //
    super.init('Header');
    this.parent = document.querySelector('header');
    this.menuBtn = this.parent.querySelector('.menuBtn');
    this.menuRow = this.parent.querySelector('.menuRow');
    this.menuRowInner = this.parent.querySelector('.menuRowInner');
    this.mobileMenu = this.parent.querySelector('.mobileMenu');
    this.nav = this.parent.querySelector('nav');
    this.columnCenter = this.parent.querySelector('.mainRow .columnCenter');
    this.navItems = [...(this.nav ? this.nav.querySelectorAll('li') : '')];
    this.initMenu();
  }
  initMenu() {
    this.menuBtnClickFunc = this.menuBtnClick.bind(this);
    this.scrollFunc = this.scroll.bind(this);
    this.scrollFunc();
    window.addEventListener('scroll', this.scrollFunc, { passive: true });
    this.menuBtn.addEventListener('click', this.menuBtnClickFunc, {
      passive: true,
    });
    if (isTablet) this.menuRowInner.prepend(this.nav);

    if (isTablet) {
      this.tl = this.getTimeline({ paused: true });
      this.tl.add(
        gsap.fromTo(
          [
            ...this.navItems,
            this.parent.querySelector('.langSwicherMobile'),
            this.parent.querySelector('.mobileRowWrap'),
            this.parent.querySelector('.bottomRow'),
          ],
          { opacity: 0, y: -30 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.1,
            delay: 0,
            duration: this.duration,
            ease: Power1.easeOut,
          },
        ),
      );
    }
  }
  scroll(e) {
    if (this.isOpen) return;
    const scrollHeight = e?.target?.scrollHeight;
    let currentScrollTop = e?.target?.scrollTop || window.scrollY;
    if (e?.target && currentScrollTop > scrollHeight) currentScrollTop = 0;

    const minimized = currentScrollTop > 50;
    const scrollDirection = currentScrollTop > this.scrollTop ? 'down' : 'up';
    const hidden = currentScrollTop > 100 && scrollDirection == 'down';

    this.scrollTop = currentScrollTop;
    this.minimized = minimized;
    this.hidden = hidden;
  }

  menuBtnClick() {
    if (this.disabled) return;
    this.menuBtn.classList.toggle('active');
    this.isOpen = this.menuBtn.classList.contains('active');

    if (this.isOpen) {
      this.openMenu();
    } else {
      this.closeMenu();
    }
  }
  openMenu() {
    this.isOpen = true;
    this.disabled = true;
    this.parent.classList.add('disabled');
    HoldScrollPage(this.isOpen);
    this.menuBtn.classList.add('active');
    clearTimeout(this.openMenuTimer);
    clearTimeout(this.closeMenuTimer);
    clearTimeout(this.closeMenuTimer2);

    scrollToPos(0, 0.001, this.menuRowInner);

    if (this.tl) this.tl.play();
    this.parent.classList.remove('minimized');
    this.minimized = false;
    gsap.set(this.menuRow, { display: 'flex' });

    // const scrollHeight = this.menuRowInner.scrollHeight;
    // if (scrollHeight > this.menuRowInner.clientHeight) {
    //   this.menuRowInner.classList.add('additionalScroll');
    // }
    this.openMenuTimer = setTimeout(() => {
      this.disabled = false;
      this.parent.classList.remove('disabled');
    }, 1000);
    requestAnimationFrame(() => {
      this.parent.classList.add('open');
    });
  }
  closeMenu() {
    this.isOpen = false;
    this.disabled = true;
    this.parent.classList.add('disabled');
    this.menuBtn.classList.remove('active');
    HoldScrollPage(this.isOpen);
    clearTimeout(this.openMenuTimer);
    clearTimeout(this.closeMenuTimer);
    clearTimeout(this.closeMenuTimer2);

    if (this.tl) this.tl.reverse();
    // reset scroll
    this.hidden = false;
    // this.minimized = true;
    // this.scrollTop = 0;
    this.scroll();
    this.closeMenuTimer = setTimeout(() => {
      this.parent.classList.remove('open');
    }, 500);
    this.closeMenuTimer2 = setTimeout(() => {
      gsap.set(this.menuRow, { display: 'none' });
      this.disabled = false;
      this.parent.classList.remove('disabled');
      this.menuRowInner.classList.remove('additionalScroll');
    }, 1000);
  }
  onHiddenChange(value) {
    document.body.classList[this.hidden ? 'add' : 'remove']('headerHidden');
    this.parent?.classList[value ? 'add' : 'remove']('hidden');
  }
  onMinimizedChange(value) {
    this.parent?.classList[value ? 'add' : 'remove']('minimized');
  }
  destroy(hardDestroy = false) {
    this.columnCenter.append(this.nav);
    if (this.tl) this.tl.clear(), (this.tl = null);

    this.navItems.forEach((element) => {
      element.removeAttribute('style');
    });
    window.removeEventListener('scroll', this.scrollFunc);
    this.isOpen = false;
    this.disabled = false;
    this.menuBtn.classList.remove('active');
    this.parent.classList.remove('minimized', 'disabled', 'open');
    super.destroy(hardDestroy);
  }
})();
