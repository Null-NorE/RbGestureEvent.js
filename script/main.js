"use strict";
const main = event => {
   console.log('loading main.js');
   const button = document.querySelector('#mid-box');
   button.addEventListener('click', event => {
      console.log('button clicked');
   });
}