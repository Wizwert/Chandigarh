const { watch, series, parallel } = require('gulp');
const gulp = require('gulp');

/** JS and TS */
const ts = require('gulp-typescript');
const sourcemaps = require('gulp-sourcemaps');

/** file */
const rimraf = require('rimraf');
const merge2 = require('merge2');
const path = require('path');

const cwd = process.cwd();
const dir = path.join(cwd, './dist/');

function compile() {
    rimraf.sync(dir);
  
    const error = 0;
    const source = ['src/**/*.tsx', 'src/**/*.ts', 'typings/**/*.d.ts'];
  
    const tsProject = ts.createProject('tsconfig.json')
  
    const tsResult = gulp.src(source).pipe(
      tsProject()
    );
    function check() {
      if (error && !argv['ignore-error']) {
        process.exit(1);
      }
    }
  
    tsResult.on('finish', check);
    tsResult.on('end', check);
    const tsFilesStream = babelify(tsResult.js);
    const tsd = tsResult.dts.pipe(gulp.dest(dir));
  
    return merge2([ tsFilesStream, tsd ]);
}

function babelify(js) {   
  
    const stream = js
      .pipe(sourcemaps.init())
      .pipe(sourcemaps.write('.'));
  
    return stream.pipe(gulp.dest(dir));
}

function run(callback){
    const main = require("./dist/index").default;
    
    const outputPromise = main(callback);

    return outputPromise;
}

module.exports.buildAndRun = series(compile, run);
module.exports.default = series(compile);