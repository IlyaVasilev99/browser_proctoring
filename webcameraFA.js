let name = prompt("Введите ФИО")
let textBody = document.querySelector('.textBody');
textBody.textContent = ("Добрый день! нажмите кнокпку 'start camera'\r\n")
const imageUpload = document.getElementById('imageUpload')

// warnings and bans:
var personMultipleHead = false;
var personNoHead = false;
var personHead;
var personDocument;
var personVerificaton;
var personBan;
var personWarnings;
var br;
const serverURL = 'https://ptsv3.com/t/26101999/';

let cameraButton = document.querySelector("#start-camera");
let video = document.querySelector("#video");
let clickPhoto = document.querySelector("#click-photo");
let clickDoc = document.querySelector("#click-doc");
let canvas = document.querySelector("#canvas");

Promise.all([
    //faceapi.nets.tinyFaceDetector.loadFromUri('https://ilyavasilev99.github.io/browser_proctoring/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('https://ilyavasilev99.github.io/browser_proctoring/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('https://ilyavasilev99.github.io/browser_proctoring/models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('https://ilyavasilev99.github.io/browser_proctoring/models'),
]).then(start)

function start() {
    document.body.append("\r\nМодели загружены.\r\n")

}

cameraButton.addEventListener('click', async function() {
    textBody.textContent=("Теперь поднесите пропуск к видеокамере и нажмите 'get document'\r\n" +
        "когда лицо на пропуске будет распознано.\r\n")
    navigator.mediaDevices.getUserMedia(
        {video: true }).then(stream => {
        video.srcObject = stream;
    }).catch(console.error)

});

console.log(faceapi.nets)



clickPhoto.addEventListener('click', async function faceOnPhoto() {
    br = document.createElement('br');
    document.body.appendChild(br);
    const container = document.createElement('div2');
    container.style.position = 'relative';
    container.style.width = '640px';
    container.style.height = '480px';
    document.body.append(container)
    let canvas1 = faceapi.createCanvasFromMedia(video);

    //canvas2.setAttribute("style", "position:absolute;top:0;left:0;z-index:2");
    //let ctx = canvas1.getContext("2d");
    let image_data_url = canvas1.toDataURL('image/jpeg');
    let image1 = await faceapi.fetchImage(image_data_url);
    image1.style.position = 'absolute';
    image1.style.left = '0px';
    image1.style.top = '0px';
    let canvas2 = faceapi.createCanvasFromMedia(image1);
    canvas2.style.position = 'absolute';
    canvas2.style.left = '0px';
    canvas2.style.top = '0px';
    //context.drawImage(image1, 0 , 0);
    container.append(image1);
    container.append(canvas2);
    //canvas1.getContext('2d').clearRect(image1, 0, 0, canvas1.width, canvas1.height);
    const displaySize = {width: image1.width, height: image1.height}
    faceapi.matchDimensions(canvas2, displaySize)
    const detectionsPerson = await faceapi.detectAllFaces(image1).withFaceLandmarks().withFaceDescriptors()
    const resizedDetections = faceapi.resizeResults( detectionsPerson, displaySize)
    console.log('detections', detectionsPerson);
    const labeledFaceDescriptors = await LFD;
    console.log('labeledFaceDescriptors', labeledFaceDescriptors)
    const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6)
    const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))
    console.log('results', results)
    results.forEach((results, i) => {
        const box = resizedDetections[i].detection.box
        const drawBox = new faceapi.draw.DrawBox(box, {label: results.toString()})
        drawBox.draw(canvas2)
    })


    if (results[0]['_label'] == label) {
        console.log('recognition has ended successfully')
        textBody.textContent=('Распознавание лица успешно выполнено. \r\n')
        br = document.createElement('br')
        var a = document.createElement('a');
        a.style.fontSize = '40px';
        a.style.textAlign = 'center';
        a.style.position = 'relative';
        a.style.top = '500px';
        var linkText = document.createTextNode("\r\n Начать прокторинг");
        console.log(LFD)
        await sendVerification(LFD)
        a.appendChild(linkText);
        a.title = "next page";
        a.href = "proctoring.html";
        document.body.appendChild(br);
        document.body.appendChild(a);
    }
    else if (results[0]['_label'] == 'unknown') {
        console.log('recognition failed')
        textBody.textContent=('Распознавание лица не выполнено.\r\n' +
            'Перезагрузите страницу и попробуйте еще раз.\r\n')

    }

});
export let label;
export let LFD;


clickDoc.addEventListener('click',  async function loadLabeledImage(){

    textBody.textContent=("Подождите, выполняется обработка...\r\n")
    label = name;
    const descriptions = [];
    let canvas = faceapi.createCanvasFromMedia(video);
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    let image_data_url = canvas.toDataURL('image/jpeg');
    const image = await faceapi.fetchImage(image_data_url);
    const detectionsDoc = await faceapi.detectSingleFace(image).withFaceLandmarks().withFaceDescriptor();
    console.log('docDetection', detectionsDoc);
    textBody.textContent=("Обработка документа выполнена.\r\n" +"Нажмите кнопку 'Get Face', чтобы выполнить распознавание вашего лица.\r\n");
    descriptions.push(detectionsDoc.descriptor);
    LFD = new faceapi.LabeledFaceDescriptors(label, descriptions);
    return LFD

});

video.addEventListener('play', async function videoEvent() {
    let canvas = faceapi.createCanvasFromMedia(video)
    document.getElementById("div-video").append(canvas)
    const displaySize = {width: video.width, height: video.height}
    faceapi.matchDimensions(canvas, displaySize)
    setInterval(async () => {
        const detections = await faceapi.detectAllFaces(video,
            new faceapi.SsdMobilenetv1Options())
            var dLength = detections.length;
            if (dLength >= 2) {
                console.log( 'Warning! Detected more than one face')
            } else if (dLength == 0) {
                console.log ( 'Warning! No face detected')
            } else { console.log ('Face detected...') };

        const resizedDetections = faceapi.resizeResults(detections, displaySize)
        canvas.getContext('2d').clearRect(0,0, canvas.width, canvas.height)
        faceapi.draw.drawDetections(canvas, resizedDetections)
    }, 1000)
})


async function sendVerification(LFD){
    fetch(serverURL, {
        mode: 'no-cors',
        method:'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(LFD)
    }).then(response => response.json())
        .then(result => {console.log('result:',result); document.createTextNode("Данные о прокторинге отправлены на сервер. Прокторинг завершен\r\n"
            + "Вы можете закрыть страницу\r\n" )});
}