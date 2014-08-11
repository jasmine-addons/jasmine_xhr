var grunt = require('grunt');

module.exports = {
  compile: {
    options: {
      baseUrl: './lib',
      mainConfigFile: '.requirejs',
      out: "dist/<%= grunt.config.get('pkg.name') %>.js",
      optimize: 'none',

      removeCombined:           false,
      inlineText:               true,
      preserveLicenseComments:  false,

      uglify2: {
        warnings: true,
        mangle:   true,

        output: {
          beautify: false
        },

        compress: {
          sequences:  true,
          dead_code:  true,
          loops:      true,
          unused:     true,
          if_return:  true,
          join_vars:  true
        }
      },

      pragmas: {
        production: true
      },

      rawText: {
        'jasmine_xhr': 'define(["jasmine_xhr/main"], function(addon) { return addon; });'
      },

      name: 'jasmine_xhr',
      deps: [ 'jasmine_xhr/main' ]
    }
  },
};