import config from '../config/environment';

export function initialize() {
  const application = arguments[1] || arguments[0];
  const { emberAnalyticsTracker={} } = config;
  const { adapters = [] } = emberAnalyticsTracker;
  const { environment = 'development' } = config;
  const analyticsAdapters = adapters;
  const options = { analyticsAdapters, environment };

  delete emberAnalyticsTracker.adapters;

  options.emberAnalyticsTracker = emberAnalyticsTracker;

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
