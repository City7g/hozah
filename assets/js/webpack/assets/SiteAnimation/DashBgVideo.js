import SiteAnimation from '../modules/SiteAnimation';

/*
Смотри комметны позначенные как TODO

Если видео не mpd (один файл mp4) - нужно передать data-is-mpd="false" и передавать src в data-desktop-vid и data-mobile-vid, а не в фоллбеки

<div class="video-block js-bg-video" data-is-mpd="true">
  <video loop muted playsinline preload autoplay data-desktop-vid="{{bg.videoSrc}}"
    data-mobile-vid={{bg.mobileVideoSrc}} data-fallback-desktop-vid="{{bg.fallbackSrc}}" data-fallback-mobile-vid="{{bg.fallbackMobileSrc}}" controlsList="nodownload">
  </video>
  <video style="position: absolute; width: 100%; height: 100%; top: 0; left: 0;"></video>
</div>


Команды для конвертации:
0. Установить ffmpeg: для винды - winget install ffmpeg; для мака - ищи тут https://ffmpeg.org/download.html

1. Создание аудиопотока
ffmpeg -i first-screen.mp4 -vn -acodec libvorbis -ab 128k -dash 1 first-screen_audio.webm

2. Конвертация в разные размеры
ffmpeg -i first-screen.mp4 -c:v libvpx-vp9 -keyint_min 150 \
-g 150 -tile-columns 4 -frame-parallel 1 -f webm -dash 1 \
-an -vf scale=320:180 -b:v 500k -dash 1 first-screen_320x180_500k.webm \
-an -vf scale=640:360 -b:v 750k -dash 1 first-screen_640x360_750k.webm \
-an -vf scale=1280:720 -b:v 1500k -dash 1 first-screen_1280x720_1500k.webm \
-an -vf scale=1920:1080 -b:v 3000k -dash 1 first-screen_1920x1080_3000k.webm

3. Создание манифеста
ffmpeg \
  -f webm_dash_manifest -i first-screen_320x180_500k.webm \
  -f webm_dash_manifest -i first-screen_640x360_750k.webm \
  -f webm_dash_manifest -i first-screen_1280x720_1500k.webm \
  -f webm_dash_manifest -i first-screen_1920x1080_3000k.webm \
  -f webm_dash_manifest -i first-screen_audio.webm \
  -c copy \
  -map 0 -map 1 -map 2 -map 3 -map 4 \
  -f webm_dash_manifest \
  -adaptation_sets "id=0,streams=0,1,2,3 id=1,streams=4" \
  first-screen_manifest.mpd


Инструкция: https://developer.mozilla.org/en-US/docs/Web/Media/DASH_Adaptive_Streaming_for_HTML_5_Video#using_dash_-_server_side
*/

