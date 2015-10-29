var comms = require('./comms'),
    redis = require('redis'),
    client = redis.createClient();

var senseEventHandler = function(data) {
    try {
        var senseId = data.senseId,
            event = data.data;

        if (event.eventType === 'humix-think') {
            if (event.eventName === 'registerModule') {
                var module = event.message;
                if (module) {
                    var moduleData = [];
                    moduleData.push('commands');
                    moduleData.push(module.commands);
                    moduleData.push('events');
                    moduleData.push(module.events);
                    console.log('moduleName: '+module.moduleName+' moduleData: '+JSON.stringify(moduleData));
                    client.hmset('module:'+module.moduleName+':'+senseId, moduleData, function(err) {
                        if (err) { console.log(err); }
                    });
                }
            }
        }
    } catch (e) {
        console.log(e);
    }
};

module.exports = {
    start: function() {
        comms.subscribe('*', senseEventHandler);
    },
    stop: function() {
        comms.unsubscribe('*', senseEventHandler);
    }
};
