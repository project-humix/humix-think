
module.exports = function(RED) {
    "use strict";

    function SenseEvent(n) {
        RED.nodes.createNode(this,n);
        var senseId = n.senseid;
        var node = this;

        RED.comms.subscribe(senseId, function(data) {
            node.send({
                payload: data
            });
        });
    }
    RED.nodes.registerType("sense event", SenseEvent);

    function SenseCommand(n) {
        RED.nodes.createNode(this,n);
        var senseId = n.senseid;
        var node = this;

        node.on('input', function(msg) {
            if (!msg.payload) {
                node.error('Missing property: msg.payload');
                return;
            }

            RED.comms.publish(senseId, msg.payload, true);
        });
    }
    RED.nodes.registerType("sense command", SenseCommand);
};
