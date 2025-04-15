function initSiteEffects(fadePage = true, middle = false) {
  if (middle) {
    requestAnimationFrame(() => SiteWave.init());
    requestAnimationFrame(() => {
      //init observer loaders
      OBSERVER_LOADERS.forEach((script) => {
        if (typeof script.init === 'function') script.init();
      });
      //init loaded scripts
      if (LOADED_SCRIPTS_PACK && LOADED_SCRIPTS_PACK.length) {
        LOADED_SCRIPTS_PACK.forEach((script) => {
          if (typeof script.init === 'function') script.init();
        });
      }
    });

    requestAnimationFrame(() => FadeElems.init());
    // requestAnimationFrame(() => CustomFade.init());
    requestAnimationFrame(() => Modals.init());

    // wpcf7
    if (!isWpAdmin() && document.querySelector('.wpcf7-form')) {
      const forms = document.querySelectorAll('.wpcf7-form');
      if (typeof wpcf7 !== 'undefined') {
        try {
          forms.forEach((el) => {
            wpcf7.reset(el);
          });
        } catch (ev) {
          forms.forEach((el) => {
            wpcf7.init(el);
          });
        }
      }
    }

    if (document.querySelector('.js-marquee')) {
      requestAnimationFrame(() => Marquee.init());
    }
    if (document.querySelector('.c-select')) {
      requestAnimationFrame(() => CustomSelect.init());
    }
    if (document.querySelector('.js-awards')) {
      if (typeof window.Awards === 'function') {
        window.Awards = new window.Awards();
      }
      requestAnimationFrame(() => Awards.init());
      if (typeof window.Awards === 'function') {
        if (LOADED_SCRIPTS_PACK) LOADED_SCRIPTS_PACK.push(window.Awards);
      }
    }
    if (document.querySelector('.js-stories-slider')) {
      if (typeof window.Stories === 'function') {
        window.Stories = new window.Stories();
      }
      requestAnimationFrame(() => window.Stories.init());

      if (typeof window.Stories === 'function') {
        if (LOADED_SCRIPTS_PACK) LOADED_SCRIPTS_PACK.push(window.Stories);
      }
    }
    if (document.querySelector('.js-impact-slider')) {
      if (typeof window.Impact === 'function') {
        window.Impact = new window.Impact();
      }
      requestAnimationFrame(() => window.Impact.init());
      if (typeof window.Impact === 'function') {
        if (LOADED_SCRIPTS_PACK) LOADED_SCRIPTS_PACK.push(window.Impact);
      }
    }
    if (document.querySelector('.js-footer-form')) {
      requestAnimationFrame(() => FooterForm.init());
    }
  } else if (!fadePage) {
    document.body.classList.add('transition0s', 'animation0s');
    requestAnimationFrame(() => LazyImages.init());
    requestAnimationFrame(() => FadePage.init());
    requestAnimationFrame(() => Header.init());
  } else {
    requestAnimationFrame(function () {
      document.body.classList.remove('transition0s', 'animation0s');
      document.body.classList.add('initEffects');
      //init anime observer
      if (ANIME_ELEMENTS_OBSERVER) ANIME_ELEMENTS_OBSERVER.init();
    });
  }
}

if (document.getElementById('preloader')) {
  document.addEventListener('DOMContentLoaded', function () {
    animatePreloader(
      () => {
        initSiteEffects(false);
      },
      () => {
        initSiteEffects(false, true);
      },
      () => {
        initSiteEffects(true);
      },
    );
  });
} else {
  document.addEventListener('DOMContentLoaded', function () {
    fixPageHeroScreen(); // fix for pageHeroScreen
    initSiteEffects(false);
    initSiteEffects(false, true);
  });

  window.addEventListener('load', function () {
    initSiteEffects(true);
  });
}
