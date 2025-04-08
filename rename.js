const getFilesFunc = require('./modules/getFilesNode.js');
const fs = require('fs');

function prefix(val, count = 4) {
  let prefix = '';
  for (let index = 0; index < count - val.toString().length; index++) {
    prefix += '0';
  }
  return prefix + val;
}

getFilesFunc.getFiles(
  __dirname + '/src/assets/img/figures_new_size/Dawid/*.webp',
  function (err, res) {
    res.forEach((element, index) => {
      // console.log(index)
      const { name } = getFilesFunc.getFileData(element); // { extension, name, dir }
      console.log(name.replace(/\d/gim, '') + prefix(index));
      fs.rename(
        element,
        __dirname +
          '/src/assets/img/figures_new_size/Dawid/david' +
          prefix(index) +
          '.webp',
        (err) => {
          if (err) throw err;
          // console.log(`${name + extension} => ${name + version + extension}`);
        },
      );
    });
  },
);
