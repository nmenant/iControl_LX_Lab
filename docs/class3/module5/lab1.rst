Lab 5.1 - Retrieve state from GitHub repo
-----------------------------------------

In this lab we will extend the SkeletonWorker (best place to start) to retrieve
its initial 'state' (operational settings) from a source code repository.

Task 1 - Copy the hello_world.js file

1. Download the hello_world.js source from: <Publish to GitHub so you can get the link>

2. Copy it to your local machine.

3. Rename it to `myFirstWorker.js`

4. Open it with your favorite JavaScript editor.

.. Note: Don't have one? Sublime and Atom are great. This lab was written using Atom and
its awesome GitHub Desktop integration.


5. Replace all instances of 'HelloWorld' with 'MyFirstWorker'.

6. Use Search/Replace. You don't want to miss any!!!


Task 2 - Add code to retrieve state on startup

1. Scroll down to `MyFirstWorker.prototype.isPublic = true;` and create some
space for the onStart() function.


2. Add the following code after `isPublic`, and before `onGet()`:

```
MyFirstWorker.prototype.onStart = function(success, error) {

   logger.info("HelloWorld onStart()");

   var options = {
     "method": "GET",
     "hostname": "raw.githubusercontent.com",
     "port": null,
     "path": "/<path-to-file>/master/onStart_state.json",
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
```

3. Save! Always Save!!!


Task 3 - Put this worker on your BIG-IP or iWorkflow:

1. Re-mount /usr to 'Read/Write'. The default is 'Read-only'

On your iWorkflow, or BIG-IP, execute: `mount -o rw,remount /usr`

2. copy myFirstWorker.js to your iWorkflow or BIG-IP:

`scp /<location>/myFirstWorker.js root@<ip_address>:/usr/local/rest/src/workers/`

3. Restart restnoded, and watch the log output:

`bigstart restart restnoded; tail -f /var/log/restnoded/restnoded.log`


Task 4 - Test your worker

`GET /mgmt/ilxe_lab/myFirstWorker`

You should see the contents of the `onStart_state.json` file retrieved from
GitHub.

```
{
  "name":"HelloWorld",
  "Description":"Example for iControl LX training lab",
  "ipam":{
    "name":"custom1",
    "description":"IPAM system for getting VIP Address",
    "address":"1.1.1.1"
  }
}
```
