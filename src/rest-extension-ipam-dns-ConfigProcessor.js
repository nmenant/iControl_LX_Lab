var Q = require("/usr/share/rest/node/node_modules/q/q.js");
var logger = require('f5-logger').getInstance();
var DEBUG = true; 
var WorkerName = "ipam-dns-placement";
var GTM_IP = "192.168.143.26";

function ipam_dns_placement() {
}

//we define our worker path
ipam_dns_placement.prototype.WORKER_URI_PATH = "/shared/ipam-dns-placement-handler";

//triggered when our worker is loaded into iWF
ipam_dns_placement.prototype.onStart = function (success) {
    	this.isPublic = true;

    	logger.info(WorkerName + " onStart()");
    	success();
};


ipam_dns_placement.prototype.onPost = function(restOperation) {
	var newState = restOperation.getBody();
	
	//We need to extract from the original POST request, the required attributes to do a PUT later to change the VIP IP. The needed attribute are: 
        // - name
        // - tenantTemplateReference
        // - selfLink
	// - cloudConnectorReference

	var tenantTemplateReference = newState.tenantTemplateReference;

	if (DEBUG === true) {
                logger.info("DEBUG: onPost " + WorkerName + this.WORKER_URI_PATH);
                logger.info("DEBUG: onPost Body: " + WorkerName + JSON.stringify(newState,' ','\t'));
	}

	//if tenantTemplateReference exist, We can start the process of:
	// - Retrieving the name of the BIG-IP on which is deployed the app. This is needed to do properly the GTM/DNS service definition (we consider that the BIG-IP that receive the service has been define on GTM with its fqdn
	// - Retrieving the VIP IP through an IPAM solution
	// - Update our service with the IP we retrieved from the IPAM
	// - Push several REST calls on BIG-IP DNS to do the DNS setup for this service
	if ( tenantTemplateReference ) {
		var bigipHostname; 
		var aThis = this; 
		var cloudConnectorReferencePath = newState.properties[0].value;
		var serviceName = newState.name;
        var selfLink = newState.selfLink;
        var varsList = newState.vars;
        var tablesList = newState.tables;
		
		//  The first thing we launch is the retrieval of the BIG-IP that received the app services. To do so, we need to identify the cloud connector that was leveraged for this deployment and then check the BIG-IP in this connector. in our onPost function, we receive this information and it's stored in cloudConnectorReferencePath. 
		//  we remove https://localhost/mgmt from the cloud connector reference path	
		cloudConnectorReferencePath = cloudConnectorReferencePath.replace('https://localhost/mgmt/', '');

		// we define our REST request to get the list of devices in a connector
        var getCloudConnectorReference = aThis.restOperationFactory.createRestOperationInstance()
    	    .setMethod("Get")
			.setUri(aThis.restHelper.makeRestjavadUri(cloudConnectorReferencePath))
			.setIdentifiedDeviceRequest(true);


		// we trigger our REST request and process it in an async way
 		aThis.eventChannel.emit(
			aThis.eventChannel.e.sendRestOperation,
			getCloudConnectorReference,
			function(respGetConnectorReference) {
				var deviceLinkBody = respGetConnectorReference.getBody();
				var deviceLink = deviceLinkBody.deviceReferences[0].link;
				var bThis = aThis;			
	
				// deviceLink contain the information about the first BIG-IP defined in our connector. We will use this one for our demo to push the GTM config on it. ideally we would need to do this for all the BIG-IP in the connector -- TODO -- 
				if ( DEBUG === true ) {
					logger.info("REST success on GetCloudConnectorReference ");
				}
				
				deviceLinkPath = deviceLink.replace('https://localhost/mgmt/', '');
				// we use the deviceLink to retrieve the device information and its hostname.
				
				// we define our REST request to retrieve the information related to this device
				var getDeviceInformation = bThis.restOperationFactory.createRestOperationInstance()
					.setMethod("Get")
					.setUri(bThis.restHelper.makeRestjavadUri(deviceLinkPath))
					.setIdentifiedDeviceRequest(true);
				
				// we trigger our REST request
				bThis.eventChannel.emit(
					bThis.eventChannel.e.sendRestOperation,
					getDeviceInformation,
					function(respGetDeviceInformation) {
						var DeviceInformation = respGetDeviceInformation.getBody();
						
						// we get our BIG-IP hostname and we store it 
						bigipHostname = DeviceInformation.hostname;
						if ( DEBUG === true ) {
							logger.info("REST success on GetDeviceInformation ");
							logger.info ("Device BIG-IP Hostname: " + bigipHostname);
						}
					}, function(err) {
						logger.info("[Test Call Rest GetDeviceInformation] %j", err.message);
					}
				);
			}, function(err) {
   				logger.info("[Test Call Rest GetCloudConnectorReference] %j", err.message);
			}
		);


		//Here we will do the following things: 
		// 1- We retrieve our VS IP via IPAM
		// 2- we push an update(PUT) to your service to use this VS IP
		// 3- we create the GTM config accordingly 

		//uri to pull our ipam solution. I use a basic iRule on a bigip to simulate the transaction
		var uri = this.restHelper.buildUri({
			protocol: this.wellKnownPorts.DEFAULT_HTTP_SCHEME,
			port: "80",
			hostname: "172.16.1.30",
			path: "/ipam/tenant/Nicolas/"
		});

		
		//creation of our restOperation to GET the Ipam IP
		var GetIpamIP = this.restOperationFactory.createRestOperationInstance()
			.setMethod("Get")
			.setUri(uri);
	

		var oThis = this;
		var pThis = this;
		var tThis = this;
		//execute our REST CALL against our VIP with an iRule to get an IP to use for our application
		this.eventChannel.emit(
			this.eventChannel.e.sendRestOperation,
			GetIpamIP,
			function(resp) {
				var IpamIP = resp.getBody().IP;
				var servicePort; 
				
				if (DEBUG === true) {
					logger.info("Returned IP from IPAM: " +  IpamIP);
					logger.info(" VARS : " + JSON.stringify(varsList,' ','\t'));
					logger.info("VARS LENGTH: " + varsList.length);
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
					// Since we parse each vars in our app deployment, we check whether it's the VS port information. We need this information for the DNS VS definition
					// We do the same with the wideip field that will be needed to create the DNS wideip
					if ( message.name == "pool__port") {
						servicePort = message.value;
					} else if ( message.name == "wideip__name") {
						wideipName = message.value;
					}
  				}

				updateRestBody += "{\"name\": \"pool__addr\",\"value\": \"" + IpamIP + "\"}], \"tables\": ";
				updateRestBody += JSON.stringify(tablesList,' ','\t');

				updateRestBody += ",\"selfLink\": \"" + selfLink + "\"}";
				
				if (DEBUG === true) {	
					logger.info ("update service BODY is: " + JSON.stringify(updateRestBody,' ','\t'));	
				}

				//We generate the PUT API call
				
				// We check whether our services is done being deployed 
				// If not, our put request will be rejected with a similar error message: "restOperationId\":68758,\"erroStack\":[\"java.lang.IllegalArgumentException: Retry PUT later: cannot modify my-app-test-rest-worker right now because sttus PROCESSING indicates the last modification is still being handled.\"
				// So we check the value in iWF of services/iapp/<service name>/stats of health.summary.placement. If the value is not 1, then we try again

				function check_iapp_placement_status(updateService_, maxRetries, retryDelay, callback) {
					var counter = 0;

					logger.info("check iapp placement status function");
					function check_status() {
						var self = tThis;

						var updateService = self.restOperationFactory.createRestOperationInstance()
		                                        .setMethod("Get")
		                                        .setUri(self.restHelper.makeRestjavadUri(updateService_ + "/stats"))
                                		        .setIdentifiedDeviceRequest(true);

						logger.info("check status function");
						 self.eventChannel.emit(
							self.eventChannel.e.sendRestOperation,
							updateService,
							function(respGetStatsRequest) {
								var respGetStatsRequestBody = respGetStatsRequest.getBody();
								var health;
								
								counter++;
								logger.info("body is: " + JSON.stringify(respGetStatsRequestBody.entries,' ','\t'));
								
								if (respGetStatsRequestBody.entries["health.summary.placement"]) {
									logger.info ("value is: " + respGetStatsRequestBody.entries["health.summary.placement"].value);
									if (respGetStatsRequestBody.entries["health.summary.placement"].value == 1) {
										 var updateService = tThis.restOperationFactory.createRestOperationInstance()
						                                        .setMethod("Put")
                                        						.setUri(tThis.restHelper.makeRestjavadUri(uriUpdateService))
                                        						.setBody(updateRestBody)
                                        						.setIdentifiedDeviceRequest(true);

                                						tThis.eventChannel.emit(
                                        						oThis.eventChannel.e.sendRestOperation,
                                        						updateService,
                                        						function(respPutRequest) {
											}, function(err) {
												 logger.info("[Test Call Rest respUpdateServiceDeployment Error:] %j", err);
											}
										);
									}
								} else {
									if (counter >= maxRetries) {
                                                                        	callback("Too many retries to get the service placed");
                                                                	} else {
                                                                        	logger.info("retry is in " + retryDelay);
                                                                        	setTimeout(check_status, retryDelay);
                                                                	}

								}
								callback(null);
							}, function(err) {
								logger.info("err: " + err);
							}
						);
					}
					check_status();
				}	
				check_iapp_placement_status(uriUpdateService, 10, 10000, function (err) {
					if (err) {
						logger.info("[Test Call Rest respUpdateServiceDeployment Error:] %j", err);
					} 
				});
				
				if (DEBUG === true) { 
					logger.info("Work on updating the deployed service");
				}
		

				//Before doing the DNS config we need to make sure that we already retrieved: the BigIP HOSTNAME
				// we need to wait until we have those information to be successful
				function do_dns_config(maxRetries, retryDelay, callback) {
					var counter = 0;
					
					function check_variables() {
						counter++;
						if (bigipHostname) {
							var uri = pThis.restHelper.buildUri({
                                        			protocol: pThis.wellKnownPorts.DEFAULT_HTTPS_SCHEME,
                                        			port: "443",
                                        			hostname: GTM_IP,
                                        			path: "/mgmt/tm/gtm/server/" + bigipHostname + "/virtual-servers"
                                			});
				
							var dnsCreateVSBody = "{ \"name\": \"" + serviceName + "\", \"destination\": \"" + IpamIP + ":" + servicePort + "\", \"monitor\": \"/Common/bigip\"}";

			                                if (DEBUG === true) {
                        			                logger.info("Body to create DNS VS:  CALL: " + JSON.stringify( dnsCreateVSBody,' ','\t'));
                                			}

                                			var createDNSVS = pThis.restOperationFactory.createRestOperationInstance()
                                        			.setMethod("Post")
                                        			.setUri(uri)
                                        			.setBody(dnsCreateVSBody)
                                        			.setIdentifiedDeviceRequest(true);


							var qThis = pThis;
		        
				                        pThis.eventChannel.emit(
                		                        	pThis.eventChannel.e.sendRestOperation,
                                		        	createDNSVS,
                                		        	function(respCreateDNSVS) {
                                                			//logger.info("REST RESPONSE TO DNS VS definition: " + JSON.stringify(respCreateDNSVS,' ','\t'));
                                                			//The creation of the DNS Virtual service is successful. We can move forward and create the pool.
                                               				if (DEBUG === true) {
                                                        			logger.info("Work on provisioning DNS VS");
                                                			}
                                               				var uri = qThis.restHelper.buildUri({
                                                        			protocol: qThis.wellKnownPorts.DEFAULT_HTTPS_SCHEME,
                                                        			port: "443",
                                                        			hostname: GTM_IP,
										path: "/mgmt/tm/gtm/pool/a"
		                                                	});

                		                                	var dnsCreatePoolBody = "{ \"name\": \"pool-" + serviceName + "\" , \"loadBalancingMode\": \"round-robin\", \"members\": [ {\"name\": \"" + bigipHostname + ":" + serviceName + "\" } ] }";

                                		                	if (DEBUG === true) {
                                        		                	logger.info("Body for DNS create Pool CALL: " + JSON.stringify( dnsCreatePoolBody,' ','\t'));
                                                			}
								
									var createDnsPool = qThis.restOperationFactory.createRestOperationInstance()
		                                                	        .setMethod("Post")
                		                                	        .setUri(uri)
                        		                        	        .setBody(dnsCreatePoolBody)
                                		                	        .setIdentifiedDeviceRequest(true);


                                        		        	rThis = qThis;
                                                			qThis.eventChannel.emit(
                                               				        qThis.eventChannel.e.sendRestOperation,
                                                        			createDnsPool,
                                                        			function(respCreateDnsPool) {
                                                                			logger.info("REST success on DNS Pool definition: ");
                                                                			//The creation of the DNS pool is successful. We can move forward and create the wideip.
                                                                			logger.info("Work on provisioning DNS wideip");
	
        	                                                        		var uri = rThis.restHelper.buildUri({
                	                                                        		protocol: rThis.wellKnownPorts.DEFAULT_HTTPS_SCHEME,
                        	                                                		port: "443",
                                	                                        		hostname: GTM_IP,
                                        	                                		path: "/mgmt/tm/gtm/wideip/a"
                                                	                		});
	
											var dnsCreateWideipBody = "{ \"name\":\"" + wideipName + "\",\"poolLbMode\": \"global-availability\", \"pools\": [{ \"name\": \"pool-" + serviceName + "\"}]  }";

                	                                                		if (DEBUG === true) {
                        	                                                		logger.info("Body for DNS create Wideip CALL: " + JSON.stringify( dnsCreateWideipBody,' ','\t'));
                                	                                		}
                                        	                        
											var createDnsWideip = qThis.restOperationFactory.createRestOperationInstance()
                                                        	                		.setMethod("Post")
                                                                	        		.setUri(uri)
                                                                        			.setBody(dnsCreateWideipBody)
                                                                        			.setIdentifiedDeviceRequest(true);

                          	        	                              		rThis.eventChannel.emit(
                                	                                        		rThis.eventChannel.e.sendRestOperation,
                                        	                                		createDnsWideip,
                                        	                                		function(respCreateDnsWideip) {
                                        	                                		        logger.info("REST success on DNS Wideip definition: ");
                                        	                                		}, function(err) {
                                        	                                		        logger.info("[Test Call Rest restCreateDnsWideip] %j", err.message);
                                        	                                		}
                                        	                        		);
                                                	        		}, function(err) {
                                                        	        		logger.info("[Test Call Rest restCreateDnsPool] %j", err.message);
                                                        			}
                                                			);
                                        			}, function(err) {
                                                			logger.info("[Test Call Rest respCreateDNSVS Error:] %j", err.message);
                                        			}
                                			);

						} else {
							if (counter >= maxRetries) {
								callback("Too many retries to get the BigIP Hostname");
							} else {
								logger.info("we haven t already retrieved the bigip Hostname... waiting");
								setTimeout(check_variables, retryDelay);
							}
						}
						callback(null);
					}
					check_variables();
				}
				
				do_dns_config (20, 5000, function (err) {
					if (err) {
                                                logger.info("[Test Call Rest respUpdateServiceDeployment Error:] %j", err);
                                        }
                                });	
			}, function(err) {
				logger.info("[Test Call Rest IPAM FAIL: ] %j", err.message);
			}
		);
	} else {
		logger.info("not the good POST to process....skipping");	
	}
	logger.info("DEBUG: onPost END");

	this.completeRestOperation(restOperation);
};

