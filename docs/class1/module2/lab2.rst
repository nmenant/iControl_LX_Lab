Lab 2.2 - Edit an iControl REST Resource via ToC
------------------------------------------------

Task 1 - Review the User Accounts
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Perform the following steps to complete this task:

#. Navigate to ``/mgmt/toc``

#. In the search textbox, type ``authz``

#. From the results, select ``authz/users``

#. You are now viewing all of the user accounts on your iWorkflow platform.

   .. image:: ../../_static/class1/module2/lab2-image001.png
      :align: center
      :scale: 50%

Task 2 - Create a New User
^^^^^^^^^^^^^^^^^^^^^^^^^^

#. Click the ``+`` at the top of the user list

#. Enter a previously unused username, for example ``user42``

#. Enter a password in the ``password`` field

#. Click :guilabel:`Save`

#. Note the new user in the list

   .. image:: ../../_static/class1/module2/lab2-image002.png
      :align: center
      :scale: 50%

Task 3 - Modify the New User
^^^^^^^^^^^^^^^^^^^^^^^^^^^^

#. Click on the new user

#  Note the ``displayName`` has been auto-populated with the ``username`` value.

#. Click the :guilabel:`Edit` button.

#. Change the value of ``displayName`` to ``User 42``

#. Click the :guilabel:`Save` button

   .. image:: ../../_static/class1/module2/lab2-image003.png
      :align: center
      :scale: 50%

Task 4 - Login as the New User
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

#. Open a new browser window and navigate to ``https://10.1.10.20/``

#. Login as the new user

#. Note the different ``displayName`` and ``username``.

   .. image:: ../../_static/class1/module2/lab2-image004.png
      :align: center
      :scale: 50%

#. Also note that you can't do very much with this user. It has not been added
   to any roles or given any permissions

#. Close this browser and go back to the previous one

