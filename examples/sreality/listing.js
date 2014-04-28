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
    var deps = [];
    var result = {};

    define(deps, function () {

        var extractHandle = function ($, doc, result) {
            result.handle = $(doc).find('.fn > a').attr('class').replace('clickHandleLink', '');

            console.log(result);
            return result;
        };

        var extractDate = function ($, doc, result) {

            var currentDate = new Date();

            result.date = currentDate;

            return result;
        };

        var extractDetailUrl = function ($, doc, result) {
            result.detailUrl = 'http://www.sreality.cz' + $(doc).find('h3.fn > a').attr('href');

            return result;
        };

        module.exports = function ($, item) {
            var results = [];

            // Process pagination
            $('#paging a').each(function () {
                var url = 'http://www.sreality.cz' + this.attr('href');
                results.push({
                    type: 'url',
                    url: url,
                    processor: 'sreality.listing'
                });
            });

            // Process results
            $('.result').each(function () {
                var result = {};

                result = extractHandle($, this, result); //done

                result = extractDate($, this, result); //done

                result = extractDetailUrl($, this, result); //done

                results.push({
                    type: 'url',
                    url: result.detailUrl,
                    processor: 'sreality.details',
                    data: result
                });
            });

            return results;
        };
    });
}());
