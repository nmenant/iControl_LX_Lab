========================
Lab 1.1 - The daemons
========================

Task 1 - Understand the two primary daemons
-------------------------------------------

When developing iControlLX extensions, there are two daemons to be aware of:

* restjavad
* restnoded


.. image:: _static/image001.png


*restjavad* presents F5 iControl REST, the interface to BIG-IP devices and the
iWorkflow platform.

*restnoded* presents services for developing iControlLX extensions, in addition
to activing as the interface to *restjavad* and the iControl REST API.

.. Note In the diagram above, the orange line represents an iControl REST services
  that ships with the iWorkflow platform. The green line represents a REST call
  to a custom iControlLX extension written for NodeJS.


Task 2 - Start/Stop/Restart the daemons
---------------------------------------

On you're iWorkflow platform command prompt (ssh to iWorkfow), execute the
following:
  ``bigstart status restnoded``

.. Note You can specify multuple daemons with the bigstart command. For example:
    `bigstart status restjavad restnoded`

  You can also omit the daemon name to get the status of ALL F5 controlled
  daemons, for example:
    `bigstart status`


.. Note The following bigstart commands are supported:
  bigstart status <daemon>
  bigstart start <daemon>
  bigstart restart <daemon>
  bigstart stop <daemon>

Restart the restnoded & restjavad daemons by executing:
``bigstart restart restjavad restnoded``
