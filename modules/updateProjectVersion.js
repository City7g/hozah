const fs = require('fs');

function getCurrentDate() {
  const date = new Date();
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

function updateProjectVersion() {
  const packagePath = `${__dirname}/../package.json`;
  const packageData = fs.existsSync(packagePath)
    ? JSON.parse(fs.readFileSync(packagePath, 'utf8'))
    : { version: '1.0.0' };
  //
  const defaultDataPath = `${__dirname}/defaultData_en.json`;
  const defaultData = fs.existsSync(defaultDataPath)
    ? JSON.parse(fs.readFileSync(defaultDataPath, 'utf8'))
    : {};
  //
  const parsedVersion = packageData.version
    .split('.')
    .map((el) => parseInt(el));

  // update project version
  parsedVersion[2] += 1;
  defaultData.projectVersion = parsedVersion.join('.');
  packageData.version = parsedVersion.join('.');
  defaultData.buildDate = getCurrentDate();

  // write updated data to files
  fs.writeFileSync(defaultDataPath, JSON.stringify(defaultData, null, 2));
  fs.writeFileSync(packagePath, JSON.stringify(packageData, null, 2));
}

updateProjectVersion();
