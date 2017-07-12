========================
Lab 1.1 - The daemons
========================

Task 1 - Understand the two primary daemons
-------------------------------------------

When developing iControl LX extensions, there are two daemons to be aware of:

* restjavad
* restnoded


.. image:: _static/image001.png


*restjavad* presents F5 iControl REST, the interface to BIG-IP devices and the
iWorkflow platform.

*restnoded* presents services for developing iControl LX extensions, in addition
to acting as the interface to *restjavad* and the iControl REST API.

.. NOTE::
    In the diagram above, the orange line represents an iControl REST resource
    that ships with the iWorkflow platform. The green line represents a REST
    call to a custom iControlLX extension written for NodeJS.


Task 2 - Start/Stop/Restart the daemons
---------------------------------------

On an iWorkflow platform command prompt (ssh to iWorkfow), execute the
following:
  ``bigstart status restnoded``

.. NOTE::
  You can specify multiple daemons with the ``bigstart`` command. For example,
  the following will get the status of both 'restavad' and 'restnoded':
    ``bigstart status restjavad restnoded``

  Or specify none to get the status of ALL F5 controlled daemons, for example:
    ``bigstart status``


The following bigstart commands are supported:

- ``bigstart status <daemon>``
- ``bigstart start <daemon>``
- ``bigstart restart <daemon>``
- ``bigstart stop <daemon>``

1. Restart the restnoded & restjavad daemons by executing:

``bigstart restart restjavad restnoded``

.. toctree::
   :maxdepth: 1
   :glob:
