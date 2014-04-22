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
        , expect = chai.expect;

    var Engine = require('../lib/engine')
        , Mc = require('./../lib');

    describe('Engine', function () {
        var testData1 = {
            url: 'http://google.com',
            processor: 'seznam.listing'
        };

        var testData2 = {
            url: 'http://seznam.cz',
            processor: 'seznam.listing'
        };

        var testData3 = {
            url: 'http://google.com',
            processor: 'google.details'
        };

        it('Module is defined', function () {
            Mc.Engine.should.not.equal(null);
        });

        it('Default constructor works', function () {
            var instance = new Mc.Engine();
            instance.should.not.equal(null);
            instance.should.be.an.instanceof(Engine);
            instance.opts.should.equal(Engine.defaultOptions);
        });

        describe('enqueueUrl()', function() {
            it('Is defined()', function() {
                var engine = new Engine();
                engine.enqueueUrl.should.not.equal(null);
            });

            it('Should enqueue unique URL', function() {
                var engine = new Engine();

                engine.enqueueUrl.should.not.equal(null);

                var res = engine.enqueueUrl(testData1.url, testData1.processor, null);
                chai.expect(res).to.equal(true);
            });

            it('Should enqueue unique same URL only once', function() {
                var engine = new Engine();
                engine.enqueueUrl.should.not.equal(null);

                var res = engine.enqueueUrl(testData1.url, testData1.processor, null);
                chai.expect(res).to.equal(true);

                res = engine.enqueueUrl(testData1.url, testData1.processor, null);
                chai.expect(res).to.equal(false);
            });
        });

        describe('isDone()', function() {
            it('Exists', function() {
                var engine = new Mc.Engine();
                engine.isDone.should.not.equal(null);
            });
        });

        describe('registerProcessor()', function () {
            it('Is defined', function () {
                var engine = new Engine();
                engine.registerProcessor.should.not.equal(null);
            });

            it('Can be called without arguments', function () {
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

        describe('wasAlreadyEnqueued()', function () {
            it('Should be defined', function () {
                var engine = new Engine();
                engine.wasAlreadyEnqueued.should.not.equal(null);
            });

            it('Should return true for same url and same processor', function () {
                var engine = new Engine();

                engine.enqueueUrl(testData1.url, testData1.processor, null);
                var res = engine.wasAlreadyEnqueued(testData1.url, testData1.processor);
                chai.expect(res).to.equal(true);
            });

            it('Should return false for same url and different processor', function () {
                var engine = new Engine();

                engine.enqueueUrl(testData1.url, testData1.processor, null);
                var res = engine.wasAlreadyEnqueued(testData3.url, testData3.processor);
                chai.expect(res).to.equal(false);
            });

            it('Should return false for different url and same processor', function () {
                var engine = new Engine();

                engine.enqueueUrl(testData1.url, testData1.processor, null);
                var res = engine.wasAlreadyEnqueued(testData2.url, testData2.processor);
                chai.expect(res).to.equal(false);
            });
        });
    });
}());
