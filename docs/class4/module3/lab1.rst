Lab 3.1 - Review the Hello-World iControl LX extension
------------------------------------------------------

iControl LX extensions are provided as RPM (RedHat Package Manager) files.
Lets review the JavaScript contents of the Hello-World RPM.

Task 1 - Overview of the Hello-World extension
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

This is about as short an extension as one can get.

1) It only supports HTTP 'GET'. No POST, PUT, PATCH or anything fancy.
2) It only responds with "Hello World!"
3) Half of it is comments. There are actually *only* 13 lines of Javascript.

The Hello-World Javascript is as follows:

.. code-block:: javascript

    /**
    * A simple iControl LX extension that handles only HTTP GET
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
        "value": "your_string"
      };
    };

    module.exports = HelloWorld;


Task 2 - Key parts of the HelloWorld extension
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

1. WORKER_URI_PATH

Note the following line:

``HelloWorld.prototype.WORKER_URI_PATH = "ilxe_lab/hello_world";``

This specifies where the iControl LX extension will appear within iControl REST.
Adding the '/mgmt' prefix, this would result in:

``https://10.1.1.12/mgmt/ilxe_lab/hello_world``


2. isPublic

By default, the WORKER_URI_PATH would only be accessible to other extensions. To
make it accessible to remote devices/systems, you must specify that it is
publicly available using:

``HelloWorld.prototype.isPublic = true;``


3. Accepting an HTTP GET transaction

To process an HTTP GET sent to the WORKER_URI_PATH you must use 'onGet' as
follows:

.. code-block:: javascript

    HelloWorld.prototype.onGet = function(restOperation) {
      restOperation.setBody(JSON.stringify( { value: "Hello World!" } ));
      this.completeRestOperation(restOperation);
    };

This function performs the following actions:

  * Accepts the HTTP GET sent to our WORK_URI_PATH (/mgmt/ilxe_lab/hello_world).
  * Sets the body of the response to `{ value: "Hello World!" }`
  * Completes the transaction by sending the response back to the client.


4. iControl LX example transaction

This is a special service that will come in handy in the next lab "Beyond GET".
If you have an iControl LX extension that support a HTTP POST, PATCH, or PUT,
then the client will need to know what data to send and in what format.

.. code-block:: javascript

    HelloWorld.prototype.getExampleState = function () {
      return {
      "value": "your_string"
      };
    };

`getExampleState` responds when the user appends `/example` to the end of the
iControl LX extension, as follows:

`/mgmt/ilxe_lab/hello_world/example`

As our 'HelloWorld' extension does not require any inputs we haven't put in any
data here.

.. Note::

  /example must always be used with a HTTP GET.
