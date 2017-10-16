Lab 4.3 - Delete the package
----------------------------

Before we go on to some of the more advanced themes, its important to know how
to remove an iControl LX extension.

Task 1 - Verify the 'packageName'

Verify the package name with the following transaction:

`GET /mgmt/shared/iapp/global-installed-packages`


Task 2 - Create the 'delete' task

To delete the HelloWorld iControl LX extension, perform the following POST to
the 'package-management-tasks' REST resource.


.. code::

  POST /mgmt/shared/iapp/package-management-tasks/
  {
   "operation": "UNINSTALL",
   "packageName": "HelloWorld-0.1.0-0001.noarch.rpm"
  }

A typical response looks like:

.. code::

  {
    "packageName": "HelloWorld-0.1.0-0001.noarch.rpm",
    "operation": "UNINSTALL",
    "id": "6cfe3efa-8e13-4380-8867-3d76c95f671e",
    "status": "CREATED",
    "userReference": {
      "link": "https://localhost/mgmt/shared/authz/users/admin"
    },
    "identityReferences": [
      {
        "link": "https://localhost/mgmt/shared/authz/users/admin"
      }
    ],
    "ownerMachineId": "3a2198e1-a419-4b5b-bead-3662a15bdcce",
    "generation": 1,
    "lastUpdateMicros": 1494472803958021,
    "kind": "shared:iapp:package-management-tasks:iapppackagemanagementtaskstate",
    "selfLink": "https://localhost/mgmt/shared/iapp/package-management-tasks/6cfe3efa-8e13-4380-8867-3d76c95f671e"
  }

Task 3 - [OPTIONAL] Verify the iControl LX extension is gone

Perform a GET request to `global-installed-packages` to confirm it is no
longer there:

`GET /mgmt/shared/iapp/global-installed-packages`
