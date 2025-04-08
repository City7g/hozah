import SiteAnimation from '../modules/SiteAnimation';
// import { ScrollTrigger } from 'gsap/ScrollTrigger';
export default new (class SiteWave extends SiteAnimation {
  constructor() {
    super();
    this.classList = ['.split'];
    this.elemsList = [];
    this.scrollTriggerList = [];
  }

  init(classList = [], initDelay = 50, charDelay = 25, lineDelay = 100) {
    this.initDelay = initDelay;
    this.charDelay = charDelay;
    this.lineDelay = lineDelay;

    this.observer = new IntersectionObserver(this.observerCallback.bind(this), {
      root: null,
      // rootMargin: `0px 0px ${isTablet ? 100 : 200}px 0px`,
      threshold: 0.2,
    });

    super.init('SiteWave');
    this.splitWave([...this.classList, ...classList].join(', '));
    this.hiddenFromUser = document.querySelector('.hidden-from-user');
    if (this.hiddenFromUser) {
      this.hiddenFromUser.classList.remove('hidden-from-user');
    }

    this.styleFileLoadedFunc = this.splitWave.bind(
      this,
      [...this.classList, ...classList].join(', '),
    );
    window.addEventListener('styleFileLoaded', this.styleFileLoadedFunc, {
      passive: true,
    });
  }

  observerCallback(entries) {
    entries.forEach(({ target: element, isIntersecting }) => {
      if (isIntersecting && !element.classList.contains('show')) {
        const delay = element.dataset.delay
          ? parseFloat(element.dataset.delay) / 1000
          : 0;
        this.observer.unobserve(element);
        // gsap.to(element, {
        //   opacity: 1,
        //   y: 0,
        //   duration: 0.7,
        //   ease: Power2.easeOut,
        //   clearProps: 'all',
        //   delay: delay,
        //   onComplete: () => {
        //     element.classList.add('show');
        //   },
        // });

        setTimeout(() => {
          element.classList.remove('waitEnter');
          element.classList.remove('trigger');
          element.classList.add('show');

          setTimeout(() => {
            element.classList.add('animation-done');
          }, 750);
        }, delay);
      }
    });
  }

  resizeEvent() {
    this.destroy();
  }

  splitWave(tag = '.split') {
    this.splitList = [...document.querySelectorAll(tag)];
    this.splitList
      .filter((el) => {
        return (
          !el.classList.contains('init') &&
          (el.closest('.styleBoxes[data-style-loaded="true"]') ||
            el.closest('.wrapper[data-style-loaded="true"]') ||
            !el.closest('.styleBoxes') ||
            el.closest('.pageHeroScreen'))
        );
      })
      .forEach((element) => {
        let default_html = element.innerHTML;
        let lineHeight = (() => {
          let h = getComputedStyle(element).lineHeight;
          return h === 'normal'
            ? parseFloat(getComputedStyle(document.body).lineHeight)
            : parseFloat(h);
        })();
        let tag = element.tagName;
        let spans = [];
        let listU = [];
        let listI = [];
        let listB = [];
        let listA = [];
        let listStrong = [];
        const desktopBr = element.dataset.desktopBr;
        const tabletBr = element.dataset.tabletBr;
        const textTransform = getComputedStyle(element).textTransform;
        let lineTag =
          tag === 'P' || tag === 'A' || tag === 'SPAN' || /H\d/.test(tag)
            ? 'span'
            : 'div';
        const parseHtml = element.classList.contains('html');
        let text = parseHtml
          ? element.innerHTML
              .trim()
              .replace(/ +/gim, ' ')
              .replace(/<br>/gim, ' <br> ')
          : element.innerHTML
              .trim()
              .replace(/[\n/\t]/g, ' ')
              .replace(/ +/gim, ' ');
        const oneWorld =
          element.classList.contains('oneWorld') ||
          (element.classList.contains('oneWorldDesktop') && !isTablet);
        element.classList.add('split', 'init');
        // console.log('text', element.innerHTML.trim());

        this.elemsList.push({
          el: element,
          html: default_html,
        });
        Array.from(
          element.querySelectorAll('span, u, i, b, strong, a'),
        ).forEach(function (el) {
          let tag = el.tagName.toLowerCase();
          let arr = (() => {
            if (tag === 'u') return listU;
            if (tag === 'i') return listI;
            if (tag === 'b') return listB;
            if (tag === 'a') return listA;
            if (tag === 'strong') return listStrong;
            return spans;
          })();
          let textCurrent = el.textContent;
          const textArr = textCurrent.split(' ');
          if (textArr.length > 1) {
            text = text.replace(textCurrent, textCurrent.replace(/ /gi, '_'));
            textCurrent = textCurrent.replace(/ /gi, '_');
          }
          arr.push({
            text: textCurrent,
            html: el.innerHTML,
            class: el.className,
            href: el.getAttribute('href'),
          });
        });

        if (!oneWorld) {
          document.body.insertAdjacentHTML(
            'beforeend',
            `<${tag} class='${
              element.className
            }' line_separator' id='line_separator' style='margin: 0!important; padding: 0!important; display: block; overflow: hidden; width: ${
              element.clientWidth
            }px; max-width: ${
              getComputedStyle(element).maxWidth
            }; height: ${lineHeight}px; font: ${
              getComputedStyle(element).font
            }; text-transform: ${textTransform}; transition: 0s;'><${lineTag}></${lineTag}></${tag}>`,
          );
        }

        let arr_words = text.split(' ');
        let lines = [];

        if (desktopBr && !isTablet) {
          let arr = [desktopBr];
          if (typeof desktopBr === 'object' && Array.isArray(desktopBr))
            arr = [...desktopBr];
          arr.forEach((number, index) =>
            arr_words.splice(number + index, 0, '<br>'),
          );
        }

        if (tabletBr && isTablet) {
          let arr = [tabletBr];
          if (typeof tabletBr === 'object' && Array.isArray(tabletBr))
            arr = [...tabletBr];
          arr.forEach((number, index) =>
            arr_words.splice(number + index, 0, '<br>'),
          );
        }

        // console.log('arr_words', arr_words);
        arr_words.forEach(function (value, index) {
          // console.log('value', value);
          if (value === '') return true;

          if (!oneWorld) {
            let text = document.querySelector(
              '#line_separator ' + lineTag,
            ).innerHTML;
            document.querySelector('#line_separator ' + lineTag).innerHTML =
              text + value + ' ';
            let scroll_height_after = document.querySelector(
              '#line_separator ' + lineTag,
            ).offsetHeight;
            if (scroll_height_after > Math.ceil(lineHeight) * 1.5) {
              lines.push(text);
              document.querySelector('#line_separator ' + lineTag).innerHTML =
                value + ' ';
              if (index === arr_words.length - 1) {
                lines.push(value);
              }
            } else {
              if (index === arr_words.length - 1) {
                lines.push(text + value);
              }
              return true;
            }
          } else {
            lines.push(value);
          }
        });
        // console.log('lines', lines);
        let totalDelay = 0;
        lines.forEach((value, index) => {
          let wordTag;
          let line_index = index;
          let mass_words = value.trim().split(' ');
          let href;
          let class_span = '';
          let lineClass = '';
          mass_words.forEach((value, index_word, arr) => {
            // console.log('value', value);

            const regex = /<i>\S<\/i>/gi; // has I tag
            if (regex.test(value)) {
              lineClass = 'hasDecor';
            }

            class_span = '';
            href = null;
            wordTag = tag === 'P' || /H\d/.test(tag) ? 'span' : 'div';
            if (value === '' || value === '<br>') return true;

            const findSpanIndex = spans.findIndex(function (span) {
              return span.text === value;
            });

            if (findSpanIndex >= 0) {
              const findSpan = spans.splice(findSpanIndex, 1);
              class_span = (findSpan && findSpan[0].class) || '';
            }

            const findUIndex = listU.findIndex(function (u) {
              return u.text === value;
            });

            if (findUIndex >= 0) {
              const findU = listU.splice(findUIndex, 1);
              class_span = (findU && findU[0].class) || '';
              wordTag = 'u';
            }

            const findIIndex = listI.findIndex(function (i) {
              return i.text === value;
            });

            if (findIIndex >= 0) {
              const findI = listI.splice(findIIndex, 1);
              class_span = (findI && findI[0].class) || '';
              wordTag = 'i';
            }

            const findBIndex = listB.findIndex(function (b) {
              return b.text === value;
            });

            if (findBIndex >= 0) {
              const findB = listB.splice(findBIndex, 1);
              class_span = (findB && findB[0].class) || '';
              wordTag = 'b';
            }

            const findStrongIndex = listStrong.findIndex(function (strong) {
              return strong.text === value;
            });

            if (findStrongIndex >= 0) {
              const findStrong = listStrong.splice(findStrongIndex, 1);
              class_span = (findStrong && findStrong[0].class) || '';
              wordTag = 'strong';
            }

            const findAIndex = listA.findIndex(function (a) {
              return a.text === value;
            });

            if (findAIndex >= 0) {
              const findA = listA.splice(findAIndex, 1);
              class_span = (findA && findA[0].class) || '';
              wordTag = 'a';
              href = (findA && findA[0].href) || null;
            }
            arr[index_word] = (() => {
              let text = '';
              value.split('_').forEach((word) => {
                totalDelay = parseInt(
                  index_word * this.charDelay + line_index * this.lineDelay,
                );
                text += `<${wordTag} ${
                  wordTag === 'a' && href ? 'href="' + href + '"' : ''
                } class='${(
                  'word ' + class_span
                ).trim()}' style='animation-delay: ${
                  this.initDelay + totalDelay
                }ms;'>${word}</${wordTag}> `;
              });
              return text;
            })();
          });
          lines[
            index
          ] = `<${lineTag} class='line ${lineClass}' style='animation-delay:${
            line_index * this.lineDelay
          }ms;'><${lineTag}>${mass_words.join(' ')}</${lineTag}></${lineTag}>`;
        });

        element.innerHTML = `<${lineTag} class='rows'>${lines.join(
          '',
        )}</${lineTag}>`;
        element.insertAdjacentHTML(
          'beforeend',
          `<${lineTag} class='default_content' style='display:none;'>${default_html}</${lineTag}>`,
        );

        // console.log('window.preloaderSuccess', window.preloaderSuccess);
        // if (!this.hasPreloader() || window.preloaderSuccess) {
        setTimeout(
          () => {
            element.classList.add('fullShow');
            this.createTrigger(element);
          },
          element.closest('.styleBoxes[data-style-loaded="true"]') ||
            element.closest('.wrapper[data-style-loaded="true"]')
            ? this.initDelay
            : this.initDelay + totalDelay + 1000,
        );
        // }, this.initDelay + totalDelay + 500);
        // }
        document.querySelector('#line_separator')?.remove();
        element.classList.add('waitEnter');
        this.setHightLightDelay(element);
      });
  }
  // hidePreloaderEvent({ detail: { delay = 0 } } = {}) {
  //     setTimeout(() => {
  //         this.splitList.forEach((element) => {
  //             this.createTrigger(element)
  //         })
  //     }, this.initDelay + delay * 1000);

  // }
  createTrigger(element) {
    if (element && element.classList.contains('customShow')) return;
    // const delay = element.dataset.delay ? parseFloat(element.dataset.delay) : 0;
    // const trigger = new ScrollTrigger({
    //   trigger: element,
    //   start: `top bottom-=${isTablet ? 100 : 200}px`,
    //   // markers: true,
    //   once: true,
    //   invalidateOnRefresh: true,
    //   onEnter: () => {
    //     // console.log('onEnter', element);
    //     setTimeout(() => {
    //       element.classList.remove('waitEnter');
    //       element.classList.remove('trigger');
    //       element.classList.add('show');

    //       setTimeout(() => {
    //         element.classList.add('animation-done');
    //       }, 750);
    //     }, delay);
    //   },
    // });
    // this.scrollTriggerList.push(trigger);

    this.observer.observe(element);

    // gsap.set(element, { opacity: 0, y: 0 });
  }
  setHightLightDelay(element) {
    element.querySelectorAll('bold, strong').forEach((highlight, index) => {
      highlight.style.setProperty('--number', index + 2);
    });
  }
  destroy(hardDestroy = false) {
    if (this.observer) this.observer.disconnect(), (this.observer = null);
    if (this.hiddenFromUser)
      this.hiddenFromUser.classList.add('hidden-from-user');
    this.elemsList.forEach(({ el, html }) => {
      el.innerHTML = html;
      el.classList.remove('init');
    });
    this.elemsList = [];
    if (this.styleFileLoadedFunc) {
      window.removeEventListener('styleFileLoaded', this.styleFileLoadedFunc, {
        passive: true,
      });
    }
    super.destroy(hardDestroy);
  }
})();
