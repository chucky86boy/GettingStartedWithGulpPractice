// Load Node Modules/Plugins
import gulp from 'gulp';
import uglify from 'gulp-uglify';
import concat from 'gulp-concat';
import jshint from 'gulp-jshint';
import imagemin from 'gulp-imagemin';
import connect from 'connect';
import serve from 'serve-static';
import broswersync from 'browser-sync';
import postcss from 'gulp-postcss';
import cssnext from 'postcss-cssnext';
import cssnano from 'cssnano';
import browserify from 'browserify';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import plumber from 'gulp-plumber';
import beeper from 'beeper';
import del from 'del';
import sourcemaps from 'gulp-sourcemaps';

function onError(err) {
    beeper();
    console.log('Name', err.name);
    console.log('Reason:', err.reason);
    console.log('File:', err.file);
    console.log('Line:', err.line);
    console.log('Column:', err.column);
}

// Process Styles
gulp.task('styles', () => {
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
gulp.task('scripts', () => {
    return gulp.src('app/js/*.js')
    .pipe(sourcemaps.init())
	.pipe(jshint())
	.pipe(jshint.reporter('default'))
	.pipe(concat('all.js'))
	.pipe(uglify())
    .pipe(sourcemaps.write())
	.pipe(gulp.dest('dist/'));
});

gulp.task('images', () => {
    return gulp.src('app/img/*')
        .pipe(imagemin())
        .pipe(gulp.dest('dist/img'));
});
gulp.task('server', () => {
    return connect().use(serve(__dirname))
        .listen(8080)
        .on('listening', () => {
            console.log('Server Running: View at http://localhost:8080');
        });
});
gulp.task('browsersync', () => {
    return browsersync({
        server: {
            baseDir: './'
        }
    });
});
gulp.task('browserify', () => {
    return browserify('./app/js/app.js')
        .bundle()
        .pipe(source('bundle.js'))
        .pipe(buffer())
        .pipe(gulp.dest('dist'))
});
gulp.task('clean', () => {
    return del(['dist/*']);
});

gulp.task('watch', () => {
    gulp.watch('app/css/*.css',gulp.series('styles', browsersync.reload));
    gulp.watch('app/js/*.js', gulp.series('scripts', browsersync.reload));
    gulp.watch('app/img/*', gulp.series('images', browsersync.reload));
});

// Default Task
gulp.task('default', gulp.parallel('styles', 'scripts', 'images', 'server', 'browsersync', 'watch'));
