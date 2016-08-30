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

var exports = module.exports = function($, doc, result) {
  if(!result) {
    result = {};
  }

  // Address
  result.address = {};

  // Neighborhood street
  var tmp = $(doc).find('.neighborhood-str-list').text();
  tmp = tmp.slice(13, -8);
  result.address.neighborhoodStr = tmp;

  // Full address
  tmp = $(doc).find('address').text();
  tmp = tmp.slice(13, -10);
  result.address.fullAddress = tmp;

  return result;
};

var extractCategories = function($, doc, result) {
  var categories = [];
  $(doc).find('.category-str-list a').each(function () {
    var category = $(this).text();
    categories.push(category);
  });

  result.categories = categories;

  return result;
};

var extractName = function($, doc, result) {
  result.businessName = $(doc).find('h3 > span > a').text();
  result.detailUrl = 'http://www.yelp.com' + $(doc).find('h3 > span > a').attr('href');

  return result;
};

var extractPhone = function($, doc, result) {
  // Phone number
  var tmp = $(doc).find('.biz-phone').text();
  tmp = tmp.replace(/\D/g, '');
  tmp = parseInt(tmp, 10);

  result.phoneNumber = tmp;

  return result;
};

var extractReviews = function($, doc, result) {
  // Reviews
  result.reviews = {};

  // Number of reviews
  var tmp = $(doc).find('.review-count').text();
  tmp = tmp.slice(14, -14);
  tmp = parseInt(tmp, 10);

  result.reviews.number = tmp;

  return result;
};

var extractStars = function($, doc, result) {
  // Stars
  var tmp = $(doc).find('.star-img').attr('title');
  tmp = tmp.slice(0, -12);
  tmp = parseFloat(tmp);
  result.reviews.stars = tmp;

  return result;

};

module.exports = function($, item) {
  var results = [];

  // Process pagination
  $('.pagination-links > li > a').each(function() {
    var url = 'http://www.yelp.com' + $(this).attr('href');
    results.push({
      type: 'url',
      url: url,
      processor: 'yelp.listing'
    });
  });

  // Process results
  $('.search-result').each(function () {
    var result = {};

    result.listingUrl = item.url;

    result = extractName($, this, result);

    result = extractPhone($, this, result);

    result = extractReviews($, this, result);

    result = extractStars($, this, result);

    result = extractAddress($, this, result);

    result = extractCategories($, this, result);

    results.push({
      type: 'url',
      url: result.detailUrl,
      processor: 'yelp.details',
      data: result
    });
  });

  return results;
};
