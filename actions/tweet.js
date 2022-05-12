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
 * @file The client-side definition of the 'tweet' palette item.
 * @author Dave Braines
 **/

import {getProject} from "/javascripts/private/state.js";
import {
    registerLabelTextCallback,
    registerNodeIconCallback,
    registerStandardNodeCallbacks
} from "/javascripts/interface/callbackType.js";
import {
    collapseNode,
    putHtml
} from "/javascripts/interface/graphics.js";
import {httpGet} from "/javascripts/interface/http.js";

const TYPE_NAME = 'tweet';

const ICON_NORMAL = './plugins/cogni-sketch-contrib-twitter/images/icon-tweet.svg';
const ALT_NORMAL = 'icon-tweet';
const ICON_BROKEN = './plugins/cogni-sketch-contrib-twitter/images/icon-tweet-broken.svg';
const ALT_BROKEN = 'icon-tweet-broken';

registerStandardNodeCallbacks(TYPE_NAME, handleTweet);
registerNodeIconCallback(TYPE_NAME, cbIcon);
registerLabelTextCallback(TYPE_NAME, cbLabel);

/**
 * Specify the correct icon details to use for this tweet (broken or normal, depending on status).
 *
 * @param {csContext} context   the standard context object.
 * @return {csIcon}             the icon details to use for rendering this node.
 */
function cbIcon(context) {
    let icon;

    if (isBroken(context.node)) {
        icon = {
            "icon": ICON_BROKEN,
            "iconAlt": ALT_BROKEN
        };
    } else {
        icon = {
            "icon": ICON_NORMAL,
            "iconAlt": ALT_NORMAL
        };
    }

    return icon;
}

/**
 * Specify the correct label to use for this tweet.
 *
 * @param {csContext} context   the standard context object.
 * @return {string}             the label to use for rendering this node.
 */
function cbLabel(context) {
    let label = context.node.getLabel() || '';

    if (isBroken(context.node)) {
        label += ' (Tweet has no url)';
    }

    return label
}

/**
 * Handle the tweet when a node is drawn on the canvas (by being dropped, reloaded or refreshed).
 * Call the local service to request tweet details, and invoke a callback function to process the result.
 *
 * @param {csContext} context   the standard context object.
 */
function handleTweet(context) {
    let url;
    let firstTime = false;  /* ensures that previously deleted generated properties are not recreated */

    /* Get the url from the payload (if specified) and store as a node property */
    if (context.payload && context.payload.plainText) {
        url = context.payload.plainText;

        if (url.endsWith('/')) {
            url = url.substring(0, url.length - 1)
        }

        context.node.setNormalPropertyNamed('url', url);
        firstTime = true;
    }

    /* invoke the tweet request, with the url node property which may have come from the payload or a previous save */
    requestTweet(context.node, context.node.getPropertyNamed('url'), firstTime);
}

/**
 * Return true if the tweet node is broken (does not have a url property).
 *
 * @param {csNode} tgtNode  the tweet node.
 * @return {boolean}        whether the tweet node is broken or not.
 */
function isBroken(tgtNode) {
    let url = tgtNode.getPropertyNamed('url');

    return tgtNode.isFull() && !url;
}

/**
 * Send a request to the server to request the tweet and parse the response into different properties.
 *
 * @param {csNode} tgtNode      the tweet node.
 * @param {string} url          the twitter url for this tweet.
 * @param {boolean} firstTime   whether this is the first time this tweet has been processed (i.e. this is a new tweet)
 */
function requestTweet(tgtNode, url, firstTime) {
    if (url) {
        let tweetUrl = tgtNode.getType().getSettings().getCustom('tweetService') + encodeURIComponent(url);

        // Quietly call the tweet service (errors will be logged but not alerted to the user)
        httpGet(tweetUrl, callbackGetTweet, {
            "settings": tgtNode.getType().getSettings(),
            "node": tgtNode,
            "url": url,
            "firstTime": firstTime
        },true);
    }
}

/**
 * Called on response from the tweet processing service.  Populate the relevant node properties and render the
 * node on the canvas.
 *
 * @param {object} tweetJson        the custom json object for the processed tweet.
 * @param {csTweetParams} params    the standard tweet parameters populated before sending the server request.
 */
