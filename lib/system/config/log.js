module.exports = {
  '*': {
    console: {
      enable: true,
      level: 'warn'
    },
    file: {
      enable: false
    },
    memory: {
      enable: false
    },
    http: {
      enable: false
    },
    webhook: {
      enable: false
    },
    daily: {
      enable: false
    }
  },
  development: {
    console: {
      level: 'verbose'
    }
  }
};
