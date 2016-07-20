import Ember from 'ember';
import getOwner from 'ember-getowner-polyfill';

const {
  Service,
  setProperties,
  getWithDefault,
  assert,
  get,
  set,
  getProperties,
  copy,
  typeOf,
  A: emberArray,
  String: { dasherize },
  run
} = Ember;

const { keys } = Object;

const {
  scheduleOnce
} = run;

const assign = Ember.assign || Ember.merge;

export default Service.extend({
  currentRouteName: 'unknown',

  /**
   * Cached adapters to reduce multiple expensive lookups.
   *
   * @property _adapters
   * @private
   * @type Object
   * @default null
   */
  _adapters: null,

  /**
   * Contextual information attached to each call to an adapter. Often you'll
   * want to include things like `currentUser.name` with every event or page
   * view  that's tracked. Any properties that you bind to `analytics.context`
   * will be merged into the options for every service call.
   *
   * @property context
   * @type Object
   * @default null
   */
  context: null,

  /**
   * Indicates whether calls to the service will be forwarded to the adapters
   *
   * @property enabled
   * @type Boolean
   * @default true
   */
  enabled: true,

  /**
   * When the Service is created, activate adapters that were specified in the
   * configuration. This config is injected into the Service as
   * `options`.
   *
   * @method init
   * @param {Void}
   * @return {Void}
   */
  init() {
    const adapters = getWithDefault(this, 'options.analyticsAdapters', emberArray());
    const owner = getOwner(this);

    owner.registerOptionsForType('ember-analytics-tracker@analytics-adapter', { instantiate: false });
    owner.registerOptionsForType('analytics-adapter', { instantiate: false });

    owner.registerOptionsForType('ember-analytics-tracker@analytics-param', { instantiate: false });
    owner.registerOptionsForType('analytics-param', { instantiate: false });

    owner.registerOptionsForType('ember-analytics-tracker@analytics-param-handler', { instantiate: false });
    owner.registerOptionsForType('analytics-param-handler', { instantiate: false });

    setProperties(this, {
      appEnvironment: getWithDefault(this, 'options.environment', 'development'),
      _adapters: {},
      context: {}
    });

    this.activateAdapters(adapters);
    this._super(...arguments);
  },

  identify(...args) {
    this.invoke('identify', ...args);
  },

  alias(...args) {
    this.invoke('alias', ...args);
  },

  trackEvent(...args) {
    this.invoke('trackEvent', ...args);
  },

  trackPage(...args) {
    this.invoke('trackPage', ...args);
  },

  /**
   * Instantiates the adapters specified in the configuration and caches them
   * for future retrieval.
   *
   * @method activateAdapters
   * @param {Array} adapterOptions
   * @return {Object} instantiated adapters
   */
  activateAdapters(adapterOptions = []) {
    const appEnvironment = get(this, 'appEnvironment');
    const cachedAdapters = get(this, '_adapters');
    const activatedAdapters = {};

    adapterOptions
      .filter((adapterOption) => this._filterEnvironments(adapterOption, appEnvironment))
      .forEach((adapterOption) => {
        const { name } = adapterOption;
        const adapter = cachedAdapters[name] ? cachedAdapters[name] : this._activateAdapter(adapterOption);

        set(activatedAdapters, name, adapter);
      });

    return set(this, '_adapters', activatedAdapters);
  },

  /**
   * Invokes a method on the passed adapter, or across all activated adapters if not passed.
   *
   * @method invoke
   * @param {String} methodName
   * @param {Rest} args
   * @return {Void}
   */
  invoke(methodName, options={}) {
    scheduleOnce('afterRender', this, () => {
      if (!get(this, 'enabled')) { return; }

      const cachedAdapters = get(this, '_adapters');
      const allAdapterNames = keys(cachedAdapters);
      const context = copy(get(this, 'context'));
      const { adapters } = options;
      let selectedAdapterNames = allAdapterNames;
      let mergedOptions;

      if (typeOf(adapters) === 'string') {
        selectedAdapterNames = [adapters];
      } else if (typeOf(adapters) === 'array') {
        selectedAdapterNames = adapters;
      }

      delete options.adapters;

      mergedOptions = assign(context, options);

      selectedAdapterNames
        .map((adapterName) => get(cachedAdapters, adapterName))
        .forEach((adapter) => {
          if (adapter) {
            setProperties(adapter, getProperties(this, ['currentRouteName']));
            adapter[methodName](mergedOptions);
          }
        });
    });
  },

  /**
   * On teardown, destroy cached adapters together with the Service.
   *
   * @method willDestroy
   * @param {Void}
   * @return {Void}
   */
  willDestroy() {
    const cachedAdapters = get(this, '_adapters');

    for (let adapterName in cachedAdapters) {
      get(cachedAdapters, adapterName).destroy();
    }
  },

  /**
   * Instantiates an adapter if one is found.
   *
   * @method _activateAdapter
   * @param {Object}
   * @private
   * @return {Adapter}
   */
  _activateAdapter({ name, config } = {}) {
    const Adapter = this._lookup(name);
    const param = this._lookup(name, 'analytics-param');
    const handler = this._lookup(name, 'analytics-param-handler');

    return Adapter.create({ this, config, param, name, handler });
  },

  /**
   * Looks up the adapter from the container. Prioritizes the consuming app's
   * adapters over the addon's adapters.
   *
   * @method _lookupAdapter
   * @param {String} adapterName
   * @private
   * @return {Adapter} a local adapter or an adapter from the addon
   */
  _lookup(name, blueprint='analytics-adapter') {
    const owner = getOwner(this);
    assert(`[ember-analytics-tracker] Could not find ${blueprint} without a name.`, name);

    const dasherized = dasherize(name);
    const remote = owner.lookup(`ember-analytics-tracker@${blueprint}:${dasherized}`);
    const local = owner.lookup(`${blueprint}:${dasherized}`);

    return local ? local : remote;
  },

  /**
   * Predicate that Filters out adapters that should not be activated in the
   * current application environment. Defaults to all environments if the option
   * is `all` or undefined.
   *
   * @method _filterEnvironments
   * @param {Object} adapterOption
   * @param {String} appEnvironment
   * @private
   * @return {Boolean} should an adapter be activated
   */
  _filterEnvironments(adapterOption, appEnvironment) {
    let { environments } = adapterOption;
    environments = environments || ['all'];
    const wrappedEnvironments = emberArray(environments);

    return wrappedEnvironments.contains('all') || wrappedEnvironments.contains(appEnvironment);
  }

});
