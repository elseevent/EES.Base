/// <reference path="jQuery/jquery-2.1.0.js" />
/// <reference path="EES/EES.Base.2.js" />
/// <reference path="EES/UI/TouchGallery.js" />

(function ($, E$) {

    E$.namespace('E$.ui', function (ns) {

        var Vector2 = E$.structs.Vector2;

        var SliderElement = E$.klass({
            ctor: function (type, key) {
                this.type = type;
                this.key = key;
            },
            type: null,
            key: null,
            getEl: function () { },
        });

        var ImgEl = E$.klass(SliderElement, {
            ctor: function (key, prefix) {
                ImgEl.Base.ctor.call(this, 'img', key);
                this.prefix = prefix || 'p';
            },
            prefix: null,
            getEl: function () {
                return $(String.format(tmpl, this.getPath()));
            },
            getPath: function () {
                return String.format('images/static/{0}{1}.jpg', this.prefix, this.key);
            }
        });

        var LinkedImgEl = E$.klass(ImgEl, {
            ctor: function (key, prefix, link) {
                LinkedImgEl.Base.ctor.call(this, key, prefix);
                this.link = link || '#';
            },
            link: null,
            getEl: function () {
                var self = this, ret = LinkedImgEl.Base.getEl.call(this);
                var s;
                ret.on('touchstart mousedown', function (e) {
                    s = Vector2.fromEvent(e);
                }).on('touchend mouseup', function (e) {
                    var c = Vector2.fromEvent(e);
                    if (Vector2.distance(c, s) < 3 && c.elapse(s) < 100) {
                        window.location = self.link;
                    }
                });
                //ret.click(function () {
                //});
                return ret;
            },
        });

        var StageEl = E$.klass(SliderElement, {
            ctor: function (key, lKey, opts) {
                opts = opts || {};
                StageEl.Base.ctor.call(this, 'stage', key);
                this.el = $('<canvas width="640" height="960"></canvas>');
                this.lKey = lKey;
                this.transparent = opts.transparent;
                this.replay = opts.replay;
            },
            el: null,
            root: null,
            transparent: true,
            replay: true,
            getEl: function () {
                return $('<div class="element"/>').append(this.el);
            },
            getProperties: function () {
                var container = window[this.lKey];
                return container.properties;
            },
            getManifest: function () {
                return this.getProperties().manifest;
            },
            getStage: function () {
                this.el.css('background-color', this.getProperties().color)
                var exportRoot = new window[this.lKey][this.key]();
                var stage = new createjs.Stage(this.el.get(0));
                stage.addChild(exportRoot);
                stage.update();
                this.root = exportRoot;
                return stage;
            },
        });

        E$.extends(ns, {
            sliders: {
                SliderElement: SliderElement,
                ImgEl: ImgEl,
                LinkedImgEl: LinkedImgEl,
                StageEl: StageEl,
            }
        });

        var tmpl = '<div class="element" style="background-image:url({0});"></div>';

        E$.using(['E$.ui', 'E$.structs.Vector2'], function (ui, Vector2) {

            var Page = E$.klass({
                ctor: function (data, opts) {
                    var self = this; opts = opts || {};
                    var wrapper = $('.gallery-wrapper'), slider = $('<div class="gallery-slider"></div>');

                    var loading, bg, stages = [], imgs, manifests = [];

                    E$.each(data, function (i, v) {
                        //if (v.type === 'img') {
                        //    lib.properties.manifest.push({ src: v.getPath(), id: v.key });
                        //} else
                        if (v.type === 'stage') {
                            stages.push(v);
                            manifests.push.apply(manifests, v.getManifest());
                        }
                        slider.append(v.getEl());
                    });

                    var loader = new createjs.LoadQueue(false);
                    loader.addEventListener("fileload", handleFileLoad);
                    loader.addEventListener("complete", handleComplete);
                    loader.loadManifest(manifests);

                    function handleFileLoad(evt) {
                        if (evt.item.type == "image") {
                            images[evt.item.id] = evt.result;
                        }
                    }

                    function handleComplete() {
                        wrapper.append(slider);
                        $('.loading').fadeOut(1000, function () {
                            $(this).remove();
                        });
                        var s1 = stages[0], properties;
                        if (s1) {
                            properties = s1.getProperties();
                            createjs.Ticker.setFPS(properties.fps);

                            E$.each(stages, function (i, v) {
                                var stage = v.getStage();
                                v.root.tickEnabled = false;
                                createjs.Ticker.addEventListener("tick", stage);
                            });
                        }
                        if (data[0] == s1) {
                            s1.root.tickEnabled = true;
                        }
                    }

                    self.touchGallery = new ui.TouchGallery({
                        axis: Vector2.BOTTOM,
                        transformObj: slider,
                        itemsLength: data.length,
                        eventTarget: wrapper[0],
                        transitionDuration: 500,
                        threshold: 5,
                        viewportSize: new Vector2(wrapper.width(), wrapper.height()),
                        onDown: function () {
                            E$.each(data, function (i, v) {
                                if (v.type === 'stage') {
                                    v.root.tickEnabled = false;
                                }
                            });
                        },
                        onTap: function (c) {
                            var stage = data[c];
                            if (stage.type === 'stage') {
                                stage.root.tickEnabled = true;
                            }
                        },
                        onDone: function (c) {
                            setTimeout(function () {
                                E$.each(data, function (i, v) {
                                    if (v.type === 'stage') {
                                        var isCurrent = i === c;
                                        if (v.replay) {
                                            if (isCurrent) {
                                                v.root.getChildAt(0).gotoAndPlay(1);
                                            } else {
                                                v.root.getChildAt(0).gotoAndStop(0);
                                            }
                                        }
                                        if (v.transparent) {
                                            v.root.alpha = isCurrent;
                                        }
                                        v.root.tickEnabled = isCurrent;
                                    }
                                });
                            }, 510);
                        }
                    });

                    if (stages.length === 0) {
                        handleComplete();
                    }
                }
            });

            E$.extends(ns, {
                anime: {
                    PageBase: Page,
                }
            });

        });

    });

})(jQuery, EES);