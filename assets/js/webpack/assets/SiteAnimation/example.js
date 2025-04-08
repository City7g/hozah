import SiteAnimation from '../modules/SiteAnimation';
export default new (class Example extends SiteAnimation {
  init() {
    if (this.isWpAdmin) return;
    super.init('example');
    this.styleBoxes = document.getElementById('pageStyleBoxes');
    // this.parent = document.querySelector('.about-section');
    this.instances = [
      ...document.querySelectorAll('.about-section:not(.init)'),
    ].map((stackParent) => {
      return {
        parent: stackParent,
        isHeroScreen: stackParent.classList.contains('pageHeroScreen'),
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
