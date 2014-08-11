/* global requirejs: false, jasmine: false */
requirejs.config({
  baseUrl: '../lib',

  map: {
    '*': {
      'test': '../../test',
      'main': 'jasmine_xhr/main'
    }
  },

  paths: {
    'jquery': '../node_modules/jquery/dist/jquery'
  },

  deps: [
    'sinon'
  ],

  callback: function() {
    // Avoid infinite loop in the pretty printer when trying to print objects with
    // circular references.
    jasmine.MAX_PRETTY_PRINT_DEPTH = 3;
  }
});