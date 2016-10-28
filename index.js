/**
 * Created by Brad Hanebury on 2016-10-20.
 * @copyright Mobials Inc. 2016
 */

'use strict';

var https = require('https');

//the endpoint where all analytics is to be sent
const DISPATCH_URI = 'https://api.mobials.com/tracker/dispatch';
const DISPATCH_HOST = 'api.mobials.com';
const DISPATCH_PATH = '/tracker/dispatch';

var analytics = {};

//we need to fetch our global analytics variable from wherever this was called.
(function (global){
    analytics = global.analytics ? global.analytics : {};
    analytics.queue = analytics.queue ? analytics.queue : [];
    analytics.debug = typeof analytics.debug === 'undefined' ? false : analytics.debug;
    analytics.dispatch_uri = analytics.dispatch_uri ? analytics.dispatch_uri : DISPATCH_URI;
    analytics.host = analytics.host ? analytics.host : DISPATCH_HOST;
    analytics.path = analytics.path ? analytics.path : DISPATCH_PATH;
    analytics.SDKClientKey = analytics.SDKClientKey ? analytics.SDKClientKey : null;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});


/**
 * Send our tracking event to the server
 *
 * @param eventType the name of the event (e.g., 'impression')
 * @param payload any relevant data for the event
 */
analytics.track = function(eventType, payload) {

    var postData = JSON.stringify({
        event: eventType,
        payload: [payload]
    });

    var post_options = {
        host: analytics.host,
        path: analytics.path,
        method: 'POST',
        port: 443,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    var post_req = https.request(post_options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            //console.log('Response: ' + chunk);
        });
    });

    // post the data
    post_req.write(postData);
    post_req.end();
};

/**
 *
 * @param eventType the name of the event
 * @param payload an array of event payload objects
 */
analytics.trackBatch = function(eventType, payload) {

    var postData = JSON.stringify({
        event: eventType,
        payload: payload
    });

    var post_options = {
        host: analytics.host,
        path: analytics.path,
        method: 'POST',
        port: 443,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    var post_req = https.request(post_options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            //console.log('Response: ' + chunk);
        });
    });

    // post the data
    post_req.write(postData);
    post_req.end();
};


/**
 * Once everything is setup, we check the queue that was passed in order to see
 * if there's anything to do
 */
if (analytics.queue.length > 0) {
    for (var i in analytics.queue) {
        analytics.track(analytics.queue[i].event, analytics.queue[i].payload);
    }
}

module.exports = analytics;