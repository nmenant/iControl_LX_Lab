Lab 4.2 - Updating the Hello World iControl Extension
-----------------------------------------------------

Now that we have a first version of our extension, let's update it so that it
will be able to do a few more things:

* Handle ``POST`` requests
* Add logging information. Always useful to add logging information to track
  behaviour and help troubleshooting any issue
* Send a REST API call to a 3rd system

Task 1 - Update our iControl LX Extension - Handle POST Requests
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Here we will add some more code to our extension to handle ``POST`` requests
but also add some troubleshooting statements

First thing to do is enable our ``f5-logger``. This will log messages to
`/var/log/restnoded/restnoded.log`

Perform the following steps to complete this task:

#. Execute ``vi /var/config/rest/iapps/HelloWorld/nodejs/hello_world.js`` to
   edit the file

#. Below the first comment,

   .. code::

      /**
       * A simple iControl LX extension that handles only HTTP GET
       */

   add the following:

   .. code-block:: javascript

      var logger = require('f5-logger').getInstance();
      var DEBUG = true;

#. Save the changes (``ESC ESC :wq``)

#. Now we will be able to use ``logger`` statement to print information to the
   `/var/log/restnoded/restnoded.log` log file.  We can also turn on/off all
   logging by changing the value of the DEBUG variable to false


   .. NOTE:: Here is an EXAMPLE of a logger statement (DO NOT PUT THIS INTO
      YOUR CODE)

      .. code-block:: javascript

         if (DEBUG === true) {
            logger.info("DEBUG: HelloWorld - onGet request");
         }

#. We may also want to create a VARIABLE for our default JSON response of
   ``Hello World!``. This way, if we need to change it at some point, we only
   need to change it in a single location.

#. Under ``var DEBUG = true;`` add:

   .. code::

      var DEFAULT_MSG = {"value": "Hello World!"};

   It should look like this:

   .. code::

      var logger = require('f5-logger').getInstance();
      var DEBUG = true;
      var DEFAULT_MSG = {"value": "Hello World!"};

#. Next, let's update your onGET prototype.  Right now you should have this:

   .. code-block:: javascript

      HelloWorld.prototype.onGet = function(restOperation) {
        restOperation.setBody(JSON.stringify( { value: "Hello World!" } ));
        this.completeRestOperation(restOperation);
      };

#. Replace this code with the following:

   .. code-block:: javascript

      HelloWorld.prototype.onGet = function(restOperation) {
        if (DEBUG === true) {
          logger.info("DEBUG: HelloWorld - onGet request");
        }
        restOperation.setBody(JSON.stringify(DEFAULT_MSG));
        this.completeRestOperation(restOperation);
      };

   Here the only thing we did was to:

   * Add a ``logger`` statement so that we can track when our extension is
     called with a ``GET`` request

   * Replace our static response ``{ value: "Hello World!" }`` with our variable

#. *Under* our ``onGet`` prototype, we will now add an OnPost prototype to
   handle ``POST`` request with our extension.

   Add the following code below the ``onGet`` prototype:

   .. code-block:: javascript

      /**
      *handle onPost HTTP request
      */
      HelloWorld.prototype.onPost = function(restOperation) {

        //we retrieve the payload sent with the POST request
        var newState = restOperation.getBody();

        if (DEBUG === true) {
          logger.info("DEBUG: HelloWorld - onPost received Body is: " + JSON.stringify(newState,' ','\t'));
        }
        //we extract the variable name from the payload
        var name = newState.name;

        //if it's empty, we just print Hello World, otherwise Hello <name>
        if (name) {
          if (DEBUG === true) {
            logger.info("DEBUG: HelloWorld - onPost request, the extracted name is : " + name);
          }
          restOperation.setBody(JSON.stringify({ "value": "Hello " + name + "!"}));
        } else {
          if (DEBUG === true) {
            logger.info("DEBUG: HelloWorld - onPost request, no name parameter provided... using default value");
          }
          restOperation.setBody(JSON.stringify(DEFAULT_MSG));
        }
        this.completeRestOperation(restOperation);
      };

