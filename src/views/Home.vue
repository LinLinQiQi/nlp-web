<template>
  <div class="home">
    <h2 class="mt-12 headline font-weight-bold mb-3 text-center">word2vec</h2>
    <v-row class="ml-12">
      <v-col cols="3" md="2">
        <v-card width="200" class="ml-8">
          <v-card-title>
            <h4>{{ parameter.name }}</h4>
          </v-card-title>
          <v-divider></v-divider>
          <v-list>
            <v-list-item>
              <v-list-item-content>总共训练的词数:</v-list-item-content>
              <v-list-item-content>{{ parameter.totalWords }}</v-list-item-content>
            </v-list-item>
            <v-list-item>
              <v-list-item-content>所训练的向量维度:</v-list-item-content>
              <v-list-item-content class="align-end">{{ parameter.dims }}</v-list-item-content>
            </v-list-item>
            <v-list-item>
              <v-list-item-content>学习率:</v-list-item-content>
              <v-list-item-content class="align-end">{{ parameter.alpha }}</v-list-item-content>
            </v-list-item>
            <v-list-item>
              <v-list-item-content>已训练的单词数:</v-list-item-content>
              <v-list-item-content class="align-end">{{ parameter.trainedWords }}</v-list-item-content>
            </v-list-item>
            <v-list-item>
              <v-list-item-content>已迭代的词数:</v-list-item-content>
              <v-list-item-content class="align-end">{{ parameter.iters }}</v-list-item-content>
            </v-list-item>
            <v-list-item>
              <v-list-item-content>已训练的时间:</v-list-item-content>
              <v-list-item-content class="align-end">{{ parameter.trainedTime }}</v-list-item-content>
            </v-list-item>
            <!-- <v-list-item>
              <v-list-item-content>Iron:</v-list-item-content>
              <v-list-item-content class="align-end">{{ item.iron }}</v-list-item-content>
            </v-list-item>-->
          </v-list>
        </v-card>
      </v-col>

      <v-col cols="1" md="9">
        <v-layout>
          <v-card class width="1600" height="700">
            <v-container>
              <v-btn small @click="runWord2vec">运行Word2vec</v-btn>
              <v-container>
                <canvas id="myChart" style="width:1137px; height:400px"></canvas>
              </v-container>

              <!-- <div>学习率：{{alpha}}</div>
              <div>已训练的单词数：{{testCount}}</div>
              <div>已迭代的词数：{{testObject.alpha}}</div>
              <div>已训练的时间：{{alpha}}</div>-->
            </v-container>
          </v-card>
        </v-layout>
      </v-col>
    </v-row>

    <!-- <HelloWorld msg="Welcome to Your Vue.js App" /> -->
  </div>
</template>

<script>
import myWorker from "worker-loader!../nodeword2vec";
import Chart from "chart.js";
// import myWorker from 'worker-loader!../workerTest'

// function word2vec(self, callback) {
//   setTimeout(function() {
//     // f1的任务代码
//     main(self.testObject, self)
//     callback();
//   }, 1000);
// }

export default {
  name: "Home",
  components: {
    // HelloWorld
  },
  data: function() {
    return {
      alpha: 0,
      testCount: 0,
      testObject: {
        alpha: -1
      },
      parameter: {
        name: "训练相关参数",
        totalWords: 0,
        dims: 2,
        alpha: 0.025,
        trainedWords: 0,
        iters: 0,
        trainedTime: 0
      }
    };
  },
  methods: {
    runWord2vec() {
      let worker = new myWorker();
      worker.postMessage("start word2vec");
      let self = this;
      worker.onmessage = function(e) {
        // let textContent = e.data;
        // self.alpha = textContent
        let name = e.data[0];
        let data = e.data[1];

        self.parameter[name] = data;
        // console.log('Message received from worker:' + textContent);
      };
    }
  },
  mounted: function() {
    var ctx = document.getElementById("myChart").getContext("2d");
    var color = Chart.helpers.color;
    var scatterChart = new Chart(ctx, {
      type: "scatter",
      data: {
        datasets: [
          {
            label: "His",
            borderColor: "rgba(255, 99, 132, 1)",
            backgroundColor: "rgba(255, 99, 132, 0.2)",
            data: [
              {
                x: -10,
                y: 10
              }
            ]
          },
          {
            label: "He",
            borderColor: "rgba(54, 162, 235, 1)",
            backgroundColor: "rgba(54, 162, 235, 0.2)",
            data: [
              {
                x: 10,
                y: 10
              }
            ]
          },
          {
            label: "Her",
            borderColor: "rgba(240,230,140, 1)",
            backgroundColor: "rgba(240,230,140, 0.2)",
            data: [
              {
                x: 10,
                y: -10
              }
            ]
          },
          {
            label: "She",
            borderColor: "rgba(127,255,170, 1)",
            backgroundColor: "rgba(127,255,170, 0.2)",
            data: [
              {
                x: -10,
                y: -10
              }
            ]
          }
        ]
      },
      options: {
        title: {
          display: true,
          text: "词向量表示"
        },
        scales: {
          xAxes: [
            {
              type: "linear",
              position: "bottom"
            }
          ]
        }
      }
    });

    // let timer = setInterval(function() {
    //   console.log("Myalpha-------:" + alpha)
    // }, 1000)
  }
};
</script>
