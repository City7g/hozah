//loaders
class StyleLoader {
  constructor() {
    this.styleElements = [];
    this.observers = [];
  }

  async loadStylesFromDataHref(element) {
    try {
      return new Promise((resolve, reject) => {
        if (element.getAttribute('data-style-loaded') == 'true') return null;
        const isFirstScreen = element.getAttribute('data-fs');
        if (isFirstScreen) {
          const hasLoadedStyle =
            document.querySelector(`style#${isFirstScreen}`) || null;
          if (hasLoadedStyle) {
            element.setAttribute('data-style-loaded', 'true');
            this.styleElements = this.styleElements.filter(
              (item) => item.dataset.styleLoaded == 'false',
            );
            return resolve(true);
          }
        }
        const styleId = element.getAttribute('data-style-id');
        let href = element.getAttribute('data-style-href');

        if (href && href.includes('?')) {
          href = href.split('?')[0];
        }

        // if (styleId && sectionStyles && sectionStyles[styleId]) {
        //   href = sectionStyles[styleId];
        // }
        if (!href) return resolve(null);
        const isLoaded =
          document.querySelector(`link[rel="stylesheet"][href="${href}"]`) ||
          null;
        if (isLoaded) {
          // console.log('style file is loaded early', href);
          element.setAttribute('data-style-loaded', 'true');
          this.styleElements = this.styleElements.filter(
            (item) => item.dataset.styleLoaded == 'false',
          );
          window.dispatchEvent(new CustomEvent('styleFileLoaded'));
          resolve(true);
        } else {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = href;
          link.classList.add('style-loader');
          link.onload = () => {
            // console.log('style file is loaded', href);
            element.setAttribute('data-style-loaded', 'true');
            this.styleElements = this.styleElements.filter(
              (item) => item.dataset.styleLoaded == 'false',
            );
            window.dispatchEvent(new CustomEvent('styleFileLoaded'));
            resolve(true);
          };
          document.head.appendChild(link);
        }
      });
    } catch (e) {
      console.log(e);
    }
  }

  checkElements = () => {
    try {
      if (!this.styleElements.length) {
        return;
      }

      // load first screen styles
      this.styleElements
        .filter(
          (elem) =>
            elem.dataset.fs || elem.classList.contains('pageHeroScreen'),
        )
        .forEach((elem) => {
          this.loadStylesFromDataHref(elem);
        });
      for (let i = 0; i < this.styleElements.length; i++) {
        const elem = this.styleElements[i];
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                observer.disconnect();
                this.loadStylesFromDataHref(elem);
              } else {
              }
            });
          },
          { threshold: 0.01 },
        );
        observer.observe(elem);
        this.observers.push(observer);
      }
    } catch (e) {
      console.log(e);
    }
  };

  init() {
    try {
      this.styleElements =
        Array.from(document.querySelectorAll('[data-style-loaded="false"]')) ||
        [];
      if (!this.styleElements.length) return null;
      this.checkElements();
    } catch (e) {
      console.log(e);
    }
  }

  destroy() {
    try {
      if (this.observers.length) {
        this.observers.forEach((observer) => {
          observer.disconnect();
        });
        this.observers = [];
      }
      this.styleElements = [];
    } catch (e) {
      console.log(e);
    }
  }
}

class ScriptLoader {
  constructor() {
    this.scriptElems = [];
    this.observers = [];
    this.scripts = [];
  }

  loadScriptFromDataHref(element) {
    try {
      if (element.getAttribute('data-script-init') == 'true') return null;
      const scriptId = element.getAttribute('data-script-id');
      let src = element.getAttribute('data-script-src');
      if (
        scriptId &&
        window.sectionScripts &&
        window.sectionScripts[scriptId]
      ) {
        src = window.sectionScripts[scriptId];
        console.log('sectionScripts new', window.sectionScripts[scriptId]);
      }
      if (!src) return null;
      let script = document.createElement('script');
      script.async = true;
      script.src = src;
      script.onload = () => {
        // console.log('script file is loaded', src);
        element.setAttribute('data-script-init', 'true');
        this.scriptElems.forEach((item) => {
          if (item.getAttribute('data-script-src') === src) {
            item.setAttribute('data-script-init', 'true');
          }
        });
      };
      document.body.appendChild(script);
      this.scripts.push(script);
    } catch (e) {
      console.log(e);
    }
  }

  checkElements = () => {
    try {
      if (!this.scriptElems.length) {
        return;
      }

      for (let i = 0; i < this.scriptElems.length; i++) {
        const elem = this.scriptElems[i];
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                observer.disconnect();
                this.loadScriptFromDataHref(elem);
              } else {
              }
            });
          },
          { threshold: 0.01 },
        );
        observer.observe(elem);
        this.observers.push(observer);
      }
    } catch (e) {
      console.log(e);
    }
  };

  init() {
    try {
      this.scriptElems =
        Array.from(
          document.querySelectorAll(
            '[data-script-src][data-script-init="false"]',
          ),
        ) || [];
      if (!this.scriptElems.length) return null;
      this.checkElements();
    } catch (e) {
      console.log(e);
    }
  }

  destroy() {
    try {
      if (this.observers.length) {
        this.observers.forEach((observer) => {
          observer.disconnect();
        });
        this.observers = [];
      }
      if (this.scripts.length) {
        this.scripts.forEach((script) => {
          if (script) script.remove();
        });
        this.scripts = [];
      }
      this.scriptElems = [];
    } catch (e) {
      console.log(e);
    }
  }
}

const OBSERVER_LOADERS = [new StyleLoader(), new ScriptLoader()];
let LOADED_SCRIPTS_PACK = [];
