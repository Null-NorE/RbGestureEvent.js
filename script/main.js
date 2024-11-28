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
   let pageDebug = false;

   /**
    * @type {HTMLDivElement}
    */
   const button = document.querySelector('#main-touch');
   const touchBox = document;

   const gesture = RbGestureEvent;

   gesture.setDebug(true);
   pageDebug = true;

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
      // 'doubledragstart',
      // 'doubledragend',
      // 'doubledragmove',
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

   gesture.registerEventListener(touchBox, 'dragend', event => {
      button.style.left = 0;
      button.style.top = 0;
   });
   gesture.registerEventListener(touchBox, 'dragmove', event => {
      const pointer = event.triggerPointer;
      button.style.left = pointer.displacement[0] + 'px';
      button.style.top = pointer.displacement[1] + 'px';
   });

   const [tp1, tp2] = [document.createElement('div'), document.createElement('div')];
   [tp1, tp2].forEach(tp => {
      tp.style.position = 'absolute';
      tp.style.width = '1.6rem';
      tp.style.height = '1.6rem';
      tp.style.borderRadius = '50%';
      tp.style.backgroundColor = '#ffffff50';
      tp.style.boxShadow = '0 0 0.5rem 0.5rem #00000017';
      tp.style.backdropFilter = 'blur(0.2rem)';
      tp.style.pointerEvents = 'none';
      document.body.appendChild(tp);
   });
   const mtp = document.createElement('div');
   mtp.style.position = 'absolute';
   mtp.style.width = '1rem';
   mtp.style.height = '1rem';
   mtp.style.borderRadius = '50%';
   mtp.style.border = '0.1rem solid #ffffff50';
   mtp.style.pointerEvents = 'none';
   document.body.appendChild(mtp);

   gesture.registerEventListener(touchBox, 'doubledragstart', event => {
      button.style.transformOrigin = 
      `${event.midPoint[0] - button.offsetLeft}px ${event.midPoint[1] - button.offsetTop}px`
      if (pageDebug) {
         [tp1, mtp, tp2].forEach(tp => {
            tp.style.display = 'block';
         });
      }
   });
   gesture.registerEventListener(touchBox, 'doubledragend', event => {
      if (pageDebug) {
         [tp1, mtp, tp2].forEach(tp => {
            tp.style.display = 'none';
         });
      }
   });
   gesture.registerEventListener(touchBox, 'doubledragmove', event => {
      button.style.left = event.midDisplacement[0] + 'px';
      button.style.top = event.midDisplacement[1] + 'px';

      if (pageDebug) {
         const twoPointerLocation = [...event.pointers.values()]
            .slice(0, 2)
            .map(p => [p.location[0], p.location[1]]);
         tp1.style.left = twoPointerLocation[0][0] + 'px';
         tp1.style.top = twoPointerLocation[0][1] + 'px';
         tp2.style.left = twoPointerLocation[1][0] + 'px';
         tp2.style.top = twoPointerLocation[1][1] + 'px';
         mtp.style.left = event.midPoint[0] + 'px';
         mtp.style.top = event.midPoint[1] + 'px';
      }
   });

   gesture.registerEventListener(touchBox, 'rotatestart', event => {
      button.style.transform += ' rotate(0deg)';
      button.style.transitionDuration = '0s, 0s';
   });
   gesture.registerEventListener(touchBox, 'rotatemove', event => {
      button.style.transform = button.style.transform.replace(/rotate\([-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?deg\)/, `rotate(${event.deltaAngle}deg)`);
   });
   gesture.registerEventListener(touchBox, 'rotateend', event => {
      button.style.transform = button.style.transform.replace(/rotate\([-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?deg\)/, '');
      button.style.transitionDuration = '0s, 1s';
   });


   gesture.registerEventListener(touchBox, 'pinchstart', event => {
      button.style.transform += ' scale(1)';
      button.style.transitionDuration = '0s, 0s';
   });
   gesture.registerEventListener(touchBox, 'pinchin', event => {
      button.style.transform = button.style.transform.replace(/scale\([-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?\)/, `scale(${event.scale})`);
   });
   gesture.registerEventListener(touchBox, 'pinchout', event => {
      button.style.transform = button.style.transform.replace(/scale\([-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?\)/, `scale(${event.scale})`);
   });
   gesture.registerEventListener(touchBox, 'pinchend', event => {
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