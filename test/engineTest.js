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

        it('Constructor using options works', function () {
            function DummyQueue() {
            };

            var opts = {
                queueClass: DummyQueue
            };

            var instance = new Engine(opts);
            instance.should.not.equal(null);
            instance.opts.should.equal(opts);
        });

        it('Creates default queue', function () {
            var Queue = require('../lib/queue');
            var instance = new Engine();
            instance.queue.should.not.equal(null);
            instance.queue.should.be.an.instanceof(Queue);
        });
    });

}());
