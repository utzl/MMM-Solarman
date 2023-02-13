# MMM-Solarman

<p style="text-align: center">
    <a href="https://choosealicense.com/licenses/mit"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License"></a>
</p>

This module is an extention for the [MagicMirror](https://github.com/MichMich/MagicMirror).

The module monitors the values of a Solarman PV device.
The needed AppID and SecredID can be requested from Solarman customer Service (prefferably by chat)

## Installation

Open a terminal session, navigate to your MagicMirror's `modules` folder and execute `git clone https://github.com/utzl/MMM-Solarman.git`, such that a new folder called MMM-Solarman will be created.

Navigate inside the folder and execute `npm install` to install all dependencies.

Activate the module by adding it to the `config.js` file of the MagicMirror as shown below.



The table below lists all possible configuration options.

## Using the module
````javascript
    modules: [
        {
            module: 'MMM-Solarman',
            position: 'top_right',
            config: {
                accessToken: 'Enter your accessToken here',
                deviceSn: 'Enter your deviceSn here',
                appId: 'Enter your appId here',

            }
        }
    ]
````

## Configuration options

The following configuration options can be set and/or changed:


### Module

| Option | Type | Default | Description |
| ---- | ---- | ---- | ---- |
| `accessToken` | `string` | `"abc"` | !!!! |
| `deviceSn` | `string` | `"220......."` | Device Serial Number of your inverter |
| `appId` | `string` | `"123456789"` | AppId, provided by Solarman customer service |
| `showTempWhenOnline` | `boolean` | `true` | Temperature of device will be displayed in header |
| `updateInterval` | `string` | `"2000"`| How often the table shall be updated [milliseconds] (2 minutes) |
| `animationSpeed` | `string` | `"2000"` | Animation speed to fade in the module on startup [milliseconds] (2 seconds) |

## Updating

To update the module to the latest version, use your terminal to go to your MMM-Solarman module folder and type the following command:

````
git pull
```` 


Feel free to open any Issue :smiley:
