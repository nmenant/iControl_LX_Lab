Lab 3.2 - Beyond "GET"
----------------------

Task 1 - Understand the 'other' HTTP verbs
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

The iControl LX Framework also provides access to the following HTTP verbs:
`POST, PUT, PATCH, DELETE`. In this Lab we will cover when you should use which
HTTP verb.

1. POST is for creating resources.

For example, in the previous exercise we created a new user in the
`/mgmt/shared/authz/users/` collection. This is done by POSTing to
`https://<ip_address>/mgmt/shared/authz/users/` and results in a new REST
resource under the 'users' collection.

For your iControl LX extension to handle an HTTP POST, you must implement the
`onPost()` HTTP Method processor.


2. PUT is for replacing a resources properties.
Think of PUT as a special type of POST for existing REST resource. Lets say we
have the following REST resource:

`/mgmt/shared/authz/users/new_user`

with the properties:

.. code ::

    {
        "name": "new_user",
        "role": "manager",
        "password":"xyz1234"
    }


If we were to perform the following 'PUT', the 'role' would no longer exist:

.. code ::

    PUT /mgmt/shared/authz/users/new_user
    {
       "name": "new_user"
        "password":"xyz1234"
    }


Performing a PUT on a REST resource is like performing a 'select-all' and then
'replace'.

For your iControl LX extension to handle an HTTP PUT you must implement the
`onPut()` HTTP Method processor.


3. PATCH is for editing parts of a REST resource.

Patch is for situations where you may want to change only parts of a REST
resource. For example, lets say I want to change the 'role' of our 'new_user'
resource:

.. code::

    PATCH /mgmt/shared/authz/users/new_user
    {
        "role": "manager"
    }


The other properties, in this case 'name' and 'password', would remain
untouched.

For your iControl LX extension to handle an HTTP PATCH you must implement the
`onPatch()` HTTP Method processor.


4. DELETE a REST resource

In the event that you want to delete a resource you would implement the
onDelete() HTTP Method processor.

.. code::

    DELETE /mgmt/shared/authz/users/new_user

.. Note::

    You can delete a resource but not a collection. For example, you can delete '/mgmt/shared/authz/users/new_user', but not '/mgmt/shared/authz/users'.
