/* Copyright 2018-present Samsung Electronics Co., Ltd. and other contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var fs = require('fs')
var https = require('https')


/**
 * Helper function to read the data from the server.
 */
var responseHandler = function (res) {
  var body = '';

  function endHandler() {
    console.log(body);
  }

  function dataHandler(chunk) {
    body += chunk.toString()
  }

  res.on('end', endHandler);
  res.on('data', dataHandler);
}


/**
 * The SmartThingsCloud constructor.
 *
 * @param {string} authFile Path to the the authentication.json file.
 */
function SmartThingsCloud(authFile) {
  this.token = null;
  this.endpoint = null;

  this.initialize(authFile);
}


/**
 * Define the endpoint and the access token.
 */
SmartThingsCloud.prototype.initialize = function(authFile) {
  if (fs.existsSync(authFile) == true) {
    var raw_data = fs.readFileSync(authFile, 'utf8');
    var json_data = JSON.parse(raw_data);

    this.token = json_data['api-token'];
    this.endpoint = json_data['api-endpoint'];
  } else {
    console.error('The authorization file is not exist.');
  }
}


/**
 * List all the devices that are available in the cloud.
 */
SmartThingsCloud.prototype.listDevices = function() {
  if (this.token == null || this.endpoint == null)
    return;

  var options = {
    method: 'GET',
    host: 'graph.api.smartthings.com',
    path: '/api/smartapps/installations/' + this.endpoint + '/switches',
    headers: { 'Authorization': 'Bearer ' + this.token }
  };

  request = https.request(options, responseHandler);
  request.end();

  //https.get(options, responseHandler);
}


/**
 * Define a command to the appropriate device.
 *
 * @param {string} device Name of an existing device.
 * @param {string} command Command for the device.
 *
 */
SmartThingsCloud.prototype.sendCommand = function(device, command) {
  if (this.token == null || this.endpoint == null)
    return;

  var options = {
    method: 'PUT',
    host: 'graph.api.smartthings.com',
    path: '/api/smartapps/installations/' + this.endpoint + '/' + device + '/' + command,
    headers: {
      'Authorization': 'Bearer ' + this.token,
      'Content-Type': 'application/json'
    }
  };

  request = https.request(options, responseHandler);
  request.end();
}

exports.SmartThingsCloud = SmartThingsCloud;
