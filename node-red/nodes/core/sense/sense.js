//var redis = require('redis'),
//    client = redis.createClient();

module.exports = function(RED) {
    "use strict";

    function SenseEvent(n) {
        RED.nodes.createNode(this,n);
        var node = this,
            senseId = n.senseid,
            eventType = n.eventtype,
            eventName = n.eventname;

        var eventHandler = function(event) {
            try {
                var json;
                if (typeof event === 'string') {
                    json = JSON.parse(event).data;
                } else {
                    json = event.data;
                }

                if (json.eventType === eventType && json.eventName === eventName) {
                    node.send({
                        payload: json.message
                    });
                }
            } catch (e) {
                node.error('Error: '+e);
            }
        };

        // RED.comms_sense.subscribe(senseId, eventHandler);
        RED.comms.subscribe_sense(senseId, eventHandler);

        node.on('close', function() {
            RED.comms.unsubscribe_sense(senseId, eventHandler);
        });
    }
    RED.nodes.registerType("sense event", SenseEvent);

    function SenseCommand(n) {
        RED.nodes.createNode(this,n);
        var senseId = n.senseid,
            commandType = n.commandtype,
            commandName = n.commandname,
            node = this;

        node.on('input', function(msg) {
          //console.log('#### inputnode: ' + JSON.stringify(msg));
            if (!msg.payload) {
                node.error('Missing property: msg.payload');
                return;
            }

            var message = {
                header: {
                    type: 'modules'
                },
                payload: {
                    commandType: commandType,
                    commandName: commandName,
                    commandData: msg.payload
                }
            };
            //console.log('#### inputnode, commandType= ' + message.payload.commandType + ', commandData= ' + message.payload.commandData );

            node.log(message.payload);
            RED.comms.publish_sense(senseId, message, true);

        });
    }
    RED.nodes.registerType("sense command", SenseCommand);
};
