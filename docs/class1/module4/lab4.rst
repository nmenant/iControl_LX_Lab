Lab 4.4 - Install our iControl LX RPM
-------------------------------------

Let's try to install our iControl LX RPM on iWorkflow.

To install the iControl LX extension, first you need to copy the iControlLX package onto your iWF device in the right folder. It should be in the following directory: `/var/config/rest/downloads`

use your iWorkflow ssh session and run the following command:

.. code::

   mv /var/config/rest/iapps/RPMS/HelloWorld-0.1-001.noarch.rpm /var/config/rest/downloads/

Here, we just had to move the RPM from a folder to another since already on the iWorkflow platform. You can ensure the transfer was successful by checking the folder /var/config/rest/downloads.


Task 1 - Review the installed iControl LX packages
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

First lets take a look at the packages installed on your iWorkflow platform

From your Linux Server , run the following command:

.. code::

  curl -k -u admin:admin https://10.1.10.20/mgmt/shared/iapp/global-installed-packages | jq

Response:

.. code::

  {
    "items": [],
    "generation": 0,
    "kind": "shared:iapp:global-installed-packages:installedpackagecollectionstate",
    "lastUpdateMicros": 0,
    "selfLink": "https://localhost/mgmt/shared/iapp/global-installed-packages"
  }

We can see here that no RPM has been installed on this platform

Task 2 - Install our RPM
^^^^^^^^^^^^^^^^^^^^^^^^

The installation is performed via the iControl REST API package-management-tasks service. Performing an HTTP POST to this service with the 'INSTALL' operation, and the location and name of the iControlLX package is all it takes:

Here is the syntax:

.. code::

  POST /mgmt/shared/iapp/package-management-tasks
  {
   "operation": "INSTALL",
   "packageFilePath": "/var/config/rest/downloads/HelloWorld-0.1-001.noarch.rpm"
  }

Let's use your terminal to run the following command:

.. code::

  curl -H "Content-Type: application/json" -k -u admin:admin -X POST -d '{"operation": "INSTALL","packageFilePath": "/var/config/rest/downloads/HelloWorld-0.1-001.noarch.rpm"}' https://10.1.10.20/mgmt/shared/iapp/package-management-tasks | jq

the output should look like this:

.. code::

  {
    "packageFilePath": "/var/config/rest/downloads/HelloWorld-0.1-001.noarch.rpm",
    "operation": "INSTALL",
    "id": "4d62ae98-5302-41ee-8057-479b28372b9f",
    "status": "CREATED",
    "userReference": {
     "link": "https://localhost/mgmt/shared/authz/users/admin"
    },
    "identityReferences": [
     {
       "link": "https://localhost/mgmt/shared/authz/users/admin"
     }
    ],
    "ownerMachineId": "2865e578-0460-44f4-910a-8dc7f220fce1",
    "generation": 1,
    "lastUpdateMicros": 1508331598385044,
    "kind": "shared:iapp:package-management-tasks:iapppackagemanagementtaskstate",
    "selfLink": "https://localhost/mgmt/shared/iapp/package-management-tasks/4d62ae98-5302-41ee-8057-479b28372b9f"
  }

Note the "id". If you now query the 'package-managment-tasks' ressource and
append the "id", you can get the status of the install.

From your terminal:

.. code::

  curl -k -u admin:admin  https://10.1.10.20/mgmt/shared/iapp/package-management-tasks/4d62ae98-5302-41ee-8057-479b28372b9f | jq

.. warning::

  replace the ID in the curl command (`4d62ae98-5302-41ee-8057-479b28372b9f`) with your own id

Output:

.. code::

  {
    "packageFilePath": "/var/config/rest/downloads/HelloWorld-0.1-001.noarch.rpm",
    "packageName": "HelloWorld-0.1-001.noarch",
    "operation": "INSTALL",
    "packageManifest": {
      "tags": [
        "IAPP"
      ]
    },
    "id": "4d62ae98-5302-41ee-8057-479b28372b9f",
    "status": "FINISHED",
    "startTime": "2017-10-18T14:59:58.389+0200",
    "endTime": "2017-10-18T14:59:58.897+0200",
    "userReference": {
      "link": "https://localhost/mgmt/shared/authz/users/admin"
    },
    "identityReferences": [
      {
        "link": "https://localhost/mgmt/shared/authz/users/admin"
      }
    ],
    "ownerMachineId": "2865e578-0460-44f4-910a-8dc7f220fce1",
    "generation": 3,
    "lastUpdateMicros": 1508331598896783,
    "kind": "shared:iapp:package-management-tasks:iapppackagemanagementtaskstate",
    "selfLink": "https://localhost/mgmt/shared/iapp/package-management-tasks/4d62ae98-5302-41ee-8057-479b28372b9f"
  }

Check the status field in the output to know if everything happened as expected. If the package is already installed, you will see FAILED. For example:

