/**
 * An iControlLX extension that handles VS IP Address through an IPAM solution
*/

var logger = require('f5-logger').getInstance();
var DEBUG = true;
var WorkerName = "my-app-interface";
var IWF_IP = "10.1.10.20";
var IPAM_IP = "10.1.10.21";
var IPAM_Port = "79";
var http = require('http');
var tenantName = "student";
var connectorReference = "58df07a5-f51c-45ac-a35b-406cfb35840c";
//var connectorReference = "901f35d2-208a-4ad2-b852-b8b89c950f39";

function ipam_extension() {
}

//we define our worker path
ipam_extension.prototype.WORKER_URI_PATH = "/shared/my-app-interface";

ipam_extension.prototype.isPublic = true;

//triggered when our worker is loaded
ipam_extension.prototype.onStart = function (success) {
  logger.info(WorkerName + " - onStart()");
  success();
};

ipam_extension.prototype.onGet = function (restOperation) {
  logger.info(WorkerName + " - onGet()");
  var newState = restOperation.getBody();
  this.completeRestOperation(restOperation);
};


ipam_extension.prototype.onPost = function (restOperation) {
  logger.info(WorkerName + " - onPost()");
  var newState = restOperation.getBody();
  var templateName = newState.template;

  if (DEBUG === true) {
    logger.info("DEBUG: " + WorkerName + "IPAM REST Call - onPost - ");
  }

  if ( templateName ) {
    aThis = this;
    //variables we will needed to do the app deployment on iWF, extracted from the payload sent by user
		var serviceName = newState.name;
		var varsList = newState.vars;
    var tablesList = newState.tables;

		//uri to pull our ipam solution. I use an iRule on a bigip to simulate the transaction
		var options = {
			"method": "GET",
      "hostname": IPAM_IP,
      "port": IPAM_Port,
      "path": "/",
      "headers": {
        "cache-control": "no-cache"
      }
	  };

		var req = http.request(options, function (res) {
			var chunks = [];

    	res.on("data", function (chunk) {
        chunks.push(chunk);
    	});

    	res.on("end", function () {
        var VS_IP_Payload = Buffer.concat(chunks);
        var VS_IP_Obj = JSON.parse(VS_IP_Payload);
				var VS_IP = VS_IP_Obj.IP;
				if (DEBUG === true) {
       	  logger.info("DEBUG: " + WorkerName + "IPAM REST Call - onPost - the retrieved IP is: " + VS_IP);
        }
				// Now that we have the IP we need to work on deploying the service template.
				// we create the app definition but we add the IPAM IP for Pool__Addr
				var updateRestBody = "{ \"name\": \"" + serviceName + "\", \"tenantTemplateReference\": { \"link\": \"https://localhost/mgmt/cm/cloud/tenant/templates/iapp/" + templateName + "\"}, \"tenantReference\": { \"link\": \"https://localhost/mgmt/cm/cloud/tenants/" + tenantName + "\"},\"vars\": [";

				// reminder: var varsList = newState.vars -> it contains all the vars that were defined in our app definition
				for(var i=0; i < varsList.length; i++) {
					composeBody(varsList[i]);
				}
				function composeBody(message){
					updateRestBody += " { \"name\" : \"" + message.name + "\", \"value\" : \"" + message.value + "\"},";
  			}

				//we add the VS IP to the variable to create the service properly
				updateRestBody += "{\"name\": \"pool__addr\",\"value\": \"" + VS_IP + "\"}], \"tables\": ";
				updateRestBody += JSON.stringify(tablesList,' ','\t');

				//add the connector reference
				updateRestBody += ",\"properties\": [{\"id\": \"cloudConnectorReference\",\"isRequired\": false, \"value\": \"https://localhost/mgmt/cm/cloud/connectors/local/" + connectorReference + "\"}]";
				updateRestBody += ",\"selfLink\": \"https://localhost/mgmt/cm/cloud/tenants/" + tenantName + "/services/iapp/" + serviceName + "\"}";
				if (DEBUG === true) {
					logger.info ("DEBUG: " + WorkerName + " update service BODY is: " + JSON.stringify(updateRestBody,' ','\t'));
				}
				//We generate the PUT API call

				var uri = aThis.restHelper.buildUri({
					protocol: aThis.wellKnownPorts.DEFAULT_HTTPS_SCHEME,
					port: "443",
					hostname: IWF_IP,
					path: "/mgmt/cm/cloud/tenants/" + tenantName + "/services/iapp/"
				});

				var updateService = aThis.restOperationFactory.createRestOperationInstance()
          .setMethod("Post")
          .setUri(uri)
          .setBody(updateRestBody)
          .setIdentifiedDeviceRequest(true);

				aThis.eventChannel.emit(
          aThis.eventChannel.e.sendRestOperation,
          updateService,
          function(respPostRequest) {
						if (DEBUG === true) {
              logger.info ("DEBUG: " + WorkerName + " - function RestPostRequest, Service created successfully");
            }
					}, function(err) {
						logger.info("DEBUG: " + WorkerName + " [Test Call Rest respPostServiceDeployment Error:] %j", err);
					}
				);
			});
		});
		req.end();
	}
	this.completeRestOperation(restOperation);
};

