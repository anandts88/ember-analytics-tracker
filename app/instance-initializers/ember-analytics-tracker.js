import Ember from 'ember';

const {
  ActionHandler,
  Router,
  get,
  getWithDefault,
  set,
  inject,
  on,
  run
} = Ember;

const {
  scheduleOnce
} = run;

const {
  service
} = inject;

export function initialize() {
  const application = arguments[1] || arguments[0];

  Router.reopen({
    analytics: service(),

    injectRouter: on('didTransition', function() {
      const analytics = get(this, 'analytics');

      set(analytics, 'currentRouteName', getWithDefault(this, 'currentRouteName', 'unknown'));

      this._trackPage();
    }),

    _trackPage() {
      scheduleOnce('afterRender', this, () => {
        get(this, 'analytics').trackPage();
      });
    }
  });

  ActionHandler.reopen({
    analytics: service(),

    send(actionName) {
      get(this, 'analytics').trackEvent({ id: actionName });
      this._super(...arguments);
    }
  });
}

export default {
  name: 'ember-analytics-tracker',
  initialize
};
