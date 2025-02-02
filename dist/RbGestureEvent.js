var RbGestureEvent;
/******/ // The require scope
/******/ var __webpack_require__ = {};
/******/ 
/************************************************************************/
/******/ /* webpack/runtime/define property getters */
/******/ (() => {
/******/ 	// define getter functions for harmony exports
/******/ 	__webpack_require__.d = (exports, definition) => {
/******/ 		for(var key in definition) {
/******/ 			if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 				Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 			}
/******/ 		}
/******/ 	};
/******/ })();
/******/ 
/******/ /* webpack/runtime/hasOwnProperty shorthand */
/******/ (() => {
/******/ 	__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ })();
/******/ 
/******/ /* webpack/runtime/make namespace object */
/******/ (() => {
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = (exports) => {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/ })();
/******/ 
/************************************************************************/
var __webpack_exports__ = {};
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   RbEventState: () => (/* binding */ EventState),
/* harmony export */   RbGestureEvent: () => (/* binding */ Public),
/* harmony export */   RbPointerInfo: () => (/* binding */ PointerInfo)
/* harmony export */ });

/**
 * @author Nor.E & Null -
 * @description RbGestureEvent.js
 * @version 1.1.1
 * @license MIT
 * @repository Null-NorE/RbGestureEvent
 */
// 版本号，用于调试
const version = '1.1.1';

/** 
 * @name debug 
 * @description 是否开启调试模式
 * @type {Boolean}
 * @default false
 */
let debug = false;

const EVENTLIST = Symbol.for('RBEventList');
const LONGTOUCH = Symbol.for('RBLongtouch');
const CALLBACKMAP = Symbol.for('RBCallbackMap');

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
   velocityTimeOut = setTimeout(() => { }, 1);
}

/**
 * @name RbEventState
 * @description 事件状态类
 * @class
 * @member {Date} time 事件发生时间
 * @member {String} eventType 事件类型
 * @member {Number} scale 相对于初始双指针间距的比例
 * @member {Number} deltaAngle 相对于初始角度的角度变化
 * @member {Array<Number>} midPoint 第一个和第二个指针连线的中点
 * @member {Number} maxPoint 从第一个指针接触开始到现在的最大指针数 用法：maxPoint == 1 ? 单指操作 : 多指操作
 * @member {Number} clickCount 点击次数
 * @member {Array<Number>} lastClickLocation 上次点击位置
 * @member {Date} lastClickTime 上次点击时间
 * @member {Boolean} isRotate 是否旋转
 * @member {Boolean} firstRotate 是否第一次触发旋转事件
 * @member {Boolean} isPinch 是否缩放
 * @member {Boolean} firstPinch 是否第一次触发缩放事件
 * @member {Number} startLenth 初始长度
 * @member {Number} startAngle 初始角度
 * @member {Date} startTime 初始时间
 * @member {Map<Number, PointerInfo>} pointers 指针信息
 * @member {PointerInfo} triggerPointer 触发指针
 * @member {Number} pointerCount 指针数量
 * @member {PointerEvent} originEvent 原始事件
 */
class EventState {
   time = Date.now();
   eventType = '';

   scale = 1;
   deltaAngle = 0;
   midPoint = [0, 0];
   midDisplacement = [0, 0];

   maxPoint = 0;
   clickCount = 0;
   lastClickLocation = [0, 0];
   lastClickTime = Date.now();

   isRotate = false;
   firstRotate = false;
   isPinch = false;
   firstPinch = false;

   startLength = 0;
   startAngle = 0;
   startTime = Date.now();

