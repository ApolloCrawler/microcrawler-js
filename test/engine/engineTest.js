// Copyright, 2013-2015, by Tomas Korcak. <korczis@gmail.com>
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

import chai from 'chai';
const should = chai.should();

import path from 'path';

import Engine from '../../lib/engine/engine';

describe('Engine', function() {
  const testData1 = {
    url: 'http://google.com',
    processor: 'google.listing'
  };

  const testData2 = {
    url: 'http://seznam.cz',
    processor: 'seznam.listing'
  };

  const testData3 = {
    url: 'http://google.com',
    processor: 'google.details'
  };

  it('Module is defined', function() {
    Engine.should.not.equal(null);
  });

  it('Default constructor works');

  /*
   it('Default constructor works', function() {
   var instance = new Engine();
   instance.should.not.equal(null);
   instance.should.be.an.instanceof(Engine);
   instance.opts.should.equal(Engine.defaultOptions);
   });
   */

  describe('loadProcessors()', function() {
    it('Is defined', function() {
      const engine = new Engine();
      engine.loadProcessors.should.not.equal(null);
    });

    it('Loads example processors', function(done) {
      const engine = new Engine();
      engine.loadProcessors(path.join(__dirname, '..', '..', 'examples'))
        .done(function(result) {
          chai.expect(result.length).to.equal(14);
          done();
        }, function(err) {
          throw err;
        });
    });

    it('Throws error when invalid path specified');
  });

  describe('main()', function() {
    it('Is defined', function() {
      const engine = new Engine();
      engine.main.should.not.equal(null);
    });

    it('Returns promise');

    it('Throws exception if invalid argv passed');
  });

  describe('registerProcessor()', function() {
    it('Is defined', function() {
      const engine = new Engine();
      engine.registerProcessor.should.not.equal(null);
    });

    it('When called without then throws error', function() {
      const engine = new Engine();
      chai.expect(engine.registerProcessor.bind('engine')).to.throw(TypeError);
    });
  });

  describe('run()', function() {
    it('Works', function() {
      const instance = new Engine();
      instance.run();
    });
  });

  describe('enqueueUrl()', function() {
    it('Is defined()', function() {
      const instance = new Engine();
      instance.enqueueUrl.should.not.equal(null);
    });

    it('Should enqueue unique URL', function(done) {
      const instance = new Engine();

      instance.enqueueUrl(testData1).then(function(data) {
        chai.expect(data).to.equal(true);
        done();
      }).done();
    });

    it('Should enqueue unique URL together with data', function(done) {
      const instance = new Engine();

      const userData = {
        name: 'John Doe'
      };

      instance.enqueueUrl({
        url: testData1.url,
        processor: testData1.processor,
        data: userData
      }).then(function(data) {
        chai.expect(data).to.equal(true);
      }).then(function() {
        return instance.queue.get('requested');
      }).then(function(res) {
        chai.expect(res.data).to.equal(data);
        done();
      }).done();
    });

    it('Should enqueue unique same URL only once', function(done) {
      const instance = new Engine();

      instance.enqueueUrl(testData1.url, testData1.processor, null).then(function(res) {
        chai.expect(res).to.equal(true);
        return instance.enqueueUrl(testData1.url, testData1.processor, null);
      }).then(function(res) {
        chai.expect(res).to.equal(false);
        done();
      }).done();
    });
  });

  describe('isDone()', function() {
    it('Is defined', function() {
      const instance = new Engine();
      instance.isCrawlingDone.should.not.equal(null);
    });
  });

  describe('wasAlreadyEnqueued()', function() {
    it('Should be defined', function() {
      const instance = new Engine();
      instance.wasAlreadyEnqueued.should.not.equal(null);
    });

    it('Should return true for same url and same processor', function(done) {
      const instance = new Engine();

      instance.enqueueUrl(testData1).then(function() {
        return instance.wasAlreadyEnqueued(testData1);
      }).then(function(res) {
        chai.expect(res).to.equal(true);
        done();
      }).done();
    });

    it('Should return false for same url and different processor', function(done) {
      const instance = new Engine();

      instance.enqueueUrl(testData1).then(function() {
        return instance.wasAlreadyEnqueued(testData3);
      }).then(function(res) {
        chai.expect(res).to.equal(false);
        done();
      });
    });

    it('Should return false for different url and same processor', function() {
      const instance = new Engine();

      instance.enqueueUrl(testData1).then(function() {
        return instance.wasAlreadyEnqueued(testData2);
      }).then(function(res) {
        return chai.expect(res).to.equal(false);
      });
    });
  });
});
