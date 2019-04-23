const html = require('choo/html')
const jsqr = require('jsqr')

module.exports = {
  render: () => {
    return html`
      <div id="qr-preview">
        <div id="loadingMessage">🎥 Unable to access video stream (please make sure you have a webcam enabled)</div>
        <canvas id="canvas" hidden></canvas>
        <video id="video"></video>
      </div>
    `
  },

  beginScan: (cb) => {
    var video = document.getElementById("video")
    var canvasElement = document.getElementById("canvas")
    var canvas = canvasElement.getContext("2d")

    // Use facingMode: environment to attemt to get the front camera on phones
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }).then(function(stream) {
      video.srcObject = stream
      video.setAttribute("playsinline", true) // required to tell iOS safari we don't want fullscreen
      video.play()
      requestAnimationFrame(tick)
    })

    function tick() {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvasElement.hidden = false
        canvasElement.height = video.videoHeight
        canvasElement.width = video.videoWidth
        canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height)
        var imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height)
        var code = jsqr(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        })
        if (code) {
          cb(code.data)
        }
      }
      requestAnimationFrame(tick)
    }
  },

  endScan: () => {
    var preview = document.getElementById("qr-preview")
    preview.style.display = 'none'
  }

}
