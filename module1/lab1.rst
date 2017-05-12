========================
Lab 1.1 - The daemons
========================

Task 1 - Understand the two primary daemons
-------------------------------------------

When developing iControlLX extensions, there are two daemons you will become
very familiar with:

* restjavad
* restnoded


*restjavad*

restjavad is the main iControl interface. It is written in Java and it is the
REST interface to F5 BIG-IP devices and the F5 iWorkflow platform.

*restnoded*

restnoded is the process that loads your iControlLX extensions and enables their
interaction with BIG-IP devices and iWorkflow platform.

**restnoded** communicates via restjavad

.. TODO: add flow diagram for restnoded/restjavad/mcp

.. image:: _static/<diagram_to_show_restnoded+restjavad_flow>.png

`restnoded` also privded some handy iControlLX services that we explore throughout
the lab.


Task 2 - Start/Stop/Restart the daemons
---------------------------------------

On you're iWorkflow platform command prompt (ssh to iWorkfow), execute the
following:
  `bigstart status restnoded`

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
`bigstart restart restjavad restnoded`
