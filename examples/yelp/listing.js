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
            $('.pagination-links > li > a').each(function() {
                var url = 'http://www.yelp.com' + this.attr('href');
                results.push({
                    type: 'url',
                    url: url,
                    processor: 'yelp.listing'
                });
            });

            // Process results
            $('.search-result').each(function () {
                var result = {};

                // Name
                result.businessName = $(this).find('h3 > span > a').text();
                result.detailUrl = 'http://www.yelp.com' + $(this).find('h3 > span > a').attr('href');

                // Phone number
                var tmp = $(this).find('.biz-phone').text();
                tmp = tmp.replace(/\D/g, '');
                tmp = parseInt(tmp, 10);
                result.phoneNumber = tmp;

                // Reviews
                result.reviews = {};

                // Number of reviews
                tmp = $(this).find('.review-count').text();
                tmp = tmp.slice(14, -14);
                tmp = parseInt(tmp, 10);
                result.reviews.number = tmp;

                // Stars
                tmp = $(this).find('.star-img').attr('title');
                tmp = tmp.slice(0, -12);
                tmp = parseFloat(tmp);
                result.reviews.stars = tmp;

                // Address
                result.address = {};

                // Neighborhood street
                tmp = $(this).find('.neighborhood-str-list').text();
                tmp = tmp.slice(13, -8);
                result.address.neighborhoodStr = tmp;

                // Full address
                tmp = $(this).find('address').text();
                tmp = tmp.slice(13, -10);
                result.address.fullAddress = tmp;

                // Category
                var categories = [];
                $(this).find('.category-str-list a').each(function () {
                    var category = this.text();
                    categories.push(category);
                });

                result.categories = categories;

                result.listingUrl = item.url;

                results.push({
                    type: 'url',
                    url: result.detailUrl,
                    processor: 'yelp.details',
                    data: result
                });
            });

            return results;
        };
    });
}());
