let name = prompt("Введите ФИО")
//export const testTime = prompt("Введите время тестирования")
//alert("Введено " + name)
//console.log(testTime)
document.body.append("Добрый день! нажмите кнокпку 'start camera'\n")
const imageUpload = document.getElementById('imageUpload')
//const video = document.getElementById('video')

//var penalty_total = 0
//var penalty_multihead = 0
//var penalty_noFace = 0
//var penalty_noFace3sec = 0

// warnings and bans:
var personMultipleHead = false;
var personNoHead = false;
var personHead;
var personDocument;
var personVerificaton;
var personBan;
var personWarnings;

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
    //.then(startVideo)

function start() {
     document.body.append("\nmodels are loaded\n")
//     imageUpload.addEventListener('change', async () => {
//                   const image = await faceapi.bufferToImage(imageUpload.files[0])
//                   const detections = await faceapi.detectAllFaces(image)
//                       .withFaceLandmarks().withFaceDescriptors()
//                   document.body.append(detections.length)
//           })
}



cameraButton.addEventListener('click', async function() {
    document.body.append("Теперь поднесите пропуск к видеокамере и нажмите 'get document'\n" +
        "когда лицо на пропуске будет распознано.\n")
    navigator.mediaDevices.getUserMedia(
        {video: true }).then(stream => {
        video.srcObject = stream;
    }).catch(console.error)

});

console.log(faceapi.nets)
const container = document.createElement('div')
container.style.position = 'relative'
document.body.append(container)


clickPhoto.addEventListener('click', async function faceOnPhoto() {

    const canvas = faceapi.createCanvasFromMedia(video)
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    let image_data_url = canvas.toDataURL('image/jpeg');
    const image = await faceapi.fetchImage(image_data_url)
    container.append(canvas)
    container.append(image)
    const displaySize = {width: image.width, height: image.height}
    faceapi.matchDimensions(canvas, displaySize)
    const detectionsPerson = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors()
    const resizedDetections = faceapi.resizeResults( detectionsPerson, displaySize)
    console.log('detections', detectionsPerson);
    const labeledFaceDescriptors = await LLI;
    console.log('labeledFaceDescriptors', labeledFaceDescriptors)
    const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6)
    const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))
    console.log('results', results)
    results.forEach((results, i) => {
        const box = resizedDetections[i].detection.box
        const drawBox = new faceapi.draw.DrawBox(box, {label: results.toString()})
        drawBox.draw(canvas)
    })
    console.log('!!!', results[0]['_label'])

    if (results[0]['_label'] == label) {
        console.log('verification has ended successful')
        document.body.append('Verification has ended successful.\n')
        var a = document.createElement('a');
        var linkText = document.createTextNode("\nstart proctoring");
        //var expLLI = LLI;
        //var expLabel = label;
        console.log(LLI,label)
        a.appendChild(linkText);
        a.title = "next page";
        a.href = "proctoring.html";
        document.body.appendChild(a);
        //export {LLI, label}
    }

});
let label;
let LLI;


clickDoc.addEventListener('click',  async function loadLabeledImage(){

    document.body.append("\nНажмите кнопку 'Get Face', чтобы верифицировать себя.\n" )
    label = name;
    const descriptions = [];
    const canvas = faceapi.createCanvasFromMedia(video);
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    let image_data_url = canvas.toDataURL('image/jpeg');
    const image = await faceapi.fetchImage(image_data_url);
    const detectionsDoc = await faceapi.detectSingleFace(image).withFaceLandmarks().withFaceDescriptor();
    console.log('docDetection', detectionsDoc);
    descriptions.push(detectionsDoc.descriptor);
    LLI = new faceapi.LabeledFaceDescriptors(label, descriptions);
    return LLI

});

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
                console.log( 'Warning! Detected more than one face')
            } else if (dLength == 0) {
                console.log ( 'Warning! No face detected')
            } else { console.log ('Face detected...') };

        const resizedDetections = faceapi.resizeResults(detections, displaySize)
        canvas.getContext('2d').clearRect(0,0, canvas.width, canvas.height)
        faceapi.draw.drawDetections(canvas, resizedDetections)
    }, 1000)
})

