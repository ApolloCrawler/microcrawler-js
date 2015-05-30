(function() {
    'use strict';

    var define = require('amdefine')(module);

    define(['express', '../logger'], function(express, logger) {


        module.exports = function(opts) {
            var app = express();

            app.get('/', function (req, res) {
                res.send('Hello World!');
            });

            var server = app.listen(opts['rest-port'], function () {
                var host = server.address().address;
                var port = server.address().port;

                logger.info('Example app listening at http://%s:%s', host, port);
            });

            return server;
        };
    });
}());