   pointers = new Map();
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
         return ev.clickCount >= 1;
      } else return false;
   },
   'doubleclick': (ev, lev, tri) => {
      if (eventConditions['click'](ev, lev, tri)) {
         return ev.clickCount % 2 == 0 && ev.clickCount > 0;
      } else return false;
   },
   'longtouch': (ev, lev, tri) => {
      if (tri == 'longtouch') {
         const isDelayEnough = Date.now() - ev.startTime >= 500;
         const isSinglePointer = ev.maxPoint == 1;
         const isMove = !ev.triggerPointer.move;
         return isDelayEnough && isSinglePointer && isMove;
      } else return false;
   },

   /* dragEvent */
   'dragstart': (ev, lev, tri) => {
      if (tri == 'move' || tri == 'up') {
         // 判断当前是否是单指操作，是否是第一次移动触发或是被双指变单指触发，是否移动了
         const isSinglePointer = ev.pointerCount == 1;
         const isSinglePointerLast = lev.pointerCount == 1;
         const isFirstMove = ev.triggerPointer.firstMove;
         const isMove = ev.triggerPointer.move;
         return isSinglePointer && (isFirstMove || !isSinglePointerLast) && isMove;
      } else return false;
   },
   'dragmove': (ev, lev, tri) => {
      if (tri == 'move') {
         // 判断当前是否是单指操作，是否不是第一次移动触发，是否移动了
         const isSinglePointer = ev.pointerCount == 1;
         const isFirstMove = ev.triggerPointer.firstMove;
         const isMove = ev.triggerPointer.move;
         return isSinglePointer && isMove && !isFirstMove;
      } else return false;
   },
   'dragend': (ev, lev, tri) => {
      if (tri == 'up' || tri == 'down') {
         // 前一事件的指针数为1而现在不是，且上一次事件中已移动
         const isSinglePointer = lev.pointerCount == 1;
         const isSinglePointerNow = ev.pointerCount != 1;
         const isMove = ev.triggerPointer.move;
         return isSinglePointer && isMove && isSinglePointerNow;
      }
   },
   'dragcancel': (ev, lev, tri) => {
      if (tri == 'cancel' || tri == 'down') {
         // 前一事件的指针数为1而现在不是，且上一次事件中已移动
         const isSinglePointer = lev.pointerCount == 1;
         const isSinglePointerNow = ev.pointerCount != 1;
         const isMove = ev.triggerPointer.move;
         return isSinglePointer && isMove && isSinglePointerNow;
      } else return false;
   },
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

   /* doubelDragEvent */
   'doubledragstart': (ev, lev, tri) => {
      if (tri == 'move' || tri == 'down') {
         // 判断当前是否是双指操作，是否是第一次移动触发，或是被单指变双指触发，是否移动了
         const isTwoPointer = ev.pointerCount == 2;
         const isSinglePointerLast = lev.pointerCount == 2;
         const isFirstMove = ev.triggerPointer.firstMove || lev.triggerPointer.firstMove;
         const isMove = ev.triggerPointer.move || lev.triggerPointer.move;
         return isTwoPointer && (isFirstMove || !isSinglePointerLast) && isMove;
      } else return false;
   },
   'doubledragmove': (ev, lev, tri) => {
      if (tri == 'move') {
         // 判断是否是双指操作，是否不是第一次移动触发，是否移动了
         const isTwoPointer = ev.pointerCount == 2;
         const isFirstMove = ev.triggerPointer.firstMove || lev.triggerPointer.firstMove;
         const isMove = ev.triggerPointer.move || lev.triggerPointer.move;
         return isTwoPointer && isMove && !isFirstMove;
      } else return false;
   },
   'doubledragend': (ev, lev, tri) => {
      if (tri == 'up' || tri == 'down') {
         // 前一事件的指针数为2而现在不是，且上一次事件中已移动
         const isSinglePointer = lev.pointerCount == 2;
         const isSinglePointerNow = ev.pointerCount != 2;
         const isMove = ev.triggerPointer.move;
         return isSinglePointer && isMove && isSinglePointerNow;
      } else return false;
   },
   'doubledragcancel': (ev, lev, tri) => {
      if (tri == 'cancel' || tri == 'down') {
         // 前一事件的指针数为1而现在不是，且上一次事件中已移动
         const isSinglePointer = lev.pointerCount == 2;
         const isSinglePointerNow = ev.pointerCount != 2;
         const isMove = ev.triggerPointer.move;
         return isSinglePointer && isMove && isSinglePointerNow;
      } else return false;
   },

   /* swipeEvent */
   'swipeleft': (ev, lev, tri) => {
      if (tri == 'up') {
         const [disX, disY] = ev.triggerPointer.displacement;
         const isSinglePointer = lev.maxPoint == 1;
         const isLeftEnough = disX < -Data.config.threshold;
         const isLeftMost = disX < 0 && Math.abs(disX) > Math.abs(disY);
         const isMove = ev.triggerPointer.move;
         const velocityEnough = ev.triggerPointer.velocity[0] < -Data.config.swipeVelocityThreshold;
         return isSinglePointer && isMove && isLeftMost && isLeftEnough && velocityEnough;
      } else return false;
   },
   'swiperight': (ev, lev, tri) => {
      if (tri == 'up') {
         const [disX, disY] = ev.triggerPointer.displacement;
         const isSinglePointer = lev.maxPoint == 1;
         const isRightEnough = disX > Data.config.threshold;
         const isRightMost = disX > 0 && Math.abs(disX) > Math.abs(disY);
         const isMove = ev.triggerPointer.move;
         const velocityEnough = ev.triggerPointer.velocity[0] > Data.config.swipeVelocityThreshold;
         return isSinglePointer && isMove && isRightMost && isRightEnough && velocityEnough;
      } else return false;
   },
   'swipeup': (ev, lev, tri) => {
      if (tri == 'up') {
         const [disX, disY] = ev.triggerPointer.displacement;
         const isSinglePointer = lev.maxPoint == 1;
         const isUpEnough = disY < -Data.config.threshold;
         const isUpMost = disY < 0 && Math.abs(disY) > Math.abs(disX);
         const isMove = ev.triggerPointer.move;
         const velocityEnough = ev.triggerPointer.velocity[1] < -Data.config.swipeVelocityThreshold;
         return isSinglePointer && isMove && isUpMost && isUpEnough && velocityEnough;
      } else return false;
   },
   'swipedown': (ev, lev, tri) => {
      if (tri == 'up') {
         const [disX, disY] = ev.triggerPointer.displacement;
         const isSinglePointer = lev.maxPoint == 1;
         const isDownEnough = disY > Data.config.threshold;
         const isDownMost = disY > 0 && Math.abs(disY) > Math.abs(disX);
         const isMove = ev.triggerPointer.move;
         const velocityEnough = ev.triggerPointer.velocity[1] > Data.config.swipeVelocityThreshold;
         return isSinglePointer && isMove && isDownMost && isDownEnough && velocityEnough;
      } else return false;
   },


   /* pinchEvent */
   'pinchstart': (ev, lev, tri) => {
      if (tri == 'move') {
         // 是否是第一次触发，两指间距是否改变了
         const isPinch = ev.isPinch;
         const firstPinch = ev.firstPinch;
         return isPinch && firstPinch;
      } else return false;
   },
   'pinchmove': (ev, lev, tri) => {
      if (tri == 'move') {
         // 是否不是第一次触发，两指间距是否改变了
         const isPinch = ev.isPinch;
         const firstPinch = ev.firstPinch;
         return isPinch && !firstPinch;
      } else return false;
   },
   'pinchend': (ev, lev, tri) => {
      if (tri == 'up') {
         const isPinch = lev.isPinch;
         const isPinchEnd = !ev.isPinch;
         return isPinch && isPinchEnd;
      } else return false;
   },
   'pinchcancel': (ev, lev, tri) => {
      if (tri == 'cancel') {
         const isPinch = lev.isPinch;
         const isPinchEnd = !ev.isPinch;
         return isPinch && isPinchEnd;
      } else return false;
   },
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
         // 是否是第一次触发，两指角度是否改变了
         const isRotate = ev.isRotate;
         const firstRotate = ev.firstRotate;
         return isRotate && firstRotate;
      } else return false;
   },
   'rotatemove': (ev, lev, tri) => {
      if (tri == 'move') {
         // 是否不是第一次触发，两指角度是否改变了
         const isRotate = ev.isRotate;
         const firstRotate = ev.firstRotate;
         return isRotate && !firstRotate;
      } else return false;
   },
   'rotateend': (ev, lev, tri) => {
      if (tri == 'up') {
         const isRotate = lev.isRotate;
         const isRotateEnd = !ev.isRotate;
         return isRotate && isRotateEnd;
      } else return false;
   },
   'rotatecancel': (ev, lev, tri) => {
      if (tri == 'cancel') {
         const isRotate = lev.isRotate;
         const isRotateEnd = !ev.isRotate;
         return isRotate && isRotateEnd;
      } else return false;
   },
};

