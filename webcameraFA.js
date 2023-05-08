const imageUpload = document.getElementById('imageUpload')
//const video = document.getElementById('video')

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
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
]).then(start)
    //.then(startVideo)

function start() {
     document.body.append('models are loaded')
//     imageUpload.addEventListener('change', async () => {
//                   const image = await faceapi.bufferToImage(imageUpload.files[0])
//                   const detections = await faceapi.detectAllFaces(image)
//                       .withFaceLandmarks().withFaceDescriptors()
//                   document.body.append(detections.length)
//           })
}



cameraButton.addEventListener('click', async function() {
    navigator.mediaDevices.getUserMedia(
        {video: true }).then(stream => {
        video.srcObject = stream;

        //const track = stream.getVideoTracks()[0];
        //imageCapture = new ImageCapture(track);
        //console.log( 'track', track);
    }).catch(console.error)
});

//function startVideo() {
//     navigator.mediaDevices.getUserMedia(
//         {video: true }).then(stream => {
//             video.srcObject = stream;
//
//         //const track = stream.getVideoTracks()[0];
//         //imageCapture = new ImageCapture(track);
//         //console.log( 'track', track);
//         }).catch(console.error)
// }

console.log(faceapi.nets)
const container = document.createElement('div')
container.style.position = 'relative'
document.body.append(container)

//loadLabeledImage запускается 2 раза - как через кнопку, так и в функции faceOnPhoto

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
        document.body.append('verification has ended successful')
        var a = document.createElement('a');
        var linkText = document.createTextNode("my title text");
        a.appendChild(linkText);
        a.title = "my title text";
        a.href = "http://example.com";
        document.body.appendChild(a);
    }
});

var LLI;
var label;

clickDoc.addEventListener('click',  async function loadLabeledImage(){

    //стоит как-то подтверрждать по документу имя человека.
    label = 'Ilia Vasilev';
    //
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
    document.body.append(canvas)
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