require('babel-register')({
  presets: [ 'es2015' ]
})

'use strict'

import path from 'path'

import gulp from 'gulp'
import chalk from 'chalk'
import notifier from 'node-notifier'
import babel from 'gulp-babel'
import stylus from 'gulp-stylus'
import jeet from 'jeet'
import rupture from 'rupture'
import cmq from 'gulp-merge-media-queries'
import concat from 'gulp-concat'
import plumber from 'gulp-plumber'
import del from 'del'

// The source and destination directories
// Note: If you are using your own theme, simply replace the 'default' theme with your own theme dir (This will also need to be done in server.js)

let io = {
  in: path.join(__dirname, 'src'),
  out: path.join(__dirname, 'dist')
}

const staticDir = path.join(io.out, 'static')

// The paths
const paths = {
  views: 'views',
  scripts: 'scripts',
  images: 'images',
  styles: 'styles',
  fonts: 'fonts'
}

const getSrcPath = (type, srcPath) => {
  type = paths[type] || type
  srcPath = srcPath || ''
  return path.join(io.in, type, srcPath)
}

const getStaticPath = type => {
  type = paths[type] || type
  return path.join(staticDir, type)
}

// Handle errors
let errors = 0
let onError = function (err) {
  console.log(chalk.red('✘ Build failed!'))
  notifier.notify({title: 'Build', message: 'Failed'})
  console.log(err)
  errors = errors + 1
  this.emit('end')
}

/* Watchers */
gulp.task('watch', () => {
  gulp.watch(getSrcPath('scripts', '/**/*.js'), ['scripts'])
  gulp.watch(getSrcPath('styles', '/**/*.styl'), ['styles'])
  gulp.watch(getSrcPath('views', '/**/*.ejs'), ['views'])
})

// Process styles
gulp.task('styles', () => {
  gulp.src(getSrcPath('styles', 'start.styl'))
  .pipe(plumber(
    { errorHandler: onError }
  ))
  .pipe(stylus({
    'include css': true,
    use: [jeet(), rupture()]
  }))
  .pipe(concat('core.min.css'))
  .pipe(cmq())
  .pipe(gulp.dest(getStaticPath('styles')))
})

// Process javascript
gulp.task('scripts', () => {
  gulp.src(getSrcPath('scripts', '**/*.js'))
  .pipe(babel())
  .pipe(gulp.dest(getStaticPath('scripts')))
})

// Copy static assets to dist
gulp.task('static', () => {
  // Fonts
  gulp.src(getSrcPath('fonts', '**/*'))
  .pipe(gulp.dest(getStaticPath('fonts')))
  // Favico
  gulp.src(path.join(io.in, 'favicon.ico'))
  .pipe(gulp.dest(io.out))
  // Images
  // TODO: Add compression function to this.
  gulp.src(getSrcPath('images', '**/*.*'))
  .pipe(gulp.dest(getStaticPath('images')))
  // Robots.txt
  gulp.src('robots.txt')
    .pipe(gulp.dest(io.out))
})

// Process theme
gulp.task('views', () => {
  gulp.src(getSrcPath('views', '**/*.ejs'))
  .pipe(plumber(
    { errorHandler: onError }
  ))
  .pipe(gulp.dest(path.join(io.out, paths.views)))
})

// Delete the destination directory
gulp.task('clean', function () {
  return del(io.out)
})

// run all the required build tasks
gulp.task('build', ['clean'], () => {
  gulp.start('scripts', 'styles', 'static', 'views')
})

// run all the required build tasks
gulp.task('watchbuild', ['watch'], () => {
  gulp.start('build')
})
