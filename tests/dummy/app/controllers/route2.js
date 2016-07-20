import Ember from 'ember';

export default Ember.Controller.extend({

  actions: {
    mybutton() {

    },

    mycustomeventbutton() {
      this.get('analytics').trackEvent({
        id: 'mycustomevent',
        properties: {
          mycustom: 'mycustomproperties'
        }
      });
    }
  }

});
