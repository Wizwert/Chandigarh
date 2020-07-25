import gulp, { watch, series, parallel } from 'gulp';
import * as stream from 'stream';

/** JS and TS */
import ts from "gulp-typescript";
import sourcemaps from "gulp-sourcemaps";

/** file */
import rimraf from 'rimraf';
import merge2 from 'merge2';
import path from 'path';

const cwd = process.cwd();
const dir = path.join(cwd, './dist/');

function runCompile() {
    rimraf.sync(dir);
  
    const error = 0;
    const source = ['src/**/*.tsx', 'src/**/*.ts', 'typings/**/*.d.ts'];
  
    const tsProject = ts.createProject('tsconfig.json')
  
    const tsResult = gulp.src(source).pipe(
      tsProject()
    );
    function check() {
      if (error) {
        process.exit(1);
      }
    }
  
    tsResult.on('finish', check);
    tsResult.on('end', check);
    const tsFilesStream = babelify(tsResult.js);
    const tsd = tsResult.dts.pipe(gulp.dest(dir));
  
    return merge2([ tsFilesStream, tsd ]);
}

function babelify(js: stream.Readable) {   
  
    const stream = js
      .pipe(sourcemaps.init())
      .pipe(sourcemaps.write('.'));
  
    return stream.pipe(gulp.dest(dir));
}

function runCrawl(callback: (error?: any) => void){
  return run(callback, "crawl");
}

function readUrls(callback: (error?: any) => void){
  return run(callback, "readUrls");
}

function run(callback: (error?: any) => void, command: string){
    const main = require("./dist/index");
    
    const functionToRun = main[command];
    
    const outputPromise = functionToRun(callback);

    return outputPromise;
}

function install(cb: (error?: any) => void) {
    var npm = require("npm");
    var npmConfig = {};

    npm.load(npmConfig, function (er: any) {
        if (er) return cb(er);
        npm.commands.install([], function (er: any, data: any) { cb(er); });
        npm.on("log", function (message: string) { console.log(message); });
    });
}


const bootstrap = series(install, runCompile);
const build = series(runCompile);
const crawl = series(runCompile, runCrawl);
const read = series(runCompile, readUrls);

export { bootstrap, build, crawl, read };
export default build;