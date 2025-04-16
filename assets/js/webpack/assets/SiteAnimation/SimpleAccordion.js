import SiteAnimation from '../modules/SiteAnimation';
export default new (class SimpleAccordion extends SiteAnimation {
  init() {
    if (this.isWpAdmin) return;
    super.init('SimpleAccordion');
    this.styleBoxes = document.getElementById('wrapper');
    // this.parent = document.querySelector('.about-section');
    this.instances = [
      ...document.querySelectorAll('.js-simple-accordion:not(.init)'),
    ].map((parent) => {
      return {
        parent,
        opener: parent.querySelector('.js-opener'),
        content: parent.querySelector('.js-content'),
      };
    });
    // isHeroScreen important init
    this.instances
      .filter((instance) => instance.isHeroScreen)
      .forEach((instance) => {
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

    const { parent, opener, content } = instance;

    parent.style.setProperty('--content-height', `${content.scrollHeight}px`);

    opener.addEventListener('click', () => {
      parent.classList.toggle('opened');
    });
  }
  styleFileLoaded() {
    if (this.styleBoxes.dataset.styleLoaded === 'true') {
      this.instances.forEach((instance) => this.initAnimation(instance));
    }
  }
  destroy(hardDestroy = false) {
    this.instances.forEach((instance) => {
      instance.parent.classList.remove('init');
    });
    super.destroy(hardDestroy);
  }
})();
