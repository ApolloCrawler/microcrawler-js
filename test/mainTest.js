(function () {
    var chai = require('chai')
        , should = chai.should();

    var mc = require('./../lib/microcrawler');

    describe('Microcrawler', function () {
        it('Should have module defined', function () {
            mc.should.not.equal(null);
        });
    });

}());
