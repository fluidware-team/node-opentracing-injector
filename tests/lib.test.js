import { describe, it, beforeEach, afterEach, after, before } from 'mocha';
import assert from 'assert';
import { Tracer as MockTracer } from 'opentracing';
import { Tracer as JaegerTracer } from 'jaeger-client';

describe('lib', function () {
  let processExit;
  before(done => {
    processExit = process.exit;
    process.exit = function () {};
    done();
  });
  after(done => {
    process.exit = processExit;
    done();
  });
  describe('initOpenTracer', function () {
    let initOpenTracer;
    beforeEach(function (done) {
      initOpenTracer = require('../src').initOpenTracer;
      done();
    });
    afterEach(function (done) {
      delete require.cache[require.resolve('../src')];
      done();
    });
    it('should return an mock Tracer if OPENTRACING_DISABLE is true', function () {
      const tracer = initOpenTracer({ OPENTRACING_DISABLE: 'true' });
      assert.strictEqual(tracer instanceof MockTracer, true);
    });
    it('should return an mock Tracer if OPENTRACING_CLIENT_NAME is not set', function () {
      const tracer = initOpenTracer({});
      assert.strictEqual(tracer instanceof MockTracer, true);
    });
    it('should return an jaeger Tracer if OPENTRACING_CLIENT_NAME is set to jaeger', function () {
      const tracer = initOpenTracer({ OPENTRACING_CLIENT_NAME: 'jaeger', JAEGER_SERVICE_NAME: 'test' });
      assert.strictEqual(tracer instanceof JaegerTracer, true);
      assert.strictEqual(process.listeners('SIGINT').length, 2); // 1 default, 1 ours
      process.emit('SIGINT');
    });
  });
  describe('getTracer', function () {
    let getTracer;
    let initOpenTracer;
    beforeEach(function (done) {
      const lib = require('../src');
      getTracer = lib.getOpenTracer;
      initOpenTracer = lib.initOpenTracer;
      done();
    });
    afterEach(function (done) {
      delete require.cache[require.resolve('../src')];
      done();
    });
    it('should throw an error if tracker is not defined', function () {
      assert.throws(() => getTracer());
    });
    it('should return tracker', function () {
      const tracerOne = initOpenTracer({ OPENTRACING_DISABLE: '1' });
      const tracerTwo = getTracer();
      assert.strictEqual(tracerOne, tracerTwo);
    });
  });

  describe('startSpanWithTags (jaeger)', function () {
    let tracer;
    let lib;
    before(function (done) {
      lib = require('../src');
      tracer = lib.initOpenTracer({
        OPENTRACING_CLIENT_NAME: 'jaeger',
        JAEGER_SERVICE_NAME: 'test',
        JAEGER_DISABLE: '1'
      });
      done();
    });
    after(function (done) {
      tracer.close();
      delete require.cache[require.resolve('../src')];
      done();
    });
    it('should return a span', function () {
      const span = lib.startSpanWithTags('test', {}, { a: 'test' });
      span.finish();
      assert.strictEqual(typeof span, 'object');
    });
  });

  describe('injectSpanIntoHeaders (Jaeger)', function () {
    let tracer;
    let lib;
    before(function (done) {
      lib = require('../src');
      tracer = lib.initOpenTracer({
        OPENTRACING_CLIENT_NAME: 'jaeger',
        JAEGER_SERVICE_NAME: 'test',
        JAEGER_DISABLE: '1'
      });
      done();
    });
    after(function (done) {
      process.emit('SIGINT');
      delete require.cache[require.resolve('../src')];
      done();
    });
    it('should return an object with header for tracing', function () {
      const span = lib.startSpanWithTags('test1', {}, { a: 'test1' });
      span.finish();
      const headers = {};
      lib.injectSpanIntoHeaders(span, headers);
      assert.strictEqual(typeof headers['uber-trace-id'], 'string');
    });
  });
});
