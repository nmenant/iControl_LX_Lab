========================
Exercise 1 - The daemons
========================

When developing iControlLX extensions, there are two daemons you will become
very familiar with:

* restjavad
* restnoded


restjavad
---------
This is the main iControl daemon.

restnoded
---------
This is the daemon that loads your iControlLX extensions and enables them to
interact with BIG-IP device and iWorkflow platform.

**restnoded** communicates via restjavad

`restnoded` also privded some handy iControlLX services that we explore throughout
the lab.

.. TODO: add flow diagram for restnoded/restjavad/mcp


Start/Stop/Restart the daemons
------------------------------

1) On you're iWorkflow platform command prompt (ssh to iWorkfow), execute the
following:
  `bigstart status restnoded`

.. Note You can specify multuple daemons with the bigstart command. For example:
    `bigstart status restjavad restnoded`.
  You can also omit the daemon name to get the status of ALL F5 controlled
  daemons, for example:
    `bigstart status`


.. Note The following bigstart commands are supported:
  bigstart status <daemon>
  bigstart start <daemon>
  bigstart restart <daemon>
  bigstart stop <daemon>

2) Restart the restnoded & restjavad daemons by executing:
`bigstart restart restjavad restnoded`
