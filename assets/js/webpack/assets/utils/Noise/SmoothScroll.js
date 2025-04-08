import NoiseItem from './Item';
import { getPageScroll } from '../functions';

export default class SmoothScroll {
  constructor(canvas, IMAGES, scene) {
    this.IMAGES = IMAGES;
    this.scene = scene;
    this.canRender = true;
    this.shouldRender = true;
    // the <main> element
    this.DOM = { main: document.querySelector('#wrapper'), canvas };
    this.DOM.canvas.classList.add('init');
    this.DOM.main.classList.add('initNoise');
    // the scrollable element
    // we translate this element when scrolling (y-axis)
    this.DOM.scrollable = document.body;
    // the items on the page
    this.items = [];

    this.createItems();
    this.listenMouseFunc = this.listenMouse.bind(this);
    document.addEventListener('mousemove', this.listenMouseFunc, {
      passive: true,
    });

    // here we define which property will change as we scroll the page
    // in this case we will be translating on the y-axis
    // we interpolate between the previous and current value to achieve the smooth scrolling effect
    this.renderedStyles = {
      translationY: {
        // interpolated value
        previous: 0,
        // current value
        current: 0,
        // amount to interpolate
        ease: 0.1,
        // current value setter
        // in this case the value of the translation will be the same like the document scroll
        setValue: () => getPageScroll(),
      },
    };
    // set the initial values
    this.update();
    // start the render loop
    requestAnimationFrame(() => this.render());
  }

  listenMouse() {
    this.shouldRender = true;
  }

  update(updateItems = false) {
    // sets the initial value (no interpolation) - translate the scroll value
    if (updateItems) {
      this.items.forEach((item) => item.resize());
    }

    for (const key in this.renderedStyles) {
      this.renderedStyles[key].current = this.renderedStyles[key].setValue();
    }
    // translate the scrollable element
    this.setPosition();
    this.shouldRender = true;
  }
  setPosition() {
    // translates the scrollable element
    for (const item of this.items) {
      // if the item is inside the viewport call it's render function
      // this will update the item's inner image translation, based on the document scroll value and the item's position on the viewport
      if (item.isVisible || item.isBeingAnimatedNow) {
        item.render(this.renderedStyles.translationY.current);
      }
    }
    if (
      this.scene.scrollBoost ||
      this.scene.targetSpeed > 0.01 ||
      this.scene.customPass.uniforms.uVelo.value > 0.0001
    ) {
      this.shouldRender = true;
    }

    if (this.shouldRender) {
      this.shouldRender = false;
      this.scene.render();
    }
  }

  createItems() {
    this.IMAGES.forEach((image) => {
      this.items.push(new NoiseItem(image, this, this.scene));
    });
  }
  destroyItems() {
    this.items.forEach((item) => item.destroy());
  }
  render() {
    if (!this.canRender) return;
    // update the current and interpolated values
    for (const key in this.renderedStyles) {
      this.renderedStyles[key].current = this.renderedStyles[key].setValue();
    }
    // and translate the scrollable element
    this.setPosition();

    // loop..
    if (this.canRender) requestAnimationFrame(() => this.render());
  }
  destroy() {
    this.canRender = false;
    this.DOM.canvas.remove();
    this.DOM.main.classList.remove('initNoise');
    document.removeEventListener('mousemove', this.listenMouseFunc, {
      passive: true,
    });
    this.destroyItems();
  }
}
