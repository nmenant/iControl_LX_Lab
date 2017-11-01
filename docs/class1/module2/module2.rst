Module 2 - Interacting with an iControl LX extension
====================================================

In this module, we are going to introduce the basic themes and then review an
iControl LX extension.

The following exercises will be performed on the iWorkflow platform
(``https://10.1.10.20``).

While the iControl LX framework runs on both BIG-IP and iWorkflow, there are
many workflows that don't make sense to run directly on the BIG-IP. For
example, if we developed an extension that presented the status of a Fleet
of BIG-IP devices, it would make far more sense to do this from a central
platform, than on each individual BIG-IP.

.. NOTE:: This lab will NOT guide you through the iWorkflow or BIG-IP lab setup.
   For information on installing and configuring BIG-IP and iWorkflow, please
   visit:

   * `F5 iWorkflow <https://devcentral.f5.com/wiki/iWorkflow.HomePage.ashx>`_
   * `F5 BIG-IP <https://support.f5.com/csp/knowledge-center/software/BIG-IP?module=BIG-IP%20LTM>`_

**Exercises in this Module**

- Lab 2.1 - Interact with a REST extension

  - Task 1 - View the API via Web Browser
  - Task 2 - Interact with a REST Resource
  - Task 3 - The '/presentation#' Extension
  - Task 4 - Editing a REST Resource

- Lab 2.2 - Edit an iControl REST Resource via /mgmt/toc

  - Task 1 - Review the User Accounts
  - Task 2 - Create a New User
  - Task 3 - Modify the New User
  - Task 4 - Login as the New User

- Lab 2.3 - Advanced (raw JSON)

  - Task 1 - View the JSON Representation of a User Account
  - Task 2 - Modify a User Account's JSON Representation
  - Task 3 - Delete the User

.. toctree::
  :maxdepth: 1
  :glob:

  lab*
