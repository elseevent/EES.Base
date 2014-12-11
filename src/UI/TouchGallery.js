/// <reference path="../../jquery-2.1.0.js" />
/// <reference path="../EES.Base.2.js" />

(function ($, E$) {

    E$.using(['E$.structs.Vector2', 'E$.components.basic.TouchMonitor'], function (Vector2, TouchMonitor) {
        E$.namespace('E$.ui', function (ui) {

            var DOM2DMovableElement = E$.klass({
                ctor: function (el) {
                    this.$el = $(el);
                },
                $el: null,
                moveTo: function (v) {
                    this.$el.css('transform', 'translate3d(' + v.x + 'px,' + v.y + 'px,0)');
                },
                setAnimateDuration: function (second) {
                    this.$el.css({ 'transition-duration': second + 'ms' });
                },
                destroy: function () {
                    if (this.$el) {
                        delete this.$el;
                        this.$el = null;
                    }
                },
            });

            var TG = E$.klass({
                ctor: function (options) {
                    var self = this;
                    var translateVector = Vector2.ORIGIN,
                    axis = Vector2.trend(options.axis || Vector2.RIGHT),
                    viewportSize = options.viewportSize || new Vector2(1024, 768),
                    halfViewportLimit = viewportSize.divide(2).multiply(axis),
                    currentIndex = options.currentIndex || 0,
                    length = options.itemsLength || 0,
                    threshold = options.threshold || 30,
                    timeThreshold = options.timeThreshold || 500,
                    transformObj = new DOM2DMovableElement(options.transformObj),
                    transitionDuration = options.transitionDuration || 500,
                    startVector = Vector2.ORIGIN;
                    var eventTarget = options.eventTarget;

                    translateVector = viewportSize.multiply(currentIndex * -1).multiply(axis);
                    transformObj.setAnimateDuration(0);
                    transformObj.moveTo(translateVector);
                    transformObj.setAnimateDuration(transitionDuration);

                    var tm = new TouchMonitor({
                        preventDefault: options.preventDefault,
                        stopPropagation: options.stopPropagation,
                        capture: options.capture,
                        onDown: function (e) {
                            startVector = Vector2.fromEvent(e).multiply(axis);
                            transformObj.setAnimateDuration(0);
                            if (options.onDown) {
                                options.onDown(currentIndex, e);
                            }
                        },
                        onMove: function (e) {
                            var currentVector = Vector2.fromEvent(e).multiply(axis);
                            var moveVector = currentVector.subtract(startVector);
                            var distance = Vector2.distance(startVector, currentVector);
                            if (distance > threshold) {
                                var mc;
                                if ((currentIndex === 0 && (moveVector.x > 0 || moveVector.y > 0)) ||
                                    (currentIndex == length - 1 && (moveVector.x < 0 || moveVector.y < 0))) {
                                    // is edge
                                    mc = translateVector.addition(moveVector.divide(2));
                                } else {
                                    mc = translateVector.addition(moveVector);
                                }
                                if (options.onMove) {
                                    var ret = options.onMove(currentIndex, e, moveVector);
                                    if (ret === C$.RETURN) {
                                        return;
                                    }
                                }
                                transformObj.moveTo(mc);
                            }
                        },
                        onUp: function (e) {
                            var currentVector = Vector2.fromEvent(e).multiply(axis);
                            var moveVector = currentVector.subtract(startVector), tVector = translateVector.copy();
                            var distance = Vector2.distance(startVector, currentVector), canChange;
                            transformObj.setAnimateDuration(transitionDuration);
                            if (distance > threshold) {
                                if (currentVector.elapse(startVector) < timeThreshold || distance > halfViewportLimit.x || distance > halfViewportLimit.y) {
                                    var moveTrend = Vector2.trend(moveVector), moveVal = moveTrend.multiply(viewportSize).multiply(axis);
                                    if (moveTrend.x < 0 || moveTrend.y < 0) {
                                        //to left or up
                                        if (currentIndex < length - 1) {
                                            //can move
                                            tVector = translateVector.addition(moveVal);
                                            canChange = true;
                                        }
                                    } else if (moveTrend.x > 0 || moveTrend.y > 0) {
                                        //to right or down
                                        if (currentIndex > 0) {
                                            tVector = translateVector.addition(moveVal);
                                            canChange = true;
                                        }
                                    }
                                }
                                if (options.onUp) {
                                    var ret = options.onUp(currentIndex, e, moveVector, canChange);
                                    if (ret === C$.RETURN) {
                                        return;
                                    }
                                }
                                translateVector = tVector.copy();
                                if (axis.x === 1) {
                                    currentIndex = translateVector.divide(viewportSize.x).x * -1;
                                } else if (axis.y === 1) {
                                    currentIndex = translateVector.divide(viewportSize.y).y * -1;
                                }

                                setTimeout(function () {
                                    transformObj.moveTo(translateVector);
                                    if (options.onDone) {
                                        options.onDone(currentIndex);
                                    }
                                }, 10);
                            }
                        },
                    }).bind(eventTarget);

                    E$(self).extra({
                        setIndex: function (index) {
                            if (-1 < index && index < length) {
                                translateVector = viewportSize.multiply(index * -1).multiply(axis);
                                transformObj.setAnimateDuration(transitionDuration);
                                transformObj.moveTo(translateVector);
                                currentIndex = index;
                                if (options.onDone) {
                                    options.onDone(currentIndex);
                                }
                            }
                        },
                        getIndex: function () {
                            return currentIndex;
                        },
                        getLength: function () {
                            return length;
                        },
                        setLength: function (len) {
                            if (len < 0) {
                                len = 0;
                            }
                            length = len;
                            if (length <= currentIndex) {
                                self.setIndex(length - 1);
                            }
                        },
                    });
                },
            });

            E$.extends(ui, {
                DOM2DMovableElement: DOM2DMovableElement,
                TouchGallery: TG,
            });
        });
    });

})(jQuery, EES);