import SiteAnimation from '../modules/SiteAnimation';
import gsap, { Power0, Power1 } from 'gsap';

class Example extends SiteAnimation {
  init() {
    super.init('Example');
    this.parent = document.getElementById('Example');
  }
  destroy(hardDestroy = false) {
    super.destroy(hardDestroy);
  }
}

window.Example = new Example();
requestAnimationFrame(() => window.Example.init());
if (LOADED_SCRIPTS_PACK) LOADED_SCRIPTS_PACK.push(window.Example);
