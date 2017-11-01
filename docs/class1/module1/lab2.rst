Lab 1.2 - Troubleshooting, Logs, etc
------------------------------------

Understand the iControl & iControl LX Logs
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

In Lab 1.1 we explored the two key daemons responsible for iControl
REST, and iControl LX extensions. The two logs for these daemons are:

``/var/log/restjavad/restjavad.0.log``

``/var/log/restnoded/restnoded.log``

Its important to be familiar with both of these logs while developing
iControl LX extensions. You will get to know ``restnoded.log`` very well!

Task 1 - Streaming the log output
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

You can open these logs with any text editor/reader. However, its far more
efficient to stream the output while operations such as starting the restnoded
daemon are taking place.

Perform the following steps to complete this task:

#. To 'stream' the output of restnoded, use the ``tail`` command. For example:

   ``tail -f /var/log/restnoded/restnoded.log``

#. Log output will now be printed as soon as it occurs.  To stop the output and
   return to a shell type ``Ctrl+c``

Task 2 - Combining Commands, for Extra Efficiency
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

To ensure you don't miss any output while your iControl LX extension
is loading, you can execute the ``restnoded restart`` command, and the ``tail``
commands together using the separator ``;``

For example:

``bigstart restart restnoded; tail -f /var/log/restnoded/restnoded.log``

.. NOTE:: The ``;`` means to execute the first command,
   ``bigstart restart restnoded``, and then the second command,
   ``tail -f /var/log/restnoded/restnoded.log`` immediately after.

