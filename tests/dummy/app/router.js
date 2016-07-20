import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('route1');
  this.route('route2');
  this.route('route3');

  this.route('route4', function() {
    this.route('index');
    this.route('child');
  });
});

export default Router;