.. code::

  {
    "packageFilePath": "/var/config/rest/downloads/HelloWorld-0.1-001.noarch.rpm",
    "packageName": "HelloWorld-0.1-001.noarch.rpm",
    "operation": "INSTALL",
    "step": "INSTALL_PACKAGE",
    "id": "4d62ae98-5302-41ee-8057-479b28372b9f",
    "status": "FAILED",
    "startTime": "2017-10-18T20:06:32.879-0700",
    "endTime": "2017-10-18T20:06:33.184-0700",
    "errorMessage": "Failed to install /var/config/rest/downloads/HelloWorld-0.1-001.noarch.rpm - \tpackage HelloWorld-0.1-001.noarch is already installed",
    "userReference": {
      "link": "https://localhost/mgmt/shared/authz/users/admin"
    },
    "identityReferences": [
      {
        "link": "https://localhost/mgmt/shared/authz/users/admin"
      }
    ],
    "ownerMachineId": "2865e578-0460-44f4-910a-8dc7f220fce1",
    "generation": 4,
    "lastUpdateMicros": 1494471993184210,
    "kind": "shared:iapp:package-management-tasks:iapppackagemanagementtaskstate",
    "selfLink": "https://localhost/mgmt/shared/iapp/package-management-tasks/4d62ae98-5302-41ee-8057-479b28372b9f"
  }

You can check the installation by:

* reviewing the folder `/var/config/rest/iapps/`
* check the output of the command (from your Linux Server)

  .. code::

    curl -k -u admin:admin https://10.1.10.20/mgmt/shared/iapp/global-installed-packages | jq

  .. code::

    $ls /var/config/rest/iapps/
    HelloWorld  RPMS

We can see that the HelloWorld folder is back here.

.. code::

  curl -k -u admin:admin https://10.1.10.20/mgmt/shared/iapp/global-installed-packages | jq

.. code::

  {
    "items": [
      {
        "id": "68e109f0-f40c-372a-95e0-5cc22786f8e6",
        "appName": "HelloWorld",
        "packageName": "HelloWorld-0.1-001.noarch",
        "version": "0.1",
        "release": "001",
        "arch": "noarch",
        "tags": [
          "IAPP"
        ],
        "generation": 1,
        "lastUpdateMicros": 1508331598882884,
        "kind": "shared:iapp:global-installed-packages:installedpackagestate",
        "selfLink": "https://localhost/mgmt/shared/iapp/global-installed-packages/68e109f0-f40c-372a-95e0-5cc22786f8e6"
      }
    ],
    "generation": 1,
    "kind": "shared:iapp:global-installed-packages:installedpackagecollectionstate",
    "lastUpdateMicros": 1508331598883142,
    "selfLink": "https://localhost/mgmt/shared/iapp/global-installed-packages"
  }

You can also check your restnoded.log file:

.. code::

  $tail -10 /var/log/restnoded/restnoded.log

  Wed, 18 Oct 2017 13:27:21 GMT - finest: socket 1 opened
  Wed, 18 Oct 2017 13:27:21 GMT - finest: socket 2 opened
  Wed, 18 Oct 2017 13:27:21 GMT - finest: socket 1 closed
  Wed, 18 Oct 2017 13:27:21 GMT - finest: [LoaderWorker] triggered at path:  /var/config/rest/iapps/HelloWorld/nodejs
  Wed, 18 Oct 2017 13:27:21 GMT - finest: socket 2 closed
  Wed, 18 Oct 2017 13:27:21 GMT - finest: [LoaderWorker] triggered at path:  /var/config/rest/iapps/HelloWorld/nodejs/hello_world.js
  Wed, 18 Oct 2017 13:27:21 GMT - info: DEBUG: HelloWorld - onStart request
  Wed, 18 Oct 2017 13:27:21 GMT - config: [RestWorker] /ilxe_lab/hello_world has started. Name:HelloWorld
  Wed, 18 Oct 2017 13:27:21 GMT - info: DEBUG: HelloWorld - onStart - the default message body is: { "value": "Congratulations on your lab!" }

We can see here that our iControl LX extension has been added to restnoded

Task 3 - Test our iControl extension
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

You can simply redo some of our previous tests to see the outcome:

.. code::

  curl -k -u admin:admin https://10.1.10.20/mgmt/ilxe_lab/hello_world

the console output should look like this:

.. code::

    {"value":"Congratulations on your lab!"}


.. code::

  curl -H "Content-Type: application/json" -k -u admin:admin -X POST -d '{"name":"iControl LX Lab"}' https://10.1.10.20/mgmt/ilxe_lab/hello_world

the console output should look like this:

.. code::

    {"value":"Congratulations on your lab!"}



.. code::

  curl -H "Content-Type: application/json" -k -u admin:admin -X POST -d '{"other":"iControl LX Lab"}' https://10.1.10.20/mgmt/ilxe_lab/hello_world

the console output should look like this (the name parameter wasn't found in the POST payload):

.. code::

    {"value":"Congratulations on your lab!"}

