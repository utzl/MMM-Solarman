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
		updateInterval: 1 * 60 * 1000, // every minute
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
		this.getData();
		this.loaded = false;
		this.scheduleUpdate();
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

	
	getData: function () {
    this.sendSocketNotification("GET_DATA", this.config);
	},
	
	socketNotificationReceived: function(notification, payload) {
	    var self = this;
		if (notification === "DATA") {
			let animationSpeed = self.config.animationSpeed;
            if (this.loaded) {
                animationSpeed = 0;
            }
			this.fetchedData = payload;
			this.loaded = true;
           
		    // Update dom with given animation speed.
            this.updateDom(animationSpeed);
	    }
	},
	
	// Define header -> user input in config.js
	getHeader: function() { 
    // initialize the headerTitle variable with the value of this.data.header
		var headerTitle = this.data.header;
    // check if data is available and loaded
		if (this.loaded && !(this.fetchedData === null || this.fetchedData === undefined )) {
      // check the device state
			if (this.fetchedData.deviceState == 3)
				// if device is offline, append ' - Offline' to headerTitle
				headerTitle += "  -  Offline";
			if (this.fetchedData.deviceState == 1)
				if (this.config.showTempWhenOnline)
					// if device is online and showTempWhenOnline is true, append ' - Online - [temp]°C' to headerTitle
					headerTitle += "  -  Online  -  " + parseFloat(this.fetchedData.dataList[39].value).toFixed(1) + "°C";
				else
					// if device is online and showTempWhenOnline is false, append ' - Online' to headerTitle
					headerTitle += "  -  Online";
		}
		// return the final headerTitle
		return headerTitle;
    },

	
	// Override dom generator.
    getDom: function() {
        //const wrapper = document.createElement("div");
		
		
		var wrapper = document.createElement("div");
		//wrapper.innerHTML = 'Hello world!';
        
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
		
		if (this.fetchedData === null || this.fetchedData === undefined )
			return wrapper;
		
		// get values
		var actPower = this.fetchedData.dataList[27].value;
		var dailyProd = parseFloat(this.fetchedData.dataList[34].value).toFixed(1);
		//var totalProd = parseInt(this.fetchedData.dataList[29].value); 
		var totalProdY = parseFloat(this.fetchedData.hisDataY[0].value).toFixed(1); 
		var totalProdM = parseFloat(this.fetchedData.hisDataM[0].value).toFixed(1);
		
		// dataList[27] = APo_t1 = actPower
		// dataList[34] = Etdy_ge0 = dailyProd
		// dataList[29] = Et_ge0 = totalProd
		// dataList[39] = AC_RDT_T1 = Temperature
		// dataList[04] = Year (YY)
		// dataList[05] = Month (M / MM)
		// dataList[06] = Day (D / DD)
		
		// set actPower to zero if offline
		if (this.fetchedData.deviceState == 3)
			actPower = '-';


		// Create dom table
        const table = document.createElement("table");

		dataRow = document.createElement("tr");
        // CURRENTPRODUCTION
        dataCellTitle = document.createElement("td");
        dataCellTitle.className = "MMM-Solarman item";  //"light small normal"
        dataCellTitle.innerHTML = this.translate("CURRENTPRODUCTION");
        dataRow.appendChild(dataCellTitle); 
        // VALUE
        dataCellValue = document.createElement("td");
        dataCellValue.className = "MMM-Solarman value"; //"light small bright"
        dataCellValue.innerHTML = actPower;
        dataRow.appendChild(dataCellValue);
        // UNIT
        dataCellUnit = document.createElement("td");
        dataCellUnit.className = "MMM-Solarman value";
        dataCellUnit.innerHTML = 'W';
        dataRow.appendChild(dataCellUnit);
        // Append data row to table.
        table.appendChild(dataRow);
		
		
		dataRow = document.createElement("tr");
        // CURRENTPRODUCTION
        dataCellTitle = document.createElement("td");
        dataCellTitle.className = "MMM-Solarman item";
        dataCellTitle.innerHTML = this.translate("DAILYPRODUCTION"); 
        dataRow.appendChild(dataCellTitle); 
        // VALUE
        dataCellValue = document.createElement("td");
        dataCellValue.className = "MMM-Solarman value";
        dataCellValue.innerHTML = dailyProd;
        dataRow.appendChild(dataCellValue);
        // UNIT
        dataCellUnit = document.createElement("td");
        dataCellUnit.className = "MMM-Solarman value";
        dataCellUnit.innerHTML = 'kWh';
        dataRow.appendChild(dataCellUnit);
        // Append data row to table.
        table.appendChild(dataRow);
		
		
		dataRow = document.createElement("tr");
        // CURRENTPRODUCTION
        dataCellTitle = document.createElement("td");
        dataCellTitle.className = "MMM-Solarman item";
        dataCellTitle.innerHTML = this.translate("MONTHPRODUCTION");
        dataRow.appendChild(dataCellTitle); 
        // VALUE
        dataCellValue = document.createElement("td");
        dataCellValue.className = "MMM-Solarman value";
		dataCellValue.innerHTML = totalProdM;
        dataRow.appendChild(dataCellValue);
        // UNIT
        dataCellUnit = document.createElement("td");
        dataCellUnit.className = "MMM-Solarman value";
        dataCellUnit.innerHTML = 'kWh';
        dataRow.appendChild(dataCellUnit);
        // Append data row to table.
        table.appendChild(dataRow);
		
		
		dataRow = document.createElement("tr");
        // CURRENTPRODUCTION
        dataCellTitle = document.createElement("td");
        dataCellTitle.className = "MMM-Solarman item";
        dataCellTitle.innerHTML = this.translate("YEARPRODUCTION");
        dataRow.appendChild(dataCellTitle); 
        // VALUE
        dataCellValue = document.createElement("td");
        dataCellValue.className = "MMM-Solarman value";
		dataCellValue.innerHTML = totalProdY;
        dataRow.appendChild(dataCellValue);
        // UNIT
        dataCellUnit = document.createElement("td");
        dataCellUnit.className = "MMM-Solarman value";
        dataCellUnit.innerHTML = 'kWh';
        dataRow.appendChild(dataCellUnit);
        // Append data row to table.
        table.appendChild(dataRow);
		
		
		// Append table  to wrapper.
        wrapper.appendChild(table);
		
		// Return the wrapper to the dom.
        return wrapper;
	},
});