import { describe, it } from 'mocha';
import { getTracerInitiator, tracers } from '../src/tracers';
import assert from 'assert';

describe('tracers', function () {
  it('should throw an error if tracer name do not match enabled tracers', function () {
    let errored = false;
    try {
      getTracerInitiator('fake');
    } catch (e) {
      assert.strictEqual(e.message.indexOf('Unknown tracer "fake"'), 0);
      errored = true;
    }
    assert.strictEqual(errored, true);
  });

  Object.keys(tracers).forEach(tracerName => {
    it(`should return a Tracer initiator ${tracerName}`, function () {
      const initiator = getTracerInitiator(tracerName);
      assert.notStrictEqual(initiator.init, undefined);
      assert.strictEqual(typeof initiator.init, 'function');
    });
  });
});
