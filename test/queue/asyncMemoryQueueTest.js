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
        , should = chai.should();

    var AsyncMemoryQueue = require('../../lib/queue/asyncMemoryQueue');

    var testItem = {
        guid: 12345,
        url: 'http://google.com',
        processor: 'google.listing'
    };

    describe('AsyncMemoryQueue', function () {
        it('Module is defined', function () {
            AsyncMemoryQueue.should.not.equal(null);
        });

        it('Default constructor works', function () {
            var instance = new AsyncMemoryQueue();
            instance.should.not.equal(null);
            instance.should.be.an.instanceof(AsyncMemoryQueue);
        });

        describe('count', function () {
            it('Should return 0 for empty queue', function (done) {
                var instance = new AsyncMemoryQueue();
                instance.count('requested').then(function (res) {
                    res.should.equal(0);
                    done();
                });
            });

            it('Should return 1 for queue with one item', function (done) {
                var instance = new AsyncMemoryQueue();
                instance.put(testItem, 'requested').then(function () {
                    return instance.count('requested');
                }).then(function (res) {
                    res.should.equal(1);
                    done();
                });
            });
        });

        describe('exist', function () {
            it('Should return false for non-existing item', function (done) {
                var instance = new AsyncMemoryQueue();

                instance.exist(testItem, 'requested').then(function (res) {
                    res.should.equal(false);
                    done();
                });
            });
        });

        describe('find', function () {
            it('Should return null for non-existing item', function (done) {
                var instance = new AsyncMemoryQueue();

                instance.find(testItem, 'requested').then(function (res) {
                    var tmp = res === null;
                    tmp.should.equal(true);
                    done();
                });
            });

            it('Should find existing item', function (done) {
                var instance = new AsyncMemoryQueue();

                instance.put(testItem, 'requested').then(function () {
                    return instance.find(testItem, 'requested');
                }).then(function (res) {
                    var tmp = res === testItem;
                    tmp.should.equal(true);
                    done();
                });
            });
        });

        describe('get', function () {
            it('Gets item from queue');
        });

        describe('move', function () {
            it('Moves item between queues');
        });

        describe('put', function () {
            it('Puts item to queue');
            it('Throws an error when trying to put invalid item');
        });
    });
}());
