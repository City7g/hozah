import SiteAnimation from '../modules/SiteAnimation';
import gsap, { Power2, Power4 } from 'gsap';
import { scrollToPos } from '../utils/functions';
export default new (class FadePage extends SiteAnimation {
  constructor() {
    super();
    this.timelineMainScreen = null;
    this.ease = Power4.easeIn;
    this.time = 1;
    this.delay = 0.3;
  }

  createTimeLine(name = 'line') {
    const timeline = gsap.timeline({ paused: true });
    this[name] = timeline;
    this.timelineList.push(timeline);
    return timeline;
  }

  resizeEvent() {
    this.destroy();
  }

  init(playNow = false) {
    super.init('fadePageAnim');
    // if (isTablet) return;

    // if (isTablet) return;
    if (playNow || window.preloaderSuccess || !this.hasPreloader()) this.in();
  }

  in() {
    // if (isTablet) return;

    // if (document.getElementById("heroScreen")) {
    //   this['timelineHeroScreen'].play()
    // }

    // Implement your 'in' animation logic here
    this.checkHash();
  }

  out(delay = 0) {
    // if (isTablet) return;
    setTimeout(() => {
      // Implement your 'out' animation logic here
    }, delay);
  }

  checkHash() {
    const hash = window.location.hash;
    if (hash && hash.includes('#')) {
      const elem = document.querySelector(hash);
      if (elem) {
        setTimeout(() => {
          scrollToPos(elem.getBoundingClientRect().top + window.scrollY);
        }, 1000);
      }
    }
  }

  destroy(hardDestroy = false) {
    super.destroy(hardDestroy);
    // Implement your destroy logic here
  }
})();
