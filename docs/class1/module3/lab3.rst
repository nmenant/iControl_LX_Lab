Lab 3.3 - Interacting with 3rd Party Systems
--------------------------------------------

iControl LX can be used to communicate with external 3rd party systems/APIs via REST.

To achieve this, one must understand how to create REST API calls within an
iControl LX extension.

There are two communication methods supported by the iControl LX Framework:

1. ``restOperation()``
2. Native Node.js HTTP requests (**recommended by F5**)

Task 1 - Using restOperation()
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

While you can use restOperation() to create REST transactions (using setURI(),
setBody(), etc.) to 3rd party systems, F5 recommends you use the built-in
Node.js functionality.

Task 2 - Creating a REST call using Native Node.js HTTP Requests
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

In this example we will modify the ``HelloWorld`` extension to retrieve its
operating state from a JSON file in GitHub:

.. code-block:: javascript
   :linenos:
   :emphasize-lines: 17-41,50

   /**
   * A simple iControlLX extension that handles only HTTP GET
   */
   function HelloWorld() {}

   HelloWorld.prototype.WORKER_URI_PATH = "ilxe_lab/hello_world";
   HelloWorld.prototype.isPublic = true;

   /**
   * Perform worker start functions
   */

   HelloWorld.prototype.onStart = function(success, error) {

     logger.info("HelloWorld onStart()");

     var options = {
       "method": "GET",
       "hostname": "raw.githubusercontent.com",
       "port": null,
       "path": "/n8labs/super-netops/master/worker_state.json",
       "headers": {
         "cache-control": "no-cache"
       }
     };

     var req = http.request(options, function (res) {

       var chunks = [];

       res.on("data", function (chunk) {
         chunks.push(chunk);
       });

       res.on("end", function () {
         var body = Buffer.concat(chunks);
         this.state = JSON.parse(body);
       });
     });

     req.end();

     success();
   };

   /**
   * handle onGet HTTP request
   */
   HelloWorld.prototype.onGet = function(restOperation) {
     restOperation.setBody(this.state);
     this.completeRestOperation(restOperation);
   };

   /**
   * handle /example HTTP request
   */
   HelloWorld.prototype.getExampleState = function () {
     return {
       "value": "your_string"
     };
   };

   module.exports = HelloWorld;

With these modifications, any time a HTTP GET is sent to
``/mgmt/ilxe_lab/hello_world`` it will reply with the JSON blob that was
retrieved from GitHub when the worker was initially loaded.

Also, note the change in ``onGet()`` to ``restOperation.setBody()``

.. NOTE:: If you've already got the call to another system working in the
   POSTMAN REST client, you can click the :guilabel:`Generate Code` button to
   get the Node.js code.
