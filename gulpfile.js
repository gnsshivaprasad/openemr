'use strict';

// modules
const csso = require('gulp-csso');
const del = require('del');
const fs = require('fs');
const glob = require('glob');
const gap = require('gulp-append-prepend');
const replace = require('replace-in-file');
const gulp = require('gulp');
const argv = require('minimist')(process.argv.slice(2));
const gulpif = require('gulp-if');
const prefix = require('autoprefixer');
const postcss = require('gulp-postcss');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const gulp_watch = require('gulp-watch');
const injector = require('gulp-inject-string');

// package.json
const packages = require('./package.json');

// configuration
let config = {
    all: [], // must always be empty

    // Command Line Arguments
    dev: argv['dev'],
    build: argv['b'],
    install: argv['i'],

    // Source file locations
    src: {
        styles: {
            style_portal: 'interface/themes/patientportal-*.scss',
            style_tabs: 'interface/themes/tabs_style_*.scss',
            style_uni: 'interface/themes/oe-styles/style_*.scss',
            style_color: 'interface/themes/colors/*.scss',
            directional: 'interface/themes/directional.scss'
        }
    },
    dist: {
        assets: 'public/assets/'
    },
    dest: {
        themes: 'public/themes'
    }
};

// Clean up lingering static themes
function clean(done) {
    del.sync([config.dest.themes + "/*"]);
    done();
}

// Parses command line arguments
function ingest(done) {
    if (config.dev && typeof config.dev !== "boolean") {
        config.dev = true;
    }
    done();
}

// definition of header for all compiled css
const autoGeneratedHeader = `
/*! This style sheet was autogenerated using gulp + scss
 *  For usage instructions, see: https://github.com/openemr/openemr/blob/master/interface/README.md
 */
`;

// standard themes css compilation
function styles_style_portal() {
    return gulp.src(config.src.styles.style_portal)
    .pipe(injector.replace('// bs4import', '@import "../../public/assets/bootstrap/scss/bootstrap";'))
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([ prefix() ]))
    .pipe(gap.prependText(autoGeneratedHeader))
    .pipe(gulpif(!config.dev, csso()))
    .pipe(gulpif(!config.dev, sourcemaps.write()))
    .pipe(gulp.dest(config.dest.themes));
}
// standard themes css compilation
function styles_style_uni() {
    return gulp.src(config.src.styles.style_uni)
        .pipe(injector.replace('// bs4import', '@import "../../../public/assets/bootstrap/scss/bootstrap";'))
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss([ prefix() ]))
        .pipe(gap.prependText(autoGeneratedHeader))
        .pipe(gulpif(!config.dev, csso()))
        .pipe(gulpif(!config.dev, sourcemaps.write()))
        .pipe(gulp.dest(config.dest.themes));
}

// color themes css compilation
function styles_style_color() {
    return gulp.src(config.src.styles.style_color)
        .pipe(injector.replace('// bs4import', '@import "../../../public/assets/bootstrap/scss/bootstrap";'))
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss([ prefix() ]))
        .pipe(gap.prependText(autoGeneratedHeader))
        .pipe(gulpif(!config.dev, csso()))
        .pipe(gulpif(!config.dev, sourcemaps.write()))
        .pipe(gulp.dest(config.dest.themes));
}

// Tabs CSS compilation
function styles_style_tabs() {
    return gulp.src(config.src.styles.style_tabs)
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss([ prefix() ]))
        .pipe(gap.prependText(autoGeneratedHeader))
        .pipe(gulpif(!config.dev, csso()))
        .pipe(gulpif(!config.dev, sourcemaps.write()))
        .pipe(gulp.dest(config.dest.themes));
}

// rtl standard themes css compilation
function rtl_style_portal() {
    return gulp.src(config.src.styles.style_portal)
        .pipe(gap.prependText('$dir: rtl;\n@import "rtl";\n@import "directional";\n')) // watch out for this relative path!
        .pipe(gap.appendText('@include if-rtl { @include rtl_style; @include portal_style; }\n'))
        .pipe(injector.replace('// bs4import', '@import "oemr-rtl";'))
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss([ prefix() ]))
        .pipe(gap.prependText(autoGeneratedHeader))
        .pipe(gulpif(!config.dev, csso()))
        .pipe(gulpif(!config.dev, sourcemaps.write()))
        .pipe(rename({ prefix: "rtl_" }))
        .pipe(gulp.dest(config.dest.themes));
}

// rtl standard themes css compilation
function rtl_style_uni() {
    return gulp.src(config.src.styles.style_uni)
        .pipe(gap.prependText('$dir: rtl;\n@import "../rtl";\n')) // watch out for this relative path!
        .pipe(gap.appendText('@include if-rtl { @include rtl_style; #bigCal { border-right: 1px solid $black !important; } }\n'))
        .pipe(injector.replace('// bs4import', '@import "../oemr-rtl";'))
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss([ prefix() ]))
        .pipe(gap.prependText(autoGeneratedHeader))
        .pipe(gulpif(!config.dev, csso()))
        .pipe(gulpif(!config.dev, sourcemaps.write()))
        .pipe(rename({ prefix: "rtl_" }))
        .pipe(gulp.dest(config.dest.themes));
}

