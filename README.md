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
| `showTempWhenOnline` | `boolean` | `true` | How often the table shall be updated [milliseconds] (1 minute) |
| `updateInterval` | `string` | `"2000"`| How often the table shall be updated [milliseconds] (2 minutes) |
| `animationSpeed` | `string` | `"2000"` | Animation speed to fade in the module on startup [milliseconds] (2 seconds) |

## Updating

To update the module to the latest version, use your terminal to go to your MMM-COVID19-AMPEL module folder and type the following command:

````
git pull && npm install
```` 


Feel free to open any Issue :smiley:


## License

### The MIT License (MIT)

Copyright © 2020 Carsten Dirks

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the “Software”), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

**The software is provided “as is”, without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose and noninfringement. In no event shall the authors or copyright holders be liable for any claim, damages or other liability, whether in an action of contract, tort or otherwise, arising from, out of or in connection with the software or the use or other dealings in the software.**
