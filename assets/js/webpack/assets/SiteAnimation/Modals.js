import SiteAnimation from '../modules/SiteAnimation';
import { HoldScrollPage } from '../utils/HoldScrollPage';
import gsap from 'gsap';

export default new (class Modals extends SiteAnimation {
  constructor() {
    super();
    this.scrollbar = null;
    this.duration = 0.5;
  }

  init() {
    super.init('Modals');
    this.instances = [...document.querySelectorAll('.popup')].map((parent) => {
      return {
        parent,
      };
    });

    this.instances.forEach((instance) => {
      this.initInstance(instance);
    });

    this.addListener(document, 'keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeModal();
      }
    });

    document.querySelectorAll('.js-popup-close').forEach((close) => {
      this.addListener(close, 'click', (e) => {
        e.preventDefault();
        this.closeModal();
      });
    });
  }

  initInstance(instance) {
    const { parent } = instance;

    if (!parent) return;

    const close = parent.querySelector('.js-popup-close');

    this.addListener(parent, 'click', (e) => {
      if (e.target === parent) {
        e.preventDefault();
        this.closeModal(parent);
      }
    });

    // this.addListener(parent, 'click', (e) => {
    //   e.preventDefault();
    //   this.openModal(target);
    // });

    this.addListener(close, 'click', (e) => {
      e.preventDefault();
      this.closeModal(parent);
    });
  }

  openModal(target, callback) {
    if (typeof target === 'string') target = document.querySelector(target);

    // let block, modalInner;

    this.currentModal = target;

    if (target) {
      // block = target;
      // modalInner = target.querySelector('.modal-inner');
      // this.currentModal = { block, modalInner };
    } else {
      // this.instances.forEach((instance) => {
      //   if (instance.target === target) {
      //     block = instance.target;
      //     this.currentModal = instance;
      //   }
      // });
    }

    if (!target) throw new Error('Modal not found');

    // block.classList.add('opened');
    gsap.fromTo(
      target,
      { opacity: 0 },
      {
        opacity: 1,
        display: 'flex',
        duration: this.duration,
      },
    );

    // if (modalInnerSecond) {
    //   setTimeout(() => modalInnerSecond.scrollTo(0, 0), this.duration + 100);
    // }

    HoldScrollPage(true, true);

    // gsap.fromTo(
    //   modalInner,
    //   {
    //     y: !isTablet ? 100 : 0,
    //     yPercent: isTablet ? 100 : 0,
    //   },
    //   {
    //     y: 0,
    //     yPercent: 0,
    //     duration: this.duration,
    //   },
    // );

    if (callback && typeof callback === 'function') {
      callback(target);
    }
  }

  closeModal() {
    // if (this.clickForCloseModalFunc) {
    //   document.removeEventListener('click', this.clickForCloseModalFunc);
    //   this.clickForCloseModalFunc = null;
    // }
    // if (this.mouseDownForCloseModalFunc) {
    //   document.removeEventListener(
    //     'mousedown',
    //     this.mouseDownForCloseModalFunc,
    //   );
    //   this.mouseDownForCloseModalFunc = null;
    // }

    // if (this.currentModal) {
    //   const { block, modalInner } = this.currentModal;
    //   block.classList.remove('opened');

    gsap.to(this.currentModal, {
      opacity: 0,
      display: 'none',
      duration: this.duration,
    });
    //   gsap.to(modalInner, {
    //     y: !isTablet ? 100 : 0,
    //     yPercent: isTablet ? 100 : 0,
    //     duration: this.duration,
    //   });
    // } else {
    //   document.querySelectorAll('.modal.opened').forEach((modal) => {
    //     modal.classList.remove('opened');
    //   });
    // }
    HoldScrollPage(false);
    // this.currentModal = null;
  }

  destroy(hardDestroy = false) {
    this.closeModal();
    this.instances.forEach((instance) => {
      instance.modalInner?.removeAttribute('style');
    });
    super.destroy(hardDestroy);
  }
})();
