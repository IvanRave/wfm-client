﻿define(['jquery', 'knockout', 'moment', 'jquery.slimscroll', 'jquery.bootstrap', 'bootstrap-datepicker', 'picker.date'], function ($, ko, appMoment) {
    'use strict';

    // Hooks up a form to jQuery Validation
    ko.bindingHandlers.validate = {
        init: function (elem) {
            $(elem).validate();
        }
    };

    // Controls whether or not the text in a textbox is selected based on a model property
    ko.bindingHandlers.selected = {
        init: function (elem, valueAccessor) {
            $(elem).blur(function () {
                var boundProperty = valueAccessor();
                if (ko.isWriteableObservable(boundProperty)) {
                    boundProperty(false);
                }
            });
        },
        update: function (elem, valueAccessor) {
            var shouldBeSelected = ko.utils.unwrapObservable(valueAccessor());
            if (shouldBeSelected) {
                $(elem).select();
            }
        }
    };

    // Makes a textbox lose focus if you press "enter"
    ko.bindingHandlers.blurOnEnter = {
        init: function (elem) {
            $(elem).keypress(function (evt) {
                if (evt.keyCode === 13 /* enter */) {
                    evt.preventDefault();
                    $(elem).triggerHandler("change");
                    $(elem).blur();
                }
            });
        }
    };

    ko.bindingHandlers.placeholder = {
        init: function (elem, valueAccessor) {
            var placeholderText = ko.utils.unwrapObservable(valueAccessor()),
                input = $(elem);

            input.attr('placeholder', placeholderText);
        }
    };

    ko.bindingHandlers.date = {
        update: function (element, valueAccessor) {
            if (ko.unwrap(valueAccessor())) {
                element.innerHTML = appMoment(new Date(ko.unwrap(valueAccessor()))).format('YYYY-MM-DD');
            }
        }
    };

    ko.bindingHandlers.unix = {
        update: function (element, valueAccessor) {
            if (ko.unwrap(valueAccessor())) {
                element.innerHTML = appMoment(ko.unwrap(valueAccessor()) * 1000).format('YYYY-MM-DD');
            }
        }
    };

    ko.bindingHandlers.prec = {
        update: function (element, valueAccessor) {
            var p = ko.unwrap(valueAccessor().value);

            if ($.isNumeric(p) === false) {
                element.innerHTML = "";
                return;
            }

            p = p * valueAccessor().coef();

            if (p === 0) {
                element.innerHTML = 0;
            }
            else if (p < 1) {
                var i = 0;
                while (p < 1) {
                    i -= 1;
                    p *= 10;
                }

                element.innerHTML = String(Math.round(p * 100) / 100) + 'x10<sup>' + i + '</sup>';
            }
            else {
                element.innerHTML = String(Math.round(p * 100) / 100);
            }
        }
    };

    ko.bindingHandlers.hidden = {
        update: function (element, valueAccessor) {
            ko.bindingHandlers.visible.update(element, function () {
                return !ko.utils.unwrapObservable(valueAccessor());
            });
        }
    };

    ko.bindingHandlers.scroller = {
        init: function (element) {
            $(element).slimScroll({
                railVisible: true,
                alwaysVisible: true,
                color: '#fcfcfc',
                //distance: '0',
                position: 'left',
                ////width: 210,
                // move page scroll with this scroll
                allowPageScroll: true
            });
        },
        update: function (element, valueAccessor) {
            var curValue = ko.unwrap(valueAccessor());
            var curHeight = ko.unwrap(curValue.height),
                curWidth = ko.unwrap(curValue.width);

            if ($.isNumeric(curHeight)) {
                // Convert to numbers (if not)
                curHeight = +curHeight;
                curWidth = +curWidth;

                // 992px - small size in bootstrap - min width for div with scroll
                var minWidth = 992,
                    topMargin = 32,
                    bottomMargin = 50,
                    defaultMenuWidth = 210;

                var needHeight,
                    needWidth;
                if (curWidth >= minWidth) {
                    needHeight = curHeight - topMargin - bottomMargin;
                    needWidth = defaultMenuWidth;
                }
                else {
                    needHeight = 'auto'; // by content
                    needWidth = curWidth; // full width
                }

                $(element).parent().height(needHeight);
                $(element).height(needHeight);

                $(element).parent().width(needWidth);
                $(element).width(needWidth);
            }

            ////$(element).slimScroll({
            ////    railVisible: true,
            ////    alwaysVisible: true
            ////});
        }
    };

    ////ko.bindingHandlers.datepicker = {
    ////    init: function (element, valueAccessor, allBindingsAccessor) {
    ////        //initialize datepicker with some optional options
    ////        var options = allBindingsAccessor().datepickerOptions || {};
    ////        $(element).datepicker(options);

    ////        //when a user changes the date, update the view model
    ////        ko.utils.registerEventHandler(element, "changeDate", function (event) {
    ////            var value = valueAccessor();
    ////            if (ko.isObservable(value)) {
    ////                value(event.date);
    ////            }
    ////        });
    ////    },
    ////    update: function (element, valueAccessor) {
    ////        var widget = $(element).data("datepicker");

    ////        // When the view model is updated, update the widget
    ////        if (widget) {

    ////            widget.date = ko.utils.unwrapObservable(valueAccessor());
    ////            if (widget.date) {
    ////                widget.setValue();
    ////            }
    ////        }
    ////    }
    ////};

    ko.bindingHandlers.datepicker = {
        init: function (element, valueAccessor, allBindings) {
            // Initialize datepicker with some optional options
            var curValue = valueAccessor();

            if (ko.isObservable(curValue)) {
                var options = allBindings.get('datepickerOptions') || {};

                var $input = $(element).pickadate(options);
                var picker = $input.pickadate('picker');

                var initialValue = ko.unwrap(curValue);

                if (initialValue) {
                    // convert to ms
                    initialValue = initialValue * 1000;
                    // convert to local time to show in input
                    var startUtcOffset = new Date(initialValue).getTimezoneOffset() * 60 * 1000;
                    initialValue -= startUtcOffset;
                    ////console.log('set as a start value in input: with utc', new Date(initialValue).toISOString());
                    picker.set('select', initialValue);
                }

                picker.on({
                    set: function (event) {
                        ////console.log('on Set call with event: ', event);

                        ////var selectedObj = picker.get('select');
                        ////console.log('slcObj', selectedObj);
                        // select - UTC unix time
                        ////console.log(event);
                        if (event.hasOwnProperty('select')) {
                            var unixTimeMs = event.select;
                            if (unixTimeMs) {
                                // offset in seconds
                                var utcOffset = new Date(unixTimeMs).getTimezoneOffset() * 60;
                                ////console.log('withoututc', unixTimeMs / 1000 - utcOffset);
                                // Save as UTC unix time (seconds)
                                curValue(unixTimeMs / 1000 - utcOffset);
                            }
                        }
                        else if (event.hasOwnProperty('clear')) {
                            ////console.log('clear setting');
                            // Set to null by clear event
                            // Do not set to null because of pickadate set undefined when choose year or month from select
                            curValue(null);
                        }
                    }
                });

                ////options.onSet = function (event) {

                ////};

                ////options.max = new Date();

                ////$(element).pickadate(options);
            }
        },
        update: function (element, valueAccessor) {
            var curValue = valueAccessor();

            if (ko.isObservable(curValue)) {
                var initialValue = ko.unwrap(curValue);
                //var setArchFunction = picker.on();
                ////console.log('pickerOn', picker);

                if (!initialValue) {
                    var picker = $(element).pickadate('picker');
                    // TODO: turn off onSet 
                    // then set any value
                    // then turn on previous onSet
                    picker.set('clear');
                }
            }
            ////    var picker = $(element).pickadate('picker');

            ////    var curVal = ko.unwrap(valueAccessor());

            ////    console.log('picker', picker);
            ////    console.log(curVal);

            ////    ////if (curVal) {
            ////    ////    // Convert to unit time miliseconds
            ////    ////    curVal = curVal * 1000;
            ////    ////    console.log('curval', new Date(curVal).toISOString());
            ////    ////    // Get utc offset

            ////    ////    //var utcOffset = new Date(curVal).getTimezoneOffset() * 60;
            ////    ////    // Diff UTC
            ////    ////    //curVal = curVal - utcOffset;

            ////    ////    picker.set('select', curVal);
            ////    ////}
        }
    };

    // for bootstrap dropdown (wich not loaded correctly by data-toggle in external page)
    ko.bindingHandlers.drpdwn = {
        init: function (element) {
            $(element).dropdown();
        }
    };

    // for canvas log section
    ko.bindingHandlers.drawCnvsLog = {
        init: function (drawCnvs) {
            var startX = 0,
            startY = 0,
            lastX = 0,
            lastY = 0,
            isPainting = false;

            var drawCntx = drawCnvs.getContext('2d');
            drawCntx.strokeStyle = '#000';
            drawCntx.lineWidth = 0.5;

            $(drawCnvs).on('mousedown', function (e) {
                startX = e.pageX - $(this).offset().left;
                startY = e.pageY - $(this).offset().top;
                isPainting = true;
            }).on('mouseup', function (e) {
                // when mouseleave than 
                if (isPainting === true) {
                    lastX = e.pageX - $(this).offset().left;
                    lastY = e.pageY - $(this).offset().top;
                    drawCntx.clearRect(0, 0, drawCnvs.width, drawCnvs.height);
                    isPainting = false;
                    ////drawLineCntx(startX + $(this).offset().left, startY + $(this).offset().top, lastX + $(this).offset().left, lastY + $(this).offset().top);

                    require(['app/log-helper'], function (logHelper) {
                        logHelper.drawLineCntx(startX, startY, lastX, lastY);
                    });
                }
            }).on('mouseleave', function () {
                // cancel painting
                if (isPainting === true) {
                    drawCntx.clearRect(0, 0, drawCnvs.width, drawCnvs.height);
                    isPainting = false;
                }
            }).on('mousemove', function (e) {
                if (isPainting === true) {
                    lastX = e.pageX - $(this).offset().left;
                    lastY = e.pageY - $(this).offset().top;
                    drawCntx.clearRect(0, 0, drawCnvs.width, drawCnvs.height);
                    require(['app/log-helper'], function (logHelper) {
                        logHelper.drawLineCntxPart(drawCntx, startX, startY, lastX, lastY);
                    });
                }
            });
        }
    };

    // svg graph (like perfomance)
    ko.bindingHandlers.svgResponsive = {
        init: function (element, valueAccessor) {
            function updateWidth() {
                valueAccessor().tmpPrfGraphWidth($(element).parent().width());
            }

            // When change window size - update graph size
            $(window).resize(updateWidth);

            // When toggle left menu - update graph size
            valueAccessor().tmpIsVisibleMenu.subscribe(updateWidth);

            // Update initial
            updateWidth();
            // svg viewbox size need to init before creating of this element
        }
    };

    ko.bindingHandlers.svgAxisTime = {
        update: function (element, valueAccessor) {
            ////var timeBorder = ko.unwrap(valueAccessor().timeBorder);
            ////if (!$.isNumeric(timeBorder[0]) || !$.isNumeric(timeBorder[1])) { return; }

            var prfAltX = ko.unwrap(valueAccessor().prfAltX);
            if (prfAltX) {
                require(['d3'], function (d3) {
                    ////var t1 = new Date(timeBorder[0] * 1000),
                    ////    t2 = new Date(timeBorder[1] * 1000);

                    ////var x = d3.time.scale()
                    ////        .domain([t1, t2])
                    ////        .range([t1, t2].map(d3.time.scale()
                    ////        .domain([t1, t2])
                    ////        .range([0, tmpPrfGraphViewBoxWidth])));
                    ////var axisX = d3.svg.axis().scale(x);

                    var altAxisX = d3.svg.axis().scale(prfAltX);
                    d3.select(element).call(altAxisX);
                    ////.selectAll("text")
                    ////.attr("y", 8)
                    ////.attr("x", -6)
                    ////.style("text-anchor", "start");
                });
            }
        }
    };

    ko.bindingHandlers.svgAxisValue = {
        update: function (element, valueAccessor) {
            var prfAltY = ko.unwrap(valueAccessor().prfAltY);
            ////var tmpPrfGraphViewBoxHeight = ko.unwrap(valueAccessor().tmpPrfGraphViewBoxHeight);
            ////if (!$.isNumeric(tmpPrfGraphViewBoxHeight)) { return; }

            ////var valueBorder = ko.unwrap(valueAccessor().valueBorder);
            ////if (!$.isNumeric(valueBorder[0]) || !$.isNumeric(valueBorder[1])) { return; }
            if (prfAltY) {
                require(['d3'], function (d3) {
                    ////var y = d3.scale.linear().range([tmpPrfGraphViewBoxHeight, 0]);
                    ////// [123,123]
                    ////y.domain(valueBorder);
                    ////var axisY = d3.svg.axis().scale(y).orient('left');
                    var altAxisY = d3.svg.axis().scale(prfAltY).orient('left');
                    d3.select(element).call(altAxisY);
                    ////.selectAll('text')
                    ////.attr('y', 0);
                });
            }
        }
    };

    ko.bindingHandlers.svgZoomGraph = {
        update: function (element, valueAccessor) {
            var prfAltX = ko.unwrap(valueAccessor().prfAltX),
                prfAltY = ko.unwrap(valueAccessor().prfAltY);

            if (!prfAltX || !prfAltY) { return; }

            require(['d3'], function (d3) {
                ////var y = d3.scale.linear().range([tmpPrfGraphViewBoxHeight, 0]);
                ////// [123,123]
                ////y.domain(valueBorder);

                var altAxisX = d3.svg.axis().scale(prfAltX);
                var altAxisY = d3.svg.axis().scale(prfAltY).orient('left');
                
                function zoomed() {
                    console.log('zoomed event');
                    d3.select(element).select('.axis.x').call(altAxisX);
                    d3.select(element).select('.axis.y').call(altAxisY);
                }

                // tmp for zoom ========================================
                var altZoom = d3.behavior.zoom()
                    .x(prfAltX)
                    .y(prfAltY)
                    .scaleExtent([0.5, 10])
                    .on('zoom', zoomed);
                // end tmp

                ////var axisY = d3.svg.axis().scale(y).orient('left');
                d3.select(element).call(altZoom);

                zoomed();
                ////.selectAll('text')
                ////.attr('y', 0);
            });
        }
    };
});