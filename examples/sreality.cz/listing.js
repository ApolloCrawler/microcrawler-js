// Copyright, 2013-2016, by Tomas Korcak. <korczis@gmail.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

var querystring = require('querystring');
var url = require('url');

var exports = module.exports = function($, item) {
  var results = [];

  $('a.btn-paging').each(function() {
    var tmpUrl = 'http://sreality.cz' + $(this).attr('href') + '&_escaped_fragment_=';
    var parsedUrl = url.parse(tmpUrl);

    results.push({
      type: 'url',
      url: tmpUrl,
      processor: 'sreality.cz.listing'
    });
  });

  $('span.basic > h2 > a').each(function() {
    var tmpUrl = 'http://sreality.cz' + $(this).attr('href') + '?blah=1&_escaped_fragment_=';
    var parsedUrl = url.parse(tmpUrl);

    results.push({
      type: 'url',
      url: tmpUrl,
      processor: 'sreality.cz.details'
    });
  });

  return results;
};
