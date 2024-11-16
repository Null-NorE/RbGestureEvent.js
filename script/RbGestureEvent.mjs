"use strict";

/** 
 * @name debug 
 * @description 是否开启调试模式
 * @type {Boolean}
 * @default false
 */
let debug = false;

const EVENTLIST = Symbol('eventList');
const LONGTOUCH = Symbol('longtouch');
const CBMAPPING = Symbol('callbackMapping');

/**
 * @name RbEventState
 * @description 事件状态类
 * @class
 * @member {Date} time 事件发生时间
 * @member {String} eventType 事件类型
 * 
 * @member {Number} scale 缩放比例
 * @member {Number} refAngle 参考角
 * @member {Array} midPoint 中点坐标
 * 
 * @member {Number} clickTimes 点击次数
 * 
 * @member {Number} startLenth 初始长度
 * @member {Number} startAngle 初始角度
 * @member {Date} startTime 初始时间
 * 
 * @member {Array} pointers 指针
 * @member {Number} pointerCount 指针数量
 * 
 * @member {PointerEvent} originEvent 原始事件
 */
class EventState {
   time = Date.now();
   eventType = '';

   scale = 1;
   refAngle = 0;
   midPoint = [0, 0];

   clickTimes = 0;

   startLength = 0;
   startAngle = 0;
   startTime = Date.now();

   pointers = [];
   upponiterId = -1;
   pointerCount = 0;

   originEvent = new PointerEvent('none');
}

/**
 * @name eventConditions
 * @description 事件条件对象，包含用于判断各种事件类型的条件函数
 * @type {Record<String, (ev: EventState, lev: EventState, tri: String) => Boolean>}
 * @private
 * @constant
 */
