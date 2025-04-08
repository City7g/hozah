const argv = require('yargs').argv;
const myExpress = require('./modules/express.js');
const config = require('./modules/config.json');
const createPagesList = require('./modules/createPagesList.js');

const noWebp = argv.noWebp;

const renderData = {
  puthSRC: '.',
  version: '',
  htmlPrefix: '',
  build: false,
};

createPagesList(true, renderData);

myExpress.eachPages({ ...renderData, ...config, noWebp }, 'server');
myExpress.app.listen(5001);
console.log('Server started on', 'http://localhost:5001');
