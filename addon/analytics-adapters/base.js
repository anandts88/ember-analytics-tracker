import Ember from 'ember';
import getOwner from 'ember-getowner-polyfill';

const {
  Object: EmberObject,
  K,
  get,
  getWithDefault,
  computed,
  computed: { alias },
  defineProperty,
  typeOf,
  isEmpty,
  String: { camelize },
  merge,
  assign: emberAssign
} = Ember;

const {
  keys
} = Object;

const assign = emberAssign || merge;

export default EmberObject.extend({
  properties: undefined,
  name: undefined,
  currentRouteName: undefined,
  param: undefined,

  identify: K,
  trackEvent: K,
  trackPage: K,
  alias: K,

  /**
   * Controller of the current route.
   *
   * @property model
   * @type Object
   * @default undefined
   */
  controller: alias('route.controller'),
  /**
   * Model of the current route.
   *
   * @property model
   * @type Object
   * @default undefined
   */
  model: alias('controller.model'),

  /**
   * Current Route name
   *
   * @property model
   * @type String
   * @default undefined
   */
  routeName: alias('currentRouteName'),

  pagePropertiesName: computed('name', function() {
    const name = get(this, 'name');

    return camelize(`${name}PageProperties`);
  }),

  routeConfigName: computed('name', function() {
    const name = get(this, 'name');

    return camelize(`${name}RouteConfig`);
  }),

  path: computed('routeName', function() {
    return `application.${get(this, 'routeName')}`;
  }),

  routes: computed('path', function() {
    return get(this, 'path').split('.');
  }),

  route: computed('routeName', function() {
    return this._lookupRoute(get(this, 'routeName'));
  }),

  canTrackPage: computed('routeConfig.trackPage', function() {
     return getWithDefault(this, 'routeConfig.trackPage', true);
  }),

  init() {
    const pagePropertiesName = get(this, 'pagePropertiesName');
    const routeConfigName = get(this, 'routeConfigName');

    this._super(...arguments);

    defineProperty(this, 'pageProperties', alias(`model.${pagePropertiesName}`));
    defineProperty(this, 'pagePropertiesInContoller', alias(`controller.${pagePropertiesName}`));
    defineProperty(this, 'routeConfig', alias(`route.${routeConfigName}`));
  },

  _lookupRoute(routeName) {
    const container = getOwner(this);
    return container.lookup(`route:${routeName}`);
  },

  convertToObject(param, ...args) {
    let _param = param;

    if (typeOf(param) === 'function') {
      _param = param.apply(this, args);
    }

    return _param;
  },

  getGlobalParam() {
    const param = getWithDefault(this, 'param', {});
    const result = getWithDefault(param, 'global', {});

    return result;
  },

  getPathParam() {
    const param = getWithDefault(this, 'param', {});
    let path = get(this, 'path');
    let result = get(param, path);

    if (!result) {
      path = path.replace('.index', '');
      result = get(param, path);
    }

    result = result || {};

    return result;
  },

  getUnderscoreParam(all) {
    const param = getWithDefault(this, 'param', {});
    const routes = get(this, 'routes');
    const pathParam = this.getPathParam();
    let temp = getWithDefault(pathParam, '_', {});
    let route = '';
    let result = {};
    let dot;

    if (all || !isEmpty(keys(temp))) {
      assign(result, getWithDefault(param, '_', {}));

      routes.forEach((name, index) => {
        dot = (index !== 0 ? '.' : '');
        route += `${dot}${name}`;

        assign(result, getWithDefault(param, `${route}._`, {}));
      });
    }

    return result;
  },

  getPageParam(all) {
    const pageParam = getWithDefault(this, 'pageProperties', {});
    const pageParamInContoller = getWithDefault(this, 'pagePropertiesInContoller', {});
    const underscoreParam = this.getUnderscoreParam(all);
    let result = {};

    assign(result, underscoreParam, pageParam, pageParamInContoller);

    return result;
  },

  getParam(id, options={}) {
    const pageParam = this.getPageParam(true);
    const pathParam = this.getPathParam();
    const globalParam = this.getGlobalParam();
    const idPathParam = get(pathParam, id);
    const idGlobalParam = get(globalParam, id);
    let _idParam = idGlobalParam || idPathParam;
    let temp = {};
    let result = {};
    let idParam;

    idParam = this.convertToObject(_idParam, options);

    assign(temp, idParam, options);

    if (!isEmpty(keys(temp))) {
      assign(result, pageParam, idParam);

      if (typeOf(_idParam) !== 'function') {
        assign(result, options);
      }
    }

    return result;
  }

});