const eventConditions = {
   'press': (ev, lev, tri) => {
      const isDown = ev.eventType == 'down' && tri == 'down';
      return isDown;
   },
   'release': (ev, lev, tri) => {
      const isUp = ev.eventType == 'up' && tri == 'up';
      return isUp;
   },
   'click': (ev, lev, tri) => {
      if (eventConditions['release'](ev, lev, tri) && ev.pointerCount == 0) {
         const isInTime = ev.time - ev.startTime <= 500;
         const isMove = lev.pointers[ev.upponiterId].move == false;
         return isInTime && isMove;
      } else return false;
   },
   'doubleclick': (() => {
      let clickCount = 0; // click次数计数器
      let lastClickTime = new Date(1970); // 避免第一次点击时的时间判断出错
      let lastClickLocation = [0, 0];
      return (ev, lev, tri) => {
         if (tri == 'up') {
            const pointer = lev.pointers[ev.upponiterId];
            // 如果是点击事件
            if (eventConditions['click'](ev, lev, tri)) {
               const nowTime = Date.now();
               // 如果两次点击的时间间隔小于550ms且两次点击的位置距离小于20px
               if (nowTime - lastClickTime <= 550 && GestureEvent.eDistance(pointer.location, lastClickLocation) <= 20) {
                  clickCount += 1; // 使用点击计数是为了仅在偶数次点击时触发双击事件
               } else {
                  clickCount = 1;
               }
               lastClickTime = Date.now();
               lastClickLocation = [...pointer.location];
            }
            if (clickCount == 2) {
               clickCount = 0;
               return true;
            } else return false;
         } else return false;
      };
   })(),
   'longtouch': (() => {
      let count = 0; // 避免重复触发
      let up = false; // 避免抬起时触发
      return (ev, lev, tri) => {
         if (tri == 'down') {
            up = false;
         } else if (tri == 'up') {
            up = true;
            count = 0;
         }

         if (tri == 'longtouch') {
            // 如果按下时间超过500ms，没有移动，只有一个触摸点，且不是因为抬起导致只剩下一个触摸点的
            const isDelayEnough = Date.now() - ev.startTime >= 500;
            const isSinglePointer = ev.pointerCount == 1;
            const isMove = ev.pointers[ev.originEvent.pointerId].move == false;
            const isUp = up;

            const isFirstTimes = count == 0; // 避免重复触发
            if (isDelayEnough && isSinglePointer && isFirstTimes && isMove && !isUp) {
               count += 1;
               return true;
            } else return false;
         } else return false;
      }
   })(),

   'pinch': (ev, lev, tri) => { },
   'rotate': (ev, lev, tri) => { },
   'drag': (ev, lev, tri) => { },
   'move': (ev, lev, tri) => { },

   /* dragEvent */
   'dragstart': (ev, lev, tri) => {
      if (tri == 'move') {
         const isSinglePointer = ev.pointerCount == 1;
         const isFirstMove = ev.pointers[ev.originEvent.pointerId].firstMove;
         return isSinglePointer && isFirstMove;
      } else return false;
   },
   'dragmove': (ev, lev, tri) => {
      if (tri == 'move') {
         const isSinglePointer = ev.pointerCount == 1;
         const isMove = ev.pointers[ev.originEvent.pointerId].move;
         return isSinglePointer && isMove;
      } else return false;
   },
   'dragend': (() => {
      let isStart = false;
      return (ev, lev, tri) => {
         if (eventConditions['dragstart'](ev, lev, tri)) {
            isStart = true;
         }
         if ((isStart && tri == 'up') || (tri == 'down' && ev.pointerCount > 1)) {
            isStart = false;
            return true;
         } else return false;
      }
   })(),
   'dragcancel': (ev, lev, tri) => { },
   'dragleft': (ev, lev, tri) => {
      if (eventConditions['dragmove'](ev, lev, tri)) {
         const isLeft = ev.pointers[ev.originEvent.pointerId].displacement[0] < 0;
         return isLeft;
      } else return false;
   },
   'dragright': (ev, lev, tri) => {
      if (eventConditions['dragmove'](ev, lev, tri)) {
         const isRight = ev.pointers[ev.originEvent.pointerId].displacement[0] > 0;
         return isRight;
      } else return false;
   },
   'dragup': (ev, lev, tri) => {
      if (eventConditions['dragmove'](ev, lev, tri)) {
         const isUp = ev.pointers[ev.originEvent.pointerId].displacement[1] < 0;
         return isUp;
      } else return false;
   },
   'dragdown': (ev, lev, tri) => {
      if (eventConditions['dragmove'](ev, lev, tri)) {
         const isDown = ev.pointers[ev.originEvent.pointerId].displacement[1] > 0;
         return isDown;
      } else return false;
   },

   /* swipeEvent */
   'swipeleft': (ev, lev, tri) => { },
   'swiperight': (ev, lev, tri) => { },
   'swipeup': (ev, lev, tri) => { },
   'swipedown': (ev, lev, tri) => { },

   /* pinchEvent */
   'pinchstart': (ev, lev, tri) => { },
   'pinchmove': (ev, lev, tri) => { },
   'pinchend': (ev, lev, tri) => { },
   'pinchcancel': (ev, lev, tri) => { },
   'pinchin': (ev, lev, tri) => { },
   'pinchout': (ev, lev, tri) => { },

   /* rotateEvent */
   'rotatestart': (ev, lev, tri) => { },
   'rotatemove': (ev, lev, tri) => { },
   'rotateend': (ev, lev, tri) => { },
   'rotatecancel': (ev, lev, tri) => { },
};

/**
 * @name RbGestureEvent
 * @description 手势事件类
 * @class
 * @member {RbEventState} eventState 事件状态
 * @member {RbEventState} lastEventState 上一次事件状态
 * @member {RbEventState} outEventState 输出事件状态
 */
class GestureEvent {
   /**
    * @description 事件状态
    * @type {EventState}
    * @private
    */
   static eventState = new EventState;

   /**
    * @description 上一次事件状态
    * @type {EventState}
    * @private
    */
   static lastEventState = new EventState;

   /**
    * @description 输出事件状态
    * @type {EventState}
    */
   static outEventState = new EventState;

