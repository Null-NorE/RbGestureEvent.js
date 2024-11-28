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

   const gesture = RbGestureEvent;
   gesture.setDebug(true);
   // const clickf = event => {
   //    console.log('click');
   // }
   // gesture.registerEventListener(button, 'click', clickf);
   // gesture.registerEventListener(button, 'click', clickf);
   // gesture.registerEventListener(button, 'click', clickf);
   // gesture.cancelEventListener(button, 'click', clickf);
   // gesture.cancelEventListener(button, 'click', clickf);
   [
      // 'press',
      // 'release',
      // 'click',
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
      'pinchin',
      'pinchout',
      // 'pinchend',
      // 'rotatestart',
      'rotatemove',
      'rotateend',
   ].forEach((type, i, a) => {
      gesture.registerEventListener(button, type, event => {
         // 为每条log添加一个不同的背景色
         console.log(`${type} %c      `, `background-color: hsl(${i * 360 / a.length}, 70%, 50%); color: white; padding: 2px; border-radius: 2px;`);
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

   gesture.registerEventListener(button, 'dragend', event => {
      button.style.left = 0;
      button.style.top = 0;
   });
   gesture.registerEventListener(button, 'dragmove', event => {
      const pointer = event.triggerPointer;
      button.style.left = pointer.displacement[0] + 'px';
      button.style.top = pointer.displacement[1] + 'px';
   });

   gesture.registerEventListener(button, 'rotatestart', event => {
      button.style.transform += ' rotate(0deg)';
      button.style.transitionDuration = '0s, 0s';
   });
   gesture.registerEventListener(button, 'rotatemove', event => {
      button.style.transform = button.style.transform.replace(/rotate\([-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?deg\)/, `rotate(${event.deltaAngle}deg)`);
      const twoPointerLocation = [...event.pointers.values()]
         .slice(0, 2)
         .map(p => [p.location[0], p.location[1]]);
      console.log(JSON.stringify(twoPointerLocation));
   });
   gesture.registerEventListener(button, 'rotateend', event => {
      button.style.transform = button.style.transform.replace(/rotate\([-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?deg\)/, '');
      button.style.transitionDuration = '0s, 1s';
   });


   gesture.registerEventListener(button, 'pinchstart', event => {
      button.style.transform += ' scale(1)';
      button.style.transitionDuration = '0s, 0s';
   });
   gesture.registerEventListener(button, 'pinchin', event => {
      button.style.transform = button.style.transform.replace(/scale\([-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?\)/, `scale(${event.scale})`);
   });
   gesture.registerEventListener(button, 'pinchout', event => {
      button.style.transform = button.style.transform.replace(/scale\([-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?\)/, `scale(${event.scale})`);
   });
   gesture.registerEventListener(button, 'pinchend', event => {
      button.style.transform = button.style.transform.replace(/scale\([-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?\)/, '');
      button.style.transitionDuration = '0s, 1s';
   });
}

/**
 * @description 处理swipe事件
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