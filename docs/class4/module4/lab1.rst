Lab 4.1 - Creating the Hello-World iControl LX extension
----------------------------------------------------------

iControl LX extensions are distributed as RPMs (RedHat Package Management system) when you want to leverage something existing. However when you start from scratch, you'll need to create your extension and then build a RPM that you can distribute accordingly

Task 1 - Create our iControl LX extension onto iWorkflow
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

iControl LX extension can be installed on either BIG-IP or iWorkflow platform. For this lab, we will use iWorkflow.

To install the iControl LX extension, first you need to copy the iControlLX package onto your iWorkflow platform, or BIG-IP device, in the following directory: `/var/config/rest/downloads`


``scp /var/tmp/HelloWorld-0.1.0-0001.noarch.rpm admin@10.1.1.12/var/config/rest/downloads/``

On your iWorkflow platform, execute:

`mkdir -p /var/config/rest/iapps/HelloWorld/nodejs/`

Copy your javascript `hello_world.js` file into this directory.


Task 2 - Check our iControl LX extension is working
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

In your web browser, navigate to:

``https://10.1.1.12/mgmt/ilxe_lab/hello_world``


You could also use `curl` in CLI:

``curl -u admin:admin https://10.1.1.12/mgmt/ilxe_lab/hello_world``

Or a REST client like POSTMAN.
