import Ember from 'ember';

const {
  Component,
  get
} = Ember;

export default Component.extend({
  actions: {
    trackEvent(customlink) {
      get(this, 'analytics').trackEvent({
        id: 'menu',
        properties: { customlink }
      });
    }
  }
});
