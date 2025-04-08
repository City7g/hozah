import Scene from './Scene';
import SmoothScroll from './SmoothScroll';
import imagesloaded from 'imagesloaded';
// scroll position and update function
import { defineParams } from '../functions';

export default class NoiseEffect {
  constructor(scene, effectNumber, selector) {
    this.init(scene, effectNumber, selector);
  }
  init(sceneEl = '#wrapper', effectNumber = 2, selector = 'img.js-noise') {
    if (defineParams.mobileDevice) return;
    const queryImages = document.querySelectorAll(selector);

    if (queryImages.length) {
      this.scene = new Scene(sceneEl, effectNumber);

      // Preload images
      const preloadImages = new Promise((resolve, reject) => {
        imagesloaded(queryImages, { background: true }, resolve);
      });
      preloadImages.then((images) => {
        this.IMAGES = images.images;
      });

      const preloadEverything = [preloadImages];

      // And then..
      Promise.all(preloadEverything).then(() => {
        this.smoothScroll = new SmoothScroll(
          this.scene.renderer.domElement,
          this.IMAGES,
          this.scene,
        );
      });
    }
    this.initEvents();
  }
  initEvents() {
    if (!this.subPageFunc) {
      this.subPageFunc = this.subPage.bind(this);
      window.addEventListener('subPage', this.subPageFunc, false);
    }
    if (!this.noiseEventFunc) {
      this.noiseEventFunc = this.noiseEvent.bind(this);
      window.addEventListener('NoiseEffect', this.noiseEventFunc, false);
    }
    if (!this.styleFileLoadedFunc) {
      this.styleFileLoadedFunc = this.styleFileLoaded.bind(this);
      window.addEventListener('styleFileLoaded', this.styleFileLoadedFunc, {
        passive: true,
      });
    }
  }
  styleFileLoaded() {
    this.smoothScroll?.update(true);
  }
  noiseEvent({ detail }) {
    switch (detail) {
      case 'update':
        this.smoothScroll?.update(true);
        break;
      case 'destroy':
        this.destroy(true);
        break;
      default:
        break;
    }
  }
  subPage({ detail }) {
    if (detail === 'leave') this.destroy();
    if (detail === 'complete') this.init();
  }
  destroy(hardDestroy = false) {
    this.scene?.destroy();
    this.smoothScroll?.destroy();
    this.scene = null;
    this.smoothScroll = null;
    this.IMAGES = [];
    if (hardDestroy) {
      window.removeEventListener('subPage', this.subPageFunc, false);
      this.subPageFunc = null;
      window.removeEventListener('styleFileLoaded', this.styleFileLoadedFunc, {
        passive: true,
      });
      this.styleFileLoadedFunc = null;
      //
      window.removeEventListener('NoiseEffect', this.noiseEventFunc, false);
      this.noiseEventFunc = null;
    }
  }
}
