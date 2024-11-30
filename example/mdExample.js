"use strict";
import { RbGestureEvent, RbEventState } from 'PATH/TO/RbGestureEvent.mjs';
// RbGestureEvent是主要的手势事件类
// RbEventState是一个枚举类，用于vscode的智能补全，不加也行

const yourElement = document.querySelector('your-element');

// EXAMPLE: 注册事件
// RbGestureEvent.registerEventListener(被注册的元素, '事件类型', 事件处理函数);
// 事件类型包括：
// 'press', 'release', 'click', 'doubleclick', 'longtouch', 'dragstart', 'dragend', 'dragmove', 'dragleft', 'dragright', 'dragup', 'dragdown', 'doubledragstart', 'doubledragend', 'doubledragmove', 'swipeleft', 'swiperight', 'swipeup', 'swipedown', 'pinchstart', 'pinchin', 'pinchout', 'pinchend', 'rotatestart', 'rotatemove', 'rotateend'
// 事件处理函数的参数是一个RbEventState对象，具体见下方的RbEventState类
// 和原生API的行为相同，传入的事件处理函数的this会被绑定到被注册的元素上
RbGestureEvent.registerEventListener(yourElement, 'click', eventSate => {
   console.log('click');
});

// EXAMPLE: 取消事件
const funcClick = eventSate => {
   console.log('click');
}
// 取消事件需要传入相同的事件处理函数，要求相同的引用，和原生API的行为相同，只有相同的引用才能被判断为是同一个函数
RbGestureEvent.registerEventListener(yourElement, 'click', funcClick);
RbGestureEvent.cancelEventListener(yourElement, 'click', funcClick);

// EXAMPLE: 启用调试模式
RbGestureEvent.setDebug(true); // 关闭则设置false

// EXAMPLE: 添加事件条件（不推荐）
// RbGestureEvent.setCondition('事件名称', (eventState: EventState, lastEventState: EventState, trigger: String) => Boolean);
// eventState: 当前事件状态
// lastEventState: 上一个事件状态 - eventState只在指针按下，移动，抬起时更新，lastEventState则是上一次的eventState
// trigger: 触发器 - 触发器是一个字符串，用于标识此次条件函数调用是由哪个事件触发的，和eventState.eventType不同，eventState.eventType是事件类型，由evensState的更新回调决定，该回调绑定在body上，而trigger则是由元素触发的，由元素的事件回调决定
// 返回值：true则触发事件，false则不触发事件
RbGestureEvent.setCondition('eventName', (eventSate, lastEventState, trigger) => {
   // do something
   // then return true or false
});

// EXAMPLE: 移除事件条件（不推荐）
RbGestureEvent.removeCondition('eventName');

// EXAMPLE: 修改配置
// 可配置项和默认值
// static config = {
//    threshold: 5, // 识别需要的最小位移（单位px）
//    swipeVelocityThreshold: 0.3, // swipe识别需要的最小速度(单位px/ms）
//    clickThreshold: 500, // click识别需要的最大时间（单位ms）
//    longtouchThreshold: 500, // longtouch识别需要的最小时间(单位ms）
//    angleThreshold: 5, // 旋转识别需要的最小角度(单位deg）
//    scaleThreshold: 0.05, // 缩放识别需要的最小比例变化(无单位）
// }
RbGestureEvent.setConfig({
   // 配置项：内容
   // 配置项：内容
   // 配置项：内容
});


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

