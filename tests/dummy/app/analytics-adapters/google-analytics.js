import Ember from 'ember';
import BaseAdapter from 'ember-analytics-tracker/analytics-adapters/base';

const {
  get,
  getWithDefault,
  isEmpty
} = Ember;

const {
  keys
} = Object;

export default BaseAdapter.extend({

  trackPage() {
    const canTrackPage = get(this, 'canTrackPage');
    const param = this.getPageParam();

    if (canTrackPage && !isEmpty(keys(param))) {
      console.log(param);
    }
  },

  trackEvent(options={}) {
    const { id, properties } = options;
    const routeConfig = getWithDefault(this, 'routeConfig', {});
    let param;

    delete options.id;

    param = this.getParam(id, properties);

    if (getWithDefault(routeConfig, id, true) && !isEmpty(keys(param))) {
      console.log(param);
    }
  }
});
