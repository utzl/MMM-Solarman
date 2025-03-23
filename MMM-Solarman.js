/* Magic Mirror
 * Module: MMM-Solarman
 *
 * By utzl
 * MIT Licensed.
 */

Module.register("MMM-Solarman", {
	// Default module config.
	defaults: {
		accessToken: '',
		deviceSn: '',
		appId: '',
		showTempWhenOnline: true,
		updateInterval: 2 * 60 * 1000, // every minute
		animationSpeed: 2 * 1000, // 2 seconds
	},
	
	
	// Define required styles.
    getStyles: function() {
        return['MMM-Solarman.css'];
    },
    
	
	// Define required translations.
    getTranslations: function() {
        return {
            de: "translations/de.json",
            en: "translations/en.json",
        }
    },
	
	
	start: function() {
		this.getData();			// initial get data
		this.loaded = false;	// used to have animation speed only after screen start
		this.scheduleUpdate();	// initiate cyclic refresh of get data
	}, 


	scheduleUpdate: function (delay) {
    // initialize nextLoad variable with the value of this.config.updateInterval
		var nextLoad = this.config.updateInterval;
    // check if delay is provided and is a positive number
		if (typeof delay !== "undefined" && delay >= 0) {
		  // set nextLoad to delay if provided
		  nextLoad = delay;
		}
		var self = this;
		// use setInterval function to call getData function every 'nextLoad' milliseconds
		setInterval(function () {
		  self.getData();
		}, nextLoad);
	},

	
	// get data from node_helper
	getData: function () {
    this.sendSocketNotification("GET_DATA", this.config);
	},
	
	
	// receive data from node_helper
	socketNotificationReceived: function(notification, payload) {
	    var self = this;
		if (notification === "DATA") {
			let animationSpeed = self.config.animationSpeed;
            // set animation speed to zero after initial screen load
			if (this.loaded) {
                animationSpeed = 0;
            }
			this.fetchedData = payload;
			this.loaded = true;
           
		    // Update dom with given animation speed
            this.updateDom(animationSpeed);
	    }
	},
	

	// Define header -> user input in config.js
	getHeader: function() { 
		// initialize the headerTitle variable with the value of this.data.header
		var headerTitle = this.data.header;
		// check if data is available and loaded
		if (this.loaded && !(this.fetchedData === null || this.fetchedData === undefined)) {
			// check the device state
			if (this.fetchedData.deviceState == 3)
				headerTitle += "  |  Offline";  // if device is offline, append ' | Offline' to headerTitle
			if (this.fetchedData.deviceState == 1){
				// if device is online, look for temperature value
				for (let i = 0; i < this.fetchedData.dataList.length; i++){
					if (this.fetchedData.dataList[i].key == 'AC_RDT_T1')
						var actTemp = this.fetchedData.dataList[i].value;
				}
				// present temp in header depending on configuration in config file
				if (this.config.showTempWhenOnline)
					headerTitle += "  |  Online  |  " + parseFloat(actTemp).toFixed(1) + "°C";
				else
					headerTitle += "  |  Online";
			}
		} 
		// return the final headerTitle
		return headerTitle;
    },

	
	// Override dom generator.
    getDom: function() {
        
		var wrapper = document.createElement("div");
        
        if (this.config.accesstoken == "") {
            wrapper.innerHTML = "No <i>Access-Token</i> in config file set.";
            wrapper.className = "light small dimmed";
            return wrapper;
        }
		if (this.config.deviceSn == "") {
            wrapper.innerHTML = "No <i>Device SN</i> in config file set.";
            wrapper.className = "light small dimmed";
            return wrapper;
        }
        if (!this.loaded) {
            wrapper.innerHTML = this.translate("LOADING");
            wrapper.className = "light small dimmed";
            return wrapper;
        }  
		
		// if data was loaded but fetching data not a success: show error message
		if (this.loaded && !this.fetchedData.success) {
            wrapper.innerHTML = this.fetchedData.msg;
            wrapper.className = "light small dimmed";
            return wrapper;
        } 
		
		// only load table when data load was successful
		if (this.fetchedData.success) {
			// get values
			// sometime length of list changes so that a direct assignment via a position number is not successful: 
			// therefore the values of interest are searched inside the whole list
			for (let i = 0; i < this.fetchedData.dataList.length; i++){
				if (this.fetchedData.dataList[i].key == 'APo_t1')
					var actPower = this.fetchedData.dataList[i].value;
				if (this.fetchedData.dataList[i].key == 'Etdy_ge0')
					var dailyProd = parseFloat(this.fetchedData.dataList[i].value).toFixed(1);
			}
			 
			var totalProdY = parseFloat(this.fetchedData.hisDataY[0].value).toFixed(1); 
			var totalProdM = parseFloat(this.fetchedData.hisDataM[0].value).toFixed(1);
			
			// dataList[28].key = APo_t1 = actPower
			// dataList[35].key = Etdy_ge0 = dailyProd
			// dataList[30].key = Et_ge0 = totalProd
			// dataList[40].key = AC_RDT_T1 = Temperature
			// dataList[03].key = Year (YY)
			// dataList[04].key = Month (M / MM)
			// dataList[05].key = Day (D / DD)
			
			// set actPower to zero if offline
			if (this.fetchedData.deviceState == 3)
				actPower = '-';
		

			// Create dom table
			const table = document.createElement("table");
			
			// row for current production
			dataRow = document.createElement("tr");
			// CURRENTPRODUCTION
			dataCellTitle = document.createElement("td");
			dataCellTitle.className = "MMM-Solarman-item";  //"light small normal"
			dataCellTitle.innerHTML = this.translate("CURRENTPRODUCTION");
			dataRow.appendChild(dataCellTitle); 
			// VALUE
			dataCellValue = document.createElement("td");
			dataCellValue.className = "MMM-Solarman-value"; //"light small bright"
			dataCellValue.innerHTML = actPower;
			dataRow.appendChild(dataCellValue);
			// UNIT
			dataCellUnit = document.createElement("td");
			dataCellUnit.className = "MMM-Solarman-unit";
			dataCellUnit.innerHTML = '&nbsp;W';
			dataRow.appendChild(dataCellUnit);
			// Append data row to table.
			table.appendChild(dataRow);
			
			// row for daily production
			dataRow = document.createElement("tr");
			// DAILYPRODUCTION
			dataCellTitle = document.createElement("td");
			dataCellTitle.className = "MMM-Solarman-item";
			dataCellTitle.innerHTML = this.translate("DAILYPRODUCTION"); 
			dataRow.appendChild(dataCellTitle); 
			// VALUE
			dataCellValue = document.createElement("td");
			dataCellValue.className = "MMM-Solarman-value";
			dataCellValue.innerHTML = dailyProd;
			dataRow.appendChild(dataCellValue);
			// UNIT
			dataCellUnit = document.createElement("td");
			dataCellUnit.className = "MMM-Solarman-unit";
			dataCellUnit.innerHTML = '&nbsp;kWh';
			dataRow.appendChild(dataCellUnit);
			// Append data row to table.
			table.appendChild(dataRow);
			
			// row for month production
			dataRow = document.createElement("tr");
			// MONTHPRODUCTION
			dataCellTitle = document.createElement("td");
			dataCellTitle.className = "MMM-Solarman-item";
			dataCellTitle.innerHTML = this.translate("MONTHPRODUCTION");
			dataRow.appendChild(dataCellTitle); 
			// VALUE
			dataCellValue = document.createElement("td");
			dataCellValue.className = "MMM-Solarman-value";
			dataCellValue.innerHTML = totalProdM;
			dataRow.appendChild(dataCellValue);
			// UNIT
			dataCellUnit = document.createElement("td");
			dataCellUnit.className = "MMM-Solarman-unit";
			dataCellUnit.innerHTML = '&nbsp;kWh';
			dataRow.appendChild(dataCellUnit);
			// Append data row to table.
			table.appendChild(dataRow);
			
			// row for year production
			dataRow = document.createElement("tr");
			// YEARPRODUCTION
			dataCellTitle = document.createElement("td");
			dataCellTitle.className = "MMM-Solarman-item";
			dataCellTitle.innerHTML = this.translate("YEARPRODUCTION");
			dataRow.appendChild(dataCellTitle); 
			// VALUE
			dataCellValue = document.createElement("td");
			dataCellValue.className = "MMM-Solarman-value";
			dataCellValue.innerHTML = totalProdY;
			dataRow.appendChild(dataCellValue);
			// UNIT
			dataCellUnit = document.createElement("td");
			dataCellUnit.className = "MMM-Solarman-unit";
			dataCellUnit.innerHTML = '&nbsp;kWh';
			dataRow.appendChild(dataCellUnit);
			// Append data row to table.
			table.appendChild(dataRow);
			
			
			// Append table  to wrapper.
			wrapper.appendChild(table);
			
			// Return the wrapper to the dom.
			return wrapper;
		}
	},
});