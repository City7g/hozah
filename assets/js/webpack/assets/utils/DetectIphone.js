export default new (class DetectIphone {
  constructor() {
    if (this.isIphone()) {
      document
        .querySelector('body')
        .classList.add('iphone_model_' + this.iPhoneVersion());
    }
  }
  isIphone() {
    return !!navigator.userAgent.match(/iPhone/i);
  }
  iPhoneVersion() {
    var iHeight = window.screen.height;
    var iWidth = window.screen.width;

    if (iWidth === 414 && iHeight === 896) {
      return 'Xmax-Xr';
    } else if (iWidth === 375 && iHeight === 812) {
      return 'X-Xs';
    } else if (iWidth === 320 && iHeight === 480) {
      return '4';
    } else if (iWidth === 375 && iHeight === 667) {
      return '6';
    } else if (iWidth === 414 && iHeight === 736) {
      return '6+';
    } else if (iWidth === 320 && iHeight === 568) {
      return '5';
    } else if (iHeight <= 480) {
      return '2-3';
    }
    return 'none';
  }
})();
