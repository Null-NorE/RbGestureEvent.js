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
   gesture.registerEventListener(button, 'longtouch', event => console.log('long touch'));
   gesture.registerEventListener(button, 'dragstart', event => console.log('drag start'));
   gesture.registerEventListener(button, 'dragend', event => console.log('drag end'));
   gesture.registerEventListener(button, 'dragmove', event => console.log('drag move'));
   gesture.registerEventListener(button, 'dragleft', event => console.log('drag ←'));
   gesture.registerEventListener(button, 'dragright', event => console.log('drag →'));
   gesture.registerEventListener(button, 'dragup', event => console.log('drag ↑'));
   gesture.registerEventListener(button, 'dragdown', event => console.log('drag ↓'));
}

window.document.addEventListener('DOMContentLoaded', main);