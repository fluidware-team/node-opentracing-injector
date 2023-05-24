import { initTracerFromEnv, JaegerTracer, Logger, TracingConfig, TracingOptions } from 'jaeger-client';

export default {
  init: function (environment: NodeJS.ProcessEnv, logger?: Logger) {
    const { npm_package_name, npm_package_version, JAEGER_SERVICE_NAME } = environment;
    const config: TracingConfig = {};
    const options: TracingOptions = {
      logger
    };
    if (JAEGER_SERVICE_NAME) {
      config.serviceName = JAEGER_SERVICE_NAME;
    }
    if (npm_package_name) {
      if (!config.serviceName) config.serviceName = npm_package_name;
      options.tags = {
        [`${npm_package_name}.version`]: npm_package_version
      };
    }
    return initTracerFromEnv(config, options);
  },
  stop: function (tracer: JaegerTracer, next: () => void) {
    tracer.close(next);
  }
};
