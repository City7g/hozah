import videojs from 'video.js';
import 'videojs-youtube';
import '@devmobiliza/videojs-vimeo/dist/videojs-vimeo.esm';

const youtubeReg =
  /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?([a-zA-Z0-9_-]{11})/;
const vimeoReg =
  /(?:https?:\/\/)?(?:www\.)?(?:vimeo\.com)\/(?:channels\/\w+\/)?(\d+)/;

export default class VideoIn {
  constructor() {
    this.bundleLink = 'https://vjs.zencdn.net/8.3.0/video.min.js';
    this.bundleLinkStyle = 'https://vjs.zencdn.net/8.3.0/video-js.css';
    //
    this.loadedStyle = false;
    //
    this.techOrder = ['html5', 'youtube', 'Vimeo'];
    //videos
    this.videos = [];
    this.modalVideo = null;

    this.delay = 300;
  }

  setSource(src) {
    if (!src) return [];
    if (src.match(youtubeReg)) {
      return [
        {
          src,
          type: 'video/youtube',
        },
      ];
    } else if (src.match(vimeoReg)) {
      return [
        {
          src,
          type: 'video/vimeo',
        },
      ];
    } else {
      return [
        {
          src,
          type: 'video/mp4',
        },
      ];
    }
  }

  loadStyle() {
    try {
      const isLoaded =
        document.querySelector(
          `link[rel="stylesheet"][href="${this.bundleLinkStyle}"]`,
        ) || null;
      if (!isLoaded) {
        const elem =
          document.querySelector(
            '.video-player[data-role="video-player-box"]',
          ) || null;
        if (!elem || this.loadedStyle) return null;
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = this.bundleLinkStyle;
        link.id = 'videoJs-style';
        document.head.append(link);
        this.loadedStyle = true;
      } else {
        this.loadedStyle = true;
      }
    } catch (e) {
      console.log(e);
    }
  }

  initialize = (elem) => {
    try {
      const poster = elem.querySelector('img.poster') || null;
      const btn = elem.querySelector('button.play') || null;
      const player = elem.querySelector('video.video-js');
      if (!player) throw Error('player not found');
      elem.classList.add('loading');

      const readyFunc = () => {
        setTimeout(() => {
          elem.classList.remove('loading');
          if (poster) poster.classList.add('hide');
          if (btn) btn.classList.add('hide');
          initPlayer.autoplay('muted');
          // initPlayer.fluid('true');
          initPlayer.off('ready', readyFunc);
          elem.classList.add('playing');
        }, this.delay);
      };

      const src = player.src;
      const initPlayer = videojs(
        player,
        {
          autoplay: false,
          controls: true,
          youtube: { iv_load_policy: 1 },
          techOrder: this.techOrder,
          sources: this.setSource(src),
          bigPlayButton: false,
          controlBar: {
            fullscreenToggle: false,
            pictureInPictureToggle: false,
          },
          userActions: {
            doubleClick: false,
          },
        },
        () => {
          initPlayer.on('ready', readyFunc);
        },
      );
      const isVideoInPopup = elem.dataset.videoPopup || null;
      if (isVideoInPopup) {
        this.modalVideo = initPlayer;
      } else {
        this.videos.push(initPlayer);
      }
    } catch (e) {
      console.log(e);
    }
  };

  click = (e) => {
    try {
      const targ = e.target.closest('[data-role="initPlayer"]');
      if (targ)
        return this.initialize(targ.closest('[data-role="video-player-box"]'));
    } catch (e) {
      console.log(e);
    }
  };

  init() {
    try {
      this.loadStyle();
      document.addEventListener('click', this.click);
      document.addEventListener('close-popup-video', this.destoyPopUpVideo);
    } catch (e) {
      console.log(e);
    }
  }

  destoyPopUpVideo = () => {
    try {
      if (!this.modalVideo) throw Error('video not found');
      this.modalVideo.pause();
      this.modalVideo.dispose();
      this.modalVideo = null;
    } catch (e) {
      console.log(e);
    }
  };

  destroy() {
    document.removeEventListener('click', this.click);
    document.removeEventListener('close-popup-video', this.destoyPopUpVideo);
    if (this.videos.length) {
      this.videos.forEach((player) => {
        player.dispose();
      });
      this.videos = [];
    }
    if (this.modalVideo) {
      this.modalVideo.dispose();
      this.modalVideo = null;
    }
  }
}

const VIDEOIn = new VideoIn();
VIDEOIn.init();

if (LOADED_SCRIPTS_PACK) LOADED_SCRIPTS_PACK.push(VIDEOIn);
