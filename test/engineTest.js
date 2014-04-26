// Copyright, 2013-2014, by Tomas Korcak. <korczis@gmail.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

(function () {
    var chai = require('chai')
        , path = require('path');

    var Engine = require('../lib/engine')
        , Mc = require('./../lib');

    describe('Engine', function () {
        it('Module is defined', function () {
            Mc.Engine.should.not.equal(null);
        });

        it('Default constructor works', function () {
            var instance = new Mc.Engine();
            instance.should.not.equal(null);
            instance.should.be.an.instanceof(Engine);
            instance.opts.should.equal(Engine.defaultOptions);
        });

        describe('loadProcessors()', function () {
            it('Is defined', function () {
                var engine = new Engine();
                engine.loadProcessors.should.not.equal(null);
            });

            it('Loads example processors', function(done) {
                var engine = new Engine();
                engine.loadProcessors(path.join(__dirname, '..', 'examples'))
                    .done(function(result){
                        chai.expect(result.length).to.equal(7);
                        done();
                    }, function(err) {
                        throw err;
                    })
            });

            it('Throws error when invalid path specified');
        });

        describe('main()', function () {
            it('Is defined', function () {
                var engine = new Mc.Engine();
                engine.main.should.not.equal(null);
            });

            it('Returns promise');

            it('Throws exception if invalid argv passed');
        });

        describe('registerProcessor()', function () {
            it('Is defined', function () {
                var engine = new Engine();
                engine.registerProcessor.should.not.equal(null);
            });

            it('When called without then throws error', function () {
                var engine = new Engine();
                chai.expect(engine.registerProcessor.bind('engine')).to.throw(TypeError);
            });
        });

        describe('run()', function () {
            it('Works', function () {
                var instance = new Engine();
                instance.run();
            });
        });
    });
}());
