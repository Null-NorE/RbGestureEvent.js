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
   const button = document.querySelector('#mid-in');

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
      'swipeleft',
      'swiperight',
      'swipeup',
      'swipedown',
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
}

window.document.addEventListener('DOMContentLoaded', main);