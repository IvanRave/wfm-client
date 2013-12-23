define(['services/datacontext'], function (datacontext) {
    'use strict';

    function ByteImagePart(data) {
        var ths = this;
        data = data || {};

        ths.base64String = data.Base64String;
        ths.startY = data.StartY;

        ths.toPlainJson = function () {
            return JSON.parse(JSON.stringify(ths));
        };
    }

    datacontext.createByteImagePart = function (data) {
        return new ByteImagePart(data);
    };
});