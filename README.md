# cogni-sketch-contrib-twitter
Twitter integration for the cogni-sketch environment.

To add this plugin to the cogni-sketch environment you must do the following:
1. Git clone this repo into the `cogni-sketch/plugins` folder.
2. Run `npm install` for this plugin.
3. Edit `cogni-sketch/plugins.js`, adding the following entry to the `plugins` list:
```
        {
            "name": 'cogni-sketch-contrib-twitter',
            "routes": [
                { "root": '/tweet', "path": 'tweet.js' }
            ],
            "scripts": [
                '/plugins/cogni-sketch-contrib-twitter/scripts/twitter.js'
            ],
            "stylesheets": [ 'twitter.css' ],
            "actions": [ 'tweet' ]
        }
```   
4. Optionally, add the tweet item to any palette by pasting in the following to any palette
file, replacing `section` and `position` with correct values with as needed (see also
`examples\palette_item_tweet.json` for a copy of this text):
```
  "tweet": {
    "id": "tweet",
    "section": "(section name)",
    "position": -1,
    "icon": "/plugins/cogni-sketch-contrib-twitter/images/icon-tweet.svg",
    "icon-alt": "icon-tweet",
    "label": "tweet",
    "nodeColor": "blue",
    "settings": {
      "canChangeTypeAfterCreation": true,
      "tweetScale": 1,
      "dropPrefixes": [
        "http://twitter.",
        "https://twitter."
      ],
      "defaultWidth": "100px",
      "tweetService": "tweet?url="
    }
  }
```
5. Restart the cogni-sketch service.
