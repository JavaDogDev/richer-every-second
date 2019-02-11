const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const PRODUCTION = false;

module.exports = {
  mode: PRODUCTION ? 'production' : 'development',
  devtool: PRODUCTION ? undefined : 'inline-cheap-source-map',
  target: 'web',

  entry: [
    'babel-polyfill',
    path.join(__dirname, 'src/main.js'),
  ],

  output: {
    path: path.join(__dirname, 'build/'),
    filename: '[name].bundle.js',
  },

  module: {
    rules: [
      {
        // Build JS and JSX with Babel
        test: /\.js$/,
        include: [path.resolve(__dirname, 'src')],
        query: { presets: ['env', 'stage-2'] },
        resolve: {
          extensions: ['.js'],
        },
        loader: 'babel-loader',
      },
      {
        // Compile SCSS into CSS and allow requiring from JS files
        test: /\.scss$/,
        include: [path.resolve(__dirname, 'src')],
        use: [
          'style-loader',
          'css-loader',
          { loader: 'sass-loader', options: { outputStyle: PRODUCTION ? 'compressed' : null } },
        ],
      },
    ],
  },

  plugins: [
    new CopyWebpackPlugin([
      { from: 'src/*.html', flatten: true },
      { from: 'src/3d-models/*.obj', to: '3d-models/', flatten: true },
    ]),
  ],

  // Disable stupid "oh no app > 244 KiB" warning
  performance: { hints: false },

  devServer: {
    contentBase: path.join(__dirname, 'build'),
  },
};