// rtl color themes css compilation
function rtl_style_color() {
    return gulp.src(config.src.styles.style_color)
        .pipe(gap.prependText('$dir: rtl;\n@import "../rtl";\n')) // watch out for this relative path!
        .pipe(gap.appendText('@include if-rtl { @include rtl_style; #bigCal { border-right: 1px solid $black !important; } }\n'))
        .pipe(injector.replace('// bs4import', '@import "../oemr-rtl";'))
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
		.pipe(postcss([ prefix() ]))
        .pipe(gap.prependText(autoGeneratedHeader))
        .pipe(gulpif(!config.dev, csso()))
        .pipe(gulpif(!config.dev, sourcemaps.write()))
        .pipe(rename({ prefix: "rtl_" }))
        .pipe(gulp.dest(config.dest.themes));
}

// rtl standard themes css compilation
function rtl_style_tabs() {
    return gulp.src(config.src.styles.style_tabs)
        .pipe(gap.prependText('$dir: rtl;\n@import "rtl";\n')) // watch out for this relative path!
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss([ prefix() ]))
        .pipe(gap.prependText(autoGeneratedHeader))
        .pipe(gulpif(!config.dev, csso()))
        .pipe(gulpif(!config.dev, sourcemaps.write()))
        .pipe(rename({ prefix: "rtl_" }))
        .pipe(gulp.dest(config.dest.themes));
}

// compile themes
const styles = gulp.parallel(styles_style_color, styles_style_uni, styles_style_portal, styles_style_tabs, rtl_style_color, rtl_style_uni, rtl_style_portal, rtl_style_tabs);

// Copies (and distills, if possible) assets from node_modules to public/assets
function install(done) {
    // combine dependencies and napa sources into one object
    const dependencies = packages.dependencies;
    for (let key in packages.napa) {
        if (packages.napa.hasOwnProperty(key)) {
            dependencies[key] = packages.napa[key];
        }
    }

    for (let key in dependencies) {
        // check if the property/key is defined in the object itself, not in parent
        if (dependencies.hasOwnProperty(key)) {
            if (key == 'dwv') {
                // dwv is special and need to copy dist, decoders and locales
                gulp.src('node_modules/' + key + '/dist/**/*')
                    .pipe(gulp.dest(config.dist.assets + key + '/dist'));
                gulp.src('node_modules/' + key + '/decoders/**/*')
                    .pipe(gulp.dest(config.dist.assets + key + '/decoders'));
                gulp.src('node_modules/' + key + '/locales/**/*')
                    .pipe(gulp.dest(config.dist.assets + key + '/locales'));
            } else if (key == 'bootstrap' || key == 'bootstrap-rtl' || key == 'bootswatch') {
                // bootstrap, bootstrap-v4-rtl, and bootswatch are special and need to copy dist and scss
                gulp.src('node_modules/' + key + '/dist/**/*')
                    .pipe(gulp.dest(config.dist.assets + key + '/dist'));
                gulp.src('node_modules/' + key + '/scss/**/*')
                    .pipe(gulp.dest(config.dist.assets + key + '/scss'));
            } else if (key == '@ttskch/select2-bootstrap4-theme') {
                // @ttskch/select2-bootstrap4-theme is special and need to copy dist and src
                //  modify src/layout.scss in order for sass build to work by removing:
                //   @import "~bootstrap/scss/functions";
                //   @import "~bootstrap/scss/variables";
                //   @import "~bootstrap/scss/mixins";
                gulp.src('node_modules/' + key + '/dist/**/*')
                    .pipe(gulp.dest(config.dist.assets + key + '/dist'));
                gulp.src('node_modules/' + key + '/src/**/*')
                    .pipe(gulp.dest(config.dist.assets + key + '/src'))
                    .on('end', function() {
                        replace({
                            files: config.dist.assets + key + '/src/layout.scss',
                            from:
                                [
                                    /@import "~bootstrap\/scss\/functions";/,
                                    /@import "~bootstrap\/scss\/variables";/,
                                    /@import "~bootstrap\/scss\/mixins";/
                                ],
                            to: '',
                        });
                    });
            } else if (fs.existsSync('node_modules/' + key + '/dist')) {
                // only copy dist directory, if it exists
                gulp.src('node_modules/' + key + '/dist/**/*')
                    .pipe(gulp.dest(config.dist.assets + key + '/dist'));
            } else {
                // copy everything
                gulp.src('node_modules/' + key + '/**/*')
                    .pipe(gulp.dest(config.dist.assets + key));
            }
        }
    }

    done();
}

function watch() {
    // watch all changes and re-run styles
    gulp.watch('./interface/**/*.scss', { interval: 1000, mode: 'poll' }, styles);

	// watch php separately since autoprefix is not needed
	gulp_watch('./interface/themes/*.php', { ignoreInitial: false })
		.pipe(gulp.dest(config.dest.themes));

    // watch all changes to css files in themes and
	// autoprefix them before copying to public
    return gulp_watch('./interface/themes/*.css', { ignoreInitial: false })
		.pipe(postcss([ prefix() ]))
        .pipe(gulp.dest(config.dest.themes));
}

function sync() {
    // copy all leftover root-level components to the theme directory
    // hoping this is only temporary
	// Copy php file separately since we don't need to autoprefix them
	gulp.src(['interface/themes/*.php'])
        .pipe(gulp.dest(config.dest.themes));

	// Copy CSS files and autoprefix them
    return gulp.src(['interface/themes/*.css'])
		.pipe(postcss([ prefix() ]))
        .pipe(gulp.dest(config.dest.themes));
}

// Export watch task
exports.watch = watch;

// Export pertinent default task
// - Note that the default task runs if no other task is chosen,
//    which is generally how this script is always used (except in
//    rare case where the user is running the watch task).
if (config.install) {
    exports.default = gulp.series(install)
} else {
    exports.default = gulp.series(clean, ingest, styles, sync);
}
