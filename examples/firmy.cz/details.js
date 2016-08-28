// Copyright, 2013-2015, by Tomas Korcak. <korczis@gmail.com>
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

import querystring from 'querystring';
import url from 'url';

export default function($, item) {
  const categories = [];

  $('li.category > a').map(function() {
    categories.push($(this).text());
  });

  const res = [{
    type: 'data',
    data: {
      name: $('div.box > h1').text().replace(/(\r\n|\n|\r|\t)/gm, ''),
      url: $('#companyUrl').attr('href'),
      phone: $('div[itemprop="telephone"]').text(),
      email: $('a.companyMail').text(),
      address: {
        street: $('div[itemprop="streetAddress"]').text(),
        postalCode: $('div[itemprop="postalCode"]').text(),
        city: $('div[itemprop="addressLocality"]').text()
      },
      description: $('p[itemprop="description"]').text(),
      logo: $('img[itemprop="logo"]').attr('src'),
      category: categories[0],
      categories
    }
  }];

  return res;
};
