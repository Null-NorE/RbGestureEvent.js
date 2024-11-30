# RbGestureEvent.js

一个现代 Web 手势事件库，为长按、缩放、旋转等高级手势提供支持，模仿原生事件 API，便于集成到 Web 应用中。

## **设计目标**
- **支持多种手势**：如长按、拖动、捏合、旋转等。
- **与 DOM API 一致**：模仿 `addEventListener` 的使用模式。
- **多端兼容**：为PC和手机提供一致的事件处理逻辑
- **浏览器支持**：兼容 Chrome 79+，不使用高级语法如空值合并运算符。
- **特定优化**：专为 `RbPictureViewer.js` 和 `RbNodePipeline.js` 设计，但也易于集成到其他项目。

### **手势支持列表**
以下是可绑定的手势事件类型：
| **手势类型**      | **描述**                         |
| ----------------- | -------------------------------- |
| `press`           | 按下元素时触发                   |
| `release`         | 松开元素时触发                   |
| `click`           | 点击元素时触发                   |
| `doubleclick`     | 双击、四击等连续偶数次点击时触发 |
| `longtouch`       | 长时间按压触发                   |
| `dragstart`       | 单指拖动开始时触发               |
| `dragend`         | 单指拖动结束时触发               |
| `dragmove`        | 单指拖动过程中触发               |
| `doubeldragstart` | 双指拖动开始时触发               |
| `doubeldragend`   | 双指拖动结束时触发               |
| `doubeldragmove`  | 双指拖动过程中触发               |
| `swipeup`         | 快速向上滑动触发                 |
| `swipedown`       | 快速向下滑动触发                 |
| `swipeleft`       | 快速向左滑动触发                 |
| `swiperight`      | 快速向右滑动触发                 |
| `pinchstart`      | 捏合手势开始时触发               |
| `pinchin`         | 捏合缩小时触发                   |
| `pinchout`        | 捏合放大时触发                   |
| `rotatestart`     | 旋转手势开始时触发               |
| `rotatemove`      | 旋转过程中触发                   |
| `rotateend`       | 旋转手势结束时触发               |


## 使用方法

### 引入库
```javascript
import { RbGestureEvent, RbEventState } from 'PATH/TO/RbGestureEvent.mjs';
// RbGestureEvent是主要的手势事件类
// RbEventState是一个类，用于vscode的智能补全，不加也行

const yourElement = document.querySelector('your-element');
```

### 绑定事件
```javascript
// RbGestureEvent.registerEventListener(被注册的元素, '事件类型', 事件处理函数);
// 事件类型见表格
// 事件处理函数的参数是一个RbEventState对象，具体见API的RbEventState类
// 和原生API的行为相同，传入的事件处理函数的this会被绑定到被注册的元素上
RbGestureEvent.registerEventListener(yourElement, 'click', eventSate => {
    console.log('click');
});
```

### 取消事件监听
```javascript
const funcClick = eventSate => {
   console.log('click');
}
// 取消事件需要传入相同的事件处理函数，只有相同的引用才能被判断为是同一个函数
RbGestureEvent.registerEventListener(yourElement, 'click', funcClick);
RbGestureEvent.cancelEventListener(yourElement, 'click', funcClick);
```

### **事件状态对象 (`RbEventState`)**
事件处理函数接收一个 `RbEventState` 对象，包含以下信息：

| **属性**      | **类型**       | **描述**           |
| ------------- | -------------- | ------------------ |
| `eventType`   | `String`       | 当前事件类型       |
| `scale`       | `Number`       | 当前缩放比例       |
| `deltaAngle`  | `Number`       | 相对初始角度的变化 |
| `midPoint`    | `Array`        | 两指的中点坐标     |
| `clickCount`  | `Number`       | 当前点击次数       |
| `isRotate`    | `Boolean`      | 是否正在旋转       |
| `isPinch`     | `Boolean`      | 是否正在缩放       |
| `pointers`    | `Map`          | 当前指针信息       |
| `originEvent` | `PointerEvent` | 原始事件对象       |

### 调试辅助
使用以下代码可以输出额外的调试信息。
>包括启用时输出版本信息，重复注册事件的警告信息和覆盖原有判断条件的警告。
```javascript
// EXAMPLE: 启用调试模式
RbGestureEvent.setDebug(true); // 关闭则设置false
```

### 自定义配置
使用静态方法`RbGestureEvent.setConfig`可以修改时间判定的阈值，参数是一个对象，具体如下：
```javascript
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
```

### **自定义条件（高级）**
不推荐修改手势条件，避免影响未来版本兼容性。

#### 添加自定义事件条件
```javascript
RbGestureEvent.setCondition('customEvent', (eventState, lastEventState, trigger) => {
    return eventState.pointerCount === 3; // 仅三指触控触发
});

// RbGestureEvent.setCondition('事件名称', (eventState: EventState, lastEventState: EventState, trigger: String) => Boolean);
// eventState: 当前事件状态
// lastEventState: 上一个事件状态 - eventState只在指针按下，移动，抬起时更新，lastEventState则是上一次的eventState
// trigger: 触发器 - 触发器是一个字符串，用于标识此次条件函数调用是由哪个事件触发的，和eventState.eventType不同，eventState.eventType是事件类型，由evensState的更新回调决定，该回调绑定在body上，而trigger则是由元素触发的，由元素的事件回调决定
// 返回值：true则触发事件，false则不触发事件
```

#### 移除自定义事件条件
```javascript
RbGestureEvent.removeCondition('customEvent');
```

## 示例

[null-nore.github.io/RbGestureEvent/](null-nore.github.io/RbGestureEvent/)
[文中代码](example/mdExample.js)

## 项目结构

本项目仅有一个mjs文件，直接复制进去就能用。

## 贡献

- 欢迎通过 PR 和 Issue 提交反馈和改进建议。
> **致谢**：对于前期原型和主体架构以及Github展示页面设计的工作，我要特别感谢 **Null** **-** 的贡献。



## **许可证**
MIT 许可证。详细内容请参阅 LICENSE 文件。
