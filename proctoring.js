var dataServerUrl = 'https://ptsv3.com/t/26101999/'

var dataObj;
var DATA_FROM_SERVER;

const request = fetch('https://reqres.in/api/users/')
    .then(res => res.json())
    .then(data => {
        console.log('data',data);
        dataObj = data;
        DATA_FROM_SERVER = data;
        return data
        });

console.log('DATA_FROM_SERVER ', await request, dataObj)
//var testc = dataObj.total + 1;
//console.log('testc ', testc)

let totalScores = document.querySelector('.total_scores');
var label = 'test name';
var LFD;
console.log(LFD,label)
document.body.append("Добрый день!")




let testTime = prompt("Введите количество минут для тестирования")
// let testTime = 1;
console.log("установлено минут: " + testTime)

var timerSec;

async function timer () {
    const date1 = new Date;
    var date2;
    var dateMin;
    var dateSec;
    var timerId = setInterval(async () => {
        date2 = new Date;
        dateMin = date2.getMinutes() - date1.getMinutes();
        dateSec = date2.getSeconds() - date1.getSeconds();
        timerSec = testTime*60 - (dateMin*60 +dateSec);
        document.getElementById("time")
            .textContent = ( 'Осталось времени : '+parseInt(timerSec/60)+':'
            +(timerSec%60 < 10 ? "0" + timerSec%60 : timerSec%60 )
        )
        //console.log('timerMin',timerSec)
        if (timerSec == 0) {
            alert('Proctoring is over!')
            clearInterval(timerId)
            let scores = {
                "labeledFaceDescriptor": LFD,
                "total": penalty_total,
                "noFace": penalty_noFace,
                "multiFace": penalty_multihead,
                "ctrlPressed" : penalty_ctrlPressed,
                "altPressed" : penalty_altPressed,
            }

            console.log('SCORES: ', scores)

            totalScores.textContent = 'Scores: \r\n'+'Total score:' + scores.total + '\r\n' +
                'Multi-face score:' + scores.multiFace + '\r\n' +
                'No face score:' + scores.noFace + '\r\n' +
                'Ctrl button pressed:' + scores.ctrlPressed + '\r\n' +
                'Alt button pressed:' + scores.ctrlPressed + '\r\n' +
                'Прокторинг закончен, данные отправлены. \r\nВы можете закрыть эту страницу';
            await fetchScores(scores)
            console.log('sending data to server...')
            console.log('timerSec', timerSec)

        }
    }, 1000)
}

var penalty_total = 0;
var penalty_multihead = 0;
var penalty_noFace = 0;
var penalty_noFace3sec = 0;
var penalty_ctrlPressed = 0;
var penalty_altPressed = 0;
var recogFaceCheck;
var faceCheck;

Promise.all([
    //faceapi.nets.tinyFaceDetector.loadFromUri('https://ilyavasilev99.github.io/browser_proctoring/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('https://ilyavasilev99.github.io/browser_proctoring/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('https://ilyavasilev99.github.io/browser_proctoring/models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('https://ilyavasilev99.github.io/browser_proctoring/models'),
]).then(start).then(timer)

function start() {
    document.body.append("\nМодели загружены.\n")
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
    document.onkeydown = function (event) {
        if (event.ctrlKey) {
            penalty_ctrlPressed+=1;
            penalty_total+=1;
            console.log("pressed 'Ctrl' key detected");
        }
        if (event.altKey) {
            penalty_altPressed+=1;
            penalty_total+=1;
            console.log("pressed 'Alt' key detected");
        }
    }

    faceCheck = setInterval(async () => {
        const detections = await faceapi.detectAllFaces(video,
            new faceapi.SsdMobilenetv1Options())
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
        resizedDetections = faceapi.resizeResults(detections, displaySize)
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
        faceapi.draw.drawDetections(canvas, resizedDetections)

    }, 1000)
    recogFaceCheck = setInterval(async () => {
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
        LFD = new faceapi.LabeledFaceDescriptors(label, descriptions);
        var detectionsPerson = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors()
        var resizedDetections = faceapi.resizeResults( detectionsPerson, displaySize)
        var labeledFaceDescriptors = await LFD;
        console.log('labeledFaceDescriptors', labeledFaceDescriptors)
        var faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6)
        var results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))
        console.log('results', results)
    }, 10000)
})

async function fetchScores(scores){
    fetch(dataServerUrl, {
        mode: 'no-cors',
        method:'POST',
        headers: {
           'Content-Type': 'application/json',
        },
        body: JSON.stringify(scores)
    }).then(response => {
        clearInterval(recogFaceCheck);
        //clearInterval(faceCheck);

        response.json();})
        .then(result => {
            console.log('send result and timersec: ', result);
        });
}


