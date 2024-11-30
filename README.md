# RbGestureEvent.js

**RbGestureEvent.js** 是一个手势事件库，旨在为现代 Web 应用提供对长按、缩放、旋转等手势的支持。该库模仿了浏览器原生的事件 API，提供类似 `touchstart`, `touchmove`, `touchend` 等事件的接口，但专注于高级手势（例如：长按、缩放和旋转）。

目前它为 `RbPictureViewer.js` 和 `RbNodePipeline.js` 设计，帮助开发者在这些模块中实现复杂的手势交互。

本项目为兼容chrome79及之后版本的浏览器而设计，所以不会使用chrome80之后加入的高级特性（例如空值合并运算符）

## 功能特性 / 设计目标

- **长按手势**：支持识别用户长时间按压元素的手势，适用于实现长按事件或长按交互。
- **缩放手势**：通过双指或其他方式，识别缩放手势，适用于图片查看器或地图应用等。
- **旋转手势**：通过旋转的手势操作来旋转元素，适用于图片编辑或地图应用。
- **其他手势**：完整的受支持的手势请见下方[绑定事件](###绑定事件)章节。
- **原生 API 设计**：模仿浏览器的原生事件机制，使得手势事件处理与标准的 DOM 事件处理保持一致，减少学习曲线。
- **易于集成？**：~~可以轻松集成到其他 JavaScript 项目中~~，但是目前阶段专门为 `RbPictureViewer.js` 和 `RbNodePipeline.js` 设计。

## 使用方法

### 引入库

使用 import 导入 `RbGestureEvent` 和 `RbEventState` 两个Class

```javascript
import { RbGestureEvent, RbEventState } from 'PATH/TO/RbGestureEvent.mjs';
// RbGestureEvent是主要的手势事件类
// RbEventState是一个类，用于vscode的智能补全，不加也行

const yourElement = document.querySelector('your-element');
```

### 绑定事件
使用静态方法 `RbGestureEvent.registerEventListener` 注册事件监听器

```javascript
// EXAMPLE: 注册事件
// RbGestureEvent.registerEventListener(被注册的元素, '事件类型', 事件处理函数);
// 事件类型见表格
// 事件处理函数的参数是一个RbEventState对象，具体见API的RbEventState类
// 和原生API的行为相同，传入的事件处理函数的this会被绑定到被注册的元素上
RbGestureEvent.registerEventListener(yourElement, 'click', eventSate => {
    console.log('click');
});
```

`RbGestureEvent` 支持绑定多个常见手势事件。下面是支持的手势类型：

| 手势类型          | 描述                                                       |
| ----------------- | ---------------------------------------------------------- |
| `press`           | 按下元素时触发                                             |
| `release`         | 松开元素时触发                                             |
| `click`           | 点击元素时触发                                             |
| `doubleclick`     | 连续点击元素时连击次数为偶数时触发（双击、四击，六击……时） |
| `longtouch`       | 长时间按压元素时触发                                       |
| `dragstart`       | 单指拖动手势开始时触发                                     |
| `dragend`         | 单指拖动手势结束时触发                                     |
| `dragmove`        | 拖动过程中触发                                             |
| `dragleft`        | 向左拖动时触发                                             |
| `dragright`       | 向右拖动时触发                                             |
| `dragup`          | 向上拖动时触发                                             |
| `dragdown`        | 向下拖动时触发                                             |
| `doubledragstart` | 双指拖动手势开始时触发                                     |
| `doubledragend`   | 双指拖动手势结束时触发                                     |
| `doubledragmove`  | 双指拖动过程中触发                                         |
| `swipeleft`       | 快速向左滑动时触发                                         |
| `swiperight`      | 快速向右滑动时触发                                         |
| `swipeup`         | 快速向上滑动时触发                                         |
| `swipedown`       | 快速向下滑动时触发                                         |
| `pinchstart`      | 捏合手势开始时触发                                         |
| `pinchin`         | 捏合缩小时触发                                             |
| `pinchout`        | 捏合放大时触发                                             |
| `pinchend`        | 捏合手势结束时触发                                         |
| `rotatestart`     | 旋转手势开始时触发                                         |
| `rotatemove`      | 旋转过程中触发                                             |
| `rotateend`       | 旋转手势结束时触发                                         |

### 取消事件监听
你可以使用静态方法 `RbGestureEvent.cancelEventListener` 移除绑定的事件监听器。需要传入与注册时回调函数相同的引用才能成功移除，与浏览器原生API的行为一致。

```javascript
// EXAMPLE: 取消事件
const funcClick = eventSate => {
   console.log('click');
}
// 取消事件需要传入相同的事件处理函数，只有相同的引用才能被判断为是同一个函数
RbGestureEvent.registerEventListener(yourElement, 'click', funcClick);
RbGestureEvent.cancelEventListener(yourElement, 'click', funcClick);
```

### 调试辅助
使用以下代码可以输出额外的调试信息，包括启用时输出版本信息，重复注册事件的警告信息和覆盖原有判断条件的警告。
```javascript
// EXAMPLE: 启用调试模式
RbGestureEvent.setDebug(true); // 关闭则设置false
```

### 自定义事件判定的阈值
使用静态方法`setConfig`可以修改时间判定的阈值，参数是一个对象，具体如下：
```javascript
// EXAMPLE: 修改配置
// 可配置项
// static config = {
//    threshold: 5, // 识别需要的最小位移
//    swipeVelocityThreshold: 0.3, // swipe识别需要的最小速度
//    clickThreshold: 500, // click识别需要的最大时间
//    longtouchThreshold: 500, // longtouch识别需要的最小时间
//    angleThreshold: 5, // 旋转识别需要的最小角度
//    scaleThreshold: 0.05, // 缩放识别需要的最小比例
// }
RbGestureEvent.setConfig({
   // 配置项：内容
   // 配置项：内容
   // 配置项：内容
});
```

### 添加和移除条件（不推荐的操作）
可以使用 `setCondition` 和 `removeCondition` 静态方法添加/移除判定条件，但是**不推荐进行这个操作，可能会和未来的更新冲突**

```javascript
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
```

## 示例

[null-nore.github.io/RbGestureEvent/](null-nore.github.io/RbGestureEvent/)

代码见[mdExample.js](example/mdExample.js)和[example.js](example/example.js)

## API 参考

事件处理函数的参数
```javascript
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
```
pointerInfo的具体内容:
```JavaScript
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
```

## 项目结构

本项目仅有一个mjs文件，直接复制进去就能用。

## 贡献

> **致谢**：对于前期原型和主体架构以及Github展示页面设计的工作，我要特别感谢 **Null** **-** 的贡献。

欢迎提交 pull requests、bug 报告和功能请求。对于任何贡献，我们非常感谢，**不过两位作者都在完成课程设计所以可能不会很快做出回复。**

## 许可证

MIT 许可证。请参阅 [LICENSE](LICENSE) 文件了解更多信息。
