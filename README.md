# jasmine_xhr

Use [sinon](http://sinonjs.org/docs/) to create a fake XHR server for stubbing remote requests.

What this add-on does:

- equips your test suite with XHR-stubbing helpers
- manages the fake server for each test in the suite

Requires:

- Jasmine 2.0+

Works with:

- [jasmine_rsvp](https://github.com/jasmine-addons/jasmine_rsvp)

Example:

```javascript
define(function(require) {
  describe('My component', function() {
    // Enable the jasmine_xhr functionality for this suite:
    this.xhrSuite = true;

    it('should pull a remote resource', function() {
      this.respondWith('GET', '/users/1', [ 200, {
        "id": "1",
        "age": 3
      }]);

      // something that requests the endpoint
      $.ajax({ url: '/users/1' }).then(function(user) {
        expect(user.id).toBe('1');
        expect(user.age).toBe(3);
      });

      this.respond(); // respond to pending requests
    });
  });
});
```

This add-on inter-operates with [jasmine_rsvp](https://github.com/jasmine-addons/jasmine_rsvp) (if it was found) by automatically flushing the promise-queue when you `respond()` to a request.

The add-on can run in two modes: the first (and is the more common) is suited for tests where you don't care about the code that *issues* the requests, but instead you care about what the code does with the response.

The second mode lets you inspect each issued request and is meant for verifying that some code is issuing the right requests in the right format.

### Mode 1: auto-responding

The mode is engaged as shown in the first example:

```javascript
describe('my async suite', function() {
    this.xhrSuite = true;
});
```

#### respondWith(method, url, response)

See [the responses](http://sinonjs.org/docs/#responses) section in the sinon documentation for the method signature. The add-on just passes right through to sinon.

```javascript
it('should construct the full-name of a user', function() {
    // define a request you are expecting the code to issue:
    this.respondWith('GET', '/users/1', [ 200, {}, {
        "first_name": "Ahmad",
        "last_name": "Amireh"
    }]);

    var user = userCollection.fetch('1');

    // flush the request buffer, see below
    this.respond();

    expect(user.fullName).toEqual('Ahmad Amireh');
});
```

#### respondWithJSON(method, url, response)

Like `respondWith` but assumes the body in the response is JSON and calls `JSON.stringify()` on it for you.

#### respond

Flushes the request buffer by responding to all outstanding requests. You should do this after invoking code that you expect to have issued an XHR request.

You can also choose to have the server auto-respond by specifying so:

```javascript
describe('my suite', function() {
    this.xhrSuite = {
        autoRespond: true
    };
});
```

This really just proxies to [fakeServer#respond](http://sinonjs.org/docs/#server).

#### server

You have access to the fake server object in `this.server`.

### Mode 2: request tracking

Instead of defining the requests you expect in-advance, this mode allows you to run expectations on the requests themselves, e.g, to verify that your subject module is issuing the proper requests.

You can toggle this mode by defining `this.xhrSuite = { trackRequests: true };`. You will have access to a different set of helpers detailed below.

Example: verifying the module issues a GET request `/users/1` first, and then another to `/users/1/profile`.

```javascript
describe('my suite', function() {
    this.xhrSuite = {
        manualRequests: true
    };

    it('should fetch the user, then his profile', function() {
        user.fetch();

        expect(this.requests.length).toBe(1);
        expect(this.lastRequest.url).toEqual('/users/1');
        this.respondTo(this.lastRequest, 200, { "id": "1" });

        expect(this.requests.length).toBe(2);
        expect(this.lastRequest.url).toEqual('/users/1/profile');
    });
});

#### requests

`this.requests` is a stack which contains all the issued requests during the test. It is a container of [FakeXMLHttpRequest](http://sinonjs.org/docs/#FakeXMLHttpRequest) objects.

#### lastRequest

`this.lastRequest` will point to the latest request received. It is an object of type [FakeXMLHttpRequest](http://sinonjs.org/docs/#FakeXMLHttpRequest).

#### respondTo(xhrRequest, statusCode, headers, body)

Respond to a request tracked in the `this.requests` stack. If you pass 3 arguments, `body` will be assumed to be the 3rd parameter, and the response will be set with the default headers.

## License

MIT