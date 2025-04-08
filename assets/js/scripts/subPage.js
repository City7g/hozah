let scrollBehaviorTimer;

function toggleScrollBehavior(active = true) {
  document
    .querySelector('html')
    .classList[active ? 'add' : 'remove']('scrollBehavior');
}

const loopScroll = {
  top: 0,
  interval: null,
  init() {
    this.top = window.pageYOffset;
    clearInterval(this.interval);
    window.scrollTo(0, this.top);
    this.interval = setInterval(() => {
      window.scrollTo(0, this.top);
    }, 0);
  },
  destroy() {
    clearInterval(this.interval);
  },
};

class FadeTransition extends Highway.Transition {
  async in({ from, to, trigger, done }) {
    console.log('FadeTransition in', {
      from,
      to,
    });

    loopScroll.destroy();
    await subPage.enter(subPage.Highway.properties.page, 'default');
    await subPage.complete(() => {
      from.remove();
    });
    done();
  }

  async out({ from, trigger, done }) {
    loopScroll.init();
    await subPage.leave();
    done();
  }
}

////////////
const subPage = (function () {
  function attach(selector) {
    if (!selector) return;
    const links = document.querySelectorAll(selector);
    this.Highway.attach(links);
  }
  function SubPage() {
    this.attach = attach;
    this.pageLoader = document.getElementById('pageLoader');
    this.header = document.querySelector('header');
    this.headerLogo = null;
    this.body = document.body;
    if (isWpAdmin()) {
      requestAnimationFrame(() => initSiteEffects(false));
      requestAnimationFrame(() => initSiteEffects(false, true));
      requestAnimationFrame(() => initSiteEffects(true));
      setInterval(() => {
        initSiteEffects(false, true);
      }, 3000);
      return;
    }
    this.init();
  }

  SubPage.prototype.linkClick = async function (e) {
    const href = e.target.href;
    // regex id check
    const regex = /\/#(.*$)/;
    const match = href.match(regex);
    if (window.Header?.isOpen || isTablet) window.Header.closeMenu();
    if (match) {
      const find = document.getElementById(match[1]);
      if (find) {
        e.preventDefault();
        e.stopPropagation();
        window.history.pushState({}, '', href);
        await window.checkLoadPageStyleBoxes();
        const top = window.offset(find).top;

        const headerHeight =
          document.querySelector('header')?.clientHeight || 83;
        window.scrollToPos(top - headerHeight - 20);
      }
    }
  };
  SubPage.prototype.init = function () {
    this.links = document.querySelectorAll('nav a');
    this.Highway = new Highway.Core({
      transitions: {
        default: FadeTransition,
      },
    });
    this.Highway.on('NAVIGATE_IN', (e) => {
      this.links = document.querySelectorAll('nav a');
      this.checkLinks(e);
    });
    this.checkLinks(this.Highway);

    // detach wp-admin links
    const links = document.querySelectorAll('#wpadminbar a');
    this.Highway.detach(links);

    const targetSelfLinks = document.querySelectorAll(
      'a[target="_self"], a[target=""]',
    );
    this.Highway.attach(targetSelfLinks);
    this.Highway.headStyles = {
      [this.Highway.properties.slug]: document.querySelector(
        'link#ut-all-styles-css',
      ),
    };
  };

  SubPage.prototype.checkLinks = function ({ to, location }) {
    // Check Active Link
    for (let i = 0; i < this.links.length; i++) {
      const link = this.links[i];

      link.addEventListener('click', this.linkClick);

      const href = link.href;
      const regex = /\/#(.*$)/;
      const match = href.match(regex);

      if (match && document.getElementById(match[1])) {
        this.Highway.detach([link]);
      }
      // Clean class
      link.classList.remove('active');

      // Active link
      if (link.href === location.href) {
        link.classList.add('active');
      }
    }
  };

  SubPage.prototype.leave = async function () {
    toggleScrollBehavior(true);
    return new Promise((resolve, reject) => {
      let delay = window.Header?.isOpen ? 900 : 0;
      if (window.Header?.isOpen) window.Header.menuBtnClick();
      FadePage.out(delay);
      animateFromTo('body', 0.3, {}, { opacity: 0 }, 0.2 + delay / 1000);
      setTimeout(() => {
        this.header.classList.add('hide');
      }, 100 + delay);
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('subPage', { detail: 'leave' }));
        resolve();
      }, 700 + delay);
    });
  };

  SubPage.prototype.enter = async function (page, type = 'default') {
    const header = page.querySelector('header');
    const footer = page.querySelector('footer');
    const headerLogo = page.querySelector('.headerLogo');
    const body = page.querySelector('body');
    const head = page.querySelector('head');
    // this.sectionStyles = page.getElementById('sectionStyles');
    // this.sectionScripts = page.getElementById('sectionScripts');
    header ? (this.header = header) : null;
    footer ? (this.footer = footer) : null;
    headerLogo ? (this.headerLogo = headerLogo) : null;
    body ? (this.body = body) : null;
    head ? (this.head = head) : null;

    // replace styles
    const newStyle =
      head.querySelector('link#ut-all-styles-css') ||
      this.Highway.headStyles[this.Highway.properties.slug];
    const currentStyle = document.querySelector('link#ut-all-styles-css');
    if (newStyle)
      this.Highway.headStyles[this.Highway.properties.slug] = newStyle;
    if (newStyle && currentStyle) currentStyle.replaceWith(newStyle);

    toggleScrollBehavior(false);
    window.dispatchEvent(new CustomEvent('subPage', { detail: 'enter' }));
    return new Promise((resolve, reject) => {
      document.body.classList.add('siteEnterNow');
      document.body.classList.remove('siteEnterNow');
      this.header.classList.remove('hide');
      resolve();
      setTimeout(() => animateFromTo('body', 0.3, {}, { opacity: 1 }), 500);
    });
  };

  SubPage.prototype.complete = async function (callback = () => {}) {
    return new Promise((resolve, reject) => {
      gsap.globalTimeline.getChildren().forEach((t) => t.kill()); // clear gsap timeline
      window.dispatchEvent(new CustomEvent('destroySiteAnimation')); // destroy animations as class SiteAnimation
      //destroy observer loaders
      OBSERVER_LOADERS.forEach((script) => {
        if (typeof script.destroy === 'function') script.destroy();
      });
      //destroy loaded scripts
      if (LOADED_SCRIPTS_PACK && LOADED_SCRIPTS_PACK.length) {
        LOADED_SCRIPTS_PACK.forEach((script) => {
          if (typeof script.destroy === 'function') script.destroy();
        });
        LOADED_SCRIPTS_PACK = [];
      }
      //destroy anime observer
      if (ANIME_ELEMENTS_OBSERVER) ANIME_ELEMENTS_OBSERVER.destroy();
      // remove all observer styles
      document.querySelectorAll('link.style-loader').forEach((el) => {
        el.remove();
      });

      // load section styles and scripts
      // if (this.sectionStyles) {
      //   if (document.getElementById('sectionStyles')) {
      //     document
      //       .getElementById('sectionStyles')
      //       .replaceWith(this.sectionStyles);
      //   }
      //   eval(this.sectionStyles.innerHTML);
      // } else {
      //   window.sectionStyles = {};
      // }

      // if (this.sectionScripts) {
      //   if (document.getElementById('sectionScripts')) {
      //     document
      //       .getElementById('sectionScripts')
      //       .replaceWith(this.sectionScripts);
      //   }
      //   eval(this.sectionScripts.innerHTML);
      // } else {
      //   window.sectionScripts = {};
      // }

      callback();

      fixPageHeroScreen(); // fix for pageHeroScreen

      initSiteEffects(false);

      HoldScrollPage(false);

      if (this.header) {
        const newHeader = this.header.cloneNode(true);
        document.querySelector('header').replaceWith(newHeader);
      }
      if (this.footer) {
        const newFooter = this.footer.cloneNode(true);
        document.querySelector('footer').replaceWith(newFooter);
      }
      if (this.headerLogo) {
        const newLogo = this.headerLogo.cloneNode(true);
        document.querySelector('.headerLogo').replaceWith(newLogo);
      }
      if (this.body) {
        document.body.setAttribute('class', this.body.classList.value);
      }

      const targetSelfLinks = document.querySelectorAll(
        'a[target="_self"], a[target=""]',
      );
      this.Highway.attach(targetSelfLinks);

      document.body.classList.remove('initEffects');

      window.setDefineParams();

      window.dispatchEvent(new CustomEvent('subPage', { detail: 'complete' }));
      setTimeout(() => {
        initSiteEffects(false, true), window.scrollTo(0, 0);
      }, 100);
      setTimeout(() => {
        initSiteEffects(true), resolve();
      }, 300);

      document.body.removeAttribute('data-lenis-prevent');
    });
  };

  return new SubPage();
})();
