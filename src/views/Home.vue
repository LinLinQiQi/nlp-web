<template>
  <div class="home container">
    <h2 class="mt-4 headline font-weight-bold mb-3 text-center">word2vec</h2>
    <div class="flex object-none object-center">
      <div class="w-60">
        <v-card width="400">
          <v-card-title>
            <h4>{{ parameter.name }}</h4>
          </v-card-title>
          <v-divider></v-divider>
          <div class="mt-4 ml-4">总共训练的词数:{{ parameter.totalWords }}</div>
          <div class="mt-4 ml-4">所训练的向量维度:{{ parameter.dims }}</div>
          <div class="mt-4 ml-4">学习率:{{ parameter.alpha }}</div>
          <div class="mt-4 ml-4">已训练的单词数:{{ parameter.trainedWords }}</div>
          <div class="mt-4 ml-4">已迭代的词数:{{ parameter.iters }}</div>
          <div class="mt-4 ml-4 pb-4">已训练的时间:{{ parameter.trainedTime }}</div>
        </v-card>
        <v-btn class="mt-10" small @click="runWord2vec">运行Word2vec</v-btn>
      </div>

      <div class="ml-12">
        <v-card class="w-auto" height="700">
          <v-container>
            <canvas id="myChart" style="width:1000px; height:400px"></canvas>
          </v-container>
          <div class="ml-64 flex">
            <div class="w-64">
              <!-- <v-form ref="form"> -->
              <v-text-field v-model="addWord" :counter="wordCount" label="请输入需要添加观察的单词"></v-text-field>
              <!-- </v-form> -->
            </div>
            <v-btn class="ml-16 mt-6" small @click="addInspectWord">添加单词</v-btn>
          </div>
        </v-card>
      </div>
    </div>
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
      inspectWords: ["his", "he", "her", "she"],
      addWord: "",
      wordCount: 0,
      parameter: {
        name: "训练相关参数",
        totalWords: 0,
        dims: 2,
        alpha: 0.025,
        trainedWords: 0,
        iters: 0,
        trainedTime: 0
      },
      inspectWordsMap: new Map(),
      datasets: [
        {
          label: "his",
          borderColor: "rgba(255, 99, 132, 1)",
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          data: [
            {
              x: 0,
              y: 0
            }
          ]
        },
        {
          label: "he",
          borderColor: "rgba(54, 162, 235, 1)",
          backgroundColor: "rgba(54, 162, 235, 0.2)",
          data: [
            {
              x: 0,
              y: 0
            }
          ]
        },
        {
          label: "her",
          borderColor: "rgba(240,230,140, 1)",
          backgroundColor: "rgba(240,230,140, 0.2)",
          data: [
            {
              x: 0,
              y: 0
            }
          ]
        },
        {
          label: "she",
          borderColor: "rgba(127,255,170, 1)",
          backgroundColor: "rgba(127,255,170, 0.2)",
          data: [
            {
              x: 0,
              y: 0
            }
          ]
        }
      ],
      scatterChart: null
    };
  },
  methods: {
    runWord2vec() {
      this.calWordsMap();
      let worker = new myWorker();
      worker.postMessage(this.inspectWords);
      let self = this;
      worker.onmessage = function(e) {
        // let textContent = e.data;
        // self.alpha = textContent
        if (e.data[0] == "word") {
          console.log(
            "update vector:" +
              e.data[1] +
              ", one:" +
              e.data[2] +
              ", two:" +
              e.data[3]
          );
          let index = self.inspectWordsMap.get(e.data[1]);
          self.datasets[index].data = [{ x: e.data[2], y: e.data[3] }];
          self.scatterChart.update();
        } else {
          let name = e.data[0];
          let data = e.data[1];

          self.parameter[name] = data;
        }

        // console.log('Message received from worker:' + textContent);
      };
    },
    calWordsMap() {
      this.inspectWordsMap = new Map()
      for (const index in this.datasets) {
        this.inspectWordsMap.set(this.datasets[index].label, index);
      }
    },

    addInspectWord() {
      let rgbRandom = "rgba(" + this.getRandomInt(255) + "," + this.getRandomInt(255) + "," + this.getRandomInt(255)
      this.inspectWords.push(this.addWord)
      this.datasets.push(
        {
          label: this.addWord,
          borderColor: rgbRandom + ", 1)",
          backgroundColor: rgbRandom + ", 0.2)",
          data: [
            {
              x: 0,
              y: 0
            }
          ]
        }
      )
      this.scatterChart.update();
      this.addWord = ""
    },

    getRandomInt(max) {
      return Math.floor(Math.random() * Math.floor(max));
    }

  },
  mounted: function() {
    var ctx = document.getElementById("myChart").getContext("2d");
    var color = Chart.helpers.color;
    this.scatterChart = new Chart(ctx, {
      type: "scatter",
      data: {
        datasets: this.datasets
      },
      options: {
        title: {
          display: true,
          text: "词向量表示"
        },
        scales: {
          xAxes: [
            {
              //   type: "linear",
              //   position: "bottom"

              ticks: {
                suggestedMin: -1,
                suggestedMax: 0
              }
            }
          ],
          yAxes: [
            {
              //   type: "linear",
              //   position: "bottom"

              ticks: {
                suggestedMin: -1,
                suggestedMax: 0
              }
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
