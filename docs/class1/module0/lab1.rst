Lab 0.1 - Access UDF and Start Your Lab
---------------------------------------

Lab Topology
^^^^^^^^^^^^

Here is the lab topology:

.. list-table::
   :widths: 30 30 30
   :header-rows: 1
   :stub-columns: 1


   * - **Component**
     - **IP**
     - **Credentials**
   * - BIG-IP
     - 10.1.10.21
     - ``admin/admin``

       ``root/default``
   * - iWorkflow
     - 10.1.10.20
     - ``admin/admin``

       ``root/default``
   * - Linux Server
     - 10.1.10.10-13
     - ``student/student``

       ``root/default``
   * - Windows Jumphost
     - 10.1.10.50
     - ``administrator/cXzTEv8E5``

.. nwdiag:: labtopology.diag
   :width: 800
   :caption: Lab Topology
   :name: lab-topology-diagram
   :scale: 110%

Task 1 - Access UDF and Start Your Deployment
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Perform the following steps to complete this task:

#. Connect to UDF and go to "Blueprint".

   .. image:: ../../_static/class1/module0/lab1-image001.png
      :align: center
      :scale: 50%

#. Search for a Blueprint named ``intro to iControl LX extension``.

#. Click the :guilabel:`Deploy` button and a deployment should be created.

#. Go to "Deployments" and start the newly created deployment called ``intro to
   iControl LX extension``.

Task 2 - Wait for Your Deployment to Be Started
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Starting the deployment will take some time, be patient (5-10 minutes)
