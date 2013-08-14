/**
 * User: javarouka
 * Date: 13. 7. 27
 * Time: 오후 5:18
 */
module.exports = function(grunt) {

  var destinationName = '<%= pkg.name %>',
      sources = [
        'raop.js'
      ],
      buildDirPath = "build/",
      taskOrder = ['jshint', /*'connect'*/ 'nodeunit', /*'qunit'*/ 'uglify'],
      banner = "/*\n <%= pkg.name %> JavaScript Library\n" +
        " author: javarouka@gmail.com\n" +
        " site: http://javarouka.github.io/raop.js\n" +
        " license: MIT\n" +
        " create date: <%= grunt.template.today('yyyy-mm-dd') %>\n" +
        "*/\n";

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: banner
      },
      build: {
        src: sources,
        dest: buildDirPath + destinationName + '.min.js'
      }
    },
    watch: {
      scripts: {
        files: sources,
        tasks: taskOrder,
        options: {
          interrupt: true
        }
      }
    },
    nodeunit: {
      all: ['test/**/*-test.js']
    },
    qunit: {
      all: {
        options: {
          urls: [
            'http://localhost:8000/test/raop.html'
          ]
        }
      }
    },
    connect: {
      server: {
        options: {
          port: 9999,
          base: '.'
        }
      }
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        eqnull: true,
        browser: true,
        globals: {
          jQuery: true,
          window: true,
          document: true
        }
      },
      uses_defaults: sources
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  grunt.registerTask('default', taskOrder);
};
