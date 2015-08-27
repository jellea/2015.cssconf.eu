var path = require('path');
var babelify = require('babelify');

module.exports = function(grunt) {
  'use strict';

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    browserify: {
      dist: {
        options: {
          browserifyOptions: {
            debug: true
          },
          transform: [
            babelify.configure({
              // allow ES7 features
              stage: 0
            })
          ]
        },
        files: {
          'dest/assets/js/cssconf.js': ['assets/js/cssconf.js']
        }
      }
    },
    sass: {
      dist: {
        options: {
          style: 'compressed'
        },
        files: {
          'dest/assets/fonts.css': 'assets/styles/fonts.scss',
          'dest/assets/cssconf-2015.css': 'assets/styles/styles.scss'
        }
      }
    },
    autoprefixer: {
      dist: {
        options: {
          map: true,
          browsers: ['last 2 versions']
        },
        files: {
          'dest/assets/cssconf-2015.css': 'dest/assets/cssconf-2015.css',
          'dest/assets/fonts.css': 'dest/assets/fonts.css'
        }
      }
    },
    watch: {
      css: {
        files: 'assets/styles/*.scss',
        tasks: ['styles']
      },
      html: {
        files: 'templates/**/*',
        tasks: ['assemble']
      },
      content: {
        files: 'content/**/*',
        tasks: ['assemble']
      },
      js: {
        files: 'assets/js/**/*.js',
        tasks: ['browserify']
      }
    },
    assemble: {
      options: {
        flatten: false,
        partials: ['templates/partials/*.hbs'],
        layoutdir: 'templates/layouts',
        layout: 'default.hbs',
        data: 'package.json',
        helpers: ['./helpers.js']
      },
      site: {
        files: [
          {
            dest: 'dest/',
            cwd: 'templates',
            src: '{,speaker/}*.hbs',
            expand: true
          }
        ]
      }
    },
    copy: {
      main: {
        files: [{
          expand: true,
          src: ['assets/img/**', 'assets/js/modernizr.custom.js', 'assets/svg/*/**'],
          dest: 'dest/'
        }]
      },
      favicon: {
        files: [{
          expand: true,
          cwd: 'assets',
          src: ['favicon.ico'],
          dest: 'dest/'
        }]
      }
    },
    connect: {
      server: {
        options: {
          port: 3000,
          base: 'dest',
          middleware: function(connect, options, middlewares) {

            // rewrite folders to html files
            middlewares.unshift(function(req, res, next) {
              var ext = path.extname(req.url);
              if (ext === '' && req.url.length > 1) {
                req.url = req.url.substr(0, req.url.length -1) + '.html';
              }
              return next();
            });

            // rewrite cache busting urls
            middlewares.unshift(function(req, res, next) {
              if (req.url.match(/^\/assets\/\d+\.\d+\.\d+\//)) {
                req.url = req.url.replace(/^\/assets\/\d+\.\d+\.\d+\//, '/assets/');
              }
              return next();
            });

            return middlewares;
          }
        }
      }
    },
    clean: ['dest'],
    csso: {
      dist: {
        options: {
          report: 'gzip'
        },
        files: {
          'dest/assets/cssconf-2015.css': ['dest/assets/cssconf-2015.css'],
          'dest/assets/fonts.css': ['dest/assets/fonts.css']
        }
      }
    },
    uglify: {
      dist: {
        files: {
          'dest/assets/js/cssconf.js': ['dest/assets/js/cssconf.js'],
          'dest/assets/js/modernizr.custom.js': ['dest/assets/js/modernizr.custom.js'],
        }
      }
    }
  });

  grunt.loadNpmTasks('assemble');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-autoprefixer');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-csso');
  grunt.loadNpmTasks('grunt-contrib-uglify');


  grunt.registerTask('styles', [
    'sass',
    'autoprefixer'
  ]);

  grunt.registerTask('default', [
    'clean',
    'assemble',
    'sass',
    'autoprefixer',
    'copy',
    'browserify'
  ]);

  grunt.registerTask('build', [
    'default',
    'csso',
    'uglify'
  ]);

  grunt.registerTask('dev', [
    'default',
    'connect',
    'watch'
  ]);
};
