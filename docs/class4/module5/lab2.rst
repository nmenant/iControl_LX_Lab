Lab 5.2 - Accept state updates via onPatch()
--------------------------------------------

Now we have an iControl LX extension that is acquiring its state during startup.

How very Nuke & Pave (DevOps) of us!

Next, we should make the extension accept changes to its operating setting after
startup.

Task 1 - Use onPatch to edit a parameter

1. Open your local copy of myFirstWorker.js

2. Scroll down past the onGet() function.

3. Between onGet() and getExampleState(), add the following code:

```
F5_ChatOps.prototype.onPut = function(restOperation) {

  var newState = restOperation.getBody();

  logger.info("onPut():" +newState);

  if (newState.ipam.address)  {
    this.state.ipam.address = newState.ipam.address;
  }

  restOperation.setBody(this.state);
  this.completeRestOperation(restOperation);

};

```

.. Note: this will only accepted changes to `ipam.address`. The `if` statement
  isn't checking for any other value changes within in the 'PUT'.

Task 2 - Upload this to your iWorkflow or BIG-IP

`scp /<location>/myFirstWorker.js root@<ip_address>:/usr/local/rest/src/workers/`

Task 3 - Load the new worker and test

1. Execute:

`bigstart restart restnoded; tail -f /var/log/restnoded/restnoded.log`

Assuming there were no errors to troubleshoot/debug:

2. Test the worker has acquired it startup state from GitHub:

`GET /mgmt/ilxe_lab/myFirstWorker`

3. Change the value of the 'ipam' server address:

```
PUT /mgmt/ilxe_lab/myFirstWorker

{
  "ipam.address":"2.2.2.2"
}
```

You should receive the new state:

```
{
  "name":"HelloWorld",
  "Description":"Example for iControl LX training lab",
  "ipam":{
    "name":"custom1",
    "description":"IPAM system for getting VIP Address",
    "address":"2.2.2.2"
  }
}
```

4. Congratulations again! You've created a dynamic, interactive iControl LX
extension. You're future looks bright!
