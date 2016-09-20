/**
 * Copyright 2014, 2015 IBM Corp.
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

var WS = require("ws");
var log = require("logule").init(module, 'sense');

var server;
var settings;
var wsServer;
var pendingConnections = [];
var activeConnections = [];

var retained = {};

var subscriptions = {};

var heartbeatTimer;
var lastSentTime;

var syncCommandCache = {};



function start(_server, settings) {


    server = _server;

    var webSocketKeepAliveTime = 15000;
    var path = settings.httpAdminRoot || "/";
    path = (path.slice(0, 1) != "/" ? "/" : "") + path + (path.slice(-1) == "/" ? "" : "/") + "comms_sense";

    wsServer = new WS.Server({
        server: server,
        path: path
    });

    wsServer.on('connection', function(ws) {


        activeConnections.push(ws);

        ws.on('close', function() {
            console.log("connection closed");
            removeActiveConnection(ws);
            removePendingConnection(ws);
        });
        ws.on('message', function(data, flags) {
            var msg = null;
            try {
                msg = JSON.parse(data);
                if (msg.senseId) {
                    ws.senseId = msg.senseId;
                }
            } catch (err) {

                return;
            }

            if (msg.subscribe) {
                handleRemoteSubscription(ws, msg.subscribe);
            } else if (msg.senseId) {



                // Support Async Command
                if (msg.syncCmdId) {

                    var defer = syncCommandCache[msg.syncCmdId];
                    if (defer) {
                        defer.resolve(msg.data);
                        delete syncCommandCache[msg.syncCmdId];
                    }
                } else {
                    for (var t in subscriptions) {
                        if (subscriptions.hasOwnProperty(t)) {
                            var re = new RegExp("^" + t.replace(/([\[\]\?\(\)\\\\$\^\*\.|])/g, "\\$1").replace(/\+/g, "[^/]+").replace(/\/#$/, "(\/.*)?") + "$");
                            if (re.test(msg.senseId) || t === '*') {
                                var subscribers = subscriptions[t];
                                for (var i = 0; i < subscribers.length; i++) {
                                    subscribers[i]({
                                        senseId: msg.senseId,
                                        data: msg.data
                                    });
                                }
                            }
                        }
                    }
                }

            }


        });
        ws.on('error', function(err) {
            log.warn(err);
        });
    });

    wsServer.on('error', function(err) {
        log.warn(err);
    });

    lastSentTime = Date.now();

    heartbeatTimer = setInterval(function() {
        var now = Date.now();
        if (now - lastSentTime > webSocketKeepAliveTime) {
            publish("hb", lastSentTime);
        }
    }, webSocketKeepAliveTime);
}



function stop() {
    if (heartbeatTimer) {
        clearInterval(heartbeatTimer);
        heartbeatTimer = null;
    }
    if (wsServer) {
        wsServer.close();
        wsServer = null;
    }
}

function subscribe(topic, callback) {
    if (subscriptions[topic] == null) {
        subscriptions[topic] = [];
    }
    subscriptions[topic].push(callback);
}

function unsubscribe(topic, callback) {
    if (subscriptions[topic]) {
        for (var i = 0; i < subscriptions[topic].length; i++) {
            if (subscriptions[topic][i] === callback) {
                subscriptions[topic].splice(i, 1);
                break;
            }
        }
        if (subscriptions[topic].length === 0) {
            delete subscriptions[topic];
        }
    }
}

function publish(topic, data, retain) {

    if (retain) {
        retained[topic] = data;
    } else {
        delete retained[topic];
    }
    lastSentTime = Date.now();
    activeConnections.forEach(function(conn) {
        publishTo(conn, topic, data);
    });
}

function publishTo(ws, topic, data) {
    var msg = JSON.stringify({
        topic: topic,
        data: data
    });
    try {
        ws.send(msg);
    } catch (err) {
        removeActiveConnection(ws);
        removePendingConnection(ws);
        log.warn(err);
    }
}

function handleRemoteSubscription(ws, topic) {
    var re = new RegExp("^" + topic.replace(/([\[\]\?\(\)\\\\$\^\*\.|])/g, "\\$1").replace(/\+/g, "[^/]+").replace(/\/#$/, "(\/.*)?") + "$");
    for (var t in retained) {
        if (re.test(t)) {
            publishTo(ws, t, retained[t]);
        }
    }
}

function removeActiveConnection(ws) {
    for (var i = 0; i < activeConnections.length; i++) {
        if (activeConnections[i] === ws) {
            activeConnections.splice(i, 1);
            break;
        }
    }
}

function removePendingConnection(ws) {
    for (var i = 0; i < pendingConnections.length; i++) {
        if (pendingConnections[i] === ws) {
            pendingConnections.splice(i, 1);
            break;
        }
    }
}

module.exports = {
    start: start,
    stop: stop,
    publish: publish,
    subscribe: subscribe,
    unsubscribe: unsubscribe,
    activeConnections: activeConnections,
    syncCommandCache: syncCommandCache
}