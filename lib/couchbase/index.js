'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _couchbase = require('./couchbase');

Object.keys(_couchbase).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _couchbase[key];
    }
  });
});

var _couchbase2 = _interopRequireDefault(_couchbase);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _couchbase2.default;