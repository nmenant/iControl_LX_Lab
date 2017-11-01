Lab 4.5 - Delete the Package
----------------------------

It's important to know how to remove an iControl LX extension in case an
extension is not needed anymore

Task 1 - Verify the 'packageName'
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Perform the following steps to complete this task:

#. To verify the package name, from your ``Linux Server``, run the following
   command:

   ``curl -k -u admin:admin https://10.1.10.20/mgmt/shared/iapp/global-installed-packages | jq``

#. The output should be:

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
            "lastUpdateMicros": 1509360548703082,
            "kind": "shared:iapp:global-installed-packages:installedpackagestate",
            "selfLink": "https://localhost/mgmt/shared/iapp/global-installed-packages/68e109f0-f40c-372a-95e0-5cc22786f8e6"
          }
        ],
        "generation": 1,
        "kind": "shared:iapp:global-installed-packages:installedpackagecollectionstate",
        "lastUpdateMicros": 1509360548703335,
        "selfLink": "https://localhost/mgmt/shared/iapp/global-installed-packages"
      }

#. We can see that ``packageName`` is ``HelloWorld-0.1-001.noarch``

Task 2 - Create the 'delete' Task
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Perform the following steps to complete this task:

#. To delete the HelloWorld iControl LX extension, perform the following POST to
   the 'package-management-tasks' REST resource.

   ``curl -H "Content-Type: application/json" -k -u admin:admin -X POST -d '{"operation": "UNINSTALL","packageName": "HelloWorld-0.1-001.noarch"}' https://10.1.10.20/mgmt/shared/iapp/package-management-tasks | jq``

#. A typical response looks like:

   .. code::

      {
        "packageName": "HelloWorld-0.1-001.noarch",
        "operation": "UNINSTALL",
        "id": "075149e9-3448-4ce1-88db-c6d877eff772",
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
        "lastUpdateMicros": 1508332360754713,
        "kind": "shared:iapp:package-management-tasks:iapppackagemanagementtaskstate",
        "selfLink": "https://localhost/mgmt/shared/iapp/package-management-tasks/075149e9-3448-4ce1-88db-c6d877eff772"
      }

#. If you have a iWorkflow terminal, check it, you should see something like
   this:

   ``Oct 18 15:18:37 iworkflow emerg logger: Re-starting restnoded``

Task 3 - [OPTIONAL] Verify the iControl LX Extension was Deleted
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Perform the following steps to complete this task:

#. Perform a ``GET`` request to ``global-installed-packages`` to confirm it is
   no longer there:

   ``curl -k -u admin:admin https://10.1.10.20/mgmt/shared/iapp/global-installed-packages | jq``

#. The output should look like:

   .. code::

      {
        "items": [],
        "generation": 2,
        "kind": "shared:iapp:global-installed-packages:installedpackagecollectionstate",
        "lastUpdateMicros": 1508332717062299,
        "selfLink": "https://localhost/mgmt/shared/iapp/global-installed-packages"
      }

#. You can also try to access the iControl LX extension:

   ``curl -k -u admin:admin https://10.1.10.20/mgmt/ilxe_lab/hello_world | jq``

   Here your request should fail and the output should be similar to this:

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

#. If you connect to the iWorkflow platform, you should see that the folder
   ``HelloWorld`` has been automatically removed from
   ``/var/config/rest/iapps``.
