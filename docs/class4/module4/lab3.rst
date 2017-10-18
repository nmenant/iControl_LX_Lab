Lab 4.3 - Create a new iControl LX extension RPM
------------------------------------------------

Task 1 - create a new RPM for the updated iControl LX extension
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

The minimum requirement to build an iControlLX package is the `appName`, which
must match the directory name you use in `/var/config/rest/iapps` to store your extension.

Here is the REST command to create the package creation

.. code::

  POST /mgmt/shared/iapp/build-package
  {
   "appName": "HelloWorld"
  }

You can use the following command to do this :

``curl -H "Content-Type: application/json" -k -u admin:admin -X POST -d '{"appName": "HelloWorld", "packageVersion": "0.1", "packageRelease": "001"}' https://10.1.1.12/mgmt/shared/iapp/build-package | jq``

.. note::

    the | jq will format the response in something more readable

You'll get back a response that looks something like this:

.. code::

  {
    "step": "GET_LATEST_BLOCK_STATES_AND_PERSIST_TO_DISK",
    "packageDirectory": "/var/config/rest/iapps/HelloWorld",
    "appName": "HelloWorld",
    "force": true,
    "rpmDescription": "Default exported iApp description.",
    "rpmSummary": "Default exported iApp summary.",
    "id": "3ae60863-9d92-40a0-a69a-1acc337100b9",
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
    "lastUpdateMicros": 1508321173979420,
    "kind": "shared:iapp:build-package:buildrpmtaskstate",
    "selfLink": "https://localhost/mgmt/shared/iapp/build-package/3ae60863-9d92-40a0-a69a-1acc337100b9"
  }

To view the status of the package creation, take the 'id' and append that to
the end of the build-package URI like so (this is a GET request):

``curl -k -u admin:admin https://10.1.1.12/mgmt/shared/iapp/build-package/3ae60863-9d92-40a0-a69a-1acc337100b9 | jq``

You will receive the following when it is successfully created
("status": "FINISHED"):

.. code::

  {
    "step": "COMPLETE_TASK",
    "packageDirectory": "/var/config/rest/iapps/HelloWorld",
    "appName": "HelloWorld",
    "specFilePath": "/var/config/rest/node/tmp/0b4c612e-6cfc-4ee7-b188-81fd6e1abb7d.spec",
    "buildCommand": "rpmbuild -bb --define '_tmppath /shared/tmp' --define 'main /var/config/rest/iapps/HelloWorld' --define '_topdir /var/config/rest/node/tmp' '/var/config/rest/node/tmp/0b4c612e-6cfc-4ee7-b188-81fd6e1abb7d.spec'",
    "packageVersion": "0.1",
    "packageRelease": "001",
    "force": true,
    "rpmDescription": "Default exported iApp description.",
    "rpmSummary": "Default exported iApp summary.",
    "isSpecFileToCleanUp": true,
    "builtRpmPackageFilePath": "/var/config/rest/iapps/RPMS/HelloWorld-0.1-001.noarch.rpm",
    "id": "3ae60863-9d92-40a0-a69a-1acc337100b9",
    "status": "FINISHED",
    "startTime": "2017-10-18T12:17:22.470+0200",
    "endTime": "2017-10-18T12:17:22.833+0200",
    "userReference": {
        "link": "https://localhost/mgmt/shared/authz/users/admin"
    },
    "identityReferences": [
        {
            "link": "https://localhost/mgmt/shared/authz/users/admin"
        }
    ],
    "ownerMachineId": "2865e578-0460-44f4-910a-8dc7f220fce1",
    "generation": 10,
    "lastUpdateMicros": 1508321842833090,
    "kind": "shared:iapp:build-package:buildrpmtaskstate",
    "selfLink": "https://localhost/mgmt/shared/iapp/build-package/b7dec0ba-c9cb-40c4-833f-77c51f853c88"
  }

Task 3 - Retrieving your iControl LX package
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Note also in the build-package completion response above, the
*builtRpmPackageFilePath*, as below:

.. code::

  "builtRpmPackageFilePath": "/var/config/rest/iapps/RPMS/HelloWorld-0.1-001.noarch.rpm"


This is where you collect your RPM from. For example:

``scp admin@10.1.1.12:/var/config/rest/iapps/RPMS/HelloWorld-0.1-001.noarch.rpm /var/tmp``

Now you can delete the rpm from `/var/config/rest/iapps/RPMS/`


