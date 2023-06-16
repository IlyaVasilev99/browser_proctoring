//import {LLI,label} from './webcameraFA.js';
//import {testTime} from '/webcameraFA.js';
//alert(testTime);
let totalScores = document.querySelector('.total_scores')
var label = 'test name'
var LLI;
console.log(LLI,label)

var isReadyToJSON = false;
document.body.append("Добрый день!")
//document.body.append(testTime)


let testTime = prompt("Введите количество минут для тестирования")
console.log("установлено минут: " + testTime)

function timer () {

    const date1 = new Date;
    var date2;
    var dateMin;
    var dateSec;
    var timerSec;
    var timerId = setInterval(async () => {
        date2 = new Date;
        dateMin = date2.getMinutes() - date1.getMinutes();
        dateSec = date2.getSeconds() - date1.getSeconds();
        timerSec = testTime*60 - (dateMin*60 +dateSec);
        document.getElementById("time")
            .textContent = ( 'осталось времени: '+parseInt(timerSec/60)+':'
            +(timerSec%60 < 10 ? "0" + timerSec%60 : timerSec%60 )
        )
        //console.log('timerMin',timerSec)
        if (timerSec == 0) {
            alert('Proctoring is over!')
            clearInterval(timerId)
            let scores = {
                "total": penalty_total,
                "noFace": penalty_noFace,
                "multiFace": penalty_multihead
            }

            console.log('SCORES: ', scores)
            totalScores.textContent = 'Scores:'+'Total score:' + scores.total +
                'Multiface score:' + scores.multiFace +
                'No face score:' + scores.noFace;
            fetchScores(scores)
            console.log('sending data to server...')
        }
    }, 1000)
}

//var handler = function() {
//     var date = new Date();
//      var sec = date.getSeconds();
//     var min = date.getMinutes();
//     document.getElementById("time").textContent = (min < 10 ? "0" + min : min) + ":" + (sec < 10 ? "0" + sec : sec);
//     if (min == testTime) {alert('Proctoring is over!')}
//     };
// setInterval(handler, 1000);
// handler();

var penalty_total = 0
var penalty_multihead = 0
var penalty_noFace = 0
var penalty_noFace3sec = 0



Promise.all([
    //faceapi.nets.tinyFaceDetector.loadFromUri('https://ilyavasilev99.github.io/browser_proctoring/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('https://ilyavasilev99.github.io/browser_proctoring/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('https://ilyavasilev99.github.io/browser_proctoring/models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('https://ilyavasilev99.github.io/browser_proctoring/models'),
]).then(start).then(timer)
//.then(startVideo)

function start() {
    document.body.append("\nmodels are loaded\n")
}

navigator.mediaDevices.getUserMedia(
    {video: true }).then(stream => {
        video.srcObject = stream;
        }).catch(console.error)


var resizedDetections;

video.addEventListener('play', () => {
    const canvas = faceapi.createCanvasFromMedia(video)
    document.getElementById("div-video").append(canvas)
    const displaySize = {width: video.width, height: video.height}
    faceapi.matchDimensions(canvas, displaySize)
    setInterval(async () => {
        const detections = await faceapi.detectAllFaces(video,
            new faceapi.SsdMobilenetv1Options()).withFaceLandmarks()
        var dLength = detections.length;
        if (dLength >= 2) {
            console.log('Warning! Detected more than one face')
            penalty_total += 3
            penalty_multihead += 1
        } else if (dLength == 0) {
            console.log('Warning! No face detected')
            penalty_total += 1
            penalty_noFace += 1
            penalty_noFace3sec += 1
            if (penalty_noFace3sec >= 3) {
                console.log('Face is absent more than 3 seconds')
                penalty_total += 5
                penalty_noFace3sec = 0
            }

        } else {
            console.log('Face detected...')
        }
        ;
        resizedDetections = faceapi.resizeResults(detections, displaySize)
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
        faceapi.draw.drawDetections(canvas, resizedDetections)

    }, 1000)
    setInterval(async () => {
        console.log('penalty_total:', penalty_total, '\n',
            'penalty_noFace:', penalty_noFace, '\n',
            'penalty_multihead:', penalty_multihead, '\n',
        )
        const descriptions = [];
        const canvas = faceapi.createCanvasFromMedia(video)
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
        let image_data_url = canvas.toDataURL('image/jpeg');
        const image = await faceapi.fetchImage(image_data_url)
        //console.log(image)
        var detection = await faceapi.detectSingleFace(image).withFaceLandmarks().withFaceDescriptor();
        console.log('Detection', detection);
        descriptions.push(detection.descriptor);
        LLI = new faceapi.LabeledFaceDescriptors(label, descriptions);
        var detectionsPerson = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors()
        var resizedDetections = faceapi.resizeResults( detectionsPerson, displaySize)
        var labeledFaceDescriptors = await LLI;
        console.log('labeledFaceDescriptors', labeledFaceDescriptors)
        var faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6)
        var results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))
        console.log('results', results)
    }, 10000)
})

//
//
function fetchScores(scores){
    fetch('https://ilyavasilev99.github.io/browser_proctoring/scores', {
        method:'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name:'User 1'})
    }).then(res => res.json())
        .then(res => console.log(res));
}
//