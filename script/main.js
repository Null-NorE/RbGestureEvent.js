"use strict";
import { RbGestureEvent, RbEventState} from './RbGestureEvent.mjs';

/**
 * @name main
 * @description 主函数
 * @param {Event} event 事件
 * @function
 * @returns {void}
*/
const main = event => {
   console.log('loading main.js');

   /**
    * @type {HTMLDivElement}
    */
   const button = document.querySelector('#main-touch');
   const touchBox = document;

   const gesture = RbGestureEvent;
   gesture.setDebug(true);
   const clickf = event => {
      console.log('click');
   }
   gesture.registerEventListener(button, 'click', clickf);
   gesture.registerEventListener(button, 'click', clickf);
   gesture.registerEventListener(button, 'click', clickf);
   gesture.cancelEventListener(button, 'click', clickf);
   gesture.cancelEventListener(button, 'click', clickf);
   [
      // 'press',
      // 'doubleclick',
      // 'longtouch',
      // 'dragstart',
      // 'dragend',
      // 'dragmove',
      // 'dragleft',
      // 'dragright',
      // 'dragup',
      // 'dragdown',
      // 'swipeleft',
      // 'swiperight',
      // 'swipeup',
      // 'swipedown',
      // 'pinchstart',
      // 'pinchin',
      // 'pinchout',
      // 'pinchend',
      // 'rotatestart',
      // 'rotatemove',
      // 'rotateend',
   ].forEach(type => {
      gesture.registerEventListener(button, type, event => {
         console.log(type);
      });
   });
   [
      'pointermove',
      'touchmove',
      'onscroll',
   ].forEach(type => {
      button.addEventListener(type, event => {
         event.preventDefault();
      });
   });

   swipeRotate(button);

   gesture.registerEventListener(touchBox, 'dragend', event => {
      button.style.left = 0;
      button.style.top = 0;
   });
   gesture.registerEventListener(touchBox, 'dragmove', event => {
      const pointer = event.triggerPointer;
      button.style.left = pointer.displacement[0] + 'px';
      button.style.top = pointer.displacement[1] + 'px';
      // console.log(event.pointerCount, event.pointers, event.originEvent.pointerId);
   });
}

/**
 * 
 * @param {HTMLDivElement} element 
 */
const swipeRotate = element => {
   const gesture = RbGestureEvent;
   const box = element;
   gesture.registerEventListener(box, 'swipeleft', event => {
      box.classList.add('swipe-left');
      setTimeout(() => {
         box.classList.remove('swipe-left');
      }, 500);
   });
   gesture.registerEventListener(box, 'swiperight', event => {
      box.classList.add('swipe-right');
      setTimeout(() => {
         box.classList.remove('swipe-right');
      }, 500);
   });
   gesture.registerEventListener(box, 'swipeup', event => {
      box.classList.add('swipe-up');
      setTimeout(() => {
         box.classList.remove('swipe-up');
      }, 500);
   });
   gesture.registerEventListener(box, 'swipedown', event => {
      box.classList.add('swipe-down');
      setTimeout(() => {
         box.classList.remove('swipe-down');
      }, 500);
   });
}

window.document.addEventListener('DOMContentLoaded', main);