   /**
    * @description 配置
    * @type {Record<String, Number>}
    * @private
    * @constant
    * @member {Number} threshold 识别需要的最小位移
    */
   config = {
      threshold: 10,
   }

   /**
    * @name 构造函数
    * @param {Boolean} _debug 是否开启调试模式
    * @constructor
    * @returns {GestureEvent} - 返回一个RbGestureEvent实例
    * @description 构造函数
    */
   constructor(_debug = false) {
      debug = _debug;
      // 监听触摸相关事件
      [
         ['pointerdown', this.pointerdown],
         ['pointermove', this.pointermove],
         ['pointerup', this.pointerup],
      ].forEach(n => window.addEventListener(n[0], n[1], true));

      if (debug) {
         console.log('loading RbGestureListener');
      }
   }

   /** 
    * @description 更新LastEventState
    */
   updateLastState() {
      const event = GestureEvent.eventState.originEvent;
      GestureEvent.eventState.originEvent = null;

      GestureEvent.lastEventState = structuredClone(GestureEvent.eventState);
      GestureEvent.lastEventState.time = Date.now();
      GestureEvent.lastEventState.originEvent = event;

      GestureEvent.eventState.originEvent = event;
   }

   /**
    * @description 将eventState的数据拷贝到outEventState
    */
   copyState() {
      const event = GestureEvent.eventState.originEvent;
      GestureEvent.eventState.originEvent = null;

      GestureEvent.outEventState = structuredClone(GestureEvent.eventState);
      GestureEvent.outEventState.originEvent = event;

      GestureEvent.eventState.originEvent = event;
   }

   /**
    * @name 处理触摸开始事件
    * @param {PointerEvent} event 
    */
   pointerdown = (event) => {
      this.updateLastState();

      const id = event.pointerId;
      const eventState = GestureEvent.eventState;

      eventState.originEvent = event;

      // 设置事件状态的时间和类型
      eventState.time = Date.now();
      eventState.eventType = 'down';

      // 初始化触摸点信息
      eventState.pointers[id] = {
         move: false,
         firstMove: false,
         velocity: [0, 0],
         displacement: [0, 0],
         location: [event.clientX, event.clientY],
         startLocation: [event.clientX, event.clientY],

         // 设置空计时器，防止之后无脑clear的时候出问题
         velocityTimeOut: setTimeout(() => { }, 100)
      };

      // 处理一个触摸点的情况
      if (eventState.pointerCount == 0) {
         eventState.startTime = Date.now();
      }

      // 处理两个及以上触摸点的情况
      if (eventState.pointerCount == 1) {
         const twoPointerLocation = [
            [eventState.pointers.values[0].clientX, eventState.pointers.values[0].clientY],
            [eventState.pointers.values[1].clientX, eventState.pointers.values[1].clientY]
         ];

         // 计算两点间的初始长度和角度
         eventState.startLength = GestureEvent.eDistance(twoPointerLocation);
         eventState.startAngle = GestureEvent.refAngle(twoPointerLocation);

         // 计算两点间的中点
         eventState.midPoint = GestureEvent.midPoint(twoPointerLocation);
      }

      // 增加触摸点计数
      eventState.pointerCount += 1;
      this.copyState();
   }

