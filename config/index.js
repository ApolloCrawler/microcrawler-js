export default {
  client: 'superagent', // Can be 'superagent' or 'simple'

  timeout: 10 * 1000, // HTTP request timeout in msec

  throttler: {
    enabled: false, // use throttler
    active: true,   // set false to pause queue
    rate: 20,       // how many requests can be sent every `ratePer`
    ratePer: 1000,  // number of ms in which `rate` requests may be sent
    concurrent: 8   // how many requests can be sent concurrently
  },

  retry: {
    count: 2  // One regular attempt + 2 retries => 3 total attempts
  },

  headers: {
    'Accept': '*/*',
    'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    'From': 'googlebot(at)googlebot.com'
  },

  proxy: {
    enabled: false,

    // See http://proxylist.hidemyass.com/
    list: [
      'https://168.63.20.19:8145'
    ]
  },

  natFaker: {
    enabled: true,
    base: '192.168.1.1',
    bits: 16
  },

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
