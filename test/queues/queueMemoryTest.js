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

    var QueueMemory = require('../../lib/queues/queueMemory');

    describe('QueueMemory', function () {
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
            QueueMemory.should.not.equal(null);
        });

        it('Default constructor works', function () {
            var instance = new QueueMemory();
            instance.should.not.equal(null);
            instance.should.be.an.instanceof(QueueMemory);
        });

        describe('enqueueUrl()', function () {
            it('Is defined()', function () {
                var instance = new QueueMemory();
                instance.enqueueUrl.should.not.equal(null);
            });

            it('Should enqueue unique URL', function () {
                var instance = new QueueMemory();

                instance.enqueueUrl.should.not.equal(null);

                var res = instance.enqueueUrl(testData1);
                chai.expect(res).to.equal(true);
            });

            it('Should enqueue unique URL together with data', function () {
                var instance = new QueueMemory();

                instance.enqueueUrl.should.not.equal(null);

                var data = {
                    name: "John Doe"
                };

                var res = instance.enqueueUrl({
                    url: testData1.url,
                    processor: testData1.processor,
                    data: data
                });
                chai.expect(res).to.equal(true);

                chai.expect(instance.queue.requested[0].data).to.equal(data);
            });

            it('Should enqueue unique same URL only once', function () {
                var instance = new QueueMemory();
                instance.enqueueUrl.should.not.equal(null);

                var res = instance.enqueueUrl(testData1.url, testData1.processor, null);
                chai.expect(res).to.equal(true);

                res = instance.enqueueUrl(testData1.url, testData1.processor, null);
                chai.expect(res).to.equal(false);
            });
        });

        describe('isDone()', function () {
            it('Is defined', function () {
                var instance = new QueueMemory();
                instance.isDone.should.not.equal(null);
            });
        });

        describe('wasAlreadyEnqueued()', function () {
            it('Should be defined', function () {
                var instance = new QueueMemory();
                instance.wasAlreadyEnqueued.should.not.equal(null);
            });

            it('Should return true for same url and same processor', function () {
                var instance = new QueueMemory();

                instance.enqueueUrl(testData1);
                var res = instance.wasAlreadyEnqueued(testData1);
                chai.expect(res).to.equal(true);
            });

            it('Should return false for same url and different processor', function () {
                var instance = new QueueMemory();

                instance.enqueueUrl(testData1);
                var res = instance.wasAlreadyEnqueued(testData3);
                chai.expect(res).to.equal(false);
            });

            it('Should return false for different url and same processor', function () {
                var instance = new QueueMemory();

                instance.enqueueUrl(testData1);
                var res = instance.wasAlreadyEnqueued(testData2);
                chai.expect(res).to.equal(false);
            });
        });
    });
}());