function callbackGetTweet(tweetJson, params) {
    let node = params['node'];
    let tweetHtml = tweetJson['html'];
    let tweetContent = extractContentFrom(tweetHtml);

    // It's possible the user may have changed projects or deleted the node before the response comes back...
    // So check the node still exists in the loaded project, and ignore the request if it does not.
    let validatedNode = getProject().getNodeById(node.getUid());

    if (validatedNode && (validatedNode.getPropertyNamed('url') === node.getPropertyNamed('url'))) {
        // Save the relevant properties, but only if this is the first time the tweet is added since the user
        // may wish to remove the properties and they will otherwise be added back.

        if (params.firstTime) {
            node.setNormalPropertyNamed('url', tweetJson['url']);

            if (tweetJson['author_name']) {
                node.setNormalPropertyNamed('author name', tweetJson['author_name']);
            }

            if (tweetJson['author_url']) {
                node.setNormalPropertyNamed('author url', tweetJson['author_url']);
            }

            if (tweetContent.tweetText) {
                node.setTextPropertyNamed('text', tweetContent.tweetText);
            }

            node.setJsonPropertyNamed('json', tweetContent);
        }

        // Create the details (the rendered tweet html) - the twitter script to convert it was loaded on startup but
        // must be invoked to process this tweet div.
        // Allow clicks because the subsequent twittr.widgets call replaces the placed element with new divs and
        // unless the parent allows clicks we'd need to iterate through all the children again to enable clicks.
        putHtml(node, tweetHtml, undefined, true);

        let newElem = document.getElementById(`html_${node.getUid()}`);

        if (newElem) {
            // Use the twitter widget script to render the tweet content correctly, and silently ignore any errors
            if (window.twttr) {
                try {
                    twttr.widgets.load(newElem)
                        .then(function() {
                            // Nothing needed
                        })
                        .catch(function(e) {
                            // Just ignore the error as it doesn't affect the whole graph
                        });
                } catch(e) {
                    // Just ignore the error as it doesn't affect the whole graph
                }
            }

            if (!node.isExpanded()) {
                // Because this is a callback the node needs to be explicitly collapsed
                collapseNode(node);
            }
        }
    }
}

/**
 * Extract relevant context from the tweet html by iterating through the child nodes and processing the content.
 *
 * @param {string} tweetHtml    the html for the tweet, created by the twitter service.
 * @return {csProcessedTweet}   the extracted content from the html, represented as a simple object.
 */
function extractContentFrom(tweetHtml) {
    let result = {
        "tweetText": '',
        "signature": '',
        "date": '',
        "hashtags": [],
        "images": []
    };

    let temp = document.createElement('div');
    temp.innerHTML = tweetHtml;

    for (let elem of temp.childNodes) {
        if (elem.nodeName === 'BLOCKQUOTE') {
            processElement(elem, result);
        }
    }

    return result;
}

/**
 * Process this dom element, seeking tweet content, and insert into the appropriate property on the result object.
 * Recursively call this function for all child nodes, returning the result after all children processed.
 *
 * @param {HTMLElement} elem            the dom element being processed.
 * @param {csProcessedTweet} result     the standard processed tweet object.
 */
function processElement(elem, result) {
    if (!elem.innerHTML) {
        let text = elem.textContent;

        if (text.trim().length > 0) {
            if (result.signature) {
                // The final element (after the signature) is the date text
                result.date = text;
            } else {
                if (text.startsWith('#')) {
                    // a hashtag (also concatenate into the tweet text)
                    result.hashtags.push(text);
                    result.tweetText += text;
                } else if (text.startsWith('pic.')) {
                    // an embedded image
                    result.images.push(text);
                } else if (text.startsWith('—') && text.endsWith(') ')) {
                    // the signature
                    result.signature = text;
                } else {
                    // unknown, so part of the text of the tweet
                    result.tweetText += text;
                }
            }
        }
    }

    // now recurse through the children
    for (let childElem of elem.childNodes) {
        processElement(childElem, result);
    }
}
