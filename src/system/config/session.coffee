module.exports = 
  secret: 'ABCDFGHIJLMNOPQRSTUVXZ0123456789'
  stores: 
    'mongo':
      enabled: false
      url: 'mongodb://user:pass@localhost:27017/db'
    'redis':
      enabled: false
      host: 'localhost'
      port: 6379
      db: 2
      pass: 'password'
    'native':
      enabled: true