ipam_extension.prototype.onPut = function (restOperation) {
  var newState = restOperation.getBody();
  this.logger.info(WorkerName + " - onPut()");

  var serviceName = newState.name;
  var varsList = newState.vars;
  var tablesList = newState.tables;
  var templateName = newState.template;
  var aThis = this;

  //we retrieve the VS IP
  var uri = aThis.restHelper.buildUri({
    protocol: aThis.wellKnownPorts.DEFAULT_HTTPS_SCHEME,
    port: "443",
    hostname: IWF_IP,
    path: "/mgmt/cm/cloud/tenants/" + tenantName + "/services/iapp/" + serviceName
  });

  var updateService = aThis.restOperationFactory.createRestOperationInstance()
    .setMethod("Get")
    .setUri(uri)
    .setIdentifiedDeviceRequest(true);

  aThis.eventChannel.emit(
    aThis.eventChannel.e.sendRestOperation,
    updateService,
    function(respGetRequest) {
      //we retrieve the body of the response
      var respBody = respGetRequest.getBody();
      var appVarsList = respBody.vars;
      var VS_IP;
      var bThis = aThis;

      //we parse vars until we find Pool_Addr since it contains the VS IP
      for (var i=0; i < appVarsList.length; i++) {
        if (appVarsList[i].name == "pool__addr") {
          VS_IP = appVarsList[i].value;
          if (DEBUG === true) {
            logger.info ("DEBUG: " + WorkerName + " - onPut : VS_IP from service to update is: " + VS_IP);
          }
        }
      }

      //now we update the service accordingly
      // we create the app definition but we add the IPAM IP for Pool__Addr
      var updateRestBody = "{ \"name\": \"" + serviceName + "\", \"tenantTemplateReference\": { \"link\": \"https://localhost/mgmt/cm/cloud/tenant/templates/iapp/" + templateName + "\"}, \"tenantReference\": { \"link\": \"https://localhost/mgmt/cm/cloud/tenants/" + tenantName + "\"},\"vars\": [";

      // reminder: var varsList = newState.vars -> it contains all the vars that were defined in our app definition
      for(var j=0; j < varsList.length; j++) {
        composeBody(varsList[j]);
      }
      function composeBody(message){
        updateRestBody += " { \"name\" : \"" + message.name + "\", \"value\" : \"" + message.value + "\"},";
      }

      //we add the VS IP to the variable to create the service properly
      updateRestBody += "{\"name\": \"pool__addr\",\"value\": \"" + VS_IP + "\"}], \"tables\": ";
      updateRestBody += JSON.stringify(tablesList,' ','\t');

      //add the connector reference
      updateRestBody += ",\"properties\": [{\"id\": \"cloudConnectorReference\",\"isRequired\": false, \"value\": \"https://localhost/mgmt/cm/cloud/connectors/local/" + connectorReference + "\"}]";
      updateRestBody += ",\"selfLink\": \"https://localhost/mgmt/cm/cloud/tenants/" + tenantName + "/services/iapp/" + serviceName + "\"}";
      if (DEBUG === true) {
        logger.info ("DEBUG: " + WorkerName + " update service BODY is: " + JSON.stringify(updateRestBody,' ','\t'));
      }
      //We generate the PUT API call

      var uri = bThis.restHelper.buildUri({
        protocol: bThis.wellKnownPorts.DEFAULT_HTTPS_SCHEME,
        port: "443",
        hostname: IWF_IP,
        path: "/mgmt/cm/cloud/tenants/" + tenantName + "/services/iapp/" + serviceName
      });

      var updateService = bThis.restOperationFactory.createRestOperationInstance()
        .setMethod("Put")
        .setUri(uri)
        .setBody(updateRestBody)
        .setIdentifiedDeviceRequest(true);

      bThis.eventChannel.emit(
        bThis.eventChannel.e.sendRestOperation,
        updateService,
        function(respPostRequest) {
          if (DEBUG === true) {
            logger.info ("DEBUG: " + WorkerName + " - function RestPutRequest, Service updated successfully");
          }
        }, function(err) {
          logger.info("DEBUG: " + WorkerName + " [Test Call Rest respPutServiceDeployment Error:] %j", err);
        }
      );


    }, function(err) {
        logger.info("DEBUG: " + WorkerName + " [Test Call Rest respGetRequest Error:] %j", err);
      }
  );

  this.completeRestOperation(restOperation);
};


