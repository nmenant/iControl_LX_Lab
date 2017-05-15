============================================================
Exercise 2 - Installing the Hello-World iControlLX extension
============================================================

iControlLX packages
--------------------

iControlLX extensions are distribiuted as RPMs (RedHat Package Management system).

# Lab 1 - Put iControlLX extension onto your iWorkflow or BIG-IP.

To install the iControlLX extension, first you need to copy the iControlLX
package onto you iWorkflow platform, or BIG-IP device, in the following
directory:

`/var/config/rest/downloads`


`scp /var/tmp/HelloWorld-0.1.0-0001.noarch.rpm admin@1.1.1.1/var/config/rest/downloads/`


# Lab 2 - Review the installed iControlLX packages

First lets take a look at the packages installed on your iWorkflow platform, or
BIG-IP device, using:

`GET /mgmt/shared/iapp/global-installed-packages`

Response:
```
{
  "items": [],
  "generation": 8,
  "kind": "shared:iapp:global-installed-packages:installedpackagecollectionstate",
  "lastUpdateMicros": 1494472986881833,
  "selfLink": "https://localhost/mgmt/shared/iapp/global-installed-packages"
}
```


# Lab 3  - Perform the installation
The installation is performed via the iControl REST API package-management-tasks
service. Performing an HTTP POST to this service with the 'INSTALL' operation,
and the location and name of the iControlLX package is all it takes:

```
POST /mgmt/shared/iapp/package-management-tasks
{
  "operation": "INSTALL",
  "packageFilePath": "/var/config/rest/downloads/HelloWorld-0.1.0-0001.noarch.rpm"
}

```

Likely response:

```
{
  "packageFilePath": "/var/config/rest/downloads/HelloWorld-0.1.0-0001.noarch.rpm",
  "operation": "INSTALL",
  "id": "64e37694-0ca2-4098-a8a3-f4b806114db7",
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
  "lastUpdateMicros": 1494471992876555,
  "kind": "shared:iapp:package-management-tasks:iapppackagemanagementtaskstate",
  "selfLink": "https://localhost/mgmt/shared/iapp/package-management-tasks/64e37694-0ca2-4098-a8a3-f4b806114db7"
}
```

Note the "id". If you now query the 'package-managment-tasks' resouce, and
append the "id" you can get the status of the install. For example (HTTP GET):

`GET /mgmt/shared/iapp/package-management-tasks/64e37694-0ca2-4098-a8a3-f4b806114db7`

Will return:





If the package is already installed, you will see FAILED. For example:
{
  "packageFilePath": "/var/config/rest/downloads/HelloWorld-0.1.0-0001.noarch.rpm",
  "packageName": "HelloWorld-0.1.0-0001.noarch",
  "operation": "INSTALL",
  "step": "INSTALL_PACKAGE",
  "id": "64e37694-0ca2-4098-a8a3-f4b806114db7",
  "status": "FAILED",
  "startTime": "2017-05-10T20:06:32.879-0700",
  "endTime": "2017-05-10T20:06:33.184-0700",
  "errorMessage": "Failed to install /var/config/rest/downloads/HelloWorld-0.1.0-0001.noarch.rpm - \tpackage HelloWorld-0.1.0-0001.noarch is already installed",
  "userReference": {
    "link": "https://localhost/mgmt/shared/authz/users/admin"
  },
  "identityReferences": [
    {
      "link": "https://localhost/mgmt/shared/authz/users/admin"
    }
  ],
  "ownerMachineId": "3a2198e1-a419-4b5b-bead-3662a15bdcce",
  "generation": 4,
  "lastUpdateMicros": 1494471993184210,
  "kind": "shared:iapp:package-management-tasks:iapppackagemanagementtaskstate",
  "selfLink": "https://localhost/mgmt/shared/iapp/package-management-tasks/64e37694-0ca2-4098-a8a3-f4b806114db7"
}
