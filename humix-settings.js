/**
* © Copyright IBM Corp. 2016
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
**/



var humixSettings = module.exports = {

    appName: 'humix',

    port: 3000,

    // 'local' or 'bluemix'
    location: 'local',

    // 'couch' , 'redis'
    // NOTE: couch is the only supported option when using bluemix location
    //storage: 'couch',
    //couchUrl: 'http://127.0.0.1:5984/',

    storage: 'redis',
    redisConfig: {
         redisPort: "6379",
         redisIP: "127.0.0.1",
         redisPassword: "",
         dbSelect: "0"
    },



    /* NodeRed settings */

    uiPort: 3000,
    mqttReconnectTime: 15000,
    serialReconnectTime: 15000,
    debugMaxLength: 1000,

    // Add the bluemix-specific nodes in
    nodesDir: path.join(__dirname, "server/nodes"),

    // Blacklist the non-bluemix friendly nodes
    nodesExcludes: [
        '66-mongodb.js',
        '75-exec.js',
        '35-arduino.js',
        '36-rpi-gpio.js',
        '25-serial.js',
        '28-tail.js',
        '50-file.js',
        '31-tcpin.js',
        '32-udp.js',
        '23-watch.js'
    ],

    // Enable module reinstalls on start-up; this ensures modules installed
    // post-deploy are restored after a restage
    autoInstallModules: true,

    // Move the admin UI
    httpAdminRoot: '/node-red',
    httpNodeRoot: '/node-red',
    // You can protect the user interface with a userid and password by using the
    // following property the password must be an md5 hash  eg..
    // 5f4dcc3b5aa765d61d8327deb882cf99 ('password') httpAdminAuth:
    // {user:"user",pass:"5f4dcc3b5aa765d61d8327deb882cf99"}, Serve up the welcome
    // page
    httpStatic: path.join(__dirname, 'public'),

    functionGlobalContext: {},

    //userDir: process.env.PWD + '/humix_data',
};


