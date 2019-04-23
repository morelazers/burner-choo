module.exports = store

const jsqr = require('jsqr')

function store (state, emitter) {
  emitter.on(state.events.DOMTITLECHANGE, function () {
  console.log(state.title === "SCAN")
  // emitter.on(state.events.DOMTITLECHANGE, function () {
    if (state.title === "SCAN") {
      setTimeout(() => {
        beginScan(addr => {
          state.afterScan(addr)
        })
      }, 500)
    }
  })
}

function beginScan (cb) {
  console.log('BEGINNING TO SCAN')
  const video = document.getElementById("video")
  const canvasElement = document.getElementById("canvas")
  const canvas = canvasElement.getContext("2d")

  let done = false

  // Use facingMode: environment to attemt to get the front camera on phones
  navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }).then(function(stream) {
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
        cb(parseResult(code.data))
        done = true
        video.pause()
      }
    }
    requestAnimationFrame(tick)
  }
}

function parseResult (c) {
  if (c.indexOf('ethereum:') === 0) {
    return c.substring('ethereum:'.length, c.length)
  }
  return c
}