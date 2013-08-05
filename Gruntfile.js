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
      banner = '/* <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n';

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
        tasks: [ 'jshint', 'uglify' ],
        options: {
          interrupt: true
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

  grunt.registerTask('default', ['jshint, uglify']);
};
