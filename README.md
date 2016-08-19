# ember-analytics-tracker

Provides a generic way to define properties for tracking analytics using (`google-analytics` or `google-tag-manager` etc).

## How to do?

1. Choose the type of tool you want to use for tracking analytics in your ember application. (`google-analytics` or `google-tag-manager` etc).
2. Include the corresponding `javascript` libraries in `vendor` directory or add script tag under `head` of `index.html`.
3. Define the corresponding adapters in `config/environment.js` under property `analyticsAdapters`.
4. Generate `analytics-adapter` file for each adapters using blueprint `ember g analytics-adapter <adapter-name>`.
5. Generate `analytics-param` file for each adapters using blueprint `ember g analytics-param <adapter-name>`.

### Configuration

Configure `adapters` in `config/environment.js`.

```
module.exports = function(environment) {
  var ENV = {
    emberAnalyticsTracker: {
      adapters: [
        {
          name: 'googleAnalytics',
          config: {}
        }
      ]
    }
  };
}

```

1. `name` - String - Name of the adapter. Camel Case it.
2. `config` - Object - Config parameters used by analytics tool.

### Generating Parameters

Generate parameter file using `ember g analytics-param <adapter-name>`.

`<adapter-name>` - This needs to be dasherized adapter name defined in `config/environment.js`. For example, if name of adapter in `config/environment.js` is `googleAnalytics` then this will be `google-analytics`.

Once you run the blueprint `ember g analytics-param google-analytics`. This will create a directory `analytics-params` under which you can see the file `google-analytics.js` with below content.

```
export default {
  global: {

  },

  application: {

  }
};

```

`application` - Under which we need to define all analytics properties matching your route structure.

For example: If your routing structure defined in `router.js` is as like below.

```
import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('route1');
  this.route('route2');

  this.route('route3', function() {
    this.route('index');
    this.route('child');
  });
});

export default Router;

```

Then `analytics-params/google-analytics.js` needs to look like below.

```
export default {
  global: {

  },

  application: {
    _: { app: 'EmberAnalyticsTracker' },

    route1: {
      _: { page: 'Route1', title: 'Route1Title' }
    },

    route2: {
      _: { page: 'Route2', title: 'Route2Title' }
    },

    route3: {
      _: { page: 'Route3' },

      index: {
        _: { title: 'Route3IndexTitle' },
      },

      child: {
        _: { title: 'Route3ChildTitle' },
      }
    }
  }
};

```

When route transition happens to any route then all the properties defined under `_` will be merged and send to analytics.

1. On `route1` transition `{ app: 'EmberAnalyticsTracker', page: 'Route1', title: 'Route1Title' }`.
2. On `route2` transition `{ app: 'EmberAnalyticsTracker', page: 'Route2', title: 'Route2Title' }`.
3. On `route3.index` transition `{ app: 'EmberAnalyticsTracker', page: 'Route3', title: 'Route3IndexTitle' }`.
4. On `route3.child` transition `{ app: 'EmberAnalyticsTracker', page: 'Route3', title: 'Route3ChildTitle' }`.

#### How to define parameters for ember action?

For example: If your `route3.child` has a button.

```
// app/templates/route3/child.hbs

<button {{action 'doTrack'}}>Track</button>

// app/controllers/route3/child.js

export default Ember.Controller.extend({

  actions: {
    doTrack() {

    }
  }
});

```

In order to define analytics properties for `doTrack` action do the below in `analytics-params/google-analytics.js`

```
export default {
  global: {

  },

  application: {
    _: { app: 'EmberAnalyticsTracker' },

    ...

    route3: {
      _: { page: 'Route3' },

      child: {
        _: { title: 'Route3ChildTitle' },

        doTrack: { action: 'onclick' }
      }
    }
  }
};

```

If you click the button then `{ app: 'EmberAnalyticsTracker', page: 'Route3', title: 'Route3ChildTitle', action: 'onclick' }` will be send as an analytics properties.

#### How to send custom events with custom properties.

For example: If your `route3.child` has a another button.

```
// app/templates/route3/child.hbs

<button {{action 'doTrack'}}>Track</button>
<button {{action 'doTrackCustom'}}>Track Custom</button>

// app/controllers/route3/child.js

export default Ember.Controller.extend({

  actions: {
    doTrack() {

    },

    doTrackCustom() {

      this.get('analytics').trackEvent({
        id: 'myCustomEvent',
        properties: {
          dynamicproperty: 'dynamicpropertyvalue'  
        }
      });
    }
  }
});

```

