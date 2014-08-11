define(function(require) {
  var JasmineXHR = require('main');
  var $ = require('jquery');

  describe('xhrSuite', function() {
    describe('#autoRespond', function() {
      this.xhrSuite = {
        autoRespond: true,
        autoRespondAfter: 10
      };

      it('should install DSL methods', function() {
        expect(typeof this.respondWith).toBe('function');
        expect(typeof this.respond).toBe('function');
      });

      it('should work', function(done) {
        var user;

        this.respondWithJSON('GET', '/users/1', [ 200, {}, { id: '3' } ]);

        $.ajax({ url: '/users/1' }).then(function(resp) {
          user = resp;
          done();
          expect(user.id).toEqual('3');
        });
      });
    });

    describe('#trackRequests', function() {
      this.xhrSuite = {
        trackRequests: true
      };

      it('should install DSL methods', function() {
        expect(typeof this.respondTo).toBe('function');
      });

      it('should exposes requests in `this.requests`', function() {
        $.ajax({ url: '/users/1' });
        expect(this.requests.length).toBe(1);
      });

      it('should expose the last request in `this.lastRequest`', function() {
        expect(this.lastRequest).toBeFalsy();
        $.ajax({ url: '/users/1' });
        expect(this.lastRequest).toBeTruthy();
      });

      it('should respondTo requests', function() {
        var user;

        $.ajax({ url: '/users/1' }).then(function(resp) {
          user = resp;
        });

        this.respondTo(this.lastRequest, 200, { id: '3' });
        expect(user.id).toEqual('3');
      })
    });
  });
});