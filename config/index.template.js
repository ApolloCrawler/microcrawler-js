export default {
  amqp: {
    uri: 'amqp://<YOUR_AMQP_HOST>',
    queues: {
      collector: 'collector',
      worker: 'worker'
    }
  },

  couchbase: {
    uri: 'couchbase://<YOUR_COUCHBASE_HOST>:8091',

    bucket: '<BUCKER>',
    username: '<USERNAME>',
    password: '<PASSWORD>',

    // NOTE: Times are in usec
    connectionTimeout: 60 * 1000 * 1000,
    durabilityTimeout: 60 * 1000 * 1000,
    managementTimeout: 60 * 1000 * 1000,
    nodeConnectionTimeout: 10 * 1000 * 1000,
    operationTimeout: 10 * 1000 * 1000,
    viewTimeout: 10 * 1000 * 1000
  },

  elastic: {
    host: 'localhost',
    port: 9200
  }
}
