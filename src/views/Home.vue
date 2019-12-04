<template>
  <div class="home">
    <div>{{alpha}}</div>
    <div>{{testCount}}</div>
    <div>{{testObject.alpha}}</div>
    <img alt="Vue logo" src="../assets/logo.png" />
    <HelloWorld msg="Welcome to Your Vue.js App" />
  </div>
</template>

<script>
// @ is an alias to /src
// let fs = require('fs')
// let train_file = "text8"
// let rs = fs.createReadStream(train_file, 'utf-8')
// import fs from '../assets/text8';
import HelloWorld from "@/components/HelloWorld.vue";
// import fs from "../static/text_json.json";
// console.log("strs length:" + strs.length)
// let timer = setInterval(function() {
//   console.log("Myalpha:" + alpha)
// }, 1000)

import { test, main, alpha } from "../nodeword2vec";
// import { testWorker } from "../workerTest";
// import {Worker} from "../workerTest";
// import myWorker from '../workerTest'
import myWorker from 'worker-loader!../workerTest'

// function word2vec(self, callback) {
//   setTimeout(function() {
//     // f1的任务代码
//     main(self.testObject, self)
//     callback();
//   }, 1000);
// }

// function changeTestChount(self){
//   // this.testCount += 1;
//    let timer = setInterval(function() {
//       self.testCount += 1;
//     }, 1000)
// }

// function done(){
//   console.log("word2vec done")
// }

export default {
  name: "home",
  components: {
    HelloWorld
  },
  data: function(){
    return {
      alpha: 0,
      testCount: 0,
      testObject: {
        alpha: -1,
      }
    };
  },
  mounted: function() {
    test();
    this.alpha = alpha
    let worker = new myWorker;
    // let myWorker = this.$worker.run(testWorker)
    // myWorker.postMessage('func1')
    //   .then(result => {
    //     console.log("result:" + result)
    //   }) // logs 'Worker 1: Working on func1'
    //   .catch(console.error) // logs any possible error
    // let myWorker = new Worker()
    // let worker = new myWorker();
    worker.postMessage("hh");
    worker.onmessage = function(e) {
      let textContent = e.data;
      console.log('Message received from worker:' + textContent);
    }
    // .then(result => {
    //   console.log(result)
    // })
    // .catch(e => {
    //   console.error(e)
    // })
    // if (window.Worker) {
    //   var myWorker = new Worker('workerTest.js');
    //   myWorker.postMessage([1 ,2]);
    //   console.log('Message posted to worker');
    //   myWorker.onmessage = function(e) {
    //     let textContent = e.data;
    //     console.log('Message received from worker:' + textContent);
    //   }
    // }else{
    //   console.log('Your browser doesn\'t support web workers.')
    // }
    // changeTestChount(this)
    // let timer = setInterval(changeTestChount(this), 1000)
    // console.log("alpha:" + alpha);

    // main(this.testObject, this)
    // let timer = setInterval(function() {
    //   console.log("Myalpha-------:" + alpha)
    // }, 1000)

    // word2vec(this, done)
    // console.log("???????")
    // rs.on('data', function (chunk) {
    //   console.log('DATA:' + String(chunk))
    //     // strs += String(chunk)
    // })

    // rs.on('end', function () {
    //     console.log('END');
    // })

    // rs.on('error', function (err) {
    //     console.log('ERROR: ' + err);
    // })
  }
};
</script>
