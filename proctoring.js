//import {testTime} from '/webcameraFA.js';
//alert(testTime);
document.body.append("Добрый день!")
//document.body.append(testTime)
let testTime = prompt("Введите количество минут для тестирования")

var handler = function() {
    var date = new Date();
     var sec = date.getSeconds();
    var min = date.getMinutes();
    document.getElementById("time").textContent = (min < 10 ? "0" + min : min) + ":" + (sec < 10 ? "0" + sec : sec);
    };
setInterval(handler, 1000);
handler();

// if (min == testTime) {alert('Proctoring is over!')


Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('https://ilyavasilev99.github.io/browser_proctoring/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('https://ilyavasilev99.github.io/browser_proctoring/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('https://ilyavasilev99.github.io/browser_proctoring/models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('https://ilyavasilev99.github.io/browser_proctoring/models'),
]).then(start)
//.then(startVideo)

function start() {
    document.body.append("\nmodels are loaded\n")
}

navigator.mediaDevices.getUserMedia(
    {video: true }).then(stream => {
        video.srcObject = stream;
        }).catch(console.error)


video.addEventListener('play', () => {
    const canvas = faceapi.createCanvasFromMedia(video)
    document.getElementById("div-video").append(canvas)
    const displaySize = {width: video.width, height: video.height}
    faceapi.matchDimensions(canvas, displaySize)
    setInterval(async () => {
        const detections = await faceapi.detectAllFaces(video,
            new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks()
        var dLength = detections.length;
        if (dLength >= 2) {
            console.log( 'Warning! Detected more than one face')
        } else if (dLength == 0) {
            console.log ( 'Warning! No face detected')
        } else { console.log ('Face detected...') }
        const resizedDetections = faceapi.resizeResults(detections, displaySize)
        canvas.getContext('2d').clearRect(0,0, canvas.width, canvas.height)
        faceapi.draw.drawDetections(canvas, resizedDetections)
    }, 1000)
})