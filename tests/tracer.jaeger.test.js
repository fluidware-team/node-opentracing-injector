import { describe, it } from 'mocha';
import assert from 'assert';
import initiator from '../src/jaeger';
import { Tracer } from 'jaeger-client';

const minimalEnv = {
  JAEGER_SERVICE_NAME: 'test'
};

describe('jaeger', function () {
  describe('init', function () {
    it('should return an instance of Jaeger Tracer (serviceName from ENV)', function (done) {
      const tracer = initiator.init(minimalEnv);
      assert.strictEqual(tracer instanceof Tracer, true);
      initiator.stop(tracer, done);
    });
    it('should return an instance of Jaeger Tracer (serviceName from npm)', function (done) {
      const tracer = initiator.init({ npm_package_name: 'test', npm_package_version: '0.0.1' });
      assert.strictEqual(tracer instanceof Tracer, true);
      initiator.stop(tracer, done);
    });
    it('should return an instance of Jaeger Tracer (serviceName from ENV, tags from NPM)', function (done) {
      const tracer = initiator.init(
        Object.assign({}, minimalEnv, { npm_package_name: 'test', npm_package_version: '0.0.1' })
      );
      assert.strictEqual(tracer instanceof Tracer, true);
      initiator.stop(tracer, done);
    });
  });
});
