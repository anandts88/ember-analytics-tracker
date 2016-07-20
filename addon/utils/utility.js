import Ember from 'ember';

const {
  get,
  typeOf,
  getProperties
} = Ember;

const assign = Ember.assign || Ember.merge;

export function getAllProperties(obj={}, computedProperties=[]) {
  const result = {};
  let value;

  for (let key in obj) {
    value = get(obj, key);

    if (obj.hasOwnProperty(key) &&
      key.indexOf('__ember') < 0 &&
      key.indexOf('_super') < 0 &&
      typeOf(value) !== 'function'
    ) {
      result[key] = value;
    }
  }

  assign(result, getProperties(obj, computedProperties));

  for (let key in result) {
    value = get(result, key);

    if (typeOf(value) === 'function') {
      delete result[key];
    }
  }

  return result;
}

export function getComputedProperties(myclass) {
  let result = [];

  myclass.eachComputedProperty((prop) => result.push(prop));

  return result;
}
