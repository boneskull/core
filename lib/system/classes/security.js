module.exports = {
  $singleton: true,
  $deps: [
    {
      'lusca': 'lusca'
    }, {
      'cors': 'cors'
    }
  ],
  $setup: function(sx) {
    var config, csp;
    config = sx.config('security').env();
    if (config.get('csrf') === true) {
      sx.app.use(this.$.cors());
    }
    if ((csp = config.get('csp')) && (csp.enabled === true)) {
      return config.sx.app.use(this.$.lusca.csp(config.get('csp')));
    }
  }
};