   /**
    * @name 处理触摸移动事件
    * @param {PointerEvent} event 
    */
   pointermove = (event) => {
      this.updateLastState();

      const eventState = GestureEvent.eventState;
      const lastEventState = GestureEvent.lastEventState;

      eventState.originEvent = event;

      if (eventState.pointerCount >= 1) {
         const id = event.pointerId;
         const pointer = eventState.pointers[id];

         eventState.time = Date.now();
         eventState.eventType = 'move';

         /* 如果还在移动就取消清零速度 */
         clearTimeout(pointer.velocityTimeOut);

         /* 100ms之后清零速度（符合条件时会被上面阻止） */
         pointer.velocityTimeOut = setTimeout(() => {
            pointer.velocity = [0, 0];
         }, 100);

         pointer.firstMove = !pointer.move; // 记录是否是第一次移动，第一次移动时此时的move为false，先赋值让firtMove下一次才为true
         pointer.move = true;
         pointer.location = [event.clientX, event.clientY];
         pointer.displacement = [event.clientX - pointer.startLocation[0], event.clientY - pointer.startLocation[1]];

         const deltaTime = Date.now() - lastEventState.time;
         pointer.velocity = [
            (pointer.location[0] - lastEventState.pointers[id].location[0]) / deltaTime,
            (pointer.location[1] - lastEventState.pointers[id].location[1]) / deltaTime,
         ];

         if (eventState.pointerCount == 2) {
            const twoPointerLocationg = [
               [eventState.pointers.values[0].clientX, eventState.pointers.values[0].clientY],
               [eventState.pointers.values[1].clientX, eventState.pointers.values[1].clientY]
            ];

            const nowlenth = GestureEvent.eDistance(twoPointerLocationg);
            const nowangle = GestureEvent.refAngle(twoPointerLocationg);

            eventState.scale = nowlenth / eventState.startLength;
            eventState.refAngle = nowangle - eventState.startAngle;
            eventState.midPoint = GestureEvent.midPoint(twoPointerLocationg);
         }

         this.copyState();
      }
   }

   /**
    * @name 处理触摸结束事件
    * @param {PointerEvent} event 
    */
   pointerup = (event) => {
      this.updateLastState();

      const eventState = GestureEvent.eventState;
      eventState.originEvent = event;

      const id = event.pointerId;
      eventState.upponiterId = id;
      delete eventState.pointers[id];

      eventState.time = Date.now();
      eventState.eventType = 'up';
      eventState.pointerCount -= 1;

      this.copyState();
   }

   /**
    * 注册事件
    * @param {HTMLElement} element 元素
    * @param {String} type 事件类型
    * @param {Function} callback 回调函数
    * @returns {void} - 无返回值
    */
   registerEventListener(element, type, callback) {
      if (eventConditions[type] == undefined) {
         if (debug) console.error(`event type ${type} not found`);
         throw new Error(`event type ${type} not found`);
      }

      if (!element[EVENTLIST]) {
         element[EVENTLIST] = {};
         element.addEventListener('pointerdown', GestureEvent.downdispatch, true);
         element.addEventListener('pointermove', GestureEvent.movedispatch, true);
         element.addEventListener('pointerup', GestureEvent.updispatch, true);
         element.addEventListener('pointerout', GestureEvent.outdispatch, true);
      }
      if (!element[EVENTLIST][type]) {
         element[EVENTLIST][type] = [];
      }

      let boundcallback;
      // 判断是否是匿名函数
      if (callback.name != '') {
         // 将未修饰回调函数和修饰后的回调函数的对应关系保存起来
         if (!element[CBMAPPING]) {
            element[CBMAPPING] = new Map;
            boundcallback = callback.bind(element);
            element[CBMAPPING].set(callback, {
               boundcallback: boundcallback,
               count: 1
            });
         } else if (element[CBMAPPING].has(callback)) { // 如果已经注册过了，直接取出来，计数加一，debug模式下输出重复注册警告
            if (debug) console.warn('callback already registered\n', callback);
            const temp = element[CBMAPPING].get(callback);
            boundcallback = temp.boundcallback;
            temp.count += 1;
         }
      } else boundcallback = callback.bind(element);

      element[EVENTLIST][type].push(boundcallback);

      if (debug) {
         console.log(`register event: ${type} on`, element);
         console.log('eventList:', element[EVENTLIST])
      };
   }

