/// <reference path="../EES.Base.2.js" />

(function (E$) {
    'use strict';

    E$.using('E$.structs.Vector2', function (Vector2) {
        E$.namespace('E$.graphics', function (graphics) {
            /*
            * 表示一个纹理
            */
            var Texture2D = E$.klass({
                /**
                * 构造
                * 
                * @param {Image} image 纹理的基础图象
                * @param {Vector2} size 纹理的原始尺寸
                * @param {Vector2} offset 烘焙纹理的原始偏移
                */
                ctor: function (image, size, offset) {
                    this.image = image;
                    this.size = size || new Vector2(image.width, image.height);
                    this.offset = offset || Vector2.ORIGIN;
                },
                /**
                * 图象
                * 
                * @type {Image}
                */
                image: null,
                /**
                * 原始尺寸
                * 
                * @type {Vector2}
                * @default Vector2.ORIGIN
                */
                size: Vector2.ORIGIN,
                /**
                * 原始偏移
                * 
                * @type {Vector2}
                * @default Vector2.ORIGIN
                */
                offset: Vector2.ORIGIN,
                /**
                * 缩放原始尺寸到指定比例
                * 
                * @param {Vector2|Number} scale 比例刻度
                * @returns {Vector2}
                */
                scaleTo: function (scale) {
                    return this.size.multiply(scale);
                },
                /**
                * 回收资源 (关闭图象的引用)
                * 
                * @returns {Void}
                */
                destory: function () {
                    delete this.image;
                }
            });

            E$.extends(graphics, {
                Texture2D: Texture2D,
            });
        });
    });
})(EES);