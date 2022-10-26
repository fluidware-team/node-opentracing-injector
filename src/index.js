import { FORMAT_TEXT_MAP, FORMAT_HTTP_HEADERS, Tags, Tracer } from 'opentracing';
import { getTracerInitiator } from './tracers';
import { EnvParse } from './utils/envUtils';

let tracer;

export const initOpenTracer = function (environment, logger = false) {
  const { OPENTRACING_DISABLE, OPENTRACING_CLIENT_NAME } = environment || process.env;
  if (EnvParse.envBool(OPENTRACING_DISABLE) || !OPENTRACING_CLIENT_NAME) {
    tracer = new Tracer();
    return tracer;
  }
  const initiator = getTracerInitiator(OPENTRACING_CLIENT_NAME);
  tracer = initiator.init(environment, logger);
  process.on('SIGINT', function () {
    initiator.stop(tracer, function () {
      process.exit(0);
    });
  });
  return tracer;
};

export const getOpenTracer = function () {
  if (!tracer) {
    throw new Error('tracer not initialized. Call initOpenTracer()');
  }
  return tracer;
};

export const startSpanWithTags = function (spanName, spanOpts = {}, tags = {}) {
  const span = tracer.startSpan(spanName, spanOpts || {});
  if (tags && typeof tags === 'object') {
    Object.keys(tags).forEach(k => {
      span.setTag(k, tags[k]);
    });
  }
  return span;
};

export const extractSpanFromData = function (data, spanName, tags) {
  const spanOpts = {};
  if (data.trace) {
    const parentSpan = tracer.extract(FORMAT_TEXT_MAP, data.trace);
    if (parentSpan) {
      spanOpts.childOf = parentSpan;
    }
  }
  return startSpanWithTags(spanName, spanOpts, tags);
};

export const extractSpanFromHeaders = function (headers, spanName, tags) {
  const spanOpts = {};
  const parentSpan = tracer.extract(FORMAT_HTTP_HEADERS, headers);
  if (parentSpan) {
    spanOpts.childOf = parentSpan;
  }
  return startSpanWithTags(spanName, spanOpts, tags);
};

export const injectSpanIntoHeaders = function (span, headers = {}) {
  span.setTag(Tags.SPAN_KIND, Tags.SPAN_KIND_RPC_CLIENT);
  // Send span context via request headers (parent id etc.)
  tracer.inject(span, FORMAT_HTTP_HEADERS, headers);
  return headers;
};

export const injectSpanIntoData = function (span, data = {}) {
  span.setTag(Tags.SPAN_KIND, Tags.SPAN_KIND_MESSAGING_PRODUCER);
  // Send span context via data map (parent id etc.)
  tracer.inject(span, FORMAT_TEXT_MAP, data.trace);
  return data;
};

export const instrumentSync = function (spanName, spanOpts, tags = {}, func) {
  const span = startSpanWithTags(spanName, spanOpts, tags);
  let ret;
  try {
    ret = func(span);
  } catch (e) {
    span.setTag(Tags.ERROR, true);
    span.log({
      event: 'error',
      error_message: e.message,
      'error.object': e
    });
    throw e;
  } finally {
    span.finish();
  }
  return ret;
};

export const instrumentCallback = function (spanName, spanOpts, tags = {}, cb) {
  const span = startSpanWithTags(spanName, spanOpts, tags);
  if (!cb || typeof cb !== 'function') {
    throw new Error('callback is required and must be a function');
  }
  cb(span, function (err) {
    if (err) {
      span.setTag(Tags.ERROR, true);
      span.log({
        event: 'error',
        error_message: e.message,
        'error.object': err
      });
    }
    span.finish();
  });
};

export const instrumentAsync = async function (spanName, spanOpts, tags = {}, func) {
  const span = startSpanWithTags(spanName, spanOpts, tags);
  let ret;
  try {
    ret = await func(span);
  } catch (e) {
    span.setTag(Tags.ERROR, true);
    span.log({
      event: 'error',
      error_message: e.message,
      'error.object': e
    });
    throw e;
  } finally {
    span.finish();
  }
  return ret;
};

export const tracingMiddleware = function (req, res, next, reqPropertyName = 'parentSpan') {
  const span = extractSpanFromHeaders(req.headers, 'http request', {
    'http.url': req.originalUrl,
    'http.method': req.method,
    'http.host': req.hostname
  });
  req[reqPropertyName] = span;
  const { end } = res;
  res.end = function (chunk, encoding) {
    res.end = end;
    res.end(chunk, encoding);
    span.setTag('http.statusCode', res.statusCode);
    span.finish();
  };
  setImmediate(next);
};
