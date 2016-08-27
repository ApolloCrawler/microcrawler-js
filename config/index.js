export default {
  amqp: {
    uri: 'amqp://korczis.com',
    queues: {
      collector: 'collector',
      worker: 'worker'
    }
  },

  couchbase: {
    uri: 'couchbase://korczis.com:8091',

    bucket: 'microcrawler',
    username: 'Administrator',
    password: 'Administrator',

    // NOTE: Times are in usec
    connectionTimeout: 60 * 1000 * 1000,
    durabilityTimeout: 60 * 1000 * 1000,
    managementTimeout: 60 * 1000 * 1000,
    nodeConnectionTimeout: 10 * 1000 * 1000,
    operationTimeout: 10 * 1000 * 1000,
    viewTimeout: 10 * 1000 * 1000
  },

  elasticsearch: {
    uri: 'korczis.com:9200',
    index: 'microcrawler',
    log: 'debug'
  }
}
