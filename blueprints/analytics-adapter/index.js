/*jshint node:true*/
module.exports = {
  description: 'Generates an ember-analytics-tracker adapter.',

  locals: function(options) {
    var importStatement = "import BaseAdapter from 'ember-analytics-tracker/analytics-adapters/base';";
    var baseClass = 'BaseAdapter';
    var toStringExtension = 'return ' + "'" + options.entity.name + "';";
    // Return custom template variables here.
    return {
      importStatement: importStatement,
      pageParam: 'getPageParam',
      param: 'getParam',
      canTrackPage: 'canTrackPage',
      analyticsId: 'id',
      routeConfig: 'routeConfig',
      baseClass: baseClass,
      toStringExtension: toStringExtension
    };
  }
};
