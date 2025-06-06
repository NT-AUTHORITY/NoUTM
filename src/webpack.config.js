const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    background: path.resolve(__dirname, 'src/background.js'),
    popup: path.resolve(__dirname, 'src/popup.js')
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: path.resolve(__dirname, 'src/config.json'), to: 'config.json' },
        { from: path.resolve(__dirname, 'manifest.json'), to: 'manifest.json' },
        { from: path.resolve(__dirname, 'icons'), to: 'icons' }
      ]
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/popup.html'),
      filename: 'popup.html',
      chunks: ['popup']
    })
  ],
  resolve: {
    extensions: ['.js']
  }
}; 