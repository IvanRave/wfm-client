/** @module */
define(['jquery', 'knockout', 'moment', 'helpers/modal-helper', 'helpers/file-helper',
    'jquery.slimscroll', 'jquery.bootstrap', 'picker.date'], function ($, ko, appMoment, bootstrapModal, fileHelper) {
        'use strict';

        ko.bindingHandlers.hidden = {
            update: function (element, valueAccessor) {
                ko.bindingHandlers.visible.update(element, function () {
                    return !ko.unwrap(valueAccessor());
                });
            }
        };

        /** Hide or show elements with slide animation */
        ko.bindingHandlers.slideVisible = {
            ////init: function (element, valueAccessor) {
            ////    var value = ko.unwrap(valueAccessor());

            ////    var $element = $(element);

            ////    if (value) {
            ////        $element.show();
            ////    }
            ////    else {
            ////        $element.hide();
            ////    }
            ////    console.log('exexxx');
            ////},
            update: function (element, valueAccessor, allBindingsAccessor) {
                console.log('exexxxView');
                var value = ko.unwrap(valueAccessor());

                var $element = $(element);

                var allBindings = allBindingsAccessor();

                // Grab data from binding property
                var duration = allBindings.duration || 500;
                var isCurrentlyVisible = element.style.display !== 'none';

                if (value && !isCurrentlyVisible) {
                    $element.show(duration);
                }
                else if ((!value) && isCurrentlyVisible) {
                    $element.hide(duration);
                }
            }
        };

        /** Hide element with slide animation */
        ko.bindingHandlers.slideHidden = {
            update: function (element, valueAccessor, allBindingsAccessor) {
                ko.bindingHandlers.slideVisible.update(element, function () {
                    return !ko.unwrap(valueAccessor());
                }, allBindingsAccessor);
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

        ko.bindingHandlers.unixTime = {
            update: function (element, valueAccessor) {
                if (ko.unwrap(valueAccessor())) {
                    element.innerHTML = appMoment(ko.unwrap(valueAccessor()) * 1000).format('YYYY-MM-DD HH:mm:ss');
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

        ko.bindingHandlers.scroller = {
            init: function (element) {
                $(element).slimScroll({
                    railVisible: true,
                    alwaysVisible: true,
                    color: '#fcfcfc',
                    //distance: '0',
                    position: 'right',
                    ////width: 210,
                    // move page scroll with this scroll
                    allowPageScroll: true
                });

                var jqrWindow = $(window);

                function redrawBlock() {
                    var curHeight = jqrWindow.height(),
                        curWidth = jqrWindow.width();

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

                jqrWindow.resize(redrawBlock);

                redrawBlock();
            }
        };

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

        /** Figures in draw block */
        function initLogLasDraw(drawCnvs, logCntx, imgFigures, koCheckedLogTool, logLasImg) {
            var startX = 0,
            startY = 0,
            lastX = 0,
            lastY = 0,
            isPainting = false,
            // Defines on MouseDown event
            isArrowXorLine;

            var drawCntx = drawCnvs.getContext('2d');
            drawCntx.strokeStyle = '#000';
            drawCntx.lineWidth = 0.5;

            $(drawCnvs).on('mousedown', function (e) {
                startX = e.pageX - $(this).offset().left;
                startY = e.pageY - $(this).offset().top;
                // Defines only one time: when user click on the field and start draw (line or arrow)
                // When user draw - user can't change Arrow to Line
                isArrowXorLine = ko.unwrap(koCheckedLogTool) === 'tool-arrow';
                isPainting = true;
            }).on('mouseup', function (e) {
                if (isPainting === true) {
                    lastX = e.pageX - $(this).offset().left;
                    lastY = e.pageY - $(this).offset().top;

                    drawCntx.clearRect(0, 0, drawCnvs.width, drawCnvs.height);
                    isPainting = false;

                    require(['models/svg-elem', 'constants/svg-elem-type-constants'], function (SvgElem, svgElemTypeConstants) {
                        // Create line or arrow object
                        var logLasImgTopPos = Math.abs($(logLasImg).position().top);
                        console.log(logLasImgTopPos);
                        var createdImgFigure = new SvgElem({
                            Color: '#000',
                            Tpe: svgElemTypeConstants.line.id,
                            Opts: JSON.stringify({
                                StartX: startX,
                                StartY: startY + logLasImgTopPos,
                                LastX: lastX,
                                LastY: lastY + logLasImgTopPos,
                                IsArrow: isArrowXorLine
                            })
                        });

                        // Add to the log element img figures
                        imgFigures.push(createdImgFigure);

                        console.log(imgFigures);

                        // Draw
                        require(['helpers/log-helper'], function (logHelper) {
                            logHelper.drawLineCntx(logCntx, startX, startY, lastX, lastY, isArrowXorLine);
                        });
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
                    require(['helpers/log-helper'], function (logHelper) {
                        logHelper.drawLineCntx(drawCntx, startX, startY, lastX, lastY, isArrowXorLine);
                    });
                }
            });
        }

        function initLogLasText(logLasText, logCntx, koSvgElems, logLasImg) {
            $(logLasText).off('click').on('click', function (event) {
                ////drawTextBlock.style.filter = 'alpha(opacity=50)';
                // coord accordingly drawTextBlock
                var posX = parseFloat(event.pageX - $(logLasText).offset().left);
                var posY = parseFloat(event.pageY - $(logLasText).offset().top);

                // Create new imgFigure: text
                // Add to the history list: set isNew = true
                // When save - add only where isNew = true (change isNew to false)
                // When click 'return' - remove last element from list where isNew = true (old elements can't be removed)

                require(['helpers/log-helper'], function (logHelper) {
                    var podl = document.createElement('span');
                    $(podl).css({
                        'position': 'absolute',
                        'top': (posY - 9),
                        'left': posX,
                        'white-space': 'nowrap',
                        'color': '#888',
                        'font-size': '12px',
                        'font-family': 'sans-serif',
                        'z-index': '15'
                    }).html('enter text...');

                    var pTag = document.createElement('span');
                    $(pTag).prop({ 'contenteditable': true }).css({
                        'position': 'absolute',
                        'top': (posY - 9),
                        'left': posX,
                        'white-space': 'nowrap',
                        'font-size': '12px',
                        'font-family': 'sans-serif',
                        'z-index': '15'
                    }).on('keypress', function (e) {
                        var code = (e.keyCode ? e.keyCode : e.which);
                        // Enter keycode
                        if (code === 13) {
                            e.preventDefault();
                            var s = $(pTag).html();
                            $(podl).remove();
                            $(pTag).remove();

                            require(['models/svg-elem', 'constants/svg-elem-type-constants'], function (SvgElem, svgElemTypeConstants) {

                                var logLasImgTopPos = Math.abs($(logLasImg).position().top);

                                ////    ////        StartY: 
                                // Create line or arrow object
                                var createdImgFigure = new SvgElem({
                                    Color: '#000',
                                    Tpe: svgElemTypeConstants.text.id,
                                    Opts: JSON.stringify({
                                        StartX: posX,
                                        StartY: posY + logLasImgTopPos,
                                        TextContent: s
                                    })
                                });

                                console.log(createdImgFigure);

                                // Add to the log element img figures
                                koSvgElems.push(createdImgFigure);

                                // Draw
                                logHelper.drawTextCntx(logCntx, s, posX, posY);
                            });
                        }
                    }).on('keyup', function (e) {
                        var s = $(pTag).html();

                        if (s.length === 0) {
                            $(podl).show();
                        }
                        else {
                            $(podl).hide();
                        }

                        var code = (e.keyCode ? e.keyCode : e.which);
                        if (code === 27) {
                            $(podl).remove();
                            $(pTag).remove();
                        }
                    }).on('focusout', function () {
                        $(podl).remove();
                        $(pTag).remove();
                    });

                    $(logLasText).append(podl, pTag);
                    $(pTag).focus();
                });
            });
        }

        /* Redraw elements */
        function drawLogElements(logCntx, svgElements, jqrLogLasImg) {
            var logLasImgTopPos = Math.abs(jqrLogLasImg.position().top);
            require(['helpers/log-helper'], function (logHelper) {
                svgElements.forEach(function (elem) {
                    var opts = ko.unwrap(elem.opts);

                    switch (elem.tpe) {
                        case 'line':
                            logHelper.drawLineCntx(logCntx, opts.StartX, opts.StartY - logLasImgTopPos, opts.LastX, opts.LastY - logLasImgTopPos, opts.IsArrow);
                            break;
                        case 'text':
                            logHelper.drawTextCntx(logCntx, opts.TextContent, opts.StartX, opts.StartY - logLasImgTopPos);
                            break;
                        default: throw new Error('NoSuchTypeForLogFigure');
                    }
                });
            });
        }

        /** All log blocks */
        ko.bindingHandlers.logLas = {
            init: function (element, valueAccessor) {
                // Draw a line - create Line (Array) Object
                // Get coords of this line
                // Add to the log
                // Send coords to the server
                // - build image on the server side for downloading

                var logLasDraw = element.getElementsByClassName('log-las-draw')[0];
                if (!logLasDraw) { throw new Error('no element'); }

                var logLasBase = element.getElementsByClassName('log-las-base')[0];
                if (!logLasBase) { throw new Error('no element'); }

                var logLasText = element.getElementsByClassName('log-las-text')[0];
                if (!logLasText) { throw new Error('no element'); }

                var logLasImg = element.getElementsByClassName('log-las-img')[0];
                if (!logLasImg) { throw new Error('no element'); }

                var accessor = valueAccessor();
                logLasImg.onload = function () {
                    var logCntx = logLasBase.getContext('2d');
                    logCntx.clearRect(0, 0, logLasBase.width, logLasBase.height);

                    var maxCanvasHeight = 480;

                    var jqrLogLasImg = $(logLasImg);
                    // Add scroll event for image
                    jqrLogLasImg.parent().off('scroll').on('scroll', function () {
                        logCntx.clearRect(0, 0, logLasBase.width, logLasBase.height);
                        drawLogElements(logCntx, ko.unwrap(accessor.imgFigures), jqrLogLasImg);
                    });

                    var tmpImgClientHeight = logLasImg.clientHeight;

                    if (tmpImgClientHeight > maxCanvasHeight) {
                        tmpImgClientHeight = maxCanvasHeight;
                    }

                    // Set height to all elements
                    logLasBase.height = tmpImgClientHeight;
                    logLasDraw.height = tmpImgClientHeight;
                    $(logLasText).css({
                        'height': tmpImgClientHeight
                    });

                    // Width - const = 624
                    ////cnvs.width = logImg.clientWidth;
                    ////drawCnvsLog.width = logImg.clientWidth;
                    ////$(textCnvsLog).css({ 'width': logImg.clientWidth });

                    // Draw all image figures on logCntx
                    drawLogElements(logCntx, ko.unwrap(accessor.imgFigures), jqrLogLasImg);

                    initLogLasDraw(logLasDraw, logCntx, accessor.imgFigures, accessor.checkedLogTool, logLasImg);

                    initLogLasText(logLasText, logCntx, accessor.imgFigures, logLasImg);
                };

                // Load img and all handlers
                logLasImg.src = accessor.imgSrc;
            },
            update: function (element, valueAccessor) {
                var logLasDraw = element.getElementsByClassName('log-las-draw')[0];
                if (!logLasDraw) { throw new Error('no element'); }

                var logLasBase = element.getElementsByClassName('log-las-base')[0];
                if (!logLasBase) { throw new Error('no element'); }

                var logLasText = element.getElementsByClassName('log-las-text')[0];
                if (!logLasText) { throw new Error('no element'); }

                var logLasImg = element.getElementsByClassName('log-las-img')[0];
                if (!logLasImg) { throw new Error('no element'); }

                var accessor = valueAccessor();
                var checkedLogTool = ko.unwrap(accessor.checkedLogTool);

                // Hide all blocks by default
                $(logLasDraw).hide();
                $(logLasText).hide();

                // Get coords from main canvas layer
                var cnvsTop = $(logLasBase).css('top');

                switch (checkedLogTool) {
                    case 'tool-line':
                        $(logLasDraw).css({ 'top': cnvsTop }).show();
                        break;
                    case 'tool-arrow':
                        $(logLasDraw).css({ 'top': cnvsTop }).show();
                        break;
                    case 'tool-text':
                        $(logLasText).css({ 'top': cnvsTop }).show();
                        break;
                }
            }
        };

        ko.bindingHandlers.panzoomImg = {
            init: function (element, valueAccessor) {
                var imgSrc = ko.unwrap(valueAccessor().src);
                $(element).on('click', function (e) {
                    e.preventDefault();
                    bootstrapModal.openModalPanzoomWindow(imgSrc);
                });
            }
        };

        ko.bindingHandlers.filoader = {
            init: function (element, valueAccessor) {
                var tmpFiloader = valueAccessor();
                fileHelper.initRegExpFileUpload(element, tmpFiloader.url, tmpFiloader.fileTypeRegExp, tmpFiloader.callback);
            }
        };

        ko.bindingHandlers.modalWindow = {
            init: function (element, valueAccessor) {
                var tmpValue = valueAccessor();

                $(element).on('hidden.bs.modal', function () {
                    tmpValue.fileMgrHiddenCallback();
                });
            },
            update: function (element, valueAccessor) {
                var tmpValue = valueAccessor();

                if (ko.unwrap(tmpValue.isOpenFileMgr)) {
                    $(element).modal('show');
                }
                else {
                    $(element).modal('hide');
                }
            }
        };
    });