ipam_dns_placement.prototype.onPut = function(restOperation) {
    	var newState = restOperation.getBody();    

    	this.logger.info(WorkerName + " onPut()");
    	if (DEBUG === true) {
      		this.logger.info("DEBUG: PUT " + WorkerName + this.WORKER_URI_PATH);
 //    		this.logger.info("DEBUG: onPut: " + WorkerName + JSON.stringify(newState,' ','\t')); 
    	}
	this.completeRestOperation(restOperation);
};

ipam_dns_placement.prototype.onPatch = function(restOperation) {
	var newState = restOperation.getBody();

	logger.info(WorkerName + " onPatch()");
	if (DEBUG === true) {
      		this.logger.info("DEBUG: PATCH " + WorkerName + this.WORKER_URI_PATH);
//      		this.logger.info("DEBUG: onPatch: " + WorkerName + JSON.stringify(newState,' ','\t')); 
    	}

	if (newState.debug === "true") {
      		DEBUG = true;
      		this.logger.info("onPatch: DEBUG ENABLED\n");
 //   		this.logger.info("DEBUG: onPatch: " + WorkerName + JSON.stringify(newState,' ','\t'));
	}
    	else if (newState.debug === "false") {
      		DEBUG = false;
      		this.logger.info("onPatch: DEBUG DISABLED\n");
    	}
	this.completeRestOperation(restOperation);
};


