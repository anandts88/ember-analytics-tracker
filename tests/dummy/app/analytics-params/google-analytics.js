export default {
  _: { site: 'Bank' },

  global: {
    menu: { pageTitle: 'menubar' }
  },

  application: {
    _: { section: 'Application' },

    route1: {
      _: { subsection: 'route1' }
    },

    route2: {
      _: { subsection: 'route2' },

      mybutton: { mystatic: 'mystaticparam' },

      mycustomevent: { mycustomevent: true }
    },

    route3: {
      _: { subsection: 'route3' }
    }
  }
};
