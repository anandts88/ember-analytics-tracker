import config from '../config/environment';

export function initialize() {
  const application = arguments[1] || arguments[0];
  const { analyticsAdapters = [] } = config;
  const { environment = 'development' } = config;
  const options = { analyticsAdapters, environment };

  application.register('config:analytics', options, { instantiate: false });
  application.inject('service:analytics', 'options', 'config:analytics');

  application.inject('route', 'analytics', 'service:analytics');
  application.inject('controller', 'analytics', 'service:analytics');
  application.inject('component', 'analytics', 'service:analytics');
}

export default {
  name: 'analytics',
  initialize
};
