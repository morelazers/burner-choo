module.exports = store

const jsqr = require('jsqr')

let streamObj
let animation
let done = false

function store (state, emitter) {
  emitter.on(state.events.DOMTITLECHANGE, function () {
    if (state.title === "SEND") {
      setTimeout(() => {
        beginScan(addr => {
          endScan()
          state.afterScan(addr)
        })
      }, 100)
    } else {
      endScan()
    }
  })
}

// starts the webcam stream to scan a thing
function beginScan (cb) {
  const video = document.getElementById("video")
  const canvasElement = document.getElementById("canvas")
  const canvas = canvasElement.getContext("2d")

  done = false

  // Use facingMode: environment to attemt to get the front camera on phones
  navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }).then(function(stream) {
    streamObj = stream
    video.srcObject = stream
    video.setAttribute("playsinline", true) // required to tell iOS safari we don't want fullscreen
    video.play()
    animation = requestAnimationFrame(tick)
  })

  function tick() {
    if (done) {
      cancelAnimationFrame(animation)
      return
    }
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
  try {
    cancelAnimationFrame(animation)
    done = true
    for (let track of streamObj.getTracks()) {
      track.stop()
    }
  } catch (e) {
    // stream prob already stopped
  }
}

function parseResult (c) {
  if (c.indexOf('ethereum:') === 0) {
    return c.substring('ethereum:'.length, c.length)
  }
  return c
}