/** @module */
define([], function () {
    'use strict';

    /**
    * Property specification
    * @constructor
    */
    var exports = function (clientId, serverId, ttl, tpe, maxLength, minLength) {
        /**
        * Id, used on the client side: can be different then server side id
        * @type {string}
        */
        this.clientId = clientId;

        /**
        * Id, used on the server side: when server id is changed, then no need to change client id
        * @type {string}
        */
        this.serverId = serverId;

        /**
        * Property title
        * @type {string}
        */
        this.ttl = ttl;

        /**
        * Property type: SingleLine, MultiLine, DateLine, ImgUrl: defines representation of this property
        * @type {string}
        */
        this.tpe = tpe;

        /**
        * Max length for string types
        * @type {number}
        */
        this.maxLength = maxLength;

        /**
        * Min length for string types 
        * @type {number}
        */
        this.minLength = minLength;
    };

    return exports;
});