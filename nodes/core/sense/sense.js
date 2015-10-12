
module.exports = function(RED) {
    "use strict";

    function SenseEvent(n) {
        RED.nodes.createNode(this,n);
        var senseId = n.senseid,
            eventType = n.eventtype,
            node = this;

        RED.comms.subscribe(senseId, function(data) {
            try {
                var event;
                if (typeof data === 'string') {
                    event = JSON.parse(data);
                } else {
                    event = data;
                }
                if (event.topic === eventType) {
                    node.send({
                        payload: event.message
                    });
                }
            } catch (e) {
                node.error('Error: '+e);
            }
        });
    }
    RED.nodes.registerType("sense event", SenseEvent);

    function SenseCommand(n) {
        RED.nodes.createNode(this,n);
        var senseId = n.senseid,
            commandType = n.commandtype,
            node = this;

        node.on('input', function(msg) {
            if (!msg.payload) {
                node.error('Missing property: msg.payload');
                return;
            }

            var message = {
                header: {
                    type: 'modules'
                },
                payload: {
                    type: commandType,
                    command: msg.payload
                }
            };
            RED.comms.publish(senseId, message, true);
        });
    }
    RED.nodes.registerType("sense command", SenseCommand);
};
