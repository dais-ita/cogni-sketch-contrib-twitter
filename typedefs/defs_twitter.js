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
 * @file Contains only typedefs, specifically those relating to the twitter plugin.
 *
 * @author Dave Braines
 * @status Complete
 **/

/**
 * Standard twitter parameters that are sent to the server, and then returned to the client callback as context for
 * the response.
 *
 * @typedef csTweetParams
 * @type {object}
 * @property {object} settings      the settings from the tweet palette item
 * @property {csNode} node          the tweet node.
 * @property {string} url           the twitter url for this tweet.
 * @property {boolean} firstTime    whether this is the first time this tweet node has been requested.
 */

/**
 * A simple object to contain all relevant information extracted from simple processing of the tweet html.
 *
 * @typedef csProcessedTweet
 * @type {object}
 * @property {string} tweetText     the raw text of the tweet.
 * @property {string} signature     the signature (author name) of the tweet.
 * @property {string} date          the date on which the tweet was sent.
 * @property {string[]} [hashtags]  a list of any hashtags included in the tweet.
 * @property {string[]} [images]    a list of any image urls included in the tweet.
 */

