import Ember from 'ember';

const {
  Route
} = Ember;

export default Route.extend({
  model() {
    return Ember.Object.create({
      googleAnalyticsPageProperties: {
        myparam: 'route2myparam'
      }
    });
  }
});
