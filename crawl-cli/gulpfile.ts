// / <reference path="./types/gulp-eslint.d.ts" />
import gulp, {series, watch, parallel} from 'gulp';
import * as stream from 'stream';

/** JS and TS */
import ts from 'gulp-typescript';
import sourcemaps from 'gulp-sourcemaps';

/** file */
import rimraf from 'rimraf';
import merge2 from 'merge2';
import path from 'path';

// @ts-ignore
import eslint from 'gulp-eslint';

const cwd = process.cwd();
const dir = path.join(cwd, './dist');
const source = ['src/**/*.tsx', 'src/**/*.ts', 'typings/**/*.d.ts'];

function lint() {
  return gulp.src(source)
      .pipe(eslint())
      .pipe(eslint.formatEach())
      .pipe(eslint.results((results: any) => {
        // Called once for all ESLint results.
        console.log(`Total Results: ${results.length}`);
        console.log(`Total Warnings: ${results.warningCount}`);
        console.log(`Total Errors: ${results.errorCount}`);
      }))
      .pipe(eslint.failAfterError());
}

function runCompile() {
  const error = 0;

  const tsProject = ts.createProject('tsconfig.json');

  const tsResult = gulp.src(source)
      .pipe(tsProject());

  const check = () => {
    if (error) {
      process.exit(1);
    }
  };

  tsResult.on('finish', check);
  tsResult.on('end', check);
  const tsFilesStream = babelify(tsResult.js);
  const tsd = tsResult.dts.pipe(gulp.dest(dir));

  return merge2([tsFilesStream, tsd]);
}

function babelify(js: stream.Readable) {
  const stream = js
      .pipe(sourcemaps.init())
      .pipe(sourcemaps.write('.'));

  return stream.pipe(gulp.dest(dir));
}

function install(cb: (error?: any) => void) {
  const npm = require('npm');
  const npmConfig = {};

  npm.load(npmConfig, function(er: any) {
    if (er) return cb(er);
    npm.commands.install([], function(er: any, data: any) {
      cb(er);
    });
    npm.on('log', function(message: string) {
      console.log(message);
    });
  });
}

function buildAndWatch(cb: (error?: any) => void) {
  const tsProject = ts.createProject('tsconfig.json');

  watch(['src/**/*.tsx', 'src/**/*.ts'], (cb) =>{
    gulp.src(['src/**/*.tsx', 'src/**/*.ts'])
        .pipe(eslint())
        .pipe(eslint.formatEach('compact'))
        .pipe(tsProject())
        .pipe(gulp.dest(dir));
    cb();
  });
}

function clearDirectory(cb: (error?: any) => void) {
  rimraf.sync(dir);
  cb();
}


const bootstrap = series(install, runCompile);
const build = series(clearDirectory, parallel(lint, runCompile));

const watchFiles = series(build, buildAndWatch);

export {bootstrap, build, watchFiles as watch};
export default build;
