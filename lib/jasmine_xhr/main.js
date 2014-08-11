/* global jasmine:false, sinon:false */
define([ './phantomjs_polyfills' ], function() {
  var defaultHeaders = {
    'Content-Type': 'application/json'
  };

  function createServer(options) {
    var server;

    server = sinon.fakeServer.create();
    server.autoRespond = options.autoRespond === true;
    server.autoRespondAfter = options.autoRespondAfter;

    return server;
  }

  function setup(options) {
    if (options.trackRequests) {
      this.xhr = sinon.useFakeXMLHttpRequest();
      this.requests = [];

      this.xhr.onCreate = function(request) {
        this.requests.push(request);
        this.lastRequest = request;
      }.bind(this);
    } else {
      this.server = createServer(options);
    }

    extendDSL.call(this, !options.trackRequests);
  }

  function extendDSL(useServer) {
    // cross-support for PromiseSuite - automatically flushed the promise
    // queue after a server response
    var flush = function() {
      if (this.flush) {
        this.flush();
      }
    }.bind(this);

    if (useServer) {
      this.respondWith = this.server.respondWith.bind(this.server);
      this.respond = function() {
        this.server.respond();

        flush();
      };

      this.respondWithJSON = function(method, url, response) {
        response[2] = JSON.stringify(response[2]);
        return this.server.respondWith(method, url, response);
      };

      this.reloadServer = function() {
        this.server.restore();
        this.server = createServer();
      };
    } else {
      this.respondTo = function(xhrRequest, statusCode, headers, body) {
        var rc;

        if (arguments.length === 3) {
          body = headers;
          headers = {};
        }

        if (!headers) {
          headers = {};
        }

        Object.keys(defaultHeaders).forEach(function(header) {
          if (headers[header] === undefined) {
            headers[header] = defaultHeaders[header];
          }
        });

        rc = xhrRequest.respond(statusCode, headers, JSON.stringify(body));

        flush();

        return rc;
      };
    }

  }

  function teardown() {
    if (this.server) {
      this.server.restore();
      this.server = undefined;
    } else if (this.xhr) {
      this.xhr.restore();
      this.xhr = this.requests = undefined;
    }
  }

  /**
   * Creates a fake XHR server for each spec in the given suite. You can reach
   * the server instance INSIDE each spec by using `this.server` or by using the
   * instance() method in the returned object.
   *
   * @note
   * The server will be set to auto-respond automatically, so you won't have to
   * call sinon.server#respond() or anything.
   *
   * @param {Jasmine.TestSuite} testSuite
   *        Your `describe()` test suite.
   *
   * @param {Object} options
   * @param {Boolean} [autoRespond=true]
   *        Should the server respond as soon as a request is made? If false,
   *        use "this.respond()" to manually flush the pending request queue.
   *
   * @param {Boolean} [trackRequests=false]
   *        Pass to true if you want manual tracking and management of requests,
   *        e.g, you will no longer be served with a "server" instance but
   *        instead each request made will be pushed to a "this.requests" stack
   *        which you can respond to manually.
   *
   * @example using the spec variable
   *     describe('my suite', function() {
   *       this.xhrSuite = true;
   *
   *       it('performs a server request', function() {
   *         this.respondWith('GET', '/users', [
   *           200,
   *           {},
   *           JSON.stringify({ "id": 1 })
   *         ]);
   *       });
   *     });
   *
   * @example
   *
   *     describe('my suite', function() {
   *       var servers = Fixtures.XHRSuite(this);
   *
   *       it('performs a server request', function() {
   *         servers.instance().respondWith(...);
   *       });
   *     });
   */
  var XHRSuite = function(testSuite, options) {
    testSuite._xhrSuiteInstalled = true;
    testSuite.beforeEach(function() {
      setup.call(this, options);
    });

    testSuite.afterEach(teardown);
  };

  Object.defineProperty(jasmine.Suite.prototype, 'xhrSuite', {
    set: function(flag) {
      if (!!flag) {
        if (this._xhrSuiteInstalled) {
          return;
        }

        XHRSuite(this, typeof flag === 'object' ? flag : {});
      }
    }
  });
});
