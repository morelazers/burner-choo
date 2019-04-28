const html = require('choo/html')

module.exports = html`
<section class="flex w-100 pa2 align-center justify-center items-center">
  <div id="qr-preview flex w-100 h-100 align-center justify-center">
    <canvas id="canvas" hidden></canvas>
    <video id="video"></video>
  </div>
</section>
`