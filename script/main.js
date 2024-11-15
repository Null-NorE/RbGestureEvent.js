"use strict";
import { RbGestureEvent } from './RbGestureEvent.mjs';

/**
 * @name main
 * @description 主函数
 * @param {Event} event 事件
 * @function
 * @returns {void}
*/
const main = event => {
   console.log('loading main.js');

   const button = document.querySelector('#mid-in');

   const gesture = new RbGestureEvent(true);
   gesture.registerEvent(button, 'click', event => {
      console.log('click');
   });
   console.log(gesture);
   
}

window.document.addEventListener('DOMContentLoaded', main);