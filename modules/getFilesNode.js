const glob = require('glob');
const fs = require('fs');
var path = require('path');
const mime = require('mime-types');

exports.deleteFolderRecursive = function (path) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach((file) => {
      var curPath = path + '/' + file;
      if (fs.lstatSync(curPath).isDirectory()) {
        // recurse
        this.deleteFolderRecursive(curPath);
      } else {
        // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};

exports.getFiles = function (src, callback = () => {}) {
  const links = glob.sync(src);
  callback('err', links);
  return links;
};

exports.removeFiles = function (src = 'src/*.html') {
  this.getFiles(src, function (err, res) {
    res.forEach((element) => {
      fs.unlinkSync(element);
    });
  });
};

exports.writeMyFile = function (file, dir, name, extension) {
  !fs.existsSync('src/' + dir) ? fs.mkdirSync('src/' + dir) : '';
  fs.copyFile(file, 'src/' + dir + '/' + name + extension, (err) => {
    if (err) throw err;
  });
};

exports.createFolder = function (dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

exports.getFileData = function (file) {
  let extension = path.extname(file); // type file
  let name = path.basename(file, extension); // name file
  let dir = path.dirname(file) + '/';
  if (extension == '.map') {
    let { newName, newExt } = replaceExt(name, extension);
    name = newName;
    extension = newExt;
  }
  return { extension, name, dir };
};

function replaceExt(name, extension) {
  let nameArr = name.split('.');
  let newName = nameArr[0];
  let newExt = '.' + nameArr.slice(1).join('') + extension;
  return { newName, newExt };
}

exports.parseFilePath = function parseFilePath(
  filePath,
  replace = 'assets/img',
) {
  const parsedPath = path.parse(filePath);

  const folder = parsedPath.dir.replace(replace, '').trim().replace(/^\//, '');
  const fileName = parsedPath.name;
  const fileExtension = parsedPath.ext;
  // get MIME type
  const mimeType = mime.lookup(filePath);

  return { folder, fileName, fileExtension, parsedPath, mimeType };
};
