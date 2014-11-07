/// <reference path="../../jQuery/jquery-2.1.0.js" />
/// <reference path="../../jQuery/jquery.tmpl.js" />
/// <reference path="../../jQuery/jquery.tmplPlus.js" />
/// <reference path="../EES.Base.2.js" />
/// <reference path="../HELPERS/TMPL.js" />

(function ($, E$) {

    E$.namespace('E$.components', function (components) {

        var PageType = {
            NORMAL: 1,
            IFRAME: 2,
            EDGE: 3,
            TEMPLATE: 4,
            SPECIALITY: 5
        };

        function InvokeCallback(callback, sender) {
            if (E$.isFunction(callback))
                callback(sender);
            else if (S$.getType(callback) == 'object')
                callback['onLayoutReady'] && callback['onLayoutReady'](sender);
        }

        var PageBase = E$.klass({
            init: function (name, pageType, target) {
                this.isReady = false;
                this.$root = null;
                this.$tmpl = null;

                this.name = name || this.name || 'noname';
                this.pageType = pageType || this.pageType || PageType.NORMAL;
                this.target = target || this.target || 'body';

                this.readyListeners = new components.collections.List();
            },
            isReady: false,
            $root: null,
            $tmpl: null,
            name: 'noname',
            pageType: PageType.NORMAL,
            target: 'body',
            readyListeners: null,
            hasInnerAnime: false,
            ready: function (callback) {
                var self = this;

                if (!callback) {
                    if (self.isReady) {
                        E$.each(self.readyListeners, function (_i, i) {
                            InvokeCallback(i, self);
                        });
                    }
                    return;
                }
                if (!self.isReady)
                    self.readyListeners.add(callback);
                else
                    InvokeCallback(callback, self);
            },
            destroy: function () {
                if (this.$root) {
                    E$.helpers.tmpl.safeRemove(this.$root);

                    delete this.$tmpl;
                    this.$tmpl = null;

                    delete this.$root;
                    this.$root = null;
                }

                delete this.readyListeners;
                this.readyListeners = null;
            },
            show: function (duration, callback) {
                if (this.$root) {
                    this.$root.fadeIn(duration, callback);
                }
            },
            delayShow: function (delay, duration, callback) {
                if (this.$root) {
                    this.$root.delay(delay).fadeIn(duration, callback);
                }
            },
            hide: function (duration, callback) {
                if (this.$root) {
                    this.$root.fadeOut(duration, callback);
                }
            }
        }, {
            find: function (selector) {
                return this.$root.find(selector);
            },
        }, {
            beforeLeave: function () { },
            afterLeave: function () { },
            beforeEnter: function () { },
            afterEnter: function () { },
            setStageLevel: function (transition, onTransitinEnd) {
                if (onTransitinEnd) {
                    this.$root[0].addEventListener('webkitTransitionEnd', onTransitinEnd);
                }
                this.$root.addClass(transition);
            },
            resumeStageLevel: function (transition, onTransitionEnd) {
                if (onTransitinEnd) {
                    this.$root[0].addEventListener('webkitTransitionEnd', onTransitinEnd);
                }
                this.$root.removeClass(transition);
            },
            nextSubPage: function () {
                return false;
            },
            prevSubPage: function () {
                return false;
            }
        }, {
            setNewStage: function (transition, transitionHandler) {
                var _th = E$.isFunction(transition) ? transition : transitionHandler,
                    _tr = E$.isString(transition) ? transition : false;
                if (_th)
                    this.$root[0].addEventListener('webkitTransitionEnd', _th);

                if (!this.preProcessed && _tr)
                    this.$root.addClass(_tr);

                if (!this.preProcessed)
                    this.$root.show().removeClass(_tr)
                else
                    this.$root.removeClass(_tr);
            },
            setOldStage: function (transition, transitionHandler) {
                var _th = E$.isFunction(transition) ? transition : transitionHandler,
                    _tr = E$.isString(transition) ? transition : false;
                if (_th)
                    this.$root[0].addEventListener('webkitTransitionEnd', _th);

                if (_tr)
                    this.$root.addClass(_tr);
            },
            restoreStage: function (transition) {
                var _tr = E$.isString(transition) ? transition : false;
                if (_tr)
                    this.$root.removeClass(transition);
            },
        });

        var SimpleSubPageBase = E$.klass(PageBase, {
            pageCount: 0,
            currentPage: 1,
            pageWidth: 0,
            initialize: function (itemSelector) {

            },
            nextSubPage: function () { },
            prevSubPage: function () { },
        });

        var PageHandlerSyncMode = {
            NONE: 0,
            READY: 1,
            CLOSE: 2,
            READYANDCLOSE: 3
        };

        var PageHandler = E$.klass({
            ctor: function (options) {
                this.owner = options.owner;
                this.syncStage = options.syncStage;
                this.syncMode = options.syncMode || 0;
                this.syncTransition = options.syncTransition;
                this.transition = options.transition;
                this.onTransitionEnd = options.onTransitionEnd || function (action, stage, e) { };
            },
            owner: null,
            syncStage: null,
            syncMode: 0,
            syncTransition: '',
            current: null,
            onPreReady: function (stage) {
                if (stage) {
                    stage.$root.addClass(this.transition).show();
                    stage.preProcessed = true;
                }
            },
            onLayoutReady: function (stage) {
                var self = this;
                function handle(e) {
                    if (e.target != stage.$root[0])
                        return;
                    e.target.removeEventListener('webkitTransitionEnd', handle, false);
                    self.onTransitionEnd('opened', stage, e);
                    self.current = stage;
                    stage.afterEnter();
                }

                stage.beforeEnter();
                if (self.syncStage && (self.syncMode & PageHandlerSyncMode.READY === PageHandlerSyncMode.READY))
                    self.syncStage.setOldStage(self.syncTransition)
                stage.setNewStage(self.transition, handle);
            },
            onStageClose: function (stage) {
                if (stage) {
                    var self = this;
                    function handle(e) {
                        if (e.target != stage.$root[0])
                            return;
                        e.target.removeEventListener('webkitTransitionEnd', handle, false);
                        var ret = self.onTransitionEnd('closed', stage, e);
                        stage.afterLeave();
                        if (ret) {
                            stage.destroy();
                            if (stage == self.current) {
                                self.current = null;
                            }
                        }
                    }
                    stage.beforeLeave();
                    if (self.syncStage && (self.syncMode & PageHandlerSyncMode.CLOSE === PageHandlerSyncMode.CLOSE)) {
                        self.syncStage.restoreStage(self.syncTransition);
                    }
                    if (stage.$root.hasClass(self.transition)) {
                        handle({ target: stage.$root[0] });
                    } else {
                        stage.setOldStage(self.transition, handle);
                    }
                }
            },
            destroy: function () {
                if (this.current) {
                    this.current.beforeLeave && this.current.beforeLeave();
                    this.current.afterLeave && this.current.afterLeave();
                    this.current.destroy && this.current.destroy();
                    delete this.current;
                    this.current = null;
                }
            }
        });
        E$.extends(E$.components, {
            PageType: PageType,
            PageBase: PageBase,
            PageHandler: PageHandler,
            PageHandlerSyncMode: PageHandlerSyncMode,
        });

    });

})(jQuery, EES);