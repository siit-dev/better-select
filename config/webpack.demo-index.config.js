import path from 'path';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import postcssConfig from '../postcss.config.js';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import babelConfig from '../babel.config.js';
import webpack from 'webpack';
import { marked } from 'marked';
import fs from 'fs';
const __dirname = path.dirname(new URL(import.meta.url).pathname);

const makeConfig = () => {
  const isDev = process.env.NODE_ENV === 'development';

  const plugins = [new webpack.EnvironmentPlugin({ NODE_ENV: 'production' })];

  plugins.push(
    new HtmlWebpackPlugin({
      template: 'public/demo-index.html',
      templateParameters: {
        readme: marked.parse(fs.readFileSync(path.resolve(__dirname, '../README.md'), 'utf8')),
      },
    }),
  );

  const entries = {
    index: ['./src/index'],
    demo: ['./src/demo-index', './src/scss/demo-index.scss'],
  };

  const config = {
    entry: entries,
    output: {
      path: path.resolve(__dirname, '../docs/demo'),
      filename: '[name].js',
      libraryTarget: process.env.WEBPACK_LIBRARY_TARGET || 'umd',
      globalObject: 'this',
    },
    devServer: {
      static: './public/',
    },
    module: {
      rules: [
        {
          test: /^(?!.*\.{test,min}\.(js|ts)x?$).*\.(js|ts)x?$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                cacheDirectory: true,
                ...babelConfig,
              },
            },
          ],
        },
        {
          test: /\.(scss|sass|css)$/,
          use: [
            'style-loader',
            'css-loader',
            { loader: 'postcss-loader', options: postcssConfig },
            'sass-loader',
          ].filter(Boolean),
        },
        {
          test: /.(woff(2)?|eot|ttf)(\?[a-z0-9=\.]+)?$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: '../fonts/[name].[ext]',
              },
            },
          ],
        },
        {
          test: /\.(jpe?g|png|gif|svg)$/i,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: '../img-loader/[name].[ext]',
              },
            },
          ],
        },
      ],
    },
    plugins,
    resolve: {
      mainFields: ['es2015', 'module', 'jsnext:main', 'main'],
      extensions: ['.wasm', '.mjs', '.js', '.json', '.jsx', '.ts', '.tsx'],
      symlinks: false,
      cacheWithContext: false,
    },
    externals: {
      $: '$',
      jquery: 'jQuery',
    },
    mode: isDev ? 'development' : 'production',
  };

  return config;
};

const config = makeConfig();
export default config;
