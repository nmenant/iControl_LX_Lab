/**
 * An iControlLX extension that handles VS IP Address through an IPAM solution
 */
var logger = require('f5-logger').getInstance();
var DEBUG = true;
var WorkerName = "ipam-extension";
var IPAM_IP = "172.16.2.30";
var IPAM_Port = "79";
var http = require('http');

function ipam_extension() {
}

//we define our worker path
ipam_extension.prototype.WORKER_URI_PATH = "/shared/ipam-extension";

//triggered when our worker is loaded
ipam_extension.prototype.onStart = function (success) {
        logger.info(WorkerName + " onStart()");
        success();
};

ipam_extension.prototype.onPost = function (restOperation) {
        logger.info(WorkerName + " onPost()");

	var newState = restOperation.getBody();
	var tenantTemplateReference = newState.tenantTemplateReference;

        if ( tenantTemplateReference ) {
		//var cloudConnectorReferencePath = newState.properties[0].value;
		var aThis = this;
		var serviceName = newState.name;
        	var selfLink = newState.selfLink;
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
      				if (DEBUG === true) {
        				logger.info("DEBUG: " + WorkerName + "IPAM REST Call - onPost - the retrieved Payload is: " + VS_IP_Payload);
      				}
				var VS_IP_Obj = JSON.parse(VS_IP_Payload);
				var VS_IP = VS_IP_Obj.IP;
				if (DEBUG === true) {
                                        logger.info("DEBUG: " + WorkerName + "IPAM REST Call - onPost - the retrieved IP is: " + VS_IP);
                                }
			// Now that we have the IP we need to work on updating the deployed iApps. To do this we will create a PUT request and add the IP address of the VIP 
			// We need to remove the beginning of the selfLink to have the uri used in the put request
			var uriUpdateService = selfLink.replace('https://localhost/mgmt/', '');

			// we create the app definition but we add the IPAM IP for Pool__Addr	
			var updateRestBody = "{ \"name\": \"" + serviceName + "\", \"tenantTemplateReference\": { \"link\": \"" + tenantTemplateReference.link + "\"}, \"vars\": ["; 
				
			// reminder: var varsList = newState.vars -> it contains all the vars that were defined in our app definition
			for(var i=0; i < varsList.length; i++) {
				composeBody(varsList[i]);
			}

			function composeBody(message){
				updateRestBody += " { \"name\" : \"" + message.name + "\", \"value\" : \"" + message.value + "\"},";
  			}

			updateRestBody += "{\"name\": \"pool__addr\",\"value\": \"" + VS_IP + "\"}], \"tables\": ";
			updateRestBody += JSON.stringify(tablesList,' ','\t');

			updateRestBody += ",\"selfLink\": \"" + selfLink + "\"}";
				
			if (DEBUG === true) {	
				logger.info ("DEBUG: " + WorkerName + " update service BODY is: " + JSON.stringify(updateRestBody,' ','\t'));	
			}
			//We generate the PUT API call
				
			// We check whether our services is done being deployed 
			// If not, our put request will be rejected with a similar error message: "restOperationId\":68758,\"erroStack\":[\"java.lang.IllegalArgumentException: Retry PUT later: cannot modify my-app-test-rest-worker right now because sttus PROCESSING indicates the last modification is still being handled.\"
			// So we check the value in iWF of services/iapp/<service name>/stats of health.summary.placement. If the value is not 1, then we try again

			function check_iapp_placement_status(updateService_, maxRetries, retryDelay, callback) {
				var counter = 0;

				logger.info("DEBUG: " + WorkerName + " check iapp placement status function");
				function check_status() {
					var bThis = aThis;

					var CheckStatus = bThis.restOperationFactory.createRestOperationInstance()
	                                        .setMethod("Get")
	                                        .setUri(bThis.restHelper.makeRestjavadUri(updateService_ + "/stats"))
                               		        .setIdentifiedDeviceRequest(true);

					logger.info("DEBUG: " + WorkerName + " check status function");
			
					 bThis.eventChannel.emit(
						bThis.eventChannel.e.sendRestOperation,
						CheckStatus,
						function(respGetStatsRequest) {
							var cThis = bThis;
							var respGetStatsRequestBody = respGetStatsRequest.getBody();
							var health;
							
							counter++;
							logger.info("DEBUG: " + WorkerName + " body is: " + JSON.stringify(respGetStatsRequestBody.entries,' ','\t'));
								
							if (respGetStatsRequestBody.entries["health.summary.placement"]) {
								logger.info ("DEBUG: " + WorkerName + " value is: " + respGetStatsRequestBody.entries["health.summary.placement"].value);
								if (respGetStatsRequestBody.entries["health.summary.placement"].value == 1) {
									if (DEBUG === true) {
                                						logger.info ("DEBUG: " + WorkerName + " - App placed, pushing an update");
                        							logger.info ("DEBUG: " + WorkerName + " - URI to update the service: " + uriUpdateService);
										logger.info ("DEBUG: " + WorkerName + " - Body to push: " + updateRestBody);
									}
																		
									var updateService = cThis.restOperationFactory.createRestOperationInstance()
					                                        .setMethod("Put")
                                       						.setUri(cThis.restHelper.makeRestjavadUri(uriUpdateService))
                                       						.setBody(updateRestBody)
                                       						.setIdentifiedDeviceRequest(true);
                                						
									cThis.eventChannel.emit(
                                        					cThis.eventChannel.e.sendRestOperation,
                                        					updateService,
                                        					function(respPutRequest) {
											if (DEBUG === true) {
                                                                                		logger.info ("DEBUG: " + WorkerName + " - function RestPutRequest");
                                                                        		}
										}, function(err) {
											 logger.info("DEBUG: " + WorkerName + " [Test Call Rest respUpdateServiceDeployment Error:] %j", err);
										}
									);
								} else {
									if (counter >= maxRetries) {
                                                                       		callback("DEBUG: " + WorkerName + " Too many retries to get the service placed");
                                                               		} else {
                                                                	       	logger.info("DEBUG: " + WorkerName + " retry is in " + retryDelay);
                                                                       		setTimeout(check_status, retryDelay);
                                                               		}
								}
							}
							callback(null);
						}, function(err) {
							logger.info("DEBUG: " + WorkerName + " err: " + err);
						}
					);
				}
				check_status();
			}	
			check_iapp_placement_status(uriUpdateService, 10, 10000, function (err) {
				if (err) {
					logger.info("DEBUG: " + WorkerName + " [Test Call Rest respUpdateServiceDeployment Error:] %j", err);
				} 
			});
  		});
		});
		req.end();
	}		
	this.completeRestOperation(restOperation);
};

ipam_extension.prototype.onPut = function(restOperation) {
        var newState = restOperation.getBody();

        this.logger.info(WorkerName + " onPut()");
        this.completeRestOperation(restOperation);
};

ipam_extension.prototype.onPatch = function(restOperation) {
        var newState = restOperation.getBody();

        this.logger.info(WorkerName + " onPatch()");
        this.completeRestOperation(restOperation);
};

ipam_extension.prototype.onDelete = function (restOperation) {
        logger.info(WorkerName + " onDelete()");

        this.completeRestOperation(restOperation);
};

module.exports = ipam_extension;
