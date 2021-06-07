import Jaeger from './jaeger';
import util from 'util';

export const tracers = {
  jaeger: Jaeger
};

export const getTracerInitiator = function (name) {
  if (tracers[name] === undefined) {
    throw new Error(util.format('Unknown tracer "%s". Known tracers: %s ', name, Object.keys(tracers).join(', ')));
  }
  return tracers[name];
};
