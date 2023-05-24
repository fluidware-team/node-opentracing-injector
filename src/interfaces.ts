import { Span } from 'opentracing';
import { JaegerTracer, Logger } from 'jaeger-client';

export type TagsObject = { [key: string]: any };

export interface DataCarrier {
  trace: any;
}

export interface HeadersCarrier {
  [name: string]: string;
}

export type InstrumentCallback = (span: Span, errFn: (err: Error) => void) => void;
export type InstrumentSyncCallback = (span: Span) => any;
export type InstrumentAsyncCallback = (span: Span) => Promise<any>;

export interface InjectorTracer {
  init: (environment: NodeJS.ProcessEnv, logger?: Logger) => JaegerTracer;
  stop: (tracer: JaegerTracer, next: () => void) => void;
}
export type InjectorTracers = { [key: string]: InjectorTracer };
