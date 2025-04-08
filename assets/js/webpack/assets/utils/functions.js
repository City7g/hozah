import device from 'current-device';
import CheckResize from './CheckResize';
import gsap, { Power2 } from 'gsap';

/**
 * Adds a leading zero to a number if it is less than 10.
 *
 * @param {number} index - The number to add a leading zero to.
 * @returns {string} The number with a leading zero if necessary.
 */
function prefix(index) {
  return index < 10 ? '0' + index : index;
}

/**
 * Scrolls to a specified position on the page.
 *
 * @param {number} scrollTop - The vertical scroll position to scroll to.
 * @param {number} [duration=1] - The duration of the scroll animation in seconds. Default is 1 second.
 * @param {string} [block='body, html'] - The element(s) to scroll. Default is 'body, html'.
 */
function scrollToPos(scrollTop, duration = 1, block = 'body, html') {
  if (window.lenis) {
    lenis.scrollTo(scrollTop, { duration: duration * 2 });
  } else {
    gsap.to(block, {
      scrollTop: scrollTop,
      ease: Power2.easeInOut,
      duration,
    });
  }
}

/**
 * Calculates the offset position of an element relative to the document or viewport.
 *
 * @param {Element} elem - The element to calculate the offset for.
 * @param {boolean} [getRect=false] - Whether to return the detailed rectangle information.
 * @returns {Object} - The offset position of the element.
 */
const offset = (elem, getRect = false) => {
  // Check if the element exists
  if (!elem) return;

  // Get the element's rectangle relative to the viewport
  const rect = elem.getBoundingClientRect();

  // Get the document window
  const win = elem.ownerDocument.defaultView || window;

  // If the element is not displayed (display: none) or not attached to the document
  if (!rect.width && !rect.height) {
    return { top: 0, left: 0 };
  }

  // Return the element's rectangle taking into account the page scroll
  if (getRect) {
    return {
      width: rect.width,
      height: rect.height,
      top: rect.top + win.pageYOffset,
      left: rect.left + win.pageXOffset,
    };
  }

  return {
    top: rect.top + win.pageYOffset,
    left: rect.left + win.pageXOffset,
  };
};

/**
 * Initializes a throttle timer that delays the execution of a callback function.
 * @returns {Object} An object with `init` and `clear` methods.
 */
const initThrottle = () => {
  let throttleTimer;
  return {
    /**
     * Initializes the throttle timer with the specified callback function and time delay.
     * @param {Function} callback - The callback function to be executed after the time delay.
     * @param {number} time - The time delay in milliseconds.
     */
    init: (callback, time) => {
      if (throttleTimer) {
        clearTimeout(throttleTimer);
      }
      throttleTimer = setTimeout(() => {
        callback();
        throttleTimer = null;
      }, time);
    },
    /**
     * Clears the throttle timer, preventing the execution of the callback function.
     */
    clear: () => {
      if (throttleTimer) {
        clearTimeout(throttleTimer);
        throttleTimer = null;
      }
    },
  };
};

/**
 * Converts a value from pixels to rem units.
 * @param {number} val - The value to be converted to rem units.
 * @param {boolean} [returnRem=false] - Whether to return the value in rem units or not.
 * @returns {number|string} - The converted value in rem units, or the value in pixels if `returnRem` is `false`.
 */
const toRem = (val, returnRem = false) => {
  const rem = val / 16;
  if (returnRem) return rem + 'rem';
  return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
};

/**
 * Generates a random integer between the specified minimum and maximum values.
 *
 * @param {number} min - The minimum value.
 * @param {number} max - The maximum value.
 * @returns {number} The random integer.
 */
const rnd = (min, max) => {
  var rand = min - 0.5 + Math.random() * (max - min + 1);
  rand = Math.round(rand);
  return rand;
};

/**
 * Retrieves the value of a CSS style property for a given element.
 *
 * @param {HTMLElement} el - The element to retrieve the style from.
 * @param {string} styleProp - The CSS style property to retrieve.
 * @param {boolean} [parse=false] - Indicates whether to parse the value as a float.
 * @returns {string|number} The value of the specified CSS style property.
 */
const getStyle = (el, styleProp, parse = false) => {
  const style = el.currentStyle || window.getComputedStyle(el);
  if (parse) return parseFloat(style[styleProp]);
  return style[styleProp];
};

/**
 * Calculates the width of the scrollbar in the current browser.
 * @returns {number} The width of the scrollbar in pixels.
 */
function getScrollbarWidth() {
  // Creating invisible container
  const outer = document.createElement('div');
  outer.style.visibility = 'hidden';
  outer.style.overflow = 'scroll'; // forcing scrollbar to appear
  outer.style.msOverflowStyle = 'scrollbar'; // needed for WinJS apps
  document.body.appendChild(outer);
  // Creating inner element and placing it in the container
  const inner = document.createElement('div');
  outer.appendChild(inner);
  // Calculating difference between container's full width and the child width
  const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
  // Removing temporary elements from the DOM
  outer.parentNode.removeChild(outer);
  return scrollbarWidth;
}

