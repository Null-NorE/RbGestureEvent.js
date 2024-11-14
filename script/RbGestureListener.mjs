"use strict";

/**
 * @name RbEventState
 * @description 事件状态类
 * @class
 * @member {Number} time 事件发生时间
 * @member {String} eventType 事件类型
 * 
 * @member {Number} scale 缩放比例
 * @member {Number} refAngle 参考角
 * @member {Array} midPoint 中点坐标
 * 
 * @member {Number} clickTimes 点击次数
 * 
 * @member {Number} startLenght 初始长度
 * @member {Number} startAngle 初始角度
 * @member {Number} startTime 初始时间
 * 
 * @member {Array} pointers 指针
 * @member {Number} pointerCount 指针数量
 */
class RbEventState {
   time = 0;
   eventType = '';

   scale = 1;
   refAngle = 0;
   midPoint = [0, 0];

   clickTimes = 0;

   startLenght = 0;
   startAngle = 0;
   startTime = undefined;

   pointers = [];
   pointerCount = 0;
}

class RbGestureListener {
   /**
    * @name eventState
    * @description 事件状态
    * @type {RbEventState}
    */
   eventState = new RbEventState();

   /**
    * @name lastEventState
    * @description 上一次事件状态
    * @type {RbEventState}
    */
   lastEventState = new RbEventState();

   /**
    * @name eventRegistry
    * @description 事件注册表
    * @type {Object}
    */
   eventRegistry = {};

   debug = false;

   constructor(debug = false) {
      this.debug = debug;
      // 监听触摸相关事件
      [
         ['pointerdown', pointerdown],
         ['pointermove', pointerdarg],
         ['pointerup', pointerup],
      ].forEach(n => window.addEventListener(n[0], n[1], true));

      console.log('loading RbGestureListener');
   }

   /**
    * @name 处理触摸开始事件
    * @param {PointerEvent} event 
    */
   pointerdown(event) {
      const id = event.pointerId;

      // 设置事件状态的时间和类型
      eventState.time = new Date;
      eventState.eventType = 'down';

      // 初始化触摸点信息
      eventState.pointers[id] = {
         move: false,
         velocity: [0, 0],
         displacement: [0, 0],
         location: [event.clientX, event.clientY],
         startLocation: [event.clientX, event.clientY],

         // 设置空计时器，防止之后无脑clear的时候出问题
         velocityTimeOut: setTimeout(() => { }, 100)
      };

      // 处理一个触摸点的情况
      if (eventState.pointerNum == 0) {
         eventState.startTime = new Date;
      }

      // 处理两个及以上触摸点的情况
      if (eventState.pointerNum == 1) {
         const twoPointerLocation = [
            [eventState.pointers.values[0].clientX, eventState.pointers.values[0].clientY],
            [eventState.pointers.values[1].clientX, eventState.pointers.values[1].clientY]
         ];

         // 计算两点间的初始长度和角度
         eventState.startLenth = eDistance(twoPointerLocation);
         eventState.startAngle = angle(twoPointerLocation);

         // 计算两点间的中点
         eventState.midpoint = mid(twoPointerLocation);
      }

      // 增加触摸点计数
      eventState.pointerNum += 1;

      // 调用事件处理函数
      dispatchEvent(event.target.mark, event);

      // 更新上一个事件状态
      updateLastEventState();
   }

   /**
    * @name 处理触摸移动事件
    * @param {PointerEvent} event 
    */
   pointerdarg(event) {
      if (eventState.pointerNum >= 1) {
         const id = event.pointerId;
         const pointer = eventState.pointers[id];
         eventState.time = new Date;
         eventState.eventType = 'move';

         /* 如果还在移动就取消清零速度 */
         clearTimeout(pointer.velocityTimeOut);

         /* 100ms之后清零速度（符合条件时会被上面阻止） */
         pointer.velocityTimeOut = setTimeout(() => {
            pointer.velocity = [0, 0];
         }, 100);

         pointer.move = true;
         pointer.location = [event.clientX, event.clientY];
         pointer.displacement = [event.clientX - pointer.startLocation[0], event.clientY - pointer.startLocation[1]];

         const deltaTime = new Date - lastEventState.time;
         pointer.velocity = [
            (pointer.location[0] - lastEventState.pointers[id].location[0]) / deltaTime,
            (pointer.location[1] - lastEventState.pointers[id].location[1]) / deltaTime,
         ];

         if (eventState.pointerNum == 2) {
            const twoPointerLocationg = [
               [eventState.pointers.values[0].clientX, eventState.pointers.values[0].clientY],
               [eventState.pointers.values[1].clientX, eventState.pointers.values[1].clientY]
            ];

            const nowlenth = eDistance(twoPointerLocationg);
            const nowangle = angle(twoPointerLocationg);

            eventState.scale = nowlenth / eventState.startLenth;
            eventState.angle = nowangle - eventState.startAngle;
            eventState.midpoint = mid(twoPointerLocationg);
         }

         dispatchEvent(event.target.mark, event);
         updateLastEventState();
      }
   }

   /**
    * @name 处理触摸结束事件
    * @param {PointerEvent} event 
    */
   pointerup(event) {
      const id = event.pointerId;
      eventState.time = new Date;
      eventState.eventType = 'up';
      eventState.pointerNum -= 1;
      delete eventState.pointers[id];
      dispatchEvent(event.target.mark, event);
      updateLastEventState();
   }

   /**
    * 注册事件
    * @param {HTMLElement} element 元素
    * @param {String} eventType 事件类型
    * @param {Function} callback 回调函数
    * @returns {void} - 无返回值
    */
   registerEvent(element, eventType, callback) {
      if (!eventRegistry[element.mark]) {
         eventRegistry[element.mark] = {};
      }
      if (!eventRegistry[element.mark][eventType]) {
         eventRegistry[element.mark][eventType] = [];
      }
      eventRegistry[element.mark][eventType].push(callback);
   }

   /**
    * 注销事件
    * @param {HTMLElement} element 元素
    * @param {String} eventType 事件类型
    * @param {Function} callback 回调函数
    * @returns {void} - 无返回值
    */
   cancelEvent(element, eventType, callback) {
      const index = eventRegistry[element.mark][eventType].findIndex(e => e === callback);
      eventRegistry[element.mark][eventType].splice(index, 1);
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

/**
 * 代码节流，会返回将输入函数修饰成节流函数
 * @constructor
 * @param {Function} func -需要节流的函数
 * @returns {Function} -修饰成节流函数的func
 */
const Throttle = function (func) {
   /* 为函数分配一个tiking属性，方便之后实现节流 */
   const tiking = Symbol('tiking');
   Object.defineProperty(func, tiking, { value: false, writable: true });

   return function (...arg) {
      if (!func[tiking]) {
         requestAnimationFrame(() => {
            func(...arg);
            func[tiking] = false;
         });
         func[tiking] = true;
      }
   }
}


/**
 * 代码防抖，会返回将输入函数修饰成防抖函数
 * @constructor
 * @param {Function} func -需要防抖的函数
 * @param {Number} time -防抖延时
 * @returns {Function} -修饰成防抖函数的func
 */
const AntiShake = function (func, time) {
   const tiking = Symbol('tiking');
   Object.defineProperty(func, tiking, { writable: true });
   return function (...arg) {
      clearTimeout(func[tiking]);
      func[tiking] = setTimeout(() => func(...arg), time);
   }
};

export { RbGestureListener, Throttle, AntiShake };