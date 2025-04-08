import { Power0, Power1 } from 'gsap'; // Also works with TweenLite and TimelineLite
import { EventEmitter } from 'emitter';
const vhCheck = require('vh-check');
import {
  offset,
  isWpAdmin,
  initThrottle,
  generateID,
} from '../utils/functions';

export default class SiteAnimation extends EventEmitter {
  constructor() {
    super();
    this.destroyOnInit = true;
    this.name = null;
    this.resizeList = [];
    this.resizeFunc = null;
    this.resizeEventFunc = null;
    this.destroyEventFunc = null;
    this.sceneList = [];
    this.timelineList = [];
    this.triggerList = [];
    this.listenersList = [];
    this.scrollTriggerList = [];
    this.tweenList = [];
    // this.ease = Power0.easeNone;
    this.ease = Power1.easeInOut;
    this.inited = false;
    this.wordObj = { x: 0 };
    this.isWpAdmin = isWpAdmin();
  }
  resize() {
    const isWidthUpdated = this.windowWidth !== window.innerWidth;
    this.windowWidth = window.innerWidth;
    this.windowHeight = vhCheck().vh - window.deltaVH;
    if (this.throttle) {
      this.throttle.init(() => {
        this.vh = vhCheck().vh;
        this.windowHeight = this.vh - window.deltaVH;
        this.resizeList.forEach((func) => func(isWidthUpdated));
      }, 750);
    }
  }
  resizeOnorientationEvent() {
    // console.log('resizeOnorientationEvent');
    this.windowWidth = 0;
  }
  resizeEvent({ detail: isTablet }) {
    this.destroy(false);
  }
  destroyEvent() {
    this.destroy(true);
  }
  hidePreloaderEvent({ detail } = {}) {}
  init(name = '') {
    if (this.inited && this.destroyOnInit) return this.destroy();

    //
    if (!this.resizeFunc) {
      this.resizeFunc = this.resize.bind(this);
      window.addEventListener('resize', this.resizeFunc);
    }
    if (!this.throttle) this.throttle = initThrottle();
    this.windowWidth = window.innerWidth;
    this.vh = vhCheck().vh;
    this.windowHeight = this.vh - window.deltaVH;
    //

    this.name = name;
    // console.log('SiteAnimation webpack init -', name);
    if (!this.resizeOnorientationFunc) {
      this.resizeOnorientationFunc = this.resizeOnorientationEvent.bind(this);
      window.addEventListener(
        'resizeOnorientation',
        this.resizeOnorientationFunc,
        false,
      );
    }
    if (!this.resizeEventFunc) {
      this.resizeEventFunc = this.resizeEvent.bind(this);
      window.addEventListener('resizeEvent', this.resizeEventFunc, false);
    }
    if (!this.subPageFunc) {
      this.subPageFunc = this.subPage.bind(this);
      window.addEventListener('subPage', this.subPageFunc, false);
    }
    if (!this.destroyEventFunc) {
      this.destroyEventFunc = this.destroyEvent.bind(this);
      window.addEventListener(
        'destroySiteAnimation',
        this.destroyEventFunc,
        false,
      );
    }
    if (!this.hidePreloaderEventFunc) {
      this.hidePreloaderEventFunc = this.hidePreloaderEvent.bind(this);
      window.addEventListener(
        'hidePreloader',
        this.hidePreloaderEventFunc,
        false,
      );
    }
    this.inited = true;
  }
  destroy(hardDestroy = false, callBack = () => {}) {
    if (this.styleFileLoadedFunc) {
      window.removeEventListener('styleFileLoaded', this.styleFileLoadedFunc, {
        passive: true,
      });
      this.styleFileLoadedFunc = null;
    }

    // console.log('SiteAnimation webpack destroy -', this.name);
    this.inited = false;
    // resize
    if (this.throttle) this.throttle.clear();

    this.resizeList = [];
    if (hardDestroy) {
      this.throttle = null;
      window.removeEventListener('resize', this.resizeFunc);
      this.resizeFunc = null;
      if (this.resizeOnorientationFunc) {
        window.removeEventListener(
          'resizeOnorientation',
          this.resizeOnorientationFunc,
          false,
        );
        this.resizeOnorientationFunc = null;
      }
      if (this.resizeEventFunc) {
        window.removeEventListener('resizeEvent', this.resizeEventFunc, false);
        this.resizeEventFunc = null;
      }
      if (this.subPageFunc) {
        window.removeEventListener('subPage', this.subPageFunc, false);
        this.subPageFunc = null;
      }
      if (this.destroyEventFunc) {
        window.removeEventListener(
          'destroySiteAnimation',
          this.destroyEventFunc,
          false,
        );
        this.destroyEventFunc = null;
      }
    }
    // destroy timelineList
    this.timelineList.forEach((timeline) => {
      if (timeline.scrollTrigger) timeline.scrollTrigger.kill();
      timeline.kill();
      timeline = null;
      // timeline.progress(0).clear(true);
    });
    this.timelineList = [];
    // destroy tweenList
    this.tweenList.forEach((tween) => {
      // tween.clear()
      tween.pause(0);
      tween.kill();
    });
    this.triggerList.forEach((trigger) => {
      trigger.kill();
      trigger = null;
    });
    this.triggerList = [];
    // destroy scrollTriggerList
    this.scrollTriggerList.forEach((trigger) => {
      trigger.kill();
    });
    this.scrollTriggerList = [];
    this.tweenList = [];
    // destroy listenersList
    this.listenersList.forEach(({ el, type, func, params }) => {
      el.removeEventListener(type, func, params);
    });
    this.listenersList = [];
    // destroy scene
    this.sceneList.forEach((scene) => {
      scene.destroy(true);
    });
    this.sceneList = [];
    this.wordObj = { x: 0 };
    // clear wrap
    if (this.wrap) {
      this.wrap.style.height = null;
      this.wrap = null;
    }

    callBack();
    if (!hardDestroy) this.init();
  }
  offset(elem, getRect = false) {
    return offset(elem, getRect);
  }
  getTimeline(config = { paused: true }) {
    const timeline = gsap.timeline({ paused: true, ...config });
    this.timelineList.push(timeline);
    return timeline;
  }
  initParallax(items, scale = 1.1, shiftScale = 0.2) {
    return false;
  }
  clearParallaxItems(items) {
    if (!items) {
      throw Error(
        'Items list (first argument) is required for clearParallaxItems method!',
      );
    }
    items.forEach((item) => {
      const image = item.querySelector('img');
      image.removeAttribute('style');
      image.parentElement.classList.remove('init');
    });
  }
  addListener(el, type, func, params = {}) {
    el.addEventListener(type, func, params);
    !params.once && this.listenersList.push({ el, type, func, params });
  }
  hasPreloader() {
    return document.getElementById('preloader');
  }
  isElementVisible(el) {
    return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
  }
  generateID() {
    return generateID();
  }
  subPage({ detail }) {
    // if (detail === 'leave') this.destroy(true);
  }
}
