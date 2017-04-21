var gulp = require('gulp'),
    concatCss = require('gulp-concat-css'),
    concatJs = require('gulp-concat-js'),
    csso = require('gulp-csso'),
    sassCompile = require('gulp-sass'),
    server = require('gulp-webserver'),
    uglify = require('gulp-uglify');

gulp.task('build:js:dist', function () {

});

gulp.task('build:js:vendor', function () {

});

gulp.task('build:js', ['build:js:dist', 'build:js:vendor']);

gulp.task('build:css:dist', function () {

});

gulp.task('build:css:vendor', function () {

});

gulp.task('build:css', ['build:css:dist', 'build:css:vendor']);

gulp.task('build', ['build:js', 'build:css']);

gulp.task('server', function () {
    gulp.src('src')
        .pipe(server({
            livereload: true,
            directoryListing: true,
            open: false
        }));
});

gulp.task('default', ['build', 'server']);