import { getPageScroll } from '../functions';
export default class NoiseItem {
  constructor(el, scroll, scene) {
    // the .item element
    this.scroll = scroll;
    this.scene = scene;
    this.DOM = { el: el.img };
    this.currentScroll = getPageScroll();
    this.animated = false;
    this.isBeingAnimatedNow = false;
    this.shouldRollBack = false;
    this.shouldUnRoll = false;
    this.positions = [];

    // set the initial values
    this.getSize();
    this.mesh = this.scene.createMesh({
      width: this.width,
      height: this.height,
      src: this.src,
      image: this.DOM.el,
      imageAspect: this.DOM.el.naturalWidth / this.DOM.el.naturalHeight,
    });
    this.scene.scene.add(this.mesh);
    // use the IntersectionObserver API to check when the element is inside the viewport
    // only then the element translation will be updated
    this.intersectionRatio;
    let options = {
      root: null,
      rootMargin: '0px',
      threshold: [0, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
    };
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        this.positions.push(entry.boundingClientRect.y);
        let compareArray = this.positions.slice(
          this.positions.length - 2,
          this.positions.length,
        );
        let down = compareArray[0] > compareArray[1] ? true : false;

        this.isVisible = entry.intersectionRatio > 0.0;

        this.shouldRollBack = false;
        this.shouldUnRoll = false;
        if (
          entry.intersectionRatio < 0.5 &&
          entry.boundingClientRect.y > 0 &&
          this.isVisible &&
          !down
        ) {
          this.shouldRollBack = true;
        }

        if (
          entry.intersectionRatio > 0.5 &&
          entry.boundingClientRect.y > 0 &&
          this.isVisible
        ) {
          this.shouldUnRoll = true;
        }
        this.mesh.visible = this.isVisible;
      });
    }, options);
    this.observer.observe(this.DOM.el);
    // init/bind events
    this.resizeFunc = this.resize.bind(this);
    window.addEventListener('resize', this.resizeFunc, { passive: true });
    this.render(getPageScroll());
  }

  getSize() {
    // get all the sizes here, bounds and all
    const bounds = this.DOM.el.getBoundingClientRect();
    const fromTop = bounds.top;
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;
    const withoutHeight = fromTop - windowHeight;
    const withHeight = fromTop + bounds.height;
    this.insideTop = withoutHeight - getPageScroll();
    this.insideRealTop = fromTop + getPageScroll();
    this.insideBottom = withHeight - getPageScroll() + 50;
    this.width = bounds.width;
    this.height = bounds.height;
    this.left = bounds.left;
    this.winsize = { width: windowWidth, height: windowHeight };
  }
  resize() {
    // on resize rest sizes and update the translation value
    this.getSize();
    this.scene.updateMeshRatio(this.mesh, this.width, this.height);
    this.render(this.scroll.renderedStyles.translationY.current);
    this.scroll.shouldRender = true;
  }

  render(currentScroll) {
    this.currentScroll = currentScroll;
    this.mesh.position.y =
      currentScroll +
      this.winsize.height / 2 -
      this.insideRealTop -
      this.height / 2;
    this.mesh.position.x =
      0 - this.winsize.width / 2 + this.left + this.width / 2;
  }
  destroy() {
    this.observer.disconnect();
    window.removeEventListener('resize', this.resizeFunc, { passive: true });
  }
}
