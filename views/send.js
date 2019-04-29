/**
 * This file could probably be broken up
 *
 * It would make sense to be able to launch the QR scanner from anywhere in the
 * wallet, and then set the state.afterScan variable from that point.
 *
 * It currently doesn't make sense to only start the scanner if the title of
 * your page is SCAN
 */

const html = require('choo/html')
const css = require('sheetify')

const TITLE = 'SEND'

module.exports = (state, emit) => {
  // Set up the chain of events which should occur after scanning a QR code with
  // your browser from this page
  state.afterScan = (addr) => {
    state.afterCalculate = (amount) => {
      state.calculate.input = ''
      state.wallet.afterConfirm = () => {
        console.log('After confirm')
        emit('wallet.sendTokens', addr, amount)
        emit('pushState', '/')
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

  console.log('-- PRINTING THE SCANNER VIEW --')
  return html`
    <section class="flex w-100 pa2 align-center justify-center items-center">
      <div id="qr-preview flex w-100 h-100 align-center justify-center">
        <canvas id="canvas" hidden></canvas>
        <video id="video"></video>
      </div>
    </section>
  `
}