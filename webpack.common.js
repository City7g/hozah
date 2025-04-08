const fs = require('fs');
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

function getFilesInDirectory(dir) {
  const files = fs.readdirSync(dir);
  return files
    .filter((file) => fs.statSync(path.join(dir, file)).isFile())
    .map((file) => path.resolve(dir, file));
}

const entryDirectory = path.resolve(
  __dirname,
  './assets/js/webpack/assets/single',
);
const otherScripts = getFilesInDirectory(entryDirectory);
const entry = {
  main: path.resolve(__dirname, './assets/js/webpack/assets/main.js'),
};
otherScripts.forEach((file) => {
  const key = path.basename(file, path.extname(file));
  entry[key] = file;
});

module.exports = {
  entry,
  devtool: false,
  output: {
    path: path.resolve(__dirname, './assets/js/webpack/dist/'),
    filename: '[name].js',
  },
  resolve: {
    alias: {
      videojs: 'video.js',
    },
  },
  optimization: {
    minimizer: [new TerserPlugin()],
  },
  plugins: [
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ['**/*'],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-env',
                {
                  targets: {
                    browsers: ['> 1%', 'last 2 versions', 'safari >= 11'],
                  },
                },
              ],
            ],
            plugins: [
              '@babel/plugin-proposal-optional-chaining',
              '@babel/plugin-proposal-nullish-coalescing-operator',
            ],
          },
        },
      },
    ],
  },
};
