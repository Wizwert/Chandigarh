declare const bootstrap: import("undertaker").TaskFunction;
declare const build: import("undertaker").TaskFunction;
declare const watchFiles: import("undertaker").TaskFunction;
export { bootstrap, build, watchFiles as watch };
export default build;
