==============================================================
Exercise 4 - Delete the package
==============================================================

Review the extension
--------------------


POST /mgmt/shared/iapp/package-management-tasks/
{
  "operation": "UNINSTALL",
  "packageName": "HelloWorld-0.1.0-0001.noarch.rpm"
}

Response:

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