/**
 * @description 手势事件数据类
 * @class
 * @member {EventState} eventState 事件状态
 * @member {EventState} lastEventState 上一次事件状态
 * @member {EventState} outEventState 输出事件状态
 * @member {Record<String, Function>} condition 事件触发条件
 * @member {Record<String, Number>} config 配置
 */
class Data {
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
    * @description 事件是否触发
    * @type {Record<String, (ev: EventState, lev: EventState, tri: String) => Boolean>}
    */
   static condition = {};

   /**
    * @description 配置
    * @type {Record<String, Number>}
    * @private
    * @constant
    * @member {Number} threshold 识别需要的最小位移
    */
   static config = {
      threshold: 5, // 识别需要的最小位移
      swipeVelocityThreshold: 0.3, // swipe识别需要的最小速度
      clickThreshold: 500, // click识别需要的最大时间
      longtouchThreshold: 500, // longtouch识别需要的最小时间
      angleThreshold: 5, // 旋转识别需要的最小角度
      scaleThreshold: 0.05, // 缩放识别需要的最小比例
   }
}

/**
 * @description 手势事件私有方法类
 * @class
 */
class Private {
   /**
    * @description 处理originEvent并克隆状态
    * @param {Object} targetState - 目标状态对象
    */
   static cloneStateTo(targetState) {
      const event = Data.eventState.originEvent;
      Data.eventState.originEvent = null;
      Data[targetState] = structuredClone(Data.eventState);
      Data[targetState].originEvent = event;
      Data.eventState.originEvent = event;
   }

