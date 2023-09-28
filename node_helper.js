/* Magic Mirror
 * Module: MMM-Solarman
 *
 * By utzl
 * MIT Licensed.
 */

const NodeHelper = require("node_helper");
var request = require("request");

module.exports = NodeHelper.create({
	start: function() {
		console.log("Starting node helper: " + this.name);
		//this.accessTok = null;
		var options = null;
	},

	 //socketNotificationReceived: async function(notification, payload) {
	socketNotificationReceived: function(notification, payload) {
		if (notification === 'GET_DATA') {
			this.config = payload;
			this.getData();
		}
	}, 
	
	getAccessToken: function () {
		// will be programmed later?
		
	},
	
	getData: function () {
		var self = this;
		
		// create an empty headers object
		var headers = {
			'Authorization': '',
			'Content-Type': 'application/json'
			};
		// add accessToken from config file to headers
		headers['Authorization'] = 'bearer ' + this.config.accessToken;
		
		// add deviceSn from config file
		var dataString = `{ "deviceSn": "${this.config.deviceSn}" }`;
		
		// define urls
		let url = 'https://globalapi.solarmanpv.com/device/v1.0/currentData?appId=' + this.config.appId + '&language=en&=';
		let urlH = 'https://globalapi.solarmanpv.com/device/v1.0/historical?appId=' + this.config.appId + '&language=en&=';
		
		var options = {
			url: url,
			method: 'POST',
			headers: headers,
			body: dataString
			};
		
		/* sleep: function(ms) {
			return new Promise((resolve) => {
				setTimeout(resolve, ms);
			});
		},  */
	
		// call for current data
		// direct after call get historical data based on date of results
		async function callback(error, response, body) {
			if (!error && response.statusCode == 200) {
				//console.log('body:', body); // Print the body
				var result = JSON.parse(body); // contains current data
				
				// check if data is available, then get historical data
				// result.success == true if access_token is valid
				if (result !== null && result !== undefined && result.success) {
					// change request url
					options['url'] = urlH; 
					
					// sometime solarman company changes their structure :-( 
					// therefore the values of interest are searched inside the whole list
					for (let i = 0; i < result.dataList.length; i++){
						if (result.dataList[i].key == 'SYSTIM1'){
							var systime = result.dataList[i].value; //e.g. "2023-09-28 19:03:27"
							var year = systime.slice(0, 4);
							var month = systime.slice(5, 7);
						}
					}
					 
					// input string for YEAR production
					var dataStringHis = JSON.parse(dataString);
					dataStringHis.timeType = "4";
					dataStringHis.startTime = year;
					dataStringHis.endTime = year;
					dataString = JSON.stringify(dataStringHis);
					//console.log("MMM-Solarman: dataString YEAR prod: ", dataString);
					// implement request string
					options['body'] = dataString;
					
					// get hist. data - YEAR production
					function callbackHY(error, response, body) {
						if (!error && response.statusCode == 200) {
							var resultHY = JSON.parse(body);
							// add data to result list
							var hisDataY = resultHY.paramDataList[0].dataList;
							result = {...result, hisDataY};
						} else {
						  console.log("MMM-Solarman: Could not load historical year data.");
						}
					}
					request(options, callbackHY); 
					
					
					// input string for MONTH production
					//var dataStringHis = JSON.parse(dataString);
					dataStringHis.timeType = "3";
					dataStringHis.startTime = year + '-' + month;
					dataStringHis.endTime = year + '-' + month;
					dataString = JSON.stringify(dataStringHis);
					// implement request string
					options['body'] = dataString;
					
					// get hist. data - MONTH production
					function callbackHM(error, response, body) {
						if (!error && response.statusCode == 200) {
							var resultHM = JSON.parse(body);
							// add data to result list
							var hisDataM = resultHM.paramDataList[0].dataList;
							result = {...result, hisDataM};
						} else {
						  console.log("MMM-Solarman: Could not load historical month data.");
						}
					}
					request(options, callbackHM); 
				} else {
				  console.log("MMM-Solarman: Could not load data. Message:", result.msg);
				}
				
				// wait 2 sec befor sending the data
				function sleep(ms) {
					return new Promise((resolve) => {
					setTimeout(resolve, ms);
				  });
				}
				await sleep(2000)
				self.sendSocketNotification("DATA", result);
				
			} else {
			  console.log("MMM-Solarman: Call not successful.");
			}
		}

		request(options, callback); 
	}
});
