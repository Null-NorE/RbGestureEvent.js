"use strict";
import { RbGestureEvent, RbEventState } from './RbGestureEvent.mjs';

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

   const gesture = new RbGestureEvent(true);
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
   button.addEventListener('pointerdown', event => event.preventDefault());
   button.addEventListener('pointerup', event => event.preventDefault());
   button.addEventListener('pointermove', event => event.preventDefault());
   button.addEventListener('pointerleave', event => event.preventDefault());
   button.addEventListener('touchstart', event => event.preventDefault());
   button.addEventListener('touchend', event => event.preventDefault());
   button.addEventListener('touchmove', event => event.preventDefault());


   gesture.registerEventListener(touchBox, 'dragend', event => {
      button.style.left = 0;
      button.style.top = 0;

      /* const buttonWidth = button.offsetWidth;
      const buttonHeight = button.offsetHeight;
      const buttonRect = button.getBoundingClientRect();
      if (buttonRect.left > window.innerWidth / 2 - buttonWidth
         && buttonRect.top > window.innerHeight / 2 - buttonHeight
         && buttonRect.right < window.innerWidth / 2 + buttonWidth
         && buttonRect.bottom < window.innerHeight / 2 + buttonHeight) { // 如果按钮在正中间
         button.style.transform = 'translate(0, 0)';
      } else if (buttonRect.left < window.innerWidth / 2 - buttonWidth) { // 如果按钮在右半边
         button.style.transform = 'translate(-100%, 0)';
      } else if (buttonRect.right > window.innerWidth / 2 + buttonWidth) { // 如果按钮在左半边
         button.style.transform = 'translate(100%, 0)';
      } else if (buttonRect.top < window.innerHeight / 2 - buttonHeight) { // 如果按钮在下半边
         button.style.transform = 'translate(0, -100%)';
      } else { // 如果按钮在上半边
         button.style.transform = 'translate(0, 100%)';
      } */
   });
   gesture.registerEventListener(touchBox, 'dragmove', event => {
      const pointer = event.pointers[event.originEvent.pointerId];
      button.style.left = pointer.displacement[0] + 'px';
      button.style.top = pointer.displacement[1] + 'px';
   });
}

window.document.addEventListener('DOMContentLoaded', main);