import Jaeger from './jaeger';
import util from 'util';
import { InjectorTracers } from './interfaces';

export const tracers: InjectorTracers = {
  jaeger: Jaeger
};

export const getTracerInitiator = function (name: string) {
  if (tracers[name] === undefined) {
    throw new Error(util.format('Unknown tracer "%s". Known tracers: %s ', name, Object.keys(tracers).join(', ')));
  }
  return tracers[name];
};