ipam_dns_placement.prototype.onDelete = function(restOperation) {
	var newState = restOperation.getBody();
	var appName = newState.name;
	var appVarsList = newState.vars;
	var wideipName;

    	if (DEBUG === true) {
      		this.logger.info("DEBUG: DELETE " + WorkerName + this.WORKER_URI_PATH);
 		this.logger.info("DEBUG: onDelete: " + WorkerName + JSON.stringify(newState,' ','\t'));
    	}

	//We need to parse the vars associated to the app to retrieve our variable called wideip__name. Needed to clean up configuration from DNS	
	for (var i=0; i < appVarsList.length; i++) {
        	if (appVarsList[i].name == "wideip__name" ) {
			wideipName = appVarsList[i].value;
		}
	}
	if (DEBUG === true) {
                this.logger.info("DEBUG: onDelete: application name is: " + appName + " and wide ip name is "+ wideipName);
        }

	//Now that we have the only available information to us related to an onDelete event, we need to do the following on our DNS solution:
	//1- Delete the wideip
	//2- Because we cannot know on which BIG-IP this was deployed, we need to do the following to delete the VS associated to our BIG-IP in the DNS Server config. The way to do this is the following: before deleting the pool, we will need to check the DNS pool members definition since it has all the needed information: BIG-IP hostname and the app name. This is the combination needed to remove a VS from a server in the DNS module
	//3- Delete the pool and the virtual services definition in our DNS servers

	//Delete the WideIP
	var aThis = this; 
	var uri = aThis.restHelper.buildUri({
        	protocol: aThis.wellKnownPorts.DEFAULT_HTTPS_SCHEME,
                port: "443",
                hostname: GTM_IP,
                path: "/mgmt/tm/gtm/wideip/a/" + wideipName
        });

        var deleteDnsWideip = aThis.restOperationFactory.createRestOperationInstance()
        	.setMethod("Delete")
                .setUri(uri)
		.setIdentifiedDeviceRequest(true);

    	aThis.eventChannel.emit(
   		aThis.eventChannel.e.sendRestOperation,
       		deleteDnsWideip,
        	function(respDeleteDnsWideip) {
       			if (DEBUG === true) {
				logger.info("REST success on deleting the DNS Wideip");
			}
			
			//next step is to retrieve our DNS pool members for this service and then delete the pool and then the virtual server defined on the DNS servers
			
			//get the DNS pool members
			var bThis = aThis; 

			// the DNS pool is built with a name following this logic "pool-<app_name>"
			uri = bThis.restHelper.buildUri({
                		protocol: bThis.wellKnownPorts.DEFAULT_HTTPS_SCHEME,
                		port: "443",
                		hostname: GTM_IP,
                		path: "/mgmt/tm/gtm/pool/a/pool-" + appName + "/members"
        		});

			var listPoolMembers = bThis.restOperationFactory.createRestOperationInstance()
                		.setMethod("Get")
                		.setUri(uri)
				.setIdentifiedDeviceRequest(true);
  
			bThis.eventChannel.emit(
		                bThis.eventChannel.e.sendRestOperation,
                		listPoolMembers,
                		function(respListPoolMembers) {
                        		var listPoolMembers = respListPoolMembers.getBody().items;
                                        var listVirtualServers = [];
					var cThis = bThis; 
										
					if (DEBUG === true) {
                                		logger.info("REST success on getting the DNS pool members");
						logger.info(" ITEMS RETURNED: " + JSON.stringify(listPoolMembers,' ','\t'));
                        		}

					//Here we extract from our REST response, the list of host:vs provided. we parse the items section of the response to extract the "name" field. the "name" field provide what we need to delete the DNS virtual server in the following format <DNS Server>:<app name>. Example: bigip-nico.my-lab:my-app-test-rest8. We will create a new array containing all the virtual server setup in this pool to delete them later. 
					for (i = 0; i < listPoolMembers.length; i++) {
						listVirtualServers[i] = listPoolMembers[i].name;
						if (DEBUG === true) {
                           		                logger.info("DNS VS to be deleted: " + listVirtualServers[i]);
                                                }
					}
					
					//now that we got our information, we can delete the pool
				     	uri = cThis.restHelper.buildUri({
	                                	protocol: cThis.wellKnownPorts.DEFAULT_HTTPS_SCHEME,
	                                	port: "443",
	                                	hostname: GTM_IP,
	                                	path: "/mgmt/tm/gtm/pool/a/pool-" + appName
	                        	});
	
        	                	var deleteDNSPool = cThis.restOperationFactory.createRestOperationInstance()
        	                	        .setMethod("Delete")
        	                	        .setUri(uri)
						.setIdentifiedDeviceRequest(true);

       		              		cThis.eventChannel.emit(
                                		cThis.eventChannel.e.sendRestOperation,
                                		deleteDNSPool,
                                		function(respDeleteDNSPool) {
							var dThis = cThis;
							var myVSInfo;						
							var myVSArray = [];

							if (DEBUG === true) {
                                                		logger.info("REST success on deleting the DNS pool, number of DNS VS to delete: " + listVirtualServers.length);
                                        		}
							//Since the DNS pool has been successfully deleted, we can delete the DNS VS that were used in it
							for (j = 0; j < listVirtualServers.length; j++) {
								//We retrieve our VS information and we split the string through the ":" delimiter. This way index 0 contains the DNS Server name and index 1 will contain the app name defined as a VS on it. 
								myVSInfo = listVirtualServers[j];
								myVSArray = myVSInfo.split(":");
							
								if (DEBUG === true) {
                                                                	logger.info("DNS SERVER to modify: "+ myVSArray[0] + "DNS VS to remove : " + myVSArray[1]);
								}	
								uri = dThis.restHelper.buildUri({
                                                			protocol: dThis.wellKnownPorts.DEFAULT_HTTPS_SCHEME,
                                                			port: "443",
                                                			hostname: GTM_IP,
                                                			path: "/mgmt/tm/gtm/server/"+ myVSArray[0]+ "/virtual-servers/" + myVSArray[1]
                                        			});     
                
                                        			var deleteDNSVS = dThis.restOperationFactory.createRestOperationInstance()
                                                			.setMethod("Delete")
                                                			.setUri(uri)
									.setIdentifiedDeviceRequest(true);

								// Receive a SEVERE error message if i call function within a loop ... TO BE CHECKED	
								dThis.eventChannel.emit(
                                                			dThis.eventChannel.e.sendRestOperation,
                                                			deleteDNSVS
								);
							}
						}, function(err) {
							logger.info("[Test Call Rest respDeleteDNSPool] %j", err.message);
						}
					);	

				},  function(err) {
              				logger.info("[Test Call Rest respListPoolMembers] %j", err.message);
                		}
			);

		}, function(err) {
         		logger.info("[Test Call Rest restDeleteDnsWideip] %j", err.message);
          	}
       	);


	this.completeRestOperation(restOperation);
};

module.exports = ipam_dns_placement;
