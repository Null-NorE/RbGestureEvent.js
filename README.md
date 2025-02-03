# RbGestureEvent.js

> 中文版本[README_CN](./README_CN.md "中文文档")

A modern web gesture event library that supports advanced gestures such as long press, pinch, and rotate, mimicking the native event API for easy integration into web applications.

## **Design Goals**

- **Support Multiple Gestures**: Such as long press, drag, pinch, rotate, etc.
- **Consistent with DOM API**: Mimics the usage pattern of `addEventListener`.
- **Cross-Platform Compatibility**: Provides consistent event handling logic for both PC and mobile.
- **Modern Browser Support**: Compatible with Chrome 79+ and does not use advanced syntax like nullish coalescing operator.
- **Specific Optimization**: Currently a custom library for some projects, but also easy to integrate into other projects.

### **Supported Gesture List**

The following are the gesture event types that can be bound:

| **Gesture Type** | **Description**                                      |
| ---------------------- | ---------------------------------------------------------- |
| `press`              | Triggered when the element is pressed                      |
| `release`            | Triggered when the element is released                     |
| `click`              | Triggered when the element is clicked                      |
| `doubleclick`        | Triggered on double, quadruple, etc. even number of clicks |
| `longtouch`          | Triggered on long press                                    |
| `dragstart`          | Triggered when single-finger drag starts                   |
| `dragend`            | Triggered when single-finger drag ends                     |
| `dragmove`           | Triggered during single-finger drag                        |
| `doubeldragstart`    | Triggered when double-finger drag starts                   |
| `doubeldragend`      | Triggered when double-finger drag ends                     |
| `doubeldragmove`     | Triggered during double-finger drag                        |
| `swipeup`            | Triggered on fast upward swipe                             |
| `swipedown`          | Triggered on fast downward swipe                           |
| `swipeleft`          | Triggered on fast leftward swipe                           |
| `swiperight`         | Triggered on fast rightward swipe                          |
| `pinchstart`         | Triggered when pinch gesture starts                        |
| `pinchin`            | Triggered on pinch in                                      |
| `pinchout`           | Triggered on pinch out                                     |
| `rotatestart`        | Triggered when rotate gesture starts                       |
| `rotatemove`         | Triggered during rotation                                  |
| `rotateend`          | Triggered when rotate gesture ends                         |

> **IMPORTANT：If you want to prevent the default longtouch event, please call event.preventDefault() in the press event, not in the longtouch event.**

## Usage

### Import the Library

```javascript
import { RbGestureEvent, RbEventState } from 'PATH/TO/RbGestureEvent.mjs';
// RbGestureEvent is the main gesture event class
// RbEventState is a class for VSCode's IntelliSense, optional

const yourElement = document.querySelector('your-element');
```

### Bind Events

```javascript
// RbGestureEvent.registerEventListener(element, 'eventType', eventHandler);
// See the table for event types
// The event handler receives an RbEventState object, see below for details
// Similar to the native API, the event handler's `this` is bound to the registered element
RbGestureEvent.registerEventListener(yourElement, 'click', eventSate => {
    console.log('click');
});
```

### Cancel Event Listener

```javascript
const funcClick = eventSate => {
   console.log('click');
}
// To cancel an event, pass the same event handler, only the same reference can be recognized as the same function
RbGestureEvent.registerEventListener(yourElement, 'click', funcClick);
RbGestureEvent.cancelEventListener(yourElement, 'click', funcClick);
```

### **Event State Object (`RbEventState`)**

The event handler receives an `RbEventState` object, which contains the following information:

| **Property**  | **Type**               | **Description**                         |
| ------------------- | ---------------------------- | --------------------------------------------- |
| `eventType`       | `String`                   | Current event type                            |
| `scale`           | `Number`                   | Current scale ratio                           |
| `deltaAngle`      | `Number`                   | Change in angle relative to the initial angle |
| `midPoint`        | `Array<Number>`            | Midpoint coordinates of two fingers           |
| `midDisplacement` | `Array<Number>`            | Displacement of the midpoint of two fingers   |
| `clickCount`      | `Number`                   | Current click count                           |
| `isRotate`        | `Boolean`                  | Whether it is rotating                        |
| `isPinch`         | `Boolean`                  | Whether it is pinching                        |
| `pointers`        | `Map<Number, PointerInfo>` | All pointer information                       |
| `triggerPointer`  | `PointerInfo`              | Pointer information that triggered this event |
| `originEvent`     | `PointerEvent`             | Original pointer event object                 |

> `RbEventState.pointers` is a Map structure that stores the id of each pointer and the corresponding `PointerInfo` object

### **Pointer Information Object (`PointerInfo`)**

The project uses `PointerInfo` to store pointer parameters, which contain the following information:

| **Property** | **Type**    | **Description**                 |
| ------------------ | ----------------- | ------------------------------------- |
| `move`           | `Boolean`       | Whether the pointer has moved         |
| `velocity`       | `Array<Number>` | Current movement speed of the pointer |
| `displacement`   | `Array<Number>` | Pointer displacement                  |
| `location`       | `Array<Number>` | Pointer location                      |

### Debugging Assistance

Use the following code to output additional debugging information.

> Includes version information when enabled, warnings for duplicate event registrations, and warnings for overriding original judgment conditions.

```javascript
// EXAMPLE: Enable debug mode
RbGestureEvent.setDebug(true); // Set to false to disable
```

### Custom Configuration

Use the static method `RbGestureEvent.setConfig` to modify the threshold for event recognition. The parameter is an object, as follows:

```javascript
// EXAMPLE: Modify configuration
// Configurable items and default values
// static config = {
//    threshold: 5, // Minimum displacement required for recognition (unit: px)
//    swipeVelocityThreshold: 0.3, // Minimum speed required for swipe recognition (unit: px/ms)
//    clickThreshold: 500, // Maximum time for click recognition (unit: ms)
//    longtouchThreshold: 500, // Minimum time for longtouch recognition (unit: ms)
//    angleThreshold: 5, // Minimum angle required for rotation recognition (unit: deg)
//    scaleThreshold: 0.05, // Minimum scale change required for pinch recognition (unitless)
// }
RbGestureEvent.setConfig({
   // Config item: content
   // Config item: content
   // Config item: content
});
```

### **Custom Conditions (Advanced)**

Modifying gesture conditions is not recommended to avoid affecting future version compatibility.

#### Add Custom Event Conditions

```javascript
RbGestureEvent.setCondition('customEvent', (eventState, lastEventState, trigger) => {
    return eventState.pointerCount === 3; // Trigger only on three-finger touch
});

// RbGestureEvent.setCondition('eventName', (eventState: EventState, lastEventState: EventState, trigger: String) => Boolean);
// eventState: Current event state
// lastEventState: Previous event state - eventState is only updated when the pointer is pressed, moved, or released, while lastEventState is the previous eventState
// trigger: Trigger - The trigger is a string used to identify which event triggered this condition function call. It is different from eventState.eventType. eventState.eventType is the event type determined by the eventState update callback, which is bound to the body, while the trigger is determined by the element's event callback
// Return value: true to trigger the event, false not to trigger the event
```

#### Remove Custom Event Conditions

```javascript
RbGestureEvent.removeCondition('customEvent');
```

## Examples

[Project DEMO](https://null-nore.github.io/RbGestureEvent.js/)

[Code in the article](example/mdExample.js)

## Project Structure

This project only has one mjs file, just copy it in and use it.

## Contribution

- Feedback and improvement suggestions are welcome through PR and Issue.

## **License**

MIT License. For details, please refer to the [LICENSE](LICENSE) file.
