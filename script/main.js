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
   gesture.registerEventListener(button, 'press', event => console.log('press'));
   gesture.registerEventListener(button, 'doubleclick', event => console.log('double click'));
   button.addEventListener('pointermove', e => e.preventDefault());
}

window.document.addEventListener('DOMContentLoaded', main);