   /**
    * @description 拷贝eventState的数据到lastEventState
    */
   static copyStateToLast() {
      this.cloneStateTo('lastEventState');
      Data.lastEventState.time = Date.now();
   }

   /**
    * @description 将eventState的数据拷贝到outEventState
    */
   static copyState() {
      this.cloneStateTo('outEventState');
   }

   /**
    * 更新指针状态数据
    * @param {PointerEvent} event - 指针事件
    * @param {EventState} eventState - 当前事件状态
    * @param {String} eventType - 事件类型 (down/move/up/cancel)
    * @private
    */
   static updateEventState(event, eventState, eventType) {
      const id = event.pointerId;

      eventState.originEvent = event;
      eventState.time = Date.now();
      eventState.eventType = eventType;
      eventState.triggerPointer = eventState.pointers.get(id);
   }

   /**
    * 初始化双指手势计算
    * @param {EventState} eventState - 当前事件状态
    * @private 
    */
   static initializeTwoPointerState(eventState) {
      const twoPointerLocation = [...eventState.pointers.values()]
         .slice(0, 2)
         .map(p => [p.location[0], p.location[1]]);

      eventState.startLength = Private.eDistance(...twoPointerLocation);
      eventState.startAngle = Private.refAngle(...twoPointerLocation);
      eventState.midPoint = Private.midPoint(...twoPointerLocation);
   }

   /**
    * 更新双指手势计算
    * @param {EventState} eventState - 当前事件状态
    * @private
    */
   static updateTwoPointerState(eventState) {
      const [p1, p2] = [...eventState.pointers.values()].slice(0, 2);

      // 获取位置和位移
      const { location: l1, displacement: d1 } = p1;
      const { location: l2, displacement: d2 } = p2;

      const nowLength = Private.eDistance(l1, l2);
      const nowAngle = Private.refAngle(l1, l2);

      eventState.scale = nowLength / eventState.startLength;
      eventState.deltaAngle = nowAngle - eventState.startAngle;
      eventState.midPoint = Private.midPoint(l1, l2);
      eventState.midDisplacement = Private.midPoint(d1, d2);
   }

