const fs = require('fs');
const getFilesFunc = require('./getFilesNode.js');

const { getFiles, parseFilePath } = getFilesFunc;

module.exports = function createPagesList(isServer = false, renderData) {
  const pages = getFiles('views/pages/*.hbs');

  const list = pages
    .map((element) => {
      const { folder, fileName } = parseFilePath(element);
      const jsonPath = `${__dirname}/../${folder}/${fileName}_en.json`;
      const json = fs.existsSync(jsonPath)
        ? JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
        : {};
      const { developmentPage, title: name } = json;
      return {
        name: name || fileName,
        developmentPage,
        slug: isServer && fileName == 'index' ? '/' : fileName,
      };
    })
    .filter(({ developmentPage, name }) => {
      return !developmentPage && name != 'example-s';
    });

  const pagesListJsonPath = `${__dirname}/../views/pages/pages-list_en.json`;

  const pagesListJson = fs.existsSync(pagesListJsonPath)
    ? JSON.parse(fs.readFileSync(pagesListJsonPath, 'utf8'))
    : {};
  pagesListJson.list = list;
  pagesListJson.total = list.length;
  fs.writeFileSync(pagesListJsonPath, JSON.stringify(pagesListJson, null, 4));
  console.log('writed pages-list_en.json');
};
