import SiteAnimation from '../modules/SiteAnimation';
import Scrollbar from 'smooth-scrollbar';
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
    this.instances = [...document.querySelectorAll('.js-show-modal')].map(
      (parent) => {
        const target = document.querySelector(parent.dataset.modal);
        return {
          parent,
          target,
          modalInner: target?.querySelector('.modal-inner'),
        };
      },
    );

    this.instances.forEach((instance) => {
      this.initInstance(instance);
    });

    this.addListener(document, 'keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeModal();
      }
    });

    document.querySelectorAll('.js-close-modal').forEach((close) => {
      this.addListener(close, 'click', (e) => {
        e.preventDefault();
        this.closeModal();
      });
    });

    // const links = [...document.querySelectorAll('.advantages-details a')];
    // links.forEach((link) => {
    //   link.classList.add('underline');
    // });
  }

  /**
   * Initializes an instance of the modal.
   *
   * @param {Object} instance - The instance object containing the parent and target elements.
   */
  initInstance(instance) {
    const { parent, target } = instance;

    if (!target) return;

    const close = target.querySelector('.js-close-modal');

    this.addListener(parent, 'click', (e) => {
      e.preventDefault();
      this.openModal(target);
    });

    this.addListener(close, 'click', (e) => {
      e.preventDefault();
      this.closeModal(target);
    });
  }

  /**
   * Opens a modal.
   *
   * @param {string|HTMLElement} target - The target element or selector of the modal to open.
   */
  openModal(target, callback) {
    let targetname = target;
    if (typeof target === 'string') target = document.querySelector(target);
    let block, modalInner, modalInnerSecond;
    if (target) {
      block = target;
      modalInner = target.querySelector('.modal-inner');
      this.currentModal = { block, modalInner };
    } else {
      this.instances.forEach((instance) => {
        if (instance.target === target) {
          block = instance.target;
          modalInner = instance.modalInner;
          this.currentModal = instance;
        }
      });
    }
    if (!block) throw new Error('Modal not found');

    block.classList.add('opened');
    gsap.fromTo(
      block,
      { opacity: 0 },
      {
        opacity: 1,
        display: 'flex',
        duration: this.duration,
      },
    );
    modalInnerSecond = block.querySelector('.popup');
    if (modalInnerSecond) {
      setTimeout(() => modalInnerSecond.scrollTo(0, 0), this.duration + 100);
    }

    if (!isTablet) {
      this.currentModalTextareaList = [
        ...modalInner.querySelectorAll('textarea'),
      ];

      this.currentModalTextareaListInstances =
        this.currentModalTextareaList.map((textarea) => {
          const func = this.scrollTextarea.bind(this, textarea);
          textarea.addEventListener('wheel', func, {
            passive: false,
          });
          return { textarea, func };
        });
    }

    if (!isTablet && modalInner) {
      // setTimeout(() => {
      this.initScrollbar(modalInner);
      // }, 2000);
    }
    HoldScrollPage(true, true);

    gsap.fromTo(
      modalInner,
      {
        y: !isTablet ? 100 : 0,
        yPercent: isTablet ? 100 : 0,
      },
      {
        y: 0,
        yPercent: 0,
        duration: this.duration,
      },
    );

    if (callback && typeof callback === 'function') {
      callback(block);
    }
    this.mouseDownForCloseModalFunc = this.mouseDownForCloseModal.bind(this);
    document.addEventListener('mousedown', this.mouseDownForCloseModalFunc);

    requestAnimationFrame(() => {
      this.clickForCloseModalFunc = this.clickForCloseModal.bind(this, target);
      document.addEventListener('click', this.clickForCloseModalFunc);
    });
    this.addListener(target, 'click', (e) => {
      if (
        e.target === target ||
        (block.querySelector('.modal-inner-second') &&
          !e.target.closest('.modal-inner-second'))
      ) {
        this.closeModal(target);
      }
    });
  }
  initScrollbar(target) {
    this.scrollbar = Scrollbar.init(target, {
      alwaysShowTracks: true,
      continuousScrolling: false,
      damping: 0.6,
    });
    this.scrollbar.track.xAxis.hide();
    this.scrollbar.track.yAxis.hide();
  }
  destroyScrollbar() {
    if (this.scrollbar) this.scrollbar.destroy();
    this.scrollbar = null;
  }

  /**
   * Closes the current modal.
   */
  closeModal() {
    if (this.clickForCloseModalFunc) {
      document.removeEventListener('click', this.clickForCloseModalFunc);
      this.clickForCloseModalFunc = null;
    }
    if (this.mouseDownForCloseModalFunc) {
      document.removeEventListener(
        'mousedown',
        this.mouseDownForCloseModalFunc,
      );
      this.mouseDownForCloseModalFunc = null;
    }

    if (this.currentModal) {
      const { block, modalInner } = this.currentModal;
      block.classList.remove('opened');

      gsap.to(block, {
        opacity: 0,
        display: 'none',
        duration: this.duration,
      });
      gsap.to(modalInner, {
        y: !isTablet ? 100 : 0,
        yPercent: isTablet ? 100 : 0,
        duration: this.duration,
      });
    } else {
      document.querySelectorAll('.modal.opened').forEach((modal) => {
        modal.classList.remove('opened');
      });
      this.currentModalTextareaListInstances?.forEach(({ textarea, func }) => {
        textarea.removeEventListener('wheel', func);
      });
      this.currentModalTextareaListInstances = [];
    }
    HoldScrollPage(false);
    this.currentModal = null;
  }
  scrollTextarea(textarea, e) {
    // hard fix scroll
    if (textarea.scrollHeight > textarea.clientHeight) {
      e.stopPropagation();
    }
  }

  mouseDownForCloseModal(e) {
    this.mouseDownTarget = e.target;
  }
  clickForCloseModal(modal, e) {
    if (e.target.closest('.close-modal')) return;
    if (
      e.target.closest('.modal') &&
      !e.target.closest('.modal-inner-second')
    ) {
      if (
        (this.mouseDownTarget &&
          this.mouseDownTarget.closest('.modal-inner-second')) ||
        this.mouseDownTarget.closest('.modal-inner')
      )
        return;
      this.closeModal(modal);
    }
  }
  destroy(hardDestroy = false) {
    this.closeModal();
    this.destroyScrollbar();
    this.instances.forEach((instance) => {
      instance.modalInner?.removeAttribute('style');
      instance.modalInnerSecond?.removeAttribute('style');
    });
    this.currentModalTextareaListInstances?.forEach(({ textarea, func }) => {
      textarea.removeEventListener('wheel', func);
    });
    this.currentModalTextareaListInstances = [];
    super.destroy(hardDestroy);
  }
})();
