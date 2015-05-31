// Copyright, 2013-2014, by Tomas Korcak. <korczis@gmail.com>
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

(function () {
    'use strict';

    var define = require('amdefine')(module);

    /**
     * Array of modules this one depends on.
     * @type {Array}
     */
    var deps = [
        'querystring',
        'url'
    ];

    define(deps, function(querystring, url) {
        module.exports = function($, item) {
            var loc = $('span.location').first().text();

            var result = {
                type: 'data',
                data: {
                    Web: item.url,
                    Jmeno: $('div.property-title > h1 > span > span.name').first().text(),
                    Mesto: loc.split(', ')[1],
                    Ulice: loc.split(', ')[0]
                }
            };

            $('ul.params1 > li.param').each(function() {
                var doc = $(this);
                var label = doc.find('label:nth-child(1)').text().replace(':', '');
                var value = doc.find('span:nth-child(1)').text();

                if(label == 'Celková cena' || label == 'Užitná plocha') {
                    value = parseInt(value.match(/\d+/g).join(''))
                }

                result.data[label] = value;
                console.log(label);
            });

            $('ul.params2 > li.param').each(function() {
                var doc = $(this);
                var label = doc.find('label:nth-child(1)').text().replace(':', '');
                var value = doc.find('span:nth-child(1)').text();

                if(label == 'Celková cena' || label == 'Užitná plocha') {
                    value = parseInt(value.match(/\d+/g).join(''))
                }

                result.data[label] = value;
                console.log(label);
            });

            return [result];
        };
    });
}());
