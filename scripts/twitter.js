/**
 * @file The server-side capabilities of the 'spreadsheet' palette function.
 * This is copied from the twitter plugin site as guided by them:
 *
 *      "For best performance and reliability, include the widgets.js script in your template.
 *      Include the Twitter for Websites JavaScript once in your page template for optimal web page performance
 *      and to enable tracking of Twitter widget JavaScript events."
 *
 * (from https://developer.twitter.com/en/docs/twitter-for-websites/javascript-api/guides/set-up-twitter-for-websites )
 *
 * @author Twitter
 **/

window.twttr = (function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0],
        t = window.twttr || {};
    if (d.getElementById(id)) return t;
    js = d.createElement(s);
    js.id = id;
    js.src = "https://platform.twitter.com/widgets.js";
    fjs.parentNode.insertBefore(js, fjs);

    t._e = [];
    t.ready = function(f) {
        t._e.push(f);
    };

    return t;
}(document, "script", "twitter-wjs"));
