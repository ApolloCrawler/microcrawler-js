(function() {
    'use strict';

    var define = require('amdefine')(module);

    define(['express', '../logger'], function(express, logger) {
        var app = express();

        app.get('/', function (req, res) {
            res.send('Hello World!');
        });

        var server = app.listen(3000, function () {
            var host = server.address().address;
            var port = server.address().port;

            logger.info('Example app listening at http://%s:%s', host, port);
        });

        module.exports = server;
    });
}());