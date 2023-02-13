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
		let url = 'https://api.solarmanpv.com/device/v1.0/currentData?appId=' + this.config.appId + '&language=en&=';
		let urlH = 'https://api.solarmanpv.com/device/v1.0/historical?appId=' + this.config.appId + '&language=en&=';
		
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
	
		async function callback(error, response, body) {
			if (!error && response.statusCode == 200) {
				//console.log('body:', body); // Print the body
				var result = JSON.parse(body);
				
				// check if data is available, then get historical data
				if (result !== null && result !== undefined ) {
					// change request url
					options['url'] = urlH; 
					
					// sometime length of list changes so that a direct assignment for month and year 
					// via a position number is not successful: 
					// therefore the values of interest are searched inside the whole list
					for (let i = 0; i < result.dataList.length; i++){
						if (result.dataList[i].key == 'YEAR')
							var year = result.dataList[i].value;
						if (result.dataList[i].key == 'MONTH')
							var month = result.dataList[i].value;
					}
					 
					// input string for YEAR production
					var dataStringHis = JSON.parse(dataString);
					dataStringHis.timeType = "4";
					dataStringHis.startTime = "20" + year;
					dataStringHis.endTime = "20" + year;
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
						  console.log("MMM-Solarman: Could not load historical data.");
						}
					}
					request(options, callbackHY); 
					
					
					// input string for MONTH production
					//var dataStringHis = JSON.parse(dataString);
					dataStringHis.timeType = "3";
					// check month if one or two digits
					if (parseInt(month) < 10) {
						dataStringHis.startTime = "20" + year + '-0' + month;
						dataStringHis.endTime = "20" + year + '-0' + month;
					} else {
						dataStringHis.startTime = "20" + year + '-' + month;
						dataStringHis.endTime = "20" + year + '-' + month;
					}
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
						  console.log("MMM-Solarman: Could not load historical data.");
						}
					}
					request(options, callbackHM); 
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
			  console.log("MMM-Solarman: Could not load data.");
			}
		}

		request(options, callback); 
	}
});
