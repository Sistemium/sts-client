'use strict';

const path = require('path');
const gulp = require('gulp');
const conf = require('./conf');

const browserSync = require('browser-sync');
const webpack = require('webpack-stream');

const $ = require('gulp-load-plugins')();


function webpackWrapper(watch, test, callback) {

  const webpackOptions = {
    watch: watch,
    module: {
      preLoaders: [{test: /\.js$/, exclude: /node_modules/, loader: 'eslint-loader'}],
      loaders: [{test: /\.js$/, exclude: /node_modules/, loaders: ['ng-annotate', 'babel-loader?presets[]=es2015']}]
    },
    output: {filename: 'index.module.js'}
  };

  if (watch) {
    webpackOptions.devtool = 'inline-source-map';
  }

  const webpackChangeHandler = function (err, stats) {
    if (err) {
      conf.errorHandler('Webpack')(err);
    }
    $.util.log(stats.toString({
      colors: $.util.colors.supportsColor,
      chunks: false,
      hash: false,
      version: false
    }));
    browserSync.reload();
    if (watch) {
      watch = false;
      callback();
    }
  };

  const sources = [path.join(conf.paths.src, '/app/index.module.js')];

  if (test) {
    sources.push(path.join(conf.paths.src, '/app/**/*.spec.js'));
  }

  return gulp.src(sources)
    .pipe(webpack(webpackOptions, null, webpackChangeHandler))
    .pipe(gulp.dest(path.join(conf.paths.tmp, '/serve/app')));

}

gulp.task('scripts', function () {
  return webpackWrapper(false, false);
});

gulp.task('scripts:watch', ['scripts'], function (callback) {
  return webpackWrapper(true, false, callback);
});

gulp.task('scripts:test', function () {
  return webpackWrapper(false, true);
});

gulp.task('scripts:test-watch', ['scripts'], function (callback) {
  return webpackWrapper(true, true, callback);
});
