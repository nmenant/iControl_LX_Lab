Lab 4.2 - Updating the Hello World iControl extension
-----------------------------------------------------

Now that we have a first version of our extension, let's update it so that it will be able to do a few more things:

* Handle POST requests
* Add logging information. Always useful to add logging information to track behaviour and help troubleshooting any issue
* send a REST API call to a 3rd system


Task 1 - Update our iControl LX extension - handle Post requests
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Here we will add some more code to our extension to handle POST request but also add some troubleshooting statements

First thing to do is enable our f5-logger. This will make all `logger` statement to be sent to `/var/log/restnoded/restnoded.0.log`

add the beginning of your extension, add the following:

.. code-block:: javascript

    var logger = require('f5-logger').getInstance();
    var DEBUG = true;

now we will be able to use logger statement to print information in `/var/log/restnoded/restnoded.0.log`. we can also turn on/off all logging by changing the value of the DEBUG variable to false

Here is an EXAMPLE of a logger statement (DO NOT PUT THIS INTO YOUR CODE)

.. code-block:: javascript

    if (DEBUG === true) {
        logger.info("DEBUG: onGet request");
    }

let's update your onGET prototype. right now you should have this:

.. code-block:: javascript

    HelloWorld.prototype.onGet = function(restOperation) {
      restOperation.setBody(JSON.stringify( { value: "Hello World!" } ));
      this.completeRestOperation(restOperation);
    };

replace this code with the following:

.. code-block:: javascript

    HelloWorld.prototype.onGet = function(restOperation) {
      if (DEBUG === true) {
        logger.info("DEBUG: onGet request");
      }
      restOperation.setBody(JSON.stringify( { value: "Hello World!" } ));
      this.completeRestOperation(restOperation);
    };

Here the only thing we did was to add a logger statement so that we can track when our extension is called with a GET request

*Under* our onGet prototype, we will now add an OnPost prototype to handle POST request with our extension.

Add the following code below the onGet prototype

.. code-block:: javascript

    /**
    *handle onPost HTTP request
    */
    HelloWorld.prototype.onPost = function(restOperation) {
      //we retrieve the payload sent with the POST request
      var newState = restOperation.getBody();

      if (DEBUG === true) {
        logger.info("DEBUG: onPost received Body is: " + JSON.stringify(newState,' ','\t'));
      }
      //we extract the variable name from the payload
      var name = newState.name;

      //if it's empty, we just print Hello World, otherwise Hello <name>
      if (name) {
        if (DEBUG === true) {
          logger.info("DEBUG: onPost request, the extracted name is : " + name);
        }
        restOperation.setBody(JSON.stringify({ value: "Hello " + name + "!"}));
      } else {
        if (DEBUG === true) {
          logger.info("DEBUG: onPost request, no name parameter provided... using default value");
        }
        restOperation.setBody(JSON.stringify( { value: "Hello World!" } ));
      }
      this.completeRestOperation(restOperation);
    };

Let's review the code we added:

* the lines starting with // are comments. It's always good to add comments to your code to help people read/understand your code... the bigger the code is, the more important it is to provide proper commented code
* `var newState = restOperation.getBody();` - with this statement, we retrieve the PAYLOAD that was sent in the POST request and we show this payload in the following logger command
* `var name = newState.name;` - with this , we assign the name parameter's value (send with the POST request) to the name variable.
* the following if/else statement determines whether the variable name is empty or not (if the POST payload didn't contain a name parameter) and depending on this will do the following:

    - if the variable name is not empty: reply to the POST request with Hello and the name of the user
    - if the variable name is empty: reply to the POST request with Hello World!

time to test our code!

Make sure you save your updated file. Once it's done, run the following command:

``bigstart restart restnoded ; tail -f /var/log/restnoded/restnoded.0.log``

Review the logs and make sure that it doesn't mention any error/issue in your updated file.

you should have something like this:

.. code::

    Tue, 17 Oct 2017 13:11:19 GMT - finest: [LoaderWorker] triggered at path:  /var/config/rest/iapps/HelloWorld
    Tue, 17 Oct 2017 13:11:19 GMT - finest: [LoaderWorker] triggered at path:  /var/config/rest/iapps/HelloWorld/nodejs
    Tue, 17 Oct 2017 13:11:19 GMT - finest: [LoaderWorker] triggered at path:  /var/config/rest/iapps/HelloWorld/nodejs/.hello_world.js.swp
    Tue, 17 Oct 2017 13:11:19 GMT - finest: [LoaderWorker] triggered at path:  /var/config/rest/iapps/HelloWorld/nodejs/hello_world.js
    Tue, 17 Oct 2017 13:11:19 GMT - finest: [LoaderWorker] unsupported module file extension '/var/config/rest/iapps/HelloWorld/nodejs/.hello_world.js.swp', skipping...
    Tue, 17 Oct 2017 13:11:19 GMT - config: [RestWorker] /ilxe_lab/hello_world has started. Name:HelloWorld

you can now test your updated extension with the following commands:

``curl -k -u admin:admin https://10.1.1.12/mgmt/ilxe_lab/hello_world``

the console output should look like this:

.. code::

    {"value":"Hello World!"}

the /var/log/restnoded/restnoded.0.log output should look like this:

.. code::

    Tue, 17 Oct 2017 13:33:45 GMT - info: DEBUG: onGet request

Run this command:

``curl -H "Content-Type: application/json" -k -u admin:admin -X POST -d '{"name":"iControl LX Lab"}' https://10.1.1.12/mgmt/ilxe_lab/hello_world``

the console output should look like this:

.. code::

    {"value":"Hello iControl LX Lab!"}

the /var/log/restnoded/restnoded.0.log output should look like this:

.. code::

    Tue, 17 Oct 2017 13:36:46 GMT - info: DEBUG: onPost received Body is: {
    "name": "iControl LX Lab"
    }
    Tue, 17 Oct 2017 13:36:46 GMT - info: DEBUG: onPost request, the extracted name is : iControl LX Lab

Run this command:

``curl -H "Content-Type: application/json" -k -u admin:admin -X POST -d '{"other":"iControl LX Lab"}' https://10.1.1.12/mgmt/ilxe_lab/hello_world``

the console output should look like this (the name parameter wasn't found in the POST payload):

.. code::

    {"value":"Hello World!"}

the /var/log/restnoded/restnoded.0.log output should look like this:

.. code::

    Tue, 17 Oct 2017 13:38:24 GMT - info: DEBUG: onPost received Body is: {
    "other": "iControl LX Lab"
    }
    Tue, 17 Oct 2017 13:38:24 GMT - info: DEBUG: onPost request, no name parameter provided... using default value

We now have an iControl LX extension that is able to handle GET and POST requests but also provide debugging information

Task 2 - Update our iControl LX extension - do a REST API call
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^


Task 4 - Take a break!
^^^^^^^^^^^^^^^^^^^^^^

Congratulations!!!! You've just modified the behavior of the F5 iControl REST API. Now, take a moment to think about what workflows you could implement to make life easier.