#. Let's review the code we have now, it should look like this:

   .. code-block:: javascript

      /**
      * A simple iControl LX extension that handles only HTTP GET
      */

      var logger = require('f5-logger').getInstance();
      var DEBUG = true;
      var DEFAULT_MSG = {"value": "Hello World!"};

      function HelloWorld() {}

      HelloWorld.prototype.WORKER_URI_PATH = "ilxe_lab/hello_world";
      HelloWorld.prototype.isPublic = true;

      /**
      * handle onGet HTTP request
      */
      HelloWorld.prototype.onGet = function(restOperation) {
        if (DEBUG === true) {
          logger.info("DEBUG: HelloWorld - onGet request");
        }
        restOperation.setBody(JSON.stringify(DEFAULT_MSG));
        this.completeRestOperation(restOperation);
      };

      /**
      *handle onPost HTTP request
      */
      HelloWorld.prototype.onPost = function(restOperation) {
        //we retrieve the payload sent with the POST request
       var newState = restOperation.getBody();

       if (DEBUG === true) {
          logger.info("DEBUG: HelloWorld - onPost received Body is: " + JSON.stringify(newState,' ','\t'));
        }
        //we extract the variable name from the payload
        var name = newState.name;

        //if it's empty, we just print Hello World, otherwise Hello <name>
        if (name) {
          if (DEBUG === true) {
            logger.info("DEBUG: HelloWorld - onPost request, the extracted name is : " + name);
          }
          restOperation.setBody(JSON.stringify({ "value": "Hello " + name + "!"}));
        } else {
          if (DEBUG === true) {
            logger.info("DEBUG: HelloWorld - onPost request, no name parameter provided... using default value");
          }
          restOperation.setBody(JSON.stringify(DEFAULT_MSG));
        }
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

   * The lines starting with ``//`` are comments. It's always good to add
     comments to your code to help people read/understand your code... the
     bigger the code is, the more important it is to provide proper commented
     code
   * ``var newState = restOperation.getBody();`` - with this statement, we
     retrieve the PAYLOAD that was sent in the POST request and we show this
     payload in the following logger command
   * ``var name = newState.name;`` - with this, we assign the name parameter's
     value (send with the POST request) to the name variable.
   * The following if/else statement determines whether the variable name is
     empty or not (if the POST payload didn't contain a name parameter) and
     depending on this will do the following:

     - If the variable name is not empty: reply to the ``POST`` request with
       Hello and the name of the user
     - If the variable name is empty: reply to the ``POST`` request with
       ``Hello World!``

#. Make sure you save your updated file.

#. Time to test our code!  Open another ssh session to your iWorkflow
   platform and run the following command:

   ``bigstart restart restnoded ; tail -f /var/log/restnoded/restnoded.log``

#. Review the logs and make sure that it doesn't mention any error/issue in
   your updated file.  Keep this session open just to monitor your logs. Easier
   to have one window to track/monitor your logging information and use another
   one to update your code/send curl command

#. You should have something like this:

   .. code::

      Tue, 17 Oct 2017 13:11:19 GMT - finest: [LoaderWorker] triggered at path:  /var/config/rest/iapps/HelloWorld
      Tue, 17 Oct 2017 13:11:19 GMT - finest: [LoaderWorker] triggered at path:  /var/config/rest/iapps/HelloWorld/nodejs
      Tue, 17 Oct 2017 13:11:19 GMT - finest: [LoaderWorker] triggered at path:  /var/config/rest/iapps/HelloWorld/nodejs/hello_world.js
      Tue, 17 Oct 2017 13:11:19 GMT - config: [RestWorker] /ilxe_lab/hello_world has started. Name:HelloWorld

#. You can now test your updated extension with the following commands:

   ``curl -k -u admin:admin https://10.1.10.20/mgmt/ilxe_lab/hello_world``

   The console output should look like this:

   ``{"value":"Hello World!"}``

#. The ``/var/log/restnoded/restnoded.log`` output should look like this:

   ``Tue, 17 Oct 2017 13:33:45 GMT - info: DEBUG: HelloWorld - onGet request``

#. Run this command:

   ``curl -H "Content-Type: application/json" -k -u admin:admin -X POST -d '{"name":"iControl LX Lab"}' https://10.1.10.20/mgmt/ilxe_lab/hello_world``

#. The console output should look like this:

   ``{"value":"Hello iControl LX Lab!"}``

#. The ``/var/log/restnoded/restnoded.log`` output should look like this:

   .. code::

      Tue, 17 Oct 2017 13:36:46 GMT - info: DEBUG: HelloWorld - onPost received Body is: {
      "name": "iControl LX Lab"
      }
      Tue, 17 Oct 2017 13:36:46 GMT - info: DEBUG: HelloWorld - onPost request, the extracted name is : iControl LX Lab

#. Run this command:

   ``curl -H "Content-Type: application/json" -k -u admin:admin -X POST -d '{"other":"iControl LX Lab"}' https://10.1.10.20/mgmt/ilxe_lab/hello_world``

#. The console output should look like this (the name parameter wasn't found in
   the POST payload):

   ``{"value":"Hello World!"}``

#. The ``/var/log/restnoded/restnoded.log`` output should look like this:

   .. code::

      Tue, 17 Oct 2017 13:38:24 GMT - info: DEBUG: HelloWorld - onPost received Body is: {
      "other": "iControl LX Lab"
      }
      Tue, 17 Oct 2017 13:38:24 GMT - info: DEBUG: HelloWorld - onPost request, no name parameter provided... using default value

We now have an iControl LX extension that is able to handle ``GET`` and ``POST``
requests but also provide debugging information.

Task 2 - Update our iControl LX Extension - Perform a REST API Call
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Right now, our iControl LX extension provides a default message that is set at
the beginning of our code. If this "content" is owned by someone else, it may
be inefficient to have it directly in the code. Let's see how we could leverage
a HTTP request to retrieve our default message.

For this task, we will do 3 things:

* Add the ``http`` module to our extension
* Add a new prototype ``onStart`` to our code
* Perform a HTTP request to GitHub to retrieve our default message

Perform the following tasks to complete this task:

#. To add the http module to our extension we need to add the following to the
   top of your code

   .. code-block:: javascript

      var http = require('http');

#. You can add this below this line:

   .. code-block:: javascript

      var DEFAULT_MSG = {"value": "Hello World!"};

#. The prototype ``onStart`` is something you can leverage to do some
   processing when your iControl LX extension is loaded in ``restnoded``. It
   is triggered only once, when your extension is loaded. It's a good prototype
   to leverage to retrieve our default message.

#. Under the line ``HelloWorld.prototype.isPublic = true;``, add the following
   code:

   .. code-block:: javascript

      /**
       * Perform worker start functions
       */

      HelloWorld.prototype.onStart = function(success, error) {

      if (DEBUG === true) {
        logger.info("DEBUG: HelloWorld - onStart request");
      }

      var options = {
        "method": "GET",
        "hostname": "s3-eu-west-1.amazonaws.com",
        "port": 80,
        "path": "/nicolas-labs/helloworld_resp.json",
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
          if (DEBUG === true) {
            logger.info("DEBUG: HelloWorld - onStart - the default message body is: " + body);
          }
          DEFAULT_MSG = JSON.parse(body);
        });
      });

      req.end();

      if (DEBUG === true) {
        logger.info("DEBUG: HelloWorld - onStart - the default message is: " + this.state);
      }
      success();
      };

