import Ember from 'ember';
<%= importStatement %>

const {
  get,
  getWithDefault
} = Ember;

export default <%= baseClass %>.extend({

  trackPage() {
    const canTrackPage = get(this, '<%= canTrackPage =>');
    const param = this.getPageParam();

    if (canTrackPage) {
      // Your implemetation goes here
    }
  },

  trackEvent(options={}) {
    const { id } = options;
    const routeConfig = getWithDefault(this, 'routeConfig', {});
    let param;

    delete options.id;

    param = this.getParam(id, options);

    if (getWithDefault(routeConfig, id, true)) {
      // Your implemetation goes here
    }
  }
});
