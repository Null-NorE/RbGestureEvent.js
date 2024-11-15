# RbGestureEvent.js （本文档仅做模版占位）

**RbGestureEvent.js** 是一个手势事件库，旨在为现代 Web 应用提供对长按、缩放、旋转等手势的支持。该库模仿了浏览器原生的事件 API，提供类似 `touchstart`, `touchmove`, `touchend` 等事件的接口，但专注于高级手势（例如：长按、缩放和旋转）。

它为 `RbPictureViewer.js` 和 `RbNodePipeline.js` 提供支持，帮助开发者在这些模块中实现复杂的手势交互。

> **致谢**：对于前期原型和主体架构设计的工作，我要特别感谢 **Null** **-** 的贡献。

## 功能特性 / 设计目标

- **长按手势**：支持识别用户长时间按压元素的手势，适用于实现长按事件或长按交互。
- **缩放手势**：通过双指或其他方式，识别缩放手势，适用于图片查看器或地图应用等。
- **旋转手势**：通过旋转的手势操作来旋转元素，适用于图片编辑或地图应用。
- **原生 API 设计**：模仿浏览器的原生事件机制，使得手势事件处理与标准的 DOM 事件处理保持一致，减少学习曲线。
- **易于集成？**：~~可以轻松集成到其他 JavaScript 项目中~~，但是目前阶段专门为 `RbPictureViewer.js` 和 `RbNodePipeline.js` 设计。

## 使用方法

### 创建一个手势事件对象

首先需要实例化一个 `RbGestureEvent` 对象，并将其绑定到需要监测手势的 DOM 元素上。

```javascript
import RbGestureEvent from 'TO/YOUR/PATH';

const element = document.getElementById('yourElement');

const gestureEvent = new RbGestureEvent();

// 监听长按手势
gestureEvent.registerEvent(element, 'longtouch', (event) => {
  console.log('Long press detected', event);
});

// 监听缩放手势
gestureEvent.registerEvent(element, 'pinch', (event) => {
  console.log('Pinch scale:', event.scale);
});

// 监听旋转手势
gestureEvent.registerEvent(element, 'rotate', (event) => {
  console.log('Rotate angle:', event.angle);
});
```

### 绑定事件

`RbGestureEvent` 支持绑定多个常见手势事件。下面是支持的手势类型：

(还未编写完毕)

### 取消事件监听

你可以使用 cancelEvent 方法移除绑定的事件监听器。

但是因为维护难度考虑，取消绑定的事件需要使用注册时返回的callback

```javascript
const temp = gestureEvent.registerEvent(element, 'longtouch', (event) => {
  console.log('Long press detected', event);
});

gestureEvent.off(element, 'press', temp);
```

## 示例

### 长按手势示例

```javascript
未完成
```

### 缩放手势示例

```javascript
未完成
```

### 旋转手势示例

```javascript
未完成
```

## API 参考

待完成

## 项目结构

本项目仅有一个mjs文件，直接复制进去就能用。

## 贡献

先别提交 pull requests、bug 报告和功能请求。虽然对于任何贡献，我们非常感谢，但是，我还管不过来这些

## 许可证

Apache2.0 许可证。请参阅 [LICENSE](LICENSE) 文件了解更多信息。
