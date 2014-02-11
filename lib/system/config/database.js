module.exports = {
  '*': {
    redis: {

      /*
      host: 'localhost'
      port : 6379
      password: 'password'
      database: 0
      options: {}
       */
    },
    mongodb: {

      /*
      url: 'mongodb://user:pass@localhost:27017/dbname'
       */
    },
    firebird: {

      /*
      database: '/tmp/path/to.fdb'
       */
    },
    mysql: {

      /*
      database: 'myapp_test'
      username: 'root'
      password: 'password'
      collation: 'utf8mb4_general_ci'
       */
    },
    nano: {

      /*
      url: 'http://localhost:5984/nano-test'
       */
    },
    postgres: {

      /*
      database: 'myapp_test'
      username: 'postgres'
      host: 'localhost'
      port: 5432
      password: "password"
      database: "database"
      ssl: true
      debug: false
       */
    },
    rethink: {

      /*
      host: "localhost",
      port: 28015,
      database: "test",
      poolMin: 1,
      poolMax: 10
       */
    },
    sqlite3: {
      database: ':memory:'
    },
    neo4j: {

      /*
      url : 'http://localhost:7474/'
       */
    }
  },
  development: {},
  production: {}
};