```
export default {
  global: {

  },

  application: {
    _: { app: 'EmberAnalyticsTracker' },

    ...

    route3: {
      _: { page: 'Route3' },

      child: {
        _: { title: 'Route3ChildTitle' },

        doTrack: { action: 'onclick' },

        myCustomEvent: { action: 'customevent' }
      }
    }
  }
};

```

If you click the button then `{ app: 'EmberAnalyticsTracker', page: 'Route3', title: 'Route3ChildTitle', action: 'customevent', dynamicproperty: 'dynamicpropertyvalue' }` will be send as an analytics properties.

#### How to send dynamic properties for page load event.

So far we discussed how to send dynamic property for custom event, but what needs to be done if you want to send dynamic properties during page load.

Define a property under your route's model in the name `<adapter-name>PageProperties`. In case of `googleAnalytics` as adapter name it will be `googleAnalyticsPageProperties`.

```
// app/routes/route2.js

export default Route.extend({
  model() {
    return Ember.Object.create({
      googleAnalyticsPageProperties: {
        myparam: 'route2myparam'
      }
    });
  }
});

```

If transition to `route2` happens then `{ app: 'EmberAnalyticsTracker', page: 'Route2', title: 'Route2Title', myparam: 'route2myparam' }`  will be send as an analytics properties.

Now you can also define analytics page properties in the controller. Define a property under your controller in the name `<adapter-name>PageProperties`. In case of `googleAnalytics` as adapter name it will be `googleAnalyticsPageProperties`.

```
// app/controllers/route2.js

export default Controller.extend({
  googleAnalyticsPageProperties: {
    mycontrollerparam: 'route2mycontrollerparam'
  }
});

```

If transition to `route2` happens then `{ app: 'EmberAnalyticsTracker', page: 'Route2', title: 'Route2Title', myparam: 'route2myparam', mycontrollerparam: 'route2mycontrollerparam' }`  will be send as an analytics properties.

#### How to disable page load analytics tracking event for a route.

In your route define `<adapter-name>RouteConfig` property, which needs to be an object with `trackPage: false`. The below will disable page load analytics tracking for route1.

```
// app/routes/route1.js

export default Route.extend({
  googleAnalyticsRouteConfig: {
    trackPage: false
  }
});

```

#### What is `global` under parameters file?

So far we discussed what needs to be defined under `application` of `analytics-params/<adapter-name>.js` file, but what about `global`.

If you have any action or custom events under components, and you feel that component will be used in different routes of the application and i all these cases you want to trigger same properties, then define them under `global`.

```
export default {
  global: {
    componentAction: { action: 'mycompoentaction' }
  }
};

```

### Generating adapters

Generate parameter file using `ember g analytics-adapter <adapter-name>`.

`<adapter-name>` - This needs to be dasherized adapter name defined in `config/environment.js`. For example, if name of adapter in `config/environment.js` is `googleAnalytics` then this will be google-analytics.

Once you run the blueprint `ember g analytics-adapter google-analytics`. This will create a directory `analytics-adapters` under which you can see the file `google-analytics.js` with below content.

```
import Ember from 'ember';
import BaseAdapter from 'ember-analytics-tracker/analytics-adapters/base';

const {
  get,
  getWithDefault
} = Ember;

export default BaseAdapter.extend({

  trackPage() {
    const canTrackPage = get(this, 'canTrackPage');
    const param = this.getPageParam();

    if (canTrackPage) {
      // Your implementation goes here
    }
  },

  trackEvent(options={}) {
    const { id, properties } = options;
    const routeConfig = getWithDefault(this, 'routeConfig', {});
    let param;

    delete options.id;

    param = this.getParam(id, properties);

    if (getWithDefault(routeConfig, id, true)) {
      // Your implementation goes here
    }
  }
});
```

* variables `param` in `trackPage` and `trackEvent` holds properties that needs to be passed for analytics.
* Replace `// Your implementation goes here` with your corresponding logics based on adapter.


### Note:
Use `ember-link-action` addon for invoking click action over `link-to` if needed.
Use `ember-composable-helpers` addon for action piping if needed.

## Installation

* `git clone` this repository
* `npm install`
* `bower install`

## Running

* `ember server`
* Visit your app at http://localhost:4200.
