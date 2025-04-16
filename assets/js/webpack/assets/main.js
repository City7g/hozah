const vhCheck = require('vh-check');
import 'intersection-observer';
import { install } from 'resize-observer';
if (!window.ResizeObserver) install();

import LazyImages from './modules/LazyImages';
import Highway from '@dogstudio/highway';
import SiteAnimation from './modules/SiteAnimation';
import {
  scrollToPos,
  initThrottle,
  toRem,
  rnd,
  defineParams,
  CheckResize,
  isWpAdmin,
  fixPageHeroScreen,
  getPageScroll,
  offset,
  scrollNextSection,
  checkLoadPageStyleBoxes,
} from './utils/functions';
import { HoldAllScrollPage, HoldScrollPage } from './utils/HoldScrollPage';

window.rnd = rnd;
window.toRem = toRem;
window.vhCheck = vhCheck;
window.Highway = Highway;
window.scrollToPos = scrollToPos;
window.initThrottle = initThrottle;
window.SiteAnimation = SiteAnimation;
window.HoldScrollPage = HoldScrollPage;
window.HoldAllScrollPage = HoldAllScrollPage;
window.LazyImages = LazyImages;
window.isWpAdmin = isWpAdmin;
window.fixPageHeroScreen = fixPageHeroScreen;
window.getPageScroll = getPageScroll;
window.offset = offset;
window.scrollNextSection = scrollNextSection;
window.checkLoadPageStyleBoxes = checkLoadPageStyleBoxes;

CheckResize();

import gsap from 'gsap'; // Also works with TweenLite and TimelineLite
window.gsap = gsap;

//for scroll coockieyes

document.addEventListener('DOMContentLoaded', () => {
  function getCookieYesConsent() {
    if (typeof window.getCkyConsent !== 'function') {
      return {};
    }
    const consentData = window.getCkyConsent();
    if (!consentData || !consentData.categories) {
      return {};
    }
    return consentData.categories;
  }

  function handleCookieYesModal(mutationsList) {
    for (const mutation of mutationsList) {
      if (
        mutation.type === 'attributes' &&
        mutation.attributeName === 'class'
      ) {
        const modal = mutation.target;
        const isOpen = modal.classList.contains('cky-modal-open');
        HoldScrollPage(isOpen);
        document
          .querySelector('.cky-preference-body-wrapper')
          .setAttribute('data-lenis-prevent', isOpen ? 'true' : 'false');
        document
          .querySelector('.cky-preference-body-wrapper')
          .classList.add('allow-scroll');
      }
    }
  }

  function observeModal() {
    const modal = document.querySelector('.cky-modal');
    if (modal) {
      const observer = new MutationObserver(handleCookieYesModal);
      observer.observe(modal, { attributes: true });
    } else {
      setTimeout(observeModal, 500);
    }
  }

  observeModal();

  document.addEventListener('cookieyes_consent_update', () => {
    if (window.cookieyes) {
      const consents = getCookieYesConsent();
      const isAnalyticsAccepted = consents.analytics;
      if (window.dataLayer) {
        window.dataLayer.push({
          event: 'cookie_consent_update',
          analytics: isAnalyticsAccepted,
        });
      }
    }
  });

  setTimeout(() => {
    if (window.cookieyes)
      document.dispatchEvent(new Event('cookieyes_consent_update'));
  }, 1000);
});

// end for scroll coockieyes

if (window.Lenis && !isWpAdmin() && !defineParams.mobileDevice) {
  const lenis = new Lenis({
    lerp: 0.2, // default 0.1
    prevent: (node) => {
      return node.closest('.cky-preference-body-wrapper');
    },
  });
  lenis.on('scroll', () => ScrollTrigger.update());
  window.lenis = lenis;
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);
}

import { ScrollTrigger } from 'gsap/ScrollTrigger';
document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
});

// params

const setDefineParams = () => {
  for (const key in defineParams) {
    window[key] = defineParams[key];
  }
  if (defineParams.isMacLike) document.body.classList.add('isMacLike');
  if (defineParams.isSafari) document.body.classList.add('isSafari');
  if (defineParams.isFirefox) document.body.classList.add('isFirefox');
};

setDefineParams();
window.setDefineParams = setDefineParams;

import Header from './SiteAnimation/Header';
import SiteWave from './SiteAnimation/SiteWave';
import FadePage from './SiteAnimation/FadePage';
import FadeElems from './SiteAnimation/FadeElems';
// import CustomFade from './SiteAnimation/CustomFade';
import Modals from './SiteAnimation/Modals';
import Marquee from './SiteAnimation/Marquee';
import CustomSelect from './SiteAnimation/CustomSelect';
import Awards from './SiteAnimation/Awards';
import Stories from './SiteAnimation/Stories';
import Impact from './SiteAnimation/Impact';
import FooterForm from './SiteAnimation/FooterForm';
import SimpleAccordion from './SiteAnimation/SimpleAccordion';
window.Header = Header;
window.SiteWave = SiteWave;
window.FadePage = FadePage;
window.FadeElems = FadeElems;
// window.CustomFade = CustomFade;
window.Modals = Modals;
window.Marquee = Marquee;
window.CustomSelect = CustomSelect;
window.Awards = Awards;
window.Stories = Stories;
window.Impact = Impact;
window.FooterForm = FooterForm;
window.SimpleAccordion = SimpleAccordion;
