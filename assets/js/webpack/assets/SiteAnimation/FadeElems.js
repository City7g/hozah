import SiteAnimation from '../modules/SiteAnimation';
import gsap from 'gsap';
import { Power2 } from 'gsap';

// import SplitType from 'split-type'; // розкоментувати якщо використовуємо анімацію посимвольно

// 1. Додаємо клас .fadeEl елементам, які хочемо анімувати
// 2. Додаємо атрибут data-delay зі значенням в мілісекундах, якщо потрібно затримати анімацію
// 3. Додаємо атрибут data-split="true" якщо потрібно анімувати кожен символ окремо
// 4. Додаємо атрибут data-only-class="true" якщо потрібно просто додати клас show без анімації
// 5. За замовчуванням посимвольна анімація розділена для заголовків і для інших текстів

export default new (class FadeElems extends SiteAnimation {
  init() {
    super.init();

    if (this.isWpAdmin) return;

    this.parents = document.querySelectorAll('[data-style-loaded]');
    if (!this.parents.length) return;
    this.firstScreen = document.querySelector('.pageHeroScreen');
    this.mutation = null;
    this.titleTags = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'];
    this.splitObj = [];
    this.detectLoadStyle();

    setTimeout(() => {
      if (isTablet) {
        document.querySelectorAll('.pageHeroScreen .fadeEl').forEach((el) => {
          el.classList.add('show');
        });
      }
    }, 300);

    document.fonts.ready
      .then(() => {
        // console.log('All fonts are loaded');
        this.parents.forEach((styleBox, i) => {
          if (styleBox.getAttribute('data-style-loaded') === 'true') {
            // if style is loaded
            this.intersectionFunc('.fadeEl', styleBox);
          } else {
            // wait for style loaded
            this.mutation.observe(styleBox, { attributes: true });
          }
        });

        if (
          this.firstScreen &&
          !this.firstScreen.hasAttribute('data-style-loaded')
        ) {
          this.intersectionFunc('.fadeEl', this.firstScreen);
        }
      })
      .catch((error) => {
        console.error('Error on fonts download', error);
      });
  }

  detectLoadStyle() {
    this.mutation = new MutationObserver((mutationsList, observer) => {
      for (let mutation of mutationsList) {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'data-style-loaded'
        ) {
          if (mutation.target.getAttribute('data-style-loaded') === 'true') {
            // console.log(mutation.target);
            this.intersectionFunc('.fadeEl', mutation.target);
          }
        }
      }
    });
  }

  intersectionFunc(selectors, parent) {
    const elems = [...parent.querySelectorAll(selectors)].filter((el) => {
      if (isTablet && el.closest('.pageHeroScreen')) {
        el.classList.add('show');
        return false;
      }
      return true;
    });

    if (!elems.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(({ isIntersecting, target }) => {
          if (isIntersecting && !target.classList.contains('show')) {
            const allElems = [
              ...document.querySelectorAll('.fadeEl:not(.show)'),
            ];
            allElems.forEach((el) => {
              // not animation previous elements
              if (el.getBoundingClientRect().top + el.clientHeight < 0) {
                el.removeAttribute('style');
                el.classList.add('show');
                observer.unobserve(el);
                if (el.querySelector('.word')) {
                  el.querySelectorAll('.word').forEach((word) => {
                    word.removeAttribute('style');
                  });
                }
                if (el.querySelector('.char')) {
                  el.querySelectorAll('.char').forEach((char) => {
                    char.removeAttribute('style');
                  });
                }
              }
            });
            const delay = target.dataset.delay / 1000 || 0;
            if (!target.dataset.split) {
              gsap.to(target, {
                opacity: 1,
                y: 0,
                duration: target.dataset.onlyClass ? 0 : 0.7,
                clearProps: 'all',
                ease: Power2.easeOut,
                delay: delay,
                onComplete: () => {
                  // setTimeout(() => {
                  // target.classList.add('completed');
                  target.removeAttribute('style');
                  // }, 500);
                },
              });
            } else {
              // if tag name H
              if (this.titleTags.includes(target.tagName)) {
                target.querySelectorAll('.line').forEach((line, index) => {
                  setTimeout(() => {
                    gsap.to(line.querySelectorAll('.char'), {
                      opacity: 1,
                      y: 0,
                      stagger:
                        target.tagName == 'H1' || target.tagName == 'H2'
                          ? 0.04
                          : 0.02,
                      duration: 0.5,
                      onComplete: () => {
                        line.querySelectorAll('.char').forEach((word, i) => {
                          if (i === line.querySelectorAll('.char').length - 1) {
                            word.closest('.line').style.overflow = 'visible';
                          }
                        });
                      },
                    });
                  }, index * 200);
                });
              } else {
                target.querySelectorAll('.line').forEach((line, index) => {
                  setTimeout(() => {
                    gsap.to(line.querySelectorAll('.word'), {
                      opacity: 1,
                      y: 0,
                      // stagger: 0.1,
                      duration: 1,
                      onComplete: () => {
                        line.querySelectorAll('.word').forEach((word, i) => {
                          if (i === line.querySelectorAll('.word').length - 1) {
                            word.closest('.line').style.overflow = 'visible';
                          }
                        });
                      },
                    });
                  }, index * 100);
                });
              }
            }
            target.classList.add('show');
          }
        });
      },
      {
        root: null,
        threshold: 0,
        rootMargin: '0px',
      },
    );

    elems.forEach((el) => {
      if (el.classList.contains('show')) return;
      if (isTablet && el.closest('.pageHeroScreen')) {
        el.classList.add('show');
        return;
      }
      // standart animation
      if (!el.dataset.onlyClass && !el.dataset.split) {
        gsap.set(el, { opacity: 0, y: 70 });
      }

      // split animation
      if (el.dataset.split) {
        // if tag name H
        if (this.titleTags.includes(el.tagName)) {
          const split = new SplitType(el);
          split.chars.forEach((char) => {
            gsap.set(char, { y: '100%', opacity: 0 });
          });
        } else {
          // if not H, another text blocks
          const split = new SplitType(el, {
            types: 'lines,words',
          });
          split.words.forEach((word) => {
            gsap.set(word, { y: '100%', opacity: 0 });
          });
        }
      }
      observer.observe(el);
    });
  }

  destroy(hardDestroy = false) {
    if (this.mutation) {
      this.mutation.disconnect();
      this.mutation = null;
    }

    document.querySelectorAll('.fadeEl').forEach((el) => {
      el.removeAttribute('style');
      el.classList.remove('show', 'completed');
      if (el.querySelector('.word')) {
        el.querySelectorAll('.word').forEach((word) => {
          word.removeAttribute('style');
        });
      }
      if (el.querySelector('.char')) {
        el.querySelectorAll('.char').forEach((char) => {
          char.removeAttribute('style');
        });
      }
    });
    this.splitObj.forEach((split) => {
      split.revert();
    });
    super.destroy(hardDestroy);
  }
})();