ipam_extension.prototype.onPatch = function(restOperation) {
        var newState = restOperation.getBody();

        this.logger.info(WorkerName + " - onPatch()");
        this.completeRestOperation(restOperation);
};

ipam_extension.prototype.onDelete = function (restOperation) {
  logger.info(WorkerName + " - onDelete()");
  var newState = restOperation.getBody();
  var serviceName = newState.name;
  var aThis = this;

	//we retrieve the VS IP to let the IPAM solution it is not needed anymore
	var uri = aThis.restHelper.buildUri({
    protocol: aThis.wellKnownPorts.DEFAULT_HTTPS_SCHEME,
    port: "443",
    hostname: IWF_IP,
    path: "/mgmt/cm/cloud/tenants/" + tenantName + "/services/iapp/" + serviceName
  });

  var updateService = aThis.restOperationFactory.createRestOperationInstance()
    .setMethod("Get")
    .setUri(uri)
    .setIdentifiedDeviceRequest(true);

  aThis.eventChannel.emit(
    aThis.eventChannel.e.sendRestOperation,
    updateService,
    function(respGetRequest) {
			//we retrieve the body of the response
			var respBody = respGetRequest.getBody();
			var appVarsList = respBody.vars;
			var VS_IP;
			var bThis = aThis;

			//we parse vars until we find Pool_Addr since it contains the VS IP
			for (var i=0; i < appVarsList.length; i++) {
				if (appVarsList[i].name == "pool__addr") {
					VS_IP = appVarsList[i].value;
					if (DEBUG === true) {
                                		logger.info ("DEBUG: " + WorkerName + " - onDelete : VS_IP is: " + VS_IP);
                        		}
				}
			}

			//now we delete the service from iWF and then from the IPAM solution

			var deleteUri = bThis.restHelper.buildUri({
        protocol: bThis.wellKnownPorts.DEFAULT_HTTPS_SCHEME,
        port: "443",
        hostname: IWF_IP,
        path: "/mgmt/cm/cloud/tenants/" + tenantName + "/services/iapp/" + serviceName
      });

      var deleteService = bThis.restOperationFactory.createRestOperationInstance()
        .setMethod("Delete")
        .setUri(deleteUri)
        .setIdentifiedDeviceRequest(true);

      bThis.eventChannel.emit(
        bThis.eventChannel.e.sendRestOperation,
        deleteService,
        function(respDeleteRequest) {
			    if (DEBUG === true) {
            logger.info ("DEBUG: " + WorkerName + " - onDelete : Service Deleted, release IP from IPAM: " + VS_IP);
          }

          var options = {
            "method": "DELETE",
            "hostname": IPAM_IP,
            "port": IPAM_Port,
            "path": "/" + VS_IP,
            "headers": {
              "cache-control": "no-cache"
            }
          };

          var req = http.request(options, function (res) {
            var chunks = [];

            res.on("data", function (chunk) {
              chunks.push(chunk);
            });

            res.on("end", function () {
							var body = Buffer.concat(chunks);
						});
					});
					req.end();
				}, function(err) {
          logger.info("DEBUG: " + WorkerName + " [Test Call Rest respDeleteRequest Error:] %j", err);
        }
      );

    }, function(err) {
        logger.info("DEBUG: " + WorkerName + " [Test Call Rest respGetRequest Error:] %j", err);
      }
	);

	this.completeRestOperation(restOperation);
};

/**
* handle /example HTTP request
*/
ipam_extension.prototype.getExampleState = function () {
  return {
        "name": "my-app-name",
        "template" : "f5-http-lb",
        "vars": [
                    {
                        "name": "pool__port",
                        "value": "80"
                    }
        ],
        "tables": [{
            "name": "pool__Members",
            "columns": [
                "IPAddress",
                "State"
            ],
            "rows": [
                [
                    "10.1.10.10",
                    "enabled"
                ], [
                    "10.1.10.11",
                    "enabled"
                ]
            ]
        }]
  };
};

module.exports = ipam_extension;
