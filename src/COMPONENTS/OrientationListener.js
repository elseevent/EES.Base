/// <reference path="../EES.Base.2.js" />

(function (E$) {

    E$.namespace('E$.components', function (ns) {

        var OrientationListener = E$.klass({
            ctor: function (span) {
                this.span = span || 0;
            },
            disabled: false,
            span: 0,
            state: null,
            update: function () {
                E$(this).dispatch('onUpdate', this.state);
            },
        });

        E$(OrientationListener).insExtra((function () {
            var proxy = function (sender) {
                var eventHandler = function (e) {
                    if (sender.disabled) {
                        return;
                    }

                    /* beta:  -180..180 (rotation around x axis) */
                    /* gamma:  -90..90  (rotation around y axis) */
                    /* alpha:    0..360 (rotation around z axis) (-180..180) */

                    if (e.accelerationIncludingGravity) {
                        e.gamma = e.accelerationIncludingGravity.x * 10;
                        e.beta = -e.accelerationIncludingGravity.y * 10;
                        e.alpha = e.accelerationIncludingGravity.z * 10;
                    }
                    sender.state = e;
                    if (!sender.span) {
                        E$(sender).dispatch('onUpdate', e);
                    }
                };

                return {
                    bind: function () {
                        window.addEventListener('deviceorientation', eventHandler, false);
                        window.addEventListener('devicemotion', eventHandler, false);
                    },
                    unbind: function () {
                        window.removeEventListener('deviceorientation', eventHandler, false);
                        window.removeEventListener('devicemotion', eventHandler, false);
                    },
                };
            };

            return {
                start: function () {
                    this.disabled = false;
                    proxy(this).bind();
                    if (this.span) {
                        this.intervalId = setInterval(E$.proxy(this.update, this), this.span);
                    }
                    E$(this).dispatch('onStart');
                },
                stop: function () {
                    this.disabled = true;
                    proxy(this).unbind();
                    if (this.span) {
                        clearInterval(this.intervalId);
                    }
                    E$(this).dispatch('onStop');
                },
                destroy: function () {
                    this.stop();
                    delete this.state;
                    this.state = null;
                    E$(this).unlisten();
                },
            };
        })());

        E$.extends(ns, {
            OrientationListener: OrientationListener,
        });

    });

})(EES);