   /**
    * 更新指针移动速度
    * @param {Object} pointer - 指针状态对象
    * @param {EventState} lastState - 上一次事件状态
    * @param {Number} id - 指针ID
    * @private
    */
   static updateVelocity(pointer, lastState, id) {
      clearTimeout(pointer.velocityTimeOut);

      pointer.velocityTimeOut = setTimeout(() => {
         pointer.velocity = [0, 0];
      }, 100);

      const deltaTime = Date.now() - lastState.time;
      pointer.velocity = [
         (pointer.location[0] - lastState.pointers.get(id).location[0]) / deltaTime,
         (pointer.location[1] - lastState.pointers.get(id).location[1]) / deltaTime
      ];
   }

   /**
    * 指针按下事件处理器
    * @param {PointerEvent} event 
    */
   static pointerdown = event => {
      Private.copyStateToLast();
      const eventState = Data.eventState;

      Private.updateEventState(event, eventState, 'down');

      // 初始化新的指针数据
      const id = event.pointerId;
      eventState.pointers.set(id, {
         move: false,
         firstMove: false,
         velocity: [0, 0],
         displacement: [0, 0],
         location: [event.clientX, event.clientY],
         startLocation: [event.clientX, event.clientY],
         velocityTimeOut: setTimeout(() => { }, 100)
      });

      eventState.triggerPointer = eventState.pointers.get(id);
      eventState.pointerCount++;
      eventState.maxPoint = Math.max(eventState.maxPoint, eventState.pointerCount);

      if (eventState.pointerCount == 1) {
         eventState.startTime = Date.now();
      }

      if (eventState.pointerCount == 2) {
         Private.initializeTwoPointerState(eventState);
      }

      Private.copyState();
   }

   /**
    * 指针移动事件处理器  
    * @param {PointerEvent} event
    */
   static pointermove = event => {
      Private.copyStateToLast();
      const eventState = Data.eventState;
      const lastState = Data.lastEventState;

      if (eventState.pointerCount < 1) return;

      const id = event.pointerId;
      const pointer = eventState.pointers.get(id);
      const displacement = [
         event.clientX - pointer.startLocation[0],
         event.clientY - pointer.startLocation[1]
      ];
      if (Math.hypot(...displacement) > Data.config.threshold) {
         Private.updateEventState(event, eventState, 'move'); // 因为triggerPointer是引用类型，所以即使还没更新指针数据，triggerPointer也会随着eventState.pointers更新

         // 更新指针状态
         pointer.firstMove = !pointer.move;
         pointer.move = true;
         pointer.location = [event.clientX, event.clientY];
         pointer.displacement = displacement;

         Private.updateVelocity(pointer, lastState, id);

         if (eventState.pointerCount >= 2) {
            Private.updateTwoPointerState(eventState);
         }
         eventState.firstRotate = !eventState.isRotate;
         eventState.isRotate = Math.abs(eventState.deltaAngle) >= Data.config.angleThreshold || eventState.isRotate;
         eventState.firstPinch = !eventState.isPinch;
         eventState.isPinch = Math.abs(1 - eventState.scale) >= Data.config.scaleThreshold || eventState.isPinch;

         Private.copyState();
      }
   }

   /**
    * 指针抬起事件处理器
    * @param {PointerEvent} event
    */
   static pointerup = event => {
      Private.copyStateToLast();
      const eventState = Data.eventState;

      Private.updateEventState(event, eventState, 'up');

      eventState.pointers.delete(event.pointerId);
      eventState.pointerCount--;
      // 判定是否是点击事件
      if (eventState.maxPoint == 1
         && eventState.startTime - eventState.time < 500
         && !eventState.triggerPointer.move) {
         // 判定是否是连续点击事件
         if (Private.eDistance(eventState.triggerPointer.location, eventState.lastClickLocation) < 20
            && Date.now() - eventState.lastClickTime < 500) {
            eventState.clickCount++;
         } else {
            eventState.clickCount = 1;
         }
         // 记录为上次点击时间和坐标
         eventState.lastClickTime = Date.now();
         eventState.lastClickLocation = [...eventState.triggerPointer.location];
      } else {
         eventState.clickCount = 0;
      }
      // 判定是否不具备旋转和缩放条件（指针数小于2）
      if (eventState.pointerCount < 2) {
         eventState.isRotate = false;
         eventState.isPinch = false;
         eventState.deltaAngle = 0;
         eventState.scale = 1;
      }
      // 记录本次操作中的最大指针数（第一个指针接触开始到现在的最大指针数）
      if (eventState.pointerCount == 0) {
         eventState.maxPoint = 0;
      }

      Private.copyState();
   }

