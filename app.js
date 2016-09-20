var express = require('express'),
    log = require('logule').init(module, 'APP'),
    path = require('path'),
    bodyParser = require('body-parser'),
    RED = require('./node-red/red/red.js'),
    http = require('http'),
    api = require('./api'),
    sense = require('./sense');

var bluemixNodeRedSettings = require('./bluemix-settings.js');

var app = module.exports = express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(express.static(path.join(__dirname, 'frontend/dist')));

var port = process.env.PORT || 3000;
var httpServer = http.createServer(app);

RED.init(httpServer, bluemixNodeRedSettings);



app.use(bluemixNodeRedSettings.httpAdminRoot, RED.httpAdmin);
app.use(bluemixNodeRedSettings.httpNodeRoot, RED.httpNode);
app.RED = RED;
// api init
api.init(app);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.send({
        error: err.message
    });
});


// start app
RED.start().then(function() {

    // Initialize Humix Sense WebSocket Connections
    sense.start(httpServer, RED);
});


httpServer.listen(port);
log.info('Server listening on port: ' + port);




process.on('SIGINT', function() {
    RED.stop();
    sense.stop();
    log.info('Server shutting down');
    process.exit();
});