#. The purpose of this code is to retrieve the file:
   `helloworld_resp <http://s3-eu-west-1.amazonaws.com/nicolas-labs/helloworld_resp.json>`_

#. This file will give us the default payload we should return when we receive
   a request

#. Make sure you save your updated file. Once it's done, run the following
   command:

   ``bigstart restart restnoded ; tail -f /var/log/restnoded/restnoded.log``

#. Review the logs and make sure that it doesn't mention any error/issue in
   your updated file.

   You should have something like this:

   .. code::

      Wed, 18 Oct 2017 09:30:08 GMT - finest: [LoaderWorker] triggered at path:  /var/config/rest/iapps/HelloWorld/nodejs
      Wed, 18 Oct 2017 09:30:08 GMT - finest: [LoaderWorker] triggered at path:  /var/config/rest/iapps/HelloWorld/nodejs/hello_world.js
      Wed, 18 Oct 2017 09:30:08 GMT - info: DEBUG: HelloWorld - onStart request
      Wed, 18 Oct 2017 09:30:08 GMT - config: [RestWorker] /ilxe_lab/hello_world has started. Name:HelloWorld
      Wed, 18 Oct 2017 09:30:08 GMT - info: DEBUG: HelloWorld - onStart - the default message body is: { "value": "Congratulations on your lab!" }

#. You can now test your updated extension with the following commands:

   ``curl -k -u admin:admin https://10.1.10.20/mgmt/ilxe_lab/hello_world``

#. The console output should look like this:

   ``{"value":"Congratulations on your lab!"}``

#. The ``/var/log/restnoded/restnoded.log`` output should look like this:

   ``Tue, 17 Oct 2017 13:33:45 GMT - info: DEBUG: HelloWorld - onGet request``

#. Run this command:

   ``curl -H "Content-Type: application/json" -k -u admin:admin -X POST -d '{"name":"iControl LX Lab"}' https://10.1.10.20/mgmt/ilxe_lab/hello_world``

#. The console output should look like this:

   ``{"value":"Hello iControl LX Lab!"}``

#. The ``/var/log/restnoded/restnoded.log`` output should look like this:

   .. code::

      Wed, 18 Oct 2017 09:32:40 GMT - info: DEBUG: HelloWorld - onPost received Body is: {
      "name": "iControl LX Lab"
      }
      Wed, 18 Oct 2017 09:32:40 GMT - info: DEBUG: HelloWorld - onPost request, the extracted name is : iControl LX Lab

#. Run this command:

   ``curl -H "Content-Type: application/json" -k -u admin:admin -X POST -d '{"other":"iControl LX Lab"}' https://10.1.10.20/mgmt/ilxe_lab/hello_world``

#. The console output should look like this (the name parameter wasn't found in
   the ``POST`` payload):

   ``{"value":"Congratulations on your lab!"}``

#. The ``/var/log/restnoded/restnoded.log`` output should look like this:

   .. code::

      Wed, 18 Oct 2017 09:33:38 GMT - info: DEBUG: HelloWorld - onPost received Body is: {
      "other": "iControl LX Lab"
      }
      Wed, 18 Oct 2017 09:33:38 GMT - info: DEBUG: HelloWorld - onPost request, no name parameter provided... using default value

Task 3 - Take a (5min) break!
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Congratulations!!!! You've just modified the behavior of the F5 iControl LX
extension. Now, take a moment to think about what workflows you could implement
to make life easier.