   /**
    * 指针取消事件处理器
    * @param {PointerEvent} event 
    */
   static pointerCancel = event => {
      Private.copyStateToLast();
      const eventState = Data.eventState;

      Private.updateEventState(event, eventState, 'cancel');

      eventState.pointers.delete(event.pointerId);
      eventState.pointerCount--;
      // 判定是否不具备旋转和缩放条件（指针数小于2）
      if (eventState.pointerCount < 2) {
         eventState.isRotate = false;
         eventState.isPinch = false;
         eventState.deltaAngle = 0;
         eventState.scale = 1;
      }
      // 记录本次操作中的最大指针数（第一个指针接触开始到现在的最大指针数）
      if (eventState.pointerCount == 0) {
         eventState.maxPoint = 0;
      }

      Private.copyState();
   }

   /**
    * @description 事件调度器
    * @param {HTMLElement} element - 元素
    * @param {String} trigger - 触发器
    */
   static dispatchEvent(element, trigger) {
      for (const type of Object.keys(element[EVENTLIST])) {
         if (eventConditions[type](Data.eventState, Data.lastEventState, trigger)) {
            element[EVENTLIST][type].forEach(callback => callback(Data.outEventState));
         }
      }
   }

   /**
    * @name downdispatch
    * @description 按下事件调度器
    * @param {PointerEvent} event - 事件 
    */
   static downDispatch() {
      Private.dispatchEvent(this, 'down');
      if (Data.eventState.pointerCount == 1)
         this[LONGTOUCH] = setTimeout(() => {
            Private.longtouchDispatch(this);
         }, Data.config.longtouchThreshold);
      else if (this[LONGTOUCH])
         clearTimeout(this[LONGTOUCH]);
   }

   static longtouchDispatch(element) {
      Private.dispatchEvent(element, 'longtouch');
   }

   static moveDispatch() {
      if (Data.eventState.pointerCount >= 1)
         Private.dispatchEvent(this, 'move');
   }

   static upDispatch() {
      Private.dispatchEvent(this, 'up');
      clearTimeout(this[LONGTOUCH]);
   }

   static outDispatch() {
      clearTimeout(this[LONGTOUCH]);
   }

   static cancelDispatch() {
      Private.dispatchEvent(this, 'cancel');
      clearTimeout(this[LONGTOUCH]);
   }

   /**
    * @description 计算两点间距离
    * @param {Array} param0 第一个点的坐标
    * @param {Array} param1 第二个点的坐标
    * @returns {Number} - 两点间距离
    */
   static eDistance = ([x1, y1], [x2, y2]) => {
      const [dx, dy] = [x1 - x2, y1 - y2];
      return Math.hypot(dx, dy);
   }

   /**
    * @description 计算参考角(两点连线与垂直方向间夹角)
    * @param {Array} param0 第一个点的坐标
    * @param {Array} param1 第二个点的坐标
    * @returns {Number} - 两点连线与垂直方向间夹角
    */
   static refAngle = ([x1, y1], [x2, y2]) => {
      const [dx, dy] = [x1 - x2, y1 - y2];
      return Math.atan2(dy, dx) / Math.PI * 180;
   }

   /**
    * @description 计算两点连线的中点
    * @param {Array} param0 第一个点的坐标
    * @param {Array} param1 第二个点的坐标
    * @returns {Array} - 两点连线的中点坐标
    */
   static midPoint = ([x1, y1], [x2, y2]) => [(x1 + x2) / 2, (y1 + y2) / 2];
}

/**
 * @description 手势事件公开接口类
 * @class
 */
class Public {
   /**
    * @private
    * @description 初始化函数
    * @returns {void}
    */
   static _initialize() {
      const initializePointerEvents = () => {
         [
            ['pointerdown', Private.pointerdown],
            ['pointermove', Private.pointermove],
            ['pointerup', Private.pointerup],
            ['pointercancel', Private.pointerCancel],
         ].forEach(n => window.addEventListener(n[0], n[1], true));
      };

      if (document.readyState != 'interactive') {
         document.addEventListener('DOMContentLoaded', initializePointerEvents);
      } else {
         initializePointerEvents();
      }
   }

