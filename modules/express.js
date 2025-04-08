// default
const fs = require('fs');
const multer = require('multer');

const path = require('path');
const getFilesFunc = require('./getFilesNode.js');
// const config = require('./config.json');
const lang = require('./lang.json');
const posthtml = require('posthtml');
const beautify = require('posthtml-beautify');
const htmlMinifier = require('html-minifier').minify;
var jsonFormat = require('json-format');
const hljs = require('highlightjs');
const bodyParser = require('body-parser');
const posthtmlInlineAssets = require('posthtml-inline-assets');
const minifyHtml = process.argv.includes('--minify-html');
// express
const express = require('express');
const exphbs = require('express-handlebars');
const app = express();
app.use(bodyParser.json());
const hbs = exphbs.create({
  layoutsDir: 'views/layouts',
  partialsDir: ['views/teamplates', 'views/teamplates/firstScreen'],
  defaultLayout: 'default',
  extname: '.hbs',
  helpers: {
    echoJSON: function (a) {
      if (typeof a == 'undefined') return 'undefined';
      return jsonFormat(a);
    },
    echo: function (a) {
      if (typeof a == 'undefined') return 'undefined';
      return `<code class="Code Code--lang-json"><pre>${
        hljs.highlight('json', jsonFormat(a)).value
      }</pre></code>`;
    },
    ifEquals: function (a, b, options) {
      if (a === b) {
        return options.fn(this);
      }
      return options.inverse(this);
    },
    ifNotEquals: function (a, b, options) {
      if (a !== b) {
        return options.fn(this);
      }
      return options.inverse(this);
    },
    ifEqualsList: function (a, b, options) {
      try {
        // eslint-disable-next-line
        const list = Array.isArray(b) ? b : b.replace(/\, /gim, ',').split(',');
        if (list.includes(a)) {
          return options.fn(this);
        }
      } catch (error) {
        console.log(error);
      }
      return options.inverse(this);
    },
    math: function (lvalue, operator, rvalue) {
      lvalue = parseFloat(lvalue);
      rvalue = parseFloat(rvalue);
      return {
        '+': lvalue + rvalue,
        '-': lvalue - rvalue,
        '*': lvalue * rvalue,
        '/': lvalue / rvalue,
        '%': lvalue % rvalue,
      }[operator];
    },
    add: function (a, b) {
      return a + b;
    },
    multiply: function (a, b) {
      return a * b;
    },
    array: function () {
      return Array.prototype.slice.call(arguments, 0, -1);
    },
    concat: function () {
      const args = Array.prototype.slice.call(arguments);
      args.pop(); // Удалите последний аргумент, который является объектом options
      return args.join('');
    },
    times: function (n, block) {
      let accum = '';
      for (var i = 0; i < n; ++i) accum += block.fn(i);
      return accum;
    },
  },
});
app.use(express.static('src'));
app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');
app.set('views', 'views');

var Handlebars = require('handlebars');
Handlebars.registerHelper('echoJSON', function (a) {
  if (typeof a == 'undefined') return 'undefined';
  return jsonFormat(a);
});

Handlebars.registerHelper('echo', function (a) {
  if (typeof a == 'undefined') return 'undefined';
  return `<code class="Code Code--lang-json"><pre>${
    hljs.highlight('json', jsonFormat(a)).value
  }</pre></code>`;
});

Handlebars.registerHelper('ifEquals', function (a, b, options) {
  if (a === b) {
    return options.fn(this);
  }
  return options.inverse(this);
});

Handlebars.registerHelper('ifNotEquals', function (a, b, options) {
  if (a !== b) {
    return options.fn(this);
  }
  return options.inverse(this);
});

Handlebars.registerHelper('ifEqualsList', function (a, b, options) {
  try {
    // eslint-disable-next-line
    const list = Array.isArray(b) ? b : b.replace(/\, /gim, ',').split(',');
    if (list.includes(a)) {
      return options.fn(this);
    }
  } catch (error) {
    console.log(error);
  }
  return options.inverse(this);
});

Handlebars.registerHelper('defaultData', function (lvalue, operator, rvalue) {
  lvalue = parseFloat(lvalue);
  rvalue = parseFloat(rvalue);
  return {
    '+': lvalue + rvalue,
    '-': lvalue - rvalue,
    '*': lvalue * rvalue,
    '/': lvalue / rvalue,
    '%': lvalue % rvalue,
  }[operator];
});

Handlebars.registerHelper('add', function (a, b) {
  return a + b;
});

Handlebars.registerHelper('multiply', function (a, b) {
  return a * b;
});

Handlebars.registerHelper('array', function () {
  return Array.prototype.slice.call(arguments, 0, -1);
});

Handlebars.registerHelper('concat', function () {
  const args = Array.prototype.slice.call(arguments);
  args.pop(); // Удалите последний аргумент, который является объектом options
  return args.join('');
});

Handlebars.registerHelper('times', function (n, block) {
  var accum = '';
  for (var i = 0; i < n; ++i) accum += block.fn(i);
  return accum;
});

const fileNames = [];

function correctPageURL(name, action = 'build', live = false) {
  if (name == 'index' && action == 'server' && live) {
    name = '';
    return name;
  }
  if (name == 'index' && action == 'server' && !live) {
    name = 'index_';
    return name;
  }
  return name;
}

