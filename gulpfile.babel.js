require('babel-register')({
  presets: [ 'es2015' ]
});

'use strict';

import gulp from 'gulp';
import chalk from 'chalk';
import notifier from 'node-notifier';
import babel from 'gulp-babel';
import jasmine from 'gulp-jasmine';
import JasmineConsoleReporter from 'jasmine-console-reporter';
import stylus from 'gulp-stylus';
import jeet from 'jeet';
import rupture from 'rupture';
import cmq from 'gulp-merge-media-queries';
import concat from 'gulp-concat';
import plumber from'gulp-plumber';
import del from 'del';

// How should the jasmine report look
var reporter = new JasmineConsoleReporter({
    colors: 1,           // (0|false)|(1|true)|2
    cleanStack: 1,       // (0|false)|(1|true)|2|3
    verbosity: 4,        // (0|false)|1|2|(3|true)|4
    listStyle: 'indent', // "flat"|"indent"
    activity: false
});

// The source and destination directories
// Note: If you are using your own theme, simply replace the 'default' theme with your own theme dir (This will also need to be done in server.js)

let io = {
    in: __dirname+'/src',
    out: __dirname+'/dist'
  }

// The paths
const path = {
  views: '/views',
  scripts: '/scripts',
  images: '/images',
  styles: '/styles'
}

// Handle errors
let errors = 0;
let onError = function (err) {
  console.log(chalk.red('✘ Build failed!'))
  notifier.notify({ title: 'Build', message: 'Failed'});
  console.log(err);
  errors = errors+1
  this.emit('end');
};

/* Watchers */
gulp.task('watch', () => {
  gulp.watch(io.in+path.scripts+'/**/*.js', ['scripts']);
  gulp.watch(io.in+path.styles+'/**/*.styl', ['styles']);
  gulp.watch(io.in+path.views+'/**/*.ejs', ['views']);
})

// run tests (can also use npm test)
gulp.task('test', (cb) => {
  gulp.src(['tests/**/*.spec.js'])
    .pipe(jasmine({
        reporter: reporter
    }))
    cb();
});

// Process styles
gulp.task('styles', () => {
  gulp.src(io.in+path.styles+'/start.styl')
  .pipe(plumber(
    { errorHandler: onError }
  ))
  .pipe(stylus({
    'include css': true,
    use: [jeet(), rupture()]
  }))
  .pipe(concat('core.min.css'))
  .pipe(cmq())
  .pipe(gulp.dest(io.out+'/static/'+path.styles))
});

// Process javascript
gulp.task('scripts', ['test'], () => {
  gulp.src(io.in+path.scripts+'/**/*.js')
  .pipe(babel())
  .pipe(gulp.dest(io.out+'/static/'+path.scripts))
});

// Copy static assets to dist
gulp.task('static', () => {
  // Fonts
  gulp.src(io.in+'/fonts/**/*')
  .pipe(gulp.dest(io.out+'/static/fonts'))
  // Favico
  gulp.src(io.in+'/favicon.ico')
  .pipe(gulp.dest(io.out))
  // Images
  // TODO: Add compression function to this.
  gulp.src(io.in+path.images+'/**/*.*')
  .pipe(gulp.dest(io.out+'/static/'+path.images))
  // Robots.txt
  gulp.src('robots.txt')
    .pipe(gulp.dest(io.out))
});

// Process theme
gulp.task('views', () => {
  gulp.src(io.in+path.views+'/**/*.ejs')
  .pipe(plumber(
    { errorHandler: onError }
  ))
  .pipe(gulp.dest(io.out+path.views))
});

// run all the required build tasks
gulp.task('build', ['clean'], () => {
  gulp.start('styles', 'scripts', 'views', 'static');
});

// Delete the destination directory
gulp.task('clean', function() {
  return del(io.out);
});
