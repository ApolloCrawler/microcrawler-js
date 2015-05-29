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

    define(deps, function() {
        module.exports = function($, item) {
            var results = [];

            // Process pagination
            $('#pagination > a').each(function() {
                var url = "http://youjizz.com" + $(this).attr('href');
                results.push({
                    type: 'url',
                    url: url,
                    processor: 'youjizz.listing'
                });
            });

            // Process results
            $('#miniatura').each(function() {
                var tdoc = $(this);
                var title1 = tdoc.find('span#title1')[0].children[0].data;
                var url = tdoc.find('a')[0].attribs['href'];
                var duration = tdoc.find('span.thumbtime span')[0].children[0].data;
                var views = parseInt(tdoc.find('span.thumbviews span')[0].children[0].data, 10);

                var imgs = [];
                tdoc.find('img.lazy').each(function() {
                    imgs.push($(this).attr('data-original'));
                });

                results.push({
                    type: 'data',
                    data: {
                        title: title1,
                        duration: duration,
                        url: "http://youjizz.com" + url,
                        thumbnails: imgs,
                        views: views,
                        listingUrl: item.url
                    }
                });
            });

            return results;
        };
    });
}());