/**
 * Defines and returns an object containing various boolean properties related to the user's device and browser.
 * @returns {Object} An object with the following properties:
 *   - isIpad: A boolean indicating whether the user is using an iPad.
 *   - isMacLike: A boolean indicating whether the user is using a Mac-like device (Mac, iPhone, iPod, iPad).
 *   - isSafari: A boolean indicating whether the user is using Safari browser.
 *   - isFirefox: A boolean indicating whether the user is using Firefox browser.
 *   - isIOS: A boolean indicating whether the user is using an iOS device (iPhone, iPod, iPad).
 *   - mobile: A boolean indicating whether the user is on a mobile device.
 *   - tablet: A boolean indicating whether the user is on a tablet device.
 *   - mobileDevice: A boolean indicating whether the user is on a mobile or tablet device.
 */
const defineParams = (() => {
  const isIpad =
    navigator.maxTouchPoints &&
    navigator.maxTouchPoints > 2 &&
    /MacIntel/.test(navigator.platform);
  const isMacLike = navigator.platform.match(/(Mac|iPhone|iPod|iPad)/i)
    ? true
    : false || isIpad;

  // eslint-disable-next-line no-useless-escape
  const isSafari = !!navigator.userAgent.match(/Version\/[\d\.]+.*Safari/);
  const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
  const isIOS = navigator.platform.match(/(iPhone|iPod|iPad)/i)
    ? true
    : false || isIpad;
  const mobile = device.mobile() || isIpad || device.tablet() || isIOS;
  const tablet = device.tablet() || isIpad;
  const mobileDevice = mobile || tablet || isIOS;
  return {
    isIpad,
    isMacLike,
    isSafari,
    isFirefox,
    isIOS,
    mobile,
    tablet,
    mobileDevice,
  };
})();

/**
 * Checks if the current page is the WordPress admin page.
 * @returns {boolean} Returns true if the current page is the WordPress admin page, otherwise returns false.
 */
const isWpAdmin = () =>
  window.location.href.includes('/wp-admin/') ||
  !!document.querySelector('#wpbody-content .editor-styles-wrapper');

// SLIDE UP AND DOWN
const PADDING_TOP_ATTRIBUTE = 'data-padding-top';
const PADDING_BOTTOM_ATTRIBUTE = 'data-padding-bottom';

/**
 * Replicates jQuery's slideDown - Display the element with a sliding motion.
 * Assumes the element is hidden with display: none;
 *
 * @params { DOMElement }
 * @params { Number } in seconds, so 0.3 is 300ms
 */
const slideDown = (element, duration = 0.3) => {
  element.style.display = 'block';
  element.style.height = 'auto';
  element.style.overflow = 'hidden';

  const paddingTop = getPaddingTop(element);
  const paddingBottom = getPaddingBottom(element);
  const targetHeight = element.offsetHeight;

  element.style.paddingTop = 0;
  element.style.paddingBottom = 0;
  element.style.height = 0;

  gsap.to(element, {
    height: targetHeight,
    paddingTop: paddingTop,
    paddingBottom: paddingBottom,
    overwrite: 'auto',
    duration: duration,
    ease: 'power1.out',
    onComplete: () => {
      element.style.removeProperty('padding-top');
      element.style.removeProperty('padding-bottom');
      element.style.removeProperty('height');
    },
  });
};

/**
 * Set the padding top for reference on the element in case a slideUp is toggled before the animation has been completed
 *
 * @params { DOMElement }
 *
 * @returns { Number }
 */
const getPaddingTop = (element) => {
  if (element.getAttribute(PADDING_TOP_ATTRIBUTE)) {
    return parseFloat(element.getAttribute(PADDING_TOP_ATTRIBUTE));
  } else {
    return parseFloat(
      setAndGetAttribute(
        element,
        PADDING_TOP_ATTRIBUTE,
        parseFloat(getComputedStyle(element).paddingTop),
      ),
    );
  }
};

/**
 * Set the padding bottom for reference on the element in case a slideUp is toggled before the animation has been completed
 *
 * @params { DOMElement }
 *
 * @returns { Number }
 */
const getPaddingBottom = (element) => {
  if (element.getAttribute(PADDING_BOTTOM_ATTRIBUTE)) {
    return parseFloat(element.getAttribute(PADDING_BOTTOM_ATTRIBUTE));
  } else {
    return parseFloat(
      setAndGetAttribute(
        element,
        PADDING_BOTTOM_ATTRIBUTE,
        parseFloat(getComputedStyle(element).paddingBottom),
      ),
    );
  }
};

/**
 * Set and get an attribute on an element
 *
 * @param { DOMElement }
 * @param { String }
 * @param { String }
 *
 * @returns { String }
 */
