/**
 * Grunt file
 */
module.exports = function (grunt) {
	'use strict';

	var isProd = grunt.option('prod') ? true : false,
	isIpad = grunt.option('ipad') ? true : false,
	isMetro = grunt.option('metro') ? true : false,
	// Build language: en, ru, es etc.
	lang = grunt.option('lang') || 'en';

	// API url (prod and dev)
	var requrl = isProd ? '//wfm-client.azurewebsites.net' : 'http://localhost:3000';
	var wfmNodeUrl = isProd ? '//wfm-report.herokuapp.com' : 'http://localhost:3000';
	////wfm-node.azurewebsites.net

	// Target - destination folder plus config, for example:
	// dev (development)
	// dst (main distribution)
	// devipad (dev for IPad)
	// dstipad (distrib for IPad)
	var trgt = isProd ? 'dst' : 'dev';
	if (isIpad) {
		trgt += 'ipad';
	} else if (isMetro) {
		trgt += 'metro';
	}

	// Project configuration
	grunt.config.init({
		// Metadata
		pkg : grunt.file.readJSON('package.json'),
		src : 'src',
		// Use for < % template in JSON keys
		trgt : trgt,
		bowerFolder : 'bower_components',
		lang : lang,
		// Banner for scripts comments: author, licence etc.
		banner : '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
		'<%= grunt.template.today("yyyy-mm-dd") %>\n' +
		'* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
		' Licensed <%= pkg.license %> */\n',
		uniqueString : '<%= pkg.version %>',
		connect : {
			main : {
				options : {
					open : true, // Or need url string
					keepalive : true,
					port : 12345,
					base : '<%= trgt %>'
				}
			}
		},
		'gh-pages' : {
			options : {
				base : 'dst',
				message : 'chore(release): version <%= pkg.version %>',
				push : true
			},
			src : '**/*'
		},
		changelog : {
			options : {
				from : 'v0.9.7'
			}
		},
		gitlog : {
			options : {
				dest : 'doc/month.log',
				afterDate : new Date(2014, 4, 1),
				beforeDate : new Date(2014, 5, 1)
			}
		},
		jshint : {
			gruntfile : {
				options : {
					jshintrc : '.jshintrc'
				},
				src : 'Gruntfile.js'
			},
			cjs : {
				options : {
					jshintrc : '<%= src %>/cjs/.jshintrc'
				},
				files : [{
						expand : true,
						dot : true,
						cwd : '<%= src %>/cjs/',
						src : ['**/*.js']
					}
				]
			},
			app : {
				options : {
					jshintrc : '<%= src %>/js/.jshintrc'
				},
				files : [{
						expand : true,
						dot : true,
						cwd : '<%= src %>/js/',
						src : ['**/*.js']
					}
				]
			}
		},
		clean : {
			main : ['<%= trgt %>']
		},
		copy : {
			main : {
				files : [{
						expand : true,
						dot : true,
						cwd : '<%= src %>/',
						dest : '<%= trgt %>/',
						// Copy all files besides templates and scripts (which assembled separately)
						src : ['**/*', '!tpl/**/*', '!js/**/*', '!cjs/**/*']
					}
				]
			},
			bower_js : {
				files : [{
						expand : true,
						dot : true,
						flatten : true,
						cwd : '<%= bowerFolder %>/',
						dest : '<%= trgt %>/js/',
						src : ['moment/moment.js', 'requirejs/require.js', 'knockout/knockout.js',
							'console-shim/console-shim.js', 'es5-shim/es5-shim.js', 'es5-shim/es5-sham.js',
							'pickadate/lib/picker.js', 'pickadate/lib/picker.date.js', 'pickadate/lib/picker.time.js',
							'jQuery-slimScroll/jquery.slimscroll.js', 'blueimp-file-upload/js/vendor/jquery.ui.widget.js',
							'blueimp-file-upload/js/jquery.fileupload.js', 'blueimp-file-upload/js/jquery.iframe-transport.js',
							'blueimp-canvas-to-blob/js/canvas-to-blob.js',
							'blueimp-load-image/js/load-image.js', 'blueimp-load-image/js/load-image-*.js',
							'd3/d3.min.js', 'jquery.panzoom/dist/jquery.panzoom.js', 'jcrop/js/jquery.Jcrop.js']
					}
				]
			},
			bower_jquery : {
				files : [{
						expand : true,
						dot : true,
						flatten : true,
						cwd : '<%= bowerFolder %>/jquery/dist/',
						dest : '<%= trgt %>/js/',
						src : ['jquery.min.js', 'jquery.min.map', 'jquery.js']
					}
				]
			},
			bower_bootstrap_js : {
				files : [{
						expand : true,
						dot : true,
						flatten : true,
						cwd : '<%= bowerFolder %>/bootstrap-sass/vendor/assets/javascripts/bootstrap/',
						dest : '<%= trgt %>/js/bootstrap/',
						src : ['modal.js', 'dropdown.js', 'transition.js']
					}
				]
			},
			bower_img : {
				files : [{
						expand : true,
						dot : true,
						flatten : true,
						cwd : '<%= bowerFolder %>/',
						dest : '<%= trgt %>/img/',
						src : []
					}
				]
			},
			// Ready css files to import to main sass
			bower_css_sass : {
				files : {
					'<%= trgt %>/scss/pickadate/_default.scss' : '<%= bowerFolder %>/pickadate/lib/themes/default.css',
					'<%= trgt %>/scss/pickadate/_default-date.scss' : '<%= bowerFolder %>/pickadate/lib/themes/default.date.css',
					'<%= trgt %>/scss/pickadate/_default-time.scss' : '<%= bowerFolder %>/pickadate/lib/themes/default.time.css',
					'<%= trgt %>/scss/fileupload/_fileupload.scss' : '<%= bowerFolder %>/blueimp-file-upload/css/jquery.fileupload.css',
					'<%= trgt %>/scss/wfm/_wfm-icons.scss' : '<%= bowerFolder %>/wfm-fonts/dst/css/_wfm-icons.scss',
					'<%= trgt %>/scss/jcrop/_jcrop.scss' : '<%= bowerFolder %>/jcrop/css/jquery.Jcrop.css',
					// Copy as usual image in the css root for jcrop stylesheet
					'<%= trgt %>/css/Jcrop.gif' : '<%= bowerFolder %>/jcrop/css/Jcrop.gif'
				}
			},
			bower_bootstrap_sass : {
				files : [{
						expand : true,
						flatten : true,
						cwd : '<%= bowerFolder %>/bootstrap-sass/vendor/assets/stylesheets/bootstrap/',
						src : ['*.scss'], // Redefined variables in project main scss file
						dest : '<%= trgt %>/scss/bootstrap/'
					}
				]
			},
			bower_fonts : {
				files : [{
						expand : true,
						dot : true,
						flatten : true,
						cwd : '<%= bowerFolder %>/',
						dest : '<%= trgt %>/fonts/',
						src : ['bootstrap-sass/vendor/assets/fonts/bootstrap/*', 'wfm-fonts/dst/fonts/*']
					}
				]
			}
		},
		jsdoc : {
			main : {
				src : ['src/cjs/**/*.js'],
				options : {
					destination : 'doc'
				}
			}
		},
		// exec : {
		// cjs : {
		// cmd : 'node_modules\\.bin\\r.js.cmd -convert src\\cjs dev\\js',
		// stdout : false
		// }
		// },
		assemble : {
			options : {
				engine : 'handlebars',
				// Main properties
				// Change "en" to <%= lang %> parameters - it doesn't work yet for second time of using
				data : ['<%= src %>/tpl/data/syst.json', '<%= bowerFolder %>/wfm-dict/lang/en/lang.json', 'package.json'],
				// Build configuration properties
				conf : {
					// Request url (begin of the path)
					// if exists - other domain (CORS requests - for local testing and side programs)
					// if empty - the same domain (simple requests)
					// Example {{requrl}}/api/values
					requrl : requrl,
					wfmNodeUrl : wfmNodeUrl,
					isProd : isProd
					// isIpad: isIpad,
					// isMetro: isMetro
				}
			},
			html : {
				options : {
					partials : ['<%= src %>/tpl/partials/*.hbs']
				},
				files : [{
						expand : true,
						cwd : '<%= src %>/tpl/pages/',
						src : '**/*.hbs',
						dest : '<%= trgt %>'
					}
				]
			},
			// Assemble js files: replace {{}} to assemble data
			js : {
				options : {
					ext : '.js'
				},
				files : [{
						expand : true,
						cwd : '<%= src %>/js/',
						src : ['**/*.js'],
						dest : '<%= trgt %>/js/'
					}
				]
			},
			cjs : {
				options : {
					ext : '.js',
					// Create requirejs modules from commonjs
					postprocess : function (src) {
						return 'define(function (require, exports, module) {\n' + src + '\n});';
					}
				},
				files : [{
						expand : true,
						cwd : '<%= src %>/cjs/',
						src : ['**/*.js'],
						dest : '<%= trgt %>/js/'
					}
				]
			}
		},
		compass : {
			main : {
				options : {
					//appDir: '<%= trgt %>',
					outputStyle : 'compressed',
					sassDir : '<%= trgt %>/scss',
					cssDir : '<%= trgt %>/css',
					specify : ['<%= trgt %>/scss/main-light.scss',
						'<%= trgt %>/scss/main-dark.scss'],
					relativeAssets : true,
					cacheDir : '.sass-cache'
					//debugInfo: true
					//raw: 'sass_options = {:sourcemap => true}'
					//sourcemap : true
				}
			}
		},
		// sass : {
		// options : {
		// sourcemap : true,
		// style : 'compressed'
		// },
		// main : {
		// files : {
		// '<%= trgt %>/css/main-bundle-<%= pkg.version %>.css' : '<%= trgt %>/scss/main.scss'
		// }
		// }
		// },
		requirejs : {
			main : {
				options : {
					baseUrl : '<%= trgt %>/js/',
					name : 'main',
					out : '<%= trgt %>/js/main-bundle-<%= pkg.version %>.js',
					mainConfigFile : '<%= trgt %>/js/require-config.js',
					optimize : 'uglify2',
					// http://requirejs.org/docs/optimization.html#sourcemaps
					generateSourceMaps : true,
					preserveLicenseComments : false,
					////useSourceUrl: true,
					wrapShim : true,
					//  wrap: true, // wrap in closure
					// jQuery automatically excluded if it's loaded from CDN
					exclude : ['jquery', 'd3'],
					include : ['es5-shim', 'es5-sham', 'console-shim',
						'bootstrap/transition', 'bootstrap/modal', 'bootstrap/dropdown',
						'jquery.panzoom',
						'bindings/all-bindings', 'bindings/svg-bindings',
						'knockout', 'helpers/knockout-lazy',
						// Services (alphabetically sorted)
						'services/auth',
						'services/company-user',
						'services/datacontext',
						'services/register',
						'services/section-pattern',
						'services/widgout',
						// Viewmodels
						'viewmodels/workspace',
						// Models
						'base-models/stage-base',
						'base-models/widget-base',
						'base-viewmodels/stage-base',
						'base-viewmodels/widget-base',
						'models/employee',
						'models/file-spec',
						'models/job-type',
						'models/prop-spec',
						'models/section-pattern',
						'models/user-profile',
						'models/wegion',
						'models/wfm-parameter',
						'models/workspace']
				}
			}
		},
		validation : {
			options : {
				// reset: grunt.option('reset') || false,
				stoponerror : true,
				failHard : true,
				// Ignores these errors
				relaxerror : ['Bad value X-UA-Compatible for attribute http-equiv on element meta.',
					'Attribute data-bind not allowed on element g at this point.',
					'Attribute data-bind not allowed on element svg at this point.',
					'Attribute data-bind not allowed on element circle at this point.',
					'Attribute data-bind not allowed on element rect at this point.',
					'Bad value 100% for attribute colspan on element td: Expected a digit but saw % instead.',
					'A table row was',
					'Element img is missing required attribute src.',
					'An img element must have an alt attribute, except under certain conditions. For details, consult guidance on providing text alternatives for images.']
			},
			files : {
				src : ['<%= trgt %>/index.html']
			}
		},
		uglify : {
			dist : {
				options : {
					sourceMap : true
				},
				files : {
					'dst/js/require.min.js' : ['dst/js/require.js']
				}
			}
		},
		htmlmin : { // Task
			dist : { // Target
				options : { // Target options
					removeComments : false,
					collapseWhitespace : true,
					caseSensitive : true
				},
				files : { // Dictionary of files
					'dst/index.html' : 'dst/index.html' // 'destination': 'source'
				}
			}
		},
		bump : {
			options : {
				files : ['package.json', 'bower.json'],
				updateConfigs : ['pkg'],
				commit : false,
				// commitMessage: cmtmsg,
				// commitFiles: ['-a'],
				createTag : false,
				// tagName: 'v%VERSION%',
				// tagMessage: 'Version %VERSION%',
				push : false
				// pushTo: 'origin'
			}
		},
		'ftp-deploy' : {
			build : {
				auth : {
					host : 'waws-prod-am2-001.ftp.azurewebsites.windows.net',
					port : 21,
					authKey : 'key1'
				},
				src : 'dst',
				dest : '/site/wwwroot/'
			}
		},
		// For development: run tasks when change files
		watch : {
			jshint_gruntfile : {
				files : ['<%= jshint.gruntfile.src %>'],
				tasks : ['jshint:gruntfile']
			},
			jshint_app : {
				options : {
					spawn : false
				},
				files : ['<%= src %>/js/**/*.js'],
				tasks : ['jshint:app']
			},
			jshint_cjs : {
				options : {
					spawn : false
				},
				files : ['<%= src %>/cjs/**/*.js'],
				tasks : ['jshint:cjs']
			},
			copy_main : {
				options : {
					cwd : '<%= src %>/',
					spawn : false
				},
				files : ['**/*', '!tpl/**/*', '!js/**/*', '!cjs/**/*'],
				tasks : ['copy:main']
			},
			// Update all template pages when change template data
			assemble_data : {
				files : ['<%= src %>/tpl/data/syst.json', '<%= bowerFolder %>/wfm-dict/lang/en/lang.json', 'package.json'],
				tasks : ['assemble:html', 'assemble:js', 'assemble:cjs']
			},
			assemble_html : {
				files : ['<%= src %>/tpl/**/*.hbs'],
				tasks : ['assemble:html']
			},
			assemble_js : {
				options : {
					spawn : false
				},
				files : ['<%= src %>/js/**/*.js'],
				tasks : ['assemble:js']
			},
			assemble_cjs : {
				options : {
					spawn : false
				},
				files : ['<%= src %>/cjs/**/*.js'],
				tasks : ['assemble:cjs']
			},
			compass_main : {
				options : {
					spawn : false
				},
				// Changed file will be copied to target dir, and then compassing
				files : ['<%= src %>/scss/**/*.scss'],
				tasks : ['compass:main']
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
		'jshint:cjs',

		// 2. Clean
		'clean:main',

		// 3. Copy plain and assembled files
		'copy:main', // Copy main files
		'copy:bower_js', // Copy unchanged files from bower folder: jquery, momentjs...
		'copy:bower_jquery', // Jquery loaded separately, maybe loaded from CDN
		'copy:bower_css_sass', // Copy css files as scss partials (to import to main-style.scss file)
		'copy:bower_fonts',
		'copy:bower_img',
		'copy:bower_bootstrap_js', // Copy unchanged files from bootstrap-sass
		'copy:bower_bootstrap_sass', // Copy bowe scss partials to main.css file may be import these partials
		'compass:main', // Make main sass file from copied file
		'assemble:js', // After copy all files to destination - replace all {{value}} - rewrite the same files
		'assemble:cjs', // Copy with assembling and transformation from commonjs module to requirejs modules
		'assemble:html' // Copy other files: Assemble and copy templates files
	];

	// 4. Bundle and minify for production
	if (isProd) {
		// // validate (only for production - long process)
		// // hand up on slow connections
		// tasks.push('validation');
		tasks.push('uglify:dist');
		// minify html
		tasks.push('htmlmin:dist');
		// Bundle with r.js
		tasks.push('requirejs:main');
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
		} else if (targetEvent === 'assemble_js') {
			changeFileSrc(['assemble', 'js', 'files'], filepath);
		} else if (targetEvent === 'assemble_cjs') {
			changeFileSrc(['assemble', 'cjs', 'files'], filepath);
		} else if (targetEvent === 'jshint_app') {
			changeFileSrc(['jshint', 'app', 'files'], filepath);
		} else if (targetEvent === 'jshint_cjs') {
			changeFileSrc(['jshint', 'cjs', 'files'], filepath);
		}
		////grunt.log.writeln(targetEvent + ': ' + filepath + ' has ' + action);
	});

	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-htmlmin');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-html-validation');
	grunt.loadNpmTasks('assemble');
	grunt.loadNpmTasks('grunt-requirejs');
	grunt.loadNpmTasks('grunt-bump');
	grunt.loadNpmTasks('grunt-conventional-changelog');
	grunt.loadNpmTasks('grunt-gh-pages');
	grunt.loadNpmTasks('grunt-jsdoc');
	grunt.loadNpmTasks('grunt-notify');
	grunt.loadNpmTasks('grunt-git-log');
	grunt.loadNpmTasks('grunt-ftp-deploy');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-compass');
	//grunt.loadNpmTasks('grunt-contrib-sass');
	//grunt.loadNpmTasks('grunt-exec');
};
