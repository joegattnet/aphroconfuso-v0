const { src, dest, watch, series } = require('gulp');
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const cssnano = require('cssnano');
const terser = require('gulp-terser');
const browsersync = require('browser-sync').create();

// import del from 'del';
const rename = require('gulp-rename');
const replace = require('gulp-replace');
var ssi = require('browsersync-ssi');

var timestamp;

const folder = 'wMz3khEX5pSQ7G1rt09eutsejrlguhxdfjklvnfdxghrsoeugu696HhcoENY1E5btu0';

// Delete dist folder
function deleteDistFolder() {
    // return del(['dist/']);
}

// Sass Task
function scssTask() {
  timestamp = new Date().getTime();
  return src(`${folder}/scss/style.scss`, { sourcemaps: true })
    .pipe(sass())
    .pipe(postcss([cssnano()]))
    // .pipe(rename(function (path) {
    //         path.basename += `-${timestamp}`;
    //     }))
    .pipe(dest('dist', { sourcemaps: '.' }));
}

// JavaScript Task
function jsTask(){
  return src(`${folder}/js/script.js`, { sourcemaps: true })
    .pipe(terser())
    .pipe(dest('dist', { sourcemaps: '.' }));
}

function replaceLinks() {
  return src(`${ folder }/*.template.html`)
    .pipe(rename(function (path) {
      path.basename = path.basename.replace('.template', '');
    }))
    .pipe(replace(/<!TEMPLATE!>/g, `${timestamp}`))
    .pipe(dest(folder))
}

// Browsersync Tasks
function browsersyncServe(cb){
  browsersync.init({
    server: {
      baseDir: '.',
      middleware: [
        ssi({
          baseDir: `/${folder}`,
          ext: ".html"
        })
      ]
    }
  });
  cb();
}

function browsersyncReload(cb){
  browsersync.reload();
  cb();
}

// Watch Task
function watchTask() {
  watch(`${folder}/*.template.html`, replaceLinks, browsersyncReload);
  watch([`${folder}/scss/**/*.scss`, `${folder}/js/**/*.js`], series(scssTask, jsTask, replaceLinks, browsersyncReload));
}

// Default Gulp task
exports.default = series(
  scssTask,
  jsTask,
  replaceLinks,
  browsersyncServe,
  watchTask
);