const setAndGetAttribute = (element, attribute, value) => {
  element.setAttribute(attribute, value);
  return element.getAttribute(attribute);
};

/**
 * Replicates jQuery's slideUp - Hide the element with a sliding motion.
 *
 * @params { DOMElement }
 * @params { Number } in seconds, so 0.3 is 300ms
 */
const slideUp = (element, duration = 0.3) => {
  const paddingTop = getPaddingTop(element);
  const paddingBottom = getPaddingBottom(element);
  gsap.to(element, {
    height: 0,
    paddingTop: 0,
    paddingBottom: 0,
    overwrite: 'auto',
    duration: duration,
    ease: 'power1.in',
    onComplete: () => onSlideUpComplete(element, paddingTop, paddingBottom),
  });
};

/**
 * Replicates jQuery's slideToggle - Hide/Show the element with a sliding motion.
 *
 * @params { DOMElement }
 * @params { Number } in seconds, so 0.3 is 300ms
 */
const slideToggle = (element, duration = 0.3) => {
  if (element.offsetHeight === 0) {
    slideDown(element, duration);
  } else {
    slideUp(element, duration);
  }
};

/**
 * Revert to it's original state
 *
 * @params { DOMElement }
 * @params { Number }
 * @params { Number }
 */
const onSlideUpComplete = (element, paddingTop, paddingBottom) => {
  element.style.display = 'none';
  element.style.height = 'auto';
  element.style.paddingTop = `${paddingTop}px`;
  element.style.paddingBottom = `${paddingBottom}px`;
  element.removeAttribute(PADDING_TOP_ATTRIBUTE);
  element.removeAttribute(PADDING_BOTTOM_ATTRIBUTE);
};

/**
 * Fixes the page hero screen by adding the 'pageHeroScreen' class to all sections except for '#pageStyleBoxes' and '.pageHeroScreen'.
 */
const fixPageHeroScreen = () => {
  // add class for sections
  [
    ...document.querySelectorAll(
      '#wrapper > *:not(#pageStyleBoxes):not(.pageHeroScreen)',
    ),
  ].forEach((el) => {
    el.classList.add('pageHeroScreen');
  });
};

/**
 * Retrieves the current page scroll position.
 * @returns {number} The page scroll position.
 */
const getPageScroll = () => {
  if (window.lenis) return window.lenis.scroll;
  return window.scrollY || window.pageYOffset;
};

/**
 * Generates a unique ID.
 *
 * @returns {string} The generated ID.
 */
const generateID = () => {
  return Math.random().toString(36).substring(2, 9);
};

// rtl detect function
function isRTL() {
  return document.documentElement.getAttribute('dir') === 'rtl';
}

async function scrollNextSection(id, findSection, centered = false) {
  let nextSection;
  if (findSection && document.querySelector(findSection)) {
    nextSection = document.querySelector(findSection);
  } else {
    const currentSection =
      document.getElementById(id) || document.querySelector(id);
    if (!currentSection) return;
    nextSection = currentSection.nextElementSibling;
  }
  if (!nextSection) return;

  const pageStyleBoxes = nextSection.closest('#pageStyleBoxes');
  if (
    pageStyleBoxes &&
    pageStyleBoxes.getAttribute('data-style-loaded') === 'false'
  ) {
    await OBSERVER_LOADERS[0].loadStylesFromDataHref(pageStyleBoxes); // load style
  }

  const top = (() => {
    if (centered) {
      const { top, height } = offset(nextSection, true);
      if (height < window.innerHeight) {
        // return top
        return top + height / 2 - window.innerHeight / 2;
      }
    }
    return offset(nextSection).top;
  })();

  if (nextSection) scrollToPos(top);
}

async function checkLoadPageStyleBoxes() {
  const pageStyleBoxes = document.getElementById('pageStyleBoxes');
  if (
    pageStyleBoxes &&
    pageStyleBoxes.getAttribute('data-style-loaded') === 'false'
  ) {
    await OBSERVER_LOADERS[0].loadStylesFromDataHref(pageStyleBoxes); // load style
  }
  return true;
}

function hideScrollBar(hide = true) {
  const root = document.documentElement;
  if (hide) {
    const padding = getScrollbarWidth();
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.paddingRight = padding + 'px';
    root.style.setProperty('--hideScrollBarPadding', padding + 'px');
  } else {
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    document.documentElement.style.paddingRight = '';

    root.style.setProperty('--hideScrollBarPadding', '0px');
  }
}

export {
  scrollToPos,
  initThrottle,
  toRem,
  rnd,
  defineParams,
  CheckResize,
  getScrollbarWidth,
  prefix,
  getStyle,
  offset,
  isWpAdmin,
  slideUp,
  slideDown,
  slideToggle,
  fixPageHeroScreen,
  getPageScroll,
  generateID,
  isRTL,
  hideScrollBar,
  scrollNextSection,
  checkLoadPageStyleBoxes,
};
