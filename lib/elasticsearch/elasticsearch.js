'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _elasticsearch = require('elasticsearch');

var _elasticsearch2 = _interopRequireDefault(_elasticsearch);

var _config = require('../../config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Elasticsearch = function () {
  function Elasticsearch() {
    _classCallCheck(this, Elasticsearch);

    this._client = new _elasticsearch2.default.Client({
      host: _config2.default.elasticsearch.uri,
      log: _config2.default.elasticsearch.log
    });

    this.client.indices.create({
      index: _config2.default.elasticsearch.index
    });
  }

  _createClass(Elasticsearch, [{
    key: 'client',
    get: function get() {
      return this._client;
    }
  }]);

  return Elasticsearch;
}();

exports.default = Elasticsearch;