Lab 5.3 - Troubleshooting
-------------------------

Now you're starting to experiment with the capabilities of the iControl LX
extensions its time to visit troubleshooting. Back at the beginning of this lab
we introduced the relevant logs for the iControl LX framework.

To use the restnoded 'logger' service you will need to add the folllwing at the
top of your iControl LX extension:

'var logger = require('f5-logger').getInstance();'

This will allow you to log events to:

`/var/log/restnoded/restnoded.log`

`logger` supports multiple log levels, for example:

```
logger.info("info message");
logger.severe("severe message");
```

Task 1 - Debug best practices

When working with JSON payloads, its a good idea to dial up the logging to
ensure you are receiving what you expected. An example of this:

```
HelloWorld.prototype.onPut = function(restOperation) {
  var newState = restOperation.getBody();

  if (DEBUG) {
    logger.info("DEBUG: newState - " +newState);
    logger.info("DEBUG: newState.ip_address - " +newState.ip_address);
  }

// Did we get a ip address to deploy
  if (typeof newState.ip_address !==  'undefined' && newState.ip_address) {
    deployService(newState.ip_address);
    this.state = newState;
  }

  restOperation.setBody(newState);
  this.completeRestOperation(restOperation);
};
```

To enable/disable logging to troubleshoot this worker, you merely need to set
DEBUG to 'true' or 'false'. Do this at the top of the iControl LX extension,
after the 'import' statements. For example

`var DEBUG = false;`


Task 2 - Its JavaScript

There's a lot of great JavaScript support out there in the developer community.
Google/StackOverflow are your friend!
