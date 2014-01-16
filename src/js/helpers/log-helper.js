/** @module */
define([], function () {

    // ============================log canvas
    var logHelper = {};

    /** Draw line on any context */
    logHelper.drawLineCntx = function (cntx, startX, startY, lastX, lastY, isArrow) {
        var arrowHeadLength = 10;
        cntx.strokeStyle = '#000';
        cntx.lineWidth = 0.5;
        cntx.beginPath();
        cntx.moveTo(startX, startY);
        cntx.lineTo(lastX, lastY);
        if (isArrow) {
            var angle = Math.atan2(lastY - startY, lastX - startX);
            cntx.lineTo(lastX - arrowHeadLength * Math.cos(angle - Math.PI / 6), lastY - arrowHeadLength * Math.sin(angle - Math.PI / 6));
            cntx.moveTo(lastX, lastY);
            cntx.lineTo(lastX - arrowHeadLength * Math.cos(angle + Math.PI / 6), lastY - arrowHeadLength * Math.sin(angle + Math.PI / 6));
        }

        cntx.stroke();
    };

    logHelper.drawTextCntx = function (cntx, textString, startX, startY) {
        cntx.textAlign = 'start';
        cntx.textBaseline = 'middle';
        cntx.font = 'normal 12px sans-serif';
        cntx.fillText(textString, startX, startY);
    };

    return logHelper;
});