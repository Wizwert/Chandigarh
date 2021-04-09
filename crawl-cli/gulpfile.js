"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.watch = exports.build = exports.bootstrap = void 0;
// / <reference path="./types/gulp-eslint.d.ts" />
const gulp_1 = __importStar(require("gulp"));
/** JS and TS */
const gulp_typescript_1 = __importDefault(require("gulp-typescript"));
const gulp_sourcemaps_1 = __importDefault(require("gulp-sourcemaps"));
/** file */
const rimraf_1 = __importDefault(require("rimraf"));
const merge2_1 = __importDefault(require("merge2"));
const path_1 = __importDefault(require("path"));
// @ts-ignore
const gulp_eslint_1 = __importDefault(require("gulp-eslint"));
const cwd = process.cwd();
const dir = path_1.default.join(cwd, './dist');
const source = ['src/**/*.tsx', 'src/**/*.ts', 'typings/**/*.d.ts'];
function lint() {
    return gulp_1.default.src(source)
        .pipe(gulp_eslint_1.default())
        .pipe(gulp_eslint_1.default.formatEach())
        .pipe(gulp_eslint_1.default.results((results) => {
        // Called once for all ESLint results.
        console.log(`Total Results: ${results.length}`);
        console.log(`Total Warnings: ${results.warningCount}`);
        console.log(`Total Errors: ${results.errorCount}`);
    }))
        .pipe(gulp_eslint_1.default.failAfterError());
}
function runCompile() {
    const error = 0;
    const tsProject = gulp_typescript_1.default.createProject('tsconfig.json');
    const tsResult = gulp_1.default.src(source)
        .pipe(tsProject());
    const check = () => {
        if (error) {
            process.exit(1);
        }
    };
    tsResult.on('finish', check);
    tsResult.on('end', check);
    const tsFilesStream = babelify(tsResult.js);
    const tsd = tsResult.dts.pipe(gulp_1.default.dest(dir));
    return merge2_1.default([tsFilesStream, tsd]);
}
function babelify(js) {
    const stream = js
        .pipe(gulp_sourcemaps_1.default.init())
        .pipe(gulp_sourcemaps_1.default.write('.'));
    return stream.pipe(gulp_1.default.dest(dir));
}
function install(cb) {
    const npm = require('npm');
    const npmConfig = {};
    npm.load(npmConfig, function (er) {
        if (er)
            return cb(er);
        npm.commands.install([], function (er, data) {
            cb(er);
        });
        npm.on('log', function (message) {
            console.log(message);
        });
    });
}
function buildAndWatch(cb) {
    const tsProject = gulp_typescript_1.default.createProject('tsconfig.json');
    gulp_1.watch(['src/**/*.tsx', 'src/**/*.ts'], (cb) => {
        gulp_1.default.src(['src/**/*.tsx', 'src/**/*.ts'])
            // .pipe(eslint())
            .pipe(gulp_eslint_1.default.formatEach('compact'))
            .pipe(tsProject())
            .pipe(gulp_1.default.dest(dir));
        cb();
    });
}
function clearDirectory(cb) {
    rimraf_1.default.sync(dir);
    cb();
}
const bootstrap = gulp_1.series(install, runCompile);
exports.bootstrap = bootstrap;
const build = gulp_1.series(clearDirectory, runCompile);
exports.build = build;
const watchFiles = gulp_1.series(build, buildAndWatch);
exports.watch = watchFiles;
exports.default = build;
//# sourceMappingURL=gulpfile.js.map