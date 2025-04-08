const vhCheck = require('vh-check');
import { getScrollbarWidth } from './functions';

// set default params
let window_width = window.innerWidth;
let window_height = window.innerHeight;
let isTablet = window_width <= 1100;
let isTablet2 = window_width <= 780;
let isMobile = window_width <= 540;

window.isTablet = isTablet;
window.isTablet2 = isTablet2;
window.isMobile = isMobile;

const root = document.documentElement;
let deltaVH =
  vhCheck().vh - vhCheck().windowHeight
    ? vhCheck().vh - vhCheck().windowHeight
    : isTablet
    ? 83
    : 0;
window.deltaVH = deltaVH;
root.style.setProperty('--deltaVH', deltaVH + 'px');
root.style.setProperty('--vh', vhCheck().vh + 'px');
root.style.setProperty('--windowHeight', vhCheck().vh - deltaVH + 'px');
root.style.setProperty(
  '--windowWidth',
  window.innerWidth - getScrollbarWidth() + 'px',
);
//
const responsiveSteps = { 0: false, 541: false, 781: false, 1101: true };
let responsiveNow = undefined;
let responsiveStateNow = undefined;

const getResponsive = () => {
  const windowWidth = window.innerWidth;
  for (const key in responsiveSteps) {
    if (windowWidth >= key) {
      responsiveNow = key;
    }
  }
  if (responsiveStateNow === undefined) {
    // responsiveStateNow = responsiveSteps[responsiveNow]
    responsiveStateNow = responsiveNow;
  }
  // if (responsiveStateNow !== responsiveSteps[responsiveNow]) {
  // responsiveStateNow = responsiveSteps[responsiveNow]
  if (responsiveNow !== responsiveStateNow) {
    responsiveStateNow = responsiveNow;
    checkResizeDo(responsiveSteps[responsiveNow]);
  }
  window.responsiveStateNow = responsiveStateNow;
  window.responsiveNow = responsiveNow;
};

const checkResizeDo = (detail = false) => {
  window.dispatchEvent(new CustomEvent('resizeEvent', { detail }));
};

export default () => {
  getResponsive();

  window.addEventListener(
    'resize',
    () => {
      if (!isTablet || window_width != window.innerWidth) {
        const newDeltaVH = vhCheck().vh - vhCheck().windowHeight;
        if (newDeltaVH != 0) deltaVH = newDeltaVH;
        window.deltaVH = deltaVH;
        root.style.setProperty('--deltaVH', deltaVH + 'px');
        root.style.setProperty('--vh', vhCheck().vh + 'px');
        root.style.setProperty('--windowHeight', vhCheck().vh - deltaVH + 'px');
        root.style.setProperty(
          '--windowWidth',
          window.innerWidth - getScrollbarWidth() + 'px',
        );
      }
      window_width = window.innerWidth;
      window_height = window.innerHeight;
      isTablet = window_width <= 1100;
      isTablet2 = window_width <= 780;
      isMobile = window_width <= 540;
      window.isTablet = isTablet;
      window.isTablet2 = isTablet2;
      window.isMobile = isMobile;
      document.body.classList[isTablet ? 'add' : 'remove'](
        'isTablet',
        isTablet,
      );
      document.body.classList[isMobile ? 'add' : 'remove'](
        'isMobile',
        isMobile,
      );
      getResponsive();
    },
    { passive: true },
  );
};
