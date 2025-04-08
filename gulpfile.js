const argv = require('yargs').argv;
const path = require('path');
const chokidar = require('chokidar');
const mime = require('mime-types');

// default
const cliProgress = require('cli-progress');
const getFilesFunc = require('./modules/getFilesNode.js');
const fs = require('fs');

const { getFiles, deleteFolderRecursive } = getFilesFunc;
// gulp
const { src, dest, series, parallel, watch, lastRun } = require('gulp');
const cleanCSS = require('gulp-clean-css');
const notify = require('gulp-notify');
const sass = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const babel = require('gulp-babel');
const minify = require('gulp-babel-minify');
const rename = require('gulp-rename');
const imageResize = require('gulp-image-resize');
const compress_images = require('compress-images');
const plumber = require('gulp-plumber');
const include = require('gulp-include');
const imagemin = require('gulp-imagemin');
const browserSync = require('browser-sync').create();
const cache = require('gulp-cache');
const clean = require('gulp-clean');
const gulpWebp = require('gulp-webp');
const cheerio = require('gulp-cheerio');
const svgSprite = require('gulp-svg-sprite');
const replace = require('gulp-replace');
const sassGlob = require('gulp-sass-glob');

let prod = false;
const noWebp = argv.noWebp;

let webpBar;
const setWebpCompressProgress = ({
  totalFilesCount,
  transferredFileCount,
  filename,
}) => {
  if (webpBar) {
    // update bar
    webpBar.update(transferredFileCount, { filename });
  } else {
    // create bar
    webpBar = new cliProgress.SingleBar(
      {
        hideCursor: true,
        format:
          'Create WEBP |' +
          '{bar}' +
          '| {percentage}% | {value}/{total} files | ETA: {eta}s',
      },
      cliProgress.Presets.shades_classic,
    );
    webpBar.start(totalFilesCount, transferredFileCount);
  }
  if (totalFilesCount === transferredFileCount) webpBar.stop();
};

function getFilesFromDir(directory) {
  if (!fs.existsSync(directory)) return [];
  const files = fs.readdirSync(directory);
  return files.filter((file) => {
    return file.endsWith('.scss');
  });
}

