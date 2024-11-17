"use strict";

/** 
 * @name debug 
 * @description 是否开启调试模式
 * @type {Boolean}
 * @default false
 */
let debug = false;

const EVENTLIST = Symbol.for('eventList');
const LONGTOUCH = Symbol.for('longtouch');
const CBMAPPING = Symbol.for('callbackMapping');

/**
 * @name PointerInfo
 * @description 指针信息类
 * @class
 * @member {Boolean} move 是否移动
 * @member {Boolean} firstMove 是否第一次移动
 * @member {Array<Number>} velocity 速度
 * @member {Array<Number>} displacement 指针相对于初始位置的位移
 * @member {Array<Number>} location 指针当前位置
 * @member {Array<Number>} startLocation 初始位置
 * @member {Number} velocityTimeOut 速度清零计时器
 * @private
 */
class PointerInfo {
   move = false;
   firstMove = false;
   velocity = [0, 0];
   displacement = [0, 0];
   location = [0, 0];
   startLocation = [0, 0];
   velocityTimeOut = setTimeout(() => { }, 100);
}

/**
 * @name RbEventState
 * @description 事件状态类
 * @class
 * @member {Date} time 事件发生时间
 * @member {String} eventType 事件类型
 * @member {Number} scale 缩放比例
 * @member {Number} refAngle 参考角
 * @member {Array<Number>} midPoint 中点坐标
 * @member {Number} clickTimes 点击次数
 * @member {Number} startLenth 初始长度
 * @member {Number} startAngle 初始角度
 * @member {Date} startTime 初始时间
 * @member {Array<PointerInfo>} pointers 指针
 * @member {PointerInfo} triggerPointer 触发指针
 * @member {Number} pointerCount 指针数量
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
   triggerPointer = new PointerInfo;
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
         const isMove = ev.triggerPointer.move == false;
         return isInTime && isMove;
      } else return false;
   },
   'doubleclick': (() => {
      let clickCount = 0; // click次数计数器
      let lastClickTime = new Date(1970); // 避免第一次点击时的时间判断出错
      let lastClickLocation = [0, 0];
      return (ev, lev, tri) => {
         if (tri == 'up') {
            const pointer = ev.triggerPointer;
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
            const isMove = ev.triggerPointer.move == false;
            const isUp = up;

            const isFirstTimes = count == 0; // 避免重复触发
            if (isDelayEnough && isSinglePointer && isFirstTimes && isMove && !isUp) {
               count += 1;
               return true;
            } else return false;
         } else return false;
      }
   })(),

   /* dragEvent */
   'dragstart': (ev, lev, tri) => {
      if (tri == 'move') {
         // 判断是否是单指操作，是否是第一次移动触发，是否移动了
         const isSinglePointer = ev.pointerCount == 1;
         const isFirstMove = ev.triggerPointer.firstMove;
         const isMove = ev.triggerPointer.move;
         return isSinglePointer && isFirstMove && isMove;
      } else return false;
   },
   'dragmove': (ev, lev, tri) => {
      if (tri == 'move') {
         // 判断是否是单指操作，是否不是第一次移动触发，是否移动了
         const isSinglePointer = ev.pointerCount == 1;
         const isNotFirstMove = !ev.triggerPointer.firstMove;
         const isMove = ev.triggerPointer.move;
         return isSinglePointer && isMove && isNotFirstMove;
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
   'dragcancel': (() => {
      let isStart = false;
      return (ev, lev, tri) => {
         if (eventConditions['dragstart'](ev, lev, tri)) {
            isStart = true;
         }
         if ((isStart && tri == 'cancel') || (tri == 'down' && ev.pointerCount > 1)) {
            isStart = false;
            return true;
         } else return false;
      }
   })(),
   'dragleft': (ev, lev, tri) => {
      if (eventConditions['dragmove'](ev, lev, tri)) {
         const isLeft = ev.triggerPointer.displacement[0] < 0;
         return isLeft;
      } else return false;
   },
   'dragright': (ev, lev, tri) => {
      if (eventConditions['dragmove'](ev, lev, tri)) {
         const isRight = ev.triggerPointer.displacement[0] > 0;
         return isRight;
      } else return false;
   },
   'dragup': (ev, lev, tri) => {
      if (eventConditions['dragmove'](ev, lev, tri)) {
         const isUp = ev.triggerPointer.displacement[1] < 0;
         return isUp;
      } else return false;
   },
   'dragdown': (ev, lev, tri) => {
      if (eventConditions['dragmove'](ev, lev, tri)) {
         const isDown = ev.triggerPointer.displacement[1] > 0;
         return isDown;
      } else return false;
   },

   /* swipeEvent */
   'swipeleft': (ev, lev, tri) => {
      if (tri == 'up') {
         const [disX, disY] = ev.triggerPointer.displacement;
         const isSinglePointer = ev.pointerCount == 0;
         const isLeftEnough = disX < -10;
         const isLeftMost = disX < 0 && Math.abs(disX) > Math.abs(disY);
         const isMove = ev.triggerPointer.move;
         const velocityEnough = ev.triggerPointer.velocity[0] < -0.3;
         return isSinglePointer && isMove && isLeftMost && isLeftEnough && velocityEnough;
      } else return false;
   },
   'swiperight': (ev, lev, tri) => {
      if (tri == 'up') {
         const [disX, disY] = ev.triggerPointer.displacement;
         const isSinglePointer = ev.pointerCount == 0;
         const isRightEnough = disX > 10;
         const isRightMost = disX > 0 && Math.abs(disX) > Math.abs(disY);
         const isMove = ev.triggerPointer.move;
         const velocityEnough = ev.triggerPointer.velocity[0] > 0.3;
         return isSinglePointer && isMove && isRightMost && isRightEnough && velocityEnough;
      } else return false;
   },
   'swipeup': (ev, lev, tri) => {
      if (tri == 'up') {
         const [disX, disY] = ev.triggerPointer.displacement;
         const isSinglePointer = ev.pointerCount == 0;
         const isUpEnough = disY < -10;
         const isUpMost = disY < 0 && Math.abs(disY) > Math.abs(disX);
         const isMove = ev.triggerPointer.move;
         const velocityEnough = ev.triggerPointer.velocity[1] < -0.3;
         return isSinglePointer && isMove && isUpMost && isUpEnough && velocityEnough;
      } else return false;
   },
   'swipedown': (ev, lev, tri) => {
      if (tri == 'up') {
         const [disX, disY] = ev.triggerPointer.displacement;
         const isSinglePointer = ev.pointerCount == 0;
         const isDownEnough = disY > 10;
         const isDownMost = disY > 0 && Math.abs(disY) > Math.abs(disX);
         const isMove = ev.triggerPointer.move;
         const velocityEnough = ev.triggerPointer.velocity[1] > 0.3;
         return isSinglePointer && isMove && isDownMost && isDownEnough && velocityEnough;
      } else return false;
   },


   /* pinchEvent */
   'pinchstart': (ev, lev, tri) => {
      if (tri == 'move') {
         // 判断是否是双指操作，是否是第一次移动触发，是否移动了，两指间距是否改变了
         const isTwoPointer = ev.pointerCount == 2;
         const isFirstMove = ev.triggerPointer.firstMove;
         const isMove = ev.triggerPointer.move;
         const isZoom = Math.abs(ev.scale - 1) > 0.1;
         return isTwoPointer && isFirstMove && isMove && isZoom;
      } else return false;
   },
   'pinchmove': (ev, lev, tri) => {
      if (tri == 'move') {
         // 判断是否是双指操作，是否不是第一次移动触发 ，是否移动了，两指间距是否改变了
         const isTwoPointer = ev.pointerCount == 2;
         const isMove = ev.triggerPointer.move;
         const isNotFirstMove = !ev.triggerPointer.firstMove;
         const isZoom = Math.abs(ev.scale - 1) > 0.1;
         return isTwoPointer && isMove && isNotFirstMove && isZoom;
      } else return false;
   },
   'pinchend': (() => {
      let isStart = false;
      return (ev, lev, tri) => {
         if (eventConditions['pinchstart'](ev, lev, tri)) {
            isStart = true;
         }
         if ((isStart && tri == 'up') || (tri == 'down' && ev.pointerCount > 2)) {
            isStart = false;
            return true;
         } else return false;
      }
   })(),
   'pinchcancel': (() => {
      let isStart = false;
      return (ev, lev, tri) => {
         if (eventConditions['pinchstart'](ev, lev, tri)) {
            isStart = true;
         }
         if ((isStart && tri == 'cancel') || (tri == 'down' && ev.pointerCount > 2)) {
            isStart = false;
            return true;
         } else return false;
      }
   })(),
   'pinchin': (ev, lev, tri) => {
      if (eventConditions['pinchmove'](ev, lev, tri)) {
         const isPinchIn = ev.scale < 1;
         return isPinchIn;
      } else return false;
   },
   'pinchout': (ev, lev, tri) => {
      if (eventConditions['pinchmove'](ev, lev, tri)) {
         const isPinchOut = ev.scale > 1;
         return isPinchOut;
      } else return false
   },

   /* rotateEvent */
   'rotatestart': (ev, lev, tri) => {
      if (tri == 'move') {
         // 判断是否是双指操作，是否是第一次移动触发，是否移动了，两指间角度是否改变了
         const isTwoPointer = ev.pointerCount == 2;
         const isFirstMove = ev.triggerPointer.firstMove;
         const isMove = ev.triggerPointer.move;
         const isRotate = Math.abs(ev.refAngle) > 5;
         return isTwoPointer && isFirstMove && isMove && isRotate;
      } else return false;
   },
   'rotatemove': (ev, lev, tri) => {
      if (tri == 'move') {
         // 判断是否是双指操作，是否不是第一次移动触发 ，是否移动了，两指间角度是否改变了
         const isTwoPointer = ev.pointerCount == 2;
         const isMove = ev.triggerPointer.move;
         const isNotFirstMove = !ev.triggerPointer.firstMove;
         const isRotate = Math.abs(ev.refAngle) > 5;
         return isTwoPointer && isMove && isNotFirstMove && isRotate;
      } else return false;
   },
   'rotateend': (() => {
      let isStart = false;
      return (ev, lev, tri) => {
         if (eventConditions['rotatestart'](ev, lev, tri)) {
            isStart = true;
         }
         if ((isStart && tri == 'up') || (tri == 'down' && ev.pointerCount > 2)) {
            isStart = false;
            return true;
         } else return false;
      }
   })(),
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
    * @constructor
    * @returns {GestureEvent} - 返回一个RbGestureEvent实例
    * @description 构造函数
    */
   constructor() {
      // 监听触摸相关事件
      document.addEventListener('DOMContentLoaded', () => {
         [
            ['pointerdown', this.pointerdown],
            ['pointermove', this.pointermove],
            ['pointerup', this.pointerup],
            ['pointercancel', this.pointerCancel],
         ].forEach(n => window.addEventListener(n[0], n[1], true));
      });
   }

   /**
    * @description 设置调试模式
    * @param {Boolean} _debug - 是否开启调试模式
    */
   setDebug(_debug) {
      debug = _debug;
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
    * 更新指针状态数据
    * @param {PointerEvent} event - 指针事件
    * @param {EventState} eventState - 当前事件状态
    * @param {String} eventType - 事件类型 (down/move/up/cancel)
    * @private
    */
   updateEventState(event, eventState, eventType) {
      const id = event.pointerId;
      
      eventState.originEvent = event;
      eventState.time = Date.now();
      eventState.eventType = eventType;
      eventState.triggerPointer = eventState.pointers[id];
   }

   /**
    * 处理双指手势计算
    * @param {EventState} eventState - 当前事件状态
    * @private 
    */
   updateTwoPointerState(eventState) {
      const pointers = [...eventState.pointers.values()];
      const twoPointerLocation = pointers.map(p => [p.clientX, p.clientY]);

      eventState.startLength = GestureEvent.eDistance(twoPointerLocation);
      eventState.startAngle = GestureEvent.refAngle(twoPointerLocation); 
      eventState.midPoint = GestureEvent.midPoint(twoPointerLocation);
   }

   /**
    * 更新指针移动速度
    * @param {Object} pointer - 指针状态对象
    * @param {EventState} lastState - 上一次事件状态
    * @param {Number} id - 指针ID
    * @private
    */
   updateVelocity(pointer, lastState, id) {
      clearTimeout(pointer.velocityTimeOut);

      pointer.velocityTimeOut = setTimeout(() => {
         pointer.velocity = [0, 0];
      }, 100);

      const deltaTime = Date.now() - lastState.time;
      pointer.velocity = [
         (pointer.location[0] - lastState.pointers[id].location[0]) / deltaTime,
         (pointer.location[1] - lastState.pointers[id].location[1]) / deltaTime
      ];
   }

   /**
    * 指针按下事件处理器
    * @param {PointerEvent} event 
    */
   pointerdown = (event) => {
      this.updateLastState();
      const eventState = GestureEvent.eventState;
      
      this.updateEventState(event, eventState, 'down');

      // 初始化新的指针数据
      const id = event.pointerId;
      eventState.pointers[id] = {
         move: false,
         firstMove: false,
         velocity: [0, 0],
         displacement: [0, 0],
         location: [event.clientX, event.clientY],
         startLocation: [event.clientX, event.clientY],
         velocityTimeOut: setTimeout(() => { }, 100)
      };

      eventState.triggerPointer = eventState.pointers[id];

      if (eventState.pointerCount === 0) {
         eventState.startTime = Date.now();
      }
      
      if (eventState.pointerCount === 1) {
         this.updateTwoPointerState(eventState);
      }

      eventState.pointerCount++;
      this.copyState();
   }

   /**
    * 指针移动事件处理器  
    * @param {PointerEvent} event
    */
   pointermove = (event) => {
      this.updateLastState();
      const eventState = GestureEvent.eventState;
      const lastState = GestureEvent.lastEventState;

      if (eventState.pointerCount < 1) return;

      this.updateEventState(event, eventState, 'move');

      const id = event.pointerId;
      const pointer = eventState.pointers[id];

      // 更新指针状态
      pointer.firstMove = !pointer.move;
      pointer.move = true;
      pointer.location = [event.clientX, event.clientY];
      pointer.displacement = [
         event.clientX - pointer.startLocation[0], 
         event.clientY - pointer.startLocation[1]
      ];

      this.updateVelocity(pointer, lastState, id);

      if (eventState.pointerCount === 2) {
         this.updateTwoPointerState(eventState);
      }

      this.copyState();
   }

   /**
    * 指针抬起事件处理器
    * @param {PointerEvent} event
    */
   pointerup = (event) => {
      this.updateLastState();
      const eventState = GestureEvent.eventState;

      this.updateEventState(event, eventState, 'up');
      
      eventState.pointers[event.pointerId] = null;
      eventState.pointerCount--;

      this.copyState(); 
   }

   /**
    * 指针取消事件处理器
    * @param {PointerEvent} event 
    */
   pointerCancel = (event) => {
      this.updateLastState();
      const eventState = GestureEvent.eventState;

      this.updateEventState(event, eventState, 'cancel');

      eventState.pointers[event.pointerId] = null;
      eventState.pointerCount--;

      this.copyState();
   }

   /**
    * 注册事件
    * @param {HTMLElement} element 元素
    * @param {String} type 事件类型
    * @param {(eventState: EventState) => void} callback 回调函数
    * @returns {void} - 无返回值
    */
   registerEventListener(element, type, callback) {
      if (eventConditions[type] == undefined) {
         throw new Error(`event type ${type} not found`);
      }

      // 如果元素没有事件列表，添加事件监听器，否则直接添加事件
      if (!element[EVENTLIST]) {
         element[EVENTLIST] = {};
         element.addEventListener('pointerdown', GestureEvent.downDispatch);
         element.addEventListener('pointermove', GestureEvent.moveDispatch);
         element.addEventListener('pointerup', GestureEvent.upDispatch);
         element.addEventListener('pointerout', GestureEvent.outDispatch);
         element.addEventListener('pointercancel', GestureEvent.cancelDispatch);
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
               element.removeEventListener('pointerdown', GestureEvent.downDispatch);
               element.removeEventListener('pointermove', GestureEvent.moveDispatch);
               element.removeEventListener('pointerup', GestureEvent.upDispatch);
               element.removeEventListener('pointerout', GestureEvent.outDispatch);
            }
         }

         if (debug) console.log('eventList:', element[EVENTLIST]);
      } else {
         if (debug) console.error(`callback not found\n`, `eventList:`, element[EVENTLIST], '\n', `callback:`, callback);
         throw new Error('callback not found');
      }
   }

   /**
    * @description 设置事件触发条件
    * @param {String} type - 事件类型
    * @param {(ev: EventState, lev: EventState, tri: String) => Boolean} condition - 条件函数
    */
   setCondition(type, condition) {
      if (eventConditions[type]) {
         if (debug) console.warn(`event type ${type} already exists, will be overwritten`);
      }
      eventConditions[type] = condition;
   }

   /**
    * @description 移除事件触发条件
    * @param {String} type - 事件类型
    */
   removeCondition(type) {
      if (eventConditions[type]) {
         delete eventConditions[type];
      } else {
         throw new Error(`event type ${type} not found`);
      }
   }

   /**
    * @name downdispatch
    * @description 按下事件调度器
    * @param {PointerEvent} event - 事件 
    */
   static downDispatch() {
      GestureEvent.dispatchEvent(this, 'down');
      if (GestureEvent.eventState.pointerCount == 1)
         this[LONGTOUCH] = setInterval(() => {
            GestureEvent.longtouchDispatch(this);
         }, 100);
      else if (this[LONGTOUCH])
         clearInterval(this[LONGTOUCH]);
   }

   static longtouchDispatch(element) {
      GestureEvent.dispatchEvent(element, 'longtouch');
   }

   static moveDispatch() {
      if (GestureEvent.eventState.pointerCount >= 1)
         GestureEvent.dispatchEvent(this, 'move');
   }

   static upDispatch() {
      GestureEvent.dispatchEvent(this, 'up');
      clearInterval(this[LONGTOUCH]);
   }

   static outDispatch() {
      clearInterval(this[LONGTOUCH]);
   }

   static cancelDispatch() {
      GestureEvent.dispatchEvent(this, 'cancel');
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

// 使用单例模式
const gestureInstance = new GestureEvent();

export { gestureInstance as RbGestureEvent, EventState as RbEventState };