var gulp = require('gulp');
var babel = require('gulp-babel');
var watch = require('gulp-watch');

gulp.task('babel', function () {
  return gulp.src('src/**/*.js')
    .pipe(babel())
    .pipe(gulp.dest('lib'));
});

gulp.task('build', ['babel']);

gulp.task('default', ['build']);

//the watch task
gulp.task('watch', function() {
  gulp.watch('./src/**/*.js', ['babel'])
})