function parseFilePath(filePath, replace = 'assets/img') {
  const parsedPath = path.parse(filePath);

  const folder = parsedPath.dir.replace(replace, '').trim().replace(/^\//, '');
  const fileName = parsedPath.name;
  const fileExtension = parsedPath.ext;
  // get MIME type
  const mimeType = mime.lookup(filePath);

  return { folder, fileName, fileExtension, parsedPath, mimeType };
}

const singleModuleDir = './assets/css/scss/modules/single/';
const pageModuleDir = './assets/css/scss/modules/page/';
const componentsDir = './assets/css/scss/components/';
const sectionsDir = './assets/css/scss/sections/';
const singleStyleLayout = './assets/css/scss/compileSingleStyle.scss';
const tempCssDir = './assets/css/scss/temp';

const singleModuleFiles = getFilesFromDir(singleModuleDir);
const pageModuleFiles = getFilesFromDir(pageModuleDir);
const componentsFiles = getFilesFromDir(componentsDir);
const sectionsFiles = getFilesFromDir(sectionsDir);

console.log('sectionsFiles', sectionsFiles);

const criticalCssFile = {
  path: './assets/css/scss/vendors.scss',
  reName: 'critical',
  endpoint: 'src/css/',
};
const allComponentsCssFile = {
  path: './assets/css/scss/allComponents.scss',
  reName: 'allComponents',
  endpoint: 'src/css/',
};
const pagesListCssFile = {
  path: './assets/css/scss/pagesList.scss',
  reName: 'pagesList',
  endpoint: 'src/css/',
};

const RecompilerStyleFiles = [
  ...singleModuleFiles.map((file) => ({
    path: singleModuleDir + file,
    reName: file.replace('.scss', ''),
    endpoint: 'src/css/single/',
  })),
  ...pageModuleFiles.map((file) => ({
    path: pageModuleDir + file,
    reName: file.replace('.scss', ''),
    endpoint: 'src/css/pages/',
  })),
  criticalCssFile,
  allComponentsCssFile,
  pagesListCssFile,
];

const sectionStylesObj = {};

const ComponentsStyleFiles = [
  ...componentsFiles.map((file) => ({
    path: componentsDir + file,
    reName: file.replace(/^_|\.scss$/g, ''),
    endpoint: 'src/css/components/',
    name: file,
  })),
  ...sectionsFiles.map((file) => ({
    path: sectionsDir + file,
    reName: file.replace(/^_|\.scss$/g, ''),
    endpoint: 'src/css/sections/',
    name: file,
  })),
];

function RecompillerStyle({ path, reName, endpoint }, cb = () => {}) {
  let style = src(path)
    .pipe(sassGlob())
    .pipe(
      plumber({
        errorHandler: notify.onError('Error: <%= error.message %>'),
      }),
    )
    .pipe(sass())
    .pipe(rename(`${reName}.css`))
    .pipe(
      autoprefixer({
        overrideBrowserslist: ['last 20 versions'],
        cascade: false,
      }),
    );
  if (!prod) {
    style.pipe(
      cleanCSS({
        compatibility: '*',
        level: 2,
        format: 'beautify',
      }),
    );
  }
  if (prod) {
    style.pipe(
      cleanCSS({
        compatibility: '*',
      }),
    );
  }
  style.pipe(dest(endpoint));
  cb(style);
  return style;
}
// Recompiler styles
function recompileStyles() {
  const tasks = RecompilerStyleFiles.map((item) => {
    return function () {
      return RecompillerStyle(item);
    };
  });
  return series(...tasks);
}
// build single styles
async function buildSingleStyles(cb, name) {
  const regex = /^_/;
  const layout = fs.readFileSync(singleStyleLayout, 'utf8');

  // create temp dir
  !fs.existsSync(tempCssDir) ? fs.mkdirSync(tempCssDir) : null;

  const tasks = ComponentsStyleFiles.map((item) => {
    const { name } = item;

    sectionStylesObj[name.replace(regex, '').replace('.scss', '')] =
      'sections/' + name.replace(regex, '').replace('.scss', '.css');

    const file = fs.readFileSync(item.path, 'utf8');
    const newFile = `${tempCssDir}/${name.replace(regex, '')}`;
    if (regex.test(name)) {
      fs.writeFileSync(newFile, layout + file);
    } else {
      fs.writeFileSync(newFile, file);
    }
    item.path = newFile;
    return new Promise((resolve) => {
      RecompillerStyle(item, resolve);
    });
  });
  await Promise.all(tasks);
  // deleteFolderRecursive(tempCssDir);
  cb();
}

//js libs
function jsLibs() {
  let pipe = src('./assets/js/libs.js')
    .pipe(
      plumber({
        errorHandler: notify.onError('Error: <%= error.message %>'),
      }),
    )
    .pipe(include());

  if (prod) {
    pipe = pipe.pipe(
      minify({
        mangle: {
          keepClassName: true,
        },
      }),
    );
  }

  return pipe.pipe(rename('libs.js')).pipe(dest('src/js/'));
}

function js() {
  let pipe = src('./assets/js/app.js')
    .pipe(
      plumber({
        errorHandler: notify.onError('Error: <%= error.message %>'),
      }),
    )
    .pipe(include({ extensions: 'js' }))
    .pipe(rename('script.js'));

  if (prod) {
    pipe = pipe
      .pipe(
        babel({
          presets: [
            [
              '@babel/env',
              {
                targets: {
                  browsers: ['> 1%', 'last 2 versions', 'safari >= 11'],
                },
              },
            ],
          ],
        }),
      )
      .pipe(
        minify({
          mangle: {
            keepClassName: true,
          },
        }),
      );
  }

  return pipe.pipe(dest('src/js/'));
}

function copyWebpackJS() {
  return src('assets/js/webpack/dist/**/*').pipe(dest('src/js/'));
}

function copyPublic() {
  return src('assets/public/**/*').pipe(dest('src/public/'));
}

// copyImg
async function copyImg() {
  const compress = async (list, index) => {
    const file = list[index];
    // const { folder } = parseFilePath(file, 'src/img');
    // // const newPath = 'src/img/' + folder + '/';
    // const newPath = `src/img/${folder}/`.replace(/\/\/$/, '/'); // replace //
    const { folder } = parseFilePath(file);
    const newPath = folder;

    // await webp(file, newPath, false);

    await webpCreate(file, newPath);
    setWebpCompressProgress({
      totalFilesCount: list.length,
      transferredFileCount: index + 1,
      filename: file,
    });
    if (index + 1 < list.length) await compress(list, index + 1);
  };
  const quality = 75;
  const optimizationLevel = 5;
  await new Promise((resolve, reject) => {
    let pipe;
    if (prod) {
      pipe = src(['./assets/img/**/*']).pipe(
        cache(
          imagemin([
            imagemin.gifsicle({ interlaced: true }),
            imagemin.mozjpeg({ quality, progressive: true }),
            imagemin.optipng({ optimizationLevel }),
            imagemin.svgo({
              plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
            }),
          ]),
        ),
      );
    } else {
      pipe = src(['./assets/img/**/*']);
    }
    pipe.pipe(dest('src/img/')).on('end', async () => {
      const files = getFiles('src/img/**/*.{jpg,JPG,jpeg,JPEG,png}');
      webpBar = null;
      if (!noWebp) await compress(files, 0);
      resolve();
    });
  });
  // await new Promise((resolve, reject) => {
  //   let pipe_medium;
  //   if (prod) {
  //     pipe_medium = src(['./assets/img/**/*.{jpg,JPG,jpeg,JPEG,png}'])
  //       .pipe(
  //         imageResize({
  //           width: 640, // image width
  //           height: 400, // image height
  //           crop: false, // do not crop the image to the specified dimensions
  //           upscale: false, // do not upscale the image if it is smaller than the specified dimensions
  //         }),
  //       )
  //       .pipe(
  //         cache(
  //           imagemin([
  //             imagemin.gifsicle({ interlaced: true }),
  //             imagemin.mozjpeg({ quality, progressive: true }),
  //             imagemin.optipng({ optimizationLevel }),
  //             imagemin.svgo({
  //               plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
  //             }),
  //           ]),
  //         ),
  //       )
  //       .pipe(
  //         rename(function (path) {
  //           const regex = /@\d*x/;
  //           if (regex.test(path.basename)) {
  //             path.basename = path.basename.replace(regex, '_medium$&');
  //           } else {
  //             path.basename += '_medium';
  //           }
  //         }),
  //       );
  //   } else {
  //     pipe_medium = src(['./assets/img/**/*.{jpg,JPG,jpeg,JPEG,png}'])
  //       .pipe(
  //         imageResize({
  //           width: 640, // image width
  //           height: 400, // image height
  //           crop: false, // do not crop the image to the specified dimensions
  //           upscale: false, // do not upscale the image if it is smaller than the specified dimensions
  //         }),
  //       )
  //       .pipe(
  //         rename(function (path) {
  //           const regex = /@\d*x/;
  //           if (regex.test(path.basename)) {
  //             path.basename = path.basename.replace(regex, '_medium$&');
  //           } else {
  //             path.basename += '_medium';
  //           }
  //         }),
  //       );
  //   }

  //   pipe_medium.pipe(dest('src/img/')).on('end', async () => {
  //     const files = getFiles('src/img/**/*.{jpg,JPG,jpeg,JPEG,png}');
  //     webpBar = null;
  //     await compress(files, 0);
  //     resolve();
  //   });
  // });
}
function spriteSvg() {
  return (
    src('./assets/img/spriteSvg/**/*.svg')
      .pipe(plumber())
      .pipe(
        cheerio({
          run: function ($) {
            $('[fill]').removeAttr('fill');
            $('[stroke]').removeAttr('stroke');
            $('[style]').removeAttr('style');
          },
          parserOptions: { xmlMode: true },
        }),
      )
      // cheerio plugin create unnecessary string '&gt;', so replace it.
      .pipe(replace('&gt;', '>'))
      // build svg sprite
      .pipe(
        svgSprite({
          mode: {
            symbol: true,
          },
        }),
      )
      .pipe(dest('assets/img'))
  );
}

function moveSpriteSvg() {
  return src('./assets/img/symbol/svg/sprite.symbol.svg').pipe(dest('src/img'));
}

async function webpCreate(
  path = './assets/img/**/*.{jpg,JPG,jpeg,JPEG,png}',
  newPath = 'src/img/',
) {
  return await new Promise((resolve, reject) => {
    const pipe = src(path)
      .pipe(gulpWebp({ quality: 90 }))
      .pipe(dest(newPath))
      .on('end', () => {
        resolve();
      });
  });
}

// fonts
function fonts() {
  return src('./assets/fonts/**/*')
    .pipe(dest('src/fonts'))
    .on('end', browserSync.reload);
}

function flagProd(cb) {
  prod = true;
  cb();
}

function clear() {
  !fs.existsSync('src/') ? fs.mkdirSync('src/') : '';
  return src('src/').pipe(clean());
}
function buildSingleStylesFixClear(cb) {
  fs.writeFileSync(
    './src/css/sectionStyles.json',
    JSON.stringify(sectionStylesObj, null, 4),
  );

  return deleteFolderRecursive(tempCssDir), cb();
}

async function webp(
  INPUT_path_to_your_images,
  OUTPUT_path,
  statistic = false,
  callBack = () => {},
  compress_force = false,
) {
  return new Promise((resolve, reject) => {
    compress_images(
      INPUT_path_to_your_images,
      OUTPUT_path,
      {
        compress_force,
        statistic: statistic,
        autoupdate: true,
      },
      false,
      { jpg: { engine: 'webp', command: ['-q', '95'] } },
      { png: { engine: 'webp', command: ['-q', '95'] } },
      { svg: { engine: 'svgo', command: false } },
      { gif: { engine: false, command: false } },
      function (err) {
        if (err === null) {
          callBack();
          resolve();
        } else {
          console.error(err);
        }
      },
    );
  });
}

function cacheClear() {
  return cache.clearAll();
}

function serve() {
  browserSync.init({
    proxy: 'localhost:5001',
    port: 3000,
    notify: true,
    browser: 'chrome',
    // files: ['./src/**/*'],
    injectChanges: false,
  });

  watch([
    './assets/css/scss/**/*.scss',
    // '!./assets/css/scss/vendors.scss',
    // './assets/css/scss/_vars.scss',
    // './assets/css/scss/_mixins.scss',
    // './assets/css/scss/_fonts.scss',
    // './assets/css/scss/_headline.scss',
    // './assets/css/scss/_grid.scss',
    // './assets/css/scss/_style.scss',
    // './assets/css/scss/modules/_header.scss',
  ]).on('change', () => {
    RecompillerStyle(criticalCssFile);
    RecompilerStyleFiles.forEach((item) => {
      RecompillerStyle(item);
    });
    browserSync.reload();
  });

  // RecompilerStyleFiles.forEach((item) => {
  //   watch(
  //     item.path,
  //     series(() => RecompillerStyle(item)),
  //   ).on('change', browserSync.reload);
  // });

  watch(['./assets/js/libs/**/*.js', './assets/js/libs.js'], series(jsLibs)).on(
    'change',
    browserSync.reload,
  );
  watch(['./assets/js/scripts/**/*.js', './assets/js/app.js'], series(js)).on(
    'change',
    browserSync.reload,
  );

  watch('./assets/img/spriteSvg/**/*.svg', series(spriteSvg)).on(
    'change',
    browserSync.reload,
  );
  watch('./assets/fonts/**/*', series(fonts)).on('change', browserSync.reload);
  watch('./assets/public/**/*', series(copyPublic)).on(
    'change',
    browserSync.reload,
  );
  watch('./assets/js/webpack/dist/**/*', series(copyWebpackJS)).on(
    'change',
    browserSync.reload,
  );
  watch('./assets/img/symbol/svg/sprite.symbol.svg', series(moveSpriteSvg)).on(
    'change',
    browserSync.reload,
  );
  watch('./views/**/*').on('change', browserSync.reload);

  chokidar
    // .watch('./assets/img/**/*.{jpg,JPG,jpeg,JPEG,png}', {
    .watch('./assets/img/**/*', {
      ignoreInitial: true,
    })
    .on('all', async (event, path) => {
      const { folder, fileName, fileExtension, mimeType } = parseFilePath(path);
      if (event === 'add' || event === 'change') {
        const newPath = `src/img/${folder}/`.replace(/\/\/$/, '/'); // replace //
        src(path).pipe(dest(newPath));
        // // medium
        // let pipe_medium_name;
        // const pipe_medium = src(path)
        //   .pipe(
        //     imageResize({
        //       width: 640, // image width
        //       height: 400, // image height
        //       crop: false, // do not crop the image to the specified dimensions
        //       upscale: false, // do not upscale the image if it is smaller than the specified dimensions
        //     }),
        //   )
        //   .pipe(
        //     rename(function (path) {
        //       const regex = /@\d*x/;
        //       if (regex.test(path.basename)) {
        //         path.basename = path.basename.replace(regex, '_medium$&');
        //       } else {
        //         path.basename += '_medium';
        //       }
        //       pipe_medium_name = path.basename;
        //     }),
        //   );
        // pipe_medium.pipe(dest(newPath)).on('end', async () => {
        //   await webpCreate(newPath + pipe_medium_name + fileExtension, newPath);
        // });
        // await webp(path, newPath, false, undefined, true);
        // await webp(path, newPathMedium, false, undefined, true);

        // create webp for images
        if (
          !noWebp &&
          mimeType &&
          (mimeType.includes('image/jpeg') || mimeType.includes('image/png'))
        ) {
          await webpCreate(path, newPath);
        }
      } else if (event === 'unlink') {
        const newPath = `src/img/${folder}\/${fileName}`.replace(/\/\//g, '/');
        if (fs.existsSync(newPath + fileExtension)) {
          fs.unlink(newPath + fileExtension, (err) => {
            if (err) return;
          });
        }
        if (!noWebp && fs.existsSync(newPath + '.webp')) {
          fs.unlink(newPath + '.webp', (err) => {
            if (err) return;
          });
        }
        // // medium
        // const newPathMedium = (() => {
        //   const regex = /@\d*x/;
        //   if (regex.test(fileName)) {
        //     return `src/img/${folder}\/${fileName.replace(regex, '_medium$&')}`;
        //   }
        //   return `src/img/${folder}\/${fileName}_medium`;
        // })();
        // if (fs.existsSync(newPathMedium + fileExtension)) {
        //   fs.unlink(newPathMedium + fileExtension, (err) => {
        //     if (err) return;
        //   });
        // }
        // if (fs.existsSync(newPathMedium + '.webp')) {
        //   fs.unlink(newPathMedium + '.webp', (err) => {
        //     if (err) return;
        //   });
        // }
      }
      browserSync.reload();
    });
}

exports.build = series(
  flagProd,
  series(
    clear,
    buildSingleStyles,
    recompileStyles(),
    jsLibs,
    js,
    fonts,
    copyImg,
    moveSpriteSvg,
    // webpCreate,
    copyPublic,
    copyWebpackJS,
    buildSingleStylesFixClear, // fix delay remove
  ),
);

exports.buildNoImages = series(
  flagProd,
  series(
    clear,
    buildSingleStyles,
    recompileStyles(),
    jsLibs,
    js,
    fonts,
    // copyImg,
    moveSpriteSvg,
    // webpCreate,
    copyPublic,
    copyWebpackJS,
    buildSingleStylesFixClear, // fix delay remove
  ),
);

exports.default = series(
  clear,
  recompileStyles(),
  jsLibs,
  js,
  fonts,
  moveSpriteSvg,
  // webpCreate,
  copyPublic,
  copyWebpackJS,
  () => {
    copyImg();
    serve();
  },
);
exports.prod = series(
  flagProd,
  series(
    clear,
    recompileStyles(),
    jsLibs,
    js,
    fonts,
    copyImg,
    moveSpriteSvg,
    // webpCreate,
    copyPublic,
    copyWebpackJS,
    serve,
  ),
);

exports.copyImg = series(clear, copyImg);
exports.buildFast = series(
  clear,
  fonts,
  copyImg,
  moveSpriteSvg,
  // webpCreate,
  buildSingleStyles,
  recompileStyles(),
  jsLibs,
  js,
  copyPublic,
  copyWebpackJS,
  buildSingleStylesFixClear, // fix delay remove
);
exports.buildJs = series(flagProd, series(jsLibs, js, copyWebpackJS));

exports.buildCSS = series(
  flagProd,
  series(
    clear,
    buildSingleStyles,
    recompileStyles(),
    buildSingleStylesFixClear, // fix delay remove
  ),
);

exports.cacheClear = cacheClear;
exports.spriteSvg = spriteSvg;
