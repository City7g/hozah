import gsap from 'gsap';
import SiteAnimation from '../modules/SiteAnimation';

export default new (class Accordion extends SiteAnimation {
  init() {
    if (this.isWpAdmin) return;
    super.init('Accordion');
    this.styleBoxes = document.getElementById('wrapper');

    this.instances = [
      ...document.querySelectorAll('.js-accordion:not(.init)'),
    ].map((parent) => {
      return {
        parent,
        items: document.querySelectorAll('.accordion__item'),
        contents: document.querySelectorAll('.accordion__content'),
      };
    });

    if (this.isWpAdmin || this.styleBoxes.dataset.styleLoaded === 'true') {
      this.instances.forEach((instance) => this.initInstance(instance));
    } else {
      this.styleFileLoadedFunc = this.styleFileLoaded.bind(this);
      window.addEventListener('styleFileLoaded', this.styleFileLoadedFunc, {
        passive: true,
      });
    }
  }

  initInstance(instance) {
    const { parent, items, contents } = instance;

    let currentIndex = 0;

    if (parent.classList.contains('init')) return;
    parent.classList.add('init');

    gsap.set(contents, {
      height: (index) => (index ? 0 : 'auto'),
    });

    items.forEach((item, index) => {
      this.addListener(item, 'click', () => {
        if (currentIndex === index) {
          gsap.to(contents[index], {
            height: 0,
          });

          item.classList.remove('active');

          currentIndex = null;
        } else {
          gsap.to(contents[currentIndex], {
            height: 0,
          });
          gsap.to(contents[index], {
            height: 'auto',
          });

          items[currentIndex]?.classList.remove('active');
          item.classList.add('active');

          currentIndex = index;
        }
      });
    });
  }

  resizeEvent() {
    return;
  }

  styleFileLoaded() {
    if (this.styleBoxes.dataset.styleLoaded === 'true') {
      this.instances.forEach((instance) => this.initInstance(instance));
    }
  }

  destroy(hardDestroy = false) {
    super.destroy(hardDestroy);
    this.instances.forEach((instance) => {
      const { parent } = instance;
      parent.classList.remove('init');
    });
  }
})();
