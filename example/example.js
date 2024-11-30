"use strict";
import { RbGestureEvent, RbEventState } from '../script/RbGestureEvent.mjs';

/**
 * @type {HTMLElement}
 */
const yourElement = document.querySelector('your-element');

[
      'press',
      'release',
      'click',
      'longtouch',
      'dragstart',
      'dragend',
      'doubledragstart',
      'doubledragend',
      'pinchstart',
      'pinchend',
      'rotatestart',
      'rotateend',
].forEach((type, i, a) => {
   gesture.registerEventListener(button, type, event => {
      // 为每条log添加一个不同的背景色
      console.log(`${type} %c      `, `background-color: hsl(${i * 360 / a.length}, 70%, 50%); color: white; padding: 2px; border-radius: 2px;`);
   });
});

RbGestureEvent.registerEventListener(yourElement, 'doubelclick', eventSate => {
   console.log('clickCount:', eventSate.clickCount);
});
RbGestureEvent.registerEventListener(yourElement, 'dragmove', eventSate => {
   console.log('dragDistance:', eventSate.triggerPointer.displacement);
});
RbGestureEvent.registerEventListener(yourElement, 'doubeldragmove', eventSate => {
   console.log('doubelDragDistance:', eventSate.midDisplacement);
 });
RbGestureEvent.registerEventListener(yourElement, 'swipleft', eventSate => {
   console.log('swipe←');
});
RbGestureEvent.registerEventListener(yourElement, 'swipright', eventSate => {
   console.log('swipe→');
});
RbGestureEvent.registerEventListener(yourElement, 'swipup', eventSate => {
   console.log('swipe↑');
});
RbGestureEvent.registerEventListener(yourElement, 'swipdown', eventSate => {
   console.log('swipe↓');
});
RbGestureEvent.registerEventListener(yourElement, 'pinchin', eventSate => {
   console.log('pinchIn:', eventSate.scale);
});
RbGestureEvent.registerEventListener(yourElement, 'pinchout', eventSate => {
   console.log('pinchOut:', eventSate.scale);
});
RbGestureEvent.registerEventListener(yourElement, 'rotatemove', eventSate => {
   console.log('rotate:', eventSate.deltaAngle);
});