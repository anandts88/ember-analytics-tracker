import Ember from 'ember';
<%= importStatement %>

const {
  get,
  getWithDefault
} = Ember;

export default <%= baseClass %>.extend({

  trackPage() {
    const canTrackPage = get(this, '<%= canTrackPage =>');
    const param = this.<%= pageParam %>();

    if (canTrackPage) {
      // Your implemetation goes here
    }
  },

  trackEvent(options={}) {
    const { <%= analyticsId %> } = options;
    const <%= routeConfig %> = getWithDefault(this, '<%= routeConfig %>', {});
    let param;

    delete options.<%= analyticsId %>;

    param = this.<%= param %>(<%= analyticsId %>, options);

    if (getWithDefault(<%= routeConfig %>, <%= analyticsId %>, true)) {
      // Your implemetation goes here
    }
  }
});
