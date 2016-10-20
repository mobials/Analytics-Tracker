/**
 * Created by Brad Hanebury on 2016-10-20.
 * @copyright Mobials Inc. 2016
 */

'use strict';

const uuid = require('uuid');

var analytics = {};

//we need to fetch our global analytics variable from wherever this was called.
(function (global){
    'use strict';
    analytics = global.analytics;
    analytics.queue = analytics.queue ? analytics.queue : [];
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});

analytics.track = function(event, payload) {
    var http = new XMLHttpRequest();
    var url = "/tracker/dispatch";

    //create a new anonymous user if one wasn't passed to us
    payload.uuid = payload.uuid ? payload.uuid : analytics.getAnonymousUserUuid();

    var params = JSON.stringify({
        event: event,
        payload: payload,
        version: analytics.VERSION
    });
    http.open("POST", url, true);
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
    var name = 'mobials_tracker_uuid2';
    var userUuid = uuid.v4();
    var expires = 1234;
    document.cookie = name + "=" + userUuid + ';' + expires + "; path=/";
    return userUuid;
};


analytics.getAnonymousUserUuid = function() {
    var cookie = analytics.readCookie('mobials_tracker_uuid2');
    return cookie ? cookie : analytics.createNewAnonymousUser();
};


if (analytics.queue.length > 0) {
    for (var i in analytics.queue) {
        analytics.track(analytics.queue[i].event, analytics.queue[i].payload);
    }
}