   /**
    * 注销事件
    * @param {HTMLElement} element 元素
    * @param {String} type 事件类型
    * @param {Function} callback 回调函数
    * @returns {void} - 无返回值
    */
   cancelEventListener(element, type, callback) {
      if (debug) console.log(`cancel event: ${type} on`, element);

      if (element[CBMAPPING].has(callback)) {
         const list = element[EVENTLIST][type];
         let { boundcallback, count } = element[CBMAPPING].get(callback);

         const index = list.indexOf(boundcallback);
         list.splice(index, 1);

         count -= 1;
         if (count == 0)
            element[CBMAPPING].delete(callback);

         if (element[EVENTLIST][type].length == 0) {
            delete element[EVENTLIST][type];

            if (Object.keys(element[EVENTLIST]).length == 0) {
               delete element[EVENTLIST];
               element.removeEventListener('pointerdown', GestureEvent.downdispatch, true);
               element.removeEventListener('pointermove', GestureEvent.movedispatch, true);
               element.removeEventListener('pointerup', GestureEvent.updispatch, true);
               element.removeEventListener('pointerout', GestureEvent.outdispatch, true);
            }
         }

         if (debug) console.log('eventList:', element[EVENTLIST]);
      } else {
         if (debug)
            console.error(`callback not found\n`, `eventList:`, element[EVENTLIST], '\n', `callback:`, callback);
         throw new Error('callback not found');
      }
   }

   /**
    * @name downdispatch
    * @description 按下事件调度器
    * @param {PointerEvent} event - 事件 
    */
   static downdispatch() {
      // if (debug) console.log('down');

      GestureEvent.dispatchEvent(this, 'down');
      if (GestureEvent.eventState.pointerCount == 1)
         this[LONGTOUCH] = setInterval(() => {
            GestureEvent.longtouchdispatch(this);
         }, 100);
      else if (this[LONGTOUCH])
         clearInterval(this[LONGTOUCH]);
   }

   static longtouchdispatch(element) {
      // if (debug) console.log('longtouch');
      GestureEvent.dispatchEvent(element, 'longtouch');
   }

   static movedispatch() {
      // if (debug) console.log('move');
      if (GestureEvent.eventState.pointerCount >= 1)
         GestureEvent.dispatchEvent(this, 'move');
   }

   static updispatch() {
      // if (debug) console.log('up');
      GestureEvent.dispatchEvent(this, 'up');
      clearInterval(this[LONGTOUCH]);
   }

   static outdispatch() {
      // if (debug) console.log('out');
      clearInterval(this[LONGTOUCH]);
   }

   /**
    * @name dispatchEvent
    * @description 筛选符合触发条件的事件并执行
    * @param {HTMLElement} element - 元素
    * @param {String} trigger - 触发器, 用于筛选符合触发条件的事件
    */
   static dispatchEvent(element, trigger) {
      for (const type of Object.keys(element[EVENTLIST])) {
         if (eventConditions[type](GestureEvent.eventState, GestureEvent.lastEventState, trigger)) {
            element[EVENTLIST][type].forEach(callback => callback(GestureEvent.outEventState));
         }
      }
   }


   /**
    * @name 计算两点间距离
    * @param {Array} param0 第一个点的坐标
    * @param {Array} param1 第二个点的坐标
    * @returns {Number} - 两点间距离
    */
   static eDistance = ([x1, y1], [x2, y2]) => {
      const [dx, dy] = [x1 - x2, y1 - y2];
      return Math.hypot(dx, dy);
   }

   /**
    * @name 计算参考角(两点连线与垂直方向间夹角)
    * @param {Array} param0 第一个点的坐标
    * @param {Array} param1 第二个点的坐标
    * @returns {Number} - 两点连线与垂直方向间夹角
    */
   static refAngle = ([x1, y1], [x2, y2]) => {
      const [dx, dy] = [x1 - x2, y1 - y2];
      return Math.atan2(dy, dx) / Math.PI * 180;
   }

   /**
    * @name 计算两点连线的中点
    * @param {Array} param0 第一个点的坐标
    * @param {Array} param1 第二个点的坐标
    * @returns {Array} - 两点连线的中点坐标
    */
   static midPoint = ([x1, y1], [x2, y2]) => [(x1 - x2) / 2, (y1 - y2) / 2];
}

export { GestureEvent as RbGestureEvent, EventState as RbEventState };