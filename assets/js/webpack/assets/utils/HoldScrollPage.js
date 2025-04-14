import { hideScrollBar } from './functions';
let ts;
let HoldScrollPageState = false;
document.addEventListener('touchstart', function (e) {
  ts = e.touches[0].clientY;
});
function preventDefault(e) {
  e = e || window.event;

  var area;
  if (e.target.closest('.mobileRow')) {
    area = e.target.closest('.mobileRow');
  } else if (e.target.closest('.menuRowInner')) {
    area = e.target.closest('.menuRowInner');
  } else if (e.target.closest('.modal-inner-second')) {
    area = e.target.closest('.modal-inner-second');
  } else if (e.target.closest('.modal-inner')) {
    area = e.target.closest('.modal-inner');
  } else if (e.target.closest('.allow-scroll')) {
    area = e.target.closest('.allow-scroll');
  } else {
    area = e.target;
  }

  var parentPopup = (() => {
    if (
      e.target.classList.contains('popupContent') ||
      e.target.classList.contains('modal-inner') ||
      e.target.classList.contains('modal-inner-second')
    )
      return true;

    let target = e.target;
    let closestMatch = null;

    while (target !== null) {
      if (
        target.matches(
          '.mobileRow, .menuRowInner, .modal-inner, .modal-inner-second',
        )
      ) {
        closestMatch = target;
        break;
      }
      target = target.parentElement;
    }
    return closestMatch !== null ? 1 : 0;
  })();

  if (!parentPopup) {
    e.preventDefault();
    e.returnValue = false;
    return false;
  }
  var delta = e.deltaY || e.detail || e.wheelDelta;
  if (e.type == 'touchmove') {
    var tob = e.changedTouches[0]; // reference first touch point for this event
    var offset = parseInt(tob.clientY);
    if (ts < offset - 5) {
      delta = -100;
    } else if (ts > offset + 5) {
      delta = 100;
    }
  }

  if (delta <= 0 && area.scrollTop <= 0) {
    e.preventDefault();
  }
  if (
    delta > 0 &&
    area.scrollHeight - area.clientHeight - area.scrollTop <= 1
  ) {
    e.preventDefault();
  }
}

function holdScroll(e) {
  e = e || window.event;
  if (e.preventDefault) e.preventDefault();
  e.returnValue = false;
  return false;
}

const HoldAllScrollPage = (fix = false) => {
  HoldScrollPagePosition(fix);
  if (fix) {
    window.addEventListener('wheel', holdScroll, { passive: false });
    window.addEventListener('DOMMouseScroll', holdScroll, { passive: false });
    document.addEventListener('touchmove', holdScroll, { passive: false });
  } else {
    window.removeEventListener('wheel', holdScroll, { passive: false });
    window.removeEventListener('DOMMouseScroll', holdScroll, {
      passive: false,
    });
    document.removeEventListener('touchmove', holdScroll, { passive: false });
  }
};

const HoldScrollPage = (fix = false, holdBar = false) => {
  HoldScrollPageState = fix;
  window.HoldScrollPageState = fix;
  HoldScrollPagePosition(fix);
  window.dispatchEvent(
    new CustomEvent('HoldScrollPage', { detail: { fix, holdBar } }),
  );
  if (fix) {
    window.addEventListener('wheel', preventDefault, { passive: false });
    window.addEventListener('DOMMouseScroll', preventDefault, {
      passive: false,
    });
    document.addEventListener('touchmove', preventDefault, { passive: false });
    // $(document).on("touchmove", preventDefault)
    if (holdBar) hideScrollBar(true);
  } else {
    window.removeEventListener('wheel', preventDefault, { passive: false });
    window.removeEventListener('DOMMouseScroll', preventDefault, {
      passive: false,
    });
    document.removeEventListener('touchmove', preventDefault, {
      passive: false,
    });
    hideScrollBar(false);
  }
};
const HoldScrollPagePosition = (fix = false) => {
  if (window.lenis) lenis[fix ? 'stop' : 'start']();
};

export { HoldAllScrollPage, HoldScrollPage, HoldScrollPageState };
