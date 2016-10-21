/**
 * Created by Brad Hanebury on 2016-10-20.
 * @copyright Mobials Inc. 2016
 */

'use strict';

const uuid = require('uuid');

const DISPATCH_URI = 'https://api.mobials.com/tracker/dispatch';
const COOKIE_NAME = 'mobials_tracker_uuid';

var analytics = {};

//we need to fetch our global analytics variable from wherever this was called.
(function (global){
    analytics = global.analytics;
    analytics.queue = analytics.queue ? analytics.queue : [];
    analytics.debug = typeof analytics.debug === 'undefined' ? false : analytics.debug;
    analytics.dispatch_uri = analytics.dispatch_uri ? analytics.dispatch_uri : DISPATCH_URI;
    analytics.SDKClientKey = analytics.SDKClientKey ? analytics.SDKClientKey : null;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});


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

analytics.createNewAnonymousUser = function() {
    var userUuid = uuid.v4();
    var expires = 1234;
    document.cookie = COOKIE_NAME + "=" + userUuid + ';' + expires + "; path=/";
    return userUuid;
};


analytics.getAnonymousUserUuid = function() {
    var cookie = analytics.readCookie(COOKIE_NAME);
    return cookie ? cookie : analytics.createNewAnonymousUser();
};


if (analytics.queue.length > 0) {
    for (var i in analytics.queue) {
        analytics.track(analytics.queue[i].event, analytics.queue[i].payload);
    }
}

