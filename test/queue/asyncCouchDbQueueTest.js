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

    var AsyncCouchDbQueue = require('../../lib/queue/asyncCouchDbQueue');

    var createInstance = function () {
        return new AsyncCouchDbQueue();
    };

    describe('AsyncCouchDbQueue', function () {
        it('Module is defined', function () {
            AsyncCouchDbQueue.should.not.equal(null);
        });

        it('Default constructor works', function () {
            var instance = createInstance();
            instance.should.not.equal(null);
            instance.should.be.an.instanceof(AsyncCouchDbQueue);
        });

        describe('cleanup', function () {
            it('Clears initialized engine', function (done) {
                var instance = createInstance();

                instance.init().then(function () {
                    return instance.cleanup();
                }).done(function () {
                    done();
                }, function (err) {
                    throw err;
                });
            });
        });

        describe('count', function () {
            it('Gets count of items in queue', function (done) {
                var instance = createInstance();
                instance.init().then(function () {
                    var data = {
                        url: 'blah'
                    };
                    return instance.put(data);
                }).then(function () {
                    return instance.count();
                }).done(function (count) {
                    done();
                }, function (err) {
                    throw err;
                });
            });

            it('Throws Error when no URI specified');
        });

        describe('get', function () {
            it('Gets item from queue', function (done) {
                var instance = createInstance();
                instance.init().then(function () {
                    var data = {
                        url: 'blah'
                    };
                    return instance.put(data);
                }).then(function () {
                    return instance.get();
                }).done(function (res) {
                    done();
                }, function (err) {
                    throw err;
                });

            });
        });

        describe('init', function () {
            it('Returns promise', function (done) {
                var instance = createInstance();
                instance.init().done(function () {
                    done();
                }, function (err) {
                    throw err;
                });
            });

            it('Throws Error when no URI specified');
        });

        describe('put', function () {
            it('Puts item to queue', function (done) {
                var instance = createInstance();
                instance.init().then(function () {
                    var data = {
                        url: 'blah'
                    };
                    return instance.put(data);
                }).done(function () {
                    done();
                }, function (err) {
                    throw err;
                });
            });

            it('Throws Error when no URI specified');
        });
    });
}());
