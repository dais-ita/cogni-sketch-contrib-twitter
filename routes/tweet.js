/**
 * MIT License
 *
 * Copyright (c) 2022 International Business Machines
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the
 * Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
 * WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS
 * OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */

/**
 * @file The server-side capabilities of the 'tweet' palette function.
 * @author Dave Braines
 * @status In-progress
 **/

const cs = require.main.require('../cs/cs')();
const express = require.main.require('express');
const router = express.Router();
const got = require.main.require('got');

//TODO: Replace this with a generic "proxy" route since it is just a wrapped http get

router.get('/', function(req, res, next) {
  cs.log.debug('GET - tweet');

  if (cs.security.isLoggedIn(req)) {
    //Due to asynch tweet call the response is returned from inside the function call
    getTweet(req, res);
  } else {
    res.sendStatus(401);
  }
});

function getTweet(req, res) {
  let tgtUrl = `http://publish.twitter.com/oembed?url=${req.query.url}&omit_script=1`;
  //TODO: Abstract this url

  //The response is json
  res.setHeader('content-type', 'application/json');

  //Call twitter and return the response
  (async () => {
    try {
      const response = await got(tgtUrl, {
        'responseType': 'json'
      });

      res.json(response.body);

    } catch (error) {
      res.json(error);
    }
  })();
}

/** Module exports */
module.exports = router;
