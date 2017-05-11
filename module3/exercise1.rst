================================================
Exercise 1 - The HelloWorld iControlLX extension
================================================

Review the extension
--------------------

This is about as short an extension as one can get.

1) It only supports 'GET' requests. No POST, PUT, PATCH or anything fancy.
2) It only responds with "Hello World!"
3) Half of it is comments. There are actually *only* 13 lines of Javascript.

Here's a quick look at actual Javascript:

```
/**
 * A simple iControlLX extension that handles only HTTP GET
 */
function HelloWorld() {}

HelloWorld.prototype.WORKER_URI_PATH = "ilxe_lab/hello_world";
HelloWorld.prototype.isPublic = true;

/**
 * handle onGet HTTP request
 */
HelloWorld.prototype.onGet = function(restOperation) {
  restOperation.setBody(JSON.stringify( { value: "Hello World!" } ));
  this.completeRestOperation(restOperation);
};

/**
 * handle /example HTTP request
 */
HelloWorld.prototype.getExampleState = function () {
  return {
    "supports":"none"
  };
};

module.exports = HelloWorld;
```

# HelloWorld walk through

`HelloWorld.prototype.WORKER_URI_PATH = "ilxe_lab/hello_world";`
This specifies where the iControlLX extension will appear within iControl REST.

`HelloWorld.prototype.isPublic = true;`
This enables you to access your iControlLX extension remotely. Otherwise it will
only be accessible from within the iControlLX framework.


```
HelloWorld.prototype.onGet = function(restOperation) {
  restOperation.setBody(JSON.stringify( { value: "Hello World!" } ));
  this.completeRestOperation(restOperation);
};
```

This function performs the following actions:
1) accepts the HTTP GET sent to our WORK_URI_PATH
(/ilxe_lab/hello_world).
2) Sets the body of the response to `{ value: "Hello World!" }`
3) completes the transaction by sending the reponse back to the client.



```
HelloWorld.prototype.getExampleState = function () {
  return {
    "supports":"none"
  };
};
```

This is a special service that will come in handy much later. If you have an
iControlLX extension that support a HTTP POST, PATCH, or PUT, then the client
will need to know what data to send and in what format. getExampleState repsonds
when the user appends `/example` to the end of the iControlLX extension. For
example:
`ilxe_lab/hello_world/example`

As our 'HelloWorld' extension does not require any inputs we haven't put in any
effort here.
