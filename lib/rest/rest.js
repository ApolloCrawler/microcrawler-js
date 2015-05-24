(function() {
    'use strict';

    var define = require('amdefine')(module);

    define(['express'], function(express) {
        var app = express();

        app.get('/', function (req, res) {
            res.send('Hello World!');
        });

        var server = app.listen(3000, function () {
            var host = server.address().address;
            var port = server.address().port;

            console.log('Example app listening at http://%s:%s', host, port);
        });

        module.exports = server;
    });
}());