export default new (class DashBgVideo extends SiteAnimation {
  init() {
    super.init('DashBgVideo');

    const testEl = document.createElement('video');
    this.webMSupport =
      testEl.canPlayType('video/webm; codecs="vp8, vorbis"') === 'probably';

    this.instances = [...document.querySelectorAll('.js-video')].map(
      (parent, index) => {
        return {
          parent: parent,
          isMpd: parent.dataset.isMpd == 'true',
          video: parent.querySelector('video'),
          videoBg: parent.querySelector('.js-bg-video'),
          flag: {
            state: false,
            index: index,
          },
        };
      },
    );

    if (
      this.instances.length &&
      !document.querySelector('#dashjs') &&
      this.webMSupport
    ) {
      // load /public/dash.all.min.js deferred
      const script = document.createElement('script');

      // TODO: тут нужно поменять хосты на свои
      const frontendHosts = [
        'http://localhost:3000/',
        'https://hydrosat.redlab.site/',
      ];

      const path = frontendHosts.includes(location.href)
        ? '/public/dash.all.min.js' // TODO: файл с либой должен лежать в папке public, так как babel его ломает при прохождении билде
        : '/wp-content/themes/hydrosat/js/dash.all.min.js'; // TODO: на вп файл может быть в другом месте, так как в public его почему-то не видно

      script.src = path;
      script.async = false;
      script.defer = true;
      script.id = 'dashjs';
      document.head.appendChild(script);

      script.onload = () => {
        this.instances.forEach((instance) => {
          setTimeout(() => {
            this.initVideo(instance);
          }, 100);
        });
      };
    } else {
      this.instances.forEach((instance) => {
        setTimeout(() => {
          this.initVideo(instance);
        }, 100);
      });
    }
  }

  initVideo(instance) {
    const { parent, video, videoBg, flag } = instance;

    if (video) {
      this.videoSize(instance);

      const listenersList = ['loadeddata', 'dashInit'];

      listenersList.forEach((listener) => {
        this.addListener(
          video,
          listener,
          () => {
            setTimeout(() => {
              if (!video.paused) {
                videoBg.style.opacity = 1;
                parent.classList.add('playing');
              } else {
                video
                  .play()
                  .then(() => {
                    videoBg.style.opacity = 1;
                    parent.classList.add('playing');
                  })
                  .catch(() => {
                    this.addListener(
                      document,
                      'click',
                      () => {
                        if (video.paused) {
                          video.play();
                          videoBg.style.opacity = 1;
                          parent.classList.add('playing');
                        }
                      },
                      { once: true, passive: true },
                    );

                    this.addListener(
                      document,
                      'touchstart',
                      () => {
                        if (video.paused) {
                          video.play();
                          videoBg.style.opacity = 1;
                          parent.classList.add('playing');
                        }
                      },
                      { once: true, passive: true },
                    );
                  });
              }
            }, 10);
          },
          { once: true, passive: true },
        );
      });

      this.autoPlayVideo(instance);
    }
  }

  autoPlayVideo(instance) {
    const { video, flag } = instance;
    if (video) {
      instance.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !flag.state) {
              this.play(instance);
            } else if (!entry.isIntersecting && flag.state) {
              this.pause(instance);
            }
          });
        },
        {
          root: null,
          rootMargin: '0px',
          threshold: 0.5,
        },
      );

      instance.observer.observe(video);
    }
  }

  addSourceToVideo(element, src) {
    if (element.childNodes && element.childNodes.length) {
      element.removeChild(element.firstChild);
      // element.src = ''
    }

    //element.src = src

    const source = document.createElement('source');
    source.src = src;
    source.type = 'video/mp4';
    element.appendChild(source);
  }

  whichSizeVideo(instance, element, src) {
    let videoSrc = src.dataset.desktopVid;

    if (isTablet && src.dataset.mobileVid) {
      videoSrc = src.dataset.mobileVid;
    }

    if (!this.webMSupport) {
      videoSrc = src.dataset.fallbackDesktopVid;

      if (isTablet && src.dataset.fallbackMobileVid) {
        videoSrc = src.dataset.fallbackMobileVid;
      }
    }

    // console.log(element.closest('.js-bg-video'));
    if (
      element.closest('.js-bg-video').dataset.isMpd != 'true' ||
      !this.webMSupport
    ) {
      this.addSourceToVideo(element, videoSrc);
    } else {
      const player = dashjs.MediaPlayer().create();
      player.initialize(element, videoSrc, true);

      instance.player = player;
    }
  }

  videoSize(instance) {
    const { video } = instance;

    if (video && video !== undefined) {
      this.whichSizeVideo(instance, video, video);
    }
  }

  pause(instance) {
    const { parent, video } = instance;
    video.pause();

    parent.classList.remove('playing');
  }

  async play(instance) {
    const { parent, video } = instance;

    const promise = await video.play();

    if (promise !== undefined) {
      // code here
    } else {
      parent.classList.add('playing');

      this.addListener(
        video,
        'playing',
        () => {
          //console.log('addListener playing', instance);
          if (video.paused) {
            parent.classList.remove('playing');
          } else {
            parent.classList.add('playing');
          }
        },
        { once: true },
      );
    }
  }

  resize() {
    if (this.parent && this.parent.length) {
      //this.videoSize();
    }
  }

  destroy(hardDestroy = false) {
    if (this.instances && this.instances.length) {
      this.instances.forEach((instance) => {
        const { observer, player } = instance;

        if (player) {
          player.destroy();
        }

        if (observer) {
          observer.disconnect();
        }
      });
    }

    super.destroy(hardDestroy);
  }
})();
