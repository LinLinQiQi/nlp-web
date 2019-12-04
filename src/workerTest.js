onmessage = function (e) {
    console.log('receivedaa:' + e.data[0]);
    postMessage("push"); 
}


// export function Worker(){
    console.log("worker test in")
    postMessage("workerResult");
// }
