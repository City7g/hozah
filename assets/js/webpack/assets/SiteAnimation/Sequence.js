import SiteAnimation from '../modules/SiteAnimation';
import gsap, { Power0 } from 'gsap';
// import { ScrollTrigger } from 'gsap/ScrollTrigger';
export default new (class Sequence extends SiteAnimation {
  constructor() {
    super();
    this.instances = [];
  }

  cl(...args) {
    // console.log('Sequence.js', ...args);
  }

  init() {
    super.init('Sequence');

    if (this.isWpAdmin) return;

    this.instances = [
      ...this.instances,
      ...document.querySelectorAll('.js-sequence:not(.init)'),
    ].map((parent) => ({
      sequence: parent,
      parent,
      images: [],
      sequenceObj: { x: 0, index: 0 },
      tl: gsap.timeline({ paused: true }),
      trigger: null,
      isLoaded: false,
      framesLoaded: 0,
    }));

    // TODO: добавить прогрессбар к лоадеру

    this.instances.forEach((instance) => {
      this.initInstance(instance);
    });
  }

  initCustomInstance(element) {
    const thise = this;
    const instance = {
      id: this.generateID(),
      sequence: element,
      parent: element,
      images: [],
      sequenceObj: { x: 0, index: 0 },
      tl: this.getTimeline(),
      trigger: null,
      isLoaded: false,
      framesLoaded: 0,
      destroy() {
        this.tl.kill();
        this.parent.classList.remove('init');
        if (this.trigger) this.trigger.kill(), (this.trigger = null);
        [this.sequence, ...this.images].forEach((item) => {
          item.removeAttribute('style');
        });
        const index = thise.instances.findIndex((item) => item.id === this.id);
        // console.log('find index', index, thise.instances[index]);
        if (index >= 0) thise.instances.splice(index, 1);
      },
    };
    this.instances.push(instance);
    this.initInstance(instance);
    return instance;
  }
  generateID() {
    return Math.random().toString(36).substring(2, 9);
  }
  initInstance(instance) {
    instance.parent.classList.add('init');
    this.initSequence(instance);
    this.initAnimation(instance);
  }

  initAnimation(instance) {
    const { sequence, images, tl, sequenceObj } = instance;

    tl.to(sequence, {
      opacity: 1,
      ease: this.ease,
      duration: 1,
      onStart: () => {
        if (tl) {
          tl.clear().to(sequenceObj, {
            x: sequenceObj.count - 1,
            repeat: -1,
            duration: sequenceObj.count / 24,
            ease: Power0.easeNone,
            onUpdate: () => {
              if (parseInt(sequenceObj.index) != parseInt(sequenceObj.x)) {
                this.setSequenceImage(
                  instance,
                  parseInt(sequenceObj.index),
                  parseInt(sequenceObj.x),
                );
              }
            },
          });
        }
      },
      // onReverseComplete: () => {
      // 	if (tl) {
      // 		tl.clear().to(sequenceObj, {
      // 			x: 0,
      // 			duration: 1,
      // 			ease: this.ease,
      // 			onUpdate: () => {
      // 				if (
      // 					parseInt(sequenceObj.index) !=
      // 					parseInt(sequenceObj.x)
      // 				) {
      // 					this.setSequenceImage(
      // 						parseInt(sequenceObj.index),
      // 						parseInt(sequenceObj.x),
      // 					);
      // 				}
      // 			},
      // 		});
      // 	}
      // },
    });
    if (instance.loaded) {
      tl.play();
    } else {
      this.addListener(
        instance.sequence,
        'sequence:isLoaded',
        (e) => {
          this.cl('sequence loaded');
          tl.play();
        },
        { once: true },
      );
    }

    // pause tl when sequence is out of view (IntersectionObserver)
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && instance.isLoaded) {
          tl.play();
        } else {
          tl.pause();
        }
      },
      {
        rootMargin: '250px 250px 250px 250px',
        threshold: 0,
      },
    );

    observer.observe(sequence);
  }

  initSequence(instance) {
    const { sequence, images, sequenceObj } = instance;

    if (sequence.dataset.desktopOnly && isMobile) return;

    const inited = sequence.classList.contains('inited');
    instance.loaded = sequence.classList.contains('loaded');

    sequence.classList.add('inited');

    const path = sequence.dataset.path;
    const mask = sequence.dataset.mask;
    const count = +sequence.dataset.count;
    const hasWebp = sequence.dataset.hasWebp;
    const ext = (() => {
      if (hasWebp && window.webpSupport) return 'webp';
      return sequence.dataset.ext || 'png';
    })();

    sequenceObj.count = count;
    // console.log(inited);
    if (inited) {
      sequence.querySelectorAll('img').forEach((image, i) => {
        instance.images.push(image);
        if (i > 0) image.style.display = 'none';
      });
    } else {
      // instance.trigger = new ScrollTrigger({
      //   trigger: instance.parent,
      //   start: 'top 150%',
      //   end: 'bottom top',
      //   once: true,
      //   onEnter: () => {
      //     this.loadAllSequenceImages({ instance, path, mask, count, ext });
      //   },
      // });

      // observer
      instance.observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            this.loadAllSequenceImages({ instance, path, mask, count, ext });
            instance.observer.disconnect();
          }
        },
        {
          rootMargin: '1500px 1000px 1500px 1000px',
          threshold: 0,
        },
      );

      instance.observer.observe(instance.parent);
    }
  }

  loadAllSequenceImages({ instance, path, mask, count, ext }) {
    for (let i = 1; i <= count; i++) {
      const image = document.createElement('img');
      instance.images.push(image);
      const minSuffix = instance.parent.dataset.minSuffix ? '-min' : '';
      const src =
        path + '/' + this.formatNumberWithMask(i, mask) + minSuffix + '.' + ext;
      image.src = src;
      instance.sequence.appendChild(image);
      if (i > 1) {
        image.style.display = 'none';
      }

      this.addListener(
        image,
        'load',
        () => {
          instance.framesLoaded++;
          this.cl('loaded', instance.framesLoaded, 'frames of', count);
          if (instance.framesLoaded === count) {
            instance.sequence.classList.add('loaded');
            instance.isLoaded = true;
            instance.sequence.dispatchEvent(
              new CustomEvent('sequence:isLoaded'),
            );
          }
        },
        { once: true },
      );
    }
  }

  setSequenceImage(instance, index, prevIndex) {
    instance.images[index].style.display = 'none';
    instance.images[prevIndex].style.display = 'block';
    instance.sequenceObj.index = prevIndex;
  }

  formatNumberWithMask(number, mask) {
    // let numberString = number.toString();
    // while (numberString.length < 4) {
    //     numberString = '0' + numberString;
    // }
    // numberString = '0_' + numberString;
    // return numberString;
    const numberString = number.toString().padStart(mask.length, '0');
    let formattedNumber = '';

    for (let i = 0; i < mask.length; i++) {
      if (mask[i] === '0') {
        formattedNumber += numberString[i];
      } else {
        formattedNumber += mask[i];
      }
    }

    return formattedNumber;
  }
  teek() {}

  resizeEvent() {}

  destroy(hardDestroy = false) {
    this.instances.forEach((instance) => {
      instance.parent.classList.remove('init');
      if (instance.trigger) instance.trigger.kill(), (instance.trigger = null);
      if (instance.observer)
        instance.observer.disconnect(), (instance.observer = null);

      [instance.sequence, ...instance.images].forEach((item) => {
        item.removeAttribute('style');
      });
    });
    this.instances = [];

    super.destroy(hardDestroy);
  }
})();
