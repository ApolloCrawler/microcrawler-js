import elasticsearch from 'elasticsearch';

import {config as config} from '../config';

export default class Elasticsearch {
  constructor() {
    this._client = new elasticsearch.Client({
      host: config.elasticsearch.uri,
      log: config.elasticsearch.log
    });

    this.client.indices.create({
      index: config.elasticsearch.index
    });
  }

  get client() {
    return this._client;
  }
}
