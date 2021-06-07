import { describe, it } from 'mocha';
import assert from 'assert';
import { EnvParse } from '../src/utils/envUtils';

describe('EnvParse', function () {
  describe('envInt', function () {
    const tests = [
      { in: '1', out: 1 },
      { in: '127', out: 127 },
      { in: '1.1', out: 1 }
    ];
    tests.forEach((t, i) => {
      it('should return correct int #' + i, function () {
        assert.strictEqual(EnvParse.envInt(t.in), t.out);
      });
    });
  });

  describe('envBool', function () {
    const tests = [
      { in: '1', out: true },
      { in: 'on', out: true },
      { in: 'true', out: true },
      { in: '0', out: false },
      { in: 'off', out: false },
      { in: 'false', out: false },
      { out: false }
    ];
    tests.forEach((t, i) => {
      it('should return correct bool #' + i, function () {
        assert.strictEqual(EnvParse.envBool(t.in), t.out);
      });
    });

    it('should throw an Error if not bool', function () {
      assert.throws(() => EnvParse.envBool('foo'));
    });
  });

  describe('envJSON', function () {
    it('should return correct object', function () {
      assert.deepStrictEqual(EnvParse.envJSON('{"test":"json"}'), { test: 'json' });
    });
  });
});
