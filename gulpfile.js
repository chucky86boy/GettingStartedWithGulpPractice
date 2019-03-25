// Load Node Modules/Plugins
var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var jshint = require('gulp-jshint');
var imagemin = require('gulp-imagemin');
var connect = require('connect');
var serve = require('serve-static');
var broswersync = require('browser-sync');
var postcss = require('gulp-postcss');
var cssnext = require('postcss-cssnext');
var cssnano = require('cssnano');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var plumber = require('gulp-plumber');
var beeper = require('beeper');
var del = require('del');
var sourcemaps = require('gulp-sourcemaps');

function onError(err) {
    beeper();
    console.log('Name', err.name);
    console.log('Reason:', err.reason);
    console.log('File:', err.file);
    console.log('Line:', err.line);
    console.log('Column:', err.column);
}

// Process Styles
gulp.task('styles', function() {
    return gulp.src('app/css/*.css')
        .pipe(plumber({
            errorHAndler: onError
        }))
	.pipe(concat('all.css'))
        .pipe(postcss([
            cssnext(),
            cssnano({
                autoprefixer: false
            })
        ]))
	.pipe(gulp.dest('dist/'));
});

// Process Scripts
gulp.task('scripts', function() {
    return gulp.src('app/js/*.js')
    .pipe(sourcemaps.init())
	.pipe(jshint())
	.pipe(jshint.reporter('default'))
	.pipe(concat('all.js'))
	.pipe(uglify())
    .pipe(sourcemaps.write())
	.pipe(gulp.dest('dist/'));
});

gulp.task('images', function() {
    return gulp.src('app/img/*')
        .pipe(imagemin())
        .pipe(gulp.dest('dist/img'));
});
gulp.task('server', function(){
    return connect().use(serve(__dirname))
        .listen(8080)
        .on('listening', function(){
            console.log('Server Running: View at http://localhost:8080');
        });
});
gulp.task('browsersync', function(){
    return browsersync({
        server: {
            baseDir: './'
        }
    });
});
gulp.task('browserify', function() {
    return browserify('./app/js/app.js')
        .bundle()
        .pipe(source('bundle.js'))
        .pipe(buffer())
        .pipe(gulp.dest('dist'))
});
gulp.task('clean', function(){
    return del(['dist/*']);
});

gulp.task('watch', function() {
    gulp.watch('app/css/*.css',gulp.series('styles', browsersync.reload));
    gulp.watch('app/js/*.js', gulp.series('scripts', browsersync.reload));
    gulp.watch('app/img/*', gulp.series('images', browsersync.reload));
});

// Default Task
gulp.task('default', gulp.parallel('styles', 'scripts', 'images', 'server', 'browsersync', 'watch'));
