Lab 4.3 - Create a New iControl LX Extension RPM
------------------------------------------------

Here, our curl commands will return a fair amount of output. To make it more
readable, we will need ``jq``.  ``jq`` is not available on BIG-IP or iWorkflow.

To run the next curl commands, do it from the Linux server(``10.1.10.10``). It's already
defined in PUTTY. Login: ``student``, Password: ``student``

Task 1 - Create a new RPM for the Updated iControl LX Extension
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

The minimum requirement to build an iControlLX package is the ``appName``, which
must match the directory name you use in ``/var/config/rest/iapps`` to store
your extension. In our lab, the folder's name is ``HelloWorld``

Here is the REST command to start the package creation:

.. code::

   POST /mgmt/shared/iapp/build-package
   {
     "appName": "HelloWorld",
     "packageVersion": "0.1",
     "packageRelease": "001"
   }

Perform the following steps to complete this task:

#. Execute the following command to start package creation:

   ``curl -H "Content-Type: application/json" -k -u admin:admin -X POST -d '{"appName": "HelloWorld", "packageVersion": "0.1", "packageRelease": "001"}' https://10.1.10.20/mgmt/shared/iapp/build-package | jq``

   .. NOTE:: The ``| jq`` will format the response in something more readable

#. You'll get back a response that looks something like this:

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

#. To view the status of the package creation, take the ``id`` and append that
   to the end of the build-package URI like so (this is a GET request):

   ``curl -k -u admin:admin https://10.1.10.20/mgmt/shared/iapp/build-package/3ae60863-9d92-40a0-a69a-1acc337100b9 | jq``

#. You will receive the following when it is successfully created:
   ("status": "FINISHED"):

   .. code::

      {
        "step": "COMPLETE_TASK",
        "packageDirectory": "/var/config/rest/iapps/HelloWorld",
        "appName": "HelloWorld",
        "specFilePath": "/var/config/rest/node/tmp/0b4c612e-6cfc-4ee7-b188-81fd6e1abb7d.spec",
        "buildCommand": "rpmbuild -bb --define '_tmppath /shared/tmp' --define 'main /var/config/rest/iapps/HelloWorld' --define '_topdir /var/config/rest/node/tmp'    '/var/config/rest/node/tmp/0b4c612e-6cfc-4ee7-b188-81fd6e1abb7d.spec'",
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

Task 3 - Retrieving your iControl LX Package
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Note also in the build-package completion response above, the
``builtRpmPackageFilePath`` field, it should look like this:

``"builtRpmPackageFilePath": "/var/config/rest/iapps/RPMS/HelloWorld-0.1-001.noarch.rpm"``

This is where you collect your RPM from. You can retrieve your RPM either with
something like ``WinSCP``, ``SCP`` or your favorite tool.

No need to retrieve it for this lab.

Task 4 - Remove the iControl Extension
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Now that we have our RPM, we may want to remove what we create ourselves
(the HelloWorld folder in `/var/config/rest/iapps` and also that it is loaded
in restnoded). Since we started the iControl extension from scratch, we will
need to remove it also manually.

Perform the following steps to complete this task:

#. On iWorkflow, run the following command:

   ``restcurl shared/nodejs/loader-path-config``

#. You should have an output like this:

   .. code::

      {
        "items": [
        {
          "id": "ad130c79-59a0-49c7-a7e7-ff39efe956b5",
          "workerPath": "/var/config/rest/iapps/HelloWorld",
           "generation": 1,
          "lastUpdateMicros": 1508242306312732,
          "kind": "shared:nodejs:loader-path-config:loaderpathstate",
          "selfLink": "https://localhost/mgmt/shared/nodejs/loader-path-config/ad130c79-59a0-49c7-a7e7-ff39efe956b5"
        }
        ],
        "generation": 1,
        "kind": "shared:nodejs:loader-path-config:loaderpathcollectionstate",
        "lastUpdateMicros": 1508242306328021,
        "selfLink": "https://localhost/mgmt/shared/nodejs/loader-path-config"
      }

#. Here we can see the ID of our extension: ``ad130c79-59a0-49c7-a7e7-ff39efe956b5``.
   To delete this extension, you can run the following command:

   .. NOTE:: Replace the string ``ad130c79-59a0-49c7-a7e7-ff39efe956b5`` with
      your own extension id.

   ``restcurl -X DELETE shared/nodejs/loader-path-config/ad130c79-59a0-49c7-a7e7-ff39efe956b5``


#. Your output should be like this:

   .. code::

      {
        "id": "ad130c79-59a0-49c7-a7e7-ff39efe956b5",
        "workerPath": "/var/config/rest/iapps/HelloWorld",
        "generation": 1,
        "lastUpdateMicros": 1508242306312732,
        "kind": "shared:nodejs:loader-path-config:loaderpathstate",
        "selfLink": "https://localhost/mgmt/shared/nodejs/loader-path-config/ad130c79-59a0-49c7-a7e7-ff39efe956b5"
      }
      Oct 18 14:33:06 iworkflow emerg logger: Re-starting restnoded

#. As you can see ``restnoded`` got restarted automatically to remove the extension.

#. You can validate that your extension has been removed from ``restnoded`` by
   trying to access it again (run this command from the Linux Server):

   ``curl -k -u admin:admin https://10.1.10.20/mgmt/ilxe_lab/hello_world | jq``

#. Here your request should fail and the output should be similar to this:

   .. code::

      {
        "error": {
          "code": 404,
          "message": "",
          "innererror": {
            "referer": "192.168.143.1",
             "originalRequestBody": "",
            "errorStack": []
          }
        }
      }

#. You can now delete your working directory to complete erase this extension
   from your iWorkflow platform. from the iWF CLI, run this command:

   ``rm -rf /var/config/rest/iapps/HelloWorld``