const renderStaticHBS = function (file, render, renderData, filename) {
  hbs.renderView(file, renderData, (req, res) => {
    posthtml()
      .use(posthtmlInlineAssets())
      .process(res)
      .then((result) => {
        let finalHtml = result.html;
        const cssFilePath = path.join(
          __dirname,
          `../src/css/single/${filename}.css`,
        );

        // let cssContent = '';
        if (fs.existsSync(cssFilePath)) {
          // cssContent = fs.readFileSync(cssFilePath, 'utf-8');
          const idToFind = 'fs-style';
          const regex = new RegExp(
            `<style\\s+id="${idToFind}"[^>]*>.*?<\\/style>`,
            's',
          );
          finalHtml = finalHtml.replace(
            regex,
            // `<style id="${filename}fs">${cssContent}</style>`,
            `<link rel="stylesheet" href="./css/single/${filename}.css">`,
          );
          finalHtml = finalHtml.replace(
            'data-fs="fs-style"',
            `data-fs="${filename}fs"`,
          );
          finalHtml = finalHtml.replace(
            'data-style-href="fs-path"',
            `data-style-href="./css/single/${filename}.css"`,
          );
        }
        let minifiedHtml;
        if (minifyHtml) {
          minifiedHtml = htmlMinifier(finalHtml, {
            collapseWhitespace: true,
            removeComments: true,
            ignoreCustomFragments: [/{{[\s\S]*?}}/],
          });
        } else {
          minifiedHtml = finalHtml;
        }
        fs.writeFile(render, minifiedHtml, function (err) {
          if (err) return console.log(err);
        });
      })
      .catch((error) => {
        console.error(error);
      });
  });
};

function createLinksList(links = []) {
  fs.writeFile(
    __dirname + '/../src/links.txt',
    links.join('\n'),
    function (err) {
      if (err) return console.log(err);
    },
  );
}

getFilesFunc.removeFiles(__dirname + '/../src/*.html');

// exports
exports.app = app;
exports.eachPages = function (renderData, action = 'build') {
  getFilesFunc.getFiles(
    __dirname + '/../views/pages/**/*.hbs',
    function (err, res) {
      const cssSingleFileName = res.map(
        (element) => getFilesFunc.getFileData(element)?.name,
      );
      res.forEach((element) => {
        const { name, dir: folder } = getFilesFunc.getFileData(element); // { extension, name, dir }
        const dir = path.resolve(__dirname + '/../src/');
        lang.list.forEach((currentLang) => {
          const isDefaultLang = currentLang === lang.default;
          const prefix = '_' + currentLang;
          const urlPrefix = (() => {
            if (name === 'index') {
              return isDefaultLang ? '/' : '/' + currentLang;
            }
            if (isDefaultLang) return '/';
            return '/' + currentLang + '/';
          })();

          if (!isDefaultLang)
            getFilesFunc.createFolder((dir + urlPrefix).replace('//', '/'));
          const folderPrefix = (() => {
            if (folder.includes('views/pages/')) {
              return folder.split('views/pages/')[1];
            }
            return '';
          })();

          if (action == 'server') {
            app.get(
              urlPrefix + correctPageURL(name, 'server', true),
              function (req, res) {
                const defaultData = JSON.parse(
                  fs.readFileSync(__dirname + `/defaultData${prefix}.json`),
                );
                const newRenderData = {
                  ...renderData,
                  currentLang,
                  ...defaultData,
                  ...getJson(name, prefix, folderPrefix),
                  cssSingleFileName,
                  // cssSingleFileName: cssSingleFileName.filter(el => el == name),
                };
                res.render(element, newRenderData);
                // renderStaticHBS(element, dir + correctPageURL(name, 'server', false) + '.html', renderData);
              },
            );
          } else {
            const defaultData = JSON.parse(
              fs.readFileSync(__dirname + `/defaultData${prefix}.json`),
            );

            fileNames.push(name == 'index' ? name : name + '.html');
            const newRenderData = {
              ...renderData,
              currentLang,
              ...defaultData,
              ...getJson(name, prefix, folderPrefix),
            };
            renderStaticHBS(
              element,
              dir + urlPrefix + '/' + correctPageURL(name, action) + '.html',
              newRenderData,
              name,
            );
          }
        });
      });
      createLinksList(fileNames);
    },
  );
};

function getJson(name, prefix, folderPrefix = '') {
  let data = {};
  getFilesFunc.getFiles(
    __dirname + `/../views/pages/${folderPrefix + name + prefix}.json`,
    function (err, res) {
      res.forEach((element) => {
        const json = JSON.parse(fs.readFileSync(element));
        data = { ...data, ...json };
      });
    },
  );
  return data;
}
const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.single('file'), (req, res) => {
  // Access the uploaded file using req.file
  const file = req.file;

  // Process the file and save it locally
  // For example, you can use fs module to move the file to the desired location
  const newPath = 'uploads/' + file.originalname;
  fs.renameSync(file.path, newPath);

  // Send a response back to the client
  res.json({
    success: true,
    message: 'File uploaded successfully',
    url: newPath,
  });
});
