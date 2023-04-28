const imageUpload = document.getElementById('imageUpload')
const video = document.getElementById('video')

// warnings and bans:
var personMultipleHead = false;
var personNoHead = false;
var personHead;
var personDocument;
var personVerificaton;
var personBan;
var personWarnings;


Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
]).then(start).then(startVideo)

function start() {
    document.body.append('models are loaded')
    imageUpload.addEventListener('change', async () => {
                  const image = await faceapi.bufferToImage(imageUpload.files[0])
                  const detections = await faceapi.detectAllFaces(image)
                      .withFaceLandmarks().withFaceDescriptors()
                  document.body.append(detections.length)
          })
}


function startVideo() {
    navigator.mediaDevices.getUserMedia(
        {video: true }).then(stream => {
            video.srcObject = stream;

        //const track = stream.getVideoTracks()[0];
        //imageCapture = new ImageCapture(track);
        //console.log( 'track', track);
        }).catch(console.error)
}

function onTakePhotoButtonClick() {
    imageCapture
        .takePhoto()
        .then((blob) => createImageBitmap(blob))
        .then((imageBitmap) => {
            const canvas = document.querySelector("#takePhotoCanvas");
            drawCanvas(canvas, imageBitmap);
        })
        .catch((error) => console.error(error));
}

function onGrabFrameButtonClick() {
    imageCapture
        .grabFrame()
        .then((imageBitmap) => {
            const canvas = document.querySelector("#grabFrameCanvas");
            drawCanvas(canvas, imageBitmap);
        })
        .catch((error) => console.error(error));
}

function drawCanvas(canvas, img) {
    canvas.width = getComputedStyle(canvas).width.split("px")[0];
    canvas.height = getComputedStyle(canvas).height.split("px")[0];
    let ratio = Math.min(canvas.width / img.width, canvas.height / img.height);
    let x = (canvas.width - img.width * ratio) / 2;
    let y = (canvas.height - img.height * ratio) / 2;
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    canvas
        .getContext("2d")
        .drawImage(
            img,
            0,
            0,
            img.width,
            img.height,
            x,
            y,
            img.width * ratio,
            img.height * ratio
        );
}

//document.querySelector("video").addEventListener("play", () => {
//      document.querySelector("#grabFrameButton").disabled = false;
//      document.querySelector("#takePhotoButton").disabled = false;
//  });


console.log(faceapi.nets)

//const b1 = document.getElementById('button1')
//
// b1.addEventListener( "click", function() {
//     console.log('clicked') }
// )

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