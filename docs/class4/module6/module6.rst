Module 6 - Creating an iControl LX package (RPM)
================================================

Creating an iControl LX package (RPM)
-------------------------------------

  Lab 1 - Overview of the package-managment services
  Lab 2 - Creating myFirstExtension-v0.0-1.rpm (versioning)
  Lab 3 - Installing your iControlLX package
  Lab 4 - Uninstalling your package


Lab 1 - Prepare the files for iControlLX package creation

On your iWorkflow platform, execute:

`mkdir -p /var/config/rest/iapps/HelloWorld/nodejs/`

Copy your javascript `hello_world.js` file into this directory.

Lab 2 - Build the package

The minimum requirement to build an iControlLX package is the `appName`, which
must match that of the package directory created in the previous step.

```
POST /mgmt/shared/iapp/build-package
{
  "appName": "HelloWorld"
}
```


You'll get back a response that looks something like this:

```
{
  "step": "GET_LATEST_BLOCK_STATES_AND_PERSIST_TO_DISK",
  "packageDirectory": "/var/config/rest/iapps/HelloWorld",
  "appName": "HelloWorld",
  "packageVersion": "0.1.0",
  "packageRelease": "0001",
  "force": true,
  "rpmDescription": "Default exported iApp description.",
  "rpmSummary": "Default exported iApp summary.",
  "id": "bb36d374-d253-419f-8447-25f9a1c43923",
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
  "lastUpdateMicros": 1494466050101514,
  "kind": "shared:iapp:build-package:buildrpmtaskstate",
  "selfLink": "https://localhost/mgmt/shared/iapp/build-package/bb36d374-d253-419f-8447-25f9a1c43923"
}
```

To view the status of the package creation, take the 'id' and append that to
the end of the build-package URI like so (this is a GET request):

`GET /mgmt/shared/iapp/build-package/bb36d374-d253-419f-8447-25f9a1c43923`

You will receive the following when it is successfully created
("status": "FINISHED"):

```
{
  "step": "COMPLETE_TASK",
  "packageDirectory": "/var/config/rest/iapps/HelloWorld",
  "appName": "HelloWorld",
  "specFilePath": "/var/config/rest/node/tmp/29463f3b-7a80-482e-8b47-afa485116a6f.spec",
  "buildCommand": "rpmbuild -bb --define '_tmppath /shared/tmp' --define 'main /var/config/rest/iapps/HelloWorld' --define '_topdir /var/config/rest/node/tmp' '/var/config/rest/node/tmp/29463f3b-7a80-482e-8b47-afa485116a6f.spec'",
  "packageVersion": "0.1.0",
  "packageRelease": "0001",
  "force": true,
  "rpmDescription": "Default exported iApp description.",
  "rpmSummary": "Default exported iApp summary.",
  "isSpecFileToCleanUp": true,
  "builtRpmPackageFilePath": "/var/config/rest/iapps/RPMS/HelloWorld-0.1.0-0001.noarch.rpm",
  "id": "bb36d374-d253-419f-8447-25f9a1c43923",
  "status": "FINISHED",
  "startTime": "2017-05-10T18:27:30.107-0700",
  "endTime": "2017-05-10T18:27:30.411-0700",
  "userReference": {
    "link": "https://localhost/mgmt/shared/authz/users/admin"
  },
  "identityReferences": [
    {
      "link": "https://localhost/mgmt/shared/authz/users/admin"
    }
  ],
  "ownerMachineId": "3a2198e1-a419-4b5b-bead-3662a15bdcce",
  "generation": 9,
  "lastUpdateMicros": 1494466050411659,
  "kind": "shared:iapp:build-package:buildrpmtaskstate",
  "selfLink": "https://localhost/mgmt/shared/iapp/build-package/bb36d374-d253-419f-8447-25f9a1c43923"
}
```

Lab 3 - Retrieving your iControl LX package.

Note also in the build-package completion response above, the
*builtRpmPackageFilePath*, as below:

```
"builtRpmPackageFilePath": "/var/config/rest/iapps/RPMS/HelloWorld-0.1.0-0001.noarch.rpm"
```

This is where you collect your RPM from. For example:
`scp admin@x.x.x.x/var/config/rest/iapps/RPMS/HelloWorld-0.1.0-0001.noarch.rpm /var/tmp`

Now you can delete the rpm from `/var/config/rest/iapps/RPMS/`

To install your iControlLX package onto an iWorkflow or BIG-IP, follow the
instructions in Module 3, exercise 2.

 .. toctree::
     :maxdepth: 1
     :glob:

     lab*
