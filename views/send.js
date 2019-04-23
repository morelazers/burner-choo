const html = require('choo/html')
const css = require('sheetify')

const TITLE = 'SCAN'

module.exports = (state, emit) => {
  state.afterScan = (addr) => {
    state.afterCalculate = (amount) => {
      state.afterConfirm = () => {
        state.sendTokenTransaction(addr, amount)
      }
      emit('pushState', '/confirm')
    }
    emit('pushState', '/calculate')
  }
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)

  const style = css`
    #video {
      object-fit: none;
    }
  `

  return html`
    <body class="flex w-100 pa2 align-center justify-center items-center">
      <div id="qr-preview flex w-100 h-100 align-center justify-center">
        <canvas id="canvas" hidden></canvas>
        <video id="video"></video>
      </div>
    </body>
  `
}