module.exports = store

const jsqr = require('jsqr')

function store (state, emitter) {
  emitter.on(state.events.DOMTITLECHANGE, function () {
    if (state.title === "SCAN") {
      setTimeout(() => {
        beginScan(addr => {
          endScan()
          state.afterScan(addr)
        })
      }, 100)
    }
  })
}

function beginScan (cb) {
  console.log('BEGINNING TO SCAN')
  const video = document.getElementById("video")
  const canvasElement = document.getElementById("canvas")
  const canvas = canvasElement.getContext("2d")

  let done = false
  let streamObj

  // Use facingMode: environment to attemt to get the front camera on phones
  navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }).then(function(stream) {
    streamObj = stream
    video.srcObject = stream
    video.setAttribute("playsinline", true) // required to tell iOS safari we don't want fullscreen
    video.play()
    requestAnimationFrame(tick)
  })

  function tick() {
    if (done) return
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvasElement.hidden = true
      canvasElement.height = video.videoHeight
      canvasElement.width = video.videoWidth
      canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height)
      const imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height)
      const code = jsqr(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      })
      if (code && parseResult(code.data).indexOf('0x') === 0) {
        for (let track of streamObj.getTracks()) {
          track.stop()
        }
        cb(parseResult(code.data))
        done = true
      }
    }
    requestAnimationFrame(tick)
  }
}

function endScan () {
  console.log('ENDING SCAN')
  const video = document.getElementById("video")
  console.log(video)
}

function parseResult (c) {
  if (c.indexOf('ethereum:') === 0) {
    return c.substring('ethereum:'.length, c.length)
  }
  return c
}