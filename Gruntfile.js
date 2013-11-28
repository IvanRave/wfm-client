module.exports = function (grunt) {
    'use strict';

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('assemble');
    grunt.loadNpmTasks('grunt-requirejs');
    grunt.loadNpmTasks('grunt-bump');
    grunt.loadNpmTasks('grunt-conventional-changelog');
    grunt.loadNpmTasks('grunt-gh-pages');
    
    // By default = devSite
    var isProd = grunt.option('prod') ? true : false,
        isIpad = grunt.option('ipad') ? true : false,
		isMetro = grunt.option('metro') ? true : false,
        // Request url
        requrl = grunt.option('requrl') || 'http://wfm-client.azurewebsites.net',
        // Build language: en, ru, es etc.
        lang = grunt.option('lang') || 'en';
        
    // Commit message for bump feature
    var cmtheader = grunt.option('cmtmsg') || 'fix(project): change',
        cmtbody = grunt.option('cmtbody') || 'some changes',
        cmtfooter = grunt.option('cmtfooter') || 'some footer';
    
    var cmtmsg = cmtheader + '\n' + cmtbody + '\n' + cmtfooter;
    // var cmtType = grunt.option('cmtType') || 'fix',
        // // Scope could be anything specifying place of the commit change
        // cmtScope = grunt.option('cmtScope') || 'project',
        // use imperative, present tense: “change” not “changed” nor “changes”
        // don't capitalize first letter
        // no dot (.) at the end
    
    // Allowed <type>
    // feat (feature)
    // fix (bug fix)
    // docs (documentation)
    // style (formatting, missing semi colons, …)
    // refactor
    // test (when adding missing tests)
    // chore (maintain)
    // var allowedCmtTypes = ['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore'];
    
    // if (allowedCmtTypes.indexOf(cmtType) === -1){
        // cmtType = 'fix';
    // }

    // Target - destination folder plus config, for example: 
    // dev (development)
    // dst (main distribution)
    // devipad (dev for IPad)
    // dstipad (distrib for IPad)
    var trgt = isProd ? 'dst' : 'dev';
    if (isIpad) {
        trgt += 'ipad';
    }
    else if (isMetro) {
        trgt += 'metro';
    }

    // Project configuration
    grunt.config.init({
        // Metadata
        pkg: grunt.file.readJSON('package.json'),
        src: 'src',
        // Use for < % template in JSON keys
        trgt: trgt,
        bowerFolder: 'bower_components',
        lang: lang,
        // Banner for scripts comments: author, licence etc.
        banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
          '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
          '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
          ' Licensed <%= pkg.license %> */\n',
        uniqueString: '<%= pkg.version %>',
        connect: {
            main: {
                options: {
                    open: true, // Or need url string
                    keepalive: true,
                    port: 12345,
                    base: '<%= trgt %>'
                }
            }
        },
        'gh-pages': {
          options: {
            base: 'dst'
          },
          src: '**/*',
          tag: 'v<%= pkg.version %>',
          message: cmtmsg,
          push: true
        },
        jshint: {
            gruntfile: {
                options: {
                    jshintrc: '.jshintrc'
                },
                src: 'Gruntfile.js'
            },
            app: {
                options: {
                    jshintrc: '<%= src %>/js/.jshintrc'
                },
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= src %>/js/',
                    src: ['app/**/*.js', 'main.js']
                }]
            }
        },
        clean: {
            main: ['<%= trgt %>']
        },
        copy: {
            main: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= src %>/',
                    dest: '<%= trgt %>/',
                    // Copy all files besides templates and app scripts (which assembled separately)
                    src: ['**/*', '!tpl/**/*', '!js/app/**/*', '!js/main.js']
                }]
            },
            bower_js: {
                files: [{
                    expand: true,
                    dot: true,
                    flatten: true,
                    cwd: '<%= bowerFolder %>/',
                    dest: '<%= trgt %>/js/',
                    src: ['jquery/jquery.js', 'moment/moment.js', 'angular/angular.js', 
                        'angular-route/angular-route.js', 'bootstrap/dist/js/bootstrap.js',
                        'requirejs/require.js', 'knockout/knockout.js', 
                        'console-shim/console-shim.js', 'es5-shim/es5-shim.js',
                        'pickadate/lib/picker.js', 'pickadate/lib/picker.date.js', 'pickadate/lib/picker.time.js',
                        'jQuery-slimScroll/jquery.slimscroll.js', 'blueimp-file-upload/js/vendor/jquery.ui.widget.js',
                        'blueimp-file-upload/js/jquery.fileupload.js', 'blueimp-file-upload/js/jquery.iframe-transport.js',
                        'blueimp-canvas-to-blob/js/canvas-to-blob.js',
                        'blueimp-load-image/js/load-image.js', 'blueimp-load-image/js/load-image-*.js',
                        'blueimp-gallery/js/blueimp-gallery.js', 'blueimp-gallery/js/blueimp-helper.js',
                        'd3/d3.js']
                }]
            },
            bower_img: {
                files: [{
                   expand: true,
                    dot: true,
                    flatten: true,
                    cwd: '<%= bowerFolder %>/',
                    dest: '<%= trgt %>/img/',
                    src: ['blueimp-gallery/img/play-pause.*', 'blueimp-gallery/img/loading.gif']
                }]
            },
            bower_css: {
                files: [{
                    expand: true,
                    dot: true,
                    flatten: true,
                    cwd: '<%= bowerFolder %>/',
                    dest: '<%= trgt %>/css/',
                    src: ['bootstrap/dist/css/bootstrap.css', 'bootstrap/dist/css/bootstrap-theme.css',
                    'pickadate/lib/themes/default.css', 'pickadate/lib/themes/default.date.css', 'pickadate/lib/themes/default.time.css',
                    'blueimp-file-upload/css/jquery.fileupload.css',
                    'blueimp-gallery/css/blueimp-gallery.css']
                }]
            },
            bower_fonts: {
                files: [{
                    expand: true,
                    dot: true,
                    flatten: true,
                    cwd: '<%= bowerFolder %>/',
                    dest: '<%= trgt %>/fonts/',
                    src: ['bootstrap/dist/fonts/*', 'wfm-fonts/fonts/*']
                }]
            }
        },
        assemble: {
            options: {
                engine: 'handlebars',
                // Main properties
                // TODO: Change "en" to <%= lang %> parameters - it doesn't work yet for second time of using
                data: ['<%= src %>/tpl/data/syst.json', '<%= bowerFolder %>/wfm-dict/lang/en/lang.json', 'package.json'],
                // Build configuration properties
                conf: {
                    // Request url (begin of the path)
                    // if exists - other domain (CORS requests - for local testing and side programs)
                    // if empty - the same domain (simple requests)
                    // Example {{requrl}}/api/values
                    requrl: requrl,
                    isProd: isProd
                    // isIpad: isIpad,
                    // isMetro: isMetro
                }
            },
            html: {
                options: {
                    partials: ['<%= src %>/tpl/partials/*.hbs']
                },
                files: [{
                    expand: true,
                    cwd: '<%= src %>/tpl/pages/',
                    src: '**/*.hbs',
                    dest: '<%= trgt %>'
                }]
            },
            // Assemble js files after copy in dest directory
            js: {
                options: {
                    ext: '.js'
                },
                files: [{
                    expand: true,
                    cwd: '<%= src %>/js/',
                    src: ['app/**/*.js', 'main.js'],
                    dest: '<%= trgt %>/js/'
                }]
            }
        },
        requirejs: {
            main: {
                options: {
                    baseUrl: '<%= trgt %>/js/',
                    name: 'main',
                    out: '<%= trgt %>/js/main-bundle-<%= pkg.version %>.js',
                    mainConfigFile: '<%= trgt %>/js/require-config.js',
                    optimize: 'uglify2',
                    // http://requirejs.org/docs/optimization.html#sourcemaps
                    ////generateSourceMaps: true,
                    ////preserveLicenseComments: false,
                    ////useSourceUrl: true,
                    //  wrap: true, // wrap in closure
                    // jQuery automatically excluded if it's loaded from CDN
                    include: ['es5-shim', 'console-shim', 'jquery', 'jquery.bootstrap', 'angular', 'angular-route',
                    'app/controllers/company', 'app/controllers/auth', 'app/controllers/register']
                }
            },
            workspace: {
                options: {
                    baseUrl: '<%= trgt %>/js/',
                    name: 'app/workspace-wrap',
                    out: '<%= trgt %>/js/app/workspace-wrap-bundle-<%= pkg.version %>.js',
                    mainConfigFile: '<%= trgt %>/js/require-config.js',
                    optimize: 'uglify2',
                    include: ['app/bindings'],
                    exclude: ['jquery', 'jquery.bootstrap']
                }
            }
        },
        changelog: {
            options: {
            }
        },
        bump: {
          options: {
            files: ['package.json', 'bower.json'],
            updateConfigs: ['pkg'],
            commit: true,
            commitMessage: cmtmsg,
            commitFiles: ['-a'],
            createTag: true,
            tagName: 'v%VERSION%',
            tagMessage: 'Version %VERSION%',
            push: true,
            pushTo: 'origin'
          }
        },
        // For development: run tasks when change files
        watch: {
            jshint_gruntfile: {
                files: ['<%= jshint.gruntfile.src %>'],
                tasks: ['jshint:gruntfile']
            },
            jshint_app: {
                options: {
                    spawn: false
                },
                files: ['<%= src %>/js/app/**/*.js', '<%= src %>/js/main.js'],
                tasks: ['jshint:app']
            },
            copy_main: {
                options: {
                    cwd: '<%= src %>/',
                    spawn: false
                },
                files: ['**/*', '!tpl/**/*', '!js/app/**/*', '!js/main.js'],
                tasks: ['copy:main']
            },
            // Update all template pages when change template data
            assemble_data: {
                files: ['<%= src %>/tpl/data/syst.json', '<%= bowerFolder %>/wfm-dict/lang/en/lang.json', 'package.json'],
                tasks: ['assemble:html', 'assemble:js']
            },
            assemble_html: {
                files: ['<%= src %>/tpl/**/*.hbs'],
                tasks: ['assemble:html']
            },
            assemble_js: {
                options: {
                    spawn: false
                },
                files: ['<%= src %>/js/app/**/*.js', '<%= src %>/js/main.js'],
                tasks: ['assemble:js']
            }

            // livereload server: http://127.0.0.1:35729/livereload.js
            ////livereload: {
            ////    options: { livereload: true },
            ////    files: ['<%= trgt %>/**/*']
            ////}
        }
    });

    // Default task

    var tasks = [
      // 1. Check and test
     'jshint:gruntfile',
     'jshint:app',

      // 2. Clean
     'clean:main',

      // 3. Copy plain and assembled files
     'copy:main', // Copy main files
     'copy:bower_js', // Copy unchanged files from bower folder: jquery, momentjs...
     'copy:bower_css',
     'copy:bower_fonts',
     'copy:bower_img',
     'assemble:js', // After copy all files to destination - replace all {{value}} - rewrite the same files
     'assemble:html' // Copy other files: Assemble and copy templates files
    ];

    // 4. Bundle and minify for production
    if (isProd) {
        // Bundle with r.js
        tasks.push('requirejs:main');
        tasks.push('requirejs:workspace');
    }

    grunt.registerTask('default', tasks);

    // Change file src in dynamic file view
    // <param>fileArrPath: path to files object: http://gruntjs.com/api/grunt.config
    // <param>filepath: watched file (currently changed)
    function changeFileSrc(fileArrPath, filepath) {
        var changedFileArr = grunt.config.get(fileArrPath).map(function (file) {
            file.src = filepath.replace(file.cwd.replace(/\//g, '\\'), '');
            return file;
        });

        grunt.config.set(fileArrPath, changedFileArr);
    }

    grunt.event.on('watch', function (action, filepath, targetEvent) {
        // Copy only changed file
        if (targetEvent === 'copy_main') {
            changeFileSrc(['copy', 'main', 'files'], filepath);
        }
        else if (targetEvent === 'assemble_js') {
            changeFileSrc(['assemble', 'js', 'files'], filepath);
        }
        else if (targetEvent === 'jshint_app'){
            changeFileSrc(['jshint', 'app', 'files'], filepath);
        }
        ////grunt.log.writeln(targetEvent + ': ' + filepath + ' has ' + action);
    });
};