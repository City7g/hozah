require('dotenv').config();
const host = process.env.ftp_host;
const user = process.env.ftp_user;
const password = process.env.ftp_password;

const FtpDeploy = require('ftp-deploy');
const ftpDeploy = new FtpDeploy();
const cliProgress = require('cli-progress');

const config = {
  user: user,
  // Password optional, prompted if none given
  password: password,
  host: host,
  port: 21,
  localRoot: __dirname + '/src',
  remoteRoot: '/public_html/src/www',
  // include: ["*", "**/*"],      // this would upload everything except dot files
  include: ['**/*.*'],
  // e.g. exclude sourcemaps, and ALL files in node_modules (including dot files)
  exclude: ['dist/**/*.map'],
  // delete ALL existing files at destination before uploading, if true
  deleteRemote: true,
  // Passive mode is forced (EPSV command is not sent)
  forcePasv: true,
  // use sftp or ftp
  sftp: false,
};

let bar;
const setProgress = ({ totalFilesCount, transferredFileCount, filename }) => {
  if (bar) {
    // update bar
    bar.update(transferredFileCount, { filename });
  } else {
    // create bar
    bar = new cliProgress.SingleBar(
      {
        hideCursor: true,
      },
      cliProgress.Presets.shades_classic,
    );
    bar.start(totalFilesCount, transferredFileCount);
    // totalFiles = totalFilesCount
  }
};

console.log('Start deploy to host', host);
ftpDeploy
  .deploy(config)
  .then((res) => {
    let count = res.reduce((sum, current) => sum + current.length, 0);
    setProgress({ totalFilesCount: count, transferredFileCount: count });
    bar.stop();
    console.log(`Finished! Uploaded ${count} files.`);
  })
  .catch((err) => console.log(err));
ftpDeploy.on('uploading', setProgress);
