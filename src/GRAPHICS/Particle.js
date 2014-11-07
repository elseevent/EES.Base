/// <reference path="../EES.Base.js" />
/// <reference path="EES.GRAPHICS.BASIC.js" />

/**
* 
* @description Particle System
* @author ElseEvent#
* 
*/

(function (E$) {
    E$.using(['E$.structs.Vector2', 'E$.structs.Range', 'E$.structs.Rect', 'E$.graphics.Texture2D'], function (Vector2, Range, Rect, Texture2D) {
        E$.namespace('E$.graphics', function (graphics) {

            /**
             * 无操作
             * 
             * @param {Object} x 传入参数
             * @returns {Object} 返回传入参数
             */
            function noop(x) { return x; }
            /**
             * 空白矩形
             * 
             * @param {Object} x 传入参数
             * @returns {Rect}
             */
            function noRect(x) { return Rect.NONE; }
            /**
             * 无范围
             * 
             * @param {Object} x 传入参数
             * @returns {Range}
             */
            function noRange(x) { return Range.NONE; }
            /**
            * 无2D矢量
            * 
            * @param {Object} x 传入参数
            * @returns {Vector2}
            */
            function noVector2(x) { return Vector2.ORIGIN; }

            /**
            * 粒子对象
            * @event {Void} onUpdate 更新事件
            * @augments {Particle} sender 产生更新事件的发送者
            */
            var Particle = E$.klass({
                ctor: function () { },
                /**
                * 位置
                * 
                * @type {Vector2}
                * @default Vector2.ORIGIN
                */
                position: Vector2.ORIGIN,
                /**
                * 缩放比例
                * 
                * @type {Vector2}
                * @default Vector2.ORIGIN
                */
                scale: Vector2.ORIGIN,
                /**
                * 角度
                * 
                * @type {Number}
                * @default 0
                */
                angle: 0,
                /**
                * 位移速率
                * 
                * @type {Vector2}
                * @default Vector2.ORIGIN
                */
                velocity: Vector2.ORIGIN,
                /**
                * 加速度速率
                * 
                * @type {Vector2}
                * @default Vector2.ORIGIN
                */
                gravityVelocity: Vector2.ORIGIN,
                /**
                * 旋转速率
                * 
                * @type {Number}
                * @default 0
                */
                rotateVelocity: 0,
                /**
                * 粒子存活判定
                * 
                * @param {Rect} bound  边界
                * @returns {Boolean}
                */
                isAlive: function (bound) {
                    bound = bound || Rect.NONE;
                    return bound.hitTest(this.position);
                },
                /**
                * 更新粒子特性
                * 
                * @returns {Void}
                */
                update: function () {
                    this.position = this.position.addition(this.velocity);
                    this.velocity = this.velocity.addition(this.gravityVelocity);
                    this.angle += this.rotateVelocity;
                    E$(this).dispatch('onUpdate', this);
                },
            });

            /**
            * 粒子发生器
            */
            var ParticleEmiter = E$.klass({
                /**
                 * 构造
                 * 
                 * @param {Object} options 初始设置
                 */
                ctor: function (options) {

                    this.emitArea = options.emitArea;
                    this.aliveBound = options.aliveBound;
                    this.positionFactory = options.positionFactory;
                    this.particleScaleFactory = options.particleScaleFactory;
                    this.particleAngleFactory = options.particleAngleFactory;
                    this.particleVelocityFactory = options.particleVelocityFactory;
                    this.particleGravityVelocityFactory = options.particleGravityVelocityFactory;

                    this.particlePool = new E$.components.collections.List();
                },

                //ctor parameters start
                /**
                 * 粒子发射区域
                 * 
                 * @type {Rect}
                 */
                emitArea: Rect.NONE,
                /**
                 * 粒子存活范围
                 * 
                 * @type {Rect}
                 */
                aliveBound: Rect.NONE,
                /**
                 * 粒子位置值工厂
                 * 
                 * @type {Function}
                 * @augments {Rect}
                 * @returns {Vector2}
                 */
                positionFactory: noVector2,
                /**
                 * 粒子缩放值工厂
                 * 
                 * @type {Function}
                 * @returns {Vector2}
                 */
                particleScaleFactory: noVector2,
                /**
                 * 粒子初始角度值工厂
                 * 
                 * @type {Function}
                 * @returns {Number}
                 */
                particleAngleFactory: noop,
                /**
                 * 粒子位移速率值工厂
                 * 
                 * @type {Function}
                 * @return {Vector2}
                 */
                particleVelocityFactory: noVector2,
                /**
                 * 粒子加速度值工厂
                 * 
                 * @type {Function}
                 * @returns {Vector2}
                 */
                particleGravityVelocityFactory: noVector2,
                //ctor parameters end

                /**
                 * 发生器是否生效
                 * 
                 * @type {Boolean}
                 */
                enabled: true,
                /**
                 * 粒子池
                 * 
                 * @type {Array}
                 */
                particlePool: null,
                /**
                 * 发射粒子
                 * 
                 * @returns {Particle} 新产生的粒子实例
                 */
                emit: function () {
                    if (!this.enabled) {
                        return;
                    }

                    var self = this;

                    var particle = new Particle();
                    particle.rotateVelocity = self.particleAngleFactory();
                    particle.position = self.positionFactory(self.emitArea);
                    particle.scale = self.particleScaleFactory();
                    particle.velocity = self.particleVelocityFactory();
                    particle.gravityVelocity = self.particleGravityVelocityFactory();
                    self.particlePool.add(particle);

                    E$(particle).addListener('onUpdate', function (sender) {
                        if (!sender.isAlive(self.aliveBound)) {
                            self.particlePool.remove(sender);
                        }
                    });

                    return particle;
                },
                /**
                 * 获取粒子池当前镜像
                 * 
                 * @returns {Array}
                 */
                getPoolAspect: function () {
                    return this.particlePool.toArray() || [];
                },
                /**
                 * 回收资源 (清理粒子池)
                 * 
                 * @returns {Void}
                 */
                destroy: function () {
                    this.particlePool.clear();
                    delete this.particlePool;
                    this.particlePool = null;
                },
            });

            /*
            * 粒子渲染器
            * 
            * paramters:
            *		options : Object
            *		{
            *		renderContext : CanvasRenderingContext2D
            * 		renderTexture : [Texture2D..]
            * 		renderBound : Rect
            *		}
            */
            var ParticleRenderer = E$.klass({
                /**
                 * 构造
                 * 
                 * @param {Object} options 初始设置
                 */
                ctor: function (options) {
                    this.renderContext = options.renderContext;
                    this.renderTexture = options.renderTexture;
                    this.renderBound = options.renderBound;
                },
                /*
                *渲染器是否生效
                * 
                * @type {Boolean}
                */
                enabled: true,
                //ctor parameters start
                /**
                 * 渲染上下文
                 * 
                 * @type {CanvasRenderingContext2D}
                 */
                renderContext: null,
                /**
                 * 渲染纹理
                 * 
                 * @type {Array}
                 * @augments {Texture2D}
                 */
                renderTexture: null,
                /**
                 * 渲染区域
                 * 
                 * @type {Rect}
                 * @default Rect.NONE
                 */
                renderBound: Rect.NONE,
                //ctor parameters end
                /**
                * 渲染粒子
                * 
                * @param {Array} aspect 要渲染的粒子镜像
                * @returns {Void}
                */
                render: function (aspect) {
                    if (!this.enabled) {
                        return;
                    }

                    var self = this, ctx = this.renderContext, b = this.renderBound;

                    ctx.clearRect(b.position.x, b.position.y, b.size.x, b.size.y);
                    for (var i = 0; i < aspect.length; i++) {
                        var p = aspect[i], texture = self.getRandomTexture(), realSize = texture.scaleTo(p.scale);
                        p.update();
                        ctx.save();
                        ctx.translate(p.position.x, p.position.y);
                        ctx.rotate(p.angle);
                        ctx.drawImage(texture.image,
                        texture.offset.x, texture.offset.y, texture.size.x, texture.size.y,
                        -realSize.x / 2, -realSize.y / 2, realSize.x, realSize.y);
                        ctx.restore();
                    }
                },
                /**
                * 获取随机的渲染纹理
                * 
                * @returns {Texture2D} 
                */
                getRandomTexture: function () {
                    return this.renderTexture[Math.floor(E$.randomRange(0, this.renderTexture.length))];
                },
                /**
                 * 回收资源 (是否渲染上下文及渲染纹理)
                 */
                destroy: function () {
                    delete this.renderContext;
                    delete this.renderTexture;

                    this.renderContext = null;
                    this.renderTexture = null;
                },
            });

            /**
            * 粒子渲染循环核心
            * 
            * @param {ParticleSystem} system 粒子系统实例
            * @private
            */
            var ParticleSystemRenderLoop = function (system) {
                var aspect = system.emiter.getPoolAspect();
                //console.log('particle count %d', aspect.length);
                system.renderer.render(aspect);
            };

            /**
            * 粒子发生器循环核心
            * 
            * @param {ParticleSystem} system 粒子系统实例
            * @private
            */
            var ParticleSystemEmitLoop = function (system) {
                system.emiter.emit();
            };

            /**
            * 粒子系统
            * 
            * parameters
            *		options : Object
            *		{
            *		renderer: Object 
            *			使用粒子渲染器配置选项
            *		emiter: Object
            *			使用粒子发生器配置选项
            *		}
            */
            var ParticleSystem = E$.klass({
                /**
                 * 构造
                 * 
                 * @param {Object} options 初始设置
                 * @augments {Object} renderer 渲染器初始设置
                 * @see ParticleRenderer#ctor
                 * 
                 * @augments {Object} emiter 发生器初始设置
                 * @see ParticleEmiter#ctor
                 */
                ctor: function (options) {
                    var self = this;
                    self.emiter = new ParticleEmiter(options.emiter);
                    self.renderer = new ParticleRenderer(options.renderer);
                },
                /**
                 * 粒子发生器
                 * 
                 * @type {ParticleEmiter}
                 */
                emiter: null,
                /**
                 * 粒子渲染器
                 * 
                 * @type {ParticleRenderer}
                 */
                renderer: null,
                /**
                * 粒子系统启动
                *			
                * @param {Number} renderFps 粒子渲染帧速率
                * @default 30
                * @param {Number} emitFrequency 粒子发射频率
                * @default 100
                * @returns {Void}
                */
                start: function (renderFps, emitFrequency) {
                    this.renderId = setInterval(ParticleSystemRenderLoop, 1000 / (renderFps || 30), this);
                    this.emitId = setInterval(ParticleSystemEmitLoop, emitFrequency || 100, this);
                    this.emiter.enabled = true;
                    this.renderer.enabled = true;
                },
                /**
                * 粒子系统停止
                * 
                * @returns {Void}
                */
                stop: function () {
                    this.emiter.enabled = false;
                    this.renderer.enabled = false;
                    clearInterval(this.renderId);
                    clearInterval(this.emitId);
                },
                /**
                 * 回收资源 (渲染器与发生器回收资源)
                 * 
                 * @returns {Void}
                 */
                destroy: function () {
                    if (this.emiter.enabled || this.renderer.enabled) {
                        this.stop();
                    }

                    this.emiter.destroy();
                    this.renderer.destroy();

                    delete this.emiter;
                    delete this.renderer;
                },
            });

            E$.extends(graphics, {
                Particle: Particle,
                ParticleEmiter: ParticleEmiter,
                ParticleRenderer: ParticleRenderer,
                ParticleSystem: ParticleSystem,
            });
        });
    });

})(EES);