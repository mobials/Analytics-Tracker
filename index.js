/**
 * Created by Brad Hanebury on 2016-10-20.
 * @copyright Mobials Inc. 2016
 */

'use strict';

const uuid = require('uuid');

//the endpoint where all analytics is to be sent
const DISPATCH_URI = 'https://api.mobials.com/tracker/dispatch';

//name of the cookie used for anonymous tracking
const COOKIE_NAME = 'mobials_tracker_uuid';

var analytics = {};

//we need to fetch our global analytics variable from wherever this was called.
(function (global){
    analytics = global.analytics ? global.analytics : {};
    analytics.queue = analytics.queue ? analytics.queue : [];
    analytics.debug = typeof analytics.debug === 'undefined' ? false : analytics.debug;
    analytics.dispatch_uri = analytics.dispatch_uri ? analytics.dispatch_uri : DISPATCH_URI;
    analytics.SDKClientKey = analytics.SDKClientKey ? analytics.SDKClientKey : null;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});


/**
 * Send our tracking event to the server
 *
 * @param eventType the name of the event (e.g., 'impression')
 * @param payload any relevant data for the event
 */
analytics.track = function(eventType, payload) {
    var http = new XMLHttpRequest();

    var params = JSON.stringify({
        event: eventType,
        payload: [payload],
        sdk_client_key: analytics.SDKClientKey,
        version: analytics.version,
        actor_uuid: analytics.getAnonymousUserUuid()
    });
    http.open("POST", analytics.dispatch_uri, true);
    http.setRequestHeader("Content-type", "application/json");
    http.send(params);
};

/**
 * @param name the name of the cookie to read
 * @returns {*}
 */
analytics.readCookie = function(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
};

/**
 * Creates a new anonymous user (via a cookie)
 *
 * @returns {*}
 */
analytics.createNewAnonymousUser = function() {
    var userUuid = uuid.v4();
    var expires = 315360000; //10 years
    document.cookie = COOKIE_NAME + "=" + userUuid + ';' + expires + "; path=/";
    return userUuid;
};

/**
 * Returns the UUID of the current anonymous user.
 *
 * @returns {*}
 */
analytics.getAnonymousUserUuid = function() {
    var cookie = analytics.readCookie(COOKIE_NAME);
    return cookie ? cookie : analytics.createNewAnonymousUser();
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