   /**
    * @description 设置调试模式
    * @param {Boolean} _debug - 是否开启调试模式
    */
   static setDebug(_debug) {
      debug = _debug;
      if (debug) console.log(
         `%cRbGestureEvent - debug mode on, version: ${version}`,
         `
            color: white;
            background-color: #333333; 
            font-weight: bold;
            text-shadow: 0 0 5px white;
            padding: 0.5em;
            border-left: 5px solid #ff0000;
            border-right: 5px solid #ff0000;
            `
      );
   }

   /**
    * @description 修改配置
    * @param {Record<String, Number>} _config 
    */
   static setConfig(_config) {
      Object.assign(Data.config, _config);
   }

   /**
    * @description 注册事件监听器
    * @param {HTMLElement} element 元素
    * @param {String} type 事件类型
    * @param {(eventState: EventState) => void} callback 回调函数
    * @returns {void}
    */
   static registerEventListener(element, type, callback) {
      if (eventConditions[type] == undefined) {
         throw new Error(`event type ${type} not found`);
      }

      // 如果元素没有事件列表，添加事件监听器，否则直接添加事件
      if (!element[EVENTLIST]) {
         element[EVENTLIST] = {};
         element.addEventListener('pointerdown', Private.downDispatch);
         element.addEventListener('pointermove', Private.moveDispatch);
         element.addEventListener('pointerup', Private.upDispatch);
         element.addEventListener('pointerout', Private.outDispatch);
         element.addEventListener('pointercancel', Private.cancelDispatch);
      }
      if (!element[EVENTLIST][type]) {
         element[EVENTLIST][type] = [];
      }

      let boundcallback;
      // 判断是否是匿名函数
      if (callback.name != '') {
         // 将未修饰回调函数和修饰后的回调函数的对应关系保存起来
         if (!element[CALLBACKMAP]) {
            element[CALLBACKMAP] = new WeakMap;
            boundcallback = callback.bind(element);
            element[CALLBACKMAP].set(callback, {
               boundcallback: boundcallback,
               count: 1
            });
         } else if (element[CALLBACKMAP].has(callback)) { // 如果已经注册过了，直接取出来，计数加一，debug模式下输出重复注册警告
            if (debug) console.warn('callback already registered\n', callback);
            const temp = element[CALLBACKMAP].get(callback);
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
    * @description 注销事件监听器
    * @param {HTMLElement} element 元素
    * @param {String} type 事件类型
    * @param {Function} callback 回调函数
    * @returns {void}
    */
   static cancelEventListener(element, type, callback) {
      if (debug) console.log(`cancel event: ${type} on`, element);

      if (element[CALLBACKMAP].has(callback)) {
         const list = element[EVENTLIST][type];
         let { boundcallback, count } = element[CALLBACKMAP].get(callback);

         const index = list.indexOf(boundcallback);
         list.splice(index, 1);

         count -= 1;
         if (count == 0)
            element[CALLBACKMAP].delete(callback);

         if (element[EVENTLIST][type].length == 0) {
            delete element[EVENTLIST][type];

            if (Object.keys(element[EVENTLIST]).length == 0) {
               delete element[EVENTLIST];
               element.removeEventListener('pointerdown', Private.downDispatch);
               element.removeEventListener('pointermove', Private.moveDispatch);
               element.removeEventListener('pointerup', Private.upDispatch);
               element.removeEventListener('pointerout', Private.outDispatch);
               element.removeEventListener('pointercancel', Private.cancelDispatch);
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
   static setCondition(type, condition) {
      if (eventConditions[type]) {
         if (debug) console.warn(`event type ${type} already exists, will be overwritten`);
      }
      eventConditions[type] = condition;
   }

   /**
    * @description 移除事件触发条件
    * @param {String} type - 事件类型
    */
   static removeCondition(type) {
      if (eventConditions[type]) {
         delete eventConditions[type];
      } else {
         throw new Error(`event type ${type} not found`);
      }
   }
}

Public._initialize(); // 执行初始化


RbGestureEvent = __